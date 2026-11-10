import type {
  JitterConfigNetworkInput,
  JitterMarketConfigEntry,
  JitterMarketDisplaySnapshot,
} from "../config.js";
import { FP64_ONE } from "../constants.js";
import { normalizeMoveNumeric } from "../domain/amounts.js";
import {
  buildJitterMarketOverview,
  type JitterMarketOverview,
  type MarketVolumeStats,
} from "../domain/market-mappers.js";
import type {
  AnalyticsDataSource,
  JitterAnalyticsReader,
  MarketAnalyticsResult,
} from "../ports/analytics-reader.js";
import type { JitterChainReader } from "../ports/chain-reader.js";
import type { JitterMarketConfigProvider } from "../ports/config-provider.js";
import {
  getMarketAccountingDecimals,
  getMarketUnderlyingDecimals,
  type JitterMarketConfig,
  type PoolFields,
  type PyStateFields,
} from "../types.js";
import {
  overlayJitterMarketConfigFromRegistry,
  overlayJitterMarketConfigFromRegistrySnapshot,
} from "../market-registry.js";
import { discoverJitterRegistry, registryId, type RegistrySnapshot } from "../registry-v2.js";
import { getHaedalStakeQuote } from "../adapters/haedal.js";
import { getEmberDepositQuote } from "../adapters/ember.js";
import { getScallopMarketIndex } from "../queries.js";
import { valueMarketBalances } from "../domain/market-valuation.js";

export type { JitterMarketOverview } from "../domain/market-mappers.js";

export type JitterMarketGroupInfo = {
  id: string;
  name: string;
  protocol: string;
  icon: string;
  marketsCount: number;
  liquidity: number;
  tvl: number;
  volume24h: number;
  volume7d: number;
  bestFixedApy: number;
  bestUnderlyingApy: number;
  bestLongYieldApy: number;
  bestYtLeverage: number;
  categories: string[];
  searchText: string;
  markets: JitterMarketOverview[];
};

export type JitterMarketCategoryFilter = {
  id: string;
  name: string;
};

export type JitterMarketExplorerData = {
  markets: JitterMarketOverview[];
  groups: JitterMarketGroupInfo[];
  categoryFilters: JitterMarketCategoryFilter[];
};

export type JitterTradeProduct = "pt" | "yt" | "lp";
export type JitterTradeSide = "buy" | "sell" | "add" | "add_keep_yt" | "remove";
export type JitterTradeActionId =
  | "buy_pt"
  | "sell_pt"
  | "buy_yt"
  | "sell_yt"
  | "add_lp"
  | "add_lp_from_sy"
  | "add_lp_keep_yt"
  | "remove_lp"
  | "remove_lp_to_sy";
export type JitterTradeAsset =
  | "underlying"
  | "marketCoin"
  | "sy"
  | "pt"
  | "yt"
  | "lp";
export type JitterRequiredPosition = "py" | "lp" | null;

export type JitterMarketTradeAction = {
  id: JitterTradeActionId;
  product: JitterTradeProduct;
  side: JitterTradeSide;
  inputAssets: JitterTradeAsset[];
  outputAssets: JitterTradeAsset[];
  requiredPosition: JitterRequiredPosition;
  disabledReason: string | null;
};

export type JitterMarketTradeMetadata = {
  marketId: string;
  adapterKind: "demo" | "scallop" | "haedal" | "ember" | "suilend" | "navi";
  tradeReady: boolean;
  disabledReason: string | null;
  missingConfigKeys: string[];
  actions: JitterMarketTradeAction[];
};

export type MarketDataServiceOptions = {
  nowMs?: number;
  analyticsFreshnessMs?: number;
};

export type CreateJitterMarketDataServiceOptions = {
  network: JitterConfigNetworkInput;
  configProvider: JitterMarketConfigProvider;
  chainReader: JitterChainReader;
  analyticsReader?: JitterAnalyticsReader;
  getUnderlyingApy?: (config: JitterMarketConfig) => number | Promise<number>;
  getUnderlyingPriceUsd?: (
    config: JitterMarketConfig,
  ) => number | null | Promise<number | null>;
  resolveSyIndex?: (config: JitterMarketConfig) => bigint | Promise<bigint>;
};

export type JitterMarketDataService = {
  getExplorerData(
    options?: MarketDataServiceOptions,
  ): Promise<JitterMarketExplorerData>;
  getMarketSnapshot(
    config: JitterMarketConfig,
    options?: MarketDataServiceOptions & { tradeReady?: boolean },
  ): Promise<JitterMarketOverview>;
  getMarketAnalytics(marketId: string): Promise<MarketAnalyticsResult>;
  getMarketTradeMetadata(marketId: string): JitterMarketTradeMetadata | null;
};

