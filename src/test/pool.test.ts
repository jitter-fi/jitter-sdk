import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import { addSwapSyForExactYt } from "../pool.js";
import type { JitterMarketConfig } from "../types.js";

const objectId = (digit: string) => `0x${digit.repeat(64)}`;

const CONFIG = {
  jitterPackageId: objectId("1"),
  globalConfigObjectId: objectId("2"),
  rewardDistributorObjectId: objectId("3"),
  marketStateObjectId: objectId("4"),
  syTypeTag: `${objectId("5")}::sy::SY`,
  ptTypeTag: `${objectId("6")}::pt::PT`,
  ytTypeTag: `${objectId("7")}::yt::YT`,
} as JitterMarketConfig;

describe("exact YT transaction primitive", () => {
  test("returns actual YT and SY change from the router result", () => {
    const tx = new Transaction();
    const [actualYtOut, syChange] = addSwapSyForExactYt(
      tx,
      CONFIG,
      tx.object(objectId("8")),
      2n,
      3n,
      tx.object(objectId("9")),
      tx.object(objectId("a")),
    );

    expect(actualYtOut).toMatchObject({ $kind: "NestedResult" });
    expect(syChange).toMatchObject({ $kind: "NestedResult" });

    const actualResult = (actualYtOut as { NestedResult: [number, number] }).NestedResult;
    const changeResult = (syChange as { NestedResult: [number, number] }).NestedResult;
    expect(actualResult[0]).toBe(changeResult[0]);
    expect(actualResult[1]).toBe(0);
    expect(changeResult[1]).toBe(1);
  });
});
