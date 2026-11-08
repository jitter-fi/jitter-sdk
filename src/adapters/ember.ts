import {bcs} from '@mysten/sui/bcs';
import {Transaction,type TransactionObjectArgument} from '@mysten/sui/transactions';
import {getSuiGrpcClient,type GrpcNetworkKind} from '../rpc.js';
import type {JitterMarketConfig} from '../types.js';
import type {JitterAdapterManifest} from './types.js';
import {addDepositDustToTreasury} from './deposit-dust.js';
import {addEmberPriceInfo} from '../oracle.js';
import {addEmberMintReceiptFromUnderlying,addEmberDeposit} from '../sy.js';
import {reviewedEmberDeployment} from '../ember-deployment.js';
import {reviewedAdapterCallPackageId} from '../lp-deployment.js';
import {normalizeStructTag} from '@mysten/sui/utils';
const required=(v:string|undefined,key:string)=>{if(!v)throw Error(`Missing Jitter market config field: ${key}.`);return v;};
const types=(c:JitterMarketConfig)=>[c.underlyingTypeTag,required(c.emberReceiptTypeTag,'emberReceiptTypeTag')];

/** Mint against the runtime receipt balance, not an estimated deposit result. */
export function addEmberMintReceiptToSy(tx:Transaction,c:JitterMarketConfig,receipt:TransactionObjectArgument,minSyOut:bigint){
 const adapter=required(c.emberAdapterPackageId,'emberAdapterPackageId'),vault=required(c.emberVaultObjectId,'emberVaultObjectId');
 const math=required(c.jitterMathPackageId,'jitterMathPackageId'),global=required(c.globalConfigObjectId,'globalConfigObjectId');
 if(typeof minSyOut!=='bigint'||minSyOut<0n||minSyOut>(1n<<64n)-1n)throw Error('minSyOut must fit u64.');
 const shares=tx.moveCall({target:'0x2::coin::value',typeArguments:[types(c)[1]!],arguments:[receipt]});
 const index=tx.moveCall({target:`${adapter}::ember_price_ticket::current_sy_index`,typeArguments:types(c),arguments:[tx.object(vault)]});
 const amount=tx.moveCall({target:`${math}::fixed_point64::from_uint64`,arguments:[shares]});
 const fixedIndex=tx.moveCall({target:`${math}::fixed_point64::create_from_raw_value`,arguments:[index]});
 const value=tx.moveCall({target:`${math}::fixed_point64::multiply`,arguments:[amount,fixedIndex]});
 const exactIn=tx.moveCall({target:`${math}::fixed_point64::truncate`,arguments:[value]});
 const minted=tx.moveCall({target:`${c.jitterPackageId}::sy::mint_sy_exact_in_market_state`,typeArguments:[c.syTypeTag,c.ptTypeTag,c.ytTypeTag],
  arguments:[tx.object(c.marketObjectId),tx.object(global),addEmberPriceInfo(tx,c),exactIn,tx.object.clock()]});
 // The deposit budget is the entire actual receipt coin. No second guessed share amount.
 const change=tx.moveCall({target:`${adapter}::ember_market_vault::deposit`,typeArguments:[...types(c),c.syTypeTag,c.ptTypeTag,c.ytTypeTag],
  arguments:[minted[1],receipt,tx.object(c.syStateObjectId),tx.object(global),tx.object(required(c.emberMarketVaultObjectId,'emberMarketVaultObjectId')),
   tx.object(c.marketObjectId),tx.object(vault),tx.object.clock()]});
 tx.moveCall({target:`${c.jitterPackageId}::router::assert_coin_min_value`,typeArguments:[c.syTypeTag],arguments:[tx.object(global),minted[0],tx.pure.u64(minSyOut)]});
 return {syCoin:minted[0],receiptChange:change};
}

