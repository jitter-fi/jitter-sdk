import {expect,test,spyOn} from 'bun:test';
import {bcs} from '@mysten/sui/bcs';
import {Transaction} from '@mysten/sui/transactions';
import {makeTestMarketConfig} from './fakes.js';
import {getJitterAdapterManifest} from '../adapters/registry.js';
import {addEmberMintReceiptToSy,getEmberDepositQuote} from '../adapters/ember.js';
import {createJitterTransactionService} from '../services/transaction-service.js';
import {createJitterQuoteService} from '../services/quote-service.js';
import {createJitterTradeService} from '../services/trade-service.js';
import {getSuiGrpcClient} from '../rpc.js';
import {EMBER_ESUI, EMBER_EEARN} from '../ember-deployment.js';
const id=(n:number)=>`0x${n.toString(16).padStart(64,'0')}`;
const config=()=>makeTestMarketConfig({adapterKind:'ember',demoMarketVaultObjectId:'',
 emberAdapterPackageId:id(10),emberMarketVaultObjectId:id(11),emberVaultObjectId:id(12),
 emberVaultsPackageId:id(13),emberProtocolConfigObjectId:id(14),emberReceiptTypeTag:`${id(15)}::esui::ESUI`,
 jitterMathPackageId:id(16),globalConfigObjectId:id(17),marketObjectId:id(18),syStateObjectId:id(19),rewardDistributorObjectId:id(21),underlyingTypeTag:'0x2::sui::SUI'});
test('Ember exposes native deposits but never underlying redemption',()=>{
 const c=config(),m=getJitterAdapterManifest(c);
 expect(m.kind).toBe('ember');expect(m.canDepositUnderlying).toBe(true);expect(m.canRedeemUnderlying).toBe(false);
 expect(m.redeemOutputType(c)).toBe(c.emberReceiptTypeTag!);
 const tx=new Transaction();tx.setSender(id(99));m.addMintFromUnderlying!({tx,config:c,inputCoin:tx.object(id(20)),minSyOut:1n});
 const calls=tx.getData().commands.flatMap(c=>c.MoveCall?[c.MoveCall]:[]);
 expect(calls.some(c=>c.function==='deposit_asset_v2')).toBe(true);
 expect(calls.some(c=>c.function==='redeem_shares')).toBe(false);
 expect(calls.find(c=>c.function==='deposit_asset_v2')?.package).toBe(c.emberVaultsPackageId!);
});

const common={senderAddress:id(99),positionId:id(100),syIndex:2n<<64n,
 rewardSettlement:{strategy:'empty-vector' as const},minPtOut:1n,minYtOut:1n,minSyOut:1n,minLpOut:1n,
 syToMintHint:50n,underlyingAmount:100n,marketCoinAmount:100n,marketCoinId:id(101),inputCoinId:id(102),inputAmount:100n};
for(const [method,native] of [
 ['buildBuyPtFromUnderlyingTx',true],['buildBuyYtFromUnderlyingTx',true],
 ['buildAddLpKeepYtFromUnderlyingTx',true],['buildAddLpFromSyFromUnderlyingTx',true],
 ['buildBuyPtFromMarketCoinTx',false],['buildBuyYtFromMarketCoinTx',false],
 ['buildAddLpKeepYtFromMarketCoinTx',false],['buildAddLpFromSyFromMarketCoinTx',false],
] as const){
 test(`Ember ${method} composes receipt settlement without upstream withdrawals`,async()=>{
  const tx=await createJitterTransactionService({config:config()})[method]({
   ...common, minYtOut: method.includes('KeepYt') ? 0n : common.minYtOut,
  });
  const calls=tx.getData().commands.flatMap(c=>c.MoveCall?[c.MoveCall]:[]);
  expect(calls.some(c=>c.function==='deposit_asset_v2')).toBe(native);
  expect(calls.some(c=>c.module==='ember_price_ticket')).toBe(true);
  expect(calls.some(c=>c.function==='redeem_shares'||/haedal|scallop/.test(c.module))).toBe(false);
 });
}

test('Ember receipt entry quote never redeposits shares as SUI',async()=>{
 const c=config();let observed=0n;
 const service=createJitterTradeService({marketId:'e',config:c,quoteService:createJitterQuoteService({config:c,delegates:{
  quoteSwapSyForPt:async syIn=>{observed=syIn;return {ptOut:syIn,slippageBps:0n};},
 }})});
 const index=19440724953383954277n,q=1n<<64n;
 const r=await service.quoteTrade({marketId:'e',product:'pt',side:'buy',inputAsset:'marketCoin',amount:'1000',owner:id(99),slippageBps:50,syIndex:String(index)});
 expect(r.status).toBe('available');expect(observed).toBe((1000n*index/q)*q/index);
});

