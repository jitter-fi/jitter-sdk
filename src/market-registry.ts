import type { JitterChainReader } from "./ports/chain-reader.js";
import type { JitterMarketConfig } from "./types.js";
import {
  discoverJitterRegistry,
  registryId,
  type RegistrySnapshot,
  type RegistrySource,
} from "./registry-v2.js";

/** Consumer DTO aliases only. Registry V2 never reads legacy dynamic-field schemas. */
export type JitterMarketRegistryRecord = {
  projectId: string;
  project: JitterProjectRegistryRecord | null;
  metadata: JitterMarketMetadataRegistryRecord | null;
  marketId: string;
  marketStateId: string;
  pyStateId: string;
  poolId: string;
  ptOrderbookId: string | null;
  ytOrderbookId: string | null;
  rewardDistributorId: string | null;
  expiryMs: string;
  projectPointConfig: JitterProjectPointRegistryRecord | null;
  marketPointConfig: JitterMarketPointRegistryRecord | null;
  pointPrograms: JitterPointProgramRegistryRecord[];
};
export type JitterProjectMetadataRegistryRecord = {
  projectId: string;
  description: string;
  iconUri: string;
  websiteUri: string;
};
export type JitterProjectRegistryRecord = {
  projectId: string;
  /** No owner exists in V2; always empty. */ owner: string;
  name: string;
  metadataUri: string;
  metadata: JitterProjectMetadataRegistryRecord | null;
};
export type JitterMarketMetadataRegistryRecord = {
  projectId: string;
  seriesId: string;
  marketId: string;
  adapterKind: string;
  name: string;
  symbol: string;
  description: string;
  iconUri: string;
  metadataUri: string;
  underlyingTypeTag: string;
  syTypeTag: string;
  ptTypeTag: string;
  ytTypeTag: string;
};
export type JitterPointProgramRegistryRecord = {
  pointConfigObjectId: string;
  liquidlinkGlobalConfigObjectId: string | null;
  projectObjectId: string;
  scoreboardObjectId: string;
  label: string;
  protocol: string;
  season: string;
  metadataUri: string;
  enabled: boolean;
  marketId: string;
  lpPointStateObjectId: string | null;
  scopes: Array<"yt" | "lp" | "pool">;
};
export type JitterPointProgramDefinitionRegistryRecord = Omit<
  JitterPointProgramRegistryRecord,
  "marketId" | "lpPointStateObjectId" | "scopes"
> & {
  marketAttachments: Array<{
    marketId: string;
    lpPointStateObjectId: string | null;
    scopes: Array<"yt" | "lp" | "pool">;
  }>;
};
/** Removed chain fields remain nullable display DTOs, never synthesized emission settings. */
export type JitterProjectPointRegistryRecord = {
  projectId: string;
  enabled: boolean;
  liquidlinkGlobalConfigObjectId: string | null;
  scoreboardObjectId: string | null;
  pointCapObjectId: string | null;
  pointConfigObjectId: string | null;
  pointTokenMarketObjectId: string | null;
  pointOrderbookObjectId: string | null;
  pointTokenTypeTag: string;
  quoteTokenTypeTag: string;
  quoteSymbol: string;
  ytMultiplierBps: number | null;
  lpMultiplierBps: number | null;
  pointDurationMs: string;
};
export type JitterMarketPointRegistryRecord = {
  projectId: string;
  marketId: string;
  pointConfigObjectId: string | null;
  lpPointStateObjectId: string | null;
  ytMultiplierBps: number | null;
  lpMultiplierBps: number | null;
  pointDurationMs: string;
};

