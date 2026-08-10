import type {
  Transaction,
  TransactionArgument,
  TransactionObjectArgument,
} from "@mysten/sui/transactions";

import type { JitterMarketConfig } from "./types.js";

type LiquidlinkPointScope = "yt" | "lp" | "pool";

export type LiquidlinkPointCheckpointScope = "yt" | "lp";
export type LiquidlinkPointCheckpointVersion = bigint | number | string;

const MOVE_U64_MAX = (1n << 64n) - 1n;

type LiquidlinkPointProgramRuntime = {
  extensionsPackageId: string;
  globalConfigObjectId: string;
  liquidlinkPackageId: string;
  liquidlinkGlobalConfigObjectId: string;
  projectObjectId: string;
  pointConfigObjectId: string;
  scoreboardObjectId: string;
  lpPointStateObjectId?: string;
  referralPackageId?: string;
  scopes: LiquidlinkPointScope[];
  referral?: {
    policyStateObjectId: string;
    referralTableObjectId: string;
  };
};

function asObjectArg(
  tx: Transaction,
  value: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return typeof value === "string" ? tx.object(value) : value;
}

function orderIdsArg(tx: Transaction, orderIds: Array<bigint | number | string>) {
  return tx.pure.vector(
    "u64",
    orderIds.map((value) => BigInt(value)),
  );
}

function configuredLiquidlinkPointPrograms(
  config: JitterMarketConfig,
): LiquidlinkPointProgramRuntime[] {
  const liquidlink = config.liquidlink;
  if (!config.jitterExtensionsPackageId || !liquidlink) return [];
  if (liquidlink.enabled === false) return [];
  if (!liquidlink.liquidlinkGlobalConfigObjectId || !config.globalConfigObjectId) {
    return [];
  }
  if (!liquidlink.liquidlinkPackageId) {
    throw new Error("LiquidLink points require liquidlinkPackageId in market config.");
  }

  if (liquidlink.pointPrograms?.length) {
    const programs = liquidlink.pointPrograms.flatMap((program) => {
      if (program.enabled === false) return [];
      const scopes = program.scopes
        ?? (program.lpPointStateObjectId
          ? ["yt", "lp", "pool"] as LiquidlinkPointScope[]
          : ["yt"] as LiquidlinkPointScope[]);
      const hasLp = scopes.includes("lp");
      const hasPool = scopes.includes("pool");
      if (hasLp !== hasPool) {
        throw new Error(
          `LiquidLink point program "${program.label}" must attach LP and pool scopes together.`,
        );
      }
      if ((hasLp || hasPool) && !program.lpPointStateObjectId) {
        throw new Error(
          `LiquidLink point program "${program.label}" requires lpPointStateObjectId for LP and pool settlement.`,
        );
      }
      if (!program.projectObjectId) {
        throw new Error(
          `LiquidLink point program "${program.label}" requires projectObjectId.`,
        );
      }
      return [{
        extensionsPackageId: config.jitterExtensionsPackageId!,
        globalConfigObjectId: config.globalConfigObjectId!,
        liquidlinkPackageId: liquidlink.liquidlinkPackageId!,
        liquidlinkGlobalConfigObjectId:
          liquidlink.liquidlinkGlobalConfigObjectId!,
        projectObjectId: program.projectObjectId,
        pointConfigObjectId: program.pointConfigObjectId,
        scoreboardObjectId: program.scoreboardObjectId,
        lpPointStateObjectId: program.lpPointStateObjectId,
        referralPackageId: liquidlink.referralPackageId,
        scopes,
        referral: program.referral,
      }];
    });
    const seenPointConfigs = new Set<string>();
    for (const program of programs) {
      const key = program.pointConfigObjectId.toLowerCase();
      if (seenPointConfigs.has(key)) {
        throw new Error(
          `LiquidLink pointPrograms contains duplicate PointConfig ${program.pointConfigObjectId}.`,
        );
      }
      seenPointConfigs.add(key);
    }
    return programs;
  }

  const pointConfigObjectId =
    liquidlink.pointConfigObjectId ?? config.liquidlinkPointConfigObjectId;
  const scoreboardObjectId =
    liquidlink.scoreboardObjectId ?? config.liquidlinkScoreboardObjectId;
  const projectObjectId = liquidlink.projectObjectId;
  const enabled =
    liquidlink.enabled ?? Boolean(pointConfigObjectId && scoreboardObjectId);
  if (!enabled || !pointConfigObjectId || !scoreboardObjectId) return [];
  if (!projectObjectId) {
    throw new Error("LiquidLink points require projectObjectId in market config.");
  }

  return [{
    extensionsPackageId: config.jitterExtensionsPackageId,
    globalConfigObjectId: config.globalConfigObjectId,
    liquidlinkPackageId: liquidlink.liquidlinkPackageId,
    liquidlinkGlobalConfigObjectId:
      liquidlink.liquidlinkGlobalConfigObjectId,
    projectObjectId,
    pointConfigObjectId,
    scoreboardObjectId,
    lpPointStateObjectId: liquidlink.lpPointStateObjectId,
    referralPackageId: liquidlink.referralPackageId,
    scopes: liquidlink.lpPointStateObjectId
      ? ["yt", "lp", "pool"]
      : ["yt"],
  }];
}

