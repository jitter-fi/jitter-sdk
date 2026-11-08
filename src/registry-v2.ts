import { normalizeStructTag, normalizeSuiAddress } from "@mysten/sui/utils";
import type {
  ChainObjectInfo,
  DynamicFieldObjectQuery,
  DynamicFieldPage,
} from "./ports/chain-reader.js";

export type RegistryReader = {
  getObjectInfo?<T>(objectId: string): Promise<ChainObjectInfo<T>>;
  getDynamicFieldPage?<T>(
    query: DynamicFieldObjectQuery,
  ): Promise<DynamicFieldPage<T>>;
};
export const REGISTRY_V2_LIMITS = {
  labelBytes: 64,
  descriptionBytes: 512,
  uriBytes: 512,
} as const;
export type RegistryTable = { id: string; size: string };
export type RegistryMetadata = Record<string, string>;
export type RegistryProtocolMetadata = {
  name: string;
  slug: string;
  description: string;
  iconUri: string;
  websiteUri: string;
  docsUri: string;
  metadataUri: string;
};
export type RegistrySeriesMetadata = {
  name: string;
  symbol: string;
  description: string;
  iconUri: string;
  category: string;
  metadataUri: string;
};
export type RegistryMarketMetadata = {
  name: string;
  description: string;
  iconUri: string;
  metadataUri: string;
};
export type RegistryProgramMetadata = {
  name: string;
  season: string;
  description: string;
  iconUri: string;
  metadataUri: string;
};
type Listed = { listed: boolean; revision: string };
export type RegistryProtocol = Listed & {
  protocolId: string;
  metadata: RegistryProtocolMetadata;
  displayRank: string;
  seriesIds: RegistryTable;
};
export type RegistrySeries = Listed & {
  seriesId: string;
  protocolId: string;
  underlyingType: string;
  receiptType: string;
  metadata: RegistrySeriesMetadata;
  defaultMarketId: string | null;
  displayRank: string;
  marketIds: RegistryTable;
};
export type RegistryMarket = Listed & {
  marketId: string;
  seriesId: string;
  expiryMs: string;
  syType: string;
  ptType: string;
  ytType: string;
  metadata: RegistryMarketMetadata;
  displayRank: string;
  sourceIds: RegistryTable;
};
export type RegistryProgram = Listed & {
  scoreboardId: string;
  projectObjectId: string;
  liquidlinkConfigId: string;
  protocolId: string | null;
  metadata: RegistryProgramMetadata;
  sourceIds: RegistryTable;
};
export type RegistrySource = {
  sourceId: string;
  scoreboardId: string;
  policyType: string;
  sourceType: string;
  label: string;
  archived: boolean;
  revision: string;
  marketIds: RegistryTable;
};
export type RegistryMarketSource = {
  marketId: string;
  sourceId: string;
  lpPointStateId: string | null;
  ytEnabled: boolean;
  lpEnabled: boolean;
  archived: boolean;
  revision: string;
};
export type RegistryAdapterBinding = {
  kind: "adapter";
  payloadType: string;
  marketId: string;
  adapterType: string;
  vaultId: string;
  revision: string;
  payload: Record<string, unknown>;
};
export type RegistryOrderbooks = {
  kind: "orderbooks";
  marketId: string;
  ptOrderbookId: string | null;
  ytOrderbookId: string | null;
  revision: string;
};
export type RegistryPointTrading = {
  kind: "pointTrading";
  scoreboardId: string;
  pointTokenMarketId: string;
  orderbookId: string | null;
  revision: string;
};
export type RegistryExtension =
  | RegistryAdapterBinding
  | RegistryOrderbooks
  | RegistryPointTrading
  | { kind: "unsupported"; fieldType: string; fieldId: string };
export type RegistryRoot = {
  registryId: string;
  packageId: string;
  version: string;
  configId: string;
  adminCapId: string;
  syStateId: string;
  schemaVersion: "1";
  protocols: RegistryTable;
  series: RegistryTable;
  markets: RegistryTable;
  programs: RegistryTable;
  sources: RegistryTable;
  marketSources: RegistryTable;
  extensions: RegistryTable;
};
export type RegistrySnapshot = {
  root: RegistryRoot;
  protocols: RegistryProtocol[];
  series: RegistrySeries[];
  markets: RegistryMarket[];
  programs: RegistryProgram[];
  sources: RegistrySource[];
  marketSources: RegistryMarketSource[];
  extensions: RegistryExtension[];
};

