import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { createJitterTransactionService } from "../services/transaction-service.js";
import { getDefaultJitterMarketConfig } from "../config.js";

const owner = "0x" + "a".repeat(64);
const config = getDefaultJitterMarketConfig("testnet")!;
const service = createJitterTransactionService({ config });

test("claims from multiple positions compose in one transaction", async () => {
  const transaction = new Transaction();
  for (const pyPositionId of ["0x11", "0x12"]) {
    expect(await service.buildClaimYtInterestTx({ senderAddress: owner, pyPositionId, transaction })).toBe(transaction);
  }
  expect(transaction.getData().commands.filter(c => c.$kind === "TransferObjects")).toHaveLength(2);
  expect(transaction.getData().sender).toBe(owner);
});

test("composition cannot replace an existing sender", async () => {
  const transaction = new Transaction();
  transaction.setSender("0x1");
  await expect(service.buildClaimYtInterestTx({ senderAddress: owner, pyPositionId: "0x11", transaction })).rejects.toThrow("sender");
  expect(transaction.getData().commands).toHaveLength(0);
});

test("SY redemption supports address balances and exact typed coin intents", async () => {
  const transaction = new Transaction();
  expect(await service.buildRedeemSyToUnderlyingTx({ senderAddress: owner, syAmount: 7n, transaction })).toBe(transaction);
  const intent = transaction.getData().commands.find(c => c.$kind === "$Intent");
  const serialized = JSON.stringify(intent, (_, value) => typeof value === "bigint" ? value.toString() : value);
  expect(serialized).toContain(config.syTypeTag);
  expect(serialized).toContain('7');
  await expect(service.buildRedeemSyToUnderlyingTx({ senderAddress: owner, syAmount: 0n })).rejects.toThrow("positive");
});
