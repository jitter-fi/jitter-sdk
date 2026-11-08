import { expect, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import * as market from "../generated/jitter/market.js";
import * as rewards from "../generated/jitter_extensions/coin_rewarder.js";

const types: [string, string, string] = ["0x1::sy::SY", "0x1::pt::PT", "0x1::yt::YT"];

test("Treasury rotation composes with fee collection without a new market", () => {
  expect(market).toHaveProperty("setTreasuryByAdmin");
  const tx = new Transaction();
  tx.add(market.setTreasuryByAdmin({
    package: "0x123", typeArguments: types,
    arguments: ["0x11", "0x12", "0x13", "0xbeef"],
  }));
  tx.add(market.collectReserveFeesByAdmin({
    package: "0x123", typeArguments: types,
    arguments: ["0x11", "0x12", "0x13"],
  }));
  const calls = tx.getData().commands.map((c) => c.MoveCall!);
  expect(calls.map((c) => c.function)).toEqual(["set_treasury_by_admin", "collect_reserve_fees_by_admin"]);
  expect(calls[0].arguments).toHaveLength(4);
  expect(calls[0].arguments.slice(0, 3)).toEqual(calls[1].arguments);
  expect(calls[0].typeArguments).toEqual(types);
});

test("zero-budget cancellation keeps the existing ABI and explicit surplus payout", () => {
  const tx = new Transaction();
  tx.add(rewards.adjustLotByAdmin({
    package: "0x123", typeArguments: ["0x1::reward::R", ...types],
    arguments: ["0x11", "0x12", "0x13", "0x14", 7n, 0n, 0n, 0n],
  }));
  const payout = tx.add(rewards.sweepUndistributedByAdmin({
    package: "0x123", typeArguments: ["0x1::reward::R"],
    arguments: ["0x11", "0x12", "0x13", 100n],
  }));
  tx.transferObjects([payout], "0xbeef");
  const data = tx.getData();
  const call = data.commands[0].MoveCall!;
  expect(call.function).toBe("adjust_lot_by_admin");
  expect(call.arguments).toHaveLength(9);
  const budget = call.arguments[5];
  if (budget.$kind !== "Input") throw new Error("Expected a pure budget input");
  const input = data.inputs[budget.Input];
  expect(input.Pure!.bytes).toBe(bcs.u64().serialize(0).toBase64());
  expect(data.commands[2].TransferObjects!.objects[0]).toEqual({ $kind: "Result", Result: 1 });
});