const EMPTY_POOL_VOLUME: MarketVolumeStats = {
  volume24hSy: 0n,
  volume7dSy: 0n,
  totalFeesSy: 0n,
  swapCount24h: 0,
  swapCount7d: 0,
};
const DEFAULT_ANALYTICS_FRESHNESS_MS = 60_000;

export function createJitterMarketDataService(
  options: CreateJitterMarketDataServiceOptions,
): JitterMarketDataService {
  return {
    async getExplorerData(
      serviceOptions: MarketDataServiceOptions = {},
    ): Promise<JitterMarketExplorerData> {
      const entries = options.configProvider.listMarketConfigEntries(
        options.network,
      );
      const resolvedEntries = await resolveMarketConfigEntries(
        options,
        entries,
      );
      const markets = await Promise.all(
        resolvedEntries.map((entry) =>
          hydrateMarketOverview(options, entry, {
            ...serviceOptions,
            tradeReady:
              entry.tradeReady ?? isTradeReadyMarketConfig(entry.config),
          }),
        ),
      );
      const sortedMarkets = [...markets].sort(
        (a, b) => b.liquidity - a.liquidity,
      );

      return {
        markets: sortedMarkets,
        groups: buildJitterMarketGroups(sortedMarkets),
        categoryFilters: buildJitterMarketCategoryFilters(sortedMarkets),
      };
    },

    getMarketSnapshot(
      config: JitterMarketConfig,
      serviceOptions: MarketDataServiceOptions & { tradeReady?: boolean } = {},
    ): Promise<JitterMarketOverview> {
      return (async () => {
        const resolvedConfig = await overlayConfigFromRegistry(options, config);
        const marketId = resolveMarketId(options, resolvedConfig);
        return hydrateMarketOverview(
          options,
          {
            id: marketId,
            config: resolvedConfig,
          },
          {
            ...serviceOptions,
            tradeReady:
              serviceOptions.tradeReady ??
              isTradeReadyMarketConfig(resolvedConfig),
          },
        );
      })();
    },

    getMarketAnalytics(marketId: string): Promise<MarketAnalyticsResult> {
      return getMarketAnalytics(options, marketId);
    },

    getMarketTradeMetadata(marketId: string): JitterMarketTradeMetadata | null {
      const entry = options.configProvider.getMarketConfigEntry(
        options.network,
        marketId,
      );
      if (!entry) return null;

      return buildMarketTradeMetadata(entry);
    },
  };
}

async function resolveMarketConfigEntries(
  options: CreateJitterMarketDataServiceOptions,
  entries: readonly JitterMarketConfigEntry[],
): Promise<JitterMarketConfigEntry[]> {
  const registries = new Map<string, Promise<RegistrySnapshot>>();
  return Promise.all(
    entries.map(async (entry) => {
      if (!entry.config.marketRegistryObjectId)
        return { ...entry, config: { ...entry.config } };
      const id = registryId(entry.config.marketRegistryObjectId);
      let snapshot = registries.get(id);
      if (!snapshot) {
        snapshot = discoverJitterRegistry(options.chainReader, id);
        registries.set(id, snapshot);
      }
      return {
        ...entry,
        config: overlayJitterMarketConfigFromRegistrySnapshot(entry.config, await snapshot),
      };
    }),
  );
}

async function overlayConfigFromRegistry(
  options: CreateJitterMarketDataServiceOptions,
  config: JitterMarketConfig,
): Promise<JitterMarketConfig> {
  if (!config.marketRegistryObjectId) return { ...config };

  return overlayJitterMarketConfigFromRegistry(options.chainReader, config);
}

const PRODUCT_LEVEL_TRADE_ACTIONS: readonly Omit<
  JitterMarketTradeAction,
  "disabledReason"
