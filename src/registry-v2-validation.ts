import { parseStructTag } from "@mysten/sui/utils";
import { reviewedAdapterOriginalPackageId } from "./lp-deployment.js";
import {
  registryFields as fields,
  registryId as id,
  registryType as type,
  registryU64 as u64,
  type RegistryReader,
  type RegistryRoot,
  type RegistryMarket,
  type RegistrySeries,
  type RegistryAdapterBinding,
  type RegistryProgram,
  type RegistrySource,
  type RegistryPointTrading,
  type RegistryMarketSource,
  type RegistryOrderbooks,
} from "./registry-v2.js";

function optionId(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === "string") return id(value);
  const array = Array.isArray(value) ? value : fields(value, "Option<ID>").vec;
  if (!Array.isArray(array) || array.length > 1)
    throw new Error("Invalid Option<ID>.");
  return array.length ? id(array[0]) : null;
}
async function object(
  reader: RegistryReader,
  objectId: string,
  expectedType: string,
) {
  if (!reader.getObjectInfo)
    throw new Error("Typed object reader is required.");
  const o = await reader.getObjectInfo(id(objectId));
  if (
    id(o.objectId) !== id(objectId) ||
    type(o.type, "object") !== type(expectedType, "expected object")
  )
    throw new Error(
      `Registry descriptor object type/ID mismatch: ${objectId}.`,
    );
  const owner = fields(o.owner, "owner");
  if (owner.$kind !== "Shared")
    throw new Error("Registry executable descriptor requires Shared Objects.");
  const f = fields(o.fields);
  if (f.id !== undefined && id(f.id) !== id(objectId))
    throw new Error("Registry descriptor UID mismatch.");
  return f;
}
function equalId(actual: unknown, expected: string, label: string) {
  if (id(actual, label) !== id(expected))
    throw new Error(`Registry ${label} mismatch.`);
}
function equalType(actual: unknown, expected: string, label: string) {
  if (type(actual, label) !== type(expected, label))
    throw new Error(`Registry ${label} mismatch.`);
}

