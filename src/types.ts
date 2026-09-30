/**
 * @jitter/sdk — types.ts
 */

import {
  DEMO_ADAPTER_PACKAGE_ID,
  DEMO_MARKET_OBJECT_ID,
  DEMO_MARKET_VAULT_OBJECT_ID,
  DEMO_ORDERBOOK_OBJECT_ID,
  DEMO_POOL_OBJECT_ID,
  DEMO_PRICE_AGGREGATOR_OBJECT_ID,
  DEMO_PT_TYPE_TAG,
  DEMO_PY_STATE_OBJECT_ID,
  DEMO_SY_TYPE_TAG,
  DEMO_UNDERLYING_TYPE_TAG,
  DEMO_YT_ORDERBOOK_OBJECT_ID,
  DEMO_YT_TYPE_TAG,
  JITTER_ACL_OBJECT_ID,
  JITTER_EXTENSIONS_PACKAGE_ID,
  JITTER_FRAMEWORK_PACKAGE_ID,
  JITTER_ORACLE_PACKAGE_ID,
  JITTER_PACKAGE_ID,
  JITTER_SY_STATE_OBJECT_ID,
  SCALLOP_ADAPTER_PACKAGE_ID,
  SCALLOP_MARKET_COIN_TYPE_TAG,
  SCALLOP_MARKET_OBJECT_ID,
  SCALLOP_MARKET_VAULT_OBJECT_ID,
  SCALLOP_PROTOCOL_PACKAGE_ID,
  SCALLOP_VERSION_OBJECT_ID,
} from "./constants.js";
import {
  getDefaultJitterMarketConfig,
  type JitterConfigNetworkInput,
} from "./config.js";

// ---------------------------------------------------------------------------
// Market configuration
// ---------------------------------------------------------------------------

