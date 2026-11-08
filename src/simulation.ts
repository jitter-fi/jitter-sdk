/**
 * @jitter/sdk — simulation.ts
 *
 * Read-only quote functions using the on-chain `offchain` module.
 * Each function builds a Transaction, runs it through the Sui Core simulation
 * API (no signature needed), and decodes the BCS return values.
 *
 * All amounts are in raw u64 token units unless stated otherwise.
 * Prices/indices are FP64 u128 raw values.
 */

import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { assertValidYtSaleQuote } from "./domain/yt-sale-quote.js";

import { FP64_ONE } from "./constants.js";
import { getHaedalStakeQuote } from "./adapters/haedal.js";
import { getPoolState, getPyState, getScallopMarketIndex } from "./queries.js";
import { getSuiGrpcClient, type GrpcNetworkKind } from "./rpc.js";
import type { JitterMarketConfig } from "./types.js";

// ---------------------------------------------------------------------------
// Simulation core
// ---------------------------------------------------------------------------

type SimulationCommandResult = {
  returnValues?: Array<{ bcs: Uint8Array | null }>;
};

type SimulationReturnValue = NonNullable<
  SimulationCommandResult["returnValues"]
>[number];

async function simulate(
  network: GrpcNetworkKind,
  tx: Transaction,
): Promise<SimulationCommandResult[]> {
  const result = await getSuiGrpcClient(network).simulateTransaction({
    transaction: tx,
    checksEnabled: false,
    include: { commandResults: true },
  });

  if (result.$kind === "FailedTransaction") {
    const error = result.FailedTransaction.status.error;
    throw new Error(`Transaction simulation failed: ${error?.message ?? "unknown error"}`);
  }

  return result.commandResults ?? [];
}

function decodeU64(results: SimulationCommandResult[], callIndex = 0): bigint {
  return decodeRequiredU64(results[callIndex]?.returnValues?.[0], callIndex);
}

function decodeU8Value(
  value: SimulationReturnValue | undefined,
  callIndex: number,
): number {
  if (!value?.bcs) throw new Error(`No return value at index ${callIndex}`);
  return bcs.u8().parse(value.bcs);
}

function decodeU128(results: SimulationCommandResult[], callIndex = 0): bigint {
  const rv = results[callIndex]?.returnValues?.[0]?.bcs;
  if (!rv) throw new Error(`No return value at index ${callIndex}`);
  return BigInt(bcs.u128().parse(rv));
}

function decodeBool(results: SimulationCommandResult[], callIndex = 0): boolean {
  const rv = results[callIndex]?.returnValues?.[0]?.bcs;
  if (!rv) throw new Error(`No return value at index ${callIndex}`);
  return bcs.bool().parse(rv);
}

function decodeRequiredU64(
  value: SimulationReturnValue | undefined,
  callIndex: number,
): bigint {
  if (!value?.bcs) throw new Error(`No return value at index ${callIndex}`);
  return BigInt(bcs.u64().parse(value.bcs));
}

function decodeOptionalU64(
  value: SimulationReturnValue | undefined,
): bigint {
  return value?.bcs ? BigInt(bcs.u64().parse(value.bcs)) : 0n;
}

function mulDivFloor(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) return 0n;
  return (a * b) / denominator;
}

function mulDivCeil(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) return 0n;
  const numerator = a * b;
  return numerator === 0n ? 0n : (numerator + denominator - 1n) / denominator;
}

function sqrtBigInt(value: bigint): bigint {
  if (value <= 0n) return 0n;
  let x0 = value;
  let x1 = (x0 + 1n) >> 1n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x1 + value / x1) >> 1n;
  }
  return x0;
}

function hasScallopRouteConfigured(config: JitterMarketConfig): boolean {
  return Boolean(
    config.scallopAdapterPackageId &&
      config.scallopMarketVaultObjectId &&
      config.scallopMarketObjectId &&
      config.scallopVersionObjectId,
  );
}

