import type {
  Transaction,
  TransactionArgument,
  TransactionResult,
} from "@mysten/sui/transactions";
import {
  registryId,
  registryType,
  registryU64,
  REGISTRY_V2_LIMITS,
  type RegistryProtocolMetadata,
  type RegistrySeriesMetadata,
  type RegistryMarketMetadata,
  type RegistryProgramMetadata,
} from "./registry-v2.js";

type ObjectInput = string | TransactionArgument;
type Authority = {
  registry: ObjectInput;
  config: ObjectInput;
  admin: ObjectInput;
};
type MarketTypes = { syType: string; ptType: string; ytType: string };
type Revision = { expectedRevision: string | bigint };
function validateScopes(yt: boolean, lp: boolean, lpState: string | null) {
  if (!(yt || lp) || lp !== (lpState !== null))
    throw new Error("Invalid Registry source scopes/LP state.");
}
export type RegistryAdapterPayload =
  | { kind: "scallop"; scallopMarketId: string; versionId: string }
  | { kind: "haedal"; stakingId: string }
  | { kind: "ember"; emberVaultId: string };
const encoder = new TextEncoder();
function text(
  value: string,
  label: string,
  max: number,
  required = false,
): number[] {
  if (typeof value !== "string" || /\p{Cc}/u.test(value))
    throw new Error(`Invalid ${label}.`);
  const bytes = encoder.encode(value);
  if (bytes.length > max || (required && !value.trim()))
    throw new Error(`Invalid ${label} byte length.`);
  return Array.from(bytes);
}
function uri(value: string, label: string): number[] {
  const bytes = text(value, label, REGISTRY_V2_LIMITS.uriBytes);
  if (
    value &&
    !/^https:\/\/[^\s]+$|^ipfs:\/\/[^\s]+$|^ar:\/\/[^\s]+$/.test(value)
  )
    throw new Error(`Unsafe ${label}.`);
  return bytes;
}
function metadataValues(
  kind: "protocol" | "series" | "market" | "program",
  metadata:
    | RegistryProtocolMetadata
    | RegistrySeriesMetadata
    | RegistryMarketMetadata
    | RegistryProgramMetadata,
): number[][] {
  const m = metadata as unknown as Record<string, string>;
  const common = {
    name: () =>
      text(m.name!, "name", REGISTRY_V2_LIMITS.labelBytes, kind !== "market"),
    description: () =>
      text(m.description!, "description", REGISTRY_V2_LIMITS.descriptionBytes),
    iconUri: () => uri(m.iconUri!, "icon URI"),
    metadataUri: () => uri(m.metadataUri!, "metadata URI"),
  };
  if (kind === "protocol") {
    if (m.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug))
      throw new Error("Invalid protocol slug.");
    return [
      common.name(),
      text(m.slug!, "slug", 64, true),
      common.description(),
      common.iconUri(),
      uri(m.websiteUri!, "website URI"),
      uri(m.docsUri!, "docs URI"),
      common.metadataUri(),
    ];
  }
  if (kind === "series")
    return [
      common.name(),
      text(m.symbol!, "symbol", 64, true),
      common.description(),
      common.iconUri(),
      text(m.category!, "category", 64),
      common.metadataUri(),
    ];
  if (kind === "program")
    return [
      common.name(),
      text(m.season!, "season", 64),
      common.description(),
      common.iconUri(),
      common.metadataUri(),
    ];
  return [
    common.name(),
    common.description(),
    common.iconUri(),
    common.metadataUri(),
  ];
}
export function createSharedRegistry(
  tx: Transaction,
  packageId: string,
  input: { config: ObjectInput; admin: ObjectInput; syState: ObjectInput },
): TransactionResult {
  const object = (v: ObjectInput) =>
    typeof v === "string" ? tx.object(registryId(v)) : v;
  return tx.moveCall({
    target: `${registryId(packageId)}::market_registry::create_shared`,
    arguments: [
      object(input.config),
      object(input.admin),
      object(input.syState),
    ],
  });
}

