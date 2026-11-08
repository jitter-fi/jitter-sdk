import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import {
  addClaimLpPointsWithLiquidlinkPoints,
  addDetachLpReferralWithLiquidlinkPoints,
  addSettleLpRewardOperationWithLiquidlinkPoints,
  addSettlePoolRewardOperationWithLiquidlinkPoints,
  addSettleYtRewardOperationWithLiquidlinkPoints,
  addSyncPyPositionWithLiquidlinkPoints,
  hasLiquidlinkLpPointsConfig,
  hasLiquidlinkPointsConfig,
} from "../liquidlink-points.js";
import type { JitterMarketConfig } from "../types.js";

function objectId(byte: string): string {
  return `0x${byte.repeat(64)}`;
}

function configWithPrograms(): JitterMarketConfig {
  return {
    jitterPackageId: objectId("1"),
    jitterExtensionsPackageId: objectId("2"),
    demoAdapterPackageId: objectId("3"),
    oraclePackageId: objectId("4"),
    syStateObjectId: objectId("5"),
    globalConfigObjectId: objectId("6"),
    aclObjectId: objectId("7"),
    marketObjectId: objectId("8"),
    marketStateObjectId: objectId("8"),
    pyStateObjectId: objectId("8"),
    poolObjectId: objectId("8"),
    priceAggregatorObjectId: objectId("9"),
    demoMarketVaultObjectId: objectId("a"),
    rewardDistributorObjectId: objectId("b"),
    underlyingTypeTag: `${objectId("c")}::underlying::UNDERLYING`,
    syTypeTag: `${objectId("d")}::sy::SY`,
    ptTypeTag: `${objectId("e")}::pt::PT`,
    ytTypeTag: `${objectId("f")}::yt::YT`,
    liquidlink: {
      enabled: true,
      liquidlinkPackageId: objectId("f"),
      liquidlinkGlobalConfigObjectId: objectId("6"),
      pointPrograms: [
        {
          label: "Jitter Season 2",
          protocol: "Jitter",
          projectObjectId: objectId("a"),
          scoreboardObjectId: objectId("1"),
          pointConfigObjectId: objectId("2"),
          lpPointStateObjectId: objectId("3"),
          enabled: true,
          scopes: ["yt", "lp", "pool"],
        },
        {
          label: "Scallop Points",
          protocol: "Scallop",
          projectObjectId: objectId("b"),
          scoreboardObjectId: objectId("4"),
          pointConfigObjectId: objectId("5"),
          lpPointStateObjectId: objectId("6"),
          enabled: true,
          scopes: ["yt", "lp", "pool"],
        },
      ],
    },
  };
}

function functionCount(tx: Transaction, functionName: string): number {
  return tx.getData().commands.filter(
    (command) =>
      command.$kind === "MoveCall"
      && command.MoveCall.function === functionName,
  ).length;
}

function argumentCounts(tx: Transaction, functionName: string): number[] {
  return tx.getData().commands.flatMap((command) =>
    command.$kind === "MoveCall" && command.MoveCall.function === functionName
      ? [command.MoveCall.arguments.length]
      : [],
  );
}

