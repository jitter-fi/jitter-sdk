export const STABLECOIN_ASSETS = {
 USDC: {type:'0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', decimals:6, iconUrl:'https://admin.jitter.fi/usdc.svg'},
 USDsui: {type:'0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI', decimals:6, iconUrl:'https://token-metadata.bridge.xyz/images/usd_sui.png'},
} as const;

export const EMBER_ESUI = {
 asset:'eSUI', underlyingType:'0x2::sui::SUI', decimals:9,
 performanceFeeE9:'100000000',
 adapterPackageId:'0xc56a55893f4791d03726f9c109725765b584c06eb5625704ce782112d763ef99',
 callPackageId:'0xb82df65c5bae83c2f4c5eb4ec2fc57cc124b228cd9aef7a60ddb7d89c4e2b88e',
 typePackageId:'0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f',
 vaultObjectId:'0xfaf4d0ec9b76147c926c0c8b2aba39ea21ec991500c1e3e53b60d447b0e5f655',
 protocolConfigObjectId:'0x3a515233ab817af082ef31454cee5eb8122b8b7cd586bf6b26ae9b879ee1e565',
 receiptType:'0x66629328922d609cf15af779719e248ae0e63fe0b9d9739623f763b33a9c97da::esui::ESUI',
 iconUrl:'https://bluefin.io/images/logos/egSUI.svg',
 protocolIconUrl:'https://cdn.bluefin.io/images/Ember_dark.webp',
 productUrl:'https://ember.so/earn/eSUI',
 maxStalenessMs:1512000000,
 apiBaseUrl:'https://vaults.api.sui-prod.bluefin.io',
} as const;

export const EMBER_EEARN = {
 ...EMBER_ESUI,
 asset:'eEARN', underlyingType:STABLECOIN_ASSETS.USDC.type, decimals:6,
 performanceFeeE9:'0',
 vaultObjectId:'0x0779d2a4e1a6d3412982404cfe5567aac8cea229f17622c7b72d198b22a22e37',
 receiptType:'0x34469c8accdd673df02600265cbbad3688577f0e716866e257f88d448d463492::eearn::EEARN',
 iconUrl:'https://cdn.bluefin.io/images/eEARN.svg',
 productUrl:'https://ember.so/earn/eEARN',
} as const;
export const EMBER_DEPLOYMENTS = [EMBER_ESUI, EMBER_EEARN] as const;
export type EmberDeployment = (typeof EMBER_DEPLOYMENTS)[number];
export function reviewedEmberDeployment(vaultObjectId: string | undefined): EmberDeployment {
 const deployment=EMBER_DEPLOYMENTS.find(d=>d.vaultObjectId.toLowerCase()===vaultObjectId?.toLowerCase());
 if(!deployment)throw Error('Unreviewed Ember vault.');
 return deployment;
}