function requireLiquidlinkPointPrograms(
  config: JitterMarketConfig,
  scope: LiquidlinkPointScope,
  emptyMessage = "LiquidLink points are not enabled for this project.",
): LiquidlinkPointProgramRuntime[] {
  if (!config.jitterExtensionsPackageId) {
    throw new Error("LiquidLink points require jitterExtensionsPackageId in market config.");
  }
  if (!config.liquidlink?.liquidlinkGlobalConfigObjectId) {
    throw new Error(
      "LiquidLink points require liquidlinkGlobalConfigObjectId in market config.",
    );
  }
  if (!config.liquidlink?.liquidlinkPackageId) {
    throw new Error("LiquidLink points require liquidlinkPackageId in market config.");
  }
  if (!config.globalConfigObjectId) {
    throw new Error("LiquidLink points require globalConfigObjectId in market config.");
  }
  const programs = configuredLiquidlinkPointPrograms(config).filter(
    (program) => program.scopes.includes(scope),
  );
  if (programs.length === 0) {
    throw new Error(emptyMessage);
  }
  return programs;
}

function requireLiquidlinkPoints(config: JitterMarketConfig) {
  return requireLiquidlinkPointPrograms(config, "yt")[0]!;
}

function requireLiquidlinkLpPoints(config: JitterMarketConfig) {
  return requireLiquidlinkPointPrograms(config, "lp")[0]! as
    LiquidlinkPointProgramRuntime & { lpPointStateObjectId: string };
}

function requirePtOrderbook(config: JitterMarketConfig): string {
  if (!config.orderbookObjectId) {
    throw new Error("This market config does not include a PT orderbook object id.");
  }
  return config.orderbookObjectId;
}

function requireRewardDistributor(config: JitterMarketConfig): string {
  if (!config.rewardDistributorObjectId) {
    throw new Error("LiquidLink reward settlement requires rewardDistributorObjectId in market config.");
  }
  return config.rewardDistributorObjectId;
}

