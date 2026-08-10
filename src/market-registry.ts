import type { JitterChainReader } from "./ports/chain-reader.js";
import type { JitterMarketConfig } from "./types.js";

const NONE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

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
  owner: string;
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

type MarketRegistryFields = {
  id?: unknown;
  market_count?: unknown;
  market_ids?: unknown;
  point_program_ids?: unknown;
};

type MarketRegistryDynamicField = {
  id?: unknown;
  name?: unknown;
  value?: unknown;
};

type RawMarketRecord = {
  project_id?: unknown;
  market_id?: unknown;
  market_state_id?: unknown;
  py_state_id?: unknown;
  pool_id?: unknown;
  pt_orderbook_id?: unknown;
  yt_orderbook_id?: unknown;
  reward_distributor_id?: unknown;
  expiry?: unknown;
};

type RawProject = {
  project_id?: unknown;
  owner?: unknown;
  name?: unknown;
  metadata_uri?: unknown;
};

type RawProjectMetadata = {
  project_id?: unknown;
  description?: unknown;
  icon_uri?: unknown;
  website_uri?: unknown;
};

type RawMarketMetadata = {
  project_id?: unknown;
  series_id?: unknown;
  market_id?: unknown;
  adapter?: unknown;
  name?: unknown;
  symbol?: unknown;
  description?: unknown;
  icon_uri?: unknown;
  metadata_uri?: unknown;
  underlying_type?: unknown;
  sy_type?: unknown;
  pt_type?: unknown;
  yt_type?: unknown;
};

type RawProjectPointConfig = {
  project_id?: unknown;
  enabled?: unknown;
  liquidlink_global_config_id?: unknown;
  scoreboard_id?: unknown;
  point_cap_id?: unknown;
  point_config_id?: unknown;
  point_token_market_id?: unknown;
  point_orderbook_id?: unknown;
  point_token_type?: unknown;
  quote_coin_type?: unknown;
  quote_symbol?: unknown;
  yt_multiplier_bps?: unknown;
  lp_multiplier_bps?: unknown;
  point_duration_ms?: unknown;
};

type RawMarketPointConfig = {
  project_id?: unknown;
  market_id?: unknown;
  point_config_id?: unknown;
  lp_point_state_id?: unknown;
  yt_multiplier_bps?: unknown;
  lp_multiplier_bps?: unknown;
  point_duration_ms?: unknown;
};

type RawPointProgram = {
  point_config_id?: unknown;
  liquidlink_global_config_id?: unknown;
  project_object_id?: unknown;
  scoreboard_id?: unknown;
  name?: unknown;
  protocol?: unknown;
  season?: unknown;
  metadata_uri?: unknown;
  enabled?: unknown;
};

type RawMarketPointProgram = {
  market_id?: unknown;
  point_config_id?: unknown;
  lp_point_state_id?: unknown;
  yt_enabled?: unknown;
  lp_enabled?: unknown;
  pool_enabled?: unknown;
};

export async function listJitterPointProgramRegistryRecords(
  chainReader: JitterChainReader,
  config: Pick<JitterMarketConfig, "marketRegistryObjectId">,
): Promise<JitterPointProgramDefinitionRegistryRecord[]> {
  if (!config.marketRegistryObjectId) return [];

  const [registry, fields] = await Promise.all([
    chainReader.getObject<MarketRegistryFields>(config.marketRegistryObjectId),
    chainReader.getDynamicFieldObjects<MarketRegistryDynamicField>({
      parentId: config.marketRegistryObjectId,
      limit: 100,
    }),
  ]);
  const programs = new Map<
    string,
    JitterPointProgramDefinitionRegistryRecord
  >();
  const attachments = new Map<
    string,
    JitterPointProgramDefinitionRegistryRecord["marketAttachments"]
  >();

  for (const field of fields) {
    const program = readPointProgram(field);
    if (program) {
      programs.set(program.pointConfigObjectId.toLowerCase(), {
        ...program,
        marketAttachments: [],
      });
      continue;
    }

    const attachment = readMarketPointProgram(field);
    if (attachment) {
      const key = attachment.pointConfigObjectId.toLowerCase();
      const rows = attachments.get(key) ?? [];
      rows.push({
        marketId: attachment.marketId,
        lpPointStateObjectId: attachment.lpPointStateObjectId,
        scopes: attachment.scopes,
      });
      attachments.set(key, rows);
    }
  }

  for (const [key, program] of programs) {
    programs.set(key, {
      ...program,
      marketAttachments: attachments.get(key) ?? [],
    });
  }

  const pointProgramIds = readIdVector(registry.point_program_ids);
  if (pointProgramIds.length === 0) return [...programs.values()];
  return pointProgramIds.flatMap((pointConfigId) => {
    const program = programs.get(pointConfigId.toLowerCase());
    return program ? [program] : [];
  });
}

