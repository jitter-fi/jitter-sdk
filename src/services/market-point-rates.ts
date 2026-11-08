import {bcs} from '@mysten/sui/bcs';
import {deriveDynamicFieldID,normalizeStructTag} from '@mysten/sui/utils';
import {createJitterSdk} from '../facade/jitter-sdk.js';
import {registryFields,registryId,type RegistryReader,type RegistrySnapshot} from '../registry-v2.js';
import {validateRegistryPointSource,validateRegistryLpSource} from '../registry-v2-validation.js';
import {SuiJitterChainReader} from '../infrastructure/sui-chain-reader.js';
import type {JitterMarketConfig} from '../types.js';
import type {JitterMarketConfigEntry} from '../config.js';
import {getSuiGrpcClient,type GrpcNetworkKind} from '../rpc.js';


type Fields=Record<string,unknown>;
type Env=(key:string)=>string;
type Exposure={yt:bigint;lp:bigint};
export type MarketPointRate={marketId:string;ytDaily:number;lpDaily:number;daily:number};
export type RateInput={marketId:string;ytRaw:string;lpRaw:string;poolSyRaw:string;lpSupplyRaw:string;
 globalYtBps:string;globalLpBps:string;marketYtBps:string;marketLpBps:string;durationMs:string;
 active:boolean;ytAttached:boolean;lpAttached:boolean};
const uint=(value:unknown)=>{
 if(typeof value!=='string'||!/^\d+$/.test(value)||BigInt(value)>((1n<<64n)-1n))throw Error('Invalid point rate accounting.');
 return BigInt(value);
};
const boolean=(value:unknown)=>{if(typeof value!=='boolean')throw Error('Point emission status unavailable.');return value;};
const same=(a:string,b:string)=>registryId(a)===registryId(b);

export function calculateMarketPointRate(input:RateInput):MarketPointRate{
 const [yt,lp,sy,supply,gy,gl,my,ml,duration]=[input.ytRaw,input.lpRaw,input.poolSyRaw,input.lpSupplyRaw,
  input.globalYtBps,input.globalLpBps,input.marketYtBps,input.marketLpBps,input.durationMs].map(uint);
 if(!duration||lp>supply)throw Error('Invalid point rate supply or duration.');
 const denominator=100_000_000n*duration*1_000_000n;
 // Preserve fractional raw points and LP ownership until the final display conversion.
 const ytDaily=input.active&&input.ytAttached?Number(yt!*gy!*my!*86_400_000n)/Number(denominator):0;
 const lpDaily=input.active&&input.lpAttached&&lp!>0n?Number(sy!*lp!*gl!*ml!*86_400_000n)/Number(supply!*denominator):0;
 const daily=ytDaily+lpDaily;
 if(!Number.isFinite(daily))throw Error('Point rate exceeds display range.');
 return {marketId:input.marketId,ytDaily,lpDaily,daily};
}

export type MarketRateInput={address:string;entries:JitterMarketConfigEntry[];season:{scoreboardId:string}|null;
 network?:'mainnet'|'testnet';registry?:RegistrySnapshot;env?:Env};
type Dependencies={reader?:RegistryReader;field?:typeof readPointField;
 exposure?:(config:JitterMarketConfig,address:string)=>Promise<Exposure>};