function definitions(
  snapshot: RegistrySnapshot,
): JitterPointProgramDefinitionRegistryRecord[] {
  const programs = new Map(snapshot.programs.map((p) => [p.scoreboardId, p]));
  const protocols = new Map(snapshot.protocols.map((p) => [p.protocolId, p]));
  const attachments = new Map<
    string,
    JitterPointProgramDefinitionRegistryRecord["marketAttachments"]
  >();
  for (const a of snapshot.marketSources) {
    const rows = attachments.get(a.sourceId) ?? [];
    rows.push({
      marketId: a.marketId,
      lpPointStateObjectId: a.lpPointStateId,
      scopes: [
        ...(a.ytEnabled ? ["yt" as const] : []),
        ...(a.lpEnabled ? ["lp" as const, "pool" as const] : []),
      ],
    });
    attachments.set(a.sourceId, rows);
  }
  return snapshot.sources.filter(isJitterPointConfig).map((source) => {
    const program = programs.get(source.scoreboardId)!;
    const protocol =
      program.protocolId === null
        ? undefined
        : protocols.get(program.protocolId);
    return {
      pointConfigObjectId: source.sourceId,
      liquidlinkGlobalConfigObjectId: program.liquidlinkConfigId,
      projectObjectId: program.projectObjectId,
      scoreboardObjectId: program.scoreboardId,
      label: source.label || program.metadata.name,
      protocol: protocol?.metadata.name ?? "",
      season: program.metadata.season,
      metadataUri: program.metadata.metadataUri,
      // Listing/archive flags are NOT economic lifecycle permissions. Retain historical sources for settlement.
      enabled: true,
      marketAttachments: attachments.get(source.sourceId) ?? [],
    };
  });
}
function isJitterPointConfig(source: RegistrySource): boolean {
  return source.sourceType.endsWith("::liquidlink_points::PointConfig");
}
function records(snapshot: RegistrySnapshot): JitterMarketRegistryRecord[] {
  const seriesById = new Map(snapshot.series.map((s) => [s.seriesId, s]));
  const protocolById = new Map(
    snapshot.protocols.map((p) => [p.protocolId, p]),
  );
  const byMarket = new Map<string, JitterPointProgramRegistryRecord[]>();
  for (const d of definitions(snapshot))
    for (const a of d.marketAttachments) {
      const rows = byMarket.get(a.marketId) ?? [];
      const { marketAttachments: _, ...base } = d;
      rows.push({ ...base, ...a });
      byMarket.set(a.marketId, rows);
    }
  const orderbooks = new Map(
    snapshot.extensions.flatMap((e) =>
      e.kind === "orderbooks" ? [[e.marketId, e] as const] : [],
    ),
  );
  const adapters = new Map(
    snapshot.extensions.flatMap((e) =>
      e.kind === "adapter" ? [[e.marketId, e] as const] : [],
    ),
  );
  return snapshot.markets.map((m) => {
    const s = seriesById.get(m.seriesId)!;
    const p = protocolById.get(s.protocolId)!;
    const links = orderbooks.get(m.marketId);
    const adapter = adapters.get(m.marketId);
    return {
      marketId: m.marketId,
      marketStateId: m.marketId,
      pyStateId: m.marketId,
      poolId: m.marketId,
      projectId: p.protocolId,
      project: {
        projectId: p.protocolId,
        owner: "",
        name: p.metadata.name,
        metadataUri: p.metadata.metadataUri,
        metadata: {
          projectId: p.protocolId,
          description: p.metadata.description,
          iconUri: p.metadata.iconUri,
          websiteUri: p.metadata.websiteUri,
        },
      },
      metadata: {
        projectId: p.protocolId,
        seriesId: s.seriesId,
        marketId: m.marketId,
        adapterKind:
          adapter?.kind === "adapter"
            ? adapter.payloadType.endsWith("::ScallopBinding")
              ? "scallop"
              : adapter.payloadType.endsWith("::HaedalBinding")
                ? "haedal"
                : adapter.payloadType.endsWith("::EmberBinding")
                  ? "ember"
                  : ""
            : "",
        name: m.metadata.name || s.metadata.name,
        symbol: s.metadata.symbol,
        description: m.metadata.description || s.metadata.description,
        iconUri: m.metadata.iconUri || s.metadata.iconUri,
        metadataUri: m.metadata.metadataUri || s.metadata.metadataUri,
        underlyingTypeTag: s.underlyingType,
        syTypeTag: m.syType,
        ptTypeTag: m.ptType,
        ytTypeTag: m.ytType,
      },
      ptOrderbookId: links?.kind === "orderbooks" ? links.ptOrderbookId : null,
      ytOrderbookId: links?.kind === "orderbooks" ? links.ytOrderbookId : null,
      rewardDistributorId: null,
      expiryMs: m.expiryMs,
      projectPointConfig: null,
      marketPointConfig: null,
      pointPrograms: byMarket.get(m.marketId) ?? [],
    };
  });
}

