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
const TESTNET_FRONTEND_QA_V4_MARKET_CONFIG: JitterMarketConfig = {
  jitterPackageId: "0x15dcbb610ebebb4da45308f86be144828ed5594365a7c3f24e511032c1a02c14",
  jitterOriginalPackageId: "0x8e00ec162e9eb78448625618f898c8956c88041b7adc6ee5fa08a97f59ed8e39",
  jitterViewPackageId: "0xf9b775f9ef5053d62879898858c6c897f585e0a74c1ad10cc59209560ce95e1d",
  jitterRegistryPackageId: "0xdd6fcd4d8717ea54483963e0322567e91500084bc42113de8b1cbde47c20c90d",
  jitterFrameworkPackageId: "0x7bfbcc91c7e09621f647ebe3dbccc679a6f756d7734b1970606030730f9423d5",
  jitterExtensionsPackageId: "0xac2b41ad6efd7188bb1a18d408f617d870e7c7588237d0b42c6b6240a7851bb3",
  demoAdapterPackageId: "0x076f0d2d753f640d4ac6fcc4e397b1f8c76a6104cc3b7cdb5d7b0dabe53358b0",
  oraclePackageId: "0xa5b1f25c1ab110e4d2e1f7cb72fac0c35abb0ac47566b1530b306795f987f854",

  syStateObjectId: "0xee4b516ba5dcf07d62a021acf36aca4945829bb4c03f86d6e66f50879eedbe88",
  globalConfigObjectId: "0x8975b24f03a6a248e18d658b80f8b82869c9e7b7bbec2cabf7d553c9988ad3ae",
  rewardDistributorObjectId: "0x70c92bf14f3a0ad0dbcdd86630109a609f33870a9d401ddbf88e7dcb6f5addd7",
  marketRegistryObjectId: "0x0407767d0ad06f15a18d36cee727db86398ad4491c0242d382c14b1498516ac0",
  aclObjectId: "0x988bd68fbadd5cb2ce5794649f6e8b0570aef61f4ebbad77942a9b4da0185077",

  marketObjectId: "0x7a350f4b3d2847bdb46f1f7570b0f3b9ff1943e7264dcbf5bfc8e4b5f29cd395",
  marketStateObjectId: "0x7a350f4b3d2847bdb46f1f7570b0f3b9ff1943e7264dcbf5bfc8e4b5f29cd395",
  pyStateObjectId: "0x7a350f4b3d2847bdb46f1f7570b0f3b9ff1943e7264dcbf5bfc8e4b5f29cd395",
  poolObjectId: "0x7a350f4b3d2847bdb46f1f7570b0f3b9ff1943e7264dcbf5bfc8e4b5f29cd395",
  orderbookObjectId: null,
  ytOrderbookObjectId: null,
  priceAggregatorObjectId: "0xde13364ad1ce4e1820387e9060e69498489864fcc8f992d373bad2a5d7d0d64f",
  demoMarketVaultObjectId: "0xf47b5c19dea4ada221a62870841e3698fa03460b22dfd990ce55e1ae72f6891f",

  underlyingTypeTag: "0x6c2ab59fd584660d6d44f263e3cf3349749908add2cd6dcd71e47a2d73508b1e::demo_underlying::DEMO_UNDERLYING",
  syTypeTag: "0x18b0ab33479a8cb1de1d2dd7ac15108566c5cd2602c1dc8f8f12ade725c5f4ff::SY::SY",
  ptTypeTag: "0x7ff06d4afd4870183572bc2664b36530691737d7af8d39d8171f0989f80ad19a::PT::PT",
  ytTypeTag: "0x8201a4d143e56ec8233a787d3fc10c8cb2aab91c537701dfc709a7cc979b40e2::YT::YT",
  underlyingDecimals: 6,
  marketDecimals: 6,
  rawSyMarketCap: "0",
  assetMarketCap: "0",
  projectId: "frontend-qa-v4",
  liquidlink: {
    enabled: true,
    liquidlinkConfigPackageId: "0xe9b2301ea490d42806f5657dae0409f0137b50f15c52f8122a14b70dc52622f9",
    liquidlinkPackageId: "0x57edeb872aed943cf38b878b0588f4c9c6ab88bb5f452b3c12f0558c28720a39",
    liquidlinkGlobalConfigObjectId: "0x55d0f2eec1cbd9e7a3c88e52253b8a7fb3280ceb326d5e9ceb0388e23faac848",
    projectObjectId: "0x59e49dc0dda6b7e8a0717b526ce7a0b6d8222d7fb7abcb9db7b96f241ae18d0b",
    pointConfigObjectId: "0xc3ee32e3344fa2ca073040abe505256126ab8c9aea38ec94d8bd96f80c5d1b7a",
    scoreboardObjectId: "0x2cb13f182d7058ec33886103e367e7d5b18263ce9396cdc0bc3bcf26ce129541",
    lpPointStateObjectId: "0x9579acbd59607adbe7efce2349735ac3615b997f72b2cd25d910013fe2b01f04",
    referralPackageId: "0xa2b8197426cd260b55c5051d37622ea1f39cd2c2a5a6790dbd868e09d599292c",
    ytMultiplierBps: 10000,
    lpMultiplierBps: 12000,
    pointPrograms: [
      {
        label: "Jitter Protocol Points",
        protocol: "jitter",
        projectId: "frontend-qa-v4",
        projectObjectId: "0x59e49dc0dda6b7e8a0717b526ce7a0b6d8222d7fb7abcb9db7b96f241ae18d0b",
        scoreboardObjectId: "0x2cb13f182d7058ec33886103e367e7d5b18263ce9396cdc0bc3bcf26ce129541",
        pointConfigObjectId: "0xc3ee32e3344fa2ca073040abe505256126ab8c9aea38ec94d8bd96f80c5d1b7a",
        lpPointStateObjectId: "0x9579acbd59607adbe7efce2349735ac3615b997f72b2cd25d910013fe2b01f04",
        enabled: true,
        scopes: ["yt","lp","pool"],
        referral: {
          policyStateObjectId: "0xf1ff2a716ab0fca2ab171c819076045e959f54bbd399d300300cdae9aa320d81",
          referralTableObjectId: "0x40de401f6a97be1f3f506c96d74643edbbdd64923e6433fcfa8422bcc83324ee",
        },
      },
      {
        label: "Scallop Market Points (QA)",
        protocol: "scallop",
        season: "testnet-smoke",
        projectId: "scallop-frontend-qa-v4",
        projectObjectId: "0x7dfba4136bfa91cfca724a10e04ff3caa68e5d5d5de45d6eaed4d1553ed18140",
        scoreboardObjectId: "0x3f16edc50adfb9d091c65f0c33d8694670765adab54916b719ec50f202235ab0",
        pointConfigObjectId: "0x0f145507444d7c04a932f0dff2d5d5ea15c28d8d6f31b9eb4592250117b7b1cf",
        lpPointStateObjectId: "0x83492cf39313c58e49d7bd39528bd5e05fee06e5023c1d54edfde486e16ab6d4",
        enabled: true,
        scopes: ["yt","lp","pool"],
        referral: {
          policyStateObjectId: "0xa71a2790748c122fb152a3f12201524022f490e2d71744df813174e045f09fd8",
          referralTableObjectId: "0x40de401f6a97be1f3f506c96d74643edbbdd64923e6433fcfa8422bcc83324ee",
        },
      },
    ],
    tokenizedPoint: {
      enabled: true,
      packageId: "0x57edeb872aed943cf38b878b0588f4c9c6ab88bb5f452b3c12f0558c28720a39",
      pointTokenPackageId: "0x2ecc02baa6b6dada68f925e174d8f06df7fcf671038c12f626f856828edd6b35",
      tokenTypeTag: "0x2ecc02baa6b6dada68f925e174d8f06df7fcf671038c12f626f856828edd6b35::jitter_point::JITTER_POINT",
      pointTokenTreasuryCapObjectId: "0xf2c49bb6a87b465326f8b8b1679fe8622e2fdcd596b32f1a0e1f5c56c325075a",
      pointTokenMetadataCapObjectId: "0x7d35e32429e4b9cb2749eae63dd32ba9727daf59a6e543721a0ceeb390afd257",
      pointTokenCurrencyObjectId: "0x17b86bb6267929ad3b11145183865ea37fc6c69ddfb5f5ad2f75c36984cd7ca3",
      pointTokenUpgradeCapObjectId: "0xc9b0a318351d0f989ed330d274c4b5df8781c2de6fa9f473deac520b931b5679",
      pointTokenDecimals: 6,
      pointTokenMarketObjectId: "0x9d265d901be5008462de1e4b75b08b6b1b73bffdcb19f5cf70eee4e5c4bf2490",
      quoteTokenTypeTag: "0x5b75783f63ebd337d7098e1538f2ca1bd29e82ec980453d4b2911a2edc37dd19::qa_reward::QA_REWARD",
      quoteTokenDecimals: 6,
      orderbookObjectId: "0x431d88705495e412ecf1f1b2617584a39e9455a8915958b34e518e2e8e39783e",
      quoteSymbol: "QA_REWARD",
      coinQuoteTakerFeeBps: 50,
      coinQuoteMakerFeeBps: 25,
      minimumQuoteNotional: "1000000",
    },
    checkIn: {
      packageId: "0x5de1e571f261f6d7a1ad39361f9dc788fb5f9fa7c102fafeab65f4694b8d0c62",
      globalConfigObjectId: "0x8975b24f03a6a248e18d658b80f8b82869c9e7b7bbec2cabf7d553c9988ad3ae",
      campaignObjectId: "0x6e724388bc9302a118eee5d338e6fffbe7b68fc6775f495fb0bd4bc29dd244c9",
      defaultPointsPerCheckIn: "1",
      resetOffsetMs: "46800000",
      dayLengthMs: "86400000",
      minPtBalance: "1",
      minYtBalance: "1",
      minLpAmount: "1",
    },
  },
  coinReward: {
    rewardCoinTypeTag: "0x5b75783f63ebd337d7098e1538f2ca1bd29e82ec980453d4b2911a2edc37dd19::qa_reward::QA_REWARD",
    ytRewarderObjectId: "0x3cedfc2f74ff6af4a469e5c5551519ef7277fc57f8ed7dbecd97c831c4c16f08",
    lpRewarderObjectId: "0x78aebe924e76526ca30d80f74c7c57c10b5cb4572fea85a5c7f6637b58d9361c",
    emissionPerMs: "166",
    fundedAmount: "100000000",
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
    id: "frontend-qa-v4",
    name: "frontend-qa-v4",
    network: "testnet",
    chainId: "4c78adac",
    isDefault: true,
    config: TESTNET_FRONTEND_QA_V4_MARKET_CONFIG,
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