export type JitterMarketConfig = {
  /**
   * Package id used for current Move calls. After Sui package upgrades this is
   * the latest published package id, not necessarily the package id embedded in
   * existing object types.
   */
  jitterPackageId: string;
  /** Root package that owns Jitter AdminCap and the shared GlobalConfig. */
  jitterConfigPackageId?: string;
  /**
   * Original package id that defines long-lived Jitter object types such as
   * jitter_position::JitterPosition. Owned-object StructType filters must use
   * this id after package upgrades.
   */
  jitterOriginalPackageId?: string;
  /** Replaceable read-only quote/snapshot package. Core `jitter` no longer exposes offchain quote helpers. */
  jitterViewPackageId?: string;
  jitterRegistryPackageId?: string;
  jitterFrameworkPackageId?: string;
  jitterExtensionsPackageId?: string;
  demoAdapterPackageId: string;
  scallopAdapterPackageId?: string;
  scallopProtocolPackageId?: string;
  emberAdapterPackageId?: string;
  emberVaultsPackageId?: string;
  suilendAdapterPackageId?: string;
  naviAdapterPackageId?: string;
  oraclePackageId: string;

  syStateObjectId: string;
  globalConfigObjectId?: string;
  /** @deprecated AMM/Yield params are embedded in Pool/PyState on current contracts. */
  yieldConfigObjectId?: string;
  /** @deprecated AMM/Yield params are embedded in Pool/PyState on current contracts. */
  ammConfigObjectId?: string;
  rewardDistributorObjectId?: string;
  marketRegistryObjectId?: string;
  aclObjectId: string;

  /** Unified jitter::market_state::MarketState object id. */
  marketObjectId: string;
  /** Optional explicit alias for deployments that name the unified state separately. */
  marketStateObjectId?: string;
  /** @deprecated Unified MarketState replaces the former separate PyState object. */
  pyStateObjectId: string;
  /** @deprecated Unified MarketState replaces the former separate Pool object. */
  poolObjectId: string;
  orderbookObjectId?: string | null;
  ytOrderbookObjectId?: string | null;
  priceAggregatorObjectId: string;
  demoMarketVaultObjectId: string;
  scallopMarketVaultObjectId?: string;
  scallopMarketObjectId?: string;
  scallopVersionObjectId?: string;
  emberMarketVaultObjectId?: string;
  emberVaultObjectId?: string;
  emberProtocolConfigObjectId?: string;
  suilendMarketVaultObjectId?: string;
  suilendReserveObjectId?: string;
  naviMarketVaultObjectId?: string;
  naviStorageObjectId?: string;
  naviPoolObjectId?: string;
  naviIncentiveV2ObjectId?: string;
  naviIncentiveV3ObjectId?: string;
  naviOracleObjectId?: string;
  naviSuiSystemStateObjectId?: string;
  naviAssetId?: number;
  /** Current adapter v2 (deposit-first and funded-refresh ABI). */
  currentAdapterPackageId?: string;
  currentMarketVaultObjectId?: string;
  currentProtocolAppObjectId?: string;
  currentMarketObjectId?: string;
  currentProtocolTypeTag?: string;
  currentDecimalsRegistryObjectId?: string;
  currentXOracleObjectId?: string;

  underlyingTypeTag: string;
  syTypeTag: string;
  ptTypeTag: string;
  ytTypeTag: string;
  /** Registry-backed user-facing market name. Static config is only a fallback. */
  marketName?: string;
  /** Registry-backed market symbol, for example sSUI. */
  marketSymbol?: string;
  /** Short user-facing market description. */
  marketDescription?: string;
  marketIconUri?: string;
  marketMetadataUri?: string;
  /** Adapter namespace advertised by the registry, for example scallop. */
  adapterKind?: string;
  /** Parent registry project display metadata. */
  projectName?: string;
  projectDescription?: string;
  projectIconUri?: string;
  projectWebsiteUri?: string;
  scallopMarketCoinTypeTag?: string;
  emberReceiptTypeTag?: string;
  suilendProtocolTypeTag?: string;

  /** Display/accounting decimals for user funding coin amounts. */
  underlyingDecimals?: number;
  /** Display/accounting decimals for SY/PT/YT/LP market amounts. */
  marketDecimals?: number;
  /** Optional USD price hint for one underlying unit. Used for display/portfolio valuation only. */
  underlyingPriceUsd?: number;

  /** Raw SY cap configured on the pool. "0" means disabled. */
  rawSyMarketCap?: string;
  /** Indexed asset exposure cap configured on the pool. "0" means disabled. */
  assetMarketCap?: string;

  /** Project id used to group multiple markets under one points scoreboard. */
  projectId?: string;
  /** Project-level LiquidLink points settings inherited by this market. */
  liquidlink?: JitterLiquidlinkProjectConfig;
  /** Optional no-stake coin rewards for frontend QA and reward distributor integrations. */
  coinReward?: JitterCoinRewardConfig;

  /** @deprecated Use liquidlink.pointConfigObjectId. */
  liquidlinkPointConfigObjectId?: string;
  /** @deprecated Use liquidlink.scoreboardObjectId. */
  liquidlinkScoreboardObjectId?: string;
};

export type JitterLiquidlinkProjectConfig = {
  /** Disabled or missing means this project's markets use normal Jitter calls. */
  enabled?: boolean;
  /** Published liquidlink_incentive_system package used to settle policy-complete stamps. */
  liquidlinkPackageId?: string;
  /** Independent liquidlink_config package used for version, pause, and treasury governance. */
  liquidlinkConfigPackageId?: string;
  /** Published jitter_referral package defining ReferralPolicyState and LpReferralRecord. */
  referralPackageId?: string;
  /** Exact liquidlink_incentive_system::project::Project used by the default point program. */
  projectObjectId?: string;
  /** Shared jitter_extensions::liquidlink_points::PointConfig object for the project. */
  pointConfigObjectId?: string;
  /**
   * Optional manual issuer authority. Jitter reward settlement does not use this
   * object; protocol integrations authenticate through Project witnesses.
   */
  pointCapObjectId?: string;
  /** Shared liquidlink_config::global_config::GlobalConfig object. */
  liquidlinkGlobalConfigObjectId?: string;
  /** Display hint for the Liquidlink-wide on-chain treasury recipient. */
  treasuryRecipient?: string;
  /** Shared liquidlink_incentive_system::scoreboard::Scoreboard object. */
  scoreboardObjectId?: string;
  /** Shared jitter_extensions::liquidlink_points::LpPointState object for this market pool. */
  lpPointStateObjectId?: string;
  /** Optional daily check-in campaign config. Missing means check-in is not deployed for this project. */
  checkIn?: JitterCheckInConfig;
  /** Display-only multiplier hint. On-chain source of truth is PointConfig. */
  ytMultiplierBps?: number;
  /** Display-only multiplier hint. On-chain source of truth is PointConfig. */
  lpMultiplierBps?: number;
  /** Display-only duration hint. sSUI raw-unit point configs use 86_400_000 * 1e9. */
  pointDurationMs?: string;
  /**
   * Reward programs attached to this market profile. A market may carry both
   * Jitter protocol points and one or more underlying-protocol point programs.
   * Missing means the legacy top-level PointConfig/Scoreboard fields describe
   * the only program.
   */
  pointPrograms?: JitterLiquidlinkPointProgramConfig[];
  /** Optional Liquidlink tokenized point market settings. Missing means point trading is not enabled. */
  tokenizedPoint?: JitterLiquidlinkTokenizedPointConfig;
};

