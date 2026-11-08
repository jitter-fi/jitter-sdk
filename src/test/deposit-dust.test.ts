import { expect, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { addDepositDustToTreasury } from "../adapters/deposit-dust.js";
import { makeTestMarketConfig } from "./fakes.js";

const config = makeTestMarketConfig({marketObjectId:"0x10",globalConfigObjectId:"0x11"});
test("deposit dust is bounded before sending to the live market Treasury", () => {
  const tx = new Transaction();
  const dust = tx.object("0x99"), type = "0x2::sui::SUI";
  addDepositDustToTreasury(tx, config, dust, type);
  const commands = tx.getData().commands;
  expect(commands.map(c => c.MoveCall?.function)).toEqual(["assert_coin_max_value", "treasury", "send_funds"]);
  expect(commands[0].MoveCall!.arguments[1]).toEqual(dust);
  const input = commands[0].MoveCall!.arguments[2] as {Input:number};
  expect(bcs.u64().fromBase64(tx.getData().inputs[input.Input].Pure!.bytes)).toBe("2");
  expect(commands[1].MoveCall!.arguments).toEqual([tx.object(config.marketObjectId)]);
  expect(commands[2].MoveCall!.arguments).toEqual([dust, { $kind:"Result",Result:1 }]);
  expect(commands[2].MoveCall!.typeArguments).toEqual([type]);
  expect(commands.some(c=>c.$kind==="TransferObjects")).toBe(false);
});

test("missing governance config fails before adding commands", () => {
  const tx = new Transaction();
  expect(()=>addDepositDustToTreasury(tx,{...config,globalConfigObjectId:undefined},tx.object("0x99"),"0x2::sui::SUI")).toThrow("globalConfigObjectId");
  expect(tx.getData().commands).toHaveLength(0);
});