export async function listJitterMarketRegistryRecords(
  chainReader: JitterChainReader,
  config: Pick<
    JitterMarketConfig,
    "marketRegistryObjectId" | "marketObjectId"
  >,
): Promise<JitterMarketRegistryRecord[]> {
  if (!config.marketRegistryObjectId) return [];

  const [registry, fields] = await Promise.all([
    chainReader.getObject<MarketRegistryFields>(config.marketRegistryObjectId),
    chainReader.getDynamicFieldObjects<MarketRegistryDynamicField>({
      parentId: config.marketRegistryObjectId,
      limit: 100,
    }),
  ]);

  const marketIds = readIdVector(registry.market_ids);
  const recordsByMarketId = new Map<string, JitterMarketRegistryRecord>();
  const projectsByProjectId = new Map<string, JitterProjectRegistryRecord>();
  const projectMetadataByProjectId = new Map<
    string,
    JitterProjectMetadataRegistryRecord
  >();
  const marketMetadataByMarketId = new Map<
    string,
    JitterMarketMetadataRegistryRecord
  >();
  const projectPointConfigsByProjectId = new Map<
    string,
    JitterProjectPointRegistryRecord
  >();
  const marketPointConfigsByMarketId = new Map<
    string,
    JitterMarketPointRegistryRecord
  >();
  const pointProgramsById = new Map<
    string,
    Omit<
      JitterPointProgramRegistryRecord,
      "marketId" | "lpPointStateObjectId" | "scopes"
    >
  >();
  const pointProgramAttachmentsByMarketId = new Map<
    string,
    Array<{
      pointConfigObjectId: string;
      lpPointStateObjectId: string | null;
      scopes: Array<"yt" | "lp" | "pool">;
    }>
  >();

  for (const field of fields) {
    const project = readProject(field);
    if (project) {
      projectsByProjectId.set(project.projectId, project);
      continue;
    }

    const projectMetadata = readProjectMetadata(field);
    if (projectMetadata) {
      projectMetadataByProjectId.set(projectMetadata.projectId, projectMetadata);
      continue;
    }

    const marketMetadata = readMarketMetadata(field);
    if (marketMetadata) {
      marketMetadataByMarketId.set(marketMetadata.marketId.toLowerCase(), marketMetadata);
      continue;
    }

    const record = readMarketRecord(field);
    if (record) {
      recordsByMarketId.set(record.marketId.toLowerCase(), record);
      continue;
    }

    const projectPointConfig = readProjectPointConfig(field);
    if (projectPointConfig) {
      projectPointConfigsByProjectId.set(
        projectPointConfig.projectId,
        projectPointConfig,
      );
      continue;
    }

    const pointProgram = readPointProgram(field);
    if (pointProgram) {
      pointProgramsById.set(
        pointProgram.pointConfigObjectId.toLowerCase(),
        pointProgram,
      );
      continue;
    }

    const pointProgramAttachment = readMarketPointProgram(field);
    if (pointProgramAttachment) {
      const key = pointProgramAttachment.marketId.toLowerCase();
      const rows = pointProgramAttachmentsByMarketId.get(key) ?? [];
      rows.push(pointProgramAttachment);
      pointProgramAttachmentsByMarketId.set(key, rows);
      continue;
    }

    const marketPointConfig = readMarketPointConfig(field);
    if (marketPointConfig) {
      marketPointConfigsByMarketId.set(
        marketPointConfig.marketId.toLowerCase(),
        marketPointConfig,
      );
    }
  }

  for (const [marketId, record] of recordsByMarketId) {
    const baseProject = projectsByProjectId.get(record.projectId) ?? null;
    const project = baseProject
      ? {
          ...baseProject,
          metadata: projectMetadataByProjectId.get(record.projectId) ?? null,
        }
      : null;
    const projectPointConfig = projectPointConfigsByProjectId.get(record.projectId) ?? null;
    const marketPointConfig = marketPointConfigsByMarketId.get(marketId) ?? null;
    const pointPrograms = (
      pointProgramAttachmentsByMarketId.get(marketId) ?? []
    ).flatMap((attachment) => {
      const program = pointProgramsById.get(
        attachment.pointConfigObjectId.toLowerCase(),
      );
      return program
        ? [{
            ...program,
            marketId: record.marketId,
            lpPointStateObjectId: attachment.lpPointStateObjectId,
            scopes: attachment.scopes,
          }]
        : [];
    });
    recordsByMarketId.set(marketId, {
      ...record,
      project,
      metadata: marketMetadataByMarketId.get(marketId) ?? null,
      projectPointConfig,
      marketPointConfig,
      pointPrograms,
    });
  }

  if (marketIds.length === 0) {
    return [...recordsByMarketId.values()];
  }

  return marketIds.flatMap((marketId) => {
    const record = recordsByMarketId.get(marketId.toLowerCase());
    return record ? [record] : [];
  });
}