test('Ember sells quote eSUI while capacity exists and never silently change a reviewed exit',async()=>{
 let exhausted=false;
 const read=spyOn(getSuiGrpcClient('mainnet'),'getObject').mockImplementation(async()=>({object:{json:{
  receipt_balance:exhausted?'0':'1000000',queued_receipt:'0',withdraw_window_ms:'86400000',withdraw_window_start_ms:'0',
  withdraw_bps_per_window:'1000',withdraw_window_base_reserve:'1000000',withdraw_window_withdrawn:'0',withdraw_window_minted:'0',
 }}}) as never);
 try{
  const c=config(),service=createJitterTradeService({marketId:'e',config:c,network:'mainnet',quoteService:createJitterQuoteService({config:c,
   delegates:{quoteSwapPtForSy:async()=>({syOut:80n,slippageBps:0n})}})});
  const request={marketId:'e',product:'pt' as const,side:'sell' as const,inputAsset:'pt' as const,amount:'80',owner:id(99),slippageBps:50,syIndex:String(2n<<64n)};
  const quote=await service.quoteTrade(request);
  expect(quote.expectedOutput).toEqual([{asset:'marketCoin',amount:'80'}]);
  exhausted=true;
  await expect(service.buildTradeTransaction({...request,reviewedQuote:quote,positionId:id(100)})).rejects.toThrow('capacity changed');
  expect((await service.quoteTrade(request)).status).toBe('unavailable');
 }finally{read.mockRestore();}
});

for(const kind of ['Pt','Yt'] as const)test(`Ember ${kind} sells return receipts only`,async()=>{
 const service=createJitterTransactionService({config:config()});
 const args={...common,ptAmount:100n,ytAmount:100n};
 await expect(service[`buildSell${kind}ToUnderlyingTx`](args)).rejects.toThrow('underlying');
 const tx=await service[`buildSell${kind}ToReceiptTx`](args);
 expect(tx.getData().commands.some(c=>c.MoveCall?.function==='redeem_receipt')).toBe(true);
});

test('Ember rate quote enforces true simulation success and the 17.5-day real timestamp boundary',async()=>{
 const reviewed = (e: typeof EMBER_ESUI | typeof EMBER_EEARN) => ({...config(), underlyingTypeTag:e.underlyingType, emberReceiptTypeTag:e.receiptType, emberVaultObjectId:e.vaultObjectId, emberAdapterPackageId:e.adapterPackageId, emberVaultsPackageId:e.callPackageId, emberProtocolConfigObjectId:e.protocolConfigObjectId});
 const now=1800000000000n;
 const result=(updated:bigint)=>({$kind:'Transaction',Transaction:{status:{success:true}},commandResults:[
  {returnValues:[{bcs:bcs.u64().serialize(100n).toBytes()}]},
  {returnValues:[{bcs:bcs.u128().serialize(2n<<64n).toBytes()}]},
  ...[updated,now].map(x=>({returnValues:[{bcs:bcs.u64().serialize(x).toBytes()}]})),
 ]});
 const mock=spyOn(getSuiGrpcClient('mainnet'),'simulateTransaction').mockResolvedValue(result(now-1512000000n) as never);
 try{
  expect((await getEmberDepositQuote('mainnet',reviewed(EMBER_ESUI),100n)).receiptOut).toBe(100n);
  expect((await getEmberDepositQuote('mainnet',reviewed(EMBER_EEARN),100n)).receiptOut).toBe(100n);
  await expect(getEmberDepositQuote('mainnet',{...reviewed(EMBER_EEARN), emberReceiptTypeTag:EMBER_ESUI.receiptType},100n)).rejects.toThrow('binding');
  mock.mockResolvedValue(result(now-1512000001n) as never);
  await expect(getEmberDepositQuote('mainnet',reviewed(EMBER_ESUI),100n)).rejects.toThrow('stale');
  await expect(getEmberDepositQuote('mainnet',reviewed(EMBER_EEARN),100n)).rejects.toThrow('stale');
  mock.mockResolvedValue({...result(now),Transaction:{status:{success:false}}} as never);
  await expect(getEmberDepositQuote('mainnet',reviewed(EMBER_ESUI),100n)).rejects.toThrow('simulation');
 }finally{mock.mockRestore();}
});
test('receipt mint uses actual returned shares, a fresh index, min-out, and explicit change',()=>{
 const c=config(),tx=new Transaction();const r=addEmberMintReceiptToSy(tx,c,tx.object(id(20)),1n);
 expect(r.receiptChange).toBeDefined();
 const calls=tx.getData().commands.flatMap(c=>c.MoveCall?[c.MoveCall]:[]);
 expect(calls.some(c=>c.function==='current_sy_index')).toBe(true);
 expect(calls.find(c=>c.function==='mint_sy_exact_in_market_state')?.arguments[3]?.$kind).toBe('Result');
 expect(calls.some(c=>c.function==='assert_coin_min_value')).toBe(true);
 expect(()=>getJitterAdapterManifest({...c,emberVaultsPackageId:undefined}).requiredObjectIds({...c,emberVaultsPackageId:undefined})).toThrow();
});
