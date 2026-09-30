import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { addCurrentDepositToSy, addCurrentPriceInfo, getJitterAdapterManifest } from "../index.js";
import { createJitterTransactionService } from "../services/transaction-service.js";
import { addDemoPriceInfo } from "../oracle.js";
import { createJitterQuoteService } from "../services/quote-service.js";
import { bcs } from "@mysten/sui/bcs";
import { normalizeStructTag } from "@mysten/sui/utils";
import { makeTestMarketConfig } from "./fakes.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const config = () => makeTestMarketConfig({
  globalConfigObjectId: id(40), marketObjectId: id(6), pyStateObjectId: id(6), poolObjectId: id(6),
  demoMarketVaultObjectId: "", adapterKind: "current",
  currentAdapterPackageId: id(21), currentMarketVaultObjectId: id(22),
  currentProtocolAppObjectId: id(23), currentMarketObjectId: id(24),
  currentProtocolTypeTag: `${id(25)}::market::MAIN`,
  currentDecimalsRegistryObjectId: id(26), currentXOracleObjectId: id(27),
});
const calls = (tx: Transaction) => tx.getData().commands.flatMap(c => c.MoveCall ? [c.MoveCall] : []);

test("Current deposit executes before aggregation and mints only through receipt settlement", () => {
  const tx = new Transaction();
  addCurrentDepositToSy(tx, config(), tx.object(id(30)), 77n);
  expect(calls(tx).map(c => c.function)).toEqual(["new", "deposit_and_quote", "aggregate", "finish_deposit"]);
  const [collector, deposit, aggregate, finish] = calls(tx);
  expect(deposit.arguments).toHaveLength(7);
  expect(finish.arguments).toHaveLength(8);
  expect(deposit.typeArguments).toHaveLength(5);
  expect(finish.arguments[0]).toMatchObject({ Result: 1 });
  expect(finish.arguments[1]).toMatchObject({ Result: 2 });
  const minArg = finish.arguments[6];
  if (minArg.$kind !== "Input") throw new Error("Expected minimum input");
  const minimum = tx.getData().inputs[minArg.Input].Pure!;
  expect(bcs.u64().fromBase64(minimum.bytes)).toBe("77");
  expect(aggregate.arguments[2]).toMatchObject({ Result: 0 });
  expect(collector.typeArguments).toEqual([config().syTypeTag]);
});

test("Current explicit refresh borrows caller funding without minting SY", () => {
  const tx = new Transaction();
  addCurrentPriceInfo(tx, config(), tx.object(id(30)));
  expect(calls(tx).map(c => c.function)).toEqual(["new", "refresh_and_quote", "aggregate"]);
  expect(calls(tx)[1].arguments).toHaveLength(7);
});

test("missing Current config fails before appending commands", () => {
  const tx = new Transaction();
  expect(() => addCurrentPriceInfo(tx, { ...config(), currentMarketObjectId: undefined }, tx.object(id(30)))).toThrow("currentMarketObjectId");
  expect(tx.getData().commands).toHaveLength(0);
});

test("automatic refresh funding requires a sender", () => {
  expect(() => addCurrentPriceInfo(new Transaction(), config())).toThrow("sender");
});

test("automatic refresh selects one raw underlying unit per quote and returns the remainder", () => {
  const tx = new Transaction();
  tx.setSender(id(99));
  addCurrentPriceInfo(tx, config());
  addCurrentPriceInfo(tx, config());
  const commands = tx.getData().commands;
  const intents = commands.flatMap(c => c.$Intent ? [c.$Intent] : []);
  expect(intents).toHaveLength(2);
  for (const intent of intents) {
    expect(intent.name).toBe("CoinWithBalance");
    expect(intent.data).toMatchObject({ type: normalizeStructTag(config().underlyingTypeTag), balance: 1n });
  }
  expect(commands.filter(c => c.TransferObjects)).toHaveLength(2);
  expect(calls(tx).filter(c => c.function === "refresh_and_quote")).toHaveLength(2);
});

test("raw minima remain exact through u64 maximum", () => {
  for (const minimum of [0n, 1n, 1_000_000n, (1n << 53n) + 1n, (1n << 64n) - 1n]) {
    const tx = new Transaction();
    addCurrentDepositToSy(tx, config(), tx.object(id(30)), minimum);
    const argument = calls(tx).at(-1)!.arguments[6];
    if (argument.$kind !== "Input") throw new Error("Expected minimum input");
    expect(bcs.u64().fromBase64(tx.getData().inputs[argument.Input].Pure!.bytes)).toBe(minimum.toString());
  }
});