export async function overlayJitterMarketConfigFromRegistry(
  chainReader: JitterChainReader,
  config: JitterMarketConfig,
): Promise<JitterMarketConfig> {
  const records = await listJitterMarketRegistryRecords(chainReader, config);
  if (records.length === 0) return { ...config };

  const record =
    records.find(
      (candidate) =>
        candidate.marketId.toLowerCase() === config.marketObjectId.toLowerCase(),
    ) ?? (records.length === 1 ? records[0] : null);
  if (!record) return { ...config };

  const project = record.project;
  const projectMetadata = project?.metadata;
  const marketMetadata = record.metadata;

  return {
    ...config,
    marketObjectId: record.marketId,
    marketStateObjectId: record.marketStateId,
    pyStateObjectId: record.pyStateId,
    poolObjectId: record.poolId,
    orderbookObjectId: record.ptOrderbookId,
    ytOrderbookObjectId: record.ytOrderbookId,
    rewardDistributorObjectId:
      record.rewardDistributorId ?? config.rewardDistributorObjectId,
    projectId: record.projectId || config.projectId,
    underlyingTypeTag:
      marketMetadata?.underlyingTypeTag || config.underlyingTypeTag,
    syTypeTag: marketMetadata?.syTypeTag || config.syTypeTag,
    ptTypeTag: marketMetadata?.ptTypeTag || config.ptTypeTag,
    ytTypeTag: marketMetadata?.ytTypeTag || config.ytTypeTag,
    marketName: marketMetadata?.name || config.marketName,
    marketSymbol: marketMetadata?.symbol || config.marketSymbol,
    marketDescription:
      marketMetadata?.description || config.marketDescription,
    marketIconUri: marketMetadata?.iconUri || config.marketIconUri,
    marketMetadataUri:
      marketMetadata?.metadataUri || config.marketMetadataUri,
    adapterKind: marketMetadata?.adapterKind || config.adapterKind,
    projectName: project?.name || config.projectName,
    projectDescription:
      projectMetadata?.description || config.projectDescription,
    projectIconUri: projectMetadata?.iconUri || config.projectIconUri,
    projectWebsiteUri:
      projectMetadata?.websiteUri || config.projectWebsiteUri,
    liquidlink: overlayLiquidlinkConfig(config, record),
  };
}

function readProject(
  field: MarketRegistryDynamicField,
): JitterProjectRegistryRecord | null {
  const value = readRawField(field.value) as RawProject;
  const projectId = normalizeScalar(value.project_id);
  const owner = normalizeId(value.owner);
  if (
    !projectId
    || projectId === "0"
    || !owner
    || value.name == null
    || value.metadata_uri == null
  ) {
    return null;
  }
  return {
    projectId,
    owner,
    name: normalizeBytes(value.name),
    metadataUri: normalizeBytes(value.metadata_uri),
    metadata: null,
  };
}

function readProjectMetadata(
  field: MarketRegistryDynamicField,
): JitterProjectMetadataRegistryRecord | null {
  const value = readRawField(field.value) as RawProjectMetadata & {
    market_id?: unknown;
  };
  const projectId = normalizeScalar(value.project_id);
  if (
    !projectId
    || projectId === "0"
    || normalizeId(value.market_id)
    || value.description == null
    || value.icon_uri == null
    || value.website_uri == null
  ) {
    return null;
  }
  return {
    projectId,
    description: normalizeBytes(value.description),
    iconUri: normalizeBytes(value.icon_uri),
    websiteUri: normalizeBytes(value.website_uri),
  };
}

