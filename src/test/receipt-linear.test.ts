import { expect, spyOn, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { getDefaultJitterMarketConfig } from "../config.js";
import { addReceiptRedeem } from "../sy.js";
import { addLinearRate, linearGroupAccrued } from "../linear-score.js";
import { readLiquidlinkScoreInfo } from "../queries.js";
import { getSuiGrpcClient } from "../rpc.js";

test("all four receipt routes build one oracle-free call without upstream objects", () => {
  const config = getDefaultJitterMarketConfig("testnet")!;
  for (const [kind, count] of [["ember", 5], ["suilend", 5], ["spring", 4], ["haedal", 3]] as const) {
    const tx = new Transaction();
    addReceiptRedeem(tx, config, tx.object("0x123"), {
      kind, packageId: "0x456", vaultObjectId: "0x789",
      typeArguments: Array(count).fill("0x2::sui::SUI"),
    });
    const commands = tx.getData().commands;
    expect(commands).toHaveLength(1);
    expect(commands[0].MoveCall?.function).toBe("redeem_receipt");
    expect(commands[0].MoveCall?.module).toBe(`${kind}_market_vault`);
    expect(commands[0].MoveCall?.arguments).toHaveLength(6);
  }
});

test("receipt route rejects incorrect generic arity before building", () => {
  const tx = new Transaction();
  expect(() => addReceiptRedeem(tx, getDefaultJitterMarketConfig("testnet")!, tx.object("0x123"), {
    kind: "haedal", packageId: "0x456", vaultObjectId: "0x789", typeArguments: [],
  })).toThrow("3 type arguments");
});

test("mixed denominators and cutoff clocks accrue independently with exact carries", () => {
  const first = { rate: 1n, duration: 3n, updatedAt: 0n, remainder: 0n, pausedAtUpdate: 0n };
  const second = { ...first, duration: 7n };
  expect(linearGroupAccrued(first, 21n, 0n) + linearGroupAccrued(second, 21n, 0n)).toBe(10n);
  expect(linearGroupAccrued(first, 21n, 10n) + linearGroupAccrued(second, 14n, 10n)).toBe(3n);
  expect(linearGroupAccrued({ ...first, rate: 0n, remainder: 2n }, 999n, 0n)).toBe(0n);
  expect(linearGroupAccrued({ ...first, remainder: 2n }, 1n, 0n)).toBe(1n);
});

test("dense group vectors preserve quotient and remainder partition identity", () => {
  for (let duration = 1n; duration <= 17n; duration++) {
    for (let rate = 0n; rate <= 13n; rate++) {
      for (let first = 0n; first <= 11n; first++) {
        const group = { rate, duration, updatedAt: 0n, remainder: duration - 1n, pausedAtUpdate: 0n };
        const earned = linearGroupAccrued(group, first, 0n);
        const remainder = (rate * first + group.remainder) % duration;
        expect(earned + linearGroupAccrued({ ...group, updatedAt: first, remainder }, first + 19n, 0n))
          .toBe(linearGroupAccrued(group, first + 19n, 0n));
      }
    }
  }
});

test("invalid denominator or remainder fails closed", () => {
  const group = { rate: 1n, duration: 0n, updatedAt: 0n, remainder: 0n, pausedAtUpdate: 0n };
  expect(() => linearGroupAccrued(group, 1n, 0n)).toThrow();
  expect(() => linearGroupAccrued({ ...group, duration: 3n, remainder: 3n }, 1n, 0n)).toThrow();
});

test("score discovery follows paginated policy cutoffs and preserves converted debt", async () => {
  const client = getSuiGrpcClient("testnet");
  const policy = { name: "1::policy::P" };
  const key = { project_object_id: "0x1", policy, policy_state_id: "0x2", generation: "3" };
  const list = spyOn(client, "listDynamicFields").mockImplementation(async (input) => {
    expect(input.limit).toBe(50);
    return (input.cursor ? {
      dynamicFields: [{ fieldId: "0x4", name: { type: "0x5::scoreboard::PolicyCutoffKey" } }],
      hasNextPage: false, cursor: null,
    } : { dynamicFields: [], hasNextPage: true, cursor: "next" }) as never;
  });
  const get = spyOn(client, "getObject").mockImplementation(async () => ({
    object: { json: { name: key, value: { cutoff_ms: "14", paused_ms_at_cutoff: "10" } } },
  }) as never);
  try {
    const group = { project_object_id: "0x1", score_per_duration: "1", duration: "3",
      updated_at: "0", linear_paused_ms_at_update: "0", remainder: "0", policies: [] };
    const score = await readLiquidlinkScoreInfo({
      score: "100", score_debt: "102", score_per_duration: "0", duration: "1", updated_at: "0",
      linear_groups: [group, { ...group, duration: "7", policies: [{ policy, policy_state_id: "0x2", generation: "3" }] }],
    }, 21n, 10n, "testnet", "0xboard");
    expect(score.totalScore).toBe(103n);
    expect(score.unconvertedScore).toBe(1n);
    expect(score.scorePerDuration).toBe(1n);
    expect(score.durationMs).toBe(3n);
    expect(list).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenCalledTimes(1);
  } finally {
    list.mockRestore();
    get.mockRestore();
  }
});

test("mixed group display rate is an exact rational, not a rounded per-ms rate", () => {
  expect(addLinearRate({ rate: 1n, duration: 3n }, { rate: 1n, duration: 7n }))
    .toEqual({ rate: 10n, duration: 21n });
  const large = (1n << 64n) - 1n;
  const sum = addLinearRate({ rate: 1n, duration: large }, { rate: 1n, duration: large - 1n });
  expect(sum.rate).toBe(large * 2n - 1n);
  expect(sum.duration).toBe(large * (large - 1n));
});

test("cutoff discovery fails closed when gRPC is unavailable", async () => {
  const client = getSuiGrpcClient("testnet");
  const list = spyOn(client, "listDynamicFields").mockRejectedValue(new Error("offline"));
  try {
    await expect(readLiquidlinkScoreInfo({ score: "0", linear_groups: [{ policies: [{}] }] },
      1n, 0n, "testnet", "0xboard")).rejects.toThrow("offline");
  } finally { list.mockRestore(); }
});
