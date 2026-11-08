import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import * as rewards from "../generated/jitter/reward_distributor.js";
import * as coinRewards from "../generated/jitter_extensions/coin_rewarder.js";

test("reward registration exposes only the atomic cap-issuing entry", () => {
  expect(rewards).toHaveProperty("registerRewarderWithSettlementCapByAdmin");
  expect(rewards).not.toHaveProperty("registerRewarderByAdmin");
  expect(rewards).not.toHaveProperty("registerRewarderWithMetadataByAdmin");
});

test("admin reward termination returns a coin without requiring a market or position list", () => {
  expect(coinRewards).toHaveProperty("withdrawAndCloseByAdmin");
  const tx = new Transaction();
  const payout = tx.add(coinRewards.withdrawAndCloseByAdmin({
    package: "0x123", typeArguments: ["0x2::sui::SUI"],
    arguments: {
      rewarder: "0x1", globalConfig: "0x2", adminCap: "0x3",
      distributor: "0x4",
    },
  }));
  tx.transferObjects([payout], "0x5");
  const call = tx.getData().commands[0].MoveCall!;
  expect(call.function).toBe("withdraw_and_close_by_admin");
  expect(call.arguments).toHaveLength(5);
  expect(call.typeArguments).toEqual(["0x2::sui::SUI"]);
  expect(tx.getData().commands[1].TransferObjects!.objects[0]).toEqual({ $kind: "Result", Result: 0 });
  expect(coinRewards).toHaveProperty("withdrawn");
});

test("retirement builder takes the custodian cap rather than arbitrary scope and ID", () => {
  const tx = new Transaction();
  const cap = tx.add(rewards.registerRewarderWithSettlementCapByAdmin({
    package: "0x123",
    arguments: {
      distributor: "0x1", globalConfig: "0x2", AdminCap: "0x3",
      scope: 1, rewarderId: "0x4", kind: [], label: [],
    },
  }));
  tx.add(rewards.unregisterRewarderByAdmin({
    package: "0x123",
    arguments: {
      distributor: "0x1",
      globalConfig: "0x2",
      AdminCap: "0x3",
      cap,
    },
  }));
  const call = tx.getData().commands[1].MoveCall!;
  expect(call.function).toBe("unregister_rewarder_by_admin");
  expect(call.arguments).toHaveLength(4);
  expect(call.arguments[3]).toEqual({ $kind: "Result", Result: 0 });
  // A complete integration retains the non-droppable cap in its own object.
});