function readMarketMetadata(
  field: MarketRegistryDynamicField,
): JitterMarketMetadataRegistryRecord | null {
  const value = readRawField(field.value) as RawMarketMetadata;
  const marketId = normalizeId(value.market_id);
  if (
    !marketId
    || value.adapter == null
    || value.underlying_type == null
    || value.sy_type == null
    || value.pt_type == null
    || value.yt_type == null
  ) {
    return null;
  }
  return {
    projectId: normalizeScalar(value.project_id),
    seriesId: normalizeScalar(value.series_id),
    marketId,
    adapterKind: normalizeBytes(value.adapter),
    name: normalizeBytes(value.name),
    symbol: normalizeBytes(value.symbol),
    description: normalizeBytes(value.description),
    iconUri: normalizeBytes(value.icon_uri),
    metadataUri: normalizeBytes(value.metadata_uri),
    underlyingTypeTag: normalizeTypeName(value.underlying_type),
    syTypeTag: normalizeTypeName(value.sy_type),
    ptTypeTag: normalizeTypeName(value.pt_type),
    ytTypeTag: normalizeTypeName(value.yt_type),
  };
}

function readMarketRecord(
  field: MarketRegistryDynamicField,
): JitterMarketRegistryRecord | null {
  const value = readRawField(field.value) as RawMarketRecord;
  const marketId = normalizeId(value.market_id);
  if (!marketId) return null;
  if (
    value.market_state_id == null &&
    value.py_state_id == null &&
    value.pool_id == null &&
    value.reward_distributor_id == null &&
    value.expiry == null
  ) {
    return null;
  }

  const marketStateId = normalizeId(value.market_state_id) || marketId;
  const pyStateId = normalizeId(value.py_state_id) || marketStateId;
  const poolId = normalizeId(value.pool_id) || marketStateId;
  if (!marketStateId || !pyStateId || !poolId) return null;

  return {
    projectId: normalizeScalar(value.project_id),
    project: null,
    metadata: null,
    marketId,
    marketStateId,
    pyStateId,
    poolId,
    ptOrderbookId: normalizeOptionalId(value.pt_orderbook_id),
    ytOrderbookId: normalizeOptionalId(value.yt_orderbook_id),
    rewardDistributorId: normalizeOptionalId(value.reward_distributor_id),
    expiryMs: normalizeScalar(value.expiry),
    projectPointConfig: null,
    marketPointConfig: null,
    pointPrograms: [],
  };
}

function readPointProgram(
  field: MarketRegistryDynamicField,
): Omit<
  JitterPointProgramRegistryRecord,
  "marketId" | "lpPointStateObjectId" | "scopes"
> | null {
  const value = readRawField(field.value) as RawPointProgram;
  const pointConfigObjectId = normalizeId(value.point_config_id);
  const projectObjectId = normalizeId(value.project_object_id);
  const scoreboardObjectId = normalizeId(value.scoreboard_id);
  if (!pointConfigObjectId || !projectObjectId || !scoreboardObjectId || value.name == null) {
    return null;
  }
  return {
    pointConfigObjectId,
    liquidlinkGlobalConfigObjectId:
      normalizeOptionalId(value.liquidlink_global_config_id),
    projectObjectId,
    scoreboardObjectId,
    label: normalizeBytes(value.name),
    protocol: normalizeBytes(value.protocol),
    season: normalizeBytes(value.season),
    metadataUri: normalizeBytes(value.metadata_uri),
    enabled: normalizeBool(value.enabled),
  };
}

function readMarketPointProgram(
  field: MarketRegistryDynamicField,
): {
  marketId: string;
  pointConfigObjectId: string;
  lpPointStateObjectId: string | null;
  scopes: Array<"yt" | "lp" | "pool">;
} | null {
  const value = readRawField(field.value) as RawMarketPointProgram;
  const marketId = normalizeId(value.market_id);
  const pointConfigObjectId = normalizeId(value.point_config_id);
  if (
    !marketId
    || !pointConfigObjectId
    || (
      value.yt_enabled == null
      && value.lp_enabled == null
      && value.pool_enabled == null
    )
  ) {
    return null;
  }
  const scopes: Array<"yt" | "lp" | "pool"> = [];
  if (normalizeBool(value.yt_enabled)) scopes.push("yt");
  if (normalizeBool(value.lp_enabled)) scopes.push("lp");
  if (normalizeBool(value.pool_enabled)) scopes.push("pool");
  return {
    marketId,
    pointConfigObjectId,
    lpPointStateObjectId: normalizeOptionalId(value.lp_point_state_id),
    scopes,
  };
}