async function resolveQuoteSyIndex(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  override?: bigint,
): Promise<bigint> {
  if (override !== undefined) return override;
  if (config.haedalAdapterPackageId) return (await getHaedalStakeQuote(network, config, 0n)).syIndex;
  if (hasScallopRouteConfigured(config)) {
    const scallopIndex = await getScallopMarketIndex(network, config);
    return BigInt(scallopIndex.syIndexRaw);
  }
  const state = await getPyState(network, config);
  const storedIndex = BigInt(state.py_index_stored ?? 0);
  return storedIndex > 0n ? storedIndex : FP64_ONE;
}

function estimateLpOutByPoolMath(
  totalLp: bigint,
  totalSy: bigint,
  totalPt: bigint,
  syIn: bigint,
  ptIn: bigint,
): bigint {
  if (syIn <= 0n || ptIn <= 0n) return 0n;

  if (totalLp === 0n) {
    return sqrtBigInt(syIn * ptIn);
  }

  if (totalSy <= 0n || totalPt <= 0n) {
    return 0n;
  }

  const syRatio = mulDivFloor(syIn, totalLp, totalSy);
  const ptRatio = mulDivFloor(ptIn, totalLp, totalPt);
  return syRatio < ptRatio ? syRatio : ptRatio;
}

function requireGlobalConfigObjectId(config: JitterMarketConfig): string {
  if (!config.globalConfigObjectId) {
    throw new Error("Jitter quote simulation requires globalConfigObjectId in market config.");
  }
  return config.globalConfigObjectId;
}

function requireJitterViewPackageId(config: JitterMarketConfig): string {
  if (!config.jitterViewPackageId) {
    throw new Error("Jitter quote simulation requires jitterViewPackageId in market config.");
  }
  return config.jitterViewPackageId;
}

function resolveMarketObjectId(config: JitterMarketConfig): string {
  if (config.marketStateObjectId) return config.marketStateObjectId;
  if (
    config.marketObjectId &&
    config.marketObjectId === config.pyStateObjectId &&
    config.marketObjectId === config.poolObjectId
  ) {
    return config.marketObjectId;
  }
  throw new Error("Jitter quote simulation requires a unified marketStateObjectId.");
}