export function registryFields(
  value: unknown,
  label = "record",
): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    return "fields" in object ? registryFields(object.fields, label) : object;
  }
  throw new Error(`Registry ${label} is missing or malformed.`);
}
export function registryId(value: unknown, label = "ID"): string {
  if (typeof value !== "string") {
    const object = registryFields(value, label);
    return registryId(object.id ?? object.bytes, label);
  }
  if (!/^(0x)?[a-fA-F0-9]{1,64}$/.test(value))
    throw new Error(`Invalid Registry ${label}.`);
  const result = normalizeSuiAddress(value);
  if (BigInt(result) === 0n)
    throw new Error(`Registry ${label} cannot be zero.`);
  return result;
}
export function registryU64(value: unknown, label: string): string {
  if (typeof value === "number" && !Number.isSafeInteger(value))
    throw new Error(`Unsafe Registry ${label}.`);
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "bigint"
  )
    throw new Error(`Missing Registry ${label}.`);
  const text = String(value);
  if (!/^\d{1,20}$/.test(text) || BigInt(text) > 18446744073709551615n)
    throw new Error(`Invalid Registry ${label}.`);
  return BigInt(text).toString();
}
export function registryBool(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new Error(`Missing Registry ${label}.`);
  return value;
}
export function registryText(
  value: unknown,
  label: string,
  limit = 4096,
): string {
  let data: Uint8Array;
  if (
    Array.isArray(value) &&
    value.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)
  )
    data = Uint8Array.from(value);
  else if (typeof value === "string") {
    // gRPC Move JSON represents vector<u8> as base64; plain strings are used by
    // TypeName/string wrappers. Never guess whether an arbitrary ASCII name is base64.
    if (value === "") return "";
    if (
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        value,
      )
    )
      throw new Error(`Invalid base64 Registry ${label}.`);
    data = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  } else throw new Error(`Missing Registry ${label}.`);
  if (data.length > limit)
    throw new Error(`Registry ${label} exceeds byte limit.`);
  return new TextDecoder("utf-8", { fatal: true }).decode(data);
}
export function registryType(value: unknown, label: string): string {
  if (typeof value !== "string") {
    const f = registryFields(value, label);
    if (
      typeof f.address === "string" &&
      typeof f.module === "string" &&
      typeof f.name === "string" &&
      Array.isArray(f.typeParams)
    ) {
      return normalizeStructTag(f as Parameters<typeof normalizeStructTag>[0]);
    }
    return registryType(f.name, label);
  }
  let text = value;
  if (!text.includes("::")) text = registryText(value, label, 4096);
  try {
    return normalizeStructTag(text);
  } catch {
    throw new Error(`Invalid Registry ${label} type.`);
  }
}
function option<T>(
  value: unknown,
  parse: (value: unknown) => T,
  label: string,
): T | null {
  if (value === null) return null;
  // Native gRPC unwraps Option<scalar> to scalar/null. Expanded Move JSON
  // fixtures can also expose its vec representation.
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  )
    return parse(value);
  const array = Array.isArray(value) ? value : registryFields(value, label).vec;
  if (!Array.isArray(array) || array.length > 1)
    throw new Error(`Invalid Registry ${label} option.`);
  return array.length ? parse(array[0]) : null;
}
const optionalId = (value: unknown, label: string) =>
  option(value, (v) => registryId(v, label), label);
const table = (value: unknown, label: string): RegistryTable => {
  const f = registryFields(value, label);
  return {
    id: registryId(f.id, `${label}.id`),
    size: registryU64(f.size, `${label}.size`),
  };
};
const rank = (f: Record<string, unknown>) =>
  registryU64(f.display_rank, "display_rank");
