import { expect, test } from "bun:test";

import { JITTER_CONTRACT_SURFACE } from "../contract/contract-surface.js";
import * as routerBindings from "../generated/jitter/router.js";

test("contract surface lists current adapter packages", () => {
  expect(JITTER_CONTRACT_SURFACE.adapters.map((adapter) => adapter.kind)).toEqual([
    "demo",
    "scallop",
    "ember",
    "suilend",
    "navi",
  ]);
});

test("contract surface includes frontend-relevant core objects", () => {
  expect(JITTER_CONTRACT_SURFACE.objects.CoinAuthority.fields).toEqual([
    "sy_treasury",
    "pt_treasury",
    "yt_treasury",
  ]);
  expect(JITTER_CONTRACT_SURFACE.objects.MarketState.fields).toContain("coin_authority");
  expect(JITTER_CONTRACT_SURFACE.objects.MarketState.fields).not.toContain("sy_treasury");
  expect(JITTER_CONTRACT_SURFACE.objects.MarketState.fields).toContain("pool_sy_balance");
  expect(JITTER_CONTRACT_SURFACE.objects.MarketState.fields).toContain("lp_supply");
  expect(JITTER_CONTRACT_SURFACE.objects.MarketState.fields).toContain("settlement");
  expect(JITTER_CONTRACT_SURFACE.objects.MarketState.fields).toContain("py_index_stored");
  expect(JITTER_CONTRACT_SURFACE.objects.SettlementState.fields).toContain("is_settled");
  expect(JITTER_CONTRACT_SURFACE.objects.RiskConfig.fields).toContain("market_cap");
  expect(JITTER_CONTRACT_SURFACE.objects.RiskConfig.fields).toContain("py_index_guard");
  expect(JITTER_CONTRACT_SURFACE.objects.PyIndexGuard.fields).toEqual([
    "mode",
    "max_step_growth_bps",
    "max_window_growth_bps",
    "window_ms",
    "anchor_index_raw",
    "anchor_timestamp_ms",
  ]);
  expect(JITTER_CONTRACT_SURFACE.objects.RewardState.fields).toContain("pool_reward_guard");
  expect(JITTER_CONTRACT_SURFACE.objects.JitterPosition.fields).toContain("market_state_id");
  expect(JITTER_CONTRACT_SURFACE.objects.JitterPosition.fields).toContain("py");
  expect(JITTER_CONTRACT_SURFACE.objects.JitterPosition.fields).toContain("lp");
});

test("generated router exposes canonical routes without legacy long aliases", () => {
  const canonicalRoutes = [
    "mintPy",
    "buyPt",
    "buyExactPt",
    "sellPt",
    "sellPtForExactSy",
    "buyYt",
    "buyExactYt",
    "sellYt",
    "sellYtForExactSy",
    "addLp",
    "addLpKeepYt",
    "addLpFromSy",
    "removeLp",
  ];
  const removedAliases = [
    "mintPyWithRewards",
    "swapSyForPtToPosition",
    "swapSyForExactPtToPosition",
    "swapPtForSyFromPosition",
    "swapPtForExactSyFromPosition",
    "swapSyForYtToPosition",
    "swapSyForExactYtToPosition",
    "swapYtForSyToPosition",
    "addLiquidityFromPosition",
    "addLiquidityKeepYtFromSy",
    "addLiquidityFromSy",
    "removeLiquidityToPosition",
  ];

  for (const route of canonicalRoutes) {
    expect(routerBindings).toHaveProperty(route);
  }
  for (const route of removedAliases) {
    expect(routerBindings).not.toHaveProperty(route);
  }
});
