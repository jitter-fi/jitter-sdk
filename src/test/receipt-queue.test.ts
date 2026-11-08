import { describe, expect, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

import { createJitterSdk } from "../facade/jitter-sdk.js";
import { detectAdapterKind } from "../adapters/registry.js";
import { createJitterTransactionService, type QueueRedeemSyTxParams } from "../services/transaction-service.js";
import type { JitterMarketConfig } from "../types.js";
import { InMemoryJitterChainReader, makeTestMarketConfig } from "./fakes.js";

const id = (suffix: string) => `0x${suffix.padStart(64, "0")}`;
const senderAddress = id("aa");
const params = {
  syCoinId: id("11"), syCoinIds: [id("11"), id("12")],
  syAmount: 123n, senderAddress,
};

function configFor(kind: "scallop" | "haedal" | "ember"): JitterMarketConfig {
  return makeTestMarketConfig({
    demoMarketVaultObjectId: "", adapterKind: kind,
    syStateObjectId: id("4"), globalConfigObjectId: id("5"), marketObjectId: id("24"),
    [`${kind}AdapterPackageId`]: id("21"),
    [`${kind}MarketVaultObjectId`]: id("22"),
    emberReceiptTypeTag: `${id("23")}::receipt::RECEIPT`,
    marketStateObjectId: id("24"),
  });
}

function calls(tx: Transaction) {
  return tx.getData().commands.flatMap((c) => c.$kind === "MoveCall" ? [c.MoveCall] : []);
}

type CallArgument = ReturnType<typeof calls>[number]["arguments"][number];

function pureU64(tx: Transaction, arg: CallArgument) {
  if (arg.$kind !== "Input") throw new Error("Expected pure input");
  const input = tx.getData().inputs[arg.Input];
  if (input.$kind !== "Pure") throw new Error("Expected pure input");
  return BigInt(bcs.u64().fromBase64(input.Pure.bytes));
}

function objectInput(tx: Transaction, arg: CallArgument) {
  if (arg.$kind !== "Input") throw new Error("Expected object input");
  const input = tx.getData().inputs[arg.Input];
  if (input.$kind === "Object" && input.Object.$kind === "SharedObject") return input.Object.SharedObject.objectId;
  if (input.$kind !== "UnresolvedObject") throw new Error("Expected unresolved object");
  return input.UnresolvedObject.objectId;
}

describe("receipt and queued SY exits", () => {
  for (const kind of ["scallop", "haedal", "ember"] as const) {
    test(`${kind} high-level exits use exact ABI without upstream objects or oracle`, async () => {
      const config = configFor(kind);
      expect(detectAdapterKind(config)).toBe(kind);
      const service = createJitterTransactionService({
        config, resolveSyIndex: () => { throw new Error("No oracle allowed"); },
      });
      const types = [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
      if (kind === "scallop") types.unshift(config.underlyingTypeTag);
      if (kind === "ember") types.unshift(config.underlyingTypeTag, config.emberReceiptTypeTag!);

      const receipt = service.buildRedeemSyToReceiptTx({ ...params, minReceiptOut: 120n });
      expect(receipt).toBeInstanceOf(Transaction);
      const receiptCalls = calls(receipt);
      expect(receiptCalls).toHaveLength(1);
      expect(receiptCalls[0]).toMatchObject({
        package: id("21"), module: `${kind}_market_vault`,
        function: kind === "scallop" ? "redeem" : "redeem_receipt", typeArguments: types,
      });
      expect(receiptCalls[0].arguments).toHaveLength(kind === "scallop" ? 7 : 6);
      if (kind === "scallop") expect(pureU64(receipt, receiptCalls[0].arguments[1])).toBe(120n);
      expect(receiptCalls[0].arguments.slice(kind === "scallop" ? 2 : 1).map((a) => objectInput(receipt, a)))
        .toEqual([config.syStateObjectId, config.globalConfigObjectId!, id("22"), id("24"), id("6")]);
      expect(receipt.getData().commands.map((c) => c.$kind))
        .toEqual(["MergeCoins", "SplitCoins", "MoveCall", "TransferObjects"]);

      const queued = await service.buildQueueRedeemSyTx({ ...params, minReceiptOut: 119n });
      expect(calls(queued)).toHaveLength(1);
      const queueCall = calls(queued)[0];
      expect(queueCall).toMatchObject({
        package: id("21"), module: `${kind}_market_vault`, function: "queue_redeem", typeArguments: types,
      });
      expect(queueCall.arguments).toHaveLength(6);
      expect(pureU64(queued, queueCall.arguments[1])).toBe(119n);
      expect(queueCall.arguments.slice(2).map((a) => objectInput(queued, a)))
        .toEqual([config.globalConfigObjectId!, id("22"), id("24"), id("6")]);
      expect(queued.getData().commands.map((c) => c.$kind))
        .toEqual(["MergeCoins", "SplitCoins", "MoveCall"]);

      const cancelled = await service.buildCancelQueuedRedeemSyTx({ requestId: "9007199254740993", senderAddress });
      const cancelCall = calls(cancelled)[0];
      expect(cancelCall).toMatchObject({
        package: id("21"), module: `${kind}_market_vault`, function: "cancel_queued_redeem", typeArguments: types,
      });
      expect(cancelCall.arguments).toHaveLength(4);
      expect(pureU64(cancelled, cancelCall.arguments[0])).toBe(9007199254740993n);
      expect(cancelCall.arguments.slice(1).map((a) => objectInput(cancelled, a)))
        .toEqual([config.globalConfigObjectId!, id("22"), id("6")]);
      const transfer = cancelled.getData().commands[1].TransferObjects!;
      expect(transfer.objects).toEqual([{ $kind: "Result", Result: 0 }]);
    });

    test(`${kind} defaults preserve exact receipt units and queue minimum`, async () => {
      const service = createJitterTransactionService({ config: configFor(kind) });
      const receipt = service.buildRedeemSyToReceiptTx(params);
      if (kind === "scallop") expect(pureU64(receipt, calls(receipt)[0].arguments[1])).toBe(params.syAmount);
      const queue = await service.buildQueueRedeemSyTx(params);
      expect(pureU64(queue, calls(queue)[0].arguments[1])).toBe(0n);
    });
  }

  test("exact receipt exits reject an impossible minimum before building", () => {
    for (const kind of ["haedal", "ember"] as const) {
      const service = createJitterTransactionService({ config: configFor(kind) });
      expect(() => service.buildRedeemSyToReceiptTx({ ...params, minReceiptOut: 124n })).toThrow("minReceiptOut");
    }
  });

  test("Scallop minMarketCoinOut remains an alias; canonical minimum takes precedence including zero", async () => {
    const service = createJitterTransactionService({ config: configFor("scallop") });
    for (const [minimums, expected] of [
      [{ minMarketCoinOut: 117n }, 117n],
      [{ minMarketCoinOut: 117n, minReceiptOut: 0n }, 0n],
    ] as const) {
      const args: QueueRedeemSyTxParams = { ...params, ...minimums };
      const receipt = service.buildRedeemSyToReceiptTx(args);
      const queue = await service.buildQueueRedeemSyTx(args);
      expect(pureU64(receipt, calls(receipt)[0].arguments[1])).toBe(expected);
      expect(pureU64(queue, calls(queue)[0].arguments[1])).toBe(expected);
    }
  });

  test("facade exposes Haedal and Ember receipt exits without a custom manifest", () => {
    const sdk = createJitterSdk({ network: "testnet", chainReader: new InMemoryJitterChainReader() });
    for (const kind of ["haedal", "ember"] as const) {
      const market = sdk.forMarket(configFor(kind));
      expect(market.adapter.kind).toBe(kind);
      expect(market.adapter.canRedeemUnderlying).toBe(false);
      expect(market.transactions.buildRedeemSyToReceiptTx(params)).toBeInstanceOf(Transaction);
    }
  });

  test("receipt exits remain synchronous and do not resolve unrelated PointConfigs", async () => {
    let reads = 0;
    const config = configFor("haedal");
    config.liquidlink = {
      liquidlinkPackageId: id("30"), liquidlinkGlobalConfigObjectId: id("31"),
      pointPrograms: [{ label: "Points", protocol: "Jitter", pointConfigObjectId: id("32"),
        projectObjectId: id("33"), scoreboardObjectId: id("34") }],
    };
    const service = createJitterTransactionService({
      config, pointConfigReader: { async getPointConfig() {
        reads++;
        return { closed: false, projectObjectId: id("33"), scoreboardObjectId: id("34") };
      } },
    });
    expect(service.buildRedeemSyToReceiptTx(params)).toBeInstanceOf(Transaction);
    await service.buildQueueRedeemSyTx(params);
    await service.buildCancelQueuedRedeemSyTx({ requestId: "1", senderAddress });
    expect(reads).toBe(0);
  });

  test("unsupported adapters and missing receipt types fail clearly", async () => {
    const demo = createJitterTransactionService({ config: makeTestMarketConfig() });
    expect(() => demo.buildRedeemSyToReceiptTx(params)).toThrow("receipt");
    await expect(demo.buildQueueRedeemSyTx(params)).rejects.toThrow("receipt");
    await expect(demo.buildCancelQueuedRedeemSyTx({ requestId: "1", senderAddress })).rejects.toThrow("receipt");
    const ember = createJitterTransactionService({ config: { ...configFor("ember"), emberReceiptTypeTag: undefined } });
    expect(() => ember.buildRedeemSyToReceiptTx(params)).toThrow("emberReceiptTypeTag");
  });
});