export type ValidatedRegistryAdapter = {
  kind: "scallop" | "haedal" | "ember";
  marketId: string;
  vaultId: string;
  adapterType: string;
  upstreamIds: Record<string, string>;
};
export async function validateRegistryAdapter(
  reader: RegistryReader,
  input: {
    root: RegistryRoot;
    market: RegistryMarket;
    series: RegistrySeries;
    binding: RegistryAdapterBinding;
    corePackageId: string;
    adapterPackageId: string;
    upstreamTypes: {
      scallopMarket?: string;
      scallopVersion?: string;
      haedalStaking?: string;
      emberVault?: string;
    };
    expectedReceiptType?: string;
  },
): Promise<ValidatedRegistryAdapter> {
  const { root, market: m, series: s, binding: b } = input;
  const core = id(input.corePackageId);
  equalId(b.marketId, m.marketId, "adapter Market");
  const payloadModule = `${id(root.packageId)}::market_registry::`;
  const kind =
    b.payloadType === `${payloadModule}ScallopBinding`
      ? "scallop"
      : b.payloadType === `${payloadModule}HaedalBinding`
        ? "haedal"
        : b.payloadType === `${payloadModule}EmberBinding`
          ? "ember"
          : null;
  if (!kind) throw new Error("Unsupported typed adapter descriptor.");
  const adapter = id(reviewedAdapterOriginalPackageId(kind, input.adapterPackageId));
  const sign = `${adapter}::sign::${kind.toUpperCase()}`;
  equalType(b.adapterType, sign, "adapter sign");
  const state = await object(reader, root.syStateId, `${core}::sy::SyState`);
  const entries = fields(state.sy_info, "sy_info").contents;
  if (!Array.isArray(entries))
    throw new Error("Missing canonical SyState bindings.");
  const matches = entries
    .map((e) => fields(e))
    .filter((e) => type(e.key, "sy_info key") === type(m.syType, "SY"));
  if (matches.length !== 1)
    throw new Error("Missing/duplicate canonical SY binding.");
  const info = fields(matches[0]!.value, "SyInfo");
  equalType(info.underlying_type, s.underlyingType, "underlying");
  equalType(info.sign_type, sign, "SyState sign");
  if (
    optionId(info.market_id) !== id(m.marketId) ||
    optionId(info.vault_id) !== id(b.vaultId)
  )
    throw new Error("Canonical SyState Market/Vault mismatch.");
  const sy = type(m.syType, "SY"),
    pt = type(m.ptType, "PT"),
    yt = type(m.ytType, "YT");
  const market = await object(
    reader,
    m.marketId,
    `${core}::market::Market<${sy},${pt},${yt}>`,
  );
  if (u64(market.expiry, "expiry") !== m.expiryMs)
    throw new Error("Registry Market expiry mismatch.");
  if (input.expectedReceiptType)
    equalType(s.receiptType, input.expectedReceiptType, "receipt");
  const underlying = type(s.underlyingType, "underlying"),
    receipt = type(s.receiptType, "receipt");
  const vaultType =
    kind === "scallop"
      ? `${adapter}::scallop_market_vault::ScallopMarketVault<${underlying},${sy},${pt},${yt}>`
      : kind === "haedal"
        ? `${adapter}::haedal_market_vault::HaedalMarketVault<${sy},${pt},${yt}>`
        : `${adapter}::ember_market_vault::EmberMarketVault<${underlying},${receipt},${sy},${pt},${yt}>`;
  const vault = await object(reader, b.vaultId, vaultType);
  equalId(vault.market_id, m.marketId, "Vault Market");
  const payload = fields(b.payload, "adapter payload");
  const upstreamIds: Record<string, string> = {};
  const check = async (
    field: string,
    expectedType: string | undefined,
    vaultField?: string,
  ) => {
    if (!expectedType)
      throw new Error(`Missing trusted upstream type for ${field}.`);
    const upstreamId = id(payload[field], field);
    if (vaultField) equalId(vault[vaultField], upstreamId, `Vault ${field}`);
    await object(reader, upstreamId, expectedType);
    upstreamIds[field] = upstreamId;
  };
  if (kind === "scallop") {
    await check(
      "scallop_market_id",
      input.upstreamTypes.scallopMarket,
      "scallop_market_id",
    );
    await check("version_id", input.upstreamTypes.scallopVersion);
    const receiptTag = parseStructTag(receipt);
    if (
      receiptTag.module !== "reserve" ||
      receiptTag.name !== "MarketCoin" ||
      receiptTag.typeParams.length !== 1
    )
      throw new Error("Wrong Scallop receipt type.");
    equalType(
      receiptTag.typeParams[0],
      underlying,
      "Scallop receipt underlying",
    );
    if (!input.expectedReceiptType)
      throw new Error("Trusted Scallop receipt type is required.");
  } else if (kind === "haedal") {
    await check("staking_id", input.upstreamTypes.haedalStaking, "staking_id");
    if (!input.expectedReceiptType)
      throw new Error("Trusted Haedal receipt type is required.");
  } else
    await check(
      "ember_vault_id",
      input.upstreamTypes.emberVault,
      "ember_vault_id",
    );
  return {
    kind,
    marketId: id(m.marketId),
    vaultId: id(b.vaultId),
    adapterType: type(sign, "sign"),
    upstreamIds,
  };
}

