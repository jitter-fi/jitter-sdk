import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import {
  createPosition,
  transferEmptyPosition,
  transferPosition,
} from "../generated/jitter/router.js";

test("generated router bindings distinguish empty and reward-settled transfers", () => {
  const tx = new Transaction();
  const typeArguments: [string, string, string] = [
    "0x2::sui::SUI", "0x2::sui::SUI", "0x2::sui::SUI",
  ];
  const position = createPosition({
    package: "0x1", arguments: ["0x10", "0x11"], typeArguments,
  })(tx);
  transferEmptyPosition({
    package: "0x1", arguments: [position, "0x11", "0xaa"],
  })(tx);
  const ytSettlements = tx.makeMoveVec({ type: "0x1::reward_distributor::RewardSettlement", elements: [] });
  const lpSettlements = tx.makeMoveVec({ type: "0x1::reward_distributor::RewardSettlement", elements: [] });
  transferPosition({
    package: "0x1",
    arguments: [ytSettlements, lpSettlements, "0x12", "0x13", "0x10", "0x11", "0xaa"],
    typeArguments,
  })(tx);
  const calls = tx.getData().commands.flatMap((command) => command.MoveCall ? [command.MoveCall] : []);
  expect(calls.map((call) => call.function)).toEqual([
    "create_position", "transfer_empty_position", "transfer_position",
  ]);
  expect(calls.map((call) => call.arguments.length)).toEqual([3, 3, 7]);
  expect(calls[1].typeArguments).toEqual([]);
  expect(calls[2].typeArguments).toEqual(typeArguments);
});
