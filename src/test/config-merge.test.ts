import { describe, expect, test } from "bun:test";

import { mergeJitterMarketConfig } from "../internal/config-merge.js";
import type { JitterMarketConfig } from "../types.js";

const id = (digit: string) => `0x${digit.repeat(64)}`;

function baseConfig(): JitterMarketConfig {
  return {
    jitterPackageId: id("1"),
    jitterOriginalPackageId: id("a"),
    demoAdapterPackageId: id("1"),
    oraclePackageId: id("1"),
    jitterExtensionsPackageId: id("2"),
    syStateObjectId: id("3"),
    globalConfigObjectId: id("4"),
    aclObjectId: id("4"),
    marketObjectId: id("5"),
    pyStateObjectId: id("5"),
    poolObjectId: id("5"),
    priceAggregatorObjectId: id("6"),
    demoMarketVaultObjectId: id("7"),
    underlyingTypeTag: `${id("8")}::underlying::UNDERLYING`,
    syTypeTag: `${id("9")}::sy::SY`,
    ptTypeTag: `${id("a")}::pt::PT`,
    ytTypeTag: `${id("b")}::yt::YT`,
    liquidlink: {
      enabled: true,
      liquidlinkPackageId: id("c"),
      liquidlinkGlobalConfigObjectId: id("d"),
      projectObjectId: id("e"),
      pointConfigObjectId: id("f"),
      scoreboardObjectId: id("0"),
      checkIn: {
        packageId: id("1"),
        campaignObjectId: id("2"),
      },
    },
  };
}

describe("market config overrides", () => {
  test("preserves generated LiquidLink bindings missing from a stale env override", () => {
    const base = baseConfig();
    const override = {
      ...base,
      liquidlink: {
        enabled: true,
        pointConfigObjectId: id("3"),
        checkIn: {
          campaignObjectId: id("4"),
        },
      },
    } satisfies JitterMarketConfig;

    const merged = mergeJitterMarketConfig(base, override);

    expect(merged.liquidlink?.liquidlinkPackageId).toBe(id("c"));
    expect(merged.liquidlink?.projectObjectId).toBe(id("e"));
    expect(merged.liquidlink?.pointConfigObjectId).toBe(id("3"));
    expect(merged.liquidlink?.checkIn?.packageId).toBe(id("1"));
    expect(merged.liquidlink?.checkIn?.campaignObjectId).toBe(id("4"));
    expect(merged.jitterOriginalPackageId).toBe(id("a"));
  });
});
