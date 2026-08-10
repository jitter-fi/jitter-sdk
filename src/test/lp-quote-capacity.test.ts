import { describe, expect, test } from "bun:test";

import { FP64_ONE } from "../constants.js";
import { constrainNonKeepYtMintForQuote } from "../simulation.js";

describe("non-keep YT LP quote capacity", () => {
  test("keeps a candidate that can repay its YT leg", async () => {
    const candidate = await constrainNonKeepYtMintForQuote({
      preferredSyToMint: 30_000_000n,
      totalPt: 500_000_000n,
      syIndex: FP64_ONE,
      quotePtOut: async (grossSy) => grossSy,
    });

    expect(candidate).toBe(30_000_000n);
  });

  test("scales the candidate down to the available repay capacity", async () => {
    const candidate = await constrainNonKeepYtMintForQuote({
      preferredSyToMint: 90_000_000n,
      totalPt: 500_000_000n,
      syIndex: FP64_ONE,
      quotePtOut: async (grossSy) =>
        grossSy > 22_000_000n ? 22_000_000n : grossSy,
    });

    expect(candidate).toBe(22_000_000n);
  });

  test("backs off safely when a capacity quote aborts", async () => {
    const candidate = await constrainNonKeepYtMintForQuote({
      preferredSyToMint: 80_000_000n,
      totalPt: 500_000_000n,
      syIndex: FP64_ONE,
      quotePtOut: async (grossSy) => {
        if (grossSy > 20_000_000n) throw new Error("trade bound");
        return grossSy;
      },
    });

    expect(candidate).toBe(20_000_000n);
  });
});