export type RegistryPolicyExpectation = {
  policyType: string;
  stateId: string;
  generation: string;
};
export type RegistryProgramTrust = {
  liquidlinkPackageId: string;
  liquidlinkConfigPackageId: string;
  expectedConfigId: string;
  expectedPolicies: readonly RegistryPolicyExpectation[];
};
/** Current execution context only. Original claim builders retain their own historical policy records. */
export async function validateRegistryProgram(
  reader: RegistryReader,
  program: RegistryProgram,
  trust: RegistryProgramTrust,
) {
  const pkg = id(trust.liquidlinkPackageId);
  equalId(
    program.liquidlinkConfigId,
    trust.expectedConfigId,
    "LiquidLink config",
  );
  await object(
    reader,
    trust.expectedConfigId,
    `${id(trust.liquidlinkConfigPackageId)}::global_config::GlobalConfig`,
  );
  const scoreboard = await object(
    reader,
    program.scoreboardId,
    `${pkg}::scoreboard::Scoreboard`,
  );
  const project = await object(
    reader,
    program.projectObjectId,
    `${pkg}::project::Project`,
  );
  equalId(project.scoreboard_id, program.scoreboardId, "Project Scoreboard");
  equalId(
    scoreboard.project_id,
    id(project.project_id),
    "Scoreboard ProjectCap",
  );
  if (
    !Array.isArray(project.policy_registrations) ||
    !Array.isArray(project.policy_generations)
  )
    throw new Error("Missing canonical Project policies.");
  const policies = project.policy_registrations.map((raw) => {
    const p = fields(raw, "policy registration");
    return {
      policyType: type(p.policy, "policy"),
      stateId: id(p.policy_state_id),
      generation: u64(p.generation, "policy generation"),
    };
  });
  if (policies.length !== trust.expectedPolicies.length)
    throw new Error("Project policy plan is incomplete.");
  const seen = new Set<string>();
  for (let i = 0; i < policies.length; i++) {
    const p = policies[i]!,
      expected = trust.expectedPolicies[i]!;
    if (seen.has(p.policyType) || p.generation === "0")
      throw new Error("Duplicate/invalid Project policy registration.");
    seen.add(p.policyType);
    equalType(p.policyType, expected.policyType, "Project policy order");
    equalId(p.stateId, expected.stateId, "Project policy state");
    if (p.generation !== u64(expected.generation, "expected policy generation"))
      throw new Error("Project policy generation mismatch.");
    const generation = project.policy_generations
      .map((v) => fields(v))
      .filter((g) => type(g.policy, "policy generation type") === p.policyType);
    if (
      generation.length !== 1 ||
      u64(generation[0]!.generation, "retained generation") !== p.generation
    )
      throw new Error("Project policy generation ledger mismatch.");
  }
  return { pkg, projectCapId: id(project.project_id), project, policies };
}
export async function validateRegistryPointSource(
  reader: RegistryReader,
  input: RegistryProgramTrust & {
    program: RegistryProgram;
    source: RegistrySource;
    expectedSourceType: string;
    expectedAuthWitness: string;
  },
) {
  const { program, source } = input;
  equalId(source.scoreboardId, program.scoreboardId, "Source Scoreboard");
  equalType(source.sourceType, input.expectedSourceType, "source type");
  const { project } = await validateRegistryProgram(reader, program, input);
  if (!Array.isArray(project.auth_sources))
    throw new Error("Missing Project auth sources.");
  const auth = project.auth_sources
    .map((a) => fields(a))
    .filter(
      (a) =>
        id(a.source_id) === id(source.sourceId) &&
        type(a.witness, "auth witness") ===
          type(input.expectedAuthWitness, "expected auth witness"),
    );
  if (auth.length !== 1 || auth[0]!.enabled !== true)
    throw new Error("Source is not a current Project auth source.");
  equalId(auth[0]!.project_object_id, program.projectObjectId, "auth Project");
  const f = await object(reader, source.sourceId, input.expectedSourceType);
  equalId(f.project_object_id, program.projectObjectId, "source Project");
  equalId(f.scoreboard_id, program.scoreboardId, "source Scoreboard");
  const pointConfig = type(input.expectedSourceType, "source").endsWith(
    "::liquidlink_points::PointConfig",
  );
  return {
    sourceId: id(source.sourceId),
    projectObjectId: id(program.projectObjectId),
    scoreboardId: id(program.scoreboardId),
    ytMultiplierBps: pointConfig
      ? u64(f.yt_multiplier_bps, "yt_multiplier_bps")
      : null,
    lpMultiplierBps: pointConfig
      ? u64(f.lp_multiplier_bps, "lp_multiplier_bps")
      : null,
    durationMs: pointConfig ? u64(f.duration, "duration") : null,
  };
}
export async function validateRegistryPointTrading(
  reader: RegistryReader,
  input: RegistryProgramTrust & {
    program: RegistryProgram;
    link: RegistryPointTrading;
    expectedQuoteType: string;
  },
) {
  const { program, link } = input;
  equalId(link.scoreboardId, program.scoreboardId, "Point Trading Scoreboard");
  const { pkg, projectCapId, policies } = await validateRegistryProgram(
    reader,
    program,
    input,
  );
  if (!reader.getObjectInfo)
    throw new Error("Typed object reader is required.");
  const tokenObject = await reader.getObjectInfo(link.pointTokenMarketId);
  const tag = parseStructTag(type(tokenObject.type, "PointTokenMarket"));
  if (
    id(tag.address) !== pkg ||
    tag.module !== "token" ||
    tag.name !== "PointTokenMarket" ||
    tag.typeParams.length !== 1
  )
    throw new Error(
      "Wrong PointTokenMarket type; base must tokenize Token<T>.",
    );
  const tokenType = type(tag.typeParams[0], "point token");
  const token = await object(
    reader,
    link.pointTokenMarketId,
    `${pkg}::token::PointTokenMarket<${tokenType}>`,
  );
  equalId(token.scoreboard_id, program.scoreboardId, "token market Scoreboard");
  equalId(token.project_id, projectCapId, "token market ProjectCap");
  const scale = u64(token.scale, "scale");
  if (scale === "0") throw new Error("Point token scale must be positive.");
  if (link.orderbookId === null)
    return {
      tokenType,
      quoteType: null,
      scale,
      baseDecimals: null,
      quoteDecimals: null,
      policies,
    };
  const quoteType = type(input.expectedQuoteType, "trusted quote");
  const orderbook = await object(
    reader,
    link.orderbookId,
    `${pkg}::orderbook::OrderBook<${tokenType},${quoteType}>`,
  );
  const baseDecimals = Number(u64(orderbook.decimals_t, "base decimals")),
    quoteDecimals = Number(u64(orderbook.decimals_t1, "quote decimals"));
  if (baseDecimals > 255 || quoteDecimals > 255)
    throw new Error("Invalid token decimals.");
  return { tokenType, quoteType, scale, baseDecimals, quoteDecimals, policies };
}

