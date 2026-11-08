import { expect, spyOn, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { getDefaultJitterMarketConfig } from "../config.js";
import { getSuiGrpcClient } from "../rpc.js";
import { quoteAddLiquidityFromSy, quoteAddLiquidityKeepYt } from "../simulation.js";

const config = { ...getDefaultJitterMarketConfig("testnet")!, jitterMathPackageId: "0x88" };
const index = 1n << 64n;
const u64 = (value: bigint) => ({ bcs: bcs.u64().serialize(value).toBytes() });
const balanced = bcs.struct("Quote", { status: bcs.u8(), pt: bcs.u64(), cost: bcs.u64(), lp: bcs.u64(),
  refund: bcs.u64(), pt_dust: bcs.u64(), iterations: bcs.u64(), blocked_pt: bcs.u64(), spend_upper: bcs.u256() });

function transport(status = 1, refund = 1n, verifiedCost = 400_000n) {
  const calls: string[] = [];
  const mock = spyOn(getSuiGrpcClient("testnet"), "simulateTransaction").mockImplementation(async options => {
    const tx = options.transaction as Transaction;
    const commands = tx.getData().commands;
    const first = commands[0];
    if (first.$kind !== "MoveCall") throw new Error("Expected quote call");
    calls.push(first.MoveCall.function);
    const results = first.MoveCall.function === "quote_add_lp_keep_yt"
      ? [{ returnValues: [1000n, 500_000n, 400_000n, 600_000n, refund, 2n].map(u64) }]
      : first.MoveCall.function === "quote_balanced_lp"
        ? [{ returnValues: [{ bcs: balanced.serialize({ status, pt: 600_000n, cost: 400_000n, lp: 1000n,
          refund, pt_dust: 2n, iterations: 20n, blocked_pt: 0n, spend_upper: 0n }).toBytes() }] },
          {}, { returnValues: [u64(verifiedCost)] }, { returnValues: [{ bcs: bcs.u128().serialize(index / 2n).toBytes() }] }]
        : [{ returnValues: [u64(400_000n)] }, { returnValues: [u64(125n)] }];
    return { $kind: "Transaction", Transaction: { status: { success: true } }, commandResults: results } as never;
  });
  return { mock, calls };
}

test("Keep preview uses the exact contract split and exposes rounding dust", async () => {
  const { mock, calls } = transport();
  try {
    expect(await quoteAddLiquidityKeepYt("testnet", config, 1_000_000n, index)).toMatchObject({
      lpOut: 1000n, keptYt: 500_000n, syToMint: 400_000n, syOut: 0n, treasurySy: 1n, ptDust: 2n,
    });
    expect(calls).toEqual(["quote_add_lp_keep_yt"]);
  } finally { mock.mockRestore(); }
});

test("Keep preview accepts a Treasury remainder above the Non-Keep dust limit", async () => {
  const { mock } = transport(1, 1000n);
  try {
    expect(await quoteAddLiquidityKeepYt("testnet", config, 1_000_000n, index)).toMatchObject({
      lpOut: 1000n, treasurySy: 1000n,
    });
  } finally { mock.mockRestore(); }
});

test("Non-Keep preview quotes the whole direct trade, not a synthetic YT sale", async () => {
  const { mock, calls } = transport();
  try {
    expect(await quoteAddLiquidityFromSy("testnet", config, 1_000_000n, index)).toMatchObject({
      lpOut: 1000n, syToMint: 0n, keptYt: 0n, ytToSell: 0n, ytSaleSyOut: 0n,
      syOut: 0n, treasurySy: 1n, ptDust: 2n, slippageBps: 3334n,
    });
    expect(calls).toEqual(["quote_balanced_lp"]);
    const tx = mock.mock.calls[0][0].transaction as Transaction;
    const commands = tx.getData().commands;
    expect(commands.map(c => c.$kind === "MoveCall" ? c.MoveCall.function : c.$kind)).toEqual([
      "quote_balanced_lp", "amounts", "estimate_market_state_swap_sy_for_exact_pt", "estimate_market_state_pt_price",
    ]);
    expect(commands[2].$kind === "MoveCall" && commands[2].MoveCall.arguments[1]).toEqual({$kind: "NestedResult", NestedResult: [1, 0]});
  } finally { mock.mockRestore(); }
});

test("Non-Keep still rejects a cost mismatch inside the same simulation", async () => {
  const { mock } = transport(1, 1n, 400_001n);
  try { await expect(quoteAddLiquidityFromSy("testnet", config, 1_000_000n, index)).rejects.toThrow("quote changed"); }
  finally { mock.mockRestore(); }
});

test.each([[2, "curve-limit"], [3, "precision-unresolved"], [4, "search-incomplete"]] as const)(
  "Non-Keep status %s fails closed as %s", async (status, reason) => {
    const { mock } = transport(status);
    try { await expect(quoteAddLiquidityFromSy("testnet", config, 1_000_000n, index)).rejects.toThrow(reason); }
    finally { mock.mockRestore(); }
  });

test("a successful status with an excessive SY refund is not a full-input quote", async () => {
  const { mock } = transport(1, 1000n);
  try { await expect(quoteAddLiquidityFromSy("testnet", config, 1_000_000n, index)).rejects.toThrow("refund"); }
  finally { mock.mockRestore(); }
});