>[] = [
  {
    id: "buy_pt",
    product: "pt",
    side: "buy",
    inputAssets: ["underlying", "sy"],
    outputAssets: ["pt"],
    requiredPosition: "py",
  },
  {
    id: "sell_pt",
    product: "pt",
    side: "sell",
    inputAssets: ["pt"],
    outputAssets: ["sy"],
    requiredPosition: "py",
  },
  {
    id: "buy_yt",
    product: "yt",
    side: "buy",
    inputAssets: ["underlying", "sy"],
    outputAssets: ["yt"],
    requiredPosition: "py",
  },
  {
    id: "sell_yt",
    product: "yt",
    side: "sell",
    inputAssets: ["yt"],
    outputAssets: ["sy"],
    requiredPosition: "py",
  },
  {
    id: "add_lp",
    product: "lp",
    side: "add",
    inputAssets: ["sy", "pt"],
    outputAssets: ["lp"],
    requiredPosition: "lp",
  },
  {
    id: "add_lp_from_sy",
    product: "lp",
    side: "add",
    inputAssets: ["underlying", "sy"],
    outputAssets: ["lp", "sy"],
    requiredPosition: "lp",
  },
  {
    id: "add_lp_keep_yt",
    product: "lp",
    side: "add_keep_yt",
    inputAssets: ["underlying", "sy"],
    outputAssets: ["lp", "yt"],
    requiredPosition: "lp",
  },
  {
    id: "remove_lp",
    product: "lp",
    side: "remove",
    inputAssets: ["lp"],
    outputAssets: ["sy", "pt"],
    requiredPosition: "lp",
  },
  {
    id: "remove_lp_to_sy",
    product: "lp",
    side: "remove",
    inputAssets: ["lp"],
    outputAssets: ["sy"],
    requiredPosition: "lp",
  },
];

function buildMarketTradeMetadata(
  entry: Pick<JitterMarketConfigEntry, "id" | "config" | "tradeReady">,
): JitterMarketTradeMetadata {
  const missingConfigKeys = getMissingTradeReadyConfigKeys(entry.config);
  const configReady = missingConfigKeys.length === 0;
  const disabledReason = resolveTradeDisabledReason({
    configReady,
    missingConfigKeys,
    registryTradeReady: entry.tradeReady,
  });
  const tradeReady = disabledReason === null;

  return {
    marketId: entry.id,
    adapterKind: resolveAdapterKind(entry.config),
    tradeReady,
    disabledReason,
    missingConfigKeys,
    actions: PRODUCT_LEVEL_TRADE_ACTIONS.map((action) => ({
      ...action,
      inputAssets:
        (entry.config.haedalAdapterPackageId ||
          entry.config.emberAdapterPackageId) &&
        action.inputAssets.includes("underlying")
          ? [...action.inputAssets, "marketCoin"]
          : [...action.inputAssets],
      outputAssets:
        (entry.config.haedalAdapterPackageId ||
          entry.config.emberAdapterPackageId) &&
        action.outputAssets.includes("sy")
          ? [...action.outputAssets, "marketCoin"]
          : [...action.outputAssets],
      disabledReason,
    })),
  };
}

function resolveTradeDisabledReason(input: {
  configReady: boolean;
  missingConfigKeys: string[];
  registryTradeReady: boolean | undefined;
}): string | null {
  if (!input.configReady) {
    return `Missing trade config: ${input.missingConfigKeys.join(", ")}`;
  }
  if (input.registryTradeReady === false) {
    return "Trading disabled by SDK registry for this market.";
  }
  return null;
}

function resolveAdapterKind(
  config: JitterMarketConfig,
): JitterMarketTradeMetadata["adapterKind"] {
  const registered = config.adapterKind?.trim().toLowerCase();
  if (
    registered === "demo" ||
    registered === "scallop" ||
    registered === "haedal" ||
    registered === "ember" ||
    registered === "suilend" ||
    registered === "navi"
  ) {
    return registered;
  }
  if (config.scallopMarketVaultObjectId) return "scallop";
  if (config.haedalMarketVaultObjectId) return "haedal";
  if (config.emberMarketVaultObjectId) return "ember";
  if (config.suilendMarketVaultObjectId) return "suilend";
  if (config.naviMarketVaultObjectId) return "navi";
  return "demo";
}

export function isTradeReadyMarketConfig(config: JitterMarketConfig): boolean {
  return getMissingTradeReadyConfigKeys(config).length === 0;
}

