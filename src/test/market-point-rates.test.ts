import {expect,test} from 'bun:test';
import {calculateMarketPointRate,readUserMarketPointRates,type MarketRateInput} from '../services/market-point-rates.js';
import type {RegistryReader} from '../index.js';

const base={marketId:'sSUI',ytRaw:'49999999999',lpRaw:'47414195332',poolSyRaw:'38336018654',lpSupplyRaw:'47461563382',
 globalYtBps:'10000',globalLpBps:'10000',marketYtBps:'1',marketLpBps:'1',durationMs:'86400000',active:true,ytAttached:true,lpAttached:true};
test('raw exposure and both multipliers produce six-decimal Scoreboard points per day',()=>{
 const s=calculateMarketPointRate(base);
 expect(s.ytDaily).toBeCloseTo(4.9999999999,9);
 expect(s.lpDaily).toBeCloseTo(Number(38336018654n*47414195332n)/Number(47461563382n)/1e10,9);
 const ha=calculateMarketPointRate({...base,marketId:'haSUI',ytRaw:'49999986013',lpRaw:'48045958029',poolSyRaw:'46168294574',lpSupplyRaw:'48045958029',globalYtBps:'12000',globalLpBps:'12000'});
 expect(ha.ytDaily).toBeCloseTo(5.99999832156,9);expect(ha.lpDaily).toBeCloseTo(5.54019534888,9);
 expect(ha.daily).toBeCloseTo(ha.ytDaily+ha.lpDaily,12);
});