export type JitterLiquidlinkPointProgramConfig = {
  /** Stable admin-facing label, for example "Jitter Season 2" or "Scallop". */
  label: string;
  /** Protocol namespace used to group programs in admin tooling. */
  protocol: string;
  /** Optional season or campaign label. */
  season?: string;
  /** Logical LiquidLink project id used for display/indexing only. */
  projectId?: string;
  /** Exact Project object bound to PointConfig and every generated stamp. */
  projectObjectId: string;
  /** Exact Scoreboard object bound into PointConfig. */
  scoreboardObjectId: string;
  /** Shared PointConfig that defines this program's emission policy. */
  pointConfigObjectId: string;
  /** Per-market LP accumulator. Required when LP and pool scopes are attached. */
  lpPointStateObjectId?: string;
  /** Whether this market should include the program in reward operations. */
  enabled?: boolean;
  /** Attached scopes recorded by deployment/admin tooling. */
  scopes?: Array<"yt" | "lp" | "pool">;
  /** Optional referral policy bound to this exact LiquidLink Project. */
  referral?: JitterLiquidlinkReferralProgramConfig;
};

export type JitterLiquidlinkReferralProgramConfig = {
  /** Shared jitter_referral::referral_policy::ReferralPolicyState for this Project. */
  policyStateObjectId: string;
  /** Shared jitter_referral::bonding_table::ReferralTable used for code bindings. */
  referralTableObjectId: string;
};

export type JitterLiquidlinkTokenizedPointConfig = {
  /** Disabled or missing means the frontend only shows score/claim surfaces. */
  enabled?: boolean;
  /** Optional Liquidlink package override for browser/admin configs. */
  packageId?: string;
  /** Published point token package id. This is the package that defines tokenTypeTag. */
  pointTokenPackageId?: string;
  /** Token type used for tokenized points, e.g. 0x...::jitter_point::JITTER_POINT. */
  tokenTypeTag?: string;
  /** Point token TreasuryCap object. Consumed into PointTokenMarket during setup. */
  pointTokenTreasuryCapObjectId?: string;
  /** Point token MetadataCap object for metadata administration. */
  pointTokenMetadataCapObjectId?: string;
  /** Point token Currency object from sui::coin_registry. */
  pointTokenCurrencyObjectId?: string;
  /** Point token UpgradeCap object for package custody tracking. */
  pointTokenUpgradeCapObjectId?: string;
  /** Point token decimals used when creating Liquidlink orderbooks without Currency inputs. */
  pointTokenDecimals?: number;
  /** Shared PointTokenMarket<T>; owns TreasuryCap, scale, and the holding ledger. */
  pointTokenMarketObjectId?: string;
  /** Optional quote coin type for Liquidlink orderbook trading. */
  quoteTokenTypeTag?: string;
  /** Quote coin decimals used when creating Liquidlink orderbooks without Currency inputs. */
  quoteTokenDecimals?: number;
  /** Shared liquidlink_incentive_system::orderbook::OrderBook<base, quote>. */
  orderbookObjectId?: string;
  /** Optional display label for quote token. */
  quoteSymbol?: string;
  /** Optional taker fee, in basis points, charged on coin-quote point orderbook fills. */
  coinQuoteTakerFeeBps?: number;
  /** Optional maker fee snapshot, in basis points, used for newly placed orders. */
  coinQuoteMakerFeeBps?: number;
  /** Minimum order notional in raw quote-coin units. */
  minimumQuoteNotional?: string;
};