export async function readUserMarketPointRates(input:MarketRateInput,deps:Dependencies={}):Promise<MarketPointRate[]>{
 if(!input.registry||!input.env||!input.season)throw Error('Season rate discovery is unavailable.');
 const {registry,env,season}=input;
 const reader=deps.reader??new SuiJitterChainReader(input.network??'mainnet'),field=deps.field??((parent,type,bytes)=>readPointField(parent,type,bytes,input.network??'mainnet'));
 const get=(key:string)=>registryId(env(`NEXT_PUBLIC_${key}`));
 const extensions=env('NEXT_PUBLIC_JITTER_EXTENSIONS_ORIGINAL_PACKAGE_ID')||get('JITTER_EXTENSIONS_PACKAGE_ID');
 const ll=env('NEXT_PUBLIC_LIQUIDLINK_INCENTIVE_SYSTEM_ORIGINAL_PACKAGE_ID')||get('LIQUIDLINK_INCENTIVE_SYSTEM_PACKAGE_ID');
 const llConfigType=env('NEXT_PUBLIC_LIQUIDLINK_CONFIG_ORIGINAL_PACKAGE_ID')||get('LIQUIDLINK_CONFIG_PACKAGE_ID');
 const llConfig=get('LIQUIDLINK_GLOBAL_CONFIG_OBJECT_ID');
 async function typed(id:string,type:string){
  id=registryId(id);
  if(!reader.getObjectInfo)throw Error('Typed point reads unavailable.');
  const object=await reader.getObjectInfo(id);
  if(!same(object.objectId,id)||normalizeStructTag(object.type)!==normalizeStructTag(type)||!('Shared' in registryFields(object.owner)))throw Error('Point rate object binding mismatch.');
  return registryFields(object.fields);
 }
 const clock=await typed('0x6','0x2::clock::Clock'),now=uint(clock.timestamp_ms);
 const sdk=createJitterSdk({network:input.network??'mainnet'});
 const exposure=deps.exposure??(async(config:JitterMarketConfig,address:string)=>{
  const p=await sdk.forMarket(config).accounts.getPortfolio(address);
  return {yt:p.pyPositions.reduce((sum,p)=>sum+uint(p.yt_balance),0n),lp:p.lpPositions.reduce((sum,p)=>sum+uint(p.lp_amount),0n)};
 });
 const entries=[...new Map(input.entries.filter(e=>e.network===(input.network??'mainnet')).map(e=>[registryId(e.config.marketObjectId),e])).values()];
 return Promise.all(entries.map(async({config})=>{
  const marketId=registryId(config.marketObjectId),result:MarketPointRate={marketId,ytDaily:0,lpDaily:0,daily:0};
  const market=registry.markets.find(m=>same(m.marketId,marketId));
  if(!market)throw Error('Market rate descriptor missing.');
  const links=registry.marketSources.filter(l=>same(l.marketId,marketId)&&!l.archived);
  const seen=new Set<string>();
  let rawMarket:Fields|undefined,held:Exposure|undefined;
  for(const link of links){
   const source=registry.sources.find(s=>same(s.sourceId,link.sourceId));
   if(!source)throw Error('Point source descriptor missing.');
   if(source.archived||!same(source.scoreboardId,season.scoreboardId))continue;
   if(seen.has(registryId(source.sourceId)))continue;
   seen.add(registryId(source.sourceId));
   const program=registry.programs.find(p=>same(p.scoreboardId,season.scoreboardId));
   if(!program?.listed||program.protocolId!==null||!same(program.liquidlinkConfigId,llConfig))throw Error('Season point binding mismatch.');
   const point=await typed(source.sourceId,`${extensions}::liquidlink_points::PointConfig`);
   if(!same(registryId(point.project_object_id),program.projectObjectId)||!same(registryId(point.scoreboard_id),season.scoreboardId))throw Error('Point source Season mismatch.');
   const closed=boolean(point.closed),enabled=boolean(point.enabled);
   if(closed||!enabled||now>=uint(market.expiryMs)||(!link.ytEnabled&&!link.lpEnabled))continue;
   const witness=`${extensions}::liquidlink_points::JitterPointSource`;
   if(normalizeStructTag(source.policyType)!==normalizeStructTag(witness))throw Error('Unsupported point source.');
   await validateRegistryPointSource(reader,{program,source,liquidlinkPackageId:ll,liquidlinkConfigPackageId:llConfigType,
    expectedConfigId:llConfig,expectedPolicies:[],expectedSourceType:`${extensions}::liquidlink_points::PointConfig`,expectedAuthWitness:witness});
   rawMarket??=await typed(marketId,`${config.jitterOriginalPackageId||config.jitterPackageId}::market::Market<${market.syType},${market.ptType},${market.ytType}>`);
   if(uint(rawMarket.expiry)!==uint(market.expiryMs))throw Error('Market expiry mismatch.');
   held??=await exposure(config,input.address);
   let ytAttached=false,lpAttached=false,marketYtBps='0',marketLpBps='0';
   if(link.ytEnabled){
    const bytes=bcs.Address.serialize(marketId).toBytes();
    const [attachment,weight]=await Promise.all([
     field(source.sourceId,`${extensions}::liquidlink_points::YtMarketAllowedKey`,bytes),
     field(source.sourceId,`${extensions}::liquidlink_points::YtPointWeightKey`,bytes),
    ]);
    if(!attachment||attachment.initialized!==true)throw Error('YT point attachment unavailable.');
    ytAttached=boolean(attachment.reward_attached);
    marketYtBps=weight?String(weight.multiplier_bps):'10000';
   }
   if(link.lpEnabled){
    const binding=await validateRegistryLpSource(reader,{association:link,source,market,extensionsPackageId:extensions});
    const lp=await typed(binding.lpPointStateId,`${extensions}::liquidlink_points::LpPointState<${market.syType}>`);
    lpAttached=boolean(lp.reward_attached);marketLpBps=String(lp.lp_multiplier_bps);
   }
   const rate=calculateMarketPointRate({marketId,ytRaw:held.yt.toString(),lpRaw:held.lp.toString(),
    poolSyRaw:String(rawMarket.pool_sy_balance),lpSupplyRaw:String(rawMarket.lp_supply),globalYtBps:String(point.yt_multiplier_bps),
    globalLpBps:String(point.lp_multiplier_bps),marketYtBps,marketLpBps,durationMs:String(point.duration),active:true,ytAttached,lpAttached});
   result.ytDaily+=rate.ytDaily;result.lpDaily+=rate.lpDaily;result.daily+=rate.daily;
  }
  return result;
 }));
}


async function readPointField(parentId:string,type:string,bytes:Uint8Array,network:GrpcNetworkKind='mainnet'):Promise<Fields|null>{
 const client=getSuiGrpcClient(network);
 const fieldId=deriveDynamicFieldID(parentId,type,bytes);
 try{
  const response=await client.ledgerService.getObject({objectId:fieldId,readMask:{paths:['object_id']}});
  if(response.response.object?.objectId!==fieldId)throw Error('Point record lookup returned a different object.');
 }catch(error){if(error&&typeof error==='object'&&'code' in error&&error.code==='NOT_FOUND')return null;throw error;}
 const {object}=await client.getObject({objectId:fieldId,include:{json:true}});
 const fields=registryFields(object.json);
 if(!('value' in fields))throw Error('Point record fields are unavailable.');
 return registryFields(fields.value);
}