const id=(n:number)=>`0x${n.toString(16).padStart(64,'0')}`;
function fixture(){
 const objects=new Map<string,{objectId:string;type:string;owner:unknown;fields:Record<string,unknown>}>();
 const add=(n:number,type:string,fields:Record<string,unknown>)=>objects.set(id(n),{objectId:id(n),type,owner:{$kind:'Shared',Shared:{}},fields:{id:id(n),...fields}});
 const sy=`${id(30)}::SY::SY`,pt=`${id(31)}::PT::PT`,yt=`${id(32)}::YT::YT`,witness=`${id(6)}::liquidlink_points::JitterPointSource`;
 const program={scoreboardId:id(14),projectObjectId:id(13),liquidlinkConfigId:id(8),listed:true,protocolId:null,metadata:{name:'Season 1',season:'season-1'}};
 const markets=[1,2].map(n=>({marketId:id(n),syType:sy,ptType:pt,ytType:yt,expiryMs:'1000'}));
 const sources=[15,16].map(n=>({sourceId:id(n),scoreboardId:id(14),sourceType:`${id(6)}::liquidlink_points::PointConfig`,policyType:witness,archived:false}));
 const links=[1,2].map(n=>({marketId:id(n),sourceId:id(n+14),lpPointStateId:id(n+20),ytEnabled:true,lpEnabled:true,archived:false}));
 add(6,'0x2::clock::Clock',{timestamp_ms:'100'});
 add(8,`${id(9)}::global_config::GlobalConfig`,{});
 add(14,`${id(7)}::scoreboard::Scoreboard`,{project_id:id(40)});
 add(13,`${id(7)}::project::Project`,{project_id:id(40),scoreboard_id:id(14),policy_registrations:[],policy_generations:[],
  auth_sources:sources.map(s=>({source_id:s.sourceId,witness,enabled:true,project_object_id:id(13)}))});
 for(const n of [1,2]){
  add(n,`${id(4)}::market::Market<${sy},${pt},${yt}>`,{expiry:'1000',pool_sy_balance:'40000000000',lp_supply:'50000000000'});
  add(n+14,`${id(6)}::liquidlink_points::PointConfig`,{project_object_id:id(13),scoreboard_id:id(14),closed:false,enabled:true,
   yt_multiplier_bps:n===1?'10000':'12000',lp_multiplier_bps:n===1?'10000':'12000',duration:'86400000'});
  add(n+20,`${id(6)}::liquidlink_points::LpPointState<${sy}>`,{point_config_id:id(n+14),pool_id:id(n),initialized:true,
   reward_attached:true,lp_multiplier_bps:'1',lp_rewarder_uid:id(n+50),pool_rewarder_uid:id(n+60)});
 }
 const values:Record<string,string>={JITTER_EXTENSIONS_PACKAGE_ID:id(6),LIQUIDLINK_INCENTIVE_SYSTEM_PACKAGE_ID:id(7),
  LIQUIDLINK_CONFIG_PACKAGE_ID:id(9),LIQUIDLINK_GLOBAL_CONFIG_OBJECT_ID:id(8)};
 const input={address:id(99),season:{scoreboardId:id(14)},env:(key:string)=>values[key.replace(/^NEXT_PUBLIC_/,'')]??'',
  registry:{markets,sources,marketSources:links,programs:[program]},entries:markets.map(m=>({id:m.marketId,network:'mainnet',config:{marketObjectId:m.marketId,jitterPackageId:id(4)}}))} as unknown as MarketRateInput;
 const attachment={initialized:true,reward_attached:true};let exposures=0;
 const reader={getObjectInfo:async(key:string)=>{const o=objects.get(key);if(!o)throw Error('missing');return o;}} as RegistryReader;
 const deps={reader,field:async(_parent:string,type:string)=>type.endsWith('::YtPointWeightKey')?{multiplier_bps:'1'}:attachment,
  exposure:async()=>{exposures++;return {yt:50_000_000_000n,lp:25_000_000_000n};}};
 return {input,objects,attachment,deps,exposures:()=>exposures,read:()=>readUserMarketPointRates(input,deps)};
}
test('canonical chain reader adds all Season markets with independent YT/LP multipliers and deduplicates discovery',async()=>{
 const f=fixture();f.input.entries.push(f.input.entries[0]!);f.input.registry!.marketSources.push(f.input.registry!.marketSources[0]!);
 const rows=await f.read();expect(rows).toHaveLength(2);expect(f.exposures()).toBe(2);
 expect(rows[0]).toMatchObject({ytDaily:5,lpDaily:2,daily:7});expect(rows[1]).toMatchObject({ytDaily:6,lpDaily:2.4,daily:8.4});
});
test('live disable, expiry and detached scopes suppress rates without stale Registry flags inventing emission',async()=>{
 const disabled=fixture();disabled.objects.get(id(15))!.fields.enabled=false;expect((await disabled.read())[0]!.daily).toBe(0);
 const closed=fixture();closed.objects.get(id(15))!.fields.closed=true;expect((await closed.read())[0]!.daily).toBe(0);
 const expired=fixture();expired.objects.get(id(6))!.fields.timestamp_ms='1000';expect((await expired.read()).every(r=>r.daily===0)).toBe(true);
 const detached=fixture();detached.attachment.reward_attached=false;detached.objects.get(id(21))!.fields.reward_attached=false;
 expect((await detached.read())[0]!.daily).toBe(0);
 const missingWeight=fixture();const rows=await readUserMarketPointRates(missingWeight.input,{...missingWeight.deps,
  field:async(_parent,type)=>type.endsWith('::YtPointWeightKey')?null:missingWeight.attachment});
 expect(rows[0]!.ytDaily).toBe(50000); // The contract default is 10000 bps, not the deployed override of 1.
});
test('wrong bindings and unavailable reads are errors, not authoritative zero rates',async()=>{
 for(const mutate of [
  (f:ReturnType<typeof fixture>)=>{f.objects.get(id(15))!.fields.scoreboard_id=id(88);},
  (f:ReturnType<typeof fixture>)=>{f.objects.get(id(21))!.fields.pool_id=id(88);},
  (f:ReturnType<typeof fixture>)=>{f.objects.get(id(1))!.type=`${id(88)}::market::Market`;},
  (f:ReturnType<typeof fixture>)=>{f.objects.get(id(15))!.fields.duration='0';},
 ]){const f=fixture();mutate(f);await expect(f.read()).rejects.toThrow();}
 const failed=fixture();await expect(readUserMarketPointRates(failed.input,{...failed.deps,field:async()=>{throw Error('transport');}})).rejects.toThrow();
});
test('only the selected Season and attached scopes count; PT/SY-only wallets earn no market points',async()=>{
 const foreign=fixture();foreign.input.registry!.sources[0]!.scoreboardId=id(88);expect((await foreign.read())[0]!.daily).toBe(0);
 const ytOnly=fixture();ytOnly.input.registry!.marketSources[0]!.lpEnabled=false;
 expect((await ytOnly.read())[0]).toMatchObject({ytDaily:5,lpDaily:0,daily:5});
 const lpOnly=fixture();lpOnly.input.registry!.marketSources[0]!.ytEnabled=false;
 expect((await lpOnly.read())[0]).toMatchObject({ytDaily:0,lpDaily:2,daily:2});
 const noExposure=fixture();const rows=await readUserMarketPointRates(noExposure.input,{...noExposure.deps,exposure:async()=>({yt:0n,lp:0n})});
 expect(rows.every(r=>r.daily===0)).toBe(true);
});
test('retain fractional raw rates, changed duration and both multiplier factors without intermediate flooring',()=>{
 const r=calculateMarketPointRate({...base,ytRaw:'1',lpRaw:'1',poolSyRaw:'1',lpSupplyRaw:'3',globalYtBps:'7001',marketYtBps:'3001',globalLpBps:'7001',marketLpBps:'3001',durationMs:'172800000'});
 expect(r.ytDaily).toBeCloseTo(7001*3001/1e8/2/1e6,15);
 expect(r.lpDaily).toBeCloseTo(r.ytDaily/3,15);
});
test('disabled/expired programs and detached scopes are valid zero; malformed accounting is not',()=>{
 expect(calculateMarketPointRate({...base,active:false}).daily).toBe(0);
 expect(calculateMarketPointRate({...base,ytAttached:false,lpAttached:false}).daily).toBe(0);
 expect(calculateMarketPointRate({...base,marketYtBps:'0',marketLpBps:'0'}).daily).toBe(0);
 expect(calculateMarketPointRate({...base,ytRaw:'0',lpRaw:'0',lpSupplyRaw:'0'}).daily).toBe(0);
 for(const change of [{durationMs:'0'},{ytRaw:'NaN'},{lpSupplyRaw:'0'},{lpRaw:'999999999999'},{globalYtBps:'18446744073709551616'}])
  expect(()=>calculateMarketPointRate({...base,...change})).toThrow();
});