function settleLiquidlinkStamp(
  tx: Transaction,
  liquidlink: LiquidlinkPointProgramRuntime,
  stamp: TransactionArgument,
): void {
  tx.moveCall({
    target: `${liquidlink.liquidlinkPackageId}::stamp::settle_stamp`,
    arguments: [
      tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
      tx.object(liquidlink.projectObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      stamp,
      tx.object.clock(),
    ],
  });
}

function applyYtReferralPolicy(
  tx: Transaction,
  liquidlink: LiquidlinkPointProgramRuntime,
  referralRecordObjectId: string,
  stamp: TransactionArgument,
): void {
  if (!liquidlink.referral) {
    throw new Error(
      `LiquidLink PointConfig ${liquidlink.pointConfigObjectId} has a YT referral record but no referral policy configuration.`,
    );
  }
  tx.moveCall({
    target: `${requireReferralPackageId(liquidlink)}::referral_policy::apply_yt_bonus_policy`,
    arguments: [
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
      tx.object(liquidlink.projectObjectId),
      tx.object(liquidlink.referral.policyStateObjectId),
      tx.object(referralRecordObjectId),
      stamp,
    ],
  });
}

function applyLpReferralPolicy(
  tx: Transaction,
  liquidlink: LiquidlinkPointProgramRuntime,
  referralRecordObjectId: string,
  stamp: TransactionArgument,
): void {
  if (!liquidlink.referral) {
    throw new Error(
      `LiquidLink PointConfig ${liquidlink.pointConfigObjectId} has an LP referral record but no referral policy configuration.`,
    );
  }
  tx.moveCall({
    target: `${requireReferralPackageId(liquidlink)}::referral_policy::apply_lp_bonus_policy`,
    arguments: [
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
      tx.object(liquidlink.projectObjectId),
      tx.object(liquidlink.referral.policyStateObjectId),
      tx.object(referralRecordObjectId),
      stamp,
    ],
  });
}

function requireReferralPackageId(liquidlink: LiquidlinkPointProgramRuntime): string {
  const packageId = liquidlink.referralPackageId;
  if (!packageId) {
    throw new Error("YT referral settlement requires liquidlink.referralPackageId in market config.");
  }
  return packageId;
}

function marketStateObjectId(config: JitterMarketConfig): string {
  return config.marketStateObjectId ?? config.marketObjectId;
}

function marketStateTypeArgs(config: JitterMarketConfig): [string, string, string] {
  return [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
}

function checkpointVersion(
  value: LiquidlinkPointCheckpointVersion,
  field: string,
): bigint {
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new Error(`${field} must be a safe integer when supplied as a number.`);
  }
  if (typeof value === "string" && !/^\d+$/.test(value)) {
    throw new Error(`${field} must be an unsigned integer.`);
  }
  const normalized = BigInt(value);
  if (normalized < 0n || normalized > MOVE_U64_MAX) {
    throw new Error(`${field} must fit in a Move u64.`);
  }
  return normalized;
}

/**
 * Returns the next explicit checkpoint target, or null when the state is current.
 * Re-read the applied version after each successful transaction before planning
 * the next target so concurrent permissionless checkpointing remains harmless.
 */
export function nextLiquidlinkPointCheckpointTarget(
  appliedVersion: LiquidlinkPointCheckpointVersion,
  currentVersion: LiquidlinkPointCheckpointVersion,
  versionsPerTransaction: LiquidlinkPointCheckpointVersion,
): bigint | null {
  const applied = checkpointVersion(appliedVersion, "appliedVersion");
  const current = checkpointVersion(currentVersion, "currentVersion");
  const batchSize = checkpointVersion(
    versionsPerTransaction,
    "versionsPerTransaction",
  );
  if (applied > current) {
    throw new Error("appliedVersion cannot exceed currentVersion.");
  }
  if (batchSize === 0n) {
    throw new Error("versionsPerTransaction must be greater than zero.");
  }
  if (applied === current) return null;

  const remaining = current - applied;
  return applied + (batchSize < remaining ? batchSize : remaining);
}

function requireLiquidlinkCheckpointProgram(
  config: JitterMarketConfig,
  scope: LiquidlinkPointCheckpointScope,
  pointConfigObjectId: string,
): LiquidlinkPointProgramRuntime {
  const normalizedId = pointConfigObjectId.toLowerCase();
  const program = requireLiquidlinkPointPrograms(
    config,
    scope,
    `LiquidLink ${scope.toUpperCase()} checkpoint is not configured for PointConfig ${pointConfigObjectId}.`,
  ).find(
    (candidate) => candidate.pointConfigObjectId.toLowerCase() === normalizedId,
  );
  if (!program) {
    throw new Error(
      `LiquidLink ${scope.toUpperCase()} checkpoint is not configured for PointConfig ${pointConfigObjectId}.`,
    );
  }
  return program;
}

export function addCheckpointYtPointConfigToVersion(
  tx: Transaction,
  config: JitterMarketConfig,
  pointConfigObjectId: string,
  targetVersion: LiquidlinkPointCheckpointVersion,
): void {
  const liquidlink = requireLiquidlinkCheckpointProgram(
    config,
    "yt",
    pointConfigObjectId,
  );
  tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::checkpoint_yt_config_to_version`,
    typeArguments: marketStateTypeArgs(config),
    arguments: [
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(marketStateObjectId(config)),
      tx.pure.u64(checkpointVersion(targetVersion, "targetVersion")),
      tx.object.clock(),
    ],
  });
}

export function addCheckpointLpPointConfigToVersion(
  tx: Transaction,
  config: JitterMarketConfig,
  pointConfigObjectId: string,
  targetVersion: LiquidlinkPointCheckpointVersion,
): void {
  const liquidlink = requireLiquidlinkCheckpointProgram(
    config,
    "lp",
    pointConfigObjectId,
  );
  if (!liquidlink.lpPointStateObjectId) {
    throw new Error(
      `LiquidLink LP checkpoint requires lpPointStateObjectId for PointConfig ${pointConfigObjectId}.`,
    );
  }
  tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::checkpoint_lp_config_to_version`,
    typeArguments: marketStateTypeArgs(config),
    arguments: [
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(marketStateObjectId(config)),
      tx.pure.u64(checkpointVersion(targetVersion, "targetVersion")),
      tx.object.clock(),
    ],
  });
}