describe("LiquidLink multi-program PTB composition", () => {
  test("routes mixed closed and live programs independently", () => {
    const config = configWithPrograms();
    Object.assign(config.liquidlink!.pointPrograms![0]!, { closed: true });
    for (const [builder, closed, live] of [
      [addSettleYtRewardOperationWithLiquidlinkPoints, "settle_closed_yt", "settle_yt_reward_operation"],
      [addSettleLpRewardOperationWithLiquidlinkPoints, "settle_closed_lp", "settle_lp_reward_operation"],
    ] as const) {
      const tx = new Transaction();
      builder(tx, config, tx.object(objectId("8")), objectId("7"));
      expect(functionCount(tx, closed)).toBe(1);
      expect(functionCount(tx, live)).toBe(1);
      expect(functionCount(tx, "settle_stamp")).toBe(1);
    }
  });

  test("closed exits and direct checkpoints need no LiquidLink objects", () => {
    const config = configWithPrograms();
    config.liquidlink!.pointPrograms = [config.liquidlink!.pointPrograms![0]!];
    Object.assign(config.liquidlink!.pointPrograms[0]!, { closed: true });
    delete config.liquidlink!.liquidlinkPackageId;
    delete config.liquidlink!.liquidlinkGlobalConfigObjectId;
    for (const [builder, name, count] of [
      [addSettleYtRewardOperationWithLiquidlinkPoints, "settle_closed_yt", 7],
      [addSettleLpRewardOperationWithLiquidlinkPoints, "settle_closed_lp", 8],
    ] as const) {
      const tx = new Transaction();
      builder(tx, config, tx.object(objectId("8")), objectId("7"));
      expect(argumentCounts(tx, name)).toEqual([count]);
      expect(tx.getData().commands).toHaveLength(1);
    }
    const yt = new Transaction();
    addSyncPyPositionWithLiquidlinkPoints(yt, config, objectId("7"));
    expect(argumentCounts(yt, "checkpoint_closed_yt")).toEqual([5]);
    const lp = new Transaction();
    addClaimLpPointsWithLiquidlinkPoints(lp, config, objectId("7"));
    expect(argumentCounts(lp, "checkpoint_closed_lp")).toEqual([6]);
  });

  test("closed referral exit places state and record immediately before position", () => {
    const config = configWithPrograms();
    config.liquidlink!.pointPrograms = [config.liquidlink!.pointPrograms![0]!];
    const program = config.liquidlink!.pointPrograms[0]!;
    Object.assign(program, { closed: true });
    program.referral = { policyStateObjectId: objectId("c"), referralTableObjectId: objectId("d") };
    const tx = new Transaction();
    addSettleLpRewardOperationWithLiquidlinkPoints(tx, config, tx.object(objectId("8")), objectId("7"), { [program.pointConfigObjectId]: objectId("e") });
    const calls = tx.getData().commands.flatMap(c => c.$kind === "MoveCall" ? [c.MoveCall] : []);
    expect(calls.map(c => c.function)).toEqual(["settle_closed_lp_with_referral"]);
    expect(calls[0]!.typeArguments).toEqual([config.syTypeTag, config.ptTypeTag, config.ytTypeTag]);
    const ids = calls[0]!.arguments.map(arg => {
      if (arg.$kind !== "Input") return undefined;
      const input = tx.getData().inputs[arg.Input]!;
      return input.$kind === "UnresolvedObject" ? input.UnresolvedObject.objectId
        : input.$kind === "Object" && input.Object.$kind === "SharedObject" ? input.Object.SharedObject.objectId : undefined;
    });
    expect(ids).toEqual([config.globalConfigObjectId, program.pointConfigObjectId, program.lpPointStateObjectId, config.rewardDistributorObjectId, objectId("8"), objectId("c"), objectId("e"), objectId("7"), config.marketObjectId, `0x${"0".repeat(63)}6`]);
  });

  test("detaches after caller-ordered policies and settlement in one transaction", () => {
    const config = configWithPrograms();
    config.liquidlink!.referralPackageId = objectId("9");
    const program = config.liquidlink!.pointPrograms![0]!;
    program.referral = { policyStateObjectId: objectId("a"), referralTableObjectId: objectId("b") };
    const tx = new Transaction();
    addDetachLpReferralWithLiquidlinkPoints(
      tx, config, program.pointConfigObjectId, objectId("7"), objectId("c"),
      (stamp, confirmReferral) => {
        tx.moveCall({ target: `${objectId("d")}::staking::apply_policy`, arguments: [stamp] });
        confirmReferral();
        tx.moveCall({ target: `${objectId("e")}::loyalty::apply_policy`, arguments: [stamp] });
      },
    );
    const calls = tx.getData().commands.flatMap((c) => c.$kind === "MoveCall" ? [c.MoveCall] : []);
    expect(calls.map((c) => `${c.module}::${c.function}`)).toEqual([
      "liquidlink_points::claim_lp_points_with_referral_points",
      "staking::apply_policy",
      "referral_policy::apply_lp_bonus_policy",
      "loyalty::apply_policy",
      "stamp::settle_stamp",
      "liquidlink_points::detach_lp_referral_record_with_points",
    ]);
    expect(calls[0]!.arguments).toHaveLength(10);
    expect(calls[5]!.arguments).toHaveLength(11);
    expect(calls[1]!.arguments[0]).toMatchObject({ NestedResult: [0, 1] });
    expect(calls[2]!.arguments.at(-1)).toMatchObject({ NestedResult: [0, 1] });
    expect(calls[4]!.arguments[3]).toMatchObject({ NestedResult: [0, 1] });
  });

  test("detachment rejects an unconfigured referral program before appending commands", () => {
    const tx = new Transaction();
    const config = configWithPrograms();
    expect(() => addDetachLpReferralWithLiquidlinkPoints(
      tx, config, objectId("2"), objectId("7"), objectId("c"), (_, confirm) => confirm(),
    )).toThrow("Referral is not configured");
    expect(tx.getData().commands).toHaveLength(0);
  });

  test("settles every enabled Scoreboard program for each reward scope", () => {
    const config = configWithPrograms();
    const positionId = objectId("7");
    const operationId = objectId("8");

    const ytTx = new Transaction();
    addSettleYtRewardOperationWithLiquidlinkPoints(
      ytTx,
      config,
      ytTx.object(operationId),
      positionId,
    );
    expect(functionCount(ytTx, "settle_yt_reward_operation")).toBe(2);
    expect(argumentCounts(ytTx, "settle_yt_reward_operation")).toEqual([9, 9]);
    expect(functionCount(ytTx, "settle_stamp")).toBe(2);

    const lpTx = new Transaction();
    addSettleLpRewardOperationWithLiquidlinkPoints(
      lpTx,
      config,
      lpTx.object(operationId),
      positionId,
    );
    expect(functionCount(lpTx, "settle_lp_reward_operation")).toBe(2);
    expect(argumentCounts(lpTx, "settle_lp_reward_operation")).toEqual([10, 10]);
    expect(functionCount(lpTx, "settle_stamp")).toBe(2);

    const poolTx = new Transaction();
    addSettlePoolRewardOperationWithLiquidlinkPoints(
      poolTx,
      config,
      poolTx.object(operationId),
    );
    expect(functionCount(poolTx, "settle_pool_reward_operation")).toBe(2);
    expect(argumentCounts(poolTx, "settle_pool_reward_operation")).toEqual([7, 7]);

    const syncTx = new Transaction();
    addSyncPyPositionWithLiquidlinkPoints(syncTx, config, positionId);
    expect(functionCount(syncTx, "checkpoint_yt")).toBe(2);
    expect(functionCount(syncTx, "settle_stamp")).toBe(2);

    const claimLpTx = new Transaction();
    addClaimLpPointsWithLiquidlinkPoints(claimLpTx, config, positionId);
    expect(functionCount(claimLpTx, "claim_lp_points")).toBe(2);
    expect(argumentCounts(claimLpTx, "claim_lp_points")).toEqual([8, 8]);
    expect(functionCount(claimLpTx, "settle_stamp")).toBe(2);
    expect(hasLiquidlinkPointsConfig(config)).toBe(true);
    expect(hasLiquidlinkLpPointsConfig(config)).toBe(true);
  });

  test("ignores disabled seasons but retains the active season", () => {
    const config = configWithPrograms();
    config.liquidlink!.pointPrograms![0]!.enabled = false;
    const tx = new Transaction();

    addSettleYtRewardOperationWithLiquidlinkPoints(
      tx,
      config,
      tx.object(objectId("8")),
      objectId("7"),
    );

    expect(functionCount(tx, "settle_yt_reward_operation")).toBe(1);
  });

  test("rejects an LP-only config without the matching pool checkpoint scope", () => {
    const config = configWithPrograms();
    config.liquidlink!.pointPrograms![0]!.scopes = ["lp"];

    expect(() => hasLiquidlinkLpPointsConfig(config)).toThrow(
      "must attach LP and pool scopes together",
    );
  });

  test("rejects duplicate PointConfig entries before composing settlement", () => {
    const config = configWithPrograms();
    config.liquidlink!.pointPrograms![1]!.pointConfigObjectId =
      config.liquidlink!.pointPrograms![0]!.pointConfigObjectId;

    expect(() => hasLiquidlinkPointsConfig(config)).toThrow(
      "contains duplicate PointConfig",
    );
  });

  test("claims only selected LP programs and completes referral bonus policy", () => {
    const config = configWithPrograms();
    config.liquidlink!.referralPackageId = objectId("9");
    const selectedProgram = config.liquidlink!.pointPrograms![0]!;
    selectedProgram.referral = {
      policyStateObjectId: objectId("a"),
      referralTableObjectId: objectId("b"),
    };
    const referralRecordId = objectId("c");
    const tx = new Transaction();

    addClaimLpPointsWithLiquidlinkPoints(
      tx,
      config,
      objectId("7"),
      { [selectedProgram.pointConfigObjectId]: referralRecordId },
      [selectedProgram.pointConfigObjectId],
    );

    expect(functionCount(tx, "claim_lp_points_with_referral_points")).toBe(1);
    expect(argumentCounts(tx, "claim_lp_points_with_referral_points")).toEqual([10]);
    expect(functionCount(tx, "claim_lp_points")).toBe(0);
    expect(functionCount(tx, "apply_lp_bonus_policy")).toBe(1);
    expect(functionCount(tx, "settle_stamp")).toBe(1);
  });

  test("confirms required referral policy when the owner has no referral record", () => {
    const config = configWithPrograms();
    config.liquidlink!.referralPackageId = objectId("9");
    for (const program of config.liquidlink!.pointPrograms!) {
      program.referral = {
        policyStateObjectId: objectId("a"),
        referralTableObjectId: objectId("b"),
      };
    }
    const positionId = objectId("7");
    const operationId = objectId("8");

    const syncTx = new Transaction();
    addSyncPyPositionWithLiquidlinkPoints(syncTx, config, positionId);
    expect(functionCount(syncTx, "apply_policy")).toBe(2);
    expect(argumentCounts(syncTx, "apply_policy")).toEqual([6, 6]);
    expect(functionCount(syncTx, "settle_stamp")).toBe(2);

    const ytTx = new Transaction();
    addSettleYtRewardOperationWithLiquidlinkPoints(
      ytTx,
      config,
      ytTx.object(operationId),
      positionId,
    );
    expect(functionCount(ytTx, "apply_policy")).toBe(2);
    expect(functionCount(ytTx, "settle_stamp")).toBe(2);

    const lpTx = new Transaction();
    addSettleLpRewardOperationWithLiquidlinkPoints(
      lpTx,
      config,
      lpTx.object(operationId),
      positionId,
    );
    expect(functionCount(lpTx, "apply_policy")).toBe(2);
    expect(functionCount(lpTx, "settle_stamp")).toBe(2);

    const claimLpTx = new Transaction();
    addClaimLpPointsWithLiquidlinkPoints(claimLpTx, config, positionId);
    expect(functionCount(claimLpTx, "apply_policy")).toBe(2);
    expect(functionCount(claimLpTx, "settle_stamp")).toBe(2);
  });
});