export type JitterCheckInConfig = {
  /** jitter_check_in package id used for move calls. */
  packageId?: string;
  /** Root jitter_config::global_config::GlobalConfig object. */
  globalConfigObjectId?: string;
  /** Shared jitter_check_in::check_in::CheckInCampaign object. */
  campaignObjectId?: string;
  /** Display hint only. On-chain source of truth is CheckInCampaign. */
  defaultPointsPerCheckIn?: string;
  /** Display hint only. Milliseconds from UTC day start. 21:00 Taipei = 46_800_000. */
  resetOffsetMs?: string;
  /** Display hint only. Defaults to 86_400_000 on-chain. */
  dayLengthMs?: string;
  /** Display hint in raw PT units. Zero disables PT eligibility. */
  minPtBalance?: string;
  /** Display hint in raw YT units. Zero disables YT eligibility. */
  minYtBalance?: string;
  /** Display hint in raw LP units. Zero disables LP eligibility. */
  minLpAmount?: string;
};

const DEFAULT_MARKET_DECIMALS = 6;

export function getMarketUnderlyingDecimals(
  config: JitterMarketConfig | null | undefined,
): number {
  return config?.underlyingDecimals ?? config?.marketDecimals ?? DEFAULT_MARKET_DECIMALS;
}

export function getMarketAccountingDecimals(
  config: JitterMarketConfig | null | undefined,
): number {
  return config?.marketDecimals ?? config?.underlyingDecimals ?? DEFAULT_MARKET_DECIMALS;
}

const DEMO_MARKET_CONFIG_ENTRIES: Array<[string, string]> = [
  ["JITTER_PACKAGE_ID", JITTER_PACKAGE_ID],
  ["DEMO_ADAPTER_PACKAGE_ID", DEMO_ADAPTER_PACKAGE_ID],
  ["JITTER_ORACLE_PACKAGE_ID", JITTER_ORACLE_PACKAGE_ID],
  ["JITTER_SY_STATE_OBJECT_ID", JITTER_SY_STATE_OBJECT_ID],
  ["JITTER_ACL_OBJECT_ID", JITTER_ACL_OBJECT_ID],
  ["DEMO_MARKET_OBJECT_ID", DEMO_MARKET_OBJECT_ID],
  ["DEMO_PY_STATE_OBJECT_ID", DEMO_PY_STATE_OBJECT_ID],
  ["DEMO_POOL_OBJECT_ID", DEMO_POOL_OBJECT_ID],
  ["DEMO_PRICE_AGGREGATOR_OBJECT_ID", DEMO_PRICE_AGGREGATOR_OBJECT_ID],
  ["DEMO_MARKET_VAULT_OBJECT_ID", DEMO_MARKET_VAULT_OBJECT_ID],
  ["DEMO_UNDERLYING_TYPE_TAG", DEMO_UNDERLYING_TYPE_TAG],
  ["DEMO_SY_TYPE_TAG", DEMO_SY_TYPE_TAG],
  ["DEMO_PT_TYPE_TAG", DEMO_PT_TYPE_TAG],
  ["DEMO_YT_TYPE_TAG", DEMO_YT_TYPE_TAG],
];

const SCALLOP_MARKET_CONFIG_ENTRIES: Array<[string, string]> = [
  ["SCALLOP_ADAPTER_PACKAGE_ID", SCALLOP_ADAPTER_PACKAGE_ID],
  ["SCALLOP_MARKET_VAULT_OBJECT_ID", SCALLOP_MARKET_VAULT_OBJECT_ID],
  ["SCALLOP_MARKET_OBJECT_ID", SCALLOP_MARKET_OBJECT_ID],
  ["SCALLOP_VERSION_OBJECT_ID", SCALLOP_VERSION_OBJECT_ID],
];

function resolveDemoMarketConfigNetwork(
  network?: JitterConfigNetworkInput,
): JitterConfigNetworkInput {
  if (network === "mainnet" || network === "testnet" || network === "devnet") {
    return network;
  }

  const envNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK ?? process.env.SUI_NETWORK;
  if (envNetwork === "mainnet" || envNetwork === "testnet" || envNetwork === "devnet") {
    return envNetwork;
  }

  return "testnet";
}

