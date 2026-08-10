/**
 * @jitter/sdk — pool.ts
 */

import type {
  Transaction,
  TransactionArgument,
  TransactionObjectArgument,
} from "@mysten/sui/transactions";

import type { JitterMarketConfig } from "./types.js";

function asObjectArg(
  tx: Transaction,
  value: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return typeof value === "string" ? tx.object(value) : value;
}

function requireGlobalConfig(config: JitterMarketConfig): string {
  if (!config.globalConfigObjectId) {
    throw new Error("Jitter market config is missing globalConfigObjectId.");
  }
  return config.globalConfigObjectId;
}

function requireRewardDistributor(config: JitterMarketConfig): string {
  if (!config.rewardDistributorObjectId) {
    throw new Error("Jitter market config is missing rewardDistributorObjectId.");
  }
  return config.rewardDistributorObjectId;
}

function marketStateObjectId(config: JitterMarketConfig): string {
  return config.marketStateObjectId ?? config.marketObjectId;
}

function marketStateTypeArgs(config: JitterMarketConfig): [string, string, string] {
  return [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
}

function emptyRewardSettlements(tx: Transaction, config: JitterMarketConfig): TransactionArgument {
  return tx.makeMoveVec({
    type: `${config.jitterPackageId}::reward_distributor::RewardSettlement`,
    elements: [],
  });
}

function destroyEmptyRewardOperations(
  tx: Transaction,
  config: JitterMarketConfig,
  operations: TransactionArgument,
): void {
  tx.moveCall({
    target: "0x1::vector::destroy_empty",
    arguments: [operations],
    typeArguments: [`${config.jitterPackageId}::reward_distributor::RewardOperation`],
  });
}

// ---------------------------------------------------------------------------
// Swap: SY → PT
// ---------------------------------------------------------------------------

export function addSwapSyForPt(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  minPtOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::buy_pt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      tx.pure.u64(minPtOut),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapSyForExactPt(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  ptOut: bigint,
  maxSyIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::buy_exact_pt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      tx.pure.u64(ptOut),
      tx.pure.u64(maxSyIn),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

// ---------------------------------------------------------------------------
// Swap: PT → SY
// ---------------------------------------------------------------------------

export function addSwapPtForSy(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_pt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      tx.pure.u64(ptAmount),
      tx.pure.u64(minSyOut),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[1] as TransactionArgument);
  return result[0] as TransactionObjectArgument;
}

export function addSwapPtForExactSy(
  tx: Transaction,
  config: JitterMarketConfig,
  syOut: bigint,
  maxPtIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_pt_for_exact_sy`,
    arguments: [
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      tx.pure.u64(syOut),
      tx.pure.u64(maxPtIn),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return result[1] as TransactionObjectArgument;
}

// ---------------------------------------------------------------------------
// Swap: SY → YT
// ---------------------------------------------------------------------------

export function addSwapSyForYt(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  minYtOut: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::buy_yt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      tx.pure.u64(minYtOut),
      tx.pure.u64(minSyOut),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapSyForExactYt(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  ytOut: bigint,
  maxSyIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::buy_exact_yt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      tx.pure.u64(ytOut),
      tx.pure.u64(maxSyIn),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

// ---------------------------------------------------------------------------
// Swap: YT â†’ SY
// ---------------------------------------------------------------------------

export function addSwapYtForSy(
  tx: Transaction,
  config: JitterMarketConfig,
  ytAmount: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_yt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      tx.pure.u64(ytAmount),
      tx.pure.u64(minSyOut),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[1] as TransactionArgument);
  return result[0] as TransactionObjectArgument;
}

export function addSwapYtForExactSy(
  tx: Transaction,
  config: JitterMarketConfig,
  syOut: bigint,
  maxYtIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_yt_for_exact_sy`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      tx.pure.u64(syOut),
      tx.pure.u64(maxYtIn),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[3] as TransactionArgument);
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionObjectArgument,
    result[2] as TransactionObjectArgument,
  ];
}

// ---------------------------------------------------------------------------
// Liquidity
// ---------------------------------------------------------------------------

export function addLiquidityFromPosition(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  ptAmount: bigint | TransactionArgument,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
  lpPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::add_lp`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      typeof ptAmount === "bigint" ? tx.pure.u64(ptAmount) : ptAmount,
      tx.pure.u64(0),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[3] as TransactionArgument);
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionObjectArgument,
  ];
}

export function addLiquidityKeepYtFromPosition(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  syToMint: bigint,
  minLpOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
  lpPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::add_lp_keep_yt`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      tx.pure.u64(syToMint),
      tx.pure.u64(minLpOut),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[3] as TransactionArgument);
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionObjectArgument,
  ];
}

export function addLiquidityFromSy(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  syToMintHint: bigint,
  minLpOut: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  position: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::add_lp_from_sy`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      tx.pure.u64(syToMintHint),
      tx.pure.u64(minLpOut),
      tx.pure.u64(minSyOut),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, position),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addRemoveLiquidityToPosition(
  tx: Transaction,
  config: JitterMarketConfig,
  lpAmount: bigint,
  pyPosition: TransactionObjectArgument | string,
  lpPosition: TransactionObjectArgument | string,
): [TransactionObjectArgument, TransactionArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::remove_lp`,
    arguments: [
      emptyRewardSettlements(tx, config),
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      tx.pure.u64(lpAmount),
      tx.pure.u64(0),
      tx.pure.u64(0),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, pyPosition),
      tx.object(requireGlobalConfig(config)),
      tx.pure.u64(0),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  destroyEmptyRewardOperations(tx, config, result[2] as TransactionArgument);
  return [result[0] as TransactionObjectArgument, result[1] as TransactionArgument];
}
