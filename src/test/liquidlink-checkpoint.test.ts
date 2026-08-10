import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import {
  addCheckpointLpPointConfigToVersion,
  addCheckpointYtPointConfigToVersion,
  nextLiquidlinkPointCheckpointTarget,
} from "../liquidlink-points.js";
import type { JitterMarketConfig } from "../types.js";

function objectId(byte: string): string {
  return `0x${byte.repeat(64)}`;
}

function checkpointConfig(): JitterMarketConfig {
  return {
    jitterPackageId: objectId("1"),
    jitterExtensionsPackageId: objectId("2"),
    demoAdapterPackageId: objectId("2"),
    oraclePackageId: objectId("2"),
    globalConfigObjectId: objectId("3"),
    aclObjectId: objectId("3"),
    marketObjectId: objectId("4"),
    marketStateObjectId: objectId("4"),
    syStateObjectId: objectId("4"),
    pyStateObjectId: objectId("4"),
    poolObjectId: objectId("4"),
    priceAggregatorObjectId: objectId("4"),
    demoMarketVaultObjectId: objectId("4"),
    underlyingTypeTag: `${objectId("5")}::underlying::UNDERLYING`,
    syTypeTag: `${objectId("6")}::sy::SY`,
    ptTypeTag: `${objectId("7")}::pt::PT`,
    ytTypeTag: `${objectId("8")}::yt::YT`,
    liquidlink: {
      enabled: true,
      liquidlinkPackageId: objectId("9"),
      liquidlinkGlobalConfigObjectId: objectId("a"),
      pointPrograms: [
        {
          label: "Jitter Season",
          protocol: "Jitter",
          projectObjectId: objectId("b"),
          scoreboardObjectId: objectId("c"),
          pointConfigObjectId: objectId("d"),
          lpPointStateObjectId: objectId("e"),
          enabled: true,
          scopes: ["yt", "lp", "pool"],
        },
      ],
    },
  };
}

function moveCall(tx: Transaction, functionName: string) {
  return tx.getData().commands.find(
    (command) =>
      command.$kind === "MoveCall"
      && command.MoveCall.function === functionName,
  );
}

describe("LiquidLink PointConfig checkpoint planning", () => {
  test("plans one caller-sized step and clamps it to the current version", () => {
    expect(nextLiquidlinkPointCheckpointTarget(0, 60, 16)).toBe(16n);
    expect(nextLiquidlinkPointCheckpointTarget(48, 60, 16)).toBe(60n);
    expect(nextLiquidlinkPointCheckpointTarget(58, 60, 16)).toBe(60n);
    expect(nextLiquidlinkPointCheckpointTarget(60, 60, 16)).toBeNull();
  });

  test("accepts full u64 strings without unsafe JavaScript number conversion", () => {
    expect(
      nextLiquidlinkPointCheckpointTarget(
        "18446744073709551613",
        "18446744073709551615",
        "16",
      ),
    ).toBe(18_446_744_073_709_551_615n);
  });

  test("rejects invalid, regressing and unsafe-number plans", () => {
    expect(() => nextLiquidlinkPointCheckpointTarget(2, 1, 1)).toThrow(
      "appliedVersion cannot exceed currentVersion",
    );
    expect(() => nextLiquidlinkPointCheckpointTarget(0, 1, 0)).toThrow(
      "must be greater than zero",
    );
    expect(() => nextLiquidlinkPointCheckpointTarget(-1, 1, 1)).toThrow(
      "must fit in a Move u64",
    );
    expect(() =>
      nextLiquidlinkPointCheckpointTarget(Number.MAX_SAFE_INTEGER + 1, 1, 1),
    ).toThrow("must be a safe integer");
  });

  test("builds exact YT and LP checkpoint calls for a selected PointConfig", () => {
    const config = checkpointConfig();
    const pointConfigId = config.liquidlink!.pointPrograms![0]!.pointConfigObjectId;

    const ytTx = new Transaction();
    addCheckpointYtPointConfigToVersion(ytTx, config, pointConfigId, 7);
    const ytCall = moveCall(ytTx, "checkpoint_yt_config_to_version");
    expect(ytCall?.$kind).toBe("MoveCall");
    if (ytCall?.$kind === "MoveCall") {
      expect(ytCall.MoveCall.arguments).toHaveLength(5);
      expect(ytCall.MoveCall.typeArguments).toEqual([
        config.syTypeTag,
        config.ptTypeTag,
        config.ytTypeTag,
      ]);
    }

    const lpTx = new Transaction();
    addCheckpointLpPointConfigToVersion(lpTx, config, pointConfigId, "9");
    const lpCall = moveCall(lpTx, "checkpoint_lp_config_to_version");
    expect(lpCall?.$kind).toBe("MoveCall");
    if (lpCall?.$kind === "MoveCall") {
      expect(lpCall.MoveCall.arguments).toHaveLength(6);
      expect(lpCall.MoveCall.typeArguments).toEqual([
        config.syTypeTag,
        config.ptTypeTag,
        config.ytTypeTag,
      ]);
    }
  });

  test("cannot checkpoint a PointConfig outside the configured scope", () => {
    const config = checkpointConfig();
    const pointConfigId = config.liquidlink!.pointPrograms![0]!.pointConfigObjectId;
    config.liquidlink!.pointPrograms![0]!.scopes = ["yt"];

    expect(() =>
      addCheckpointLpPointConfigToVersion(
        new Transaction(),
        config,
        pointConfigId,
        1,
      ),
    ).toThrow("LP checkpoint is not configured");

    expect(() =>
      addCheckpointYtPointConfigToVersion(
        new Transaction(),
        config,
        objectId("f"),
        1,
      ),
    ).toThrow("YT checkpoint is not configured");
  });
});