export async function listJitterPointProgramRegistryRecords(
  reader: JitterChainReader,
  config: Pick<JitterMarketConfig, "marketRegistryObjectId">,
): Promise<JitterPointProgramDefinitionRegistryRecord[]> {
  if (!config.marketRegistryObjectId) return [];
  const snapshot = await discoverJitterRegistry(
    reader,
    config.marketRegistryObjectId,
  );
  return definitions(snapshot);
}
export async function listJitterMarketRegistryRecords(
  reader: JitterChainReader,
  config: Pick<JitterMarketConfig, "marketRegistryObjectId" | "marketObjectId">,
): Promise<JitterMarketRegistryRecord[]> {
  if (!config.marketRegistryObjectId) return [];
  return records(
    await discoverJitterRegistry(reader, config.marketRegistryObjectId),
  );
}
export async function overlayJitterMarketConfigFromRegistry(
  reader: JitterChainReader,
  config: JitterMarketConfig,
): Promise<JitterMarketConfig> {
  if (!config.marketRegistryObjectId) return { ...config };
  const snapshot = await discoverJitterRegistry(
    reader,
    config.marketRegistryObjectId,
  );
  return overlayJitterMarketConfigFromRegistrySnapshot(config, snapshot);
}

/** Apply a single read's verified snapshot without repeating its table traversal. */
export function overlayJitterMarketConfigFromRegistrySnapshot(
  config: JitterMarketConfig,
  snapshot: RegistrySnapshot,
): JitterMarketConfig {
  if (!config.marketRegistryObjectId) return { ...config };
  if (registryId(config.marketRegistryObjectId) !== snapshot.root.registryId)
    throw new Error("Registry object does not match deployment.");
  const record = records(snapshot).find(
    (r) => r.marketId === registryId(config.marketObjectId),
  );
  if (!record) return { ...config };
  const series = snapshot.series.find(
    (s) => s.seriesId === record.metadata!.seriesId,
  )!;
  const m = record.metadata!;
  const p = record.project!;
  const registryTypePackage =
    config.jitterRegistryOriginalPackageId ?? config.jitterRegistryPackageId;
  if (
    registryTypePackage &&
    registryId(registryTypePackage) !== snapshot.root.packageId
  )
    throw new Error("Registry package does not match deployment.");
  if (
    config.globalConfigObjectId &&
    registryId(config.globalConfigObjectId) !== snapshot.root.configId
  )
    throw new Error("Registry config does not match deployment.");
  if (registryId(config.syStateObjectId) !== snapshot.root.syStateId)
    throw new Error("Registry SyState does not match deployment.");
  return {
    ...config,
    marketObjectId: record.marketId,
    marketStateObjectId: record.marketId,
    pyStateObjectId: record.marketId,
    poolObjectId: record.marketId,
    // Display discovery cannot install curated orderbooks or settlement inputs.
    orderbookObjectId: config.orderbookObjectId,
    ytOrderbookObjectId: config.ytOrderbookObjectId,
    // Distributor is deliberately absent from Registry. Do not replace its canonical Market binding.
    projectId: record.projectId,
    underlyingTypeTag: m.underlyingTypeTag,
    syTypeTag: m.syTypeTag,
    ptTypeTag: m.ptTypeTag,
    ytTypeTag: m.ytTypeTag,
    marketName: m.name,
    marketSymbol: m.symbol,
    marketDescription: m.description,
    marketIconUri: m.iconUri,
    marketMetadataUri: m.metadataUri,
    marketCategory: series.metadata.category,
    projectName: p.name,
    projectDescription: p.metadata!.description,
    projectIconUri: p.metadata!.iconUri,
    projectWebsiteUri: p.metadata!.websiteUri,
    // Descriptor discovery alone must not change executable adapter or Point Trading config.
    liquidlink: config.liquidlink,
  };
}