function unsupportedLiquidlinkRoute(): never {
  throw new Error(
    "Legacy Liquidlink route wrappers were removed from the MarketState contracts. Use createJitterTransactionService so reward settlement is composed through the core router.",
  );
}

export function hasLiquidlinkPointsConfig(
  config: JitterMarketConfig | null | undefined,
): boolean {
  if (!config) return false;
  return configuredLiquidlinkPointPrograms(config).some(
    (program) => program.scopes.includes("yt"),
  );
}

export function hasLiquidlinkLpPointsConfig(
  config: JitterMarketConfig | null | undefined,
): boolean {
  if (!config) return false;
  return configuredLiquidlinkPointPrograms(config).some(
    (program) =>
      program.scopes.includes("lp")
      && program.scopes.includes("pool")
      && Boolean(program.lpPointStateObjectId),
  );
}

export function addMintPyFromSyWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::mint_py_from_sy_with_points`,
    arguments: [
      syCoin,
      priceInfo,
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  }) as TransactionArgument;
}

export function addSwapSyForPtWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  minPtOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_sy_for_pt_to_position_with_points`,
    arguments: [
      syCoin,
      tx.pure.u64(minPtOut),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapSyForExactPtWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  ptOut: bigint,
  maxSyIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_sy_for_exact_pt_to_position_with_points`,
    arguments: [
      syCoin,
      tx.pure.u64(ptOut),
      tx.pure.u64(maxSyIn),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapPtForSyWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_pt_for_sy_from_position_with_points`,
    arguments: [
      tx.pure.u64(ptAmount),
      tx.pure.u64(minSyOut),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  }) as TransactionObjectArgument;
}

export function addSwapPtForExactSyWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syOut: bigint,
  maxPtIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_pt_for_exact_sy_from_position_with_points`,
    arguments: [
      tx.pure.u64(syOut),
      tx.pure.u64(maxPtIn),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapSyForYtWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  minYtOut: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_sy_for_yt_to_position_with_points`,
    arguments: [
      syCoin,
      tx.pure.u64(minYtOut),
      tx.pure.u64(minSyOut),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      priceInfo,
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapSyForExactYtWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  ytOut: bigint,
  maxSyIn: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_sy_for_exact_yt_to_position_with_points`,
    arguments: [
      syCoin,
      tx.pure.u64(ytOut),
      tx.pure.u64(maxSyIn),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      priceInfo,
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addSwapYtForSyWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  ytAmount: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_yt_for_sy_to_position_with_points`,
    arguments: [
      tx.pure.u64(ytAmount),
      tx.pure.u64(minSyOut),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      priceInfo,
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  }) as TransactionObjectArgument;
}

export function addHybridSwapSyForPtWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  orderIds: Array<bigint | number | string>,
  maxBookPriceRaw: bigint,
  minTotalPtOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_sy_for_pt_orderbook_then_amm_with_points`,
    arguments: [
      syCoin,
      tx.object(requirePtOrderbook(config)),
      orderIdsArg(tx, orderIds),
      tx.pure.u128(maxBookPriceRaw),
      tx.pure.u64(minTotalPtOut),
      tx.object(config.marketObjectId),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  }) as TransactionObjectArgument;
}

export function addHybridSwapPtForSyWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  orderIds: Array<bigint | number | string>,
  minBookPriceRaw: bigint,
  minTotalSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::swap_pt_for_sy_orderbook_then_amm_with_points`,
    arguments: [
      tx.pure.u64(ptAmount),
      tx.object(requirePtOrderbook(config)),
      orderIdsArg(tx, orderIds),
      tx.pure.u128(minBookPriceRaw),
      tx.pure.u64(minTotalSyOut),
      tx.object(config.marketObjectId),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  }) as TransactionObjectArgument;
}

export function addRedeemBeforeExpiryWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const liquidlink = requireLiquidlinkPoints(config);
  const owner = tx.getData().sender;
  if (!owner) {
    throw new Error("Reward-aware redeem requires the transaction sender to be set.");
  }
  const position = asObjectArg(tx, pyPosition);
  const distributorId = requireRewardDistributor(config);
  const positionId = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::id`,
    arguments: [position],
  }) as TransactionArgument;
  const exposure = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::yt_balance`,
    arguments: [position],
  }) as TransactionArgument;
  const guard = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::yt_reward_guard`,
    arguments: [position],
  }) as TransactionArgument;
  const operation = tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::begin_scoped_operation_with_guard`,
    arguments: [
      tx.object(distributorId),
      tx.object(liquidlink.globalConfigObjectId),
      tx.pure.u8(1),
      tx.pure.address(owner),
      positionId,
      exposure,
      guard,
    ],
  }) as TransactionArgument;
  addSettleYtRewardOperationWithLiquidlinkPoints(tx, config, operation, position);
  const settlement = tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::finish_operation`,
    arguments: [tx.object(liquidlink.globalConfigObjectId), operation],
  }) as TransactionArgument;
  const settlements = tx.makeMoveVec({
    type: `${config.jitterPackageId}::reward_distributor::RewardSettlement`,
    elements: [settlement as TransactionObjectArgument],
  });

  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::redeem_py`,
    arguments: [
      settlements,
      tx.object(distributorId),
      tx.pure.u64(ptAmount),
      priceInfo,
      position,
      tx.object(marketStateObjectId(config)),
      tx.object(liquidlink.globalConfigObjectId),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });

  const postOperations = result[1] as TransactionArgument;
  const postOperation = tx.moveCall({
    target: "0x1::vector::pop_back",
    arguments: [postOperations],
    typeArguments: [`${config.jitterPackageId}::reward_distributor::RewardOperation`],
  }) as TransactionArgument;
  addSettleYtRewardOperationWithLiquidlinkPoints(tx, config, postOperation, position);
  const postSettlement = tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::finish_operation`,
    arguments: [tx.object(liquidlink.globalConfigObjectId), postOperation],
  }) as TransactionArgument;
  tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::destroy_settlement`,
    arguments: [tx.object(liquidlink.globalConfigObjectId), postSettlement],
  });
  tx.moveCall({
    target: "0x1::vector::destroy_empty",
    arguments: [postOperations],
    typeArguments: [`${config.jitterPackageId}::reward_distributor::RewardOperation`],
  });

  return result[0] as TransactionObjectArgument;
}

export function addRedeemAfterExpiryWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  ptAmount: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::redeem_after_expiry_with_points`,
    arguments: [
      tx.pure.u64(ptAmount),
      priceInfo,
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  }) as TransactionObjectArgument;
}

export function addClaimYtInterestWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkPoints(config);
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::claim_yt_interest_with_points`,
    arguments: [
      priceInfo,
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  }) as TransactionObjectArgument;
}

export function addLiquidityFromPositionWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  ptAmount: bigint | TransactionArgument,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
  lpPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::add_liquidity_from_position_with_points`,
    arguments: [
      syCoin,
      typeof ptAmount === "bigint"
        ? tx.pure.u64(ptAmount as bigint)
        : (ptAmount as TransactionArgument),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      priceInfo,
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionObjectArgument,
  ];
}

export function addLiquidityKeepYtFromPositionWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  syToMint: bigint,
  minLpOut: bigint,
  priceInfo: TransactionObjectArgument,
  pyPosition: TransactionObjectArgument | string,
  lpPosition: TransactionObjectArgument | string,
): [TransactionArgument, TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::add_liquidity_keep_yt_from_sy_with_points`,
    arguments: [
      syCoin,
      tx.pure.u64(syToMint),
      tx.pure.u64(minLpOut),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      priceInfo,
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionObjectArgument,
  ];
}

