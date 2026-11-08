import { expect, test } from "bun:test";
import { assertValidYtSaleQuote } from "../domain/yt-sale-quote.js";

test.each([6, 9])("rejects impossible YT repayment for %d-decimal markets", (decimals) => {
  const unit = 10n ** BigInt(decimals);
  expect(() => assertValidYtSaleQuote(unit, unit, unit, 0n)).toThrow("unavailable");
  expect(() => assertValidYtSaleQuote(unit, unit, unit, unit)).toThrow("unavailable");
  expect(() => assertValidYtSaleQuote(unit, 2n, unit, unit - 1n)).toThrow("unavailable");
  expect(() => assertValidYtSaleQuote(unit, 1n, unit, unit - 1n)).not.toThrow();
  expect(() => assertValidYtSaleQuote(0n, 0n, 0n, 0n)).not.toThrow();
});