export function getMissingTradeReadyConfigKeys(
  config: JitterMarketConfig,
): string[] {
  const missing = missingConfigKeys([
    ["jitterPackageId", config.jitterPackageId],
    ["oraclePackageId", config.oraclePackageId],
    ["syStateObjectId", config.syStateObjectId],
    ["aclObjectId", config.aclObjectId],
    ["rewardDistributorObjectId", config.rewardDistributorObjectId],
    ["marketObjectId", config.marketObjectId],
    ["pyStateObjectId", config.pyStateObjectId],
    ["poolObjectId", config.poolObjectId],
    ["priceAggregatorObjectId", config.priceAggregatorObjectId],
    ["underlyingTypeTag", config.underlyingTypeTag],
    ["syTypeTag", config.syTypeTag],
    ["ptTypeTag", config.ptTypeTag],
    ["ytTypeTag", config.ytTypeTag],
  ]);

  const hasCoreMarket =
    Boolean(config.jitterPackageId) &&
    Boolean(config.oraclePackageId) &&
    Boolean(config.syStateObjectId) &&
    Boolean(config.aclObjectId) &&
    Boolean(config.rewardDistributorObjectId) &&
    Boolean(config.marketObjectId) &&
    Boolean(config.pyStateObjectId) &&
    Boolean(config.poolObjectId) &&
    Boolean(config.priceAggregatorObjectId) &&
    Boolean(config.underlyingTypeTag) &&
    Boolean(config.syTypeTag) &&
    Boolean(config.ptTypeTag) &&
    Boolean(config.ytTypeTag);
  const hasDemoRoute = Boolean(config.demoMarketVaultObjectId);
  const hasScallopRoute =
    Boolean(config.scallopProtocolPackageId) &&
    Boolean(config.scallopMarketVaultObjectId) &&
    Boolean(config.scallopMarketObjectId) &&
    Boolean(config.scallopVersionObjectId);

  if (config.adapterKind === "ember" || config.emberAdapterPackageId) {
    return Array.from(
      new Set([
        ...missing,
        ...missingConfigKeys([
          ["emberAdapterPackageId", config.emberAdapterPackageId],
          ["emberMarketVaultObjectId", config.emberMarketVaultObjectId],
          ["emberVaultObjectId", config.emberVaultObjectId],
          ["emberVaultsPackageId", config.emberVaultsPackageId],
          ["emberProtocolConfigObjectId", config.emberProtocolConfigObjectId],
          ["emberReceiptTypeTag", config.emberReceiptTypeTag],
          ["jitterMathPackageId", config.jitterMathPackageId],
          ["globalConfigObjectId", config.globalConfigObjectId],
        ]),
      ]),
    );
  }
  if (config.adapterKind === "haedal" || config.haedalAdapterPackageId) {
    return Array.from(
      new Set([
        ...missing,
        ...missingConfigKeys([
          ["haedalAdapterPackageId", config.haedalAdapterPackageId],
          ["haedalMarketVaultObjectId", config.haedalMarketVaultObjectId],
          ["haedalStakingObjectId", config.haedalStakingObjectId],
          ["haedalProtocolPackageId", config.haedalProtocolPackageId],
          ["jitterMathPackageId", config.jitterMathPackageId],
          ["globalConfigObjectId", config.globalConfigObjectId],
        ]),
      ]),
    );
  }
  if (hasCoreMarket && (hasDemoRoute || hasScallopRoute)) return [];

  if (!hasDemoRoute && !hasScallopRoute) {
    missing.push(
      ...missingConfigKeys([
        ["demoMarketVaultObjectId", config.demoMarketVaultObjectId],
        ["scallopProtocolPackageId", config.scallopProtocolPackageId],
        ["scallopMarketVaultObjectId", config.scallopMarketVaultObjectId],
        ["scallopMarketObjectId", config.scallopMarketObjectId],
        ["scallopVersionObjectId", config.scallopVersionObjectId],
      ]),
    );
  }

  return Array.from(new Set(missing));
}

function missingConfigKeys(
  entries: Array<readonly [key: string, value: string | null | undefined]>,
): string[] {
  return entries.flatMap(([key, value]) => (value ? [] : [key]));
}

export function buildJitterMarketGroups(
  markets: readonly JitterMarketOverview[],
): JitterMarketGroupInfo[] {
  const groups = new Map<string, JitterMarketGroupInfo>();

  for (const market of markets) {
    const existing = groups.get(market.groupId);
    if (!existing) {
      groups.set(market.groupId, {
        id: market.groupId,
        name: market.symbol,
        protocol: market.protocol,
        icon: market.icon,
        marketsCount: 1,
        liquidity: market.liquidity,
        tvl: market.tvl,
        volume24h: market.volume24h,
        volume7d: market.volume7d,
        bestFixedApy: market.fixedApy,
        bestUnderlyingApy: market.underlyingApy,
        bestLongYieldApy: market.longYieldApy,
        bestYtLeverage: market.ytLeverage,
        categories: [...market.categories],
        searchText:
          `${market.symbol} ${market.protocol} ${market.groupId}`.toLowerCase(),
        markets: [market],
      });
      continue;
    }

    existing.marketsCount += 1;
    existing.liquidity += market.liquidity;
    existing.tvl += market.tvl;
    existing.volume24h += market.volume24h;
    existing.volume7d += market.volume7d;
    existing.bestFixedApy = Math.max(existing.bestFixedApy, market.fixedApy);
    existing.bestUnderlyingApy = Math.max(
      existing.bestUnderlyingApy,
      market.underlyingApy,
    );
    existing.bestLongYieldApy = Math.max(
      existing.bestLongYieldApy,
      market.longYieldApy,
    );
    existing.bestYtLeverage = Math.max(
      existing.bestYtLeverage,
      market.ytLeverage,
    );
    existing.categories = Array.from(
      new Set([...existing.categories, ...market.categories]),
    );
    existing.markets.push(market);
    existing.searchText = [
      existing.name,
      existing.protocol,
      existing.id,
      ...existing.categories,
    ]
      .join(" ")
      .toLowerCase();
  }

  return [...groups.values()].sort((a, b) => b.liquidity - a.liquidity);
}