export function addLiquidityFromSyWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  syToMintHint: bigint,
  minLpOut: bigint,
  minSyOut: bigint,
  priceInfo: TransactionObjectArgument,
  position: TransactionObjectArgument | string,
): [TransactionArgument, TransactionObjectArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::add_liquidity_from_sy_with_points`,
    arguments: [
      syCoin,
      tx.pure.u64(syToMintHint),
      tx.pure.u64(minLpOut),
      tx.pure.u64(minSyOut),
      tx.object(config.poolObjectId),
      asObjectArg(tx, position),
      tx.object(config.pyStateObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      priceInfo,
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionArgument, result[1] as TransactionObjectArgument];
}

export function addRemoveLiquidityToPositionWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  lpAmount: bigint,
  pyPosition: TransactionObjectArgument | string,
  lpPosition: TransactionObjectArgument | string,
): [TransactionObjectArgument, TransactionArgument] {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  const result = tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::remove_liquidity_to_position_with_points`,
    arguments: [
      tx.pure.u64(lpAmount),
      tx.object(config.poolObjectId),
      asObjectArg(tx, pyPosition),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
  return [result[0] as TransactionObjectArgument, result[1] as TransactionArgument];
}

export function addSyncPyPositionWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  pyPosition: TransactionObjectArgument | string,
  referralRecordObjectIds: Readonly<Record<string, string>> = {},
  pointConfigObjectIds?: readonly string[],
): void {
  const position = asObjectArg(tx, pyPosition);
  const selectedPointConfigs = pointConfigObjectIds?.length
    ? new Set(pointConfigObjectIds.map((id) => id.toLowerCase()))
    : undefined;
  for (const liquidlink of requireLiquidlinkPointPrograms(config, "yt")) {
    if (selectedPointConfigs && !selectedPointConfigs.has(liquidlink.pointConfigObjectId.toLowerCase())) {
      continue;
    }
    const referralRecordObjectId = referralRecordObjectIds[liquidlink.pointConfigObjectId.toLowerCase()]
      ?? referralRecordObjectIds[liquidlink.pointConfigObjectId];
    if (referralRecordObjectId && !liquidlink.referral) {
      throw new Error(
        `LiquidLink PointConfig ${liquidlink.pointConfigObjectId} has a YT referral record but no referral policy configuration.`,
      );
    }
    const stamp = tx.moveCall({
      target: `${liquidlink.extensionsPackageId}::liquidlink_points::${
        referralRecordObjectId
          ? "sync_py_position_with_referral_points"
          : "sync_py_position_with_points"
      }`,
      arguments: referralRecordObjectId
        ? [
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.projectObjectId),
            tx.object(liquidlink.referral!.policyStateObjectId),
            tx.object(referralRecordObjectId),
            position,
            tx.object(marketStateObjectId(config)),
            tx.object.clock(),
          ]
        : [
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.projectObjectId),
            tx.object(liquidlink.globalConfigObjectId),
            position,
            tx.object(marketStateObjectId(config)),
            tx.object.clock(),
          ],
      typeArguments: marketStateTypeArgs(config),
    }) as TransactionArgument;
    if (referralRecordObjectId) {
      applyYtReferralPolicy(tx, liquidlink, referralRecordObjectId, stamp);
    }
    settleLiquidlinkStamp(tx, liquidlink, stamp);
  }
}

export function addSettleYtRewardOperationWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  operation: TransactionArgument,
  pyPosition: TransactionObjectArgument | string,
  referralRecordObjectIds: Readonly<Record<string, string>> = {},
): void {
  const position = asObjectArg(tx, pyPosition);
  const distributorId = requireRewardDistributor(config);
  for (const liquidlink of requireLiquidlinkPointPrograms(config, "yt")) {
    const referralRecordObjectId = referralRecordObjectIds[liquidlink.pointConfigObjectId.toLowerCase()]
      ?? referralRecordObjectIds[liquidlink.pointConfigObjectId];
    if (referralRecordObjectId && !liquidlink.referral) {
      throw new Error(
        `LiquidLink PointConfig ${liquidlink.pointConfigObjectId} has a YT referral record but no referral policy configuration.`,
      );
    }
    const stamp = tx.moveCall({
      target: `${liquidlink.extensionsPackageId}::liquidlink_points::${
        referralRecordObjectId
          ? "settle_yt_reward_operation_with_referral"
          : "settle_yt_reward_operation"
      }`,
      typeArguments: marketStateTypeArgs(config),
      arguments: referralRecordObjectId
        ? [
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.projectObjectId),
            tx.object(liquidlink.referral!.policyStateObjectId),
            tx.object(referralRecordObjectId),
            tx.object(distributorId),
            operation,
            position,
            tx.object(marketStateObjectId(config)),
            tx.object.clock(),
          ]
        : [
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.projectObjectId),
            tx.object(distributorId),
            operation,
            position,
            tx.object(marketStateObjectId(config)),
            tx.object.clock(),
          ],
    }) as TransactionArgument;
    if (referralRecordObjectId) {
      applyYtReferralPolicy(tx, liquidlink, referralRecordObjectId, stamp);
    }
    settleLiquidlinkStamp(tx, liquidlink, stamp);
  }
}

export function addSettleLpRewardOperationWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  operation: TransactionArgument,
  lpPosition: TransactionObjectArgument | string,
  referralRecordObjectIds: Readonly<Record<string, string>> = {},
): void {
  const position = asObjectArg(tx, lpPosition);
  const distributorId = requireRewardDistributor(config);
  for (const liquidlink of requireLiquidlinkPointPrograms(config, "lp")) {
    const referralRecordObjectId =
      referralRecordObjectIds[liquidlink.pointConfigObjectId.toLowerCase()]
      ?? referralRecordObjectIds[liquidlink.pointConfigObjectId];
    if (referralRecordObjectId && !liquidlink.referral) {
      throw new Error(
        `LiquidLink PointConfig ${liquidlink.pointConfigObjectId} has a referral record but no referral policy configuration.`,
      );
    }
    const settlementFunction = referralRecordObjectId
      ? "settle_lp_reward_operation_with_referral"
      : "settle_lp_reward_operation";
    const stamp = tx.moveCall({
      target: `${liquidlink.extensionsPackageId}::liquidlink_points::${settlementFunction}`,
      typeArguments: marketStateTypeArgs(config),
      arguments: referralRecordObjectId
        ? [
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.lpPointStateObjectId!),
            tx.object(liquidlink.scoreboardObjectId),
            tx.object(distributorId),
            operation,
            tx.object(liquidlink.projectObjectId),
            tx.object(liquidlink.referral!.policyStateObjectId),
            tx.object(referralRecordObjectId),
            tx.object(marketStateObjectId(config)),
            position,
            tx.object.clock(),
          ]
        : [
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.lpPointStateObjectId!),
            tx.object(liquidlink.projectObjectId),
            tx.object(distributorId),
            operation,
            tx.object(marketStateObjectId(config)),
            position,
            tx.object.clock(),
          ],
    }) as TransactionArgument;
    settleLiquidlinkStamp(tx, liquidlink, stamp);
  }
}

export function addCreateLpReferralRecordWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  pointConfigObjectId: string,
  position: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const liquidlink = requireLiquidlinkPointPrograms(config, "lp").find(
    (program) => program.pointConfigObjectId.toLowerCase() === pointConfigObjectId.toLowerCase(),
  );
  if (!liquidlink?.referral) {
    throw new Error(`Referral is not configured for PointConfig ${pointConfigObjectId}.`);
  }
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::create_lp_referral_record_with_points`,
    typeArguments: marketStateTypeArgs(config),
    arguments: [
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
      tx.object(liquidlink.projectObjectId),
      tx.object(liquidlink.referral.policyStateObjectId),
      tx.object(liquidlink.referral.referralTableObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId!),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, position),
      tx.object.clock(),
    ],
  }) as TransactionObjectArgument;
}

export function addCreateYtReferralRecordWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  pointConfigObjectId: string,
  position: TransactionObjectArgument | string,
): TransactionObjectArgument {
  const liquidlink = requireLiquidlinkPointPrograms(config, "yt").find(
    (program) => program.pointConfigObjectId.toLowerCase() === pointConfigObjectId.toLowerCase(),
  );
  if (!liquidlink?.referral) {
    throw new Error(`Referral is not configured for PointConfig ${pointConfigObjectId}.`);
  }
  return tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::create_yt_referral_record_with_points`,
    typeArguments: marketStateTypeArgs(config),
    arguments: [
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
      tx.object(liquidlink.projectObjectId),
      tx.object(liquidlink.referral.policyStateObjectId),
      tx.object(liquidlink.referral.referralTableObjectId),
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(marketStateObjectId(config)),
      asObjectArg(tx, position),
      tx.object.clock(),
    ],
  }) as TransactionObjectArgument;
}

export function addSettlePoolRewardOperationWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  operation: TransactionArgument,
): void {
  const distributorId = requireRewardDistributor(config);
  for (const liquidlink of requireLiquidlinkPointPrograms(config, "pool")) {
    tx.moveCall({
      target: `${liquidlink.extensionsPackageId}::liquidlink_points::settle_pool_reward_operation`,
      typeArguments: marketStateTypeArgs(config),
      arguments: [
        tx.object(liquidlink.globalConfigObjectId),
        tx.object(liquidlink.pointConfigObjectId),
        tx.object(liquidlink.lpPointStateObjectId!),
        tx.object(distributorId),
        operation,
        tx.object(marketStateObjectId(config)),
        tx.object.clock(),
      ],
    });
  }
}

export function addSettleLpPositionWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  lpPosition: TransactionObjectArgument | string,
): void {
  return unsupportedLiquidlinkRoute();
  const liquidlink = requireLiquidlinkLpPoints(config);
  tx.moveCall({
    target: `${liquidlink.extensionsPackageId}::liquidlink_points::settle_lp_position_with_points`,
    arguments: [
      tx.object(liquidlink.pointConfigObjectId),
      tx.object(liquidlink.lpPointStateObjectId),
      tx.object(liquidlink.scoreboardObjectId),
      tx.object(liquidlink.globalConfigObjectId),
      tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
      tx.object(config.poolObjectId),
      asObjectArg(tx, lpPosition),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag],
  });
}

export function addClaimLpPointsWithLiquidlinkPoints(
  tx: Transaction,
  config: JitterMarketConfig,
  lpPosition: TransactionObjectArgument | string,
  referralRecordObjectIds: Readonly<Record<string, string>> = {},
  pointConfigObjectIds?: readonly string[],
): void {
  const position = asObjectArg(tx, lpPosition);
  const selectedPointConfigs = pointConfigObjectIds?.length
    ? new Set(pointConfigObjectIds.map((id) => id.toLowerCase()))
    : undefined;

  for (const liquidlink of requireLiquidlinkPointPrograms(config, "lp")) {
    if (selectedPointConfigs && !selectedPointConfigs.has(liquidlink.pointConfigObjectId.toLowerCase())) {
      continue;
    }
    const referralRecordObjectId =
      referralRecordObjectIds[liquidlink.pointConfigObjectId.toLowerCase()]
      ?? referralRecordObjectIds[liquidlink.pointConfigObjectId];
    if (referralRecordObjectId && !liquidlink.referral) {
      throw new Error(
        `LiquidLink PointConfig ${liquidlink.pointConfigObjectId} has an LP referral record but no referral policy configuration.`,
      );
    }

    const result = tx.moveCall({
      target: `${liquidlink.extensionsPackageId}::liquidlink_points::${
        referralRecordObjectId
          ? "claim_lp_points_with_referral_points"
          : "claim_lp_points_with_points"
      }`,
      arguments: referralRecordObjectId
        ? [
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.lpPointStateObjectId!),
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(liquidlink.projectObjectId),
            tx.object(liquidlink.referral!.policyStateObjectId),
            tx.object(referralRecordObjectId),
            tx.object(marketStateObjectId(config)),
            position,
            tx.object.clock(),
          ]
        : [
            tx.object(liquidlink.pointConfigObjectId),
            tx.object(liquidlink.lpPointStateObjectId!),
            tx.object(liquidlink.projectObjectId),
            tx.object(liquidlink.globalConfigObjectId),
            tx.object(liquidlink.liquidlinkGlobalConfigObjectId),
            tx.object(marketStateObjectId(config)),
            position,
            tx.object.clock(),
          ],
      typeArguments: marketStateTypeArgs(config),
    });
    const stamp = result[1] as TransactionArgument;
    if (referralRecordObjectId) {
      applyLpReferralPolicy(tx, liquidlink, referralRecordObjectId, stamp);
    }
    settleLiquidlinkStamp(tx, liquidlink, stamp);
  }
}

/** @deprecated Use addSettleLpPositionWithLiquidlinkPoints. */
export const addSyncLpPositionWithLiquidlinkPoints = addSettleLpPositionWithLiquidlinkPoints;