export async function getEmberDepositQuote(network:GrpcNetworkKind,c:JitterMarketConfig,underlyingIn:bigint){
 if(typeof underlyingIn!=='bigint'||underlyingIn<0n||underlyingIn>(1n<<64n)-1n)throw Error('Ember deposit amount must fit u64.');
 const tx=new Transaction(),vault=required(c.emberVaultObjectId,'emberVaultObjectId');
 const deployment=reviewedEmberDeployment(vault);
 if(normalizeStructTag(c.underlyingTypeTag)!==normalizeStructTag(deployment.underlyingType)||normalizeStructTag(required(c.emberReceiptTypeTag,'emberReceiptTypeTag'))!==normalizeStructTag(deployment.receiptType)||c.emberVaultsPackageId!==deployment.callPackageId||reviewedAdapterCallPackageId('ember',required(c.emberAdapterPackageId,'emberAdapterPackageId'))!==reviewedAdapterCallPackageId('ember',deployment.adapterPackageId)||c.emberProtocolConfigObjectId!==deployment.protocolConfigObjectId)throw Error('Unreviewed Ember quote binding.');
 tx.moveCall({target:`${required(c.emberVaultsPackageId,'emberVaultsPackageId')}::vault::calculate_shares_from_amount`,typeArguments:types(c),arguments:[tx.object(vault),tx.pure.u64(underlyingIn)]});
 tx.moveCall({target:`${required(c.emberAdapterPackageId,'emberAdapterPackageId')}::ember_price_ticket::current_sy_index`,typeArguments:types(c),arguments:[tx.object(vault)]});
 tx.moveCall({target:`${c.emberVaultsPackageId}::vault::get_vault_last_updated_at`,typeArguments:types(c),arguments:[tx.object(vault)]});
 tx.moveCall({target:'0x2::clock::timestamp_ms',arguments:[tx.object.clock()]});
 tx.moveCall({target:`${c.emberVaultsPackageId}::admin::verify_supported_package`,arguments:[tx.object(required(c.emberProtocolConfigObjectId,'emberProtocolConfigObjectId'))]});
 const r=await getSuiGrpcClient(network).simulateTransaction({transaction:tx,checksEnabled:false,include:{commandResults:true}});
 if(r.$kind!=='Transaction'||r.Transaction?.status.success!==true)throw Error('Ember quote simulation failed.');
 const raw=(i:number,wide=false)=>{const b=r.commandResults?.[i]?.returnValues?.[0]?.bcs;if(!b)throw Error('Missing Ember quote result.');return BigInt((wide?bcs.u128():bcs.u64()).parse(b));};
 const receiptOut=raw(0),syIndex=raw(1,true),updatedAtMs=raw(2),now=raw(3);
 if(syIndex===0n||updatedAtMs>now||now-updatedAtMs>BigInt(deployment.maxStalenessMs))throw Error('Ember rate is stale or invalid.');
 return {receiptOut,syIndex,updatedAtMs};
}
export const emberAdapterManifest:JitterAdapterManifest={
 kind:'ember',canDepositUnderlying:true,canRedeemUnderlying:false,
 depositInputType:c=>c.underlyingTypeTag,redeemOutputType:c=>required(c.emberReceiptTypeTag,'emberReceiptTypeTag'),
 requiredObjectIds(c){return Object.fromEntries(['emberAdapterPackageId','emberMarketVaultObjectId','emberVaultObjectId','emberVaultsPackageId','emberProtocolConfigObjectId','jitterMathPackageId','globalConfigObjectId'].map(k=>[k,required(c[k as keyof JitterMarketConfig] as string|undefined,k)]));},
 addPriceInfo:({tx,config})=>addEmberPriceInfo(tx,config),
 addMintFromUnderlying({tx,config,inputCoin,minSyOut,sweepDepositDust}){
  const owner=required(tx.getData().sender??undefined,'sender');
  const receipt=addEmberMintReceiptFromUnderlying(tx,config,inputCoin,1n);
  const r=addEmberMintReceiptToSy(tx,config,receipt,minSyOut);
  if(sweepDepositDust)addDepositDustToTreasury(tx,config,r.receiptChange,required(config.emberReceiptTypeTag,'emberReceiptTypeTag'));
  else tx.transferObjects([r.receiptChange],tx.pure.address(owner));
  return r.syCoin;
 },
 addDepositToSy({tx,config,mintRequest,inputCoin,syAmount}){return {excessCoin:addEmberDeposit(tx,config,mintRequest,inputCoin,syAmount)};},
 addRedeemFromSy(){throw Error('Ember exits return vault receipts, not the underlying asset.');},
};
