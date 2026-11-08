import type {JitterMarketConfig} from './types.js';
import {normalizeStructTag,normalizeSuiAddress} from '@mysten/sui/utils';
import {reviewedLpConfig,reviewedLpEnvironment} from './lp-deployment.js';
/** Verified compatible mainnet upgrade; defining IDs remain unchanged. */
export const MAINNET_LIQUIDLINK_V2_RELEASE = Object.freeze({
  version: '2' as const,
  packageId: '0xab3187c2a38d410286052bc2c48b5e6b0b044ce81f186116187ee8740271ca18',
  originalPackageId: '0x15e9e1df6c5c67e16244069eb4b2feb10f16ae7d3f06fc51b8b51e1dc70a6f37',
  configPackageId: '0xceb670f2749c93192f50d32f3343b0e34911465e434ed7230333afc48f33272b',
  configId: '0x9a6879c9bda6ba6219d6cc57b887082ecbd39dcfbe1163a747cf15ebfc104b28',
  adminCapId: '0xad4554ff40c93c397c801691ba325c5b0017d7891bf55bfc311faecfde60ce14',
  digest: '9Jf9CKLrXszHuoER8iTtJo8jfkAAnUCf5rAa2geUqTMf',
});

/** Dependency-only upgrades verified against mainnet package linkage and bytecode. */
export const MAINNET_POINT_V2_DEPENDENCIES = Object.freeze({
  referral: {storageVersion:'2',originalId:'0x1aa8cb1498bb84426d4b85b53774bc5c007098bc93ea3c6d016d6154d39f8c7c',packageId:'0x8ecb92cbd2c3cec35b2b80faed5c547b2ae2dfff1a7f7721eb639d32caf91264',capId:'0x1094f919ee9cc6ff1db53833534457b2ca300477b07656fba0e0b3642ac6e24b',digest:'C7cbf7uRYb1R4TTdn5j9YbYQ4nGftVcu4Gosm81hJ2Um'},
  extensions: {storageVersion:'2',originalId:'0x46c6f7c5176ffe3d6706ed7bee5e31447071f9a5227e29d96179d5e7b5d73ea1',packageId:'0x9d2c65467f2693e91fee978c0202b2a2da3e0666b806e2fb435dbebe7bf44156',capId:'0x2566b8114df447d54f21868b97a05d8fa83bf95ab0ea212bc5b535cbf009869a',digest:'3KmwACN8nSzgdxMzYEA2LH4r2yWZjWuoihv1AjrPLraT'},
});

