/**
 * @jitter/sdk — py.ts
 */

import type {
  Transaction,
  TransactionArgument,
  TransactionObjectArgument,
} from "@mysten/sui/transactions";

import {
  createMarketStatePosition,
  mintPy,
  redeemPy,
  redeemMarketStateAfterExpiry,
} from "./generated/jitter/router.js";

import type { JitterMarketConfig } from "./types.js";

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

function emptyRewardSettlements(
  tx: Transaction,
  config: JitterMarketConfig,
): TransactionArgument {
  return tx.makeMoveVec({
    type: `${config.jitterPackageId}::reward_distributor::RewardSettlement`,
    elements: [],
  });
}

function marketStateId(config: JitterMarketConfig): string {
  return config.marketObjectId;
}

function marketStateTypeArgs(config: JitterMarketConfig): [string, string, string] {
  return [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
}

// ---------------------------------------------------------------------------
// Position creation
// ---------------------------------------------------------------------------

export function addCreatePyPosition(
  tx: Transaction,
  config: JitterMarketConfig,
): TransactionObjectArgument {
  return createMarketStatePosition({
    package: config.jitterPackageId,
    arguments: [marketStateId(config), requireGlobalConfig(config)],
    typeArguments: marketStateTypeArgs(config),
  })(tx) as TransactionObjectArgument;
}

export function addCreateLpPosition(
  tx: Transaction,
  config: JitterMarketConfig,
): TransactionObjectArgument {
  return createMarketStatePosition({
    package: config.jitterPackageId,
    arguments: [marketStateId(config), requireGlobalConfig(config)],
    typeArguments: marketStateTypeArgs(config),
  })(tx) as TransactionObjectArgument;
}

export function addCreatePosition(
  tx: Transaction,
  config: JitterMarketConfig,
): TransactionObjectArgument {
  return createMarketStatePosition({
    package: config.jitterPackageId,
    arguments: [marketStateId(config), requireGlobalConfig(config)],
    typeArguments: marketStateTypeArgs(config),
  })(tx) as TransactionObjectArgument;
}

// ---------------------------------------------------------------------------
// PT + YT minting
// ---------------------------------------------------------------------------

export function addMintPyFromSy(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): void {
  const result = mintPy({
    package: config.jitterPackageId,
    arguments: [
      emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      syCoin,
      priceInfo,
      pyPosition as string,
      marketStateId(config),
      requireGlobalConfig(config),
    ],
    typeArguments: marketStateTypeArgs(config),
  })(tx);
  tx.moveCall({
    target: "0x1::vector::destroy_empty",
    arguments: [result[1]],
    typeArguments: [`${config.jitterPackageId}::reward_distributor::RewardOperation`],
  });
}

// ---------------------------------------------------------------------------
// Redemption
// ---------------------------------------------------------------------------

export function addRedeemBeforeExpiry(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
  ytSettlements?: TransactionArgument,
): [TransactionObjectArgument, TransactionArgument] {
  const result = redeemPy({
    package: config.jitterPackageId,
    arguments: [
      ytSettlements ?? emptyRewardSettlements(tx, config),
      tx.object(requireRewardDistributor(config)),
      ptAmount,
      priceInfo,
      pyPosition as string,
      marketStateId(config),
      requireGlobalConfig(config),
    ],
    typeArguments: marketStateTypeArgs(config),
  })(tx);
  return [
    result[0] as TransactionObjectArgument,
    result[1] as TransactionArgument,
  ];
}

export function addRedeemAfterExpiry(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return redeemMarketStateAfterExpiry({
    package: config.jitterPackageId,
    arguments: [
      ptAmount,
      pyPosition as string,
      marketStateId(config),
      requireGlobalConfig(config),
    ],
    typeArguments: marketStateTypeArgs(config),
  })(tx) as TransactionObjectArgument;
}

export function addClaimYtInterest(
  tx: Transaction,
  config: JitterMarketConfig,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const priceInfoOption = tx.moveCall({
    target: "0x1::option::some",
    typeArguments: [
      `${config.oraclePackageId}::price_info::PriceInfo<${config.syTypeTag}>`,
    ],
    arguments: [priceInfo],
  });
  return tx.moveCall({
    target: `${config.jitterPackageId}::router::claim_market_state_yt_interest`,
    arguments: [
      priceInfoOption,
      typeof pyPosition === "string" ? tx.object(pyPosition) : pyPosition,
      tx.object(marketStateId(config)),
      tx.object(requireGlobalConfig(config)),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  }) as TransactionObjectArgument;
}