const listed = (f: Record<string, unknown>): Listed => ({
  listed: registryBool(f.listed, "listed"),
  revision: revision(f),
});
const revision = (f: Record<string, unknown>): string => {
  const n = registryU64(f.revision, "revision");
  if (n === "0") throw new Error("Registry revision must be positive.");
  return n;
};
function metadata<K extends string>(
  value: unknown,
  keys: ReadonlyArray<readonly [string, K]>,
): Record<K, string> {
  const f = registryFields(value, "metadata");
  return Object.fromEntries(
    keys.map(([raw, key]) => [
      key,
      registryText(
        f[raw],
        raw,
        raw === "description"
          ? REGISTRY_V2_LIMITS.descriptionBytes
          : raw.endsWith("_uri")
            ? REGISTRY_V2_LIMITS.uriBytes
            : REGISTRY_V2_LIMITS.labelBytes,
      ),
    ]),
  ) as Record<K, string>;
}
const protocolKeys = [
  ["name", "name"],
  ["slug", "slug"],
  ["description", "description"],
  ["icon_uri", "iconUri"],
  ["website_uri", "websiteUri"],
  ["docs_uri", "docsUri"],
  ["metadata_uri", "metadataUri"],
] as const;
const seriesKeys = [
  ["name", "name"],
  ["symbol", "symbol"],
  ["description", "description"],
  ["icon_uri", "iconUri"],
  ["category", "category"],
  ["metadata_uri", "metadataUri"],
] as const;
const marketKeys = [
  ["name", "name"],
  ["description", "description"],
  ["icon_uri", "iconUri"],
  ["metadata_uri", "metadataUri"],
] as const;
const programKeys = [
  ["name", "name"],
  ["season", "season"],
  ["description", "description"],
  ["icon_uri", "iconUri"],
  ["metadata_uri", "metadataUri"],
] as const;

export async function readRegistryRoot(
  reader: RegistryReader,
  registryObjectId: string,
  expectedPackageId?: string,
): Promise<RegistryRoot> {
  if (!reader.getObjectInfo)
    throw new Error("Registry V2 requires typed object reads.");
  const registry = registryId(registryObjectId);
  const object = await reader.getObjectInfo(registry);
  if (registryId(object.objectId) !== registry)
    throw new Error("Registry object ID mismatch.");
  const type = registryType(object.type, "root");
  const match = /^([^:]+)::market_registry::Registry$/.exec(type);
  if (
    !match ||
    (expectedPackageId && registryId(expectedPackageId) !== match[1])
  )
    throw new Error("Wrong Registry V2 object type.");
  const owner = registryFields(object.owner, "owner");
  if (owner.$kind !== "Shared")
    throw new Error("Registry must be a Shared Object.");
  const f = registryFields(object.fields);
  if (registryId(f.id) !== registry) throw new Error("Registry UID mismatch.");
  if (registryU64(f.schema_version, "schema_version") !== "1")
    throw new Error("Unsupported Registry schema_version.");
  return {
    registryId: registry,
    packageId: match[1]!,
    version: registryU64(object.version, "object version"),
    configId: registryId(f.config_id),
    adminCapId: registryId(f.admin_cap_id),
    syStateId: registryId(f.sy_state_id),
    schemaVersion: "1",
    protocols: table(f.protocols, "protocols"),
    series: table(f.series, "series"),
    markets: table(f.markets, "markets"),
    programs: table(f.programs, "programs"),
    sources: table(f.sources, "sources"),
    marketSources: table(f.market_sources, "market_sources"),
    extensions: table(f.extensions, "extensions"),
  };
}

/** Consumes every cursor and verifies the Table size. Failure never yields partial rows. */
export async function readRegistryTable(
  reader: RegistryReader,
  handle: RegistryTable,
): Promise<ChainObjectInfo<unknown>[]> {
  if (!reader.getDynamicFieldPage)
    throw new Error("Registry V2 requires cursor-aware dynamic field reads.");
  const rows: ChainObjectInfo<unknown>[] = [];
  const cursors = new Set<string>();
  const ids = new Set<string>();
  const keys = new Set<string>();
  let cursor: string | null = null;
  do {
    const page: DynamicFieldPage<unknown> = await reader.getDynamicFieldPage({
      parentId: handle.id,
      cursor,
      limit: 50,
    });
    if (
      !page ||
      !Array.isArray(page.data) ||
      typeof page.hasNextPage !== "boolean"
    )
      throw new Error("Missing Registry page.");
    if (page.data.length > 50)
      throw new Error("Registry page exceeds requested size.");
    for (const row of page.data) {
      const key = registryId(row.objectId, "field object ID");
      if (ids.has(key)) throw new Error("Duplicate Registry field object.");
      const owner = registryFields(row.owner, "field owner");
      if (
        owner.$kind !== "ObjectOwner" ||
        registryId(owner.ObjectOwner, "field parent") !== handle.id
      )
        throw new Error("Registry field belongs to another Table.");
      const name = registryFields(row.fields, "field").name;
      const fingerprint = keyFingerprint(name);
      if (keys.has(fingerprint))
        throw new Error("Duplicate Registry Table key.");
      keys.add(fingerprint);
      ids.add(key);
      rows.push(row);
    }
    if (BigInt(rows.length) > BigInt(handle.size))
      throw new Error("Registry Table size mismatch.");
    if (!page.hasNextPage) break;
    if (
      !page.data.length ||
      typeof page.nextCursor !== "string" ||
      !page.nextCursor ||
      cursors.has(page.nextCursor)
    )
      throw new Error("Missing or cyclic Registry cursor.");
    cursors.add(page.nextCursor);
    cursor = page.nextCursor;
  } while (true);
  if (BigInt(rows.length) !== BigInt(handle.size))
    throw new Error("Incomplete Registry Table: size mismatch.");
  return rows;
}