function marketStateTypeArguments(config: JitterMarketConfig): [string, string, string] {
  return [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
}

// ---------------------------------------------------------------------------
// Quote types
// ---------------------------------------------------------------------------

export type QuoteSwapSyForPt = {
  ptOut: bigint;
  slippageBps: bigint;
};

export type QuoteSwapPtForSy = {
  syOut: bigint;
  slippageBps: bigint;
};

export type QuoteSwapSyForExactPt = {
  syIn: bigint;
  slippageBps: bigint;
};

export type QuoteSwapPtForExactSy = {
  ptIn: bigint;
};

export type QuoteSwapSyForYt = {
  ytOut: bigint;
  syRefund: bigint;
  slippageBps: bigint;
};

export type QuoteSwapSyForExactYt = {
  ytOut: bigint;
  syIn: bigint;
  syToMint: bigint;
  syRefund: bigint;
  slippageBps: bigint;
};

export type QuoteSwapYtForSy = {
  syOut: bigint;
  syRedeemOut: bigint;
  syRepaid: bigint;
  slippageBps: bigint;
};

export type QuotePrices = {
  ptPrice: bigint;
  ytPrice: bigint;
};

export type QuoteLpValue = {
  syValue: bigint;
  ptValue: bigint;
  value: bigint;
};

export type RemoveLpToSyRoute =
  | "active-swap"
  | "settled-redeem"
  | "direct-sy"
  | "awaiting-settlement"
  | "insufficient-post-remove-liquidity"
  | "unavailable";

export type QuoteRemoveLpToSy = {
  route: RemoveLpToSyRoute;
  syValue: bigint;
  ptValue: bigint;
  convertedSyValue: bigint;
  totalSyValue: bigint;
  feeSy: bigint;
  slippageBps: bigint;
};

export type QuoteAddLiquidity = {
  lpOut: bigint;
  pairedPt: bigint;
};

export type QuoteAddLiquidityZap = QuoteAddLiquidity & {
  ptFromSwap: bigint;
  slippageBps: bigint;
  syForLiquidity: bigint;
  syToSwap: bigint;
};

export type QuoteAddLiquidityKeepYt = QuoteAddLiquidity & {
  syToMint: bigint;
  syForLiquidity: bigint;
  keptYt: bigint;
  syOut?: bigint;
  /** Bounded raw SY sent to the configured market Treasury, not to the user. */
  treasurySy?: bigint;
  ptDust?: bigint;
};

export type QuoteAddLiquidityFromSy = QuoteAddLiquidityKeepYt & {
  firstLegLpOut: bigint;
  secondLegLpOut: bigint;
  slippageBps: bigint;
  /** Canonical full-input routes return zero SY to the user. */
  syOut: bigint;
  syRedeemOut: bigint;
  syRepaid: bigint;
  /** Legacy compatibility field; zero when no YT sale occurs. */
  ytSaleSyOut: bigint;
  ytToSell: bigint;
};

export type QuoteClaimableInterest = {
  interest: bigint;
};

// ---------------------------------------------------------------------------
// Individual quote functions
// ---------------------------------------------------------------------------

/** Estimate PT received for exact SY in, with slippage bps. */
export async function quoteSwapSyForPt(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  syIn: bigint,
  syIndex?: bigint,
): Promise<QuoteSwapSyForPt> {
  const tx = new Transaction();
  const syIndexRaw = await resolveQuoteSyIndex(network, config, syIndex);
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_pt`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(syIn),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_pt_slippage_bps`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(syIn),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return { ptOut: decodeU64(results, 0), slippageBps: decodeU64(results, 1) };
}

/** Estimate SY received for exact PT in, with slippage bps. */
export async function quoteSwapPtForSy(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  ptIn: bigint,
  syIndex?: bigint,
): Promise<QuoteSwapPtForSy> {
  const tx = new Transaction();
  const syIndexRaw = await resolveQuoteSyIndex(network, config, syIndex);
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_pt_for_sy`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ptIn),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_pt_for_sy_slippage_bps`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ptIn),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return { syOut: decodeU64(results, 0), slippageBps: decodeU64(results, 1) };
}

/** Estimate SY needed to receive exact PT out. */
export async function quoteSwapSyForExactPt(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  ptOut: bigint,
  syIndex?: bigint,
): Promise<QuoteSwapSyForExactPt> {
  const tx = new Transaction();
  const syIndexRaw = await resolveQuoteSyIndex(network, config, syIndex);
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_exact_pt`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ptOut),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_exact_pt_slippage_bps`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ptOut),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return {
    syIn: decodeU64(results, 0),
    slippageBps: decodeU64(results, 1),
  };
}

