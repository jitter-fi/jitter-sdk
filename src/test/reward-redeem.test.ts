import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import { addRedeemBeforeExpiryWithLiquidlinkPoints } from "../liquidlink-points.js";
import type { JitterMarketConfig } from "../types.js";

function objectId(byte: string): string {
  return `0x${byte.repeat(64)}`;
}

function moveCallTargets(tx: Transaction): string[] {
  return tx
    .getData()
    .commands
    .flatMap((command) => {
      if (command.$kind !== "MoveCall") return [];
      return [`${command.MoveCall.package}::${command.MoveCall.module}::${command.MoveCall.function}`];
    });
}

describe("reward-aware paired redeem", () => {
  test("settles YT exposure before and after redeeming paired PT/YT", () => {
    const jitterPackageId = objectId("1");
    const config: JitterMarketConfig = {
      jitterPackageId,
      jitterExtensionsPackageId: objectId("2"),
      demoAdapterPackageId: objectId("3"),
      oraclePackageId: objectId("4"),
      syStateObjectId: objectId("5"),
      globalConfigObjectId: objectId("6"),
      aclObjectId: objectId("7"),
      marketObjectId: objectId("8"),
      pyStateObjectId: objectId("8"),
      poolObjectId: objectId("9"),
      priceAggregatorObjectId: objectId("a"),
      demoMarketVaultObjectId: objectId("b"),
      rewardDistributorObjectId: objectId("c"),
      underlyingTypeTag: `${objectId("d")}::underlying::UNDERLYING`,
      syTypeTag: `${objectId("e")}::sy::SY`,
      ptTypeTag: `${objectId("f")}::pt::PT`,
      ytTypeTag: `${objectId("a")}::yt::YT`,
      liquidlink: {
        enabled: true,
        liquidlinkPackageId: objectId("3"),
        liquidlinkGlobalConfigObjectId: objectId("6"),
        projectObjectId: objectId("4"),
        scoreboardObjectId: objectId("d"),
        pointConfigObjectId: objectId("e"),
      },
    };
    const tx = new Transaction();
    tx.setSender(objectId("f"));

    addRedeemBeforeExpiryWithLiquidlinkPoints(
      tx,
      config,
      25n,
      tx.object(objectId("1")),
      objectId("2"),
    );

    const targets = moveCallTargets(tx);
    expect(targets).toContain(
      `${jitterPackageId}::reward_distributor::begin_scoped_operation_with_guard`,
    );
    expect(
      targets.filter(
        (target) => target === `${jitterPackageId}::reward_distributor::finish_operation`,
      ),
    ).toHaveLength(2);
    expect(targets.filter((target) => target.endsWith("::stamp::settle_stamp"))).toHaveLength(2);
    expect(targets).toContain(`${jitterPackageId}::router::redeem_py`);
    expect(targets.some((target) => target.endsWith("::vector::pop_back"))).toBe(true);
    expect(targets).toContain(`${jitterPackageId}::reward_distributor::destroy_settlement`);
    expect(targets.some((target) => target.endsWith("::vector::destroy_empty"))).toBe(true);
    expect(
      targets.filter(
        (target) => target.endsWith("::liquidlink_points::settle_yt_reward_operation"),
      ),
    ).toHaveLength(2);

    const redeemIndex = targets.indexOf(`${jitterPackageId}::router::redeem_py`);
    const finishIndexes = targets
      .map((target, index) => ({ target, index }))
      .filter(
        ({ target }) => target === `${jitterPackageId}::reward_distributor::finish_operation`,
      )
      .map(({ index }) => index);
    expect(finishIndexes[0]).toBeLessThan(redeemIndex);
    expect(finishIndexes[1]).toBeGreaterThan(redeemIndex);
  });

  test("settles every active YT point program before and after redeem", () => {
    const jitterPackageId = objectId("1");
    const config: JitterMarketConfig = {
      jitterPackageId,
      jitterExtensionsPackageId: objectId("2"),
      demoAdapterPackageId: objectId("3"),
      oraclePackageId: objectId("4"),
      syStateObjectId: objectId("5"),
      globalConfigObjectId: objectId("6"),
      aclObjectId: objectId("7"),
      marketObjectId: objectId("8"),
      marketStateObjectId: objectId("8"),
      pyStateObjectId: objectId("8"),
      poolObjectId: objectId("9"),
      priceAggregatorObjectId: objectId("a"),
      demoMarketVaultObjectId: objectId("b"),
      rewardDistributorObjectId: objectId("c"),
      underlyingTypeTag: `${objectId("d")}::underlying::UNDERLYING`,
      syTypeTag: `${objectId("e")}::sy::SY`,
      ptTypeTag: `${objectId("f")}::pt::PT`,
      ytTypeTag: `${objectId("a")}::yt::YT`,
      liquidlink: {
        enabled: true,
        liquidlinkPackageId: objectId("3"),
        liquidlinkGlobalConfigObjectId: objectId("6"),
        pointPrograms: [
          {
            label: "Jitter Season 2",
            protocol: "Jitter",
            projectObjectId: objectId("4"),
            scoreboardObjectId: objectId("d"),
            pointConfigObjectId: objectId("e"),
            scopes: ["yt"],
          },
          {
            label: "Scallop Points",
            protocol: "Scallop",
            projectObjectId: objectId("5"),
            scoreboardObjectId: objectId("1"),
            pointConfigObjectId: objectId("2"),
            scopes: ["yt"],
          },
        ],
      },
    };
    const tx = new Transaction();
    tx.setSender(objectId("f"));

    addRedeemBeforeExpiryWithLiquidlinkPoints(
      tx,
      config,
      25n,
      tx.object(objectId("1")),
      objectId("2"),
    );

    expect(
      moveCallTargets(tx).filter((target) =>
        target.endsWith("::liquidlink_points::settle_yt_reward_operation"),
      ),
    ).toHaveLength(4);
    expect(
      moveCallTargets(tx).filter((target) => target.endsWith("::stamp::settle_stamp")),
    ).toHaveLength(4);
  });
});
