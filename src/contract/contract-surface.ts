export type JitterAdapterKind =
  | "demo"
  | "scallop"
  | "ember"
  | "suilend"
  | "navi";

export type JitterContractAdapterSurface = {
  kind: JitterAdapterKind;
  packageName: string;
  source: string;
};

export type JitterContractObjectSurface = {
  source: string;
  fields: readonly string[];
};

export type JitterContractSurface = {
  adapters: readonly JitterContractAdapterSurface[];
  objects: {
    CoinAuthority: JitterContractObjectSurface;
    MarketState: JitterContractObjectSurface;
    SettlementState: JitterContractObjectSurface;
    RiskConfig: JitterContractObjectSurface;
    PyIndexGuard: JitterContractObjectSurface;
    RewardState: JitterContractObjectSurface;
    JitterPosition: JitterContractObjectSurface;
  };
};

export const JITTER_CONTRACT_SURFACE = {
  adapters: [
    {
      kind: "demo",
      packageName: "demo_adapter",
      source: "contract/jitter_adapter/demo_adapter/Move.toml",
    },
    {
      kind: "scallop",
      packageName: "scallop_adapter",
      source: "contract/jitter_adapter/scallop_adapter/Move.toml",
    },
    {
      kind: "ember",
      packageName: "ember_adapter",
      source: "contract/jitter_adapter/ember_adapter/Move.toml",
    },
    {
      kind: "suilend",
      packageName: "suilend_adapter",
      source: "contract/jitter_adapter/suilend_adapter/Move.toml",
    },
    {
      kind: "navi",
      packageName: "navi_adapter",
      source: "contract/jitter_adapter/navi_adapter/Move.toml",
    },
  ],
  objects: {
    CoinAuthority: {
      source: "contract/jitter/sources/protocol/market_state.move",
      fields: [
        "sy_treasury",
        "pt_treasury",
        "yt_treasury",
      ],
    },
    MarketState: {
      source: "contract/jitter/sources/protocol/market_state.move",
      fields: [
        "id",
        "expiry",
        "sy_type",
        "pt_type",
        "yt_type",
        "price_aggregator_id",
        "reward_distributor_id",
        "coin_authority",
        "pt_supply",
        "yt_supply",
        "py_sy_balance",
        "py_index_stored",
        "py_index_last_updated",
        "last_collect_interest_index",
        "total_treasury_interest",
        "last_interest_timestamp",
        "global_interest_index",
        "settlement",
        "total_pt",
        "pool_sy_balance",
        "reserve_fee_vault",
        "lp_supply",
        "pool_status",
        "pool_generation",
        "last_ln_implied_rate",
        "scalar_root",
        "initial_anchor",
        "ln_fee_rate_root",
        "protocol_fee_rate",
        "protocol_fee_remainder_raw",
        "risk",
        "rewards",
      ],
    },
    SettlementState: {
      source: "contract/jitter/sources/protocol/market_state.move",
      fields: [
        "is_settled",
        "settled_py_index",
      ],
    },
    RiskConfig: {
      source: "contract/jitter/sources/protocol/market_state.move",
      fields: [
        "treasury",
        "interest_fee_rate",
        "expiry_divisor",
        "market_cap",
        "asset_market_cap",
        "py_index_guard",
      ],
    },
    PyIndexGuard: {
      source: "contract/jitter/sources/protocol/market_state.move",
      fields: [
        "mode",
        "max_step_growth_bps",
        "max_window_growth_bps",
        "window_ms",
        "anchor_index_raw",
        "anchor_timestamp_ms",
      ],
    },
    RewardState: {
      source: "contract/jitter/sources/protocol/market_state.move",
      fields: [
        "pool_reward_guard",
        "yt_reward_guard",
        "lp_reward_guard",
      ],
    },
    JitterPosition: {
      source: "contract/jitter/sources/user/jitter_position.move",
      fields: [
        "id",
        "market_state_id",
        "expiry",
        "created_at",
        "py",
        "lp",
      ],
    },
  },
} as const satisfies JitterContractSurface;
