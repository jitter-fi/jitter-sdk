import { expect, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import * as points from "../generated/jitter_extensions/liquidlink_points.js";

test("LP telemetry round-trips u128 without lossy JavaScript numbers", () => {
  const value = {
    id: "0x1", initialized: true, lp_rewarder_uid: "0x2", pool_rewarder_uid: "0x3",
    point_config_id: "0x4", pool_id: "0x5",
    lp_settlement_cap: null, pool_settlement_cap: null, lp_referral_source_cap: null,
    lp_multiplier_bps: 10_000n, acc_point_per_lp: 123n,
    attachment_acc_point_per_lp: 0n, attachment_ms: 1_000n,
    acc_point_remainder: 0n, point_numerator_remainder: 0n,
    point_fraction_remainder_q128: 0n, last_updated_ms: 2_000n,
    total_lp_points_accrued: (1n << 128n) - 1n,
    total_lp_points_saturated: true, last_lp_supply: 40_000n,
    point_config_version: 3n, reward_attached: true,
  };
  const parsed = points.LpPointState.parse(points.LpPointState.serialize(value).toBytes());
  expect(parsed.total_lp_points_accrued).toBe(value.total_lp_points_accrued.toString());
  expect(parsed).toMatchObject({ total_lp_points_saturated: true, last_lp_supply: "40000" });
  expect(parsed).toHaveProperty("initialized", true);
});

test("YT discovery distinguishes never attached from a closed settlement tail", () => {
  const value = {
    yt_amount: 10n, yt_base: 10n, uncheckpointed_yt: 99n,
    attachment_acc: 1n << 128n, attachment_ms: 1000n,
    acc_point_per_base: 3n << 128n, point_numerator_remainder: 0n,
    last_updated_ms: 3000n, expiry_ms: 10_000n, point_config_version: 0n,
    initialized: true, reward_attached: false, settlement_cap: null,
  };
  const parsed = points.YtMarketExposure.parse(points.YtMarketExposure.serialize(value).toBytes());
  expect(parsed).toMatchObject({
    initialized: true, reward_attached: false, uncheckpointed_yt: "99",
    attachment_acc: (1n << 128n).toString(), attachment_ms: "1000",
  });
  expect(points).toHaveProperty("uncheckpointedYt");
});

test("generated surface exposes historical repair separately from future multiplier updates", () => {
  expect(points).toHaveProperty("repairLpHistory");
  expect(points).toHaveProperty("LpHistoryRepair");
  expect(points).toHaveProperty("LpHistoryRepairedEvent");
  expect(points).toHaveProperty("LpCarryRetiredEvent");
  expect(points).toHaveProperty("totalLpPointsSaturated");
  expect(points).toHaveProperty("setMultipliersByAdmin");
});

test("history repair builds the full ABI with exact u64 values and automatic Clock", () => {
  const tx = new Transaction();
  const values = [3n, 2n, 9_007_199_254_740_993n, (1n << 64n) - 1n, 997n];
  tx.add(points.repairLpHistory({
    package: "0x99",
    typeArguments: ["0x1::sy::SY", "0x1::pt::PT", "0x1::yt::YT"],
    arguments: ["0x10", "0x11", "0x12", "0x13", "0x14",
      values[0]!, values[1]!, values[2]!, values[3]!, values[4]!, [65, 66]],
  }));
  const data = tx.getData();
  expect(data.commands).toHaveLength(1);
  const command = data.commands[0]!;
  if (command.$kind !== "MoveCall") throw new Error("Expected repair MoveCall");
  expect(command.MoveCall.function).toBe("repair_lp_history");
  expect(command.MoveCall.arguments).toHaveLength(12);
  expect(command.MoveCall.typeArguments).toHaveLength(3);
  const pure = data.inputs.flatMap((input) => input.$kind === "Pure" ? [input.Pure.bytes] : []);
  expect(pure).toEqual([
    ...values.map((value) => bcs.u64().serialize(value).toBase64()),
    bcs.vector(bcs.u8()).serialize([65, 66]).toBase64(),
  ]);
  expect(JSON.stringify(data.inputs)).toContain(normalizeSuiAddress("0x6"));
});
