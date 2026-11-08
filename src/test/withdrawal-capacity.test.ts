import { expect, test } from "bun:test";
import { resolveReceiptWithdrawalCapacity } from "../domain/withdrawal-capacity.js";

test("fresh Haedal/Ember payloads use common receipt fields and full-width net counters", () => {
  const fresh = {
    receipt_balance: { value: "1000" }, queued_receipt: "920",
    withdraw_window_ms: "1000", withdraw_window_start_ms: "9500",
    withdraw_bps_per_window: "1000", withdraw_window_base_reserve: "1000",
    withdraw_window_withdrawn: "18446744073709551616120",
    withdraw_window_minted: "18446744073709551616100",
  };
  expect(resolveReceiptWithdrawalCapacity(fresh, 10_000)).toBe(80n);
  expect(resolveReceiptWithdrawalCapacity({ ...fresh, queued_receipt: "950" }, 10_000)).toBe(50n);
  expect(resolveReceiptWithdrawalCapacity({ ...fresh, withdraw_window_start_ms: "9000" }, 10_000)).toBe(80n);
  expect(resolveReceiptWithdrawalCapacity({ ...fresh, receipt_balance: undefined, hasui_balance: "1000" }, 10_000)).toBe(0n);
});

test("fresh receipt balance supports gRPC scalar and nested balance shapes", () => {
  const fields = {
    withdraw_window_ms: "1", withdraw_window_start_ms: "0", withdraw_bps_per_window: "10000",
    queued_receipt: "1", withdraw_window_base_reserve: "0",
  };
  for (const receipt_balance of ["1000", 1000n, { value: "1000" }, { fields: { value: "1000" } }]) {
    expect(resolveReceiptWithdrawalCapacity({ ...fields, receipt_balance }, 1)).toBe(999n);
  }
});

test("malformed receipt accounting fails closed", () => {
  const fields = {
    receipt_balance: "1000", queued_receipt: "0",
    withdraw_window_ms: "1000", withdraw_window_start_ms: "9500",
    withdraw_bps_per_window: "1000", withdraw_window_base_reserve: "1000",
    withdraw_window_withdrawn: "0", withdraw_window_minted: "0",
  };
  for (const bad of [
    { queued_receipt: "-1" }, { queued_receipt: "bad" }, { receipt_balance: "-1" },
    { withdraw_window_minted: "bad" }, { withdraw_window_withdrawn: "-1" },
    { withdraw_window_start_ms: "10001" }, { withdraw_window_ms: "0" },
    { queued_receipt: undefined }, { withdraw_window_minted: undefined },
    { withdraw_window_start_ms: undefined },
  ]) expect(resolveReceiptWithdrawalCapacity({ ...fields, ...bad }, 10_000)).toBe(0n);
});
