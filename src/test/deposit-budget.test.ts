import { expect, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { addEmberDeposit, addEmberDepositFromUnderlying, addHaedalDeposit } from "../index.js";
import type { JitterMarketConfig } from "../types.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const config = {
  jitterPackageId: id(1), demoAdapterPackageId: "", oraclePackageId: id(2),
  syStateObjectId: id(3), globalConfigObjectId: id(4), aclObjectId: id(5),
  marketObjectId: id(6), pyStateObjectId: id(6), poolObjectId: id(6),
  priceAggregatorObjectId: id(7), demoMarketVaultObjectId: "",
  underlyingTypeTag: `${id(10)}::coin::U`, syTypeTag: `${id(11)}::coin::SY`,
  ptTypeTag: `${id(12)}::coin::PT`, ytTypeTag: `${id(13)}::coin::YT`,
  emberAdapterPackageId: id(20), emberMarketVaultObjectId: id(21), emberVaultObjectId: id(22),
  emberReceiptTypeTag: `${id(23)}::receipt::R`,
  emberVaultsPackageId: id(24), emberProtocolConfigObjectId: id(25),
  haedalAdapterPackageId: id(30), haedalMarketVaultObjectId: id(31), haedalStakingObjectId: id(32),
} satisfies JitterMarketConfig & Record<string, unknown>;

for (const [kind, deposit] of [["ember", addEmberDeposit], ["haedal", addHaedalDeposit]] as const) {
  test(`${kind} caps receipts before deposit and recombines all change`, () => {
    const tx = new Transaction();
    const source = tx.object(id(50));
    const change = deposit(tx, config, tx.object(id(51)), source, 123n);
    const data = tx.getData();
    expect(data.commands.map(c => c.$kind)).toEqual(["MoveCall", "MoveCall", "SplitCoins", "MoveCall", "MergeCoins"]);
    expect(data.commands[0].MoveCall).toMatchObject({ module: "coin", function: "value", arguments: [source] });
    expect(data.commands[0].MoveCall!.typeArguments).toEqual([kind === "ember" ? config.emberReceiptTypeTag
      : "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI"]);
    const min = data.commands[1].MoveCall!;
    expect(min).toMatchObject({ module: "u64", function: "min" });
    expect(min.arguments[0]).toMatchObject({ Result: 0 });
    expect(bcs.u64().fromBase64(data.inputs[(min.arguments[1] as { Input: number }).Input].Pure!.bytes)).toBe("123");
    const split = data.commands[2].SplitCoins!;
    expect(split.coin).toEqual(source);
    expect(split.amounts[0]).toMatchObject({ Result: 1 });
    const call = data.commands[3].MoveCall!;
    expect(call.module).toBe(`${kind}_market_vault`);
    expect(call.function).toBe("deposit");
    expect(call.arguments[1]).toMatchObject({ NestedResult: [2, 0] });
    expect(data.commands[4].MergeCoins!.destination).toEqual(source);
    expect(data.commands[4].MergeCoins!.sources[0]).toMatchObject({ Result: 3 });
    expect(change).toEqual(source);
    tx.transferObjects([change], id(60));
    expect(call.arguments).toHaveLength(8);
    expect(call.typeArguments).toHaveLength(kind === "ember" ? 5 : 3);
  });

  test(`${kind} rejects zero, missing and out-of-range budgets before adding commands`, () => {
    for (const budget of [0n, -1n, 1n << 64n, undefined, 9007199254740992]) {
      const tx = new Transaction();
      expect(() => deposit(tx, config, tx.object(id(51)), tx.object(id(50)), budget as bigint)).toThrow("maxReceiptIn");
      expect(tx.getData().commands).toHaveLength(0);
    }
    const tx = new Transaction();
    deposit(tx, config, tx.object(id(51)), tx.object(id(50)), (1n << 64n) - 1n);
    expect(tx.getData().commands).toHaveLength(5);
  });
}

test("receipt results from an earlier PTB command remain linear and all change is returned", () => {
  const tx = new Transaction();
  const receipt = tx.moveCall({ target: `${id(22)}::vault::upstream_result` });
  const returned = addEmberDeposit(tx, config, tx.object(id(51)), receipt, 1000n);
  tx.transferObjects([returned], id(60));
  const commands = tx.getData().commands;
  expect(commands[1].MoveCall!.arguments[0]).toMatchObject({ Result: 0 });
  expect(commands[3].SplitCoins!.coin).toMatchObject({ Result: 0 });
  expect(commands[5].MergeCoins!.destination).toMatchObject({ Result: 0 });
  expect(commands[6].TransferObjects!.objects[0]).toMatchObject({ Result: 0 });
});

test("underlying conversion bounds both input legs and returns both change Coins", () => {
  const tx = new Transaction();
  const source = tx.object(id(50));
  const change = addEmberDepositFromUnderlying(tx, config, tx.object(id(51)), source,
    { maxUnderlyingIn: 1000n, maxReceiptIn: 100n, minReceiptShares: 90n });
  const commands = tx.getData().commands;
  expect(commands.map(c => c.$kind)).toEqual(["MoveCall", "MoveCall", "SplitCoins", "MoveCall", "MoveCall", "MoveCall", "MoveCall", "SplitCoins", "MoveCall", "MergeCoins"]);
  expect(commands[3].MoveCall).toMatchObject({ function: "into_balance", arguments: [{ NestedResult: [2, 0] }] });
  expect(commands[4].MoveCall!.function).toBe("deposit_asset_v2");
  expect(commands[8].MoveCall!.function).toBe("deposit");
  expect(change.underlyingChange).toEqual(source);
  expect(change.receiptChange).toMatchObject({ Result: 4 });
  tx.transferObjects([change.receiptChange, change.underlyingChange], id(60));
  expect(tx.getData().commands.at(-1)!.TransferObjects!.objects).toHaveLength(2);
  for (const invalid of [100n, null, { maxUnderlyingIn: 0n, maxReceiptIn: 1n, minReceiptShares: 0n },
    { maxUnderlyingIn: 1n, maxReceiptIn: 1n }, { maxUnderlyingIn: 1n, maxReceiptIn: 1n, minReceiptShares: -1n }]) {
    const invalidTx = new Transaction();
    expect(() => addEmberDepositFromUnderlying(invalidTx, config, invalidTx.object(id(51)), invalidTx.object(id(50)), invalid as never)).toThrow();
    expect(invalidTx.getData().commands).toHaveLength(0);
  }
});
