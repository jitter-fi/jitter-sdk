import {test,expect} from 'bun:test';
import {MAINNET_LIQUIDLINK_RELEASE as ll,MAINNET_POINT_DEPENDENCIES as deps,MAINNET_LIQUIDLINK_V2_RELEASE as old,MAINNET_POINT_V2_DEPENDENCIES as oldDeps,pointDeploymentFromConfig,selectPointDeployment,reviewedPointEnvironment,reviewedPointConfig} from '../liquidlink-deployment.js';
import type {JitterMarketConfig} from '../types.js';
test('runtime routing preserves original IDs and never invents missing or foreign deployment settings',()=>{
  expect(reviewedPointEnvironment({},'NEXT_PUBLIC_LIQUIDLINK_INCENTIVE_SYSTEM_PACKAGE_ID')).toBe('');
  expect(reviewedPointEnvironment({NEXT_PUBLIC_JITTER_EXTENSIONS_PACKAGE_ID:'0x123'},'NEXT_PUBLIC_JITTER_EXTENSIONS_PACKAGE_ID')).toBe('0x123');
  for(const [name,original,runtime]of[['LIQUIDLINK_INCENTIVE_SYSTEM',ll.originalPackageId,ll.packageId],['JITTER_EXTENSIONS',deps.extensions.originalId,deps.extensions.packageId],['JITTER_REFERRAL',deps.referral.originalId,deps.referral.packageId]]){
    const values={[`NEXT_PUBLIC_${name}_PACKAGE_ID`]:original};
    expect(reviewedPointEnvironment(values,`NEXT_PUBLIC_${name}_PACKAGE_ID`)).toBe(runtime);
    expect(reviewedPointEnvironment(values,`NEXT_PUBLIC_${name}_ORIGINAL_PACKAGE_ID`)).toBe(original);
    expect(()=>reviewedPointEnvironment({...values,[`NEXT_PUBLIC_${name}_ORIGINAL_PACKAGE_ID`]:'0x123'},`NEXT_PUBLIC_${name}_PACKAGE_ID`)).toThrow();
  }
});

test('runtime follows the on-chain allow list, never merely the newest publication',()=>{
  expect(selectPointDeployment(['2']).release.packageId).toBe(old.packageId);
  expect(selectPointDeployment(['2','3']).release.packageId).toBe(ll.packageId);
  expect(selectPointDeployment(['3']).dependencies.extensions.packageId).toBe(deps.extensions.packageId);
  expect(()=>selectPointDeployment(['1'])).toThrow();
  const object={type:`${ll.configPackageId}::global_config::GlobalConfig`,owner:{Shared:{}},json:{config_version:'1',package_policies:[{package:`${ll.originalPackageId.slice(2)}::package_version::PackageMarker`,allowed_versions:{contents:['2','3']}}]}};
  expect(pointDeploymentFromConfig(object).release.version).toBe('3');
  expect(()=>pointDeploymentFromConfig({...object,owner:{AddressOwner:'0xa'}})).toThrow();
  expect(()=>pointDeploymentFromConfig({...object,type:'0x2::global_config::GlobalConfig'})).toThrow();
  expect(()=>pointDeploymentFromConfig({...object,json:{...object.json,package_policies:[...object.json.package_policies,...object.json.package_policies]}})).toThrow();
});

test('v2 saved calls can route to either accepted deployment without changing type origins',()=>{
  const values={NEXT_PUBLIC_LIQUIDLINK_INCENTIVE_SYSTEM_PACKAGE_ID:old.packageId,NEXT_PUBLIC_LIQUIDLINK_POINT_TRADING_PACKAGE_ID:old.packageId};
  expect(reviewedPointEnvironment(values,'NEXT_PUBLIC_LIQUIDLINK_INCENTIVE_SYSTEM_PACKAGE_ID',selectPointDeployment(['2']))).toBe(old.packageId);
  expect(reviewedPointEnvironment(values,'NEXT_PUBLIC_LIQUIDLINK_INCENTIVE_SYSTEM_PACKAGE_ID',selectPointDeployment(['3']))).toBe(ll.packageId);
  expect(reviewedPointEnvironment(values,'NEXT_PUBLIC_LIQUIDLINK_POINT_TRADING_PACKAGE_ID',selectPointDeployment(['3']))).toBe(ll.packageId);
  const config={jitterExtensionsPackageId:oldDeps.extensions.packageId,liquidlink:{enabled:true,liquidlinkPackageId:old.packageId,liquidlinkGlobalConfigObjectId:ll.configId,referralPackageId:oldDeps.referral.packageId}} as JitterMarketConfig;
  expect(reviewedPointConfig(config,selectPointDeployment(['2'])).jitterExtensionsPackageId).toBe(oldDeps.extensions.packageId);
  expect(reviewedPointConfig(config,selectPointDeployment(['3'])).jitterExtensionsPackageId).toBe(deps.extensions.packageId);
  expect(config.jitterExtensionsPackageId).toBe(oldDeps.extensions.packageId);
});
test('saved market configs adopt reviewed calls but retain legacy object type origins without mutation',()=>{
  const config={jitterExtensionsPackageId:deps.extensions.originalId,liquidlink:{enabled:true,liquidlinkPackageId:ll.originalPackageId,liquidlinkGlobalConfigObjectId:ll.configId,referralPackageId:deps.referral.originalId}} as JitterMarketConfig;
  const upgraded=reviewedPointConfig(config);
  expect(upgraded.jitterExtensionsPackageId).toBe(deps.extensions.packageId);
  expect(upgraded.liquidlink?.liquidlinkPackageId).toBe(ll.packageId);
  expect(upgraded.liquidlink?.extensionsOriginalPackageId).toBe(deps.extensions.originalId);
  expect(upgraded.liquidlink?.referralOriginalPackageId).toBe(deps.referral.originalId);
  expect(config.jitterExtensionsPackageId).toBe(deps.extensions.originalId);
  const foreign={...config,liquidlink:{...config.liquidlink,liquidlinkGlobalConfigObjectId:'0x1'}};
  expect(reviewedPointConfig(foreign)).toBe(foreign);
});
