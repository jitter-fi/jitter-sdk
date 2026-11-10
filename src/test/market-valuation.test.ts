import { expect, test } from "bun:test";
import { valueMarketBalances } from "../domain/market-valuation.js";

const quote = {
  poolSyRaw: "20000000",
  poolPtRaw: "80000000",
  pySyRaw: "80000000",
  reserveFeeSyRaw: "1000000",
  volume24hSyRaw: "3000000",
  volume7dSyRaw: "6000000",
  totalFeesSyRaw: "100000",
  marketDecimals: 6,
  underlyingDecimals: 6,
  syIndexRaw: 2n << 64n,
  underlyingPriceUsd: 0.5,
  ptPriceUsd: 0.45,
};
test("pool liquidity values both reserves; backing TVL includes PY and fees, not PT twice", () => {
  const r = valueMarketBalances(quote);
  expect(r.liquidity).toBe(56);
  expect(r.tvl).toBe(101);
  expect(r.syPrice).toBe(1);
  expect(r.volume24h).toBe(3);
  expect(r.volume7d).toBe(6);
  expect(r.totalFees).toBe(0.1);
});

test("complete receipt backing includes wallet-held SY without inflating AMM liquidity", () => {
  const result = valueMarketBalances({ ...quote, backingSyRaw: "1101000000" });
  expect(result.tvl).toBe(1101);
  expect(result.liquidity).toBe(56);
  expect(valueMarketBalances({ ...quote, backingSyRaw: "0" }).tvl).toBe(0);
});

test("receipt backing already contains queued withdrawals and is not added to market reserves", () => {
  const result = valueMarketBalances({ ...quote, backingSyRaw: "102000000" });
  expect(result.tvl).toBe(102);
  expect(() => valueMarketBalances({ ...quote, backingSyRaw: "-1" })).toThrow();
  expect(() => valueMarketBalances({ ...quote, backingSyRaw: "NaN" })).toThrow();
});
test("nine-decimal balances and differing underlying decimals preserve asset units", () => {
  expect(
    valueMarketBalances({ ...quote, marketDecimals: 9, underlyingDecimals: 9 })
      .liquidity,
  ).toBeCloseTo(0.056, 12);
  const mixed = valueMarketBalances({
    ...quote,
    marketDecimals: 9,
    underlyingDecimals: 6,
  });
  expect(mixed.liquidity).toBeCloseTo(20.036, 12);
});
test("missing prices, zero indices and malformed reserves never become healthy USD values", () => {
  for (const patch of [
    { underlyingPriceUsd: 0 },
    { underlyingPriceUsd: Number.NaN },
    { syIndexRaw: 0n },
    { poolSyRaw: "-1" },
    { pySyRaw: "NaN" },
    { ptPriceUsd: -1 },
  ])
    expect(() => valueMarketBalances({ ...quote, ...patch })).toThrow();
  expect(
    valueMarketBalances({
      ...quote,
      poolSyRaw: "0",
      poolPtRaw: "0",
      pySyRaw: "0",
      reserveFeeSyRaw: "0",
    }).tvl,
  ).toBe(0);
});
