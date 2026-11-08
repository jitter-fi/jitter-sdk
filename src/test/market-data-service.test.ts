import { registryFixture, id as registryId } from "./registry-v2-fixtures.js";
import { describe, expect, test } from "bun:test";

import {
  createJitterMarketDataService,
  getMissingTradeReadyConfigKeys,
  isTradeReadyMarketConfig,
} from "../services/market-data-service.js";
import type { JitterAnalyticsReader } from "../ports/analytics-reader.js";
import {
  InMemoryJitterChainReader,
  InMemoryJitterMarketConfigProvider,
  makeTestMarketConfig,
  makeTestPoolFields,
  makeTestPyStateFields,
} from "./fakes.js";

const JAN_1_2025 = Date.UTC(2025, 0, 1);
const JAN_1_2026 = Date.UTC(2026, 0, 1);

describe("JitterMarketDataService", () => {
  test("one explorer shares a Registry snapshot but a later read scans it afresh", async () => {
    const f = registryFixture(2);
    const config = makeTestMarketConfig({
      marketRegistryObjectId: registryId(1),
      marketObjectId: registryId(100),
      syStateObjectId: registryId(4),
    });
    const chainReader = Object.assign(new InMemoryJitterChainReader({
      pools: new Map([100, 101].map(id => [registryId(id), makeTestPoolFields()])),
      pyStates: new Map([100, 101].map(id => [registryId(id), makeTestPyStateFields()])),
    }), { getObjectInfo: f.reader.getObjectInfo, getDynamicFieldPage: f.reader.getDynamicFieldPage });
    const service = createJitterMarketDataService({
      network: "testnet",
      chainReader,
      configProvider: new InMemoryJitterMarketConfigProvider([
        { id: "one", name: "One", network: "testnet", chainId: "test", config },
        { id: "two", name: "Two", network: "testnet", chainId: "test", config: { ...config, marketRegistryObjectId: "0x01", marketObjectId: registryId(101) } },
      ]),
    });
    expect((await service.getExplorerData()).markets).toHaveLength(2);
    expect(f.queries.filter(query => query.parentId === registryId(10))).toHaveLength(1);
    await service.getExplorerData();
    expect(f.queries.filter(query => query.parentId === registryId(10))).toHaveLength(2);
  });

  test("receipt prices and index start before slow APY and are read concurrently", async () => {
    const config = makeTestMarketConfig({
      scallopMarketVaultObjectId: "0xvault",
      scallopMarketObjectId: "0xupstream",
    });
    const started: string[] = [];
    let releaseApy!: (value: number) => void;
    let releasePrice!: (value: number) => void;
    const apy = new Promise<number>((resolve) => { releaseApy = resolve; });
    const price = new Promise<number>((resolve) => { releasePrice = resolve; });
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        { id: "live", name: "Live", network: "testnet", chainId: "test", config },
      ]),
      chainReader: new InMemoryJitterChainReader({
        pools: new Map([[config.poolObjectId, makeTestPoolFields()]]),
        pyStates: new Map([[config.pyStateObjectId, makeTestPyStateFields()]]),
      }),
      getUnderlyingApy: () => { started.push("apy"); return apy; },
      getUnderlyingPriceUsd: () => { started.push("price"); return price; },
      resolveSyIndex: () => { started.push("index"); return 1n << 64n; },
    });
    const pending = service.getExplorerData({ nowMs: JAN_1_2025 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const readsBeforeRelease = [...started];
    releaseApy(0.05);
    releasePrice(1);
    const market = (await pending).markets[0];
    expect(readsBeforeRelease).toEqual(expect.arrayContaining(["apy", "price", "index"]));
    expect(market.underlyingApy).toBe(0.05);
    expect(Number.isFinite(market.tvl)).toBe(true);
  });

  test("live reserve valuation overrides empty indexer balances and fails closed on price outages", async () => {
    const config = makeTestMarketConfig({
      marketDecimals: 6,
      underlyingDecimals: 6,
      scallopMarketVaultObjectId: "0xvault",
      scallopMarketObjectId: "0xupstream",
    });
    const configProvider = new InMemoryJitterMarketConfigProvider([
      { id: "live", name: "Live", network: "testnet", chainId: "test", config },
    ]);
    const chainReader = new InMemoryJitterChainReader({
      pools: new Map([
        [
          config.poolObjectId,
          makeTestPoolFields({
            total_sy: "20000000",
            total_pt: "80000000",
            lp_supply: "30000000",
            expiry: JAN_1_2026.toString(),
          }),
        ],
      ]),
      pyStates: new Map([
        [
          config.pyStateObjectId,
          makeTestPyStateFields({
            sy_balance: "80000000",
            reserve_fee_balance: "1000000",
            expiry: JAN_1_2026.toString(),
          }),
        ],
      ]),
    });
    const options = {
      network: "testnet" as const,
      configProvider,
      chainReader,
      getUnderlyingApy: () => 0.05,
      resolveSyIndex: () => 2n << 64n,
      analyticsReader: {
        getMarketAnalytics: async () => ({
          source: "indexer",
          updatedAtMs: String(JAN_1_2025),
          tvl: { raw: "0", usd: null },
          liquidity: { raw: "0", usd: null },
          volume24h: { raw: "0", usd: null },
          volume7d: { raw: "0", usd: null },
          impliedApy: "0.99",
          underlyingApy: null,
          lpApy: null,
        }),
      } as unknown as JitterAnalyticsReader,
    };
    const service = createJitterMarketDataService({
      ...options,
      getUnderlyingPriceUsd: () => 0.5,
    });
    const market = (await service.getExplorerData({ nowMs: JAN_1_2025 }))
      .markets[0];
    expect(market.liquidity).toBe(60);
    expect(market.tvl).toBe(101);
    expect(market.syPrice).toBe(1);
    expect(market.lpPrice).toBe(2);
    expect(market.lpBreakdown.syWeight).toBeCloseTo(1 / 3);
    expect(market.longYieldApy).toBeCloseTo(0.05);
    expect(market.ytRoi).toBeCloseTo(0.05);
    const missing = createJitterMarketDataService({
      ...options,
      getUnderlyingPriceUsd: () => null,
    });
    const unavailable = (await missing.getExplorerData()).markets[0];
    for (const value of [unavailable.liquidity, unavailable.underlyingPrice, unavailable.ptUsdValue, unavailable.ytAssetPrice]) {
      expect(Number.isNaN(value)).toBe(true);
    }
    const failed = createJitterMarketDataService({
      ...options,
      getUnderlyingPriceUsd: () => {
        throw Error("outage");
      },
    });
    expect(Number.isNaN((await failed.getExplorerData()).markets[0].tvl)).toBe(
      true,
    );
  });
  test("configured Registry failures cannot silently select static deployment data", async () => {
    const config = makeTestMarketConfig({
      marketRegistryObjectId: registryId(1),
    });
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        {
          id: "demo",
          name: "Demo",
          network: "testnet",
          chainId: "test",
          config,
        },
      ]),
      chainReader: new InMemoryJitterChainReader({
        pools: new Map([[config.poolObjectId, makeTestPoolFields()]]),
        pyStates: new Map([[config.pyStateObjectId, makeTestPyStateFields()]]),
      }),
    });
    await expect(service.getExplorerData()).rejects.toThrow(
      "Registry V2 requires typed object reads",
    );
  });
  test("requires reward distributor config for product-level trade readiness", () => {
    const scallopConfig = makeTestMarketConfig({
      demoMarketVaultObjectId: "",
      rewardDistributorObjectId: undefined,
      scallopProtocolPackageId: "0xscallop-protocol",
      scallopMarketVaultObjectId: "0xscallop-vault",
      scallopMarketObjectId: "0xscallop-market",
      scallopVersionObjectId: "0xscallop-version",
    });

    expect(isTradeReadyMarketConfig(scallopConfig)).toBe(false);
    expect(getMissingTradeReadyConfigKeys(scallopConfig)).toContain(
      "rewardDistributorObjectId",
    );
  });

  test("returns product-level trade metadata with supported actions and disabled reasons", () => {
    const demoConfig = makeTestMarketConfig({
      rewardDistributorObjectId: "0xreward-distributor",
    });
    const scallopConfig = makeTestMarketConfig({
      demoMarketVaultObjectId: "",
      rewardDistributorObjectId: "0xreward-distributor",
      scallopProtocolPackageId: "0xscallop-protocol",
      scallopMarketVaultObjectId: "0xscallop-vault",
      scallopMarketObjectId: "0xscallop-market",
      scallopVersionObjectId: "0xscallop-version",
    });
    const missingRewardConfig = {
      ...scallopConfig,
      rewardDistributorObjectId: undefined,
    };
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        {
          id: "demo",
          name: "Demo",
          network: "testnet",
          chainId: "test-chain",
          config: demoConfig,
        },
        {
          id: "scallop-sui",
          name: "Scallop SUI",
          network: "testnet",
          chainId: "test-chain",
          tradeReady: false,
          config: scallopConfig,
        },
        {
          id: "missing-reward",
          name: "Missing Reward",
          network: "testnet",
          chainId: "test-chain",
          config: missingRewardConfig,
        },
      ]),
      chainReader: new InMemoryJitterChainReader(),
    });

    const demoMetadata = service.getMarketTradeMetadata("demo");
    expect(demoMetadata).toMatchObject({
      marketId: "demo",
      tradeReady: true,
      disabledReason: null,
      missingConfigKeys: [],
    });
    expect(demoMetadata?.actions[0]).toEqual({
      id: "buy_pt",
      product: "pt",
      side: "buy",
      inputAssets: ["underlying", "sy"],
      outputAssets: ["pt"],
      requiredPosition: "py",
      disabledReason: null,
    });
    expect(
      demoMetadata?.actions.find((action) => action.id === "buy_yt")
        ?.inputAssets,
    ).toEqual(["underlying", "sy"]);
    expect(
      demoMetadata?.actions.find((action) => action.id === "add_lp_keep_yt")
        ?.inputAssets,
    ).toEqual(["underlying", "sy"]);
    expect(
      demoMetadata?.actions.find((action) => action.id === "add_lp_from_sy")
        ?.outputAssets,
    ).toEqual(["lp", "sy"]);
    expect(demoMetadata?.actions.map((action) => action.id)).toEqual([
      "buy_pt",
      "sell_pt",
      "buy_yt",
      "sell_yt",
      "add_lp",
      "add_lp_from_sy",
      "add_lp_keep_yt",
      "remove_lp",
      "remove_lp_to_sy",
    ]);

    expect(service.getMarketTradeMetadata("scallop-sui")).toMatchObject({
      marketId: "scallop-sui",
      tradeReady: false,
      disabledReason: "Trading disabled by SDK registry for this market.",
      missingConfigKeys: [],
    });
    expect(
      service
        .getMarketTradeMetadata("scallop-sui")
        ?.actions.every((action) => action.disabledReason !== null),
    ).toBe(true);

    expect(service.getMarketTradeMetadata("missing-reward")).toMatchObject({
      marketId: "missing-reward",
      tradeReady: false,
      missingConfigKeys: ["rewardDistributorObjectId"],
    });
    expect(service.getMarketTradeMetadata("unknown")).toBeNull();
  });

  test("hydrates registered config markets and sorts by liquidity", async () => {
    const displayOnlyConfig = makeTestMarketConfig({
      marketObjectId: "0xmarket-display",
      poolObjectId: "0xpool-display",
      pyStateObjectId: "0xpy-display",
      demoMarketVaultObjectId: "",
      underlyingTypeTag: "0xabc::usdc::USDC",
      marketDecimals: 6,
      underlyingDecimals: 6,
    });
    const tradeableConfig = makeTestMarketConfig({
      marketObjectId: "0xmarket-trade",
      poolObjectId: "0xpool-trade",
      pyStateObjectId: "0xpy-trade",
      demoMarketVaultObjectId: "",
      rewardDistributorObjectId: "0xreward-distributor",
      scallopProtocolPackageId: "0xscallop-protocol",
      scallopMarketVaultObjectId: "0xscallop-vault",
      scallopMarketObjectId: "0xscallop-market",
      scallopVersionObjectId: "0xscallop-version",
      underlyingTypeTag: "0x2::sui::SUI",
      marketDecimals: 6,
      underlyingDecimals: 6,
    });
    const configProvider = new InMemoryJitterMarketConfigProvider([
      {
        id: "display",
        name: "Display Market",
        network: "testnet",
        chainId: "test-chain",
        config: displayOnlyConfig,
      },
      {
        id: "trade",
        name: "Trade Market",
        network: "testnet",
        chainId: "test-chain",
        isDefault: true,
        config: tradeableConfig,
      },
    ]);
    const chainReader = new InMemoryJitterChainReader({
      pools: new Map([
        [
          "0xpool-display",
          makeTestPoolFields({
            total_sy: "500000",
            total_pt: "500000",
            expiry: JAN_1_2026.toString(),
          }),
        ],
        [
          "0xpool-trade",
          makeTestPoolFields({
            total_sy: "2000000",
            total_pt: "1000000",
            expiry: JAN_1_2026.toString(),
          }),
        ],
      ]),
      pyStates: new Map([
        [
          "0xpy-display",
          makeTestPyStateFields({
            market_id: "0xmarket-display",
            expiry: JAN_1_2026.toString(),
          }),
        ],
        [
          "0xpy-trade",
          makeTestPyStateFields({
            market_id: "0xmarket-trade",
            expiry: JAN_1_2026.toString(),
          }),
        ],
      ]),
      poolVolumeStats: new Map([
        [
          "0xpool-trade",
          {
            volume24hSy: 300000n,
            volume7dSy: 900000n,
            totalFeesSy: 0n,
            swapCount24h: 1,
            swapCount7d: 3,
          },
        ],
      ]),
    });
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider,
      chainReader,
      getUnderlyingApy: async (config) =>
        config.poolObjectId === "0xpool-trade" ? 0.04 : 0.01,
      getUnderlyingPriceUsd: () => 1,
      resolveSyIndex: () => 1n << 64n,
    });

    const data = await service.getExplorerData({ nowMs: JAN_1_2025 });

    expect(data.markets.map((market) => market.address)).toEqual([
      "0xpool-trade",
      "0xpool-display",
    ]);
    expect(data.markets[0]?.liquidity).toBe(3);
    expect(data.markets[0]?.volume24h).toBe(0.3);
    expect(data.markets[0]?.underlyingApy).toBe(0.04);
    expect(data.markets[0]?.jitterConfig).toEqual(tradeableConfig);
    expect(data.markets[1]?.liquidity).toBe(1);
    expect(data.markets[1]?.jitterConfig).toBeUndefined();
  });

  test("overlays V2 unified aliases before hydrating chain market data", async () => {
    const f = registryFixture();
    const config = makeTestMarketConfig({
      marketRegistryObjectId: registryId(1),
      marketObjectId: registryId(100),
      syStateObjectId: registryId(4),
      poolObjectId: "0xpool-stale",
      pyStateObjectId: "0xpy-stale",
      rewardDistributorObjectId: registryId(80),
    });
    const chainReader = Object.assign(
      new InMemoryJitterChainReader({
        pools: new Map([
          [
            registryId(100),
            makeTestPoolFields({
              total_sy: "1000000",
              total_pt: "1000000",
              expiry: JAN_1_2026.toString(),
            }),
          ],
        ]),
        pyStates: new Map([
          [
            registryId(100),
            makeTestPyStateFields({
              market_id: registryId(100),
              expiry: JAN_1_2026.toString(),
            }),
          ],
        ]),
      }),
      {
        getObjectInfo: f.reader.getObjectInfo,
        getDynamicFieldPage: f.reader.getDynamicFieldPage,
      },
    );
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        {
          id: "demo",
          name: "Demo",
          network: "testnet",
          chainId: "test-chain",
          config,
        },
      ]),
      chainReader,
    });
    const data = await service.getExplorerData({ nowMs: JAN_1_2025 });
    expect(data.markets[0]).toMatchObject({
      marketId: "demo",
      address: registryId(100),
      jitterConfig: {
        marketObjectId: registryId(100),
        pyStateObjectId: registryId(100),
        poolObjectId: registryId(100),
        rewardDistributorObjectId: registryId(80),
      },
    });
  });

  test("preserves analytics source, stale state, and APY provenance on hydrated markets", async () => {
    const config = makeTestMarketConfig({
      marketObjectId: "0xmarket",
      poolObjectId: "0xpool",
      pyStateObjectId: "0xpy",
      marketDecimals: 6,
      underlyingDecimals: 6,
    });
    const analyticsReader: JitterAnalyticsReader = {
      async getMarketAnalytics() {
        return {
          marketId: "demo",
          source: "redis",
          tvl: { raw: "4000000", usd: null, usdSource: "unavailable" },
          liquidity: { raw: "3000000", usd: null, usdSource: "unavailable" },
          volume24h: { raw: "500000", usd: null, usdSource: "unavailable" },
          volume7d: { raw: "1500000", usd: null, usdSource: "unavailable" },
          impliedApy: "0.08",
          underlyingApy: "0.04",
          underlyingApySource: "external",
          underlyingApyUpdatedAtMs: String(JAN_1_2025 - 30_000),
          lpApy: "0.055",
          lpApySource: "mixed",
          lpApyFormulaVersion: "weighted_pool_yield_v1",
          updatedAtMs: String(JAN_1_2025 - 120_000),
        };
      },
      async getMarketMetadata() {
        throw new Error("not used");
      },
      async getMarketChart() {
        throw new Error("not used");
      },
      async getMarketActivity() {
        throw new Error("not used");
      },
      async getOrderbookLadder() {
        throw new Error("not used");
      },
      async getRewardSummary() {
        throw new Error("not used");
      },
      async getRewardLeaderboard() {
        throw new Error("not used");
      },
    };
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        {
          id: "demo",
          name: "Demo",
          network: "testnet",
          chainId: "test-chain",
          config,
        },
      ]),
      chainReader: new InMemoryJitterChainReader({
        pools: new Map([
          [
            "0xpool",
            makeTestPoolFields({
              total_sy: "2000000",
              total_pt: "1000000",
              expiry: JAN_1_2026.toString(),
            }),
          ],
        ]),
        pyStates: new Map([
          ["0xpy", makeTestPyStateFields({ expiry: JAN_1_2026.toString() })],
        ]),
      }),
      analyticsReader,
    });

    const data = await service.getExplorerData({
      nowMs: JAN_1_2025,
      analyticsFreshnessMs: 60_000,
    });

    expect(data.markets[0]).toMatchObject({
      tvl: 3,
      liquidity: 3,
      volume24h: 0,
      fixedApy: 0.08,
      underlyingApy: 0.04,
      lpApy: 0.055,
      analytics: {
        source: "redis",
        updatedAtMs: JAN_1_2025 - 120_000,
        isStale: true,
        staleAfterMs: 60_000,
        underlyingApySource: "external",
        underlyingApyUpdatedAtMs: JAN_1_2025 - 30_000,
        lpApySource: "mixed",
        lpApyFormulaVersion: "weighted_pool_yield_v1",
      },
    });
  });

  test("hydrates display-only config entries from their static snapshot without chain reads", async () => {
    const displayOnlyConfig = makeTestMarketConfig({
      marketObjectId: "0xmarket-scallop-sui",
      poolObjectId: "0xpool-scallop-sui",
      pyStateObjectId: "0xpy-scallop-sui",
      demoMarketVaultObjectId: "",
      scallopProtocolPackageId: "0xscallop-protocol",
      scallopMarketVaultObjectId: "0xscallop-vault",
      scallopMarketObjectId: "0xscallop-market",
      scallopVersionObjectId: "0xscallop-version",
      underlyingTypeTag: "0x2::sui::SUI",
      marketDecimals: 9,
      underlyingDecimals: 9,
    });
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        {
          id: "scallop-sui",
          name: "Scallop SUI",
          network: "testnet",
          chainId: "test-chain",
          tradeReady: false,
          config: displayOnlyConfig,
          displaySnapshot: {
            pool: makeTestPoolFields({
              total_sy: "2000000000",
              total_pt: "3000000000",
              expiry: JAN_1_2026.toString(),
            }),
            pyState: makeTestPyStateFields({
              market_id: "0xmarket-scallop-sui",
              expiry: JAN_1_2026.toString(),
            }),
            volume: {
              volume24hSy: "700000000",
              volume7dSy: "4900000000",
              totalFeesSy: "0",
              swapCount24h: 0,
              swapCount7d: 0,
            },
            underlyingApy: 0.042,
          },
        },
      ]),
      chainReader: new InMemoryJitterChainReader(),
    });

    const data = await service.getExplorerData({ nowMs: JAN_1_2025 });

    expect(data.markets).toHaveLength(1);
    expect(data.markets[0]).toMatchObject({
      address: "0xpool-scallop-sui",
      symbol: "sSUI",
      protocol: "Scallop",
      liquidity: Number.NaN,
      volume24h: Number.NaN,
      underlyingApy: 0.042,
      jitterConfig: undefined,
    });
  });

  test("generates groups and category filters from hydrated markets", async () => {
    const config = makeTestMarketConfig({
      poolObjectId: "0xpool",
      pyStateObjectId: "0xpy",
      scallopProtocolPackageId: "0xscallop-protocol",
      scallopMarketVaultObjectId: "0xscallop-vault",
      scallopMarketObjectId: "0xscallop-market",
      scallopVersionObjectId: "0xscallop-version",
      marketDecimals: 6,
      underlyingDecimals: 6,
    });
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider: new InMemoryJitterMarketConfigProvider([
        {
          id: "scallop-sui",
          name: "Scallop SUI",
          network: "testnet",
          chainId: "test-chain",
          config,
        },
      ]),
      chainReader: new InMemoryJitterChainReader({
        pools: new Map([
          [
            "0xpool",
            makeTestPoolFields({
              total_sy: "1000000",
              total_pt: "1000000",
              expiry: JAN_1_2026.toString(),
            }),
          ],
        ]),
        pyStates: new Map([
          ["0xpy", makeTestPyStateFields({ expiry: JAN_1_2026.toString() })],
        ]),
      }),
    });

    const data = await service.getExplorerData({ nowMs: JAN_1_2025 });

    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]).toMatchObject({
      id: "jitter-ssui",
      name: "sSUI",
      protocol: "Scallop",
      marketsCount: 1,
      liquidity: Number.NaN,
    });
    expect(data.categoryFilters).toEqual(
      expect.arrayContaining([
        { id: "protocol:scallop", name: "Scallop" },
        { id: "underlying:ssui", name: "SSUI" },
        { id: "maturity:far", name: "Far Term" },
      ]),
    );
  });

  test("uses analytics reader for market analytics and returns unavailable without one", async () => {
    const config = makeTestMarketConfig({ poolObjectId: "0xpool" });
    const configProvider = new InMemoryJitterMarketConfigProvider([
      {
        id: "market-a",
        name: "Market A",
        network: "testnet",
        chainId: "test-chain",
        config,
      },
    ]);
    const analyticsReader: Pick<JitterAnalyticsReader, "getMarketAnalytics"> = {
      async getMarketAnalytics(query) {
        return {
          marketId: query.marketId,
          source: "indexer",
          tvl: { raw: "1000", usd: null, usdSource: "unavailable" },
          liquidity: { raw: "900", usd: null, usdSource: "unavailable" },
          volume24h: { raw: "10", usd: null, usdSource: "unavailable" },
          volume7d: { raw: "70", usd: null, usdSource: "unavailable" },
          impliedApy: "0.12",
          underlyingApy: null,
          underlyingApySource: "unavailable",
          underlyingApyUpdatedAtMs: null,
          lpApy: null,
          lpApySource: "unavailable",
          lpApyFormulaVersion: null,
          updatedAtMs: "1710000000000",
        };
      },
    };
    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider,
      chainReader: new InMemoryJitterChainReader(),
      analyticsReader: analyticsReader as JitterAnalyticsReader,
    });
    const unavailableService = createJitterMarketDataService({
      network: "testnet",
      configProvider,
      chainReader: new InMemoryJitterChainReader(),
    });

    await expect(service.getMarketAnalytics("market-a")).resolves.toMatchObject(
      {
        marketId: "market-a",
        source: "indexer",
        volume24h: { raw: "10" },
      },
    );
    await expect(
      unavailableService.getMarketAnalytics("market-a"),
    ).resolves.toMatchObject({
      marketId: "market-a",
      source: "unavailable",
      volume24h: { raw: "0" },
    });
  });

  test("merges indexer analytics into explorer market cards and keeps chain fallback on analytics failures", async () => {
    const config = makeTestMarketConfig({
      marketObjectId: "0xmarket",
      poolObjectId: "0xpool",
      pyStateObjectId: "0xpy",
      marketDecimals: 6,
      underlyingDecimals: 6,
    });
    const configProvider = new InMemoryJitterMarketConfigProvider([
      {
        id: "market-a",
        name: "Market A",
        network: "testnet",
        chainId: "test-chain",
        config,
      },
    ]);
    const chainReader = new InMemoryJitterChainReader({
      pools: new Map([
        [
          "0xpool",
          makeTestPoolFields({
            total_sy: "1000000",
            total_pt: "1000000",
            expiry: JAN_1_2026.toString(),
          }),
        ],
      ]),
      pyStates: new Map([
        [
          "0xpy",
          makeTestPyStateFields({
            market_id: "0xmarket",
            expiry: JAN_1_2026.toString(),
          }),
        ],
      ]),
    });
    const analyticsReader: Pick<JitterAnalyticsReader, "getMarketAnalytics"> = {
      async getMarketAnalytics(query) {
        expect(query.marketId).toBe("market-a");
        return {
          marketId: query.marketId,
          source: "indexer",
          tvl: { raw: "5500000", usd: null, usdSource: "unavailable" },
          liquidity: { raw: "4200000", usd: "9.25", usdSource: "indexer" },
          volume24h: { raw: "1100000", usd: null, usdSource: "unavailable" },
          volume7d: { raw: "7700000", usd: null, usdSource: "unavailable" },
          impliedApy: "0.08",
          underlyingApy: "0.05",
          underlyingApySource: "indexer",
          underlyingApyUpdatedAtMs: "1710000000000",
          lpApy: "0.065",
          lpApySource: "mixed",
          lpApyFormulaVersion: "weighted_pool_yield_v1",
          updatedAtMs: "1710000000000",
        };
      },
    };
    const failingAnalyticsReader: Pick<
      JitterAnalyticsReader,
      "getMarketAnalytics"
    > = {
      async getMarketAnalytics() {
        throw new Error("indexer unavailable");
      },
    };

    const service = createJitterMarketDataService({
      network: "testnet",
      configProvider,
      chainReader,
      analyticsReader: analyticsReader as JitterAnalyticsReader,
      getUnderlyingApy: async () => 0.03,
    });
    const fallbackService = createJitterMarketDataService({
      network: "testnet",
      configProvider,
      chainReader,
      analyticsReader: failingAnalyticsReader as JitterAnalyticsReader,
      getUnderlyingApy: async () => 0.03,
    });

    const data = await service.getExplorerData({ nowMs: JAN_1_2025 });
    const market = data.markets[0];
    expect(market).toMatchObject({
      tvl: 2,
      liquidity: 9.25,
      volume24h: 0,
      volume7d: 0,
      fixedApy: 0.08,
      underlyingApy: 0.05,
      longYieldApy: 0,
      underlyingPrice: 1,
      ptUsdValue: 1 / 1.08,
      ytAssetPrice: 1 - 1 / 1.08,
      ytLeverage: 1 / (1 - 1 / 1.08),
      lpApy: 0.065,
    });

    await expect(
      fallbackService.getExplorerData({ nowMs: JAN_1_2025 }),
    ).resolves.toMatchObject({
      markets: [
        {
          tvl: 2,
          liquidity: 2,
          volume24h: 0,
          fixedApy: 0,
          underlyingApy: 0.03,
        },
      ],
    });
  });
});