test("manifest rejects the old mint-before-deposit route", () => {
  const tx = new Transaction();
  const manifest = getJitterAdapterManifest(config());
  expect(manifest.kind).toBe("current");
  expect(() => manifest.addDepositToSy({ tx, config: config(), inputCoin: tx.object(id(30)), mintRequest: tx.object(id(31)), syAmount: 1n })).toThrow("deposit-first");
});

test("service deposit uses the receipt path and propagates minimum output", async () => {
  const tx = await createJitterTransactionService({ config: config() }).buildDepositToSyTx({
    senderAddress: id(99), underlyingCoinId: id(30), underlyingAmount: 100n, minSyOut: 77n, syIndex: 1n << 64n,
  });
  expect(calls(tx).map(c => c.function)).toEqual(["new", "deposit_and_quote", "aggregate", "finish_deposit"]);
  expect(tx.getData().commands.at(-1)?.$kind).toBe("TransferObjects");
});

test("Current never falls back to demo quotes or stored quote indices", async () => {
  expect(() => addDemoPriceInfo(new Transaction(), config(), 1n << 64n)).toThrow("Current v2");
  await expect(createJitterQuoteService({ config: config() }).quoteUnderlyingToSy(100n)).rejects.toThrow("accrued syIndex");
});

test("deposit requires explicit minimum, and rejects values outside u64", async () => {
  await expect(createJitterTransactionService({ config: config(), resolveSyIndex: () => 1n << 64n }).buildDepositToSyTx({
    senderAddress: id(99), underlyingCoinId: id(30), underlyingAmount: 100n,
  })).rejects.toThrow("minSyOut");
  for (const minimum of [-1n, 1n << 64n]) {
    const tx = new Transaction();
    expect(() => addCurrentDepositToSy(tx, config(), tx.object(id(30)), minimum)).toThrow("u64");
    expect(tx.getData().commands).toHaveLength(0);
  }
});

test("Current product routes use deposit-first and fresh quotes, including exits", async () => {
  const service = createJitterTransactionService({ config: { ...config(), rewardDistributorObjectId: id(44) }, resolveSyIndex: () => 1n << 64n });
  const shared = { senderAddress: id(99), positionId: id(31), rewardSettlement: { strategy: "empty-vector" as const } };
  const funding = { ...shared, underlyingCoinId: id(30), underlyingAmount: 100n };
  const deposits = [
    await service.buildBuyPtFromUnderlyingTx({ ...funding, minPtOut: 1n }),
    await service.buildBuyYtFromUnderlyingTx({ ...funding, minYtOut: 1n, minSyOut: 0n }),
    await service.buildAddLpKeepYtFromUnderlyingTx({ ...funding, syToMintHint: 50n, minLpOut: 1n }),
    await service.buildAddLpFromSyFromUnderlyingTx({ ...funding, syToMintHint: 50n, minLpOut: 1n, minSyOut: 0n }),
  ];
  for (const tx of deposits) {
    const names = calls(tx).map(c => c.function);
    expect(names).toContain("deposit_and_quote");
    expect(names).toContain("finish_deposit");
    expect(names).not.toContain("mint_sy_exact_in_market_state");
    expect(names).toContain("refresh_and_quote");
    expect(names).not.toContain("quote");
  }
  const exits = [
    await service.buildSellPtToUnderlyingTx({ ...shared, ptAmount: 10n, minSyOut: 1n }),
    await service.buildSellYtToUnderlyingTx({ ...shared, ytAmount: 10n, minSyOut: 1n }),
    await service.buildRedeemSyToUnderlyingTx({ senderAddress: id(99), syCoinId: id(30), syAmount: 10n }),
    await service.buildRemoveLpToUnderlyingTx({ ...shared, lpAmount: 10n, minSyOut: 0n, minPtOut: 0n, minTotalSyOut: 1n, route: "active-swap" }),
    await service.buildRemoveLpToUnderlyingTx({ ...shared, lpAmount: 10n, minSyOut: 0n, minPtOut: 0n, minTotalSyOut: 1n, route: "settled-redeem" }),
  ];
  for (const tx of exits) {
    const names = calls(tx).map(c => c.function);
    expect(names).toContain("refresh_and_quote");
    expect(names).toContain("redeem");
    expect(names).not.toContain("quote");
    expect(calls(tx).find(c => c.function === "redeem")?.arguments).toHaveLength(10);
  }
});
