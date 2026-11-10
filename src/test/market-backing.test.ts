import { expect, test } from "bun:test";
import { SuiJitterChainReader } from "../infrastructure/sui-chain-reader.js";
import { makeTestMarketConfig } from "./fakes.js";

const market = `0x${"1".repeat(64)}`;
const vault = `0x${"2".repeat(64)}`;
const reader = (fields: Record<string, unknown>) => new SuiJitterChainReader("mainnet", {
  getObject: async <T>() => fields as T,
});

test("each supported vault reports its entire reserve, including the unspent withdrawal queue", async () => {
  for (const [key, balance] of [["scallopMarketVaultObjectId", "market_coin_balance"], ["haedalMarketVaultObjectId", "receipt_balance"], ["emberMarketVaultObjectId", "receipt_balance"]] as const) {
    const config = makeTestMarketConfig({ marketObjectId: market, [key]: vault });
    for (const value of ["971965355", { value: "971965355" }, { fields: { value: "971965355" } }]) {
      expect(await reader({ market_id: market, [balance]: value, queued_receipt: "500" }).getMarketBackingSy(config)).toBe(971965355n);
    }
  }
});

test("wrong market, malformed and unsafe balances cannot be presented as healthy TVL", async () => {
  const config = makeTestMarketConfig({ marketObjectId: market, haedalMarketVaultObjectId: vault });
  for (const fields of [{ market_id: vault, receipt_balance: "1" }, { market_id: market }, { market_id: market, receipt_balance: "-1" }, { market_id: market, receipt_balance: Number.MAX_SAFE_INTEGER + 1 }]) {
    await expect(reader(fields).getMarketBackingSy(config)).rejects.toThrow();
  }
});
