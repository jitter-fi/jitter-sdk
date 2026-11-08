import {normalizeSuiAddress} from '@mysten/sui/utils';
import type {JitterMarketConfig} from './types.js';

/** Mainnet bytecode, type origins and linkage verified after the Core v3 rollout. */
export const MAINNET_LP_RELEASE = Object.freeze({
  core: {originalId:'0xa8a74beede1f9574474d8c56a5147659390344eeae109d67d5db50cdba39d0c8',packageId:'0xd19031282e291d138bda74d9d47aa1ad63be77f9e962b8a99b6e3c1dd21a90a5',digest:'J5BJu6rh5XZmuXs8iBAmyDwxF3ELqSSMjEkUJ1ojChX3',previousPackageIds:['0xd6bf9b33202dd891382da295e07289827aecdfc6b41292c1ae7b4b3f2f1bb575']},
  math: {originalId:'0xd72e334517b116630d3557fc18b48b207ba611913adb21231e743731a3e35a79',packageId:'0xef4a211b232e7709413d769226c73271779001745d0c15f9ffa93dcb12d42e22',digest:'5Y8jbV8mBV91PxkoyAde4oiHg3Ufk63mHKfjMFq6Dysp'},
  view: {originalId:'0xbcbd0933e68a1af594d5f5338eaa43ca3653450d4acaf89843436c04e3f841db',packageId:'0x276c078b73d1cfb97da47850f3f7f80564183ca7d7e9b2d95dea363f99003b2f',digest:'CmPABipNf8ptHhetNCTexKjKCPxbi7wgnmBRUqb8ZvhR',previousPackageIds:['0x5da2a2bc90bfaa43c33ff15617e36d866a097cd0e668299d50af5fdfea9332ad']},
  registry: {originalId:'0xa6244236d5d19ba42f479a1444e6c24ec0ede1d2fe8f9aed562abf331b9491f2',packageId:'0x6e771fe2b6245c679c0fd0b1d07b0c502b2c16eb217a40ff93c61e87d3fcf24f',digest:'HabaapQSH3HxNKxrQ1GbkcshcnUgGHvZSoUH6KBtuSW6'},
  scallop: {originalId:'0xe77999674332f5bd078c8d7182002f7bbf7844591f4d36dbfd1182b25ae071c0',packageId:'0x44630ceb604158820dbcf5d9b012ab40c60173cd8718b4827edcc7eeecc6b775',digest:'FqPBXAbKrcndDv642dQpYzophXUVJVuoMuuybR8o7QdF'},
  haedal: {originalId:'0x4e4f6a5ee9504840a1bd5a9db589782fa44d6d1ce6f4fe45e93c6b664e161ca3',packageId:'0xa139a932c5dbf22674f09e532fab5e67f84a905ff76342b4e9f2fabf852b126c',digest:'8dWuLAX5uMm9xd9vZxRq5GLTEDjYKG8d4k1VGRSasS1V'},
  ember: {originalId:'0xc56a55893f4791d03726f9c109725765b584c06eb5625704ce782112d763ef99',packageId:'0x3026a022b43c0c239510677d758da9b385481e2eef6f1a292c42be52dc9705da',digest:'4SnaFBhx8vEwpyY6mUbtrr6oi9XZc36PpBTVRkp67JoZ'},
});
type ReviewedPackage = {originalId:string;packageId:string;previousPackageIds?:readonly string[]};
const known=(value:string|undefined,p:ReviewedPackage)=>Boolean(value&&[p.originalId,p.packageId,...p.previousPackageIds??[]].includes(normalizeSuiAddress(value)));
export function reviewedAdapterCallPackageId(kind:'scallop'|'haedal'|'ember',value:string):string {
  const p=MAINNET_LP_RELEASE[kind];return known(value,p)?p.packageId:value;
}
export function reviewedAdapterOriginalPackageId(kind:'scallop'|'haedal'|'ember',value:string):string {
  const p=MAINNET_LP_RELEASE[kind];return known(value,p)?p.originalId:value;
}

export function reviewedLpConfig(config:JitterMarketConfig):JitterMarketConfig {
  const {core,math,view}=MAINNET_LP_RELEASE;
  if(!known(config.jitterPackageId,core))return config;
  if(config.jitterOriginalPackageId&&normalizeSuiAddress(config.jitterOriginalPackageId)!==core.originalId)throw Error('Reviewed LP core lineage mismatch.');
  const {registry,scallop,haedal,ember}=MAINNET_LP_RELEASE;
  if(known(config.jitterRegistryPackageId,registry)&&config.jitterRegistryOriginalPackageId&&normalizeSuiAddress(config.jitterRegistryOriginalPackageId)!==registry.originalId)throw Error('Reviewed Registry lineage mismatch.');
  return {...config,jitterPackageId:core.packageId,jitterOriginalPackageId:core.originalId,
    ...(known(config.jitterMathPackageId,math)?{jitterMathPackageId:math.packageId}:{}),
    ...(known(config.jitterViewPackageId,view)?{jitterViewPackageId:view.packageId}:{}),
    ...(known(config.jitterRegistryPackageId,registry)?{jitterRegistryPackageId:registry.packageId,jitterRegistryOriginalPackageId:registry.originalId}:{}),
    ...(known(config.scallopAdapterPackageId,scallop)?{scallopAdapterPackageId:scallop.packageId}:{}),
    ...(known(config.haedalAdapterPackageId,haedal)?{haedalAdapterPackageId:haedal.packageId}:{}),
    ...(known(config.emberAdapterPackageId,ember)?{emberAdapterPackageId:ember.packageId}:{}),
  };
}

export function reviewedLpEnvironment(values:Record<string,string>,key:string):string {
  for(const [name,p]of[['JITTER',MAINNET_LP_RELEASE.core],['JITTER_MATH',MAINNET_LP_RELEASE.math],['JITTER_VIEW',MAINNET_LP_RELEASE.view],['JITTER_REGISTRY',MAINNET_LP_RELEASE.registry],['SCALLOP_ADAPTER',MAINNET_LP_RELEASE.scallop],['HAEDAL_ADAPTER',MAINNET_LP_RELEASE.haedal],['EMBER_ADAPTER',MAINNET_LP_RELEASE.ember]] as const){
    const call=`NEXT_PUBLIC_${name}_PACKAGE_ID`,origin=`NEXT_PUBLIC_${name}_ORIGINAL_PACKAGE_ID`;
    if(!known(values[call],p))continue;
    if(values[origin]&&normalizeSuiAddress(values[origin])!==p.originalId)throw Error('Reviewed LP package lineage mismatch.');
    if(key===call)return p.packageId;
    if(key===origin)return p.originalId;
  }
  return values[key]??'';
}
