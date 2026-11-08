import type {
  ChainObjectInfo,
  DynamicFieldPage,
  DynamicFieldObjectQuery,
} from "../ports/chain-reader.js";

export const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
export const pkg = id(900);
export const bytes = (value: string) =>
  Array.from(new TextEncoder().encode(value));
const table = (n: number, size = 0) => ({ id: id(n), size: String(size) });
const metadata = (entries: Record<string, string>) =>
  Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, bytes(v)]));
export function registryFixture(count = 1) {
  const root = {
    id: id(1),
    config_id: id(2),
    admin_cap_id: id(3),
    sy_state_id: id(4),
    schema_version: "1",
    next_protocol_id: "2",
    next_series_id: "2",
    protocols: table(10, 1),
    series: table(11, 1),
    markets: table(12, count),
    programs: table(13),
    sources: table(14),
    market_sources: table(15),
    extensions: table(16),
  };
  const rows = new Map<string, ChainObjectInfo<unknown>[]>();
  const field = (
    n: number,
    keyType: string,
    valueType: string,
    name: unknown,
    value: unknown,
  ): ChainObjectInfo<unknown> => ({
    objectId: id(n),
    type: `0x2::dynamic_field::Field<${keyType},${pkg}::market_registry::${valueType}>`,
    version: "1",
    owner: {
      $kind: "ObjectOwner",
      ObjectOwner: id(
        (
          {
            Protocol: 10,
            Series: 11,
            MarketRecord: 12,
            PointProgram: 13,
            PointSource: 14,
            MarketPointSource: 15,
          } as Record<string, number>
        )[valueType] ?? 16,
      ),
    },
    fields: { name, value },
  });
  rows.set(id(10), [
    field(20, "u64", "Protocol", "1", {
      protocol_id: "1",
      metadata: metadata({
        name: "Scallop",
        slug: "scallop",
        description: "Protocol",
        icon_uri: "https://example.com/scallop.png",
        website_uri: "https://scallop.io",
        docs_uri: "",
        metadata_uri: "",
      }),
      listed: true,
      display_rank: "0",
      revision: "1",
      series_ids: table(30, 1),
    }),
  ]);
  rows.set(id(11), [
    field(21, "u64", "Series", "1", {
      series_id: "1",
      protocol_id: "1",
      underlying_type: { name: "0x2::sui::SUI" },
      receipt_type: { name: `${pkg}::receipt::RECEIPT` },
      metadata: metadata({
        name: "Scallop sSUI",
        symbol: "sSUI",
        description: "Series",
        icon_uri: "https://example.com/ssui.png",
        category: "Lending",
        metadata_uri: "",
      }),
      default_market_id: { vec: count ? [id(100)] : [] },
      listed: true,
      display_rank: "0",
      revision: "1",
      market_ids: table(31, count),
    }),
  ]);
  rows.set(
    id(12),
    Array.from({ length: count }, (_, i) =>
      field(20000 + i, "0x2::object::ID", "MarketRecord", id(100 + i), {
        market_id: id(100 + i),
        series_id: "1",
        expiry_ms: "1800057600000",
        sy_type: { name: `${pkg}::sy::SY` },
        pt_type: { name: `${pkg}::pt::PT` },
        yt_type: { name: `${pkg}::yt::YT` },
        metadata: metadata({
          name: "",
          description: "",
          icon_uri: "",
          metadata_uri: "",
        }),
        listed: true,
        display_rank: "0",
        revision: "1",
        source_ids: table(50000 + i),
      }),
    ),
  );
  for (const n of [13, 14, 15, 16]) rows.set(id(n), []);
  let version = "1";
  const queries: DynamicFieldObjectQuery[] = [];
  const reader = {
    async getObjectInfo<T>(objectId: string): Promise<ChainObjectInfo<T>> {
      if (objectId !== id(1))
        throw new Error(`Object unavailable: ${objectId}`);
      return {
        objectId,
        type: `${pkg}::market_registry::Registry`,
        version,
        owner: { $kind: "Shared", Shared: { initialSharedVersion: "1" } },
        fields: structuredClone(root) as T,
      };
    },
    async getDynamicFieldPage<T>(
      query: DynamicFieldObjectQuery,
    ): Promise<DynamicFieldPage<T>> {
      queries.push(query);
      const all = rows.get(query.parentId);
      if (!all) throw new Error("Wrong Table UID");
      const start = query.cursor ? Number(query.cursor) : 0;
      const data = all.slice(start, start + (query.limit ?? 50));
      const end = start + data.length;
      return {
        data: structuredClone(data) as ChainObjectInfo<T>[],
        hasNextPage: end < all.length,
        nextCursor: end < all.length ? String(end) : null,
      };
    },
    async getObject<T>(): Promise<T> {
      throw new Error("Use typed reads");
    },
  };
  return {
    reader,
    root,
    rows,
    queries,
    field,
    setVersion(value: string) {
      version = value;
    },
  };
}
