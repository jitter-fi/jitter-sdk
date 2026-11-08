import {
  Transaction,
  TransactionDataBuilder,
  type Argument,
} from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import {
  addClaimLpPointsWithLiquidlinkPoints,
  addSyncPyPositionWithLiquidlinkPoints,
} from "../liquidlink-points.js";
import { liquidlinkPointPrograms } from "../infrastructure/point-claims-reader.js";
import { createWalletPointSettlementDependencies } from "../infrastructure/wallet-point-settlement-reader.js";
import type {
  JitterLiquidlinkPointProgramConfig,
  JitterMarketConfig,
} from "../types.js";
import type { GrpcNetworkKind } from "../rpc.js";

export type WalletPointPosition = {
  id: string;
  marketId: string;
  poolId: string;
  ytBalance: bigint;
  lpAmount: bigint;
};
export type WalletPointSettlementDependencies = {
  getPositions(
    owner: string,
    configs: readonly JitterMarketConfig[],
  ): Promise<WalletPointPosition[]>;
  resolveConfig(config: JitterMarketConfig): Promise<JitterMarketConfig>;
  hasLedger(
    config: JitterMarketConfig,
    program: JitterLiquidlinkPointProgramConfig,
    positionId: string,
    scope: "yt" | "lp",
  ): Promise<boolean>;
  getReferralRecords(
    config: JitterMarketConfig,
    owner: string,
    positionId: string,
    scope: "yt" | "lp",
  ): Promise<Record<string, string>>;
  assertClosedPrepared(
    config: JitterMarketConfig,
    owner: string,
  ): Promise<void>;
};
export type WalletPointSettlementPlan = {
  kind: "combined" | "batches";
  transaction: Transaction | null;
  batches: Transaction[];
  targetCount: number;
  coveredCount: number;
  positionCount: number;
};
type Target = {
  config: JitterMarketConfig;
  program: JitterLiquidlinkPointProgramConfig;
  positionId: string;
  scope: "yt" | "lp";
  records: Record<string, string>;
};
const key = (program: string, position: string, scope: string) =>
  `${normalizeSuiAddress(program)}:${normalizeSuiAddress(position)}:${scope}`;

/** Only the known SDK settlement ABI is recognized; unrelated Move calls never suppress a checkpoint. */
function coveredTargets(
  transaction: Transaction,
  configs: readonly JitterMarketConfig[],
): Set<string> {
  const data = transaction.getData();
  const objectId = (arg: Argument | undefined) => {
    if (!arg || !("Input" in arg)) return null;
    const input = data.inputs[arg.Input];
    return (
      input?.UnresolvedObject?.objectId ??
      input?.Object?.ImmOrOwnedObject?.objectId ??
      input?.Object?.SharedObject?.objectId ??
      null
    );
  };
  const trusted = new Set(
    configs.flatMap((c) =>
      c.jitterExtensionsPackageId
        ? [normalizeSuiAddress(c.jitterExtensionsPackageId)]
        : [],
    ),
  );
  const signatures: Record<string, ["yt" | "lp", number, number]> = {
    checkpoint_yt: ["yt", 0, 4],
    sync_py_position_with_referral_points: ["yt", 2, 6],
    claim_lp_points: ["lp", 0, 6],
    claim_lp_points_with_referral_points: ["lp", 0, 8],
    settle_yt_reward_operation: ["yt", 2, 6],
    settle_yt_reward_operation_with_referral: ["yt", 2, 8],
    settle_lp_reward_operation: ["lp", 2, 8],
    settle_lp_reward_operation_with_referral: ["lp", 2, 11],
  };
  const result = new Set<string>();
  for (const command of data.commands) {
    const call = command.MoveCall;
    if (
      !call ||
      call.module !== "liquidlink_points" ||
      !trusted.has(normalizeSuiAddress(call.package))
    )
      continue;
    const signature = signatures[call.function];
    if (!signature) continue;
    const [scope, configArg, positionArg] = signature;
    const configId = objectId(call.arguments[configArg]);
    const positionId = objectId(call.arguments[positionArg]);
    if (configId && positionId) result.add(key(configId, positionId, scope));
  }
  return result;
}

function appendTarget(tx: Transaction, target: Target) {
  // Disabled sources can still have an earned settlement tail. This changes SDK composition only, never on-chain enablement.
  const config = {
    ...target.config,
    liquidlink: {
      ...target.config.liquidlink!,
      enabled: true,
      pointPrograms: [{ ...target.program, enabled: true }],
    },
  };
  if (target.scope === "yt")
    addSyncPyPositionWithLiquidlinkPoints(
      tx,
      config,
      target.positionId,
      target.records,
      [target.program.pointConfigObjectId],
    );
  else
    addClaimLpPointsWithLiquidlinkPoints(
      tx,
      config,
      target.positionId,
      target.records,
      [target.program.pointConfigObjectId],
    );
}

function withinBounds(
  tx: Transaction,
  maxCommands: number,
  maxJsonBytes: number,
) {
  const data = tx.getData();
  return (
    data.commands.length <= maxCommands &&
    new TextEncoder().encode(JSON.stringify(data)).length <= maxJsonBytes
  );
}

export function prependPointSettlement(
  transaction: Transaction,
  settlement: Transaction,
): Transaction {
  const data = new TransactionDataBuilder(
    structuredClone(transaction.getData()),
  );
  data.insertTransaction(0, settlement.getData());
  // Gas must be re-estimated for the composed transaction, not reused from the original trade.
  data.gasData.budget = null;
  data.gasData.payment = null;
  return Transaction.from(JSON.stringify(data.snapshot()));
}