export function buildJitterMarketCategoryFilters(
  markets: readonly JitterMarketOverview[],
): JitterMarketCategoryFilter[] {
  const filters = new Map<string, JitterMarketCategoryFilter>();

  for (const market of markets) {
    for (const category of market.categories) {
      if (filters.has(category)) continue;

      if (category.startsWith("protocol:")) {
        const protocol = category.slice("protocol:".length);
        filters.set(category, {
          id: category,
          name: formatCategoryProtocol(protocol),
        });
        continue;
      }

      if (category.startsWith("underlying:")) {
        const symbol = category.slice("underlying:".length).toUpperCase();
        filters.set(category, { id: category, name: symbol });
        continue;
      }

      if (category.startsWith("maturity:")) {
        const bucket = category.slice("maturity:".length);
        filters.set(category, {
          id: category,
          name: formatMaturityBucket(bucket),
        });
      }
    }
  }

  return [...filters.values()];
}

async function hydrateMarketOverview(
  options: CreateJitterMarketDataServiceOptions,
  entry: Pick<JitterMarketConfigEntry, "id" | "config" | "displaySnapshot">,
  serviceOptions: MarketDataServiceOptions & { tradeReady: boolean },
): Promise<JitterMarketOverview> {
  const { config } = entry;
  const marketId = entry.id;

  if (!serviceOptions.tradeReady && entry.displaySnapshot) {
    return hydrateDisplayMarketOverview(
      options,
      config,
      marketId,
      entry.displaySnapshot,
      serviceOptions,
    );
  }

  const [pool, pyState, volume, underlyingApy, analytics, receiptPrices] = await Promise.all([
    options.chainReader.getPoolState(config),
    options.chainReader.getPyState(config),
    getPoolVolumeStats(options.chainReader, config),
    options.getUnderlyingApy?.(config) ?? 0,
    getMarketAnalyticsForOverview(options, marketId),
    getLiveReceiptPrices(options, config),
  ]);

  const overview = buildJitterMarketOverview({
    marketId,
    config,
    tradeReady: serviceOptions.tradeReady,
    pool,
    pyState,
    volume,
    underlyingApy,
    nowMs: serviceOptions.nowMs,
  });

  const hydrated = analytics
    ? applyMarketAnalyticsSnapshot(overview, analytics, config, serviceOptions)
    : overview;
  return withLiveReceiptPrices(
    config,
    hydrated,
    pool,
    pyState,
    analytics,
    volume,
    receiptPrices,
    serviceOptions.nowMs,
  );
}

async function hydrateDisplayMarketOverview(
  options: CreateJitterMarketDataServiceOptions,
  config: JitterMarketConfig,
  marketId: string,
  snapshot: JitterMarketDisplaySnapshot,
  serviceOptions: MarketDataServiceOptions & { tradeReady: boolean },
): Promise<JitterMarketOverview> {
  const [underlyingApy, analytics, receiptPrices] = await Promise.all([
    snapshot.underlyingApy ?? options.getUnderlyingApy?.(config) ?? 0,
    getMarketAnalyticsForOverview(options, marketId),
    getLiveReceiptPrices(options, config),
  ]);
  const overview = buildJitterMarketOverview({
    marketId,
    config,
    tradeReady: serviceOptions.tradeReady,
    pool: snapshot.pool,
    pyState: snapshot.pyState,
    volume: displaySnapshotVolumeToStats(snapshot.volume),
    underlyingApy,
    nowMs: serviceOptions.nowMs,
  });

  const hydrated = analytics
    ? applyMarketAnalyticsSnapshot(overview, analytics, config, serviceOptions)
    : overview;
  return withLiveReceiptPrices(
    config,
    hydrated,
    snapshot.pool,
    snapshot.pyState,
    analytics,
    displaySnapshotVolumeToStats(snapshot.volume),
    receiptPrices,
    serviceOptions.nowMs,
  );
}