/** Estimate PT needed to receive exact SY out. */
export async function quoteSwapPtForExactSy(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  syOut: bigint,
  syIndex?: bigint,
): Promise<QuoteSwapPtForExactSy> {
  const tx = new Transaction();
  const syIndexRaw = await resolveQuoteSyIndex(network, config, syIndex);
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_pt_for_exact_sy`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(syOut),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return { ptIn: decodeU64(results, 0) };
}

/** Estimate YT received for exact SY in, plus returned SY change and slippage. */
export async function quoteSwapSyForYt(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  syIn: bigint,
  syIndex: bigint,
): Promise<QuoteSwapSyForYt> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  // returns (yt_out, sy_change)
  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_yt`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(syIn),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_yt_slippage_bps`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(syIn),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  // result[0] returns (yt_out, sy_refund) tuple — first two return values
  const rv0 = results[0]?.returnValues;
  const ytOut = decodeOptionalU64(rv0?.[0]);
  const syRefund = decodeOptionalU64(rv0?.[1]);
  const slippageBps = decodeU64(results, 1);
  return { ytOut, syRefund, slippageBps };
}

/** Estimate net SY needed to receive exact YT out, with full breakdown. */
export async function quoteSwapSyForExactYt(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  ytOut: bigint,
  syIndex: bigint,
): Promise<QuoteSwapSyForExactYt> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  // returns (actual_yt_out, sy_to_mint, sy_from_pt_sale, net_sy_in)
  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_exact_yt`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ytOut),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_sy_for_exact_yt_slippage_bps`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ytOut),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  const rv0 = results[0]?.returnValues;
  const actualYtOut = decodeOptionalU64(rv0?.[0]);
  const syToMint = decodeOptionalU64(rv0?.[1]);
  const syRefund = decodeOptionalU64(rv0?.[2]);
  const syIn = decodeOptionalU64(rv0?.[3]);
  const slippageBps = decodeU64(results, 1);
  return { ytOut: actualYtOut, syIn, syToMint, syRefund, slippageBps };
}

/** Estimate SY received for exact YT in, net of the PT settlement leg. */
export async function quoteSwapYtForSy(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  ytIn: bigint,
  syIndex: bigint,
): Promise<QuoteSwapYtForSy> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_yt_for_sy`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ytIn),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_swap_yt_for_sy_slippage_bps`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(ytIn),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  const rv0 = results[0]?.returnValues;
  const syOut = decodeRequiredU64(rv0?.[0], 0);
  const syRedeemOut = decodeRequiredU64(rv0?.[1], 0);
  const syRepaid = decodeRequiredU64(rv0?.[2], 0);
  assertValidYtSaleQuote(ytIn, syOut, syRedeemOut, syRepaid);
  const slippageBps = decodeU64(results, 1);
  return { syOut, syRedeemOut, syRepaid, slippageBps };
}

/** Estimate current PT and YT prices as FP64 u128. */
export async function quotePrices(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  syIndex: bigint,
): Promise<QuotePrices> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_pt_price`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.object(marketStateObjectId),
      tx.pure.u128(syIndex),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_yt_price`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u128(syIndex),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return {
    ptPrice: decodeU128(results, 0),
    ytPrice: decodeU128(results, 1),
  };
}

/** Estimate SY value of LP tokens. */
export async function quoteLpValue(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  lpAmount: bigint,
): Promise<QuoteLpValue> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_lp_value`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(lpAmount),
      tx.object(marketStateObjectId),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  const rv = results[0]?.returnValues;
  const syValue = decodeOptionalU64(rv?.[0]);
  const ptValue = decodeOptionalU64(rv?.[1]);
  return {
    syValue,
    ptValue,
    value: syValue,
  };
}

/**
 * Quote an LP Zap Out against the reserves that remain after liquidity is
 * removed. The route also tells the transaction builder whether PT must be
 * swapped, redeemed at the settled index, or returned raw.
 */