function readProjectPointConfig(
  field: MarketRegistryDynamicField,
): JitterProjectPointRegistryRecord | null {
  const value = readRawField(field.value) as RawProjectPointConfig;
  if (normalizeId((value as RawProjectPointConfig & { market_id?: unknown }).market_id)) {
    return null;
  }
  const projectId = normalizeScalar(value.project_id);
  if (!projectId || projectId === "0") return null;
  if (
    value.liquidlink_global_config_id == null &&
    value.scoreboard_id == null &&
    value.point_config_id == null
  ) {
    return null;
  }

  return {
    projectId,
    enabled: normalizeBool(value.enabled),
    liquidlinkGlobalConfigObjectId: normalizeOptionalId(value.liquidlink_global_config_id),
    scoreboardObjectId: normalizeOptionalId(value.scoreboard_id),
    pointCapObjectId: normalizeOptionalId(value.point_cap_id),
    pointConfigObjectId: normalizeOptionalId(value.point_config_id),
    pointTokenMarketObjectId: normalizeOptionalId(value.point_token_market_id),
    pointOrderbookObjectId: normalizeOptionalId(value.point_orderbook_id),
    pointTokenTypeTag: normalizeBytes(value.point_token_type),
    quoteTokenTypeTag: normalizeBytes(value.quote_coin_type),
    quoteSymbol: normalizeBytes(value.quote_symbol),
    ytMultiplierBps: normalizeOptionalNumber(value.yt_multiplier_bps),
    lpMultiplierBps: normalizeOptionalNumber(value.lp_multiplier_bps),
    pointDurationMs: normalizeScalar(value.point_duration_ms),
  };
}

function readMarketPointConfig(
  field: MarketRegistryDynamicField,
): JitterMarketPointRegistryRecord | null {
  const value = readRawField(field.value) as RawMarketPointConfig;
  const marketId = normalizeId(value.market_id);
  if (!marketId) return null;
  if (value.lp_point_state_id == null && value.point_config_id == null) {
    return null;
  }

  return {
    projectId: normalizeScalar(value.project_id),
    marketId,
    pointConfigObjectId: normalizeOptionalId(value.point_config_id),
    lpPointStateObjectId: normalizeOptionalId(value.lp_point_state_id),
    ytMultiplierBps: normalizeOptionalNumber(value.yt_multiplier_bps),
    lpMultiplierBps: normalizeOptionalNumber(value.lp_multiplier_bps),
    pointDurationMs: normalizeScalar(value.point_duration_ms),
  };
}