export async function prepareWalletPointSettlement(options: {
  network: GrpcNetworkKind;
  owner: string;
  configs: readonly JitterMarketConfig[];
  transaction: Transaction;
  dependencies?: WalletPointSettlementDependencies;
  limits?: { maxTargets?: number; maxCommands?: number; maxJsonBytes?: number };
}): Promise<WalletPointSettlementPlan> {
  const owner = normalizeSuiAddress(options.owner);
  const sender = options.transaction.getData().sender;
  if (!sender || normalizeSuiAddress(sender) !== owner)
    throw Error("Wallet point settlement sender mismatch.");
  const deps =
    options.dependencies ??
    createWalletPointSettlementDependencies(options.network);
  const unique = new Map<string, JitterMarketConfig>();
  for (const config of options.configs) {
    const id = normalizeSuiAddress(
      config.marketStateObjectId ?? config.marketObjectId,
    );
    const previous = unique.get(id);
    if (
      previous &&
      JSON.stringify(liquidlinkPointPrograms(previous)) !==
        JSON.stringify(liquidlinkPointPrograms(config))
    )
      throw Error("Conflicting point configuration for one market.");
    unique.set(id, config);
  }
  const configs = await Promise.all(
    [...unique.values()].map((c) => deps.resolveConfig(c)),
  );
  const byMarket = new Map(
    configs.map((c) => [
      normalizeSuiAddress(c.marketStateObjectId ?? c.marketObjectId),
      c,
    ]),
  );
  const positions = await deps.getPositions(owner, configs);
  const seenPositions = new Set<string>();
  const covered = coveredTargets(options.transaction, configs);
  const targets: Target[] = [];
  let coveredCount = 0;
  const closedChecked = new Set<string>();
  for (const position of positions) {
    const positionId = normalizeSuiAddress(position.id);
    if (seenPositions.has(positionId))
      throw Error("Duplicate position in wallet point settlement read.");
    seenPositions.add(positionId);
    const config = byMarket.get(normalizeSuiAddress(position.marketId));
    if (!config)
      throw Error(
        `Owned position market ${position.marketId} is not configured; refusing partial point settlement.`,
      );
    if (!closedChecked.has(config.marketObjectId)) {
      await deps.assertClosedPrepared(config, owner);
      closedChecked.add(config.marketObjectId);
    }
    for (const program of liquidlinkPointPrograms(config)) {
      if (program.closed) continue; // assertClosedPrepared checked archival/receipts before entering live settlement.
      const scopes =
        program.scopes ??
        (program.lpPointStateObjectId ? ["yt", "lp", "pool"] : ["yt"]);
      for (const scope of ["yt", "lp"] as const) {
        if (!scopes.includes(scope)) continue;
        if (
          scope === "lp" &&
          normalizeSuiAddress(position.poolId) !==
            normalizeSuiAddress(config.poolObjectId)
        ) {
          if (position.lpAmount > 0n) throw Error("LP position pool mismatch.");
          continue;
        }
        const hasExposure =
          (scope === "yt" ? position.ytBalance : position.lpAmount) > 0n;
        const enabled =
          config.liquidlink?.enabled !== false && program.enabled !== false;
        const hasLedger =
          !hasExposure || !enabled
            ? await deps.hasLedger(config, program, positionId, scope)
            : false;
        if ((!hasExposure || !enabled) && !hasLedger) continue;
        if (covered.has(key(program.pointConfigObjectId, positionId, scope))) {
          coveredCount++;
          continue;
        }
        const records = program.referral
          ? await deps.getReferralRecords(config, owner, positionId, scope)
          : {};
        if (
          program.referral &&
          !Object.keys(records).some(
            (id) =>
              normalizeSuiAddress(id) ===
              normalizeSuiAddress(program.pointConfigObjectId),
          )
        ) {
          throw Error(
            `Position ${positionId} requires referral point preparation before wallet-wide settlement.`,
          );
        }
        targets.push({ config, program, positionId, scope, records });
      }
    }
  }
  const maxTargets = options.limits?.maxTargets ?? 40;
  const maxCommands = options.limits?.maxCommands ?? 256;
  const maxJsonBytes = options.limits?.maxJsonBytes ?? 100_000;
  if (maxTargets < 1 || maxCommands < 1 || maxJsonBytes < 1)
    throw Error("Invalid wallet settlement limits.");
  const batches: Transaction[] = [];
  let batch = new Transaction();
  batch.setSender(owner);
  let batchTargets = 0;
  for (const target of targets) {
    const candidate = Transaction.from(batch);
    appendTarget(candidate, target);
    if (
      batchTargets >= maxTargets ||
      !withinBounds(candidate, maxCommands, maxJsonBytes)
    ) {
      if (!batchTargets)
        throw Error("One point settlement exceeds the transaction bound.");
      batches.push(batch);
      batch = new Transaction();
      batch.setSender(owner);
      batchTargets = 0;
      appendTarget(batch, target);
      if (!withinBounds(batch, maxCommands, maxJsonBytes))
        throw Error("One point settlement exceeds the transaction bound.");
    } else batch = candidate;
    batchTargets++;
  }
  if (batchTargets) batches.push(batch);
  const summary = {
    targetCount: targets.length,
    coveredCount,
    positionCount: positions.length,
  };
  if (!batches.length)
    return {
      ...summary,
      kind: "combined",
      transaction: Transaction.from(options.transaction),
      batches: [],
    };
  const combined =
    batches.length === 1
      ? prependPointSettlement(options.transaction, batches[0]!)
      : null;
  if (combined && withinBounds(combined, maxCommands, maxJsonBytes))
    return { ...summary, kind: "combined", transaction: combined, batches: [] };
  return { ...summary, kind: "batches", transaction: null, batches };
}