export async function quoteRemoveLpToSy(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  lpAmount: bigint,
  syIndex?: bigint,
): Promise<QuoteRemoveLpToSy> {
  const tx = new Transaction();
  const syIndexRaw = await resolveQuoteSyIndex(network, config, syIndex);
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_remove_lp_to_sy`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.pure.u64(lpAmount),
      tx.pure.u128(syIndexRaw),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  const values = results[0]?.returnValues;
  const routeCode = decodeU8Value(values?.[0], 0);
  return {
    route: decodeRemoveLpToSyRoute(routeCode),
    syValue: decodeOptionalU64(values?.[1]),
    ptValue: decodeOptionalU64(values?.[2]),
    convertedSyValue: decodeOptionalU64(values?.[3]),
    totalSyValue: decodeOptionalU64(values?.[4]),
    feeSy: decodeOptionalU64(values?.[5]),
    slippageBps: decodeOptionalU64(values?.[6]),
  };
}

function decodeRemoveLpToSyRoute(route: number): RemoveLpToSyRoute {
  switch (route) {
    case 1:
      return "active-swap";
    case 2:
      return "settled-redeem";
    case 3:
      return "direct-sy";
    case 4:
      return "awaiting-settlement";
    case 5:
      return "insufficient-post-remove-liquidity";
    default:
      return "unavailable";
  }
}

/**
 * Preview LP shares minted when adding `(syIn, ptIn)` to the pool, plus the
 * PT amount that would pair with `syIn` at the current pool ratio. Passing
 * `ptIn = 0n` returns the steady-state pairing for a matched deposit preview.
 *
 * For steady state the pool mints the min-ratio LP amount, so users who
 * deposit off-ratio donate the unpaired token. `pairedPt` is the exact amount
 * that avoids that donation.
 */
export async function quoteAddLiquidity(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  syIn: bigint,
  ptIn: bigint = BigInt(0),
): Promise<QuoteAddLiquidity> {
  if (syIn <= 0n) {
    return { lpOut: 0n, pairedPt: 0n };
  }

  const pool = await getPoolState(network, config);
  const totalSy = BigInt(pool.total_sy);
  const totalPt = BigInt(pool.total_pt);
  const totalLp = BigInt(pool.lp_supply);

  const pairedPt =
    ptIn === 0n
      ? totalSy > 0n && totalPt > 0n
        ? mulDivFloor(syIn, totalPt, totalSy)
        : 0n
      : ptIn;

  const lpOut = estimateLpOutByPoolMath(totalLp, totalSy, totalPt, syIn, pairedPt);
  return { lpOut, pairedPt };
}

/**
 * Preview single-asset LP zap without keeping YT. The zap swaps part of the
 * input SY into PT, then deposits the remaining SY plus the acquired PT.
 */
export async function quoteAddLiquidityZap(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  syIn: bigint,
): Promise<QuoteAddLiquidityZap> {
  const empty = {
    lpOut: 0n,
    pairedPt: 0n,
    ptFromSwap: 0n,
    slippageBps: 0n,
    syForLiquidity: 0n,
    syToSwap: 0n,
  };

  if (syIn <= 1n) return empty;

  const pool = await getPoolState(network, config);
  const totalSy = BigInt(pool.total_sy);
  const totalPt = BigInt(pool.total_pt);
  const totalLp = BigInt(pool.lp_supply);
  if (totalSy <= 0n || totalPt <= 0n || totalLp <= 0n) return empty;

  let low = 1n;
  let high = syIn - 1n;
  let best: QuoteAddLiquidityZap | null = null;
  let bestDiff: bigint | null = null;

  for (let i = 0; i < 12 && low <= high; i += 1) {
    const syToSwap = (low + high) / 2n;
    const syForLiquidity = syIn - syToSwap;
    if (syForLiquidity <= 0n) {
      high = syToSwap - 1n;
      continue;
    }

    let swapQuote: QuoteSwapSyForPt;
    try {
      swapQuote = await quoteSwapSyForPt(network, config, syToSwap);
    } catch {
      high = syToSwap - 1n;
      continue;
    }

    const targetPt = mulDivFloor(syForLiquidity, totalPt, totalSy);
    const diff =
      swapQuote.ptOut > targetPt
        ? swapQuote.ptOut - targetPt
        : targetPt - swapQuote.ptOut;
    const lpOut = estimateLpOutByPoolMath(
      totalLp,
      totalSy,
      totalPt,
      syForLiquidity,
      swapQuote.ptOut,
    );

    if (best === null || bestDiff === null || diff < bestDiff) {
      best = {
        lpOut,
        pairedPt: swapQuote.ptOut,
        ptFromSwap: swapQuote.ptOut,
        slippageBps: swapQuote.slippageBps,
        syForLiquidity,
        syToSwap,
      };
      bestDiff = diff;
    }

    if (swapQuote.ptOut < targetPt) {
      low = syToSwap + 1n;
    } else {
      high = syToSwap - 1n;
    }
  }

  return best ?? empty;
}

/** Exact contract preview of the canonical full-input Keep route. */
export async function quoteAddLiquidityKeepYt(
  network: GrpcNetworkKind, config: JitterMarketConfig, syIn: bigint, syIndex: bigint,
): Promise<QuoteAddLiquidityKeepYt> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${config.jitterPackageId}::router::quote_add_lp_keep_yt`,
    arguments: [tx.pure.u64(syIn), tx.object(resolveMarketObjectId(config)),
      tx.pure.u128(syIndex), tx.object.clock()],
    typeArguments: marketStateTypeArguments(config),
  });
  const results = await simulate(network, tx);
  const read = (slot: number) => decodeRequiredU64(results[0]?.returnValues?.[slot], 0);
  const [lpOut, keptYt, syToMint, syForLiquidity, treasurySy, ptDust] = [0, 1, 2, 3, 4, 5].map(read);
  assertFullLpQuote(syIn, lpOut, treasurySy, true);
  if (keptYt === 0n || syToMint + syForLiquidity !== syIn || ptDust > keptYt) {
    throw new Error("Invalid Keep liquidity quote");
  }
  return { lpOut, pairedPt: keptYt - ptDust, syToMint, syForLiquidity, keptYt, syOut: 0n, treasurySy, ptDust };
}