export const MAINNET_LIQUIDLINK_RELEASE = Object.freeze({...MAINNET_LIQUIDLINK_V2_RELEASE,
  version:'3' as const,packageId:'0xacb48bb70a5176c5c3d92de412b76def15ad9463778c934a709cd87d9cff7a5a',digest:'4rHoPEiG8mWBuCuuJ3skKDSVC1P6Ctx6j1heARGVZXbL',
});
export const MAINNET_POINT_V3_DEPENDENCIES = Object.freeze({
  referral:{...MAINNET_POINT_V2_DEPENDENCIES.referral,storageVersion:'3',packageId:'0x6afeffd2e880107e8d9379b9a072932c969199ffd38c8dc27db58a22bebe0b30',digest:'Aq855vVfKtkndyD9mrf8gcz173NAuMaMNNyeve4HMvh5'},
  extensions:{...MAINNET_POINT_V2_DEPENDENCIES.extensions,storageVersion:'3',packageId:'0xb446975a133154b778f4ffe6d08eb6ed5445e0dcf076713c7b295a0ac7bf48ab',digest:'2qtbn4gBKgxPG9HJLyPWeghymy5m1x2DJyUFFbCaAqxS'},
});
export const MAINNET_POINT_V4_DEPENDENCIES = Object.freeze({...MAINNET_POINT_V3_DEPENDENCIES,
  extensions:{...MAINNET_POINT_V3_DEPENDENCIES.extensions,storageVersion:'4',packageId:'0xc05a5766277bfa16381610416f586e33b11ff774f90409feb57b8e8899708308',digest:'E2cNyp2voxzBySbrm1jUqFDQHehe1ScwmjuFEGtpG93z'},
});
export const MAINNET_POINT_DEPENDENCIES = Object.freeze({
  referral:{...MAINNET_POINT_V3_DEPENDENCIES.referral,storageVersion:'4',packageId:'0x834a8b278b512b7e4f94516f056a7b0e23fe9a2f2b54d2bca1ecca158f94dffb',digest:'4eRay7RKS38X3RDvu8ktCF5VfhgNckyLqrQ3xrmydG6q'},
  extensions:{...MAINNET_POINT_V4_DEPENDENCIES.extensions,storageVersion:'5',packageId:'0xd44752b6e2073622938698643bed196809f861e98710936c9e2738b303ffa9e9',digest:'8rVz39YX4a9oNtxm5mnj7R329m9datxjKDQw1sWh4w15'},
});
export type PointDeployment = {release:typeof MAINNET_LIQUIDLINK_RELEASE|typeof MAINNET_LIQUIDLINK_V2_RELEASE;dependencies:typeof MAINNET_POINT_DEPENDENCIES};
export const PREFERRED_POINT_DEPLOYMENT:PointDeployment = {release:MAINNET_LIQUIDLINK_RELEASE,dependencies:MAINNET_POINT_DEPENDENCIES};
export function selectPointDeployment(versions:readonly string[]):PointDeployment {
  if(versions.includes('3'))return PREFERRED_POINT_DEPLOYMENT;
  if(versions.includes('2'))return {release:MAINNET_LIQUIDLINK_V2_RELEASE,dependencies:MAINNET_POINT_V2_DEPENDENCIES};
  throw Error('No reviewed Liquidlink runtime is enabled.');
}
export type PointControlObject = {type?:string;owner?:unknown;json?:unknown};
export function pointDeploymentFromConfig(object:PointControlObject):PointDeployment {
  const release=MAINNET_LIQUIDLINK_RELEASE;
  if(!object.type||normalizeStructTag(object.type)!==`${release.configPackageId}::global_config::GlobalConfig`||!object.owner||typeof object.owner!=='object'||!('Shared' in object.owner))throw Error('Expected the reviewed shared Liquidlink GlobalConfig.');
  const json=object.json as {config_version?:unknown;package_policies?:{package?:unknown;allowed_versions?:{contents?:unknown}}[]}|undefined;
  if(String(json?.config_version)!=='1'||!Array.isArray(json?.package_policies))throw Error('Unreadable Liquidlink version policy.');
  const marker=`${release.originalPackageId}::package_version::PackageMarker`;
  const policies=json.package_policies.filter(p=>typeof p?.package==='string'&&normalizeStructTag(p.package.startsWith('0x')?p.package:`0x${p.package}`)===marker);
  if(policies.length!==1||!Array.isArray(policies[0]?.allowed_versions?.contents))throw Error('Missing or ambiguous Liquidlink version policy.');
  const versions=policies[0].allowed_versions.contents.map(v=>{
    if(!/^[1-9]\d*$/.test(String(v))||BigInt(String(v))>((1n<<64n)-1n))throw Error('Invalid Liquidlink version.');
    return String(v);
  });
  if(new Set(versions).size!==versions.length)throw Error('Duplicate Liquidlink version.');
  return selectPointDeployment(versions);
}
export async function readMainnetPointDeployment(read:(id:string)=>Promise<PointControlObject>):Promise<PointDeployment> {
  return pointDeploymentFromConfig(await read(MAINNET_LIQUIDLINK_RELEASE.configId));
}
const known=(value:string|undefined,...ids:string[])=>Boolean(value&&ids.some(id=>normalizeSuiAddress(value)===id));

