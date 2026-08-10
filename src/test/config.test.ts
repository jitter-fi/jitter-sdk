import { describe, expect, test } from "bun:test";

import {
  getDefaultJitterMarketConfig,
  getDefaultJitterMarketConfigEntry,
  getJitterMarketConfig,
  listJitterMarketConfigs,
} from "../config.js";
import {
  getDemoMarketConfig,
  getMissingDemoMarketConfigKeys,
  hasDemoMarketConfig,
  tryGetDemoMarketConfig,
} from "../types.js";

const OBJECT_ID_RE = /^0x[0-9a-f]{64}$/;

describe("SDK-maintained market configs", () => {
  test("keeps mainnet and testnet registries separate", () => {
    const mainnetConfigs = listJitterMarketConfigs("mainnet");
    expect(mainnetConfigs.map((entry) => entry.id)).toEqual([]);
    expect(mainnetConfigs.every((entry) => entry.network === "mainnet")).toBe(true);
    expect(mainnetConfigs.filter((entry) => entry.isDefault)).toHaveLength(0);

    const testnetConfigs = listJitterMarketConfigs("testnet");
    expect(testnetConfigs.length).toBeGreaterThan(0);
    expect(testnetConfigs.every((entry) => entry.network === "testnet")).toBe(true);
    expect(testnetConfigs.filter((entry) => entry.isDefault)).toHaveLength(1);
  });

  test("does not include static display-only Scallop placeholders", () => {
    const testnetConfigs = listJitterMarketConfigs("testnet");

    expect(testnetConfigs.some((entry) => entry.id.startsWith("scallop-"))).toBe(
      false,
    );
    expect(getJitterMarketConfig("testnet", "scallop-sui")).toBeNull();
    expect(getJitterMarketConfig("testnet", "scallop-usdc")).toBeNull();
  });

  test("returns cloned configs so callers cannot mutate the registry", () => {
    const first = getDefaultJitterMarketConfig("testnet");
    const second = getDefaultJitterMarketConfig("testnet");

    expect(first).not.toBe(second);
    expect(first?.poolObjectId).toBe(second?.poolObjectId);
  });

  test("can look up the generated testnet market config by id", () => {
    const entry = getDefaultJitterMarketConfigEntry("testnet");
    if (!entry) {
      throw new Error("Missing generated default testnet market config");
    }
    const demoEntry = listJitterMarketConfigs("testnet").find(
      (candidate) => candidate.id === entry.id,
    );
    const config = getJitterMarketConfig("testnet", entry.id);

    if (!demoEntry || !config) {
      throw new Error("Missing generated testnet market config");
    }
    expect(config.marketObjectId).toBe(demoEntry.config.marketObjectId);
    expect(config.marketObjectId).toMatch(OBJECT_ID_RE);
  });

  test("getDemoMarketConfig falls back to the SDK registry", () => {
    const defaultConfig = getDefaultJitterMarketConfig("testnet");

    expect(hasDemoMarketConfig("testnet")).toBe(true);
    expect(getMissingDemoMarketConfigKeys("testnet")).toEqual([]);
    expect(tryGetDemoMarketConfig("testnet")).not.toBeNull();
    if (!defaultConfig) throw new Error("Missing default testnet market config");
    expect(getDemoMarketConfig("testnet").jitterPackageId).toBe(
      defaultConfig.jitterPackageId,
    );
    expect(getDemoMarketConfig("testnet").jitterPackageId).toMatch(OBJECT_ID_RE);
    expect(getDemoMarketConfig("testnet").jitterOriginalPackageId).toMatch(
      OBJECT_ID_RE,
    );
    expect(getDemoMarketConfig("testnet").jitterOriginalPackageId).not.toBe(
      getDemoMarketConfig("testnet").jitterPackageId,
    );
  });

  test("does not expose the incompatible beta mainnet deployment", () => {
    const mainnetConfig = getDefaultJitterMarketConfig("mainnet");

    expect(mainnetConfig).toBeNull();
    expect(hasDemoMarketConfig("mainnet")).toBe(false);
    expect(tryGetDemoMarketConfig("mainnet")).toBeNull();
    expect(() => getDemoMarketConfig("mainnet")).toThrow(
      "No SDK-maintained Jitter market config for mainnet",
    );
  });
});
