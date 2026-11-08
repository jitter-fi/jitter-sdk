import { expect, test } from "bun:test";
import { getDefaultJitterMarketConfig } from "../config.js";
import { createFullLiquidityService, FullLiquidityPreparationError } from "../services/full-liquidity-service.js";

const configured = getDefaultJitterMarketConfig("testnet");
if (!configured) throw new Error("Missing test market");
const { liquidlink: _points, coinReward: _rewards, ...config } = configured;
const request = { mode: "non-keep-yt" as const, funding: "sy" as const, slippageBps: 50,
  params: { senderAddress: "0xaa", inputCoinId: "0x40", inputAmount: 1_000_000n, syToMintHint: 0n, positionId: "0x41",
    rewardSettlement: { strategy: "empty-vector" as const } } };

test.each([[3010, "curve-limit"], [3011, "precision-unresolved"], [3012, "search-incomplete"]] as const)(
  "preserves Router abort %s as %s, never as a successful quote", async (code, kind) => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async () => ({ success: false, error: `abort ${code}`,
        moveAbort: { package: config.jitterPackageId, module: "router", code } }) });
    try { await service.prepare(request); throw new Error("Unexpected quote"); }
    catch (error) {
      expect(error).toBeInstanceOf(FullLiquidityPreparationError);
      expect((error as FullLiquidityPreparationError).kind).toBe(kind);
    }
  });

test.each(["package", "module"] as const)("does not misclassify another contract's %s abort as a curve certificate", async field => {
  const abort = { package: config.jitterPackageId, module: "router", code: 3010 };
  const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
    simulate: async () => ({ success: false, error: "unrelated abort", moveAbort: { ...abort, [field]: "0xdead" } }) });
  try { await service.prepare(request); throw new Error("Unexpected quote"); }
  catch (error) { expect((error as FullLiquidityPreparationError).kind).toBe("simulation-failed"); }
});

test("accepts an old advisory PY hint without treating it as a PT purchase quantity", async () => {
  let calls = 0;
  const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
    simulate: async () => { calls++; return { success: false, error: "should not simulate" }; } });
  await expect(service.prepare({ ...request, params: { ...request.params, syToMintHint: 1n } })).rejects.toThrow("should not simulate");
  expect(calls).toBe(1);
});
