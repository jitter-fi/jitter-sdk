/**
 * @jitter/sdk -- config.ts
 *
 * SDK-maintained market registry. Keep deployed market configs here so apps
 * can bootstrap without carrying their own env-var list.
 */

import type {
  JitterMarketConfig,
  PoolFields,
  PyStateFields,
} from "./types.js";
import { mergeJitterMarketConfig } from "./internal/config-merge.js";

export type JitterConfigNetwork = "mainnet" | "testnet";
export type JitterConfigNetworkInput = JitterConfigNetwork | "devnet";

export type JitterMarketConfigEntry = {
  id: string;
  name: string;
  network: JitterConfigNetwork;
  chainId: string;
  /**
   * Overrides automatic route readiness detection. Use false for display-only
   * markets whose deployed objects are stale or not yet wired for PTBs.
   */
  tradeReady?: boolean;
  displaySnapshot?: JitterMarketDisplaySnapshot;
  isDefault?: boolean;
  config: JitterMarketConfig;
};

export type JitterMarketDisplaySnapshot = {
  pool: PoolFields;
  pyState: PyStateFields;
  volume?: {
    volume24hSy?: string;
    volume7dSy?: string;
    totalFeesSy?: string;
    swapCount24h?: number;
    swapCount7d?: number;
  };
  underlyingApy?: number;
};

const STATIC_MAINNET_JITTER_MARKET_CONFIGS = [] as const satisfies readonly JitterMarketConfigEntry[];

