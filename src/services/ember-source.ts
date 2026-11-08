import {normalizeStructTag} from '@mysten/sui/utils';
import {EMBER_ESUI, reviewedEmberDeployment, type EmberDeployment} from '../ember-deployment.js';
import {getEmberDepositQuote} from '../adapters/ember.js';
import {getSuiGrpcClient} from '../rpc.js';
import type {JitterMarketConfig} from '../types.js';

export function parseEmberApy(history:unknown,vault:unknown,nowMs:number,deployment:EmberDeployment=EMBER_ESUI){
 const source=reviewedEmberDeployment(deployment.vaultObjectId);
 const records=Array.isArray(vault)?vault:[vault];
 if(records.length!==1)throw Error('Ember response is ambiguous.');
 const v=records[0] as {id?:string;receiptCoin?:{address?:string};weeklyPerformanceFeeBpsE9?:string;managementFeePercentE9?:string};
 if(!v||v.id!==source.vaultObjectId||normalizeStructTag(v.receiptCoin?.address??'')!==normalizeStructTag(source.receiptType))throw Error('Ember API belongs to another vault.');
 // API calls this field BpsE9; its 0.1 value is 10% in the verified official UI.
 // Fail closed on a change instead of silently inferring a new fee unit.
 if(v.weeklyPerformanceFeeBpsE9!==source.performanceFeeE9||v.managementFeePercentE9!=='0')throw Error('Ember fee configuration changed; review the fee basis.');
 if(!Array.isArray(history)||!Number.isSafeInteger(nowMs))throw Error('Ember APY history unavailable.');
 const seen=new Set<number>();let sum=0n,count=0,latest=0;
 for(const row of history){
  if(!row||!Number.isSafeInteger(row.timestamp)||row.timestamp<0||row.timestamp>nowMs||typeof row.apyE9!=='string'||!/^\d{1,30}$/.test(row.apyE9))throw Error('Invalid Ember APY sample.');
  if(seen.has(row.timestamp))throw Error('Duplicate Ember APY sample.');seen.add(row.timestamp);
  if(row.timestamp>=nowMs-30*86400000){sum+=BigInt(row.apyE9);count++;latest=Math.max(latest,row.timestamp);}
 }
 if(!count||nowMs-latest>source.maxStalenessMs)throw Error('Ember APY samples are stale.');
 const scale=10n**18n;
 const net=sum*(1_000_000_000n-BigInt(source.performanceFeeE9))*scale/(BigInt(count)*1_000_000_000n*1_000_000_000n);
 if(net>scale)throw Error('Ember APY exceeds supported range.');
 return {apy:`${net/scale}.${(net%scale).toString().padStart(18,'0')}`,sampleCount:count,latestSampleMs:latest,
   grossApy:Number(sum)/count/1e9,performanceFeeBps:Number(source.performanceFeeE9)/100000};
}

export async function readEmberSource(deployment:EmberDeployment,fundingRaw=0n){
 const source=reviewedEmberDeployment(deployment.vaultObjectId);
 const started=Date.now(),c=getSuiGrpcClient('mainnet');
 const request=async(path:string)=>{
  const response=await fetch(`${source.apiBaseUrl}${path}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(`Ember API ${response.status}.`);
  const age=response.headers.get('age');if(age&&(!/^\d+$/.test(age)||Number(age)>300))throw Error('Ember API response is stale.');
  return response.json() as Promise<unknown>;
 };
 const [vault,protocol,clock,history,api]=await Promise.all([
  c.getObject({objectId:source.vaultObjectId,include:{json:true}}),c.getObject({objectId:source.protocolConfigObjectId,include:{json:true}}),
  c.getObject({objectId:'0x6',include:{json:true}}),request(`/api/v1/vaults/apy-history/${source.vaultObjectId}?limit=31&interval=1d`),
  request(`/api/v1/vaults?vaultId=${source.vaultObjectId}`),
 ]);
 const f=vault.object.json as {paused?:unknown;rate?:{value?:string;last_updated_at?:string}};
 if(vault.object.owner.$kind!=='Shared'||normalizeStructTag(vault.object.type)!==normalizeStructTag(`${source.typePackageId}::vault::Vault<${source.underlyingType},${source.receiptType}>`)||f.paused!==false)throw Error('Ember vault is paused or has an unexpected binding.');
 if(protocol.object.owner.$kind!=='Shared'||normalizeStructTag(protocol.object.type)!==normalizeStructTag(`${source.typePackageId}::admin::ProtocolConfig`)||(protocol.object.json as {pause_non_admin_operations?:unknown}).pause_non_admin_operations!==false)throw Error('Ember protocol is paused or unreadable.');
 const chainTime=Number((clock.object.json as {timestamp_ms:string}).timestamp_ms);
 const apy=parseEmberApy(history,api,chainTime,source);
 const config={underlyingTypeTag:source.underlyingType,emberReceiptTypeTag:source.receiptType,
  emberAdapterPackageId:source.adapterPackageId,emberVaultObjectId:source.vaultObjectId,emberVaultsPackageId:source.callPackageId,
  emberProtocolConfigObjectId:source.protocolConfigObjectId} as JitterMarketConfig;
 const quote=await getEmberDepositQuote('mainnet',config,fundingRaw);
 if(!/^\d{1,20}$/.test(f.rate?.value??'')||BigInt(f.rate!.value!)===0n)throw Error('Invalid Ember rate.');
 if(quote.syIndex!==(1n<<64n)*1_000_000_000n/BigInt(f.rate!.value!))throw Error('Ember rate changed during refresh; retry.');
 return {...apy,...quote,chainTime,observedAt:started,apiUpdatedAt:started,rateRaw:f.rate!.value!,sheetVersion:vault.object.version};
}

export function readEmberEsuiSource(fundingRaw=0n){return readEmberSource(EMBER_ESUI,fundingRaw);}