function keyFingerprint(value: unknown): string {
  if (typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return JSON.stringify(value.map(keyFingerprint));
  if (typeof value === "string")
    return value.startsWith("0x")
      ? registryId(value)
      : /^\d+$/.test(value)
        ? BigInt(value).toString()
        : value;
  if (typeof value === "number" || typeof value === "bigint")
    return registryU64(value, "key");
  const f = registryFields(value, "key");
  return JSON.stringify(
    Object.keys(f)
      .sort()
      .map((k) => [k, keyFingerprint(f[k])]),
  );
}

/** Enumerate a Protocol/Series/Market/Program/Source membership Table by its UID. */
export async function listRegistryMembership(
  reader: RegistryReader,
  handle: RegistryTable,
  keyKind: "id" | "u64",
): Promise<string[]> {
  const keyType = keyKind === "id" ? "0x2::object::ID" : "u64";
  const expected = registryType(
    `0x2::dynamic_field::Field<${keyType},bool>`,
    "membership",
  );
  return (await readRegistryTable(reader, handle)).map((row) => {
    if (registryType(row.type, "membership") !== expected)
      throw new Error("Wrong Registry membership type.");
    const f = registryFields(row.fields, "membership");
    if (f.value !== true) throw new Error("Registry membership must be true.");
    return keyKind === "id"
      ? registryId(f.name)
      : registryU64(f.name, "membership key");
  });
}

function record(
  row: ChainObjectInfo<unknown>,
  root: RegistryRoot,
  kind: string,
  keyType: string,
): { key: unknown; fields: Record<string, unknown> } {
  const expected = `0x2::dynamic_field::Field<${keyType},${root.packageId}::market_registry::${kind}>`;
  if (registryType(row.type, "entry") !== registryType(expected, "entry"))
    throw new Error(`Wrong Registry ${kind} entry type.`);
  const f = registryFields(row.fields);
  return { key: f.name, fields: registryFields(f.value, kind) };
}
function sameKey(actual: string, key: unknown, objectKey: boolean) {
  if (actual !== (objectKey ? registryId(key) : registryU64(key, "key")))
    throw new Error("Registry record/key mismatch.");
}
async function readProtocols(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistryProtocol[]> {
  return (await readRegistryTable(reader, root.protocols)).map((row) => {
    const { key, fields: f } = record(row, root, "Protocol", "u64");
    const protocolId = registryU64(f.protocol_id, "protocol_id");
    sameKey(protocolId, key, false);
    return {
      protocolId,
      metadata: metadata(f.metadata, protocolKeys),
      ...listed(f),
      displayRank: rank(f),
      seriesIds: table(f.series_ids, "series_ids"),
    };
  });
}
async function readSeries(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistrySeries[]> {
  return (await readRegistryTable(reader, root.series)).map((row) => {
    const { key, fields: f } = record(row, root, "Series", "u64");
    const seriesId = registryU64(f.series_id, "series_id");
    sameKey(seriesId, key, false);
    return {
      seriesId,
      protocolId: registryU64(f.protocol_id, "protocol_id"),
      underlyingType: registryType(f.underlying_type, "underlying_type"),
      receiptType: registryType(f.receipt_type, "receipt_type"),
      metadata: metadata(f.metadata, seriesKeys),
      defaultMarketId: optionalId(f.default_market_id, "default_market_id"),
      ...listed(f),
      displayRank: rank(f),
      marketIds: table(f.market_ids, "market_ids"),
    };
  });
}
async function readMarkets(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistryMarket[]> {
  return (await readRegistryTable(reader, root.markets)).map((row) => {
    const { key, fields: f } = record(
      row,
      root,
      "MarketRecord",
      "0x2::object::ID",
    );
    const marketId = registryId(f.market_id);
    sameKey(marketId, key, true);
    return {
      marketId,
      seriesId: registryU64(f.series_id, "series_id"),
      expiryMs: registryU64(f.expiry_ms, "expiry_ms"),
      syType: registryType(f.sy_type, "sy_type"),
      ptType: registryType(f.pt_type, "pt_type"),
      ytType: registryType(f.yt_type, "yt_type"),
      metadata: metadata(f.metadata, marketKeys),
      ...listed(f),
      displayRank: rank(f),
      sourceIds: table(f.source_ids, "source_ids"),
    };
  });
}
async function readPrograms(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistryProgram[]> {
  return (await readRegistryTable(reader, root.programs)).map((row) => {
    const { key, fields: f } = record(
      row,
      root,
      "PointProgram",
      "0x2::object::ID",
    );
    const scoreboardId = registryId(f.scoreboard_id);
    sameKey(scoreboardId, key, true);
    return {
      scoreboardId,
      projectObjectId: registryId(f.project_object_id),
      liquidlinkConfigId: registryId(f.liquidlink_config_id),
      protocolId: option(
        f.protocol_id,
        (v) => registryU64(v, "protocol_id"),
        "protocol_id",
      ),
      metadata: metadata(f.metadata, programKeys),
      ...listed(f),
      sourceIds: table(f.source_ids, "source_ids"),
    };
  });
}
async function readSources(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistrySource[]> {
  return (await readRegistryTable(reader, root.sources)).map((row) => {
    const { key, fields: f } = record(
      row,
      root,
      "PointSource",
      "0x2::object::ID",
    );
    const sourceId = registryId(f.source_id);
    sameKey(sourceId, key, true);
    return {
      sourceId,
      scoreboardId: registryId(f.scoreboard_id),
      policyType: registryType(f.policy_type, "policy_type"),
      sourceType: registryType(f.source_type, "source_type"),
      label: registryText(f.label, "label", REGISTRY_V2_LIMITS.labelBytes),
      archived: registryBool(f.archived, "archived"),
      revision: revision(f),
      marketIds: table(f.market_ids, "market_ids"),
    };
  });
}
async function readMarketSources(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistryMarketSource[]> {
  return (await readRegistryTable(reader, root.marketSources)).map((row) => {
    const { key, fields: f } = record(
      row,
      root,
      "MarketPointSource",
      `${root.packageId}::market_registry::MarketSourceKey`,
    );
    const k = registryFields(key, "MarketSourceKey");
    const marketId = registryId(f.market_id);
    const sourceId = registryId(f.source_id);
    if (
      marketId !== registryId(k.market_id) ||
      sourceId !== registryId(k.source_id)
    )
      throw new Error("Registry association key mismatch.");
    return {
      marketId,
      sourceId,
      lpPointStateId: optionalId(f.lp_point_state_id, "lp_point_state_id"),
      ytEnabled: registryBool(f.yt_enabled, "yt_enabled"),
      lpEnabled: registryBool(f.lp_enabled, "lp_enabled"),
      archived: registryBool(f.archived, "archived"),
      revision: revision(f),
    };
  });
}
async function readExtensions(
  reader: RegistryReader,
  root: RegistryRoot,
): Promise<RegistryExtension[]> {
  return (await readRegistryTable(reader, root.extensions)).map((row) => {
    const type = registryType(row.type, "extension");
    const f = registryFields(row.fields);
    const module = `${root.packageId}::market_registry::`;
    if (
      type ===
      registryType(
        `0x2::dynamic_field::Field<${module}OrderbookKey,${module}OrderbookLinks>`,
        "extension",
      )
    ) {
      const key = registryFields(f.name, "extension key"),
        value = registryFields(f.value, "extension value");
      const marketId = registryId(key.market_id);
      return {
        kind: "orderbooks",
        marketId,
        ptOrderbookId: optionalId(value.pt_orderbook_id, "pt_orderbook_id"),
        ytOrderbookId: optionalId(value.yt_orderbook_id, "yt_orderbook_id"),
        revision: revision(value),
      };
    }
    if (
      type ===
      registryType(
        `0x2::dynamic_field::Field<${module}PointTradingKey,${module}PointTradingLink>`,
        "extension",
      )
    ) {
      const key = registryFields(f.name, "extension key"),
        value = registryFields(f.value, "extension value");
      const scoreboardId = registryId(value.scoreboard_id);
      if (scoreboardId !== registryId(key.scoreboard_id))
        throw new Error("Point Trading key mismatch.");
      return {
        kind: "pointTrading",
        scoreboardId,
        pointTokenMarketId: registryId(value.point_token_market_id),
        orderbookId: optionalId(value.orderbook_id, "orderbook_id"),
        revision: revision(value),
      };
    }
    const payloadTypes = ["ScallopBinding", "HaedalBinding", "EmberBinding"];
    for (const payload of payloadTypes) {
      const payloadType = `${module}${payload}`;
      if (
        type !==
        registryType(
          `0x2::dynamic_field::Field<${module}AdapterKey<${payloadType}>,${module}AdapterBinding<${payloadType}>>`,
          "extension",
        )
      )
        continue;
      const key = registryFields(f.name, "extension key"),
        value = registryFields(f.value, "extension value");
      const marketId = registryId(value.market_id);
      if (marketId !== registryId(key.market_id))
        throw new Error("Adapter key mismatch.");
      return {
        kind: "adapter",
        payloadType,
        marketId,
        adapterType: registryType(value.adapter_type, "adapter_type"),
        vaultId: registryId(value.vault_id),
        revision: revision(value),
        payload: registryFields(value.payload, "payload"),
      };
    }
    return {
      kind: "unsupported",
      fieldType: type,
      fieldId: registryId(row.objectId),
    };
  });
}

async function stable<T>(
  reader: RegistryReader,
  registryObjectId: string,
  read: (root: RegistryRoot) => Promise<T>,
): Promise<T> {
  const before = await readRegistryRoot(reader, registryObjectId);
  const result = await read(before);
  const after = await readRegistryRoot(
    reader,
    registryObjectId,
    before.packageId,
  );
  if (JSON.stringify(before) !== JSON.stringify(after))
    throw new Error("Registry changed during pagination; retry discovery.");
  return result;
}
export const listRegistryProtocols = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readProtocols(reader, root));
export const listRegistrySeries = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readSeries(reader, root));
export const listRegistryMarkets = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readMarkets(reader, root));
export const listRegistryPrograms = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readPrograms(reader, root));
export const listRegistrySources = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readSources(reader, root));
export const listRegistryMarketSources = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readMarketSources(reader, root));
export const listRegistryExtensions = (reader: RegistryReader, id: string) =>
  stable(reader, id, (root) => readExtensions(reader, root));

export async function discoverJitterRegistry(
  reader: RegistryReader,
  id: string,
): Promise<RegistrySnapshot> {
  return stable(reader, id, async (root) => {
    // Bounded parallel collections: at most two 50-object pages in flight.
    const [protocols, series] = await Promise.all([readProtocols(reader, root), readSeries(reader, root)]);
    const [markets, programs] = await Promise.all([readMarkets(reader, root), readPrograms(reader, root)]);
    const [sources, marketSources] = await Promise.all([readSources(reader, root), readMarketSources(reader, root)]);
    const extensions = await readExtensions(reader, root);
    const protocolIds = new Set(protocols.map((p) => p.protocolId));
    const seriesById = new Map(series.map((s) => [s.seriesId, s]));
    const marketById = new Map(markets.map((m) => [m.marketId, m]));
    const programById = new Map(programs.map((p) => [p.scoreboardId, p]));
    const sourceById = new Map(sources.map((s) => [s.sourceId, s]));
    for (const s of series) {
      if (!protocolIds.has(s.protocolId))
        throw new Error("Missing Registry Protocol parent.");
      if (
        s.defaultMarketId &&
        marketById.get(s.defaultMarketId)?.seriesId !== s.seriesId
      )
        throw new Error("Registry default market belongs to another Series.");
    }
    for (const m of markets)
      if (!seriesById.has(m.seriesId))
        throw new Error("Missing Registry Series parent.");
    for (const p of programs)
      if (p.protocolId !== null && !protocolIds.has(p.protocolId))
        throw new Error("Missing Program Protocol parent.");
    for (const s of sources)
      if (!programById.has(s.scoreboardId))
        throw new Error("Missing Source Scoreboard parent.");
    const pairs = new Set<string>();
    for (const a of marketSources) {
      if (!marketById.has(a.marketId) || !sourceById.has(a.sourceId))
        throw new Error("Dangling Registry market/source association.");
      const key = a.marketId + a.sourceId;
      if (pairs.has(key))
        throw new Error("Duplicate Registry market/source association.");
      pairs.add(key);
      if (
        !(a.ytEnabled || a.lpEnabled) ||
        a.lpEnabled !== (a.lpPointStateId !== null)
      )
        throw new Error("Invalid Registry source scopes/lp_point_state_id.");
    }
    return {
      root,
      protocols,
      series,
      markets,
      programs,
      sources,
      marketSources,
      extensions,
    };
  });
}