type LiveReceiptPrices = { usd: number; index: bigint; backingSyRaw?: string };

function usesLiveReceiptPrices(config: JitterMarketConfig): boolean {
  return Boolean(
    config.emberAdapterPackageId ||
    config.haedalAdapterPackageId ||
    config.scallopMarketVaultObjectId,
  );
}

async function getLiveReceiptPrices(
  options: CreateJitterMarketDataServiceOptions,
  config: JitterMarketConfig,
): Promise<LiveReceiptPrices | null> {
  if (!usesLiveReceiptPrices(config)) return null;
  const network = options.network === "mainnet" ? "mainnet" : "testnet";
  try {
    const [usd, index, backing] = await Promise.all([
      Promise.resolve().then(() => options.getUnderlyingPriceUsd?.(config) ?? config.underlyingPriceUsd),
      Promise.resolve().then(async () => options.resolveSyIndex
        ? options.resolveSyIndex(config)
        : config.emberAdapterPackageId
          ? (await getEmberDepositQuote(network, config, 0n)).syIndex
          : config.haedalAdapterPackageId
            ? (await getHaedalStakeQuote(network, config, 0n)).syIndex
            : config.scallopMarketVaultObjectId && config.scallopMarketObjectId
              ? BigInt((await getScallopMarketIndex(network, config)).syIndexRaw)
              : undefined),
      options.chainReader.getMarketBackingSy?.(config),
    ]);
    return typeof usd === "number" && Number.isFinite(usd) && usd > 0 && index !== undefined && index > 0n
      ? { usd, index, backingSyRaw: backing == null ? undefined : backing.toString() }
      : null;
  } catch {
    return null;
  }
}

function withLiveReceiptPrices(
  config: JitterMarketConfig,
  overview: JitterMarketOverview,
  pool: PoolFields,
  py: PyStateFields,
  analytics: MarketAnalyticsResult | null,
  volume: MarketVolumeStats,
  prices: LiveReceiptPrices | null,
  nowMs = Date.now(),
): JitterMarketOverview {
  if (!usesLiveReceiptPrices(config)) return overview;
  const unavailable = {
    ...overview,
    liquidity: Number.NaN,
    tvl: Number.NaN,
    volume24h: Number.NaN,
    volume7d: Number.NaN,
    totalFees: Number.NaN,
    underlyingPrice: Number.NaN,
    ptUsdValue: Number.NaN,
    ytAssetPrice: Number.NaN,
    ytLeverage: Number.NaN,
    syPrice: undefined,
    lpPrice: undefined,
    marketCoinPrice: undefined,
  };
  if (!prices) return unavailable;
  try {
    const { usd, index } = prices;
    const fixedApy =
      Math.exp(Number(normalizeMoveNumeric(pool.last_ln_implied_rate)) / Number(FP64_ONE)) -
      1;
    const ptPrice = quotePtPriceFromImpliedApy(
      usd,
      fixedApy,
      Math.max(overview.maturityTimestamp * 1000 - nowMs, 0) / (365 * 86400000),
    );
    const values = valueMarketBalances({
      poolSyRaw: pool.total_sy,
      poolPtRaw: pool.total_pt,
      pySyRaw: py.sy_balance,
      reserveFeeSyRaw: py.reserve_fee_balance ?? "0",
      backingSyRaw: prices.backingSyRaw,
      volume24hSyRaw: analytics?.volume24h.raw ?? String(volume.volume24hSy),
      volume7dSyRaw: analytics?.volume7d.raw ?? String(volume.volume7dSy),
      totalFeesSyRaw: String(volume.totalFeesSy),
      marketDecimals: getMarketAccountingDecimals(config),
      underlyingDecimals: getMarketUnderlyingDecimals(config),
      syIndexRaw: index,
      underlyingPriceUsd: usd,
      ptPriceUsd: ptPrice,
    });
    const lpBreakdown = {
      ...overview.lpBreakdown,
      syWeight: values.syWeight,
      ptWeight: values.ptWeight,
      scaledImpliedApy: fixedApy * values.ptWeight,
      scaledSyInterestApy: overview.underlyingApy * values.syWeight,
    };
    const ytPrice = Math.max(usd - ptPrice, 0);
    const longYieldApy = Math.max(overview.underlyingApy - fixedApy, 0);
    return {
      ...overview,
      ...values,
      fixedApy,
      ptRoi: fixedApy,
      underlyingPrice: usd,
      ptUsdValue: ptPrice,
      ytAssetPrice: ytPrice,
      longYieldApy,
      ytRoi: longYieldApy,
      marketCoinPrice: values.syPrice,
      lpPrice: BigInt(pool.lp_supply) > 0n
        ? values.liquidity / (Number(pool.lp_supply) / 10 ** getMarketAccountingDecimals(config))
        : undefined,
      ytLeverage: quoteYtLeverage(usd, ytPrice, overview.underlyingApy),
      lpBreakdown,
      lpApy:
        lpBreakdown.scaledImpliedApy +
        lpBreakdown.scaledSyInterestApy +
        lpBreakdown.swapFeeApy,
    };
  } catch {
    return unavailable;
  }
}

