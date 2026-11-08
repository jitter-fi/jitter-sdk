import type { JitterMarketConfigEntry } from "./config.js";
import type { JitterMarketConfig } from "./types.js";
import {
  discoverJitterRegistry,
  registryFields,
  registryId,
  registryType,
  registryU64,
  type RegistryReader,
  type RegistrySnapshot,
} from "./registry-v2.js";
import { validateRegistryAdapter } from "./registry-v2-validation.js";

type EmberDiscoveryDeployment = {adapterPackageId:string;callPackageId:string;typePackageId:string;vaultObjectId:string;protocolConfigObjectId:string;receiptType:string;underlyingType?:string};
export type RegistryMarketDiscoveryDeployment = {
  network: "mainnet" | "testnet";
  chainId: string;
  registryObjectId: string;
  registryPackageId: string;
  configId: string;
  adminCapId: string;
  syStateId: string;
  packages: Pick<
    JitterMarketConfig,
    | "jitterPackageId"
    | "jitterOriginalPackageId"
    | "jitterConfigPackageId"
    | "oraclePackageId"
    | "aclObjectId"
    | "jitterMathPackageId"
  >;
  assets: readonly {
    underlyingType: string;
    underlyingDecimals: number;
    marketDecimals: number;
  }[];
  scallop?: {
    adapterPackageId: string;
    typePackageId: string;
    callPackageId: string;
  };
  haedal?: {
    adapterPackageId: string;
    stakingTypePackageId: string;
    callPackageId: string;
    stakingObjectId: string;
  };
  ember?: EmberDiscoveryDeployment;
  emberVaults?: readonly EmberDiscoveryDeployment[];
};

