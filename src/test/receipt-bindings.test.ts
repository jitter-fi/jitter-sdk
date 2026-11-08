import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { bcs, type BcsType } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { resolveReceiptWithdrawalCapacity } from "../domain/withdrawal-capacity.js";

const id = (suffix: string) => `0x${suffix.padStart(64, "0")}`;
type Builder = (options: { package: string; arguments: (string | bigint)[]; typeArguments: string[] }) => (tx: Transaction) => unknown;

for (const [kind, count] of [["haedal", 3], ["ember", 5]] as const) {
  test(`${kind} generated bindings include the full circuit breaker and queue surface`, async () => {
    const modulePath = `../generated/${kind}_adapter/${kind}_market_vault.js`;
    const bindings: Record<string, unknown> = await import(modulePath);
    for (const name of [
      "queueRedeem", "cancelQueuedRedeem", "redeemReceipt",
      "completeQueuedRedeemBy_ACL", "completeQueuedRedeemByAdmin",
      "rejectWithdrawBy_ACL", "rejectWithdrawByAdmin",
      "setWithdrawCircuitBreakerBy_ACL", "setWithdrawCircuitBreakerByAdmin",
      "refreshWithdrawCircuitBreakerBy_ACL", "refreshWithdrawCircuitBreakerByAdmin",
      "receiptBalance", "queuedReceipt", "withdrawQueueLength", "withdrawQueueRequestId",
      "withdrawWindowMs", "withdrawBpsPerWindow", "withdrawWindowStartMs",
      "withdrawWindowBaseReserve", "withdrawWindowWithdrawn", "withdrawWindowMinted",
      "withdrawQuotaPerWindow", "remainingWithdrawQuota", "withdrawRequestExists",
    ]) expect(bindings[name]).toBeFunction();

    const types = Array(count).fill("0x2::sui::SUI");
    function build(name: string, args: (string | bigint)[]) {
      const tx = new Transaction();
      (bindings[name] as Builder)({ package: id("10"), arguments: args, typeArguments: types })(tx);
      return tx;
    }
    const queue = build("queueRedeem", [id("1"), 77n, id("2"), id("3"), id("4")]);
    const queueCall = queue.getData().commands[0].MoveCall!;
    expect(queueCall).toMatchObject({ module: `${kind}_market_vault`, function: "queue_redeem", typeArguments: types });
    expect(queueCall.arguments).toHaveLength(6);
    const cancel = build("cancelQueuedRedeem", [9007199254740993n, id("2"), id("3")]);
    expect(cancel.getData().commands[0].MoveCall!.arguments).toHaveLength(4);
    expect(cancel.getData().inputs[0].Pure!.bytes).toBe(bcs.u64().serialize(9007199254740993n).toBase64());

    for (const name of ["createMarketVaultBy_ACL", "createMarketVaultByAdmin"]) {
      const creation = build(name, [id("1"), id("2"), id("3"), id("4"), id("5"), 86_400_000n, 2500n]);
      expect(creation.getData().commands[0].MoveCall!.arguments).toHaveLength(8);
      expect(creation.getData().inputs[5].Pure!.bytes).toBe(bcs.u64().serialize(86_400_000n).toBase64());
      expect(creation.getData().inputs[6].Pure!.bytes).toBe(bcs.u64().serialize(2500n).toBase64());
    }
    const source = await readFile(new URL(`../generated/${kind}_adapter/${kind}_market_vault.ts`, import.meta.url), "utf8");
    expect(source).toContain("receipt_balance: balance.Balance");
    expect(source).toContain("queued_receipt: bcs.u64()");
    expect(source).toContain("receipt_amount: bcs.u64()");
    expect(source).not.toContain("hasui_balance:");
    expect(source).toContain("withdraw_window_minted: bcs.u128()");

    const schema = bindings[kind === "haedal" ? "HaedalMarketVault" : "EmberMarketVault"] as
      BcsType<Record<string, unknown>, Record<string, unknown>>;
    const fresh = {
      id: id("3"), market_id: id("4"), [kind === "haedal" ? "staking_id" : "ember_vault_id"]: id("5"),
      receipt_balance: { value: "1000" }, updated_at: "9500",
      withdraw_window_ms: "1000", withdraw_bps_per_window: "1000", withdraw_window_start_ms: "9500",
      withdraw_window_base_reserve: "1000", withdraw_window_withdrawn: "18446744073709551616120",
      withdraw_window_minted: "18446744073709551616100", queued_receipt: "950", next_withdraw_request_id: "7",
      withdraw_queue: { id: id("9"), size: "0", head: null, tail: null },
    };
    const decoded = schema.parse(schema.serialize(fresh).toBytes());
    expect(decoded).toEqual(fresh);
    expect(resolveReceiptWithdrawalCapacity(decoded, 10_000)).toBe(50n);
    const requestSchema = bindings.WithdrawRequest as BcsType<Record<string, unknown>, Record<string, unknown>>;
    const request = {
      request_id: "7", vault_id: id("3"), market_id: id("4"),
      [kind === "haedal" ? "staking_id" : "ember_vault_id"]: id("5"), owner: id("aa"),
      receipt_amount: "50", created_at: "9500", sy_balance: { value: "50" },
    };
    expect(requestSchema.parse(requestSchema.serialize(request).toBytes())).toEqual(request);
  });
}
