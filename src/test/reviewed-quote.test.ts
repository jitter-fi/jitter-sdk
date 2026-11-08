import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { createJitterTradeService } from "../services/trade-service.js";
import { createJitterQuoteService } from "../services/quote-service.js";
import type { JitterTransactionService } from "../services/transaction-service.js";
import { makeTestMarketConfig } from "./fakes.js";

test("build preserves reviewed bounds even when a new quote would be worse", async () => {
  const config = makeTestMarketConfig();
  let quotes = 0;
  let minimum = 0n;
  const service = createJitterTradeService({
    config, marketId: "demo",
    quoteService: createJitterQuoteService({ config, delegates: {
      quoteSwapSyForPt: async () => ({ ptOut: ++quotes === 1 ? 900n : 500n, slippageBps: 0n }),
    }}),
    transactionService: { buildBuyPtTx: async (args: { minPtOut: bigint }) => {
      minimum = args.minPtOut;
      return new Transaction();
    }} as unknown as JitterTransactionService,
  });
  const request = { marketId: "demo", product: "pt", side: "buy", inputAsset: "sy", amount: "1000", slippageBps: 100, owner: "0xaa" } as const;
  const reviewedQuote = await service.quoteTrade(request);
  await service.buildTradeTransaction({ ...request, inputCoinId: "0xbb", reviewedQuote });
  expect(quotes).toBe(1);
  expect(minimum).toBe(891n);
  await expect(service.buildTradeTransaction({ ...request, amount: "2000", reviewedQuote })).rejects.toThrow("reviewed quote");
  await expect(service.buildTradeTransaction({ ...request, owner: "0xcc", reviewedQuote })).rejects.toThrow("reviewed quote");
  await expect(service.buildTradeTransaction({ ...request, pairedPtAmount: "500", reviewedQuote })).rejects.toThrow("reviewed quote");
  await expect(service.buildTradeTransaction({ ...request, syIndex: "1", reviewedQuote })).rejects.toThrow("reviewed quote");
});