function displaySnapshotVolumeToStats(
  volume: JitterMarketDisplaySnapshot["volume"],
): MarketVolumeStats {
  return {
    volume24hSy: rawSnapshotAmountToBigInt(volume?.volume24hSy),
    volume7dSy: rawSnapshotAmountToBigInt(volume?.volume7dSy),
    totalFeesSy: rawSnapshotAmountToBigInt(volume?.totalFeesSy),
    swapCount24h: volume?.swapCount24h ?? 0,
    swapCount7d: volume?.swapCount7d ?? 0,
  };
}

function rawSnapshotAmountToBigInt(value: string | undefined): bigint {
  return value ? BigInt(value) : 0n;
}

async function getPoolVolumeStats(
  chainReader: JitterChainReader,
  config: JitterMarketConfig,
): Promise<MarketVolumeStats> {
  try {
    return (
      (await chainReader.getPoolVolumeStats?.(config)) ?? EMPTY_POOL_VOLUME
    );
  } catch {
    return EMPTY_POOL_VOLUME;
  }
}

function getMarketAnalytics(
  options: CreateJitterMarketDataServiceOptions,
  marketId: string,
): Promise<MarketAnalyticsResult> {
  if (options.analyticsReader) {
    return options.analyticsReader.getMarketAnalytics({
      network: options.network,
      marketId,
    });
  }

  return Promise.resolve({
    marketId,
    source: "unavailable",
    tvl: unavailableAmount(),
    liquidity: unavailableAmount(),
    volume24h: unavailableAmount(),
    volume7d: unavailableAmount(),
    impliedApy: null,
    underlyingApy: null,
    underlyingApySource: "unavailable",
    underlyingApyUpdatedAtMs: null,
    lpApy: null,
    lpApySource: "unavailable",
    lpApyFormulaVersion: null,
    updatedAtMs: null,
  });
}

function unavailableAmount() {
  return { raw: "0", usd: null, usdSource: "unavailable" as const };
}

async function getMarketAnalyticsForOverview(
  options: CreateJitterMarketDataServiceOptions,
  marketId: string,
): Promise<MarketAnalyticsResult | null> {
  if (!options.analyticsReader) return null;

  try {
    const analytics = await options.analyticsReader.getMarketAnalytics({
      network: options.network,
      marketId,
    });
    return analytics.source === "unavailable" ? null : analytics;
  } catch {
    return null;
  }
}

function applyMarketAnalyticsSnapshot(
  overview: JitterMarketOverview,
  analytics: MarketAnalyticsResult,
  config: JitterMarketConfig,
  options: MarketDataServiceOptions,
): JitterMarketOverview {
  const decimals = getMarketAccountingDecimals(config);
  const fixedApy =
    parseAnalyticsRate(analytics.impliedApy) ?? overview.fixedApy;
  const nowMs = options.nowMs ?? Date.now();
  const yearsToMaturity =
    Math.max(overview.maturityTimestamp * 1000 - nowMs, 0) /
    (365 * 24 * 60 * 60 * 1000);
  const underlyingPrice = overview.underlyingPrice;
  const ptUsdValue = quotePtPriceFromImpliedApy(
    underlyingPrice,
    fixedApy,
    yearsToMaturity,
  );
  const ytAssetPrice = Math.max(underlyingPrice - ptUsdValue, 0);
  const underlyingApy =
    parseAnalyticsRate(analytics.underlyingApy) ?? overview.underlyingApy;
  const longYieldApy = Math.max(underlyingApy - fixedApy, 0);
  const ytLeverage = quoteYtLeverage(
    underlyingPrice,
    ytAssetPrice,
    underlyingApy,
  );
  const lpApy = parseAnalyticsRate(analytics.lpApy) ?? overview.lpApy;
  const ptWeight = overview.lpBreakdown.ptWeight;
  const syWeight = overview.lpBreakdown.syWeight;

  return {
    ...overview,
    tvl: amountSnapshotToNumber(analytics.tvl, decimals) ?? overview.tvl,
    liquidity:
      amountSnapshotToNumber(analytics.liquidity, decimals) ??
      overview.liquidity,
    volume24h:
      amountSnapshotToNumber(analytics.volume24h, decimals) ??
      overview.volume24h,
    volume7d:
      amountSnapshotToNumber(analytics.volume7d, decimals) ?? overview.volume7d,
    fixedApy,
    ptRoi: fixedApy,
    ptUsdValue,
    underlyingPrice,
    underlyingApy,
    totalUnderlyingApy: underlyingApy,
    longYieldApy,
    ytLeverage,
    ytRoi: longYieldApy,
    ytAssetPrice,
    lpApy,
    lpBreakdown: {
      ...overview.lpBreakdown,
      scaledImpliedApy: fixedApy * ptWeight,
      scaledSyInterestApy: underlyingApy * syWeight,
    },
    baseYield: {
      ...overview.baseYield,
      apy: underlyingApy,
    },
    underlyingInterestApy: underlyingApy,
    analytics: buildMarketAnalyticsState(analytics, options),
  };
}