/** Read-only discovery. Registry listing never grants permission to install executable routes. */
export async function discoverJitterMarketConfigEntries(
  reader: RegistryReader,
  trust: RegistryMarketDiscoveryDeployment,
  suppliedSnapshot?: RegistrySnapshot,
): Promise<JitterMarketConfigEntry[]> {
  const snapshot = suppliedSnapshot ?? await discoverJitterRegistry(reader, trust.registryObjectId);
  if (registryId(snapshot.root.registryId) !== registryId(trust.registryObjectId)) throw Error("Registry discovery identity mismatch.");
  const { root } = snapshot;
  for (const [actual, expected] of [
    [root.packageId, trust.registryPackageId],
    [root.configId, trust.configId],
    [root.adminCapId, trust.adminCapId],
    [root.syStateId, trust.syStateId],
  ])
    if (registryId(actual!) !== registryId(expected!))
      throw new Error("Registry discovery deployment mismatch.");
  if (!reader.getObjectInfo)
    throw new Error("Market discovery requires typed object reads.");
  const readObject = reader.getObjectInfo.bind(reader);
  const core = registryId(
    trust.packages.jitterOriginalPackageId ?? trust.packages.jitterPackageId,
  );
  const entries: JitterMarketConfigEntry[] = [];
  const discoverMarket = async (market: RegistrySnapshot["markets"][number]): Promise<JitterMarketConfigEntry | null> => {
    const series = snapshot.series.find((s) => s.seriesId === market.seriesId)!;
    const protocol = snapshot.protocols.find(
      (p) => p.protocolId === series.protocolId,
    )!;
    if (!market.listed || !series.listed || !protocol.listed) return null;
    const asset = trust.assets.find(
      (a) =>
        registryType(a.underlyingType, "trusted underlying") ===
        registryType(series.underlyingType, "series underlying"),
    );
    if (!asset) return null;
    for (const decimals of [asset.underlyingDecimals, asset.marketDecimals]) {
      if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18)
        throw new Error("Invalid trusted asset decimals.");
    }
    const live = await readObject(market.marketId);
    if (
      registryId(live.objectId) !== market.marketId ||
      registryFields(live.owner).$kind !== "Shared" ||
      registryType(live.type, "Market") !==
        registryType(
          `${core}::market::Market<${market.syType},${market.ptType},${market.ytType}>`,
          "expected Market",
        )
    ) {
      throw new Error("Registry discovery Market type/ownership mismatch.");
    }
    const fields = registryFields(live.fields);
    if (registryU64(fields.expiry, "expiry") !== market.expiryMs)
      throw new Error("Registry discovery expiry mismatch.");
    const config: JitterMarketConfig = {
      ...trust.packages,
      jitterRegistryPackageId: root.packageId,
      marketRegistryObjectId: root.registryId,
      syStateObjectId: root.syStateId,
      globalConfigObjectId: root.configId,
      marketObjectId: market.marketId,
      marketStateObjectId: market.marketId,
      poolObjectId: market.marketId,
      pyStateObjectId: market.marketId,
      priceAggregatorObjectId: registryId(fields.price_aggregator_id),
      rewardDistributorObjectId: registryId(fields.reward_distributor_id),
      demoAdapterPackageId: "",
      demoMarketVaultObjectId: "",
      orderbookObjectId: null,
      ytOrderbookObjectId: null,
      underlyingTypeTag: series.underlyingType,
      syTypeTag: market.syType,
      ptTypeTag: market.ptType,
      ytTypeTag: market.ytType,
      underlyingDecimals: asset.underlyingDecimals,
      marketDecimals: asset.marketDecimals,
      marketName: market.metadata.name || series.metadata.name,
      marketSymbol: series.metadata.symbol,
      marketDescription:
        market.metadata.description || series.metadata.description,
      marketIconUri: market.metadata.iconUri || series.metadata.iconUri,
      marketMetadataUri:
        market.metadata.metadataUri || series.metadata.metadataUri,
      marketCategory: series.metadata.category,
      projectId: protocol.protocolId,
      projectName: protocol.metadata.name,
      projectDescription: protocol.metadata.description,
      projectIconUri: protocol.metadata.iconUri,
      projectWebsiteUri: protocol.metadata.websiteUri,
    };
    const binding = snapshot.extensions.find(
      (e) => e.kind === "adapter" && e.marketId === market.marketId,
    );
    if (
      binding?.kind === "adapter" &&
      binding.payloadType ===
        `${root.packageId}::market_registry::ScallopBinding` &&
      trust.scallop
    ) {
      const scallop = trust.scallop;
      const adapter = await validateRegistryAdapter(reader, {
        root,
        market,
        series,
        binding,
        corePackageId: core,
        adapterPackageId: scallop.adapterPackageId,
        expectedReceiptType: `${scallop.typePackageId}::reserve::MarketCoin<${series.underlyingType}>`,
        upstreamTypes: {
          scallopMarket: `${scallop.typePackageId}::market::Market`,
          scallopVersion: `${scallop.typePackageId}::version::Version`,
        },
      });
      Object.assign(config, {
        adapterKind: "scallop",
        scallopAdapterPackageId: scallop.adapterPackageId,
        scallopProtocolPackageId: scallop.callPackageId,
        scallopMarketVaultObjectId: adapter.vaultId,
        scallopMarketObjectId: adapter.upstreamIds.scallop_market_id,
        scallopVersionObjectId: adapter.upstreamIds.version_id,
        scallopMarketCoinTypeTag: series.receiptType,
      });
    }
    if (binding?.kind === "adapter" && binding.payloadType === `${root.packageId}::market_registry::HaedalBinding` && trust.haedal) {
      const h = trust.haedal;
      if (registryType(series.underlyingType, "Haedal underlying") !== registryType("0x2::sui::SUI", "SUI"))
        throw new Error("Haedal requires SUI underlying.");
      const adapter = await validateRegistryAdapter(reader, {
        root, market, series, binding, corePackageId: core, adapterPackageId: h.adapterPackageId,
        expectedReceiptType: `${h.stakingTypePackageId}::hasui::HASUI`,
        upstreamTypes: { haedalStaking: `${h.stakingTypePackageId}::staking::Staking` },
      });
      if (registryId(adapter.upstreamIds.staking_id) !== registryId(h.stakingObjectId))
        throw new Error("Haedal staking object does not match trusted deployment.");
      Object.assign(config, { adapterKind: "haedal", haedalAdapterPackageId: h.adapterPackageId,
        haedalProtocolPackageId: h.callPackageId, haedalStakingObjectId: h.stakingObjectId,
        haedalMarketVaultObjectId: adapter.vaultId });
    }
    if(binding?.kind==='adapter'&&binding.payloadType===`${root.packageId}::market_registry::EmberBinding`&&(trust.ember||trust.emberVaults)){
      const e=(trust.emberVaults??[trust.ember!]).find(d=>registryType(d.receiptType,'trusted Ember receipt')===registryType(series.receiptType,'Ember receipt'));
      if(!e)throw Error('Unreviewed Ember receipt.');
      if(registryType(series.underlyingType,'Ember underlying')!==registryType(e.underlyingType??'0x2::sui::SUI','trusted Ember underlying'))throw Error('Ember underlying mismatch.');
      const adapter=await validateRegistryAdapter(reader,{root,market,series,binding,corePackageId:core,
        adapterPackageId:e.adapterPackageId,expectedReceiptType:e.receiptType,
        upstreamTypes:{emberVault:`${e.typePackageId}::vault::Vault<${series.underlyingType},${e.receiptType}>`}});
      if(registryId(adapter.upstreamIds.ember_vault_id)!==registryId(e.vaultObjectId))throw Error('Ember vault does not match trusted deployment.');
      Object.assign(config,{adapterKind:'ember',emberAdapterPackageId:e.adapterPackageId,emberMarketVaultObjectId:adapter.vaultId,
        emberVaultObjectId:e.vaultObjectId,emberVaultsPackageId:e.callPackageId,emberProtocolConfigObjectId:e.protocolConfigObjectId,emberReceiptTypeTag:e.receiptType,scallopMarketCoinTypeTag:e.receiptType});
    }
    return {
      id: market.marketId,
      name: config.marketName!,
      network: trust.network,
      chainId: trust.chainId,
      tradeReady: false,
      config,
    };
  };
  for (let start = 0; start < snapshot.markets.length; start += 4) {
    const batch = await Promise.all(snapshot.markets.slice(start, start + 4).map(discoverMarket));
    entries.push(...batch.filter((entry): entry is JitterMarketConfigEntry => entry !== null));
  }
  return entries;
}