const balancedLpBcs = bcs.struct("Quote", {
  status: bcs.u8(), pt: bcs.u64(), cost: bcs.u64(), lp: bcs.u64(), refund: bcs.u64(),
  pt_dust: bcs.u64(), iterations: bcs.u64(), blocked_pt: bcs.u64(), spend_upper: bcs.u256(),
});

function assertFullLpQuote(input: bigint, lp: bigint, refund: bigint, keepYt = false) {
  const limit = input / 1_000_000n > 1n ? input / 1_000_000n : 1n;
  if (input <= 1n || lp === 0n || refund >= input || (!keepYt && refund > limit)) {
    throw new Error("Full liquidity quote exceeds the SY refund limit or has no LP output");
  }
}

/** Quotes buy-exact-PT plus a proportional add as one balanced allocation.
 * Legacy YT-sale fields remain zero for compatibility, not a synthetic sale. */
export async function quoteAddLiquidityFromSy(
  network: GrpcNetworkKind, config: JitterMarketConfig, syIn: bigint, syIndex: bigint,
): Promise<QuoteAddLiquidityFromSy> {
  if (!config.jitterMathPackageId) throw new Error("Balanced LP quotes require jitterMathPackageId");
  const tx = new Transaction();
  const quoteResult = tx.moveCall({
    target: `${config.jitterPackageId}::market::quote_balanced_lp`,
    arguments: [tx.pure.u64(syIn), tx.object(resolveMarketObjectId(config)),
      tx.pure.u128(syIndex), tx.object.clock()],
    typeArguments: marketStateTypeArguments(config),
  });
  // Quote, exact-PT cost and spot price must share one market snapshot and Clock.
  const amounts = tx.moveCall({ target: `${config.jitterMathPackageId}::lp_balance::amounts`, arguments: [quoteResult] });
  const view = requireJitterViewPackageId(config), global = tx.object(requireGlobalConfigObjectId(config));
  tx.moveCall({ target: `${view}::offchain::estimate_market_state_swap_sy_for_exact_pt`,
    typeArguments: marketStateTypeArguments(config), arguments: [global, amounts[0], tx.pure.u128(syIndex),
      tx.object(resolveMarketObjectId(config)), tx.object.clock()] });
  tx.moveCall({ target: `${view}::offchain::estimate_market_state_pt_price`,
    typeArguments: marketStateTypeArguments(config), arguments: [global, tx.object(resolveMarketObjectId(config)),
      tx.pure.u128(syIndex), tx.object.clock()] });
  const results = await simulate(network, tx);
  const bytes = results[0]?.returnValues?.[0]?.bcs;
  if (!bytes) throw new Error("Missing balanced LP quote");
  const quote = balancedLpBcs.parse(bytes);
  if (quote.status !== 1) {
    const reason = quote.status === 2 ? "curve-limit" : quote.status === 3
      ? "precision-unresolved" : quote.status === 4 ? "search-incomplete" : "invalid-input";
    throw new Error(`Full liquidity quote unavailable (${reason})`);
  }
  const lpOut = BigInt(quote.lp), syOut = BigInt(quote.refund);
  const pt = BigInt(quote.pt), cost = BigInt(quote.cost), ptDust = BigInt(quote.pt_dust);
  assertFullLpQuote(syIn, lpOut, syOut);
  if (pt === 0n || cost === 0n || cost >= syIn || ptDust > pt || syOut > syIn - cost) {
    throw new Error("Invalid balanced LP quote");
  }
  if (decodeU64(results, 2) !== cost) throw new Error("Liquidity quote changed; request a new quote");
  const spot = decodeU128(results, 3);
  if (spot <= 0n) throw new Error("Invalid balanced LP spot price");
  const executionPrice = mulDivCeil(cost, FP64_ONE, pt);
  const slippageBps = executionPrice > spot ? mulDivCeil(executionPrice - spot, 10_000n, spot) : 0n;
  return { lpOut, pairedPt: pt - ptDust, syToMint: 0n, syForLiquidity: syIn - cost,
    keptYt: 0n, firstLegLpOut: lpOut, secondLegLpOut: 0n, slippageBps,
    syOut: 0n, treasurySy: syOut, ptDust, syRedeemOut: 0n, syRepaid: 0n, ytSaleSyOut: 0n, ytToSell: 0n };
}

