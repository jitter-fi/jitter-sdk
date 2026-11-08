import { expect, test } from "bun:test";

import { JITTER_CONTRACT_SURFACE } from "../contract/contract-surface.js";
import * as routerBindings from "../generated/jitter/router.js";
import { InterestSegment } from "../generated/jitter/deps/jitter_math/interest_math.js";

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
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).toContain("interest_segment");
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).not.toContain("last_collect_interest_index");
  expect(JITTER_CONTRACT_SURFACE.objects.CoinAuthority.fields).toEqual([
    "sy_treasury",
    "pt_treasury",
    "yt_treasury",
  ]);
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).toContain("coin_authority");
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).not.toContain("sy_treasury");
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).toContain("pool_sy_balance");
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).toContain("lp_supply");
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).toContain("settlement");
  expect(JITTER_CONTRACT_SURFACE.objects.Market.fields).toContain("py_index_stored");
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

test("cumulative interest segment BCS preserves full-width counters", () => {
  const segment = {
    start_index: (1n << 126n).toString(),
    supply: ((1n << 64n) - 1n).toString(),
    user_accounted: ((1n << 127n) + 17n).toString(),
    fee_accounted: "23",
    index_accounted: (1n << 63n).toString(),
    terminal_dust: "42",
  };
  expect(InterestSegment.parse(InterestSegment.serialize(segment).toBytes())).toEqual(segment);
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