/** Composable primitives only: callers still simulate, sign and reconcile results. */
export function createRegistryV2Builder(
  tx: Transaction,
  packageId: string,
  authority: Authority,
) {
  const pkg = registryId(packageId);
  const object = (v: ObjectInput) =>
    typeof v === "string" ? tx.object(registryId(v)) : v;
  const u64 = (v: string | bigint) => tx.pure.u64(registryU64(v, "u64"));
  const id = (v: string) => tx.pure.id(registryId(v));
  const optionalId = (v: string | null) =>
    tx.pure.option("address", v === null ? null : registryId(v));
  const types = (m: MarketTypes) => [
    registryType(m.syType, "SY"),
    registryType(m.ptType, "PT"),
    registryType(m.ytType, "YT"),
  ];
  const call = (
    name: string,
    args: TransactionArgument[],
    typeArguments: string[] = [],
  ) =>
    tx.moveCall({
      target: `${pkg}::market_registry::${name}`,
      arguments: [
        object(authority.registry),
        object(authority.config),
        object(authority.admin),
        ...args,
      ],
      typeArguments,
    });
  const metadata = (
    kind: "protocol" | "series" | "market" | "program",
    m:
      | RegistryProtocolMetadata
      | RegistrySeriesMetadata
      | RegistryMarketMetadata
      | RegistryProgramMetadata,
  ) => {
    const values = metadataValues(kind, m);
    return tx.moveCall({
      target: `${pkg}::market_registry::${kind}_metadata`,
      arguments: values.map((v) => tx.pure.vector("u8", v)),
    });
  };
  return {
    protocolMetadata: (m: RegistryProtocolMetadata) => metadata("protocol", m),
    seriesMetadata: (m: RegistrySeriesMetadata) => metadata("series", m),
    marketMetadata: (m: RegistryMarketMetadata) => metadata("market", m),
    programMetadata: (m: RegistryProgramMetadata) => metadata("program", m),
    registerProtocol: (m: RegistryProtocolMetadata) => {
      const value = metadata("protocol", m);
      return call("register_protocol", [value]);
    },
    registerSeries: (a: {
      protocolId: string;
      underlyingType: string;
      receiptType: string;
      metadata: RegistrySeriesMetadata;
    }) => {
      const args = [u64(a.protocolId)];
      const typeArgs = [
        registryType(a.underlyingType, "underlying"),
        registryType(a.receiptType, "receipt"),
      ];
      const value = metadata("series", a.metadata);
      return call("register_series", [...args, value], typeArgs);
    },
    registerMarket: (
      a: MarketTypes & {
        syState: ObjectInput;
        market: ObjectInput;
        seriesId: string;
        metadata: RegistryMarketMetadata;
      },
    ) => {
      const typeArgs = types(a);
      const args = [object(a.syState), u64(a.seriesId), object(a.market)];
      const value = metadata("market", a.metadata);
      return call("register_market", [...args, value], typeArgs);
    },
    registerProgram: (a: {
      scoreboardId: string;
      projectObjectId: string;
      liquidlinkConfigId: string;
      protocolId: string | null;
      metadata: RegistryProgramMetadata;
    }) => {
      const args = [
        id(a.scoreboardId),
        id(a.projectObjectId),
        id(a.liquidlinkConfigId),
        tx.pure.option(
          "u64",
          a.protocolId === null
            ? null
            : registryU64(a.protocolId, "protocol_id"),
        ),
      ];
      const value = metadata("program", a.metadata);
      return call("register_program", [...args, value]);
    },
    registerSource: (a: {
      scoreboardId: string;
      source: ObjectInput;
      sourceType: string;
      policyType: string;
      label: string;
    }) =>
      call(
        "register_source",
        [
          id(a.scoreboardId),
          object(a.source),
          tx.pure.vector("u8", text(a.label, "label", 64, true)),
        ],
        [
          registryType(a.sourceType, "Source"),
          registryType(a.policyType, "Policy"),
        ],
      ),
    attachSource: (a: {
      marketId: string;
      sourceId: string;
      lpPointStateId: string | null;
      ytEnabled: boolean;
      lpEnabled: boolean;
    }) => {
      validateScopes(a.ytEnabled, a.lpEnabled, a.lpPointStateId);
      return call("attach_source", [
        id(a.marketId),
        id(a.sourceId),
        optionalId(a.lpPointStateId),
        tx.pure.bool(a.ytEnabled),
        tx.pure.bool(a.lpEnabled),
      ]);
    },
    updateMarketSource: (
      a: Revision & {
        marketId: string;
        sourceId: string;
        lpPointStateId: string | null;
        ytEnabled: boolean;
        lpEnabled: boolean;
      },
    ) => {
      validateScopes(a.ytEnabled, a.lpEnabled, a.lpPointStateId);
      return call("update_market_source", [
        id(a.marketId),
        id(a.sourceId),
        u64(a.expectedRevision),
        optionalId(a.lpPointStateId),
        tx.pure.bool(a.ytEnabled),
        tx.pure.bool(a.lpEnabled),
      ]);
    },
    updateProtocol: (
      a: Revision & { protocolId: string; metadata: RegistryProtocolMetadata },
    ) => {
      const args = [u64(a.protocolId), u64(a.expectedRevision)];
      const value = metadata("protocol", a.metadata);
      return call("update_protocol", [...args, value]);
    },
    updateSeries: (
      a: Revision & { seriesId: string; metadata: RegistrySeriesMetadata },
    ) => {
      const args = [u64(a.seriesId), u64(a.expectedRevision)];
      const value = metadata("series", a.metadata);
      return call("update_series", [...args, value]);
    },
    updateMarket: (
      a: Revision & { marketId: string; metadata: RegistryMarketMetadata },
    ) => {
      const args = [id(a.marketId), u64(a.expectedRevision)];
      const value = metadata("market", a.metadata);
      return call("update_market", [...args, value]);
    },
    updateProgram: (
      a: Revision & { scoreboardId: string; metadata: RegistryProgramMetadata },
    ) => {
      const args = [id(a.scoreboardId), u64(a.expectedRevision)];
      const value = metadata("program", a.metadata);
      return call("update_program", [...args, value]);
    },
    setProtocolListing: (
      a: Revision & {
        protocolId: string;
        listed: boolean;
        displayRank: string;
      },
    ) =>
      call("set_protocol_listing", [
        u64(a.protocolId),
        u64(a.expectedRevision),
        tx.pure.bool(a.listed),
        u64(a.displayRank),
      ]),
    setSeriesListing: (
      a: Revision & { seriesId: string; listed: boolean; displayRank: string },
    ) =>
      call("set_series_listing", [
        u64(a.seriesId),
        u64(a.expectedRevision),
        tx.pure.bool(a.listed),
        u64(a.displayRank),
      ]),
    setMarketListing: (
      a: Revision & { marketId: string; listed: boolean; displayRank: string },
    ) =>
      call("set_market_listing", [
        id(a.marketId),
        u64(a.expectedRevision),
        tx.pure.bool(a.listed),
        u64(a.displayRank),
      ]),
    setProgramListing: (
      a: Revision & { scoreboardId: string; listed: boolean },
    ) =>
      call("set_program_listing", [
        id(a.scoreboardId),
        u64(a.expectedRevision),
        tx.pure.bool(a.listed),
      ]),
    setDefaultMarket: (
      a: Revision & { seriesId: string; marketId: string | null },
    ) =>
      call("set_default_market", [
        u64(a.seriesId),
        u64(a.expectedRevision),
        optionalId(a.marketId),
      ]),
    archiveSource: (a: Revision & { sourceId: string; archived: boolean }) =>
      call("archive_source", [
        id(a.sourceId),
        u64(a.expectedRevision),
        tx.pure.bool(a.archived),
      ]),
    archiveMarketSource: (
      a: Revision & { marketId: string; sourceId: string; archived: boolean },
    ) =>
      call("archive_market_source", [
        id(a.marketId),
        id(a.sourceId),
        u64(a.expectedRevision),
        tx.pure.bool(a.archived),
      ]),
    setOrderbooks: (
      a: Revision & {
        marketId: string;
        ptOrderbookId: string | null;
        ytOrderbookId: string | null;
      },
    ) =>
      call("set_orderbooks", [
        id(a.marketId),
        u64(a.expectedRevision),
        optionalId(a.ptOrderbookId),
        optionalId(a.ytOrderbookId),
      ]),
    setPointTrading: (
      a: Revision & {
        scoreboardId: string;
        pointTokenMarketId: string;
        orderbookId: string | null;
      },
    ) =>
      call("set_point_trading", [
        id(a.scoreboardId),
        u64(a.expectedRevision),
        id(a.pointTokenMarketId),
        optionalId(a.orderbookId),
      ]),
    setAdapterBinding: (
      a: MarketTypes &
        Revision & {
          syState: ObjectInput;
          market: ObjectInput;
          adapterType: string;
          vaultId: string;
          binding: RegistryAdapterPayload;
        },
    ) => {
      const b = a.binding;
      const suffix =
        b.kind === "scallop"
          ? "ScallopBinding"
          : b.kind === "haedal"
            ? "HaedalBinding"
            : "EmberBinding";
      const typeArgs = [
        ...types(a),
        registryType(a.adapterType, "Adapter"),
        `${pkg}::market_registry::${suffix}`,
      ];
      const args = [
        object(a.syState),
        object(a.market),
        u64(a.expectedRevision),
        id(a.vaultId),
      ];
      const payload =
        b.kind === "scallop"
          ? tx.moveCall({
              target: `${pkg}::market_registry::scallop_binding`,
              arguments: [id(b.scallopMarketId), id(b.versionId)],
            })
          : b.kind === "haedal"
            ? tx.moveCall({
                target: `${pkg}::market_registry::haedal_binding`,
                arguments: [id(b.stakingId)],
              })
            : tx.moveCall({
                target: `${pkg}::market_registry::ember_binding`,
                arguments: [id(b.emberVaultId)],
              });
      return call("set_adapter_binding", [...args, payload], typeArgs);
    },
  };
}
