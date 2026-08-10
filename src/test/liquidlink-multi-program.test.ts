import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import {
  addClaimLpPointsWithLiquidlinkPoints,
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
    expect(functionCount(syncTx, "sync_py_position_with_points")).toBe(2);
    expect(functionCount(syncTx, "settle_stamp")).toBe(2);

    const claimLpTx = new Transaction();
    addClaimLpPointsWithLiquidlinkPoints(claimLpTx, config, positionId);
    expect(functionCount(claimLpTx, "claim_lp_points_with_points")).toBe(2);
    expect(argumentCounts(claimLpTx, "claim_lp_points_with_points")).toEqual([8, 8]);
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
    expect(functionCount(tx, "claim_lp_points_with_points")).toBe(0);
    expect(functionCount(tx, "apply_lp_bonus_policy")).toBe(1);
    expect(functionCount(tx, "settle_stamp")).toBe(1);
  });
});