export function getMissingDemoMarketEnvKeys(): string[] {
  return DEMO_MARKET_CONFIG_ENTRIES.filter(([, value]) => !value).map(([key]) => key);
}

function hasAnyDemoMarketEnvValue(): boolean {
  return DEMO_MARKET_CONFIG_ENTRIES.some(([, value]) => Boolean(value));
}

function getEnvDemoMarketConfig(): JitterMarketConfig {
  return {
    jitterPackageId: JITTER_PACKAGE_ID,
    jitterFrameworkPackageId: JITTER_FRAMEWORK_PACKAGE_ID || undefined,
    jitterExtensionsPackageId: JITTER_EXTENSIONS_PACKAGE_ID || undefined,
    demoAdapterPackageId: DEMO_ADAPTER_PACKAGE_ID,
    scallopAdapterPackageId: SCALLOP_ADAPTER_PACKAGE_ID || undefined,
    scallopProtocolPackageId: SCALLOP_PROTOCOL_PACKAGE_ID || undefined,
    oraclePackageId: JITTER_ORACLE_PACKAGE_ID,
    syStateObjectId: JITTER_SY_STATE_OBJECT_ID,
    aclObjectId: JITTER_ACL_OBJECT_ID,
    marketObjectId: DEMO_MARKET_OBJECT_ID,
    pyStateObjectId: DEMO_PY_STATE_OBJECT_ID,
    poolObjectId: DEMO_POOL_OBJECT_ID,
    orderbookObjectId: DEMO_ORDERBOOK_OBJECT_ID || null,
    ytOrderbookObjectId: DEMO_YT_ORDERBOOK_OBJECT_ID || null,
    priceAggregatorObjectId: DEMO_PRICE_AGGREGATOR_OBJECT_ID,
    demoMarketVaultObjectId: DEMO_MARKET_VAULT_OBJECT_ID,
    scallopMarketVaultObjectId: SCALLOP_MARKET_VAULT_OBJECT_ID || undefined,
    scallopMarketObjectId: SCALLOP_MARKET_OBJECT_ID || undefined,
    scallopVersionObjectId: SCALLOP_VERSION_OBJECT_ID || undefined,
    underlyingTypeTag: DEMO_UNDERLYING_TYPE_TAG,
    syTypeTag: DEMO_SY_TYPE_TAG,
    ptTypeTag: DEMO_PT_TYPE_TAG,
    ytTypeTag: DEMO_YT_TYPE_TAG,
    scallopMarketCoinTypeTag: SCALLOP_MARKET_COIN_TYPE_TAG || undefined,
  };
}

export function getMissingScallopMarketEnvKeys(): string[] {
  return SCALLOP_MARKET_CONFIG_ENTRIES.filter(([, value]) => !value).map(([key]) => key);
}

export function getMissingDemoMarketConfigKeys(
  network?: JitterConfigNetworkInput,
): string[] {
  const missingEnvKeys = getMissingDemoMarketEnvKeys();
  if (missingEnvKeys.length === 0) return [];
  if (hasAnyDemoMarketEnvValue()) return missingEnvKeys;

  return getDefaultJitterMarketConfig(resolveDemoMarketConfigNetwork(network))
    ? []
    : missingEnvKeys;
}

export function hasDemoMarketConfig(network?: JitterConfigNetworkInput): boolean {
  return tryGetDemoMarketConfig(network) !== null;
}

export function tryGetDemoMarketConfig(
  network?: JitterConfigNetworkInput,
): JitterMarketConfig | null {
  const missingEnvKeys = getMissingDemoMarketEnvKeys();
  if (missingEnvKeys.length === 0) return getEnvDemoMarketConfig();
  if (hasAnyDemoMarketEnvValue()) return null;

  return getDefaultJitterMarketConfig(resolveDemoMarketConfigNetwork(network));
}

/**
 * Build a JitterMarketConfig from env vars or the SDK-maintained registry.
 * Env vars override registry values when all required values are present.
 */