function overlayLiquidlinkConfig(
  config: JitterMarketConfig,
  record: JitterMarketRegistryRecord,
): JitterMarketConfig["liquidlink"] {
  const projectPoint = record.projectPointConfig;
  const marketPoint = record.marketPointConfig;
  if (
    !projectPoint
    && !marketPoint
    && record.pointPrograms.length === 0
  ) {
    return config.liquidlink;
  }

  const base = config.liquidlink ?? {};
  const tokenized = projectPoint
    ? {
        ...base.tokenizedPoint,
        enabled:
          base.tokenizedPoint?.enabled ??
          Boolean(projectPoint.pointTokenMarketObjectId || projectPoint.pointOrderbookObjectId),
        tokenTypeTag:
          projectPoint.pointTokenTypeTag || base.tokenizedPoint?.tokenTypeTag,
        pointTokenMarketObjectId:
          projectPoint.pointTokenMarketObjectId ?? base.tokenizedPoint?.pointTokenMarketObjectId,
        quoteTokenTypeTag:
          projectPoint.quoteTokenTypeTag || base.tokenizedPoint?.quoteTokenTypeTag,
        quoteSymbol:
          projectPoint.quoteSymbol || base.tokenizedPoint?.quoteSymbol,
        orderbookObjectId:
          projectPoint.pointOrderbookObjectId ?? base.tokenizedPoint?.orderbookObjectId,
      }
    : base.tokenizedPoint;

  return {
    ...base,
    enabled: projectPoint?.enabled ?? base.enabled,
    liquidlinkGlobalConfigObjectId:
      projectPoint?.liquidlinkGlobalConfigObjectId ?? base.liquidlinkGlobalConfigObjectId,
    projectObjectId: base.projectObjectId,
    scoreboardObjectId: projectPoint?.scoreboardObjectId ?? base.scoreboardObjectId,
    pointCapObjectId: projectPoint?.pointCapObjectId ?? base.pointCapObjectId,
    pointConfigObjectId:
      marketPoint?.pointConfigObjectId ??
      projectPoint?.pointConfigObjectId ??
      base.pointConfigObjectId,
    lpPointStateObjectId:
      marketPoint?.lpPointStateObjectId ?? base.lpPointStateObjectId,
    ytMultiplierBps:
      marketPoint?.ytMultiplierBps ??
      projectPoint?.ytMultiplierBps ??
      base.ytMultiplierBps,
    lpMultiplierBps:
      marketPoint?.lpMultiplierBps ??
      projectPoint?.lpMultiplierBps ??
      base.lpMultiplierBps,
    pointDurationMs:
      nonZeroScalar(marketPoint?.pointDurationMs) ??
      nonZeroScalar(projectPoint?.pointDurationMs) ??
      base.pointDurationMs,
    pointPrograms:
      record.pointPrograms.length > 0
        ? record.pointPrograms.map((program) => ({
            label: program.label,
            protocol: program.protocol,
            ...(program.season ? { season: program.season } : {}),
            projectObjectId: program.projectObjectId,
            scoreboardObjectId: program.scoreboardObjectId,
            pointConfigObjectId: program.pointConfigObjectId,
            ...(program.lpPointStateObjectId
              ? { lpPointStateObjectId: program.lpPointStateObjectId }
              : {}),
            enabled: program.enabled,
            scopes: program.scopes,
          }))
        : base.pointPrograms,
    tokenizedPoint: tokenized,
  };
}

function readIdVector(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const id = normalizeId(item);
    return id ? [id] : [];
  });
}

function readRawField(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && "fields" in value) {
    const fields = (value as { fields?: unknown }).fields;
    return fields && typeof fields === "object"
      ? (fields as Record<string, unknown>)
      : {};
  }
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeOptionalId(value: unknown): string | null {
  const id = normalizeId(value);
  return !id || id.toLowerCase() === NONE_ID ? null : id;
}

function normalizeId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const nested = (value as { id?: unknown }).id;
    return typeof nested === "string" ? nested : "";
  }
  if (value && typeof value === "object" && "pos0" in value) {
    const nested = (value as { pos0?: unknown }).pos0;
    return typeof nested === "string" ? nested : "";
  }
  return "";
}

function normalizeScalar(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return value.toString();
  if (value && typeof value === "object" && "value" in value) {
    const nested = (value as { value?: unknown }).value;
    return nested == null ? "0" : String(nested);
  }
  return value == null ? "0" : String(value);
}

function normalizeBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1";
  return Boolean(value);
}

function normalizeOptionalNumber(value: unknown): number | null {
  const scalar = normalizeScalar(value);
  if (!scalar || scalar === "0") return null;
  const parsed = Number(scalar);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTypeName(value: unknown): string {
  const fields = readRawField(value);
  if (fields.name != null) return normalizeBytes(fields.name);
  return normalizeBytes(value);
}

function normalizeBytes(value: unknown): string {
  if (typeof value === "string") {
    const decoded = decodeBase64Text(value);
    return decoded ?? value;
  }
  if (Array.isArray(value)) {
    const bytes = value.flatMap((item) => {
      const parsed =
        typeof item === "number"
          ? item
          : typeof item === "string"
            ? Number(item)
            : Number.NaN;
      return Number.isInteger(parsed) && parsed >= 0 && parsed <= 255
        ? [parsed]
        : [];
    });
    if (bytes.length > 0) {
      return new TextDecoder().decode(new Uint8Array(bytes));
    }
  }
  return "";
}

function decodeBase64Text(value: string): string | null {
  if (
    value.length === 0
    || value.length % 4 !== 0
    || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)
  ) {
    return null;
  }
  try {
    const binary = globalThis.atob(value);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return /^[\x20-\x7E\t\r\n]+$/.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

function nonZeroScalar(value: string | null | undefined): string | undefined {
  return value && value !== "0" ? value : undefined;
}