export async function validateRegistryLpSource(
  reader: RegistryReader,
  input: {
    association: RegistryMarketSource;
    source: RegistrySource;
    market: RegistryMarket;
    extensionsPackageId: string;
  },
) {
  const { association: a, source: s, market: m } = input;
  equalId(a.marketId, m.marketId, "LP association Market");
  equalId(a.sourceId, s.sourceId, "LP association source");
  if (!a.lpEnabled || a.lpPointStateId === null)
    throw new Error("LP association is not configured.");
  const state = await object(
    reader,
    a.lpPointStateId,
    `${id(input.extensionsPackageId)}::liquidlink_points::LpPointState<${type(m.syType, "SY")}>`,
  );
  equalId(state.point_config_id, s.sourceId, "LP PointConfig");
  equalId(state.pool_id, m.marketId, "LP pool Market");
  if (state.initialized !== true)
    throw new Error("LP point state is not initialized.");
  // Both UIDs are required; a descriptor cannot claim a one-sided LP/pool topology.
  const lpRewarderId = id(state.lp_rewarder_uid),
    poolRewarderId = id(state.pool_rewarder_uid);
  if (lpRewarderId === poolRewarderId)
    throw new Error("LP/pool rewarder identities must be distinct.");
  return {
    lpPointStateId: id(a.lpPointStateId),
    pointConfigId: id(s.sourceId),
    marketId: id(m.marketId),
    lpRewarderId,
    poolRewarderId,
  };
}

export async function validateRegistryOrderbooks(
  reader: RegistryReader,
  input: {
    market: RegistryMarket;
    links: RegistryOrderbooks;
    orderbookPackageId: string;
    expectedQuoteType: string;
  },
) {
  const { market: m, links } = input;
  equalId(links.marketId, m.marketId, "Orderbook Market");
  const pkg = id(input.orderbookPackageId),
    quote = type(input.expectedQuoteType, "Orderbook quote");
  for (const [bookId, base, kind] of [
    [links.ptOrderbookId, m.ptType, 0],
    [links.ytOrderbookId, m.ytType, 1],
  ] as const) {
    if (bookId === null) continue;
    const book = await object(
      reader,
      bookId,
      `${pkg}::orderbook::OrderBook<${quote},${type(base, "Orderbook base")}>`,
    );
    equalId(book.market_id, m.marketId, "Orderbook Market");
    if (
      u64(book.market_expiry_ms, "Orderbook expiry") !== m.expiryMs ||
      u64(book.base_kind, "Orderbook base kind") !== String(kind)
    )
      throw new Error("Orderbook expiry/base kind mismatch.");
  }
  return {
    marketId: id(m.marketId),
    ptOrderbookId: links.ptOrderbookId,
    ytOrderbookId: links.ytOrderbookId,
  };
}
