import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import { JitterClient } from "../client.js";
import { DEFAULT_DEMO_SY_INDEX } from "../constants.js";
import { getDefaultJitterMarketConfig } from "../config.js";

const senderAddress = objectId("aa");

describe("MarketState treasury interest builders", () => {
  test("admin settlement-index route uses Option::none and cannot redirect funds", async () => {
    const client = JitterClient.fromConfig("testnet", getTestConfig());
    const tx = await client.buildCollectTreasuryInterestByAdminTx({
      adminCapId: objectId("40"),
      senderAddress,
      marketSettled: true,
    });

    expect(collectMoveCalls(tx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "option", function: "none" }),
        expect.objectContaining({
          module: "market_state",
          function: "collect_treasury_interest_by_admin",
        }),
      ]),
    );
    expect(collectCommandKinds(tx)).not.toContain("TransferObjects");
    expect(
      findMoveCall(tx, "market_state", "collect_treasury_interest_by_admin")?.arguments,
    ).toHaveLength(5);
  });

  test("ACL pre-expiry route wraps a fresh PriceInfo in Option::some", async () => {
    const client = JitterClient.fromConfig("testnet", getTestConfig());
    const tx = await client.buildCollectTreasuryInterestByAclTx({
      senderAddress,
      syIndex: DEFAULT_DEMO_SY_INDEX,
    });

    expect(collectMoveCalls(tx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "demo_price_ticket", function: "quote" }),
        expect.objectContaining({ module: "option", function: "some" }),
        expect.objectContaining({
          module: "market_state",
          function: "collect_treasury_interest_by_acl",
        }),
      ]),
    );
    expect(collectCommandKinds(tx)).not.toContain("TransferObjects");
    expect(
      findMoveCall(tx, "market_state", "collect_treasury_interest_by_acl")?.arguments,
    ).toHaveLength(5);
  });
});

function getTestConfig() {
  const config = getDefaultJitterMarketConfig("testnet");
  if (!config) throw new Error("missing default SDK testnet market config");
  const marketStateObjectId = objectId("31");
  return {
    ...config,
    marketStateObjectId,
    marketObjectId: marketStateObjectId,
    pyStateObjectId: marketStateObjectId,
    poolObjectId: marketStateObjectId,
    globalConfigObjectId: objectId("32"),
    aclObjectId: objectId("33"),
  };
}

function objectId(suffix: string): string {
  return `0x${suffix.padStart(64, "0")}`;
}

function collectMoveCalls(tx: Transaction) {
  return tx.getData().commands.flatMap((command) => {
    if (command.$kind !== "MoveCall") return [];
    return [command.MoveCall];
  });
}

function collectCommandKinds(tx: Transaction) {
  return tx.getData().commands.map((command) => command.$kind);
}

function findMoveCall(tx: Transaction, module: string, fn: string) {
  return collectMoveCalls(tx).find(
    (call) => call.module === module && call.function === fn,
  );
}