function buildMarketAnalyticsState(
  analytics: MarketAnalyticsResult,
  options: MarketDataServiceOptions,
): JitterMarketOverview["analytics"] {
  const staleAfterMs =
    options.analyticsFreshnessMs ?? DEFAULT_ANALYTICS_FRESHNESS_MS;
  const updatedAtMs = parseAnalyticsTimestamp(analytics.updatedAtMs);
  const nowMs = options.nowMs ?? Date.now();

  return {
    source: analytics.source,
    updatedAtMs,
    isStale: updatedAtMs === null ? true : nowMs - updatedAtMs > staleAfterMs,
    staleAfterMs,
    underlyingApySource: analytics.underlyingApySource,
    underlyingApyUpdatedAtMs: parseAnalyticsTimestamp(
      analytics.underlyingApyUpdatedAtMs,
    ),
    lpApySource: analytics.lpApySource,
    lpApyFormulaVersion: analytics.lpApyFormulaVersion,
  };
}

function amountSnapshotToNumber(
  amount: MarketAnalyticsResult["tvl"],
  decimals: number,
): number | null {
  if (amount.usd !== null) return parseFiniteNumber(amount.usd);
  return null;
}

function quotePtPriceFromImpliedApy(
  underlyingPrice: number,
  impliedApy: number,
  yearsToMaturity: number,
): number {
  if (!Number.isFinite(underlyingPrice) || underlyingPrice <= 0) return 0;
  if (!Number.isFinite(impliedApy) || impliedApy <= -0.999999) {
    return underlyingPrice;
  }
  if (yearsToMaturity <= 0) return underlyingPrice;

  const discountFactor = Math.pow(
    1 + Math.max(impliedApy, -0.999999),
    -yearsToMaturity,
  );
  return underlyingPrice * Math.min(Math.max(discountFactor, 0), 1);
}

function quoteYtLeverage(
  underlyingPrice: number,
  ytAssetPrice: number,
  underlyingApy: number,
): number {
  if (underlyingPrice > 0 && ytAssetPrice > 0) {
    return underlyingPrice / ytAssetPrice;
  }
  return underlyingApy > 0 ? 1 : 0;
}

function parseAnalyticsRate(value: string | null): number | null {
  if (value === null) return null;
  const parsed = parseFiniteNumber(value);
  if (parsed === null) return null;

  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) {
    const raw = BigInt(trimmed);
    const fixed64Threshold = 1_000_000_000_000n;
    if (raw > fixed64Threshold || raw < -fixed64Threshold) {
      return Math.exp(Number(raw) / Number(FP64_ONE)) - 1;
    }
  }

  return parsed;
}

function parseFiniteNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAnalyticsTimestamp(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveMarketId(
  options: CreateJitterMarketDataServiceOptions,
  config: JitterMarketConfig,
): string {
  return (
    options.configProvider
      .listMarketConfigEntries(options.network)
      .find(
        (entry) =>
          entry.config.poolObjectId === config.poolObjectId ||
          entry.config.marketObjectId === config.marketObjectId,
      )?.id ?? config.marketObjectId
  );
}

function formatCategoryProtocol(protocol: string): string {
  if (protocol === "scallop") return "Scallop";
  if (protocol === "jitter") return "Jitter";
  return protocol
    ? `${protocol[0]?.toUpperCase() ?? ""}${protocol.slice(1)}`
    : "Protocol";
}

function formatMaturityBucket(bucket: string): string {
  if (bucket === "near") return "Near Expiry";
  if (bucket === "mid") return "Mid Term";
  if (bucket === "far") return "Far Term";
  return "Matured";
}