// <jitter-admin:testnet-configs:start>
const TESTNET_MANUAL_QA_V1_MARKET_CONFIG: JitterMarketConfig = {
  jitterPackageId: "0x76e75c35e7f1da7d4af3cee0c48d2c9e64f8d46b835f8486289699d586097013",
  jitterOriginalPackageId: "0x76e75c35e7f1da7d4af3cee0c48d2c9e64f8d46b835f8486289699d586097013",
  jitterViewPackageId: "0x7bb96933e3bdc1a38bbd5767186c7922c807dff4eb43a5afdfc5e97bc38a5ff9",
  jitterRegistryPackageId: "0x609deb1f9562c762de3e39cb547537d4520bf2f110ea85691959a21036cf41e9",
  jitterFrameworkPackageId: "0x72f45c3c6cd8b20d8fea966d5f6e0ab5dc05b40c00bb55dee6a3b5cb09a6619b",
  jitterExtensionsPackageId: "0xd709f5e7e267c67183acb1538ad4285971d78c56f788e80b56597d07a9806339",
  demoAdapterPackageId: "0x8078719f0409d4f3a9719f7c75d44d26ce3686d816b0962d2f9c48be974f17db",
  oraclePackageId: "0x77a45145d9e357db489283726c91e7a7bc56850f3c08527a07af7d5b40725f0a",

  syStateObjectId: "0x93c09e24ffbecd1c9713c2d6e00fc71ddd343367f12f09ef62b3eb00e896ff18",
  globalConfigObjectId: "0x3fc529d2d750ac457b79b41d6bb6febed37c7b9373b0a280c5ea88ebfb441b66",
  rewardDistributorObjectId: "0xeac21fd75c6ce81c72ff89fc9e3aadfb250caa8a30bb5a9d144d466cdf949203",
  marketRegistryObjectId: "0x6d041f00d5c123b73317ca470dfea0844980f03dde5a5033923a865f3cf3c82c",
  aclObjectId: "0xc9757630c4f2553ccda184dd764e080260a289a07c04fa4a97cdcba69b051e0f",

  marketObjectId: "0x61913b67e125af531bbc31fcb6f4172bde0346b4d7698110a5dea9a1b2fdd5be",
  marketStateObjectId: "0x61913b67e125af531bbc31fcb6f4172bde0346b4d7698110a5dea9a1b2fdd5be",
  pyStateObjectId: "0x61913b67e125af531bbc31fcb6f4172bde0346b4d7698110a5dea9a1b2fdd5be",
  poolObjectId: "0x61913b67e125af531bbc31fcb6f4172bde0346b4d7698110a5dea9a1b2fdd5be",
  orderbookObjectId: null,
  ytOrderbookObjectId: null,
  priceAggregatorObjectId: "0x6d33cd97849e797fd03a8d575e470a583319f24e9f43f19407a95dd4bb89d7f7",
  demoMarketVaultObjectId: "0xc8bc769d427713a5f08fae1a439129ff34de2a6db119d43d1149535bdadf75c9",

  underlyingTypeTag: "0xcb998a34d2ce0d5561c24f40c0c3656c49ea1d2f53da053ce7f31d1fd44b7af1::demo_underlying::DEMO_UNDERLYING",
  syTypeTag: "0xb9cccd139a7f8dc52771a01c9d329d9682201478ceb66f441e5f3d2c58ac46bf::SY::SY",
  ptTypeTag: "0xd3ea89bd6d4b2748b9e9c5bad5f76c2a7914b27a1a6e4dfa6697cf36e3d5d755::PT::PT",
  ytTypeTag: "0x10b79f881604cb78d9b1fd83ddeb7b1a151d1d9609950d095e8d31faebf4c19d::YT::YT",
  underlyingDecimals: 6,
  marketDecimals: 6,
  rawSyMarketCap: "0",
  assetMarketCap: "0",
  projectId: "manual-qa-v1",
  liquidlink: {
    enabled: true,
    liquidlinkConfigPackageId: "0x21b6afa802140d5d2fd293859c8f36deae9d81aafbae8c6f7f945eeb4c6889ae",
    liquidlinkPackageId: "0x4839fd07ed84333a58df495228c9cc20902d41412600eb1970ce091aca815242",
    liquidlinkGlobalConfigObjectId: "0x2332ef5a61a7af68a5e391540f74330d26e3832f620fecbe58e73d5839dac0e3",
    projectObjectId: "0x50ff29bcc967a973fefb82ae74019f85f5c8bdab6803464894ad599eafd9023e",
    pointConfigObjectId: "0x25e7b0a693317e49ad44cda1e20dd71e21f085fe4cbc727dca8825714008dcc1",
    scoreboardObjectId: "0xe52c1a5861b79d7c40a8db0e3f92d244ecf9a118f1eab953b99b67a90fd274c2",
    lpPointStateObjectId: "0xf883de8bf7726220881095bb035adc785121c2de39dfef83eca92b5a80b115b7",
    referralPackageId: "0xfaae37d5967d58525f4968084093a7c7c845974e1c1f9b5e5a914021efc982ac",
    ytMultiplierBps: 10000,
    lpMultiplierBps: 12000,
    pointPrograms: [
      {
        label: "Jitter Protocol Points",
        protocol: "jitter",
        projectId: "manual-qa-v1",
        projectObjectId: "0x50ff29bcc967a973fefb82ae74019f85f5c8bdab6803464894ad599eafd9023e",
        scoreboardObjectId: "0xe52c1a5861b79d7c40a8db0e3f92d244ecf9a118f1eab953b99b67a90fd274c2",
        pointConfigObjectId: "0x25e7b0a693317e49ad44cda1e20dd71e21f085fe4cbc727dca8825714008dcc1",
        lpPointStateObjectId: "0xf883de8bf7726220881095bb035adc785121c2de39dfef83eca92b5a80b115b7",
        enabled: true,
        scopes: ["yt","lp","pool"],
        referral: {
          policyStateObjectId: "0x493c11a5a24f17619500eceb8caca7f06265ce6eb50e11d5398aef345fcb749e",
          referralTableObjectId: "0xe271836cad158e9c63c82132d237fada4f01aabbcfc02e17c19372e80bd1f3a1",
        },
      },
      {
        label: "Scallop Market Points (QA)",
        protocol: "scallop",
        season: "testnet-smoke",
        projectId: "scallop-manual-qa-v1",
        projectObjectId: "0x1aade1912b6eb2ebb0ffe28c8df6ccb2b7ab49f91ce9c5241dc06728a9dd057f",
        scoreboardObjectId: "0x333fa88c7afeaceaa1b79b429c20e5fe9ef492624128a4300b41dbf0e116c114",
        pointConfigObjectId: "0x5ae701a967e254eeedc1b45a845fa6aa1a77f0ef67833e7b26a25147918afca8",
        lpPointStateObjectId: "0x97142e0ac2ad51a918e708e61f220a1228419064f26d2ff1a6411a9d6d0bc3e4",
        enabled: true,
        scopes: ["yt","lp","pool"],
        referral: {
          policyStateObjectId: "0x946d2f0f838aadface8ad7ed3065fe2c2061d9674ad05bb2dfec376775ade622",
          referralTableObjectId: "0xe271836cad158e9c63c82132d237fada4f01aabbcfc02e17c19372e80bd1f3a1",
        },
      },
    ],
    tokenizedPoint: {
      enabled: true,
      packageId: "0x4839fd07ed84333a58df495228c9cc20902d41412600eb1970ce091aca815242",
      pointTokenPackageId: "0xfd5366b87d676ed0a3d501d6c9ea5c2c48e8d6b98ea19f9ea24ee102562d657f",
      tokenTypeTag: "0xfd5366b87d676ed0a3d501d6c9ea5c2c48e8d6b98ea19f9ea24ee102562d657f::jitter_point::JITTER_POINT",
      pointTokenTreasuryCapObjectId: "0x6d2e2060d065dfbcb1c0493e26a8b718d91dff21bb1b7c433a1e9c4f9193b128",
      pointTokenMetadataCapObjectId: "0xacb71f60f8a2ff7a58667628844e29a33165c7a939b92a91419b0ab074047b0f",
      pointTokenCurrencyObjectId: "0x5220baee651cf8af3141b4c94a8a1e62222e77a54594c0dfad8ac88ff1450d4c",
      pointTokenUpgradeCapObjectId: "0xbca75f65d9c402285be0b3d3ec1767953ff4625172a839e7051722accb997826",
      pointTokenDecimals: 6,
      pointTokenMarketObjectId: "0x7002bc9bdd37d70636040f75da82a3418a47d0a7c941acadfbf85f5ead7df216",
      quoteTokenTypeTag: "0x5e1f49fa369ada75a859adc5d6c15e331b5f3f87f4385dbeedd8181f6108b2e5::mock_usdc::MOCK_USDC",
      quoteTokenDecimals: 6,
      orderbookObjectId: "0x7f671815abf1161d69ed5df8d4e70394816051c83924ec031b7aaaf80a879e53",
      quoteSymbol: "MOCK_USDC",
      coinQuoteTakerFeeBps: 50,
      coinQuoteMakerFeeBps: 25,
      minimumQuoteNotional: "10000",
    },
    checkIn: {
      packageId: "0x07e7f2191ef7ac04387a45bc52f264783d59839839b4cf1437a2ac53d815dba4",
      globalConfigObjectId: "0x3fc529d2d750ac457b79b41d6bb6febed37c7b9373b0a280c5ea88ebfb441b66",
      campaignObjectId: "0xc8ff3f6aba908f2f5004213e83aa6feb2fab46e2cf7e9ede0c524aee99b2e33d",
      defaultPointsPerCheckIn: "1",
      resetOffsetMs: "46800000",
      dayLengthMs: "86400000",
      minPtBalance: "0",
      minYtBalance: "0",
      minLpAmount: "1",
    },
  },
  coinReward: {
    rewardCoinTypeTag: "0x7aec57bac2a1d8b5661673543082676538f769fe5ffed96b62dc13df8d4e7001::qa_reward::QA_REWARD",
    ytRewarderObjectId: "0xd1dd0254a986bfefdbd5880a21f12a59af10765ae421a4cefcf434eadcf7aeeb",
    lpRewarderObjectId: "0xca0d6c873c4d05efef3bc12b7d04249a4769632d0128835f0632482133924a71",
    emissionPerMs: "38",
    fundedAmount: "100000000000",
  },
};
// <jitter-admin:testnet-configs:end>