export function reviewedPointEnvironment(values:Record<string,string>,key:string,deployment:PointDeployment=PREFERRED_POINT_DEPLOYMENT):string {
  const ll=deployment.release,deps=deployment.dependencies;
  const releases=[
    ['LIQUIDLINK_INCENTIVE_SYSTEM',ll.originalPackageId,ll.packageId,MAINNET_LIQUIDLINK_V2_RELEASE.packageId,MAINNET_LIQUIDLINK_RELEASE.packageId],
    ['LIQUIDLINK_POINT_TRADING',ll.originalPackageId,ll.packageId,MAINNET_LIQUIDLINK_V2_RELEASE.packageId,MAINNET_LIQUIDLINK_RELEASE.packageId],
    ['JITTER_REFERRAL',deps.referral.originalId,deps.referral.packageId,MAINNET_POINT_V2_DEPENDENCIES.referral.packageId,MAINNET_POINT_V3_DEPENDENCIES.referral.packageId,MAINNET_POINT_DEPENDENCIES.referral.packageId],
    ['JITTER_EXTENSIONS',deps.extensions.originalId,deps.extensions.packageId,MAINNET_POINT_V2_DEPENDENCIES.extensions.packageId,MAINNET_POINT_V3_DEPENDENCIES.extensions.packageId,MAINNET_POINT_V4_DEPENDENCIES.extensions.packageId,MAINNET_POINT_DEPENDENCIES.extensions.packageId],
  ] as const;
  for(const [name,original,runtime,...history] of releases){
    const callKey=`NEXT_PUBLIC_${name}_PACKAGE_ID`,originKey=`NEXT_PUBLIC_${name}_ORIGINAL_PACKAGE_ID`;
    const configured=values[callKey]?.toLowerCase();
    if(!known(configured,original,runtime,...history))continue;
    if(values[originKey]&&values[originKey]!.toLowerCase()!==original)throw Error('Reviewed point package lineage mismatch.');
    if(key===callKey)return runtime;
    if(key===originKey)return original;
  }
  return reviewedLpEnvironment(values,key);
}

export function reviewedPointConfig(config:JitterMarketConfig,deployment:PointDeployment=PREFERRED_POINT_DEPLOYMENT):JitterMarketConfig {
  const ll=config.liquidlink;
  if(ll?.liquidlinkGlobalConfigObjectId?.toLowerCase()!==MAINNET_LIQUIDLINK_RELEASE.configId)return reviewedLpConfig(config);
  const e=deployment.dependencies.extensions,r=deployment.dependencies.referral;
  if(!known(config.jitterExtensionsPackageId,e.originalId,MAINNET_POINT_V2_DEPENDENCIES.extensions.packageId,MAINNET_POINT_V3_DEPENDENCIES.extensions.packageId,MAINNET_POINT_V4_DEPENDENCIES.extensions.packageId,MAINNET_POINT_DEPENDENCIES.extensions.packageId))return reviewedLpConfig(config);
  if(!known(ll.liquidlinkPackageId,MAINNET_LIQUIDLINK_RELEASE.originalPackageId,MAINNET_LIQUIDLINK_V2_RELEASE.packageId,MAINNET_LIQUIDLINK_RELEASE.packageId))return config;
  if(ll.extensionsOriginalPackageId&&ll.extensionsOriginalPackageId!==e.originalId)throw Error('Point extensions lineage mismatch.');
  const referral=known(ll.referralPackageId,r.originalId,MAINNET_POINT_V2_DEPENDENCIES.referral.packageId,MAINNET_POINT_V3_DEPENDENCIES.referral.packageId,MAINNET_POINT_DEPENDENCIES.referral.packageId);
  return {...reviewedLpConfig(config),jitterExtensionsPackageId:e.packageId,liquidlink:{...ll,extensionsOriginalPackageId:e.originalId,
    liquidlinkPackageId:deployment.release.packageId,
    ...(referral?{referralPackageId:r.packageId,referralOriginalPackageId:r.originalId}:{}),
  }};
}
