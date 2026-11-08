import {expect,test} from 'bun:test';
import {MAINNET_LP_RELEASE as release,reviewedLpConfig,reviewedLpEnvironment} from '../lp-deployment.js';
import {MAINNET_POINT_DEPENDENCIES,MAINNET_POINT_V3_DEPENDENCIES,reviewedPointConfig,reviewedPointEnvironment} from '../liquidlink-deployment.js';
import type {JitterMarketConfig} from '../types.js';

test('LP runtime routing preserves original position types and does not mutate saved config',()=>{
  const config={jitterPackageId:release.core.originalId,jitterMathPackageId:release.math.originalId,jitterViewPackageId:release.view.originalId} as JitterMarketConfig;
  expect(reviewedLpConfig(config)).toMatchObject({jitterPackageId:release.core.packageId,jitterOriginalPackageId:release.core.originalId,jitterMathPackageId:release.math.packageId,jitterViewPackageId:release.view.packageId});
  expect(config.jitterPackageId).toBe(release.core.originalId);
  expect(reviewedPointConfig(config).jitterPackageId).toBe(release.core.packageId);
  expect(()=>reviewedLpConfig({...config,jitterOriginalPackageId:'0x123'})).toThrow('lineage');
  const foreign={...config,jitterPackageId:'0x123'};
  expect(reviewedLpConfig(foreign)).toBe(foreign);
});
test('LP environment routing does not invent missing IDs or redirect unknown deployments',()=>{
  for(const [name,p] of [['JITTER',release.core],['JITTER_MATH',release.math],['JITTER_VIEW',release.view],['JITTER_REGISTRY',release.registry],['SCALLOP_ADAPTER',release.scallop],['HAEDAL_ADAPTER',release.haedal],['EMBER_ADAPTER',release.ember]] as const){
    const key=`NEXT_PUBLIC_${name}_PACKAGE_ID`,origin=`NEXT_PUBLIC_${name}_ORIGINAL_PACKAGE_ID`,values={[key]:p.originalId};
    expect(reviewedLpEnvironment(values,key)).toBe(p.packageId);
    expect(reviewedPointEnvironment(values,key)).toBe(p.packageId);
    expect(reviewedLpEnvironment(values,origin)).toBe(p.originalId);
    expect(reviewedLpEnvironment({},key)).toBe('');
    expect(reviewedLpEnvironment({[key]:'0x123'},key)).toBe('0x123');
    expect(()=>reviewedLpEnvironment({...values,[origin]:'0x123'},key)).toThrow('lineage');
  }
});
test('saved Extensions v3 is recognized after its dependency-only v4 upgrade',()=>{
  const old=MAINNET_POINT_V3_DEPENDENCIES.extensions;
  expect(reviewedPointEnvironment({NEXT_PUBLIC_JITTER_EXTENSIONS_PACKAGE_ID:old.packageId},'NEXT_PUBLIC_JITTER_EXTENSIONS_PACKAGE_ID')).toBe(MAINNET_POINT_DEPENDENCIES.extensions.packageId);
});

test('Core v3 cutover retargets known v2 calls and active dependencies without changing state IDs',()=>{
  expect(release.core.packageId).toBe('0xd19031282e291d138bda74d9d47aa1ad63be77f9e962b8a99b6e3c1dd21a90a5');
  const config={jitterPackageId:'0xd6bf9b33202dd891382da295e07289827aecdfc6b41292c1ae7b4b3f2f1bb575',
    jitterRegistryPackageId:'0xa6244236d5d19ba42f479a1444e6c24ec0ede1d2fe8f9aed562abf331b9491f2',
    scallopAdapterPackageId:'0xe77999674332f5bd078c8d7182002f7bbf7844591f4d36dbfd1182b25ae071c0',
    haedalAdapterPackageId:'0x4e4f6a5ee9504840a1bd5a9db589782fa44d6d1ce6f4fe45e93c6b664e161ca3',
    emberAdapterPackageId:'0xc56a55893f4791d03726f9c109725765b584c06eb5625704ce782112d763ef99',
    marketObjectId:'0x111',syStateObjectId:'0x222',marketRegistryObjectId:'0x333'} as JitterMarketConfig;
  expect(reviewedLpConfig(config)).toMatchObject({jitterPackageId:release.core.packageId,
    jitterRegistryPackageId:'0x6e771fe2b6245c679c0fd0b1d07b0c502b2c16eb217a40ff93c61e87d3fcf24f',
    jitterRegistryOriginalPackageId:config.jitterRegistryPackageId,
    scallopAdapterPackageId:'0x44630ceb604158820dbcf5d9b012ab40c60173cd8718b4827edcc7eeecc6b775',
    haedalAdapterPackageId:'0xa139a932c5dbf22674f09e532fab5e67f84a905ff76342b4e9f2fabf852b126c',
    emberAdapterPackageId:'0x3026a022b43c0c239510677d758da9b385481e2eef6f1a292c42be52dc9705da',
    marketObjectId:'0x111',syStateObjectId:'0x222',marketRegistryObjectId:'0x333'});
  expect(reviewedLpConfig({...config,scallopAdapterPackageId:'0x123'}).scallopAdapterPackageId).toBe('0x123');
});