export const MAINNET_JITTER_MARKET_CONFIGS = withEnvMarketConfigs(
  "mainnet",
  STATIC_MAINNET_JITTER_MARKET_CONFIGS,
);

// <jitter-admin:testnet-entries:start>
const STATIC_TESTNET_JITTER_MARKET_CONFIGS = [
  {
    id: "manual-qa-v1",
    name: "manual-qa-v1",
    network: "testnet",
    chainId: "4c78adac",
    isDefault: true,
    config: TESTNET_MANUAL_QA_V1_MARKET_CONFIG,
  },
] as const satisfies readonly JitterMarketConfigEntry[];

export const TESTNET_JITTER_MARKET_CONFIGS = withEnvMarketConfigs(
  "testnet",
  STATIC_TESTNET_JITTER_MARKET_CONFIGS,
);
// <jitter-admin:testnet-entries:end>

export const JITTER_MARKET_CONFIGS_BY_NETWORK = {
  mainnet: MAINNET_JITTER_MARKET_CONFIGS,
  testnet: TESTNET_JITTER_MARKET_CONFIGS,
} as const satisfies Record<JitterConfigNetwork, readonly JitterMarketConfigEntry[]>;

type EnvMarketConfigPayload =
  | readonly JitterMarketConfigEntry[]
  | Partial<Record<JitterConfigNetwork, readonly JitterMarketConfigEntry[]>>;