export function getDemoMarketConfig(
  network?: JitterConfigNetworkInput,
): JitterMarketConfig {
  const missingEnvKeys = getMissingDemoMarketEnvKeys();
  if (missingEnvKeys.length === 0) return getEnvDemoMarketConfig();

  if (hasAnyDemoMarketEnvValue()) {
    throw new Error(
      `Missing Jitter SDK env vars: ${missingEnvKeys.join(", ")}. ` +
        "Set all values via NEXT_PUBLIC_* (browser) or bare names (Node.js), " +
        "or remove the partial env override to use the SDK-maintained config.",
    );
  }

  const resolvedNetwork = resolveDemoMarketConfigNetwork(network);
  const registeredConfig = getDefaultJitterMarketConfig(resolvedNetwork);
  if (registeredConfig) return registeredConfig;

  throw new Error(
    `No SDK-maintained Jitter market config for ${resolvedNetwork}. ` +
      `Set Jitter SDK env vars: ${missingEnvKeys.join(", ")}.`,
  );
}

// ---------------------------------------------------------------------------
// On-chain object field shapes
// ---------------------------------------------------------------------------

export type PyPositionFields = {
  id: { id: string };
  pt_balance: string;
  yt_balance: string;
  index: string;
  py_index: string;
  accrued: string;
  market_state_id: string;
  /** @deprecated Unified MarketState replaces the former separate PyState object. */
  py_state_id: string;
  /** @deprecated Unified MarketState replaces the former separate Market object. */
  market_id: string;
  expiry: string;
  created_at: string;
};

export type JitterCoinRewardConfig = {
  rewardCoinTypeTag: string;
  ytRewarderObjectId?: string;
  lpRewarderObjectId?: string;
  emissionPerMs?: string;
  fundedAmount?: string;
};

export type LpPositionFields = {
  id: { id: string };
  market_state_id?: string;
  lp_amount: string;
  pool_id: string;
  expiry: string;
  created_at: string;
};

export type JitterPositionFields = {
  id: { id: string };
  market_state_id: string;
  expiry: string;
  created_at: string;
  py: { fields: Omit<PyPositionFields, "id" | "market_state_id" | "py_state_id" | "market_id" | "expiry" | "created_at"> };
  lp: { fields: Pick<LpPositionFields, "pool_id" | "lp_amount"> };
};

export type PoolFields = {
  id: { id: string };
  total_pt: string;
  total_sy: string;
  lp_supply: string;
  /** C2 pool lifecycle: 0 = uninitialized, 1 = active, 2 = empty. */
  pool_status?: string;
  /** Monotonically increases whenever an uninitialized or empty pool is initialized. */
  pool_generation?: string;
  last_ln_implied_rate: MoveNumericField;
  scalar_root: MoveNumericField;
  initial_anchor: MoveNumericField;
  ln_fee_rate_root: MoveNumericField;
  paused: boolean;
  expiry: string;
};

export type MoveNumericField =
  | string
  | number
  | bigint
  | {
      value: string | number | bigint;
      positive?: boolean;
    };

export type PyStateFields = {
  id: { id: string };
  pt_supply: string;
  yt_supply: string;
  sy_balance: string;
  py_index_stored: string;
  global_interest_index: string;
  is_settled: boolean;
  settled_py_index: string;
  expiry: string;
  market_id: string;
  /** FP64 raw treasury interest accrued (u128 as string). */
  total_treasury_interest?: string;
  /** FP64 raw last collected interest index (u128 as string). */
  last_collect_interest_index?: string;
  /** Raw SY reserve fees collected from AMM swaps and pending treasury sweep. */
  reserve_fee_balance?: string;
};

export type DemoMarketVaultFields = {
  id: { id: string };
  market_id: string;
  underlying_balance: string;
  updated_at: string;
};

export type ScallopMarketVaultFields = {
  id: { id: string };
  market_id: string;
  scallop_market_id: string;
  market_coin_balance: string;
  underlying_dust: string;
  updated_at: string;
};

export type SuilendMarketVaultFields = {
  id: { id: string };
  market_id: string;
  reserve_id: string;
  reserve_array_index: string;
  ctoken_balance: string;
  updated_at: string;
};

export type NaviMarketVaultFields = {
  id: { id: string };
  market_id: string;
  navi_storage_id: string;
  navi_pool_id: string;
  asset_id: number | string;
  total_underlying_deposited: string;
  total_underlying_withdrawn: string;
  updated_at: string;
};