export async function constrainNonKeepYtMintForQuote(input: {
  preferredSyToMint: bigint;
  totalPt: bigint;
  syIndex: bigint;
  quotePtOut: (grossSy: bigint) => Promise<bigint>;
}): Promise<bigint> {
  let candidate = input.preferredSyToMint;

  for (let i = 0; i < 8 && candidate > 0n; i += 1) {
    const ytAmount = mulDivFloor(candidate, input.syIndex, FP64_ONE);
    if (ytAmount === 0n || input.totalPt <= ytAmount) {
      candidate /= 2n;
      continue;
    }

    const grossSy = mulDivCeil(ytAmount, FP64_ONE, input.syIndex);
    let repayCapacity = 0n;
    try {
      repayCapacity = await input.quotePtOut(grossSy);
    } catch {
      candidate /= 2n;
      continue;
    }

    if (repayCapacity >= ytAmount) return candidate;

    const adjusted =
      repayCapacity === 0n
        ? candidate / 2n
        : mulDivFloor(candidate, repayCapacity, ytAmount);
    candidate = adjusted >= candidate ? candidate - 1n : adjusted;
  }

  return candidate;
}

/** Estimate claimable YT interest for a PyPosition. */
export async function quoteClaimableInterest(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
  pyPositionId: string,
): Promise<QuoteClaimableInterest> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::estimate_market_state_claimable_interest`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.object(pyPositionId),
      tx.object(marketStateObjectId),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return { interest: decodeU64(results, 0) };
}

/** Check whether the market has expired. */
export async function quoteIsMarketExpired(
  network: GrpcNetworkKind,
  config: JitterMarketConfig,
): Promise<boolean> {
  const tx = new Transaction();
  const globalConfigObjectId = requireGlobalConfigObjectId(config);
  const jitterViewPackageId = requireJitterViewPackageId(config);
  const marketStateObjectId = resolveMarketObjectId(config);

  tx.moveCall({
    target: `${jitterViewPackageId}::offchain::is_market_state_expired`,
    arguments: [
      tx.object(globalConfigObjectId),
      tx.object(marketStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArguments(config),
  });

  const results = await simulate(network, tx);
  return decodeBool(results, 0);
}