function withEnvMarketConfigs(
  network: JitterConfigNetwork,
  staticEntries: readonly JitterMarketConfigEntry[],
): JitterMarketConfigEntry[] {
  const envEntries = readEnvMarketConfigs(network);
  if (envEntries.length === 0) return staticEntries.map(cloneMarketEntry);

  const merged = new Map<string, JitterMarketConfigEntry>();
  for (const entry of staticEntries) {
    merged.set(entry.id, cloneMarketEntry(entry));
  }
  for (const entry of envEntries) {
    const existing = merged.get(entry.id);
    merged.set(
      entry.id,
      existing
        ? {
            ...existing,
            ...cloneMarketEntry(entry),
            config: mergeJitterMarketConfig(existing.config, entry.config),
          }
        : cloneMarketEntry(entry),
    );
  }

  return [...merged.values()];
}

function readEnvMarketConfigs(
  network: JitterConfigNetwork,
): JitterMarketConfigEntry[] {
  const payload = parseEnvMarketConfigPayload(
    process.env[`NEXT_PUBLIC_${network.toUpperCase()}_JITTER_MARKET_CONFIGS_JSON`] ??
      process.env[`${network.toUpperCase()}_JITTER_MARKET_CONFIGS_JSON`] ??
      process.env.NEXT_PUBLIC_JITTER_MARKET_CONFIGS_JSON ??
      process.env.JITTER_MARKET_CONFIGS_JSON,
  );
  if (!payload) return [];

  const rawEntries: readonly unknown[] = Array.isArray(payload)
    ? payload
    : readNetworkEnvEntries(payload, network);
  return rawEntries.flatMap((entry) =>
    isJitterMarketConfigEntry(entry) && entry.network === network
      ? [cloneMarketEntry(entry)]
      : [],
  );
}

function readNetworkEnvEntries(
  payload: EnvMarketConfigPayload,
  network: JitterConfigNetwork,
): readonly unknown[] {
  if (Array.isArray(payload)) return payload;
  const value = (
    payload as Partial<Record<JitterConfigNetwork, readonly unknown[]>>
  )[network];
  return Array.isArray(value) ? value : [];
}

function parseEnvMarketConfigPayload(
  raw: string | undefined,
): EnvMarketConfigPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as readonly JitterMarketConfigEntry[];
    if (parsed && typeof parsed === "object") {
      return parsed as Partial<
        Record<JitterConfigNetwork, readonly JitterMarketConfigEntry[]>
      >;
    }
  } catch {
    return null;
  }
  return null;
}

function isJitterMarketConfigEntry(
  value: unknown,
): value is JitterMarketConfigEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<JitterMarketConfigEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    (entry.network === "mainnet" || entry.network === "testnet") &&
    typeof entry.chainId === "string" &&
    Boolean(entry.config) &&
    typeof entry.config === "object"
  );
}

function isRegistryNetwork(
  network: JitterConfigNetworkInput,
): network is JitterConfigNetwork {
  return network === "mainnet" || network === "testnet";
}

function cloneMarketConfig(config: JitterMarketConfig): JitterMarketConfig {
  return structuredClone(config);
}

function cloneMarketEntry(entry: JitterMarketConfigEntry): JitterMarketConfigEntry {
  return {
    ...entry,
    config: cloneMarketConfig(entry.config),
    displaySnapshot: cloneDisplaySnapshot(entry.displaySnapshot),
  };
}

function cloneDisplaySnapshot(
  snapshot: JitterMarketDisplaySnapshot | undefined,
): JitterMarketDisplaySnapshot | undefined {
  return snapshot ? structuredClone(snapshot) : undefined;
}

export function listJitterMarketConfigs(
  network: JitterConfigNetworkInput,
): JitterMarketConfigEntry[] {
  if (!isRegistryNetwork(network)) return [];
  return JITTER_MARKET_CONFIGS_BY_NETWORK[network].map(cloneMarketEntry);
}

export function getJitterMarketConfigEntry(
  network: JitterConfigNetworkInput,
  id: string,
): JitterMarketConfigEntry | null {
  return (
    listJitterMarketConfigs(network).find((entry) => entry.id === id) ?? null
  );
}

export function getDefaultJitterMarketConfigEntry(
  network: JitterConfigNetworkInput,
): JitterMarketConfigEntry | null {
  const configs = listJitterMarketConfigs(network);
  return configs.find((entry) => entry.isDefault) ?? configs[0] ?? null;
}

export function getJitterMarketConfig(
  network: JitterConfigNetworkInput,
  id: string,
): JitterMarketConfig | null {
  return getJitterMarketConfigEntry(network, id)?.config ?? null;
}

export function getDefaultJitterMarketConfig(
  network: JitterConfigNetworkInput,
): JitterMarketConfig | null {
  return getDefaultJitterMarketConfigEntry(network)?.config ?? null;
}
