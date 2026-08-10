/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * market_state - unified market object for the current Jitter core.
 *
 * This module collapses the legacy Market + PyState + Pool object graph into one
 * shared object. New router flows, market-scoped rewards, registry records, and
 * position accounting are all keyed to this MarketState object.
 */

import { MoveStruct, MoveTuple, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as coin from './deps/sui/coin.js';
import * as coin_1 from './deps/sui/coin.js';
import * as coin_2 from './deps/sui/coin.js';
import * as type_name from './deps/std/type_name.js';
import * as type_name_1 from './deps/std/type_name.js';
import * as type_name_2 from './deps/std/type_name.js';
import * as balance from './deps/sui/balance.js';
import * as balance_1 from './deps/sui/balance.js';
import * as balance_2 from './deps/sui/balance.js';
import * as fixed_point64 from './deps/jitter_math/fixed_point64.js';
import * as fixed_point64_with_sign from './deps/jitter_math/fixed_point64_with_sign.js';
import * as fixed_point64_with_sign_1 from './deps/jitter_math/fixed_point64_with_sign.js';
import * as fixed_point64_1 from './deps/jitter_math/fixed_point64.js';
import * as fixed_point64_2 from './deps/jitter_math/fixed_point64.js';
import * as type_name_3 from './deps/std/type_name.js';
import * as type_name_4 from './deps/std/type_name.js';
import * as type_name_5 from './deps/std/type_name.js';
import * as fixed_point64_3 from './deps/jitter_math/fixed_point64.js';
import * as fixed_point64_4 from './deps/jitter_math/fixed_point64.js';
const $moduleName = 'jitter/jitter::market_state';
export const SettlementState = new MoveStruct({ name: `${$moduleName}::SettlementState`, fields: {
        is_settled: bcs.bool(),
        settled_py_index: bcs.u128()
    } });
export const PyIndexGuard = new MoveStruct({ name: `${$moduleName}::PyIndexGuard`, fields: {
        mode: bcs.u8(),
        max_step_growth_bps: bcs.u64(),
        max_window_growth_bps: bcs.u64(),
        window_ms: bcs.u64(),
        anchor_index_raw: bcs.u128(),
        anchor_timestamp_ms: bcs.u64()
    } });
export const RiskConfig = new MoveStruct({ name: `${$moduleName}::RiskConfig`, fields: {
        treasury: bcs.Address,
        interest_fee_rate: bcs.u128(),
        expiry_divisor: bcs.u64(),
        market_cap: bcs.u64(),
        asset_market_cap: bcs.u64(),
        py_index_guard: PyIndexGuard
    } });
export const RewardState = new MoveStruct({ name: `${$moduleName}::RewardState`, fields: {
        pool_reward_guard: bcs.u64(),
        yt_reward_guard: bcs.u64(),
        lp_reward_guard: bcs.u64()
    } });
export const CoinAuthority = new MoveStruct({ name: `${$moduleName}::CoinAuthority<phantom SY, phantom PT, phantom YT>`, fields: {
        sy_treasury: coin.TreasuryCap,
        pt_treasury: coin_1.TreasuryCap,
        yt_treasury: coin_2.TreasuryCap
    } });
export const MarketState = new MoveStruct({ name: `${$moduleName}::MarketState<phantom SY, phantom PT, phantom YT>`, fields: {
        id: bcs.Address,
        expiry: bcs.u64(),
        sy_type: type_name.TypeName,
        pt_type: type_name_1.TypeName,
        yt_type: type_name_2.TypeName,
        /**
         * Equal to this MarketState's own ID until an AdminCap binds the one canonical
         * PriceAggregator. No production aggregator can share that ID.
         */
        price_aggregator_id: bcs.Address,
        /**
         * Canonical market-scoped reward coordinator. A MarketState can bind this once;
         * individual reward programs are configured on that distributor.
         */
        reward_distributor_id: bcs.option(bcs.Address),
        coin_authority: CoinAuthority,
        pt_supply: bcs.u64(),
        yt_supply: bcs.u64(),
        py_sy_balance: balance.Balance,
        py_index_stored: bcs.u128(),
        py_index_last_updated: bcs.u64(),
        last_collect_interest_index: bcs.u128(),
        total_treasury_interest: bcs.u128(),
        last_interest_timestamp: bcs.u64(),
        global_interest_index: bcs.u128(),
        settlement: SettlementState,
        total_pt: bcs.u64(),
        pool_sy_balance: balance_1.Balance,
        reserve_fee_vault: balance_2.Balance,
        lp_supply: bcs.u64(),
        pool_status: bcs.u8(),
        pool_generation: bcs.u64(),
        last_ln_implied_rate: fixed_point64.FixedPoint64,
        scalar_root: fixed_point64_with_sign.FixedPoint64WithSign,
        initial_anchor: fixed_point64_with_sign_1.FixedPoint64WithSign,
        ln_fee_rate_root: fixed_point64_1.FixedPoint64,
        protocol_fee_rate: fixed_point64_2.FixedPoint64,
        /** Fractional protocol fee carried between swaps in FP64 numerator units. */
        protocol_fee_remainder_raw: bcs.u128(),
        risk: RiskConfig,
        rewards: RewardState
    } });
export const MarketStateCreatedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateCreatedEvent`, fields: {
        market_state_id: bcs.Address,
        expiry: bcs.u64(),
        sy_type: type_name_3.TypeName,
        pt_type: type_name_4.TypeName,
        yt_type: type_name_5.TypeName,
        created_by: bcs.Address
    } });
export const MarketStatePriceAggregatorBoundEvent = new MoveStruct({ name: `${$moduleName}::MarketStatePriceAggregatorBoundEvent`, fields: {
        market_state_id: bcs.Address,
        price_aggregator_id: bcs.Address
    } });
export const MarketStateMintPyEvent = new MoveStruct({ name: `${$moduleName}::MarketStateMintPyEvent`, fields: {
        market_state_id: bcs.Address,
        position_id: bcs.Address,
        sy_amount_in: bcs.u64(),
        pt_amount: bcs.u64(),
        yt_amount: bcs.u64(),
        expiry: bcs.u64()
    } });
export const MarketStateRedeemPyEvent = new MoveStruct({ name: `${$moduleName}::MarketStateRedeemPyEvent`, fields: {
        market_state_id: bcs.Address,
        position_id: bcs.Address,
        pt_amount: bcs.u64(),
        yt_amount: bcs.u64(),
        sy_amount_out: bcs.u64(),
        expiry: bcs.u64(),
        redeemer: bcs.Address
    } });
export const MarketStateInterestCollectedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateInterestCollectedEvent`, fields: {
        market_state_id: bcs.Address,
        user_interest_raw: bcs.u128(),
        treasury_interest_raw: bcs.u128(),
        py_index_raw: bcs.u128()
    } });
export const MarketStateSettledEvent = new MoveStruct({ name: `${$moduleName}::MarketStateSettledEvent`, fields: {
        market_state_id: bcs.Address,
        settled_py_index: bcs.u128(),
        treasury_interest_collected_raw: bcs.u128(),
        settled_at_ms: bcs.u64()
    } });
export const MarketStateInterestClaimedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateInterestClaimedEvent`, fields: {
        market_state_id: bcs.Address,
        position_id: bcs.Address,
        sy_amount: bcs.u64(),
        receiver: bcs.Address
    } });
export const MarketStateYtRedeemedAfterExpiryEvent = new MoveStruct({ name: `${$moduleName}::MarketStateYtRedeemedAfterExpiryEvent`, fields: {
        market_state_id: bcs.Address,
        position_id: bcs.Address,
        yt_amount: bcs.u64(),
        sy_interest_out: bcs.u64(),
        redeemer: bcs.Address
    } });
export const MarketStateAddLiquidityEvent = new MoveStruct({ name: `${$moduleName}::MarketStateAddLiquidityEvent`, fields: {
        market_state_id: bcs.Address,
        position_id: bcs.Address,
        sy_amount: bcs.u64(),
        pt_amount: bcs.u64(),
        lp_amount: bcs.u64(),
        sy_refund: bcs.u64(),
        pt_refund: bcs.u64()
    } });
export const MarketStateRemoveLiquidityEvent = new MoveStruct({ name: `${$moduleName}::MarketStateRemoveLiquidityEvent`, fields: {
        market_state_id: bcs.Address,
        position_id: bcs.Address,
        sy_amount: bcs.u64(),
        pt_amount: bcs.u64(),
        lp_amount: bcs.u64(),
        provider: bcs.Address
    } });
export const MarketStatePoolLifecycleEvent = new MoveStruct({ name: `${$moduleName}::MarketStatePoolLifecycleEvent`, fields: {
        market_state_id: bcs.Address,
        previous_status: bcs.u8(),
        new_status: bcs.u8(),
        pool_generation: bcs.u64(),
        actor: bcs.Address
    } });
export const MarketStateSwapEvent = new MoveStruct({ name: `${$moduleName}::MarketStateSwapEvent`, fields: {
        market_state_id: bcs.Address,
        is_pt_to_sy: bcs.bool(),
        amount_in: bcs.u64(),
        amount_out: bcs.u64(),
        fee: bcs.u64(),
        reserve_fee: bcs.u64(),
        trader: bcs.Address
    } });
export const MarketStateImpliedRateUpdatedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateImpliedRateUpdatedEvent`, fields: {
        market_state_id: bcs.Address,
        ln_implied_rate_raw: bcs.u128(),
        pt_price_raw: bcs.u128(),
        total_pt: bcs.u64(),
        total_sy: bcs.u64(),
        lp_supply: bcs.u64()
    } });
export const MarketStateRewardDistributorRequiredEvent = new MoveStruct({ name: `${$moduleName}::MarketStateRewardDistributorRequiredEvent`, fields: {
        market_state_id: bcs.Address,
        distributor_id: bcs.Address
    } });
export const MarketStateReserveFeeCollectedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateReserveFeeCollectedEvent`, fields: {
        market_state_id: bcs.Address,
        treasury: bcs.Address,
        amount: bcs.u64(),
        collector: bcs.Address
    } });
export const MarketStateTreasuryInterestCollectedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateTreasuryInterestCollectedEvent`, fields: {
        market_state_id: bcs.Address,
        treasury: bcs.Address,
        amount: bcs.u64(),
        dust_remainder_raw: bcs.u128(),
        collector: bcs.Address
    } });
export const MarketStateMarketCapUpdatedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateMarketCapUpdatedEvent`, fields: {
        market_state_id: bcs.Address,
        market_cap: bcs.u64(),
        actor: bcs.Address
    } });
export const MarketStateAssetMarketCapUpdatedEvent = new MoveStruct({ name: `${$moduleName}::MarketStateAssetMarketCapUpdatedEvent`, fields: {
        market_state_id: bcs.Address,
        asset_market_cap: bcs.u64(),
        sy_index_raw: bcs.u128(),
        actor: bcs.Address
    } });
export const TradeResult = new MoveStruct({ name: `${$moduleName}::TradeResult`, fields: {
        is_pt_to_sy: bcs.bool(),
        amount_in: bcs.u64(),
        amount_out: bcs.u64(),
        sy_amount: bcs.u64(),
        pt_amount: bcs.u64(),
        fee: bcs.u64(),
        reserve_fee: bcs.u64(),
        new_ln_implied_rate: fixed_point64_3.FixedPoint64,
        time_to_expiry_ms: bcs.u64()
    } });
export const BorrowPtReceipt = new MoveStruct({ name: `${$moduleName}::BorrowPtReceipt`, fields: {
        market_state_id: bcs.Address,
        pt_amount: bcs.u64()
    } });
export const BuyYtReceipt = new MoveStruct({ name: `${$moduleName}::BuyYtReceipt`, fields: {
        market_state_id: bcs.Address,
        pt_amount: bcs.u64(),
        sy_amount: bcs.u64(),
        fee: bcs.u64(),
        reserve_fee: bcs.u64(),
        new_ln_implied_rate: fixed_point64_4.FixedPoint64,
        time_to_expiry_ms: bcs.u64(),
        sy_index_raw: bcs.u128()
    } });
export const ExternalPtRedeemReceipt = new MoveStruct({ name: `${$moduleName}::ExternalPtRedeemReceipt`, fields: {
        market_state_id: bcs.Address,
        pt_amount: bcs.u64()
    } });
export const PoolRewardGateKey = new MoveTuple({ name: `${$moduleName}::PoolRewardGateKey`, fields: [bcs.bool()] });
export const YtRewardGateKey = new MoveTuple({ name: `${$moduleName}::YtRewardGateKey`, fields: [bcs.bool()] });
export const RewardPoolOperation = new MoveStruct({ name: `${$moduleName}::RewardPoolOperation`, fields: {
        market_state_id: bcs.Address,
        distributor_id: bcs.Address
    } });
export const YtRewardMutation = new MoveStruct({ name: `${$moduleName}::YtRewardMutation`, fields: {
        market_state_id: bcs.Address,
        distributor_id: bcs.Address
    } });
export const CoinAuthoritySnapshot = new MoveStruct({ name: `${$moduleName}::CoinAuthoritySnapshot`, fields: {
        sy_treasury_id: bcs.Address,
        pt_treasury_id: bcs.Address,
        yt_treasury_id: bcs.Address,
        sy_total_supply: bcs.u64(),
        pt_total_supply: bcs.u64(),
        yt_total_supply: bcs.u64()
    } });
export const MarketStateSnapshot = new MoveStruct({ name: `${$moduleName}::MarketStateSnapshot`, fields: {
        market_state_id: bcs.Address,
        expiry: bcs.u64(),
        price_aggregator_id: bcs.Address,
        reward_distributor_id: bcs.option(bcs.Address),
        coin_authority: CoinAuthoritySnapshot,
        pt_supply: bcs.u64(),
        yt_supply: bcs.u64(),
        py_sy_balance: bcs.u64(),
        py_index_stored: bcs.u128(),
        global_interest_index: bcs.u128(),
        total_treasury_interest_raw: bcs.u128(),
        is_settled: bcs.bool(),
        settled_py_index: bcs.u128(),
        total_pt: bcs.u64(),
        pool_sy_balance: bcs.u64(),
        reserve_fee_balance: bcs.u64(),
        protocol_fee_remainder_raw: bcs.u128(),
        lp_supply: bcs.u64(),
        pool_status: bcs.u8(),
        pool_generation: bcs.u64(),
        treasury: bcs.Address,
        interest_fee_rate: bcs.u128(),
        expiry_divisor: bcs.u64(),
        market_cap: bcs.u64(),
        asset_market_cap: bcs.u64(),
        py_index_guard: PyIndexGuard,
        yt_reward_guard: bcs.u64(),
        lp_reward_guard: bcs.u64(),
        pool_reward_guard: bcs.u64()
    } });
export interface CreateByAdminCapArguments {
    AdminCap: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    expiry: RawTransactionArgument<number | bigint>;
    interestFeeRate: RawTransactionArgument<number | bigint>;
    expiryDivisor: RawTransactionArgument<number | bigint>;
    treasury: RawTransactionArgument<string>;
    scalarRoot: RawTransactionArgument<string>;
    initialAnchor: RawTransactionArgument<string>;
    lnFeeRateRoot: RawTransactionArgument<string>;
    protocolFeeRate: RawTransactionArgument<string>;
    marketCap: RawTransactionArgument<number | bigint>;
    assetMarketCap: RawTransactionArgument<number | bigint>;
    syTreasury: RawTransactionArgument<string>;
    ptTreasury: RawTransactionArgument<string>;
    ytTreasury: RawTransactionArgument<string>;
}
export interface CreateByAdminCapOptions {
    package?: string;
    arguments: CreateByAdminCapArguments | [
        AdminCap: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        expiry: RawTransactionArgument<number | bigint>,
        interestFeeRate: RawTransactionArgument<number | bigint>,
        expiryDivisor: RawTransactionArgument<number | bigint>,
        treasury: RawTransactionArgument<string>,
        scalarRoot: RawTransactionArgument<string>,
        initialAnchor: RawTransactionArgument<string>,
        lnFeeRateRoot: RawTransactionArgument<string>,
        protocolFeeRate: RawTransactionArgument<string>,
        marketCap: RawTransactionArgument<number | bigint>,
        assetMarketCap: RawTransactionArgument<number | bigint>,
        syTreasury: RawTransactionArgument<string>,
        ptTreasury: RawTransactionArgument<string>,
        ytTreasury: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function createByAdminCap(options: CreateByAdminCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64',
        'u128',
        'u64',
        'address',
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["AdminCap", "globalConfig", "expiry", "interestFeeRate", "expiryDivisor", "treasury", "scalarRoot", "initialAnchor", "lnFeeRateRoot", "protocolFeeRate", "marketCap", "assetMarketCap", "syTreasury", "ptTreasury", "ytTreasury"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'create_by_admin_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BindPriceAggregatorByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    priceAggregator: RawTransactionArgument<string>;
}
export interface BindPriceAggregatorByAdminOptions {
    package?: string;
    arguments: BindPriceAggregatorByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        priceAggregator: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * One-time binding between a market and its canonical oracle aggregator.
 *
 * The aggregator itself proves both its SY type and market ID. V1 exposes no
 * replacement path; changing this trust root requires an explicit upgrade.
 */
export function bindPriceAggregatorByAdmin(options: BindPriceAggregatorByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "AdminCap", "priceAggregator"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'bind_price_aggregator_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CreateRewardDistributorByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CreateRewardDistributorByAdminOptions {
    package?: string;
    arguments: CreateRewardDistributorByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/** Create, bind, and share the only RewardDistributor for this market. */
export function createRewardDistributorByAdmin(options: CreateRewardDistributorByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'create_reward_distributor_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CollectReserveFeesByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CollectReserveFeesByAdminOptions {
    package?: string;
    arguments: CollectReserveFeesByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Transfer all accumulated AMM reserve fees to the configured treasury.
 *
 * Only an AdminCap holder may trigger collection. The caller cannot select or
 * receive the destination coin.
 */
export function collectReserveFeesByAdmin(options: CollectReserveFeesByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'collect_reserve_fees_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CollectTreasuryInterestByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfoOpt: RawTransactionArgument<string | null>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CollectTreasuryInterestByAdminOptions {
    package?: string;
    arguments: CollectTreasuryInterestByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfoOpt: RawTransactionArgument<string | null>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Checkpoint and transfer pending interest fees to the configured treasury.
 *
 * Before expiry, `price_info_opt` must contain a fresh price for this MarketState.
 * Once the market is settled, callers pass `none` and collection uses the
 * immutable settlement index.
 */
export function collectTreasuryInterestByAdmin(options: CollectTreasuryInterestByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        '0x1::option::Option<null>',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "priceInfoOpt", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'collect_treasury_interest_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CollectTreasuryInterestByAclArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfoOpt: RawTransactionArgument<string | null>;
    acl: RawTransactionArgument<string>;
}
export interface CollectTreasuryInterestByAclOptions {
    package?: string;
    arguments: CollectTreasuryInterestByAclArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfoOpt: RawTransactionArgument<string | null>,
        acl: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * ACL equivalent of `collect_treasury_interest_by_admin`.
 *
 * The collected coin is always transferred to the configured treasury; the
 * operator role does not grant authority to redirect protocol revenue.
 */
export function collectTreasuryInterestByAcl(options: CollectTreasuryInterestByAclOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        '0x1::option::Option<null>',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "priceInfoOpt", "acl"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'collect_treasury_interest_by_acl',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMarketCapByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    marketCap: RawTransactionArgument<number | bigint>;
    AdminCap: RawTransactionArgument<string>;
}
export interface SetMarketCapByAdminOptions {
    package?: string;
    arguments: SetMarketCapByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        marketCap: RawTransactionArgument<number | bigint>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setMarketCapByAdmin(options: SetMarketCapByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "marketCap", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'set_market_cap_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetAssetMarketCapByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    assetMarketCap: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    AdminCap: RawTransactionArgument<string>;
}
export interface SetAssetMarketCapByAdminOptions {
    package?: string;
    arguments: SetAssetMarketCapByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        assetMarketCap: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setAssetMarketCapByAdmin(options: SetAssetMarketCapByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64',
        'u128',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "assetMarketCap", "syIndexRaw", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'set_asset_market_cap_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface IdArguments {
    state: RawTransactionArgument<string>;
}
export interface IdOptions {
    package?: string;
    arguments: IdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function id(options: IdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ExpiryArguments {
    state: RawTransactionArgument<string>;
}
export interface ExpiryOptions {
    package?: string;
    arguments: ExpiryArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function expiry(options: ExpiryOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'expiry',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PriceAggregatorIdArguments {
    state: RawTransactionArgument<string>;
}
export interface PriceAggregatorIdOptions {
    package?: string;
    arguments: PriceAggregatorIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function priceAggregatorId(options: PriceAggregatorIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'price_aggregator_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyTypeNameArguments {
    state: RawTransactionArgument<string>;
}
export interface SyTypeNameOptions {
    package?: string;
    arguments: SyTypeNameArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function syTypeName(options: SyTypeNameOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'sy_type_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PtTypeNameArguments {
    state: RawTransactionArgument<string>;
}
export interface PtTypeNameOptions {
    package?: string;
    arguments: PtTypeNameArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ptTypeName(options: PtTypeNameOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pt_type_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtTypeNameArguments {
    state: RawTransactionArgument<string>;
}
export interface YtTypeNameOptions {
    package?: string;
    arguments: YtTypeNameArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ytTypeName(options: YtTypeNameOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'yt_type_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BurnPtInArguments {
    ptCoin: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface BurnPtInOptions {
    package?: string;
    arguments: BurnPtInArguments | [
        ptCoin: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function burnPtIn(options: BurnPtInOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["ptCoin", "position", "globalConfig", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'burn_pt_in',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RedeemPtOutArguments {
    amount: RawTransactionArgument<number | bigint>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface RedeemPtOutOptions {
    package?: string;
    arguments: RedeemPtOutArguments | [
        amount: RawTransactionArgument<number | bigint>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function redeemPtOut(options: RedeemPtOutOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["amount", "position", "globalConfig", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'redeem_pt_out',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyTreasuryIdArguments {
    state: RawTransactionArgument<string>;
}
export interface SyTreasuryIdOptions {
    package?: string;
    arguments: SyTreasuryIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function syTreasuryId(options: SyTreasuryIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'sy_treasury_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PtTreasuryIdArguments {
    state: RawTransactionArgument<string>;
}
export interface PtTreasuryIdOptions {
    package?: string;
    arguments: PtTreasuryIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ptTreasuryId(options: PtTreasuryIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pt_treasury_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtTreasuryIdArguments {
    state: RawTransactionArgument<string>;
}
export interface YtTreasuryIdOptions {
    package?: string;
    arguments: YtTreasuryIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ytTreasuryId(options: YtTreasuryIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'yt_treasury_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RewardDistributorRequiredArguments {
    state: RawTransactionArgument<string>;
}
export interface RewardDistributorRequiredOptions {
    package?: string;
    arguments: RewardDistributorRequiredArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function rewardDistributorRequired(options: RewardDistributorRequiredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'reward_distributor_required',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RewardDistributorIdArguments {
    state: RawTransactionArgument<string>;
}
export interface RewardDistributorIdOptions {
    package?: string;
    arguments: RewardDistributorIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function rewardDistributorId(options: RewardDistributorIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'reward_distributor_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PoolRewardGateOpenArguments {
    state: RawTransactionArgument<string>;
}
export interface PoolRewardGateOpenOptions {
    package?: string;
    arguments: PoolRewardGateOpenArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function poolRewardGateOpen(options: PoolRewardGateOpenOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_reward_gate_open',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtRewardGateOpenArguments {
    state: RawTransactionArgument<string>;
}
export interface YtRewardGateOpenOptions {
    package?: string;
    arguments: YtRewardGateOpenArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ytRewardGateOpen(options: YtRewardGateOpenOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'yt_reward_gate_open',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PoolRewardGuardArguments {
    state: RawTransactionArgument<string>;
}
export interface PoolRewardGuardOptions {
    package?: string;
    arguments: PoolRewardGuardArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function poolRewardGuard(options: PoolRewardGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_reward_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtRewardGuardArguments {
    state: RawTransactionArgument<string>;
}
export interface YtRewardGuardOptions {
    package?: string;
    arguments: YtRewardGuardArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ytRewardGuard(options: YtRewardGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'yt_reward_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpRewardGuardArguments {
    state: RawTransactionArgument<string>;
}
export interface LpRewardGuardOptions {
    package?: string;
    arguments: LpRewardGuardArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function lpRewardGuard(options: LpRewardGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'lp_reward_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface IsSettledArguments {
    state: RawTransactionArgument<string>;
}
export interface IsSettledOptions {
    package?: string;
    arguments: IsSettledArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function isSettled(options: IsSettledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'is_settled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettledPyIndexArguments {
    state: RawTransactionArgument<string>;
}
export interface SettledPyIndexOptions {
    package?: string;
    arguments: SettledPyIndexArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function settledPyIndex(options: SettledPyIndexOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'settled_py_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SnapshotArguments {
    state: RawTransactionArgument<string>;
}
export interface SnapshotOptions {
    package?: string;
    arguments: SnapshotArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function snapshot(options: SnapshotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SnapshotMarketStateIdArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotMarketStateIdOptions {
    package?: string;
    arguments: SnapshotMarketStateIdArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotMarketStateId(options: SnapshotMarketStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_market_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotExpiryArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotExpiryOptions {
    package?: string;
    arguments: SnapshotExpiryArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotExpiry(options: SnapshotExpiryOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_expiry',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPriceAggregatorIdArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPriceAggregatorIdOptions {
    package?: string;
    arguments: SnapshotPriceAggregatorIdArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPriceAggregatorId(options: SnapshotPriceAggregatorIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_price_aggregator_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotRewardDistributorIdArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotRewardDistributorIdOptions {
    package?: string;
    arguments: SnapshotRewardDistributorIdArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotRewardDistributorId(options: SnapshotRewardDistributorIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_reward_distributor_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotSyTreasuryIdArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotSyTreasuryIdOptions {
    package?: string;
    arguments: SnapshotSyTreasuryIdArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotSyTreasuryId(options: SnapshotSyTreasuryIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_sy_treasury_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotSyTotalSupplyArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotSyTotalSupplyOptions {
    package?: string;
    arguments: SnapshotSyTotalSupplyArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotSyTotalSupply(options: SnapshotSyTotalSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_sy_total_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPtTreasuryIdArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPtTreasuryIdOptions {
    package?: string;
    arguments: SnapshotPtTreasuryIdArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPtTreasuryId(options: SnapshotPtTreasuryIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pt_treasury_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPtTotalSupplyArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPtTotalSupplyOptions {
    package?: string;
    arguments: SnapshotPtTotalSupplyArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPtTotalSupply(options: SnapshotPtTotalSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pt_total_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotYtTreasuryIdArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotYtTreasuryIdOptions {
    package?: string;
    arguments: SnapshotYtTreasuryIdArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotYtTreasuryId(options: SnapshotYtTreasuryIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_yt_treasury_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotYtTotalSupplyArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotYtTotalSupplyOptions {
    package?: string;
    arguments: SnapshotYtTotalSupplyArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotYtTotalSupply(options: SnapshotYtTotalSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_yt_total_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPtSupplyArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPtSupplyOptions {
    package?: string;
    arguments: SnapshotPtSupplyArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPtSupply(options: SnapshotPtSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pt_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotYtSupplyArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotYtSupplyOptions {
    package?: string;
    arguments: SnapshotYtSupplyArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotYtSupply(options: SnapshotYtSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_yt_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPySyBalanceArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPySyBalanceOptions {
    package?: string;
    arguments: SnapshotPySyBalanceArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPySyBalance(options: SnapshotPySyBalanceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_py_sy_balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPyIndexStoredArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPyIndexStoredOptions {
    package?: string;
    arguments: SnapshotPyIndexStoredArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPyIndexStored(options: SnapshotPyIndexStoredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_py_index_stored',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotGlobalInterestIndexArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotGlobalInterestIndexOptions {
    package?: string;
    arguments: SnapshotGlobalInterestIndexArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotGlobalInterestIndex(options: SnapshotGlobalInterestIndexOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_global_interest_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotTotalTreasuryInterestRawArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotTotalTreasuryInterestRawOptions {
    package?: string;
    arguments: SnapshotTotalTreasuryInterestRawArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotTotalTreasuryInterestRaw(options: SnapshotTotalTreasuryInterestRawOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_total_treasury_interest_raw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotIsSettledArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotIsSettledOptions {
    package?: string;
    arguments: SnapshotIsSettledArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotIsSettled(options: SnapshotIsSettledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_is_settled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotSettledPyIndexArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotSettledPyIndexOptions {
    package?: string;
    arguments: SnapshotSettledPyIndexArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotSettledPyIndex(options: SnapshotSettledPyIndexOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_settled_py_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPoolSyBalanceArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPoolSyBalanceOptions {
    package?: string;
    arguments: SnapshotPoolSyBalanceArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPoolSyBalance(options: SnapshotPoolSyBalanceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pool_sy_balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotTotalPtArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotTotalPtOptions {
    package?: string;
    arguments: SnapshotTotalPtArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotTotalPt(options: SnapshotTotalPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_total_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotReserveFeeBalanceArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotReserveFeeBalanceOptions {
    package?: string;
    arguments: SnapshotReserveFeeBalanceArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotReserveFeeBalance(options: SnapshotReserveFeeBalanceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_reserve_fee_balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotProtocolFeeRemainderRawArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotProtocolFeeRemainderRawOptions {
    package?: string;
    arguments: SnapshotProtocolFeeRemainderRawArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotProtocolFeeRemainderRaw(options: SnapshotProtocolFeeRemainderRawOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_protocol_fee_remainder_raw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotLpSupplyArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotLpSupplyOptions {
    package?: string;
    arguments: SnapshotLpSupplyArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotLpSupply(options: SnapshotLpSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_lp_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPoolStatusArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPoolStatusOptions {
    package?: string;
    arguments: SnapshotPoolStatusArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPoolStatus(options: SnapshotPoolStatusOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pool_status',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPoolGenerationArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPoolGenerationOptions {
    package?: string;
    arguments: SnapshotPoolGenerationArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPoolGeneration(options: SnapshotPoolGenerationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pool_generation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotTreasuryArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotTreasuryOptions {
    package?: string;
    arguments: SnapshotTreasuryArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotTreasury(options: SnapshotTreasuryOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_treasury',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotInterestFeeRateArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotInterestFeeRateOptions {
    package?: string;
    arguments: SnapshotInterestFeeRateArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotInterestFeeRate(options: SnapshotInterestFeeRateOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_interest_fee_rate',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotExpiryDivisorArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotExpiryDivisorOptions {
    package?: string;
    arguments: SnapshotExpiryDivisorArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotExpiryDivisor(options: SnapshotExpiryDivisorOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_expiry_divisor',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotMarketCapArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotMarketCapOptions {
    package?: string;
    arguments: SnapshotMarketCapArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotMarketCap(options: SnapshotMarketCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_market_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotAssetMarketCapArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotAssetMarketCapOptions {
    package?: string;
    arguments: SnapshotAssetMarketCapArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotAssetMarketCap(options: SnapshotAssetMarketCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_asset_market_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPyIndexGuardArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPyIndexGuardOptions {
    package?: string;
    arguments: SnapshotPyIndexGuardArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPyIndexGuard(options: SnapshotPyIndexGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_py_index_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PyIndexGuardModeArguments {
    guard: RawTransactionArgument<string>;
}
export interface PyIndexGuardModeOptions {
    package?: string;
    arguments: PyIndexGuardModeArguments | [
        guard: RawTransactionArgument<string>
    ];
}
export function pyIndexGuardMode(options: PyIndexGuardModeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'py_index_guard_mode',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PyIndexGuardMaxStepGrowthBpsArguments {
    guard: RawTransactionArgument<string>;
}
export interface PyIndexGuardMaxStepGrowthBpsOptions {
    package?: string;
    arguments: PyIndexGuardMaxStepGrowthBpsArguments | [
        guard: RawTransactionArgument<string>
    ];
}
export function pyIndexGuardMaxStepGrowthBps(options: PyIndexGuardMaxStepGrowthBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'py_index_guard_max_step_growth_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PyIndexGuardMaxWindowGrowthBpsArguments {
    guard: RawTransactionArgument<string>;
}
export interface PyIndexGuardMaxWindowGrowthBpsOptions {
    package?: string;
    arguments: PyIndexGuardMaxWindowGrowthBpsArguments | [
        guard: RawTransactionArgument<string>
    ];
}
export function pyIndexGuardMaxWindowGrowthBps(options: PyIndexGuardMaxWindowGrowthBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'py_index_guard_max_window_growth_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PyIndexGuardWindowMsArguments {
    guard: RawTransactionArgument<string>;
}
export interface PyIndexGuardWindowMsOptions {
    package?: string;
    arguments: PyIndexGuardWindowMsArguments | [
        guard: RawTransactionArgument<string>
    ];
}
export function pyIndexGuardWindowMs(options: PyIndexGuardWindowMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'py_index_guard_window_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PyIndexGuardAnchorIndexRawArguments {
    guard: RawTransactionArgument<string>;
}
export interface PyIndexGuardAnchorIndexRawOptions {
    package?: string;
    arguments: PyIndexGuardAnchorIndexRawArguments | [
        guard: RawTransactionArgument<string>
    ];
}
export function pyIndexGuardAnchorIndexRaw(options: PyIndexGuardAnchorIndexRawOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'py_index_guard_anchor_index_raw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PyIndexGuardAnchorTimestampMsArguments {
    guard: RawTransactionArgument<string>;
}
export interface PyIndexGuardAnchorTimestampMsOptions {
    package?: string;
    arguments: PyIndexGuardAnchorTimestampMsArguments | [
        guard: RawTransactionArgument<string>
    ];
}
export function pyIndexGuardAnchorTimestampMs(options: PyIndexGuardAnchorTimestampMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'py_index_guard_anchor_timestamp_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotYtRewardGuardArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotYtRewardGuardOptions {
    package?: string;
    arguments: SnapshotYtRewardGuardArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotYtRewardGuard(options: SnapshotYtRewardGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_yt_reward_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotLpRewardGuardArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotLpRewardGuardOptions {
    package?: string;
    arguments: SnapshotLpRewardGuardArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotLpRewardGuard(options: SnapshotLpRewardGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_lp_reward_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SnapshotPoolRewardGuardArguments {
    snapshot: RawTransactionArgument<string>;
}
export interface SnapshotPoolRewardGuardOptions {
    package?: string;
    arguments: SnapshotPoolRewardGuardArguments | [
        snapshot: RawTransactionArgument<string>
    ];
}
export function snapshotPoolRewardGuard(options: SnapshotPoolRewardGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["snapshot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'snapshot_pool_reward_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CalcPyAmountForSyArguments {
    syAmount: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface CalcPyAmountForSyOptions {
    package?: string;
    arguments: CalcPyAmountForSyArguments | [
        syAmount: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function calcPyAmountForSy(options: CalcPyAmountForSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        'u128',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["syAmount", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'calc_py_amount_for_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CalcSyAmountForPyArguments {
    pyAmount: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface CalcSyAmountForPyOptions {
    package?: string;
    arguments: CalcSyAmountForPyArguments | [
        pyAmount: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function calcSyAmountForPy(options: CalcSyAmountForPyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        'u128',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["pyAmount", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'calc_sy_amount_for_py',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuotePyMintArguments {
    minPyOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface QuotePyMintOptions {
    package?: string;
    arguments: QuotePyMintArguments | [
        minPyOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Returns the minimum whole-SY input and the corresponding representable PY output
 * that satisfies `min_py_out`.
 */
export function quotePyMint(options: QuotePyMintOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        'u128',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["minPyOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_py_mint',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CurrentPyIndexRawArguments {
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface CurrentPyIndexRawOptions {
    package?: string;
    arguments: CurrentPyIndexRawArguments | [
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function currentPyIndexRaw(options: CurrentPyIndexRawOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u128',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'current_py_index_raw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SpotPtPriceInSyArguments {
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface SpotPtPriceInSyOptions {
    package?: string;
    arguments: SpotPtPriceInSyArguments | [
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function spotPtPriceInSy(options: SpotPtPriceInSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'spot_pt_price_in_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteExactPtForSyArguments {
    ptIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteExactPtForSyOptions {
    package?: string;
    arguments: QuoteExactPtForSyArguments | [
        ptIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function quoteExactPtForSy(options: QuoteExactPtForSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["ptIn", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_exact_pt_for_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteRemoveLiquidityToSyArguments {
    lpAmountValue: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteRemoveLiquidityToSyOptions {
    package?: string;
    arguments: QuoteRemoveLiquidityToSyArguments | [
        lpAmountValue: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Quote a single-asset LP exit against the state that will exist after the
 * proportional liquidity removal.
 *
 * Returns `(route, sy_out, pt_out, converted_sy_out, total_sy_out, fee)`. Only
 * `ACTIVE_SWAP`, `SETTLED_REDEEM`, and `DIRECT_SY` are executable Zap routes. The
 * remaining route values require the caller to keep the raw `(SY, PT)` output
 * instead.
 */
export function quoteRemoveLiquidityToSy(options: QuoteRemoveLiquidityToSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["lpAmountValue", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_remove_liquidity_to_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuotePtForExactSyArguments {
    syOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuotePtForExactSyOptions {
    package?: string;
    arguments: QuotePtForExactSyArguments | [
        syOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function quotePtForExactSy(options: QuotePtForExactSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["syOut", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_pt_for_exact_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteSyForExactPtArguments {
    ptOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteSyForExactPtOptions {
    package?: string;
    arguments: QuoteSyForExactPtArguments | [
        ptOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function quoteSyForExactPt(options: QuoteSyForExactPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["ptOut", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_sy_for_exact_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteSyForExactYtArguments {
    minYtOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteSyForExactYtOptions {
    package?: string;
    arguments: QuoteSyForExactYtArguments | [
        minYtOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Returns the representable YT output, SY required for PY minting, SY advanced by
 * the pool for the matching PT sale, and the user's net SY cost.
 */
export function quoteSyForExactYt(options: QuoteSyForExactYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["minYtOut", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_sy_for_exact_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteExactSyForYtArguments {
    syIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteExactSyForYtOptions {
    package?: string;
    arguments: QuoteExactSyForYtArguments | [
        syIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Returns the maximum representable YT output whose net SY cost does not exceed
 * `sy_in`. The search is exact to one raw YT unit.
 */
export function quoteExactSyForYt(options: QuoteExactSyForYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["syIn", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_exact_sy_for_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteYtForExactSyArguments {
    syOut: RawTransactionArgument<number | bigint>;
    maxYtIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteYtForExactSyOptions {
    package?: string;
    arguments: QuoteYtForExactSyArguments | [
        syOut: RawTransactionArgument<number | bigint>,
        maxYtIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Returns the minimum YT input that produces at least `sy_out` net SY, bounded by
 * `max_yt_in`. The remaining values are the gross PY redemption, the SY required
 * to buy back the borrowed PT, and the resulting net SY.
 *
 * The resulting net SY can exceed `sy_out` by a small discrete-unit surplus.
 * Execution routes split that surplus from the exact requested output.
 */
export function quoteYtForExactSy(options: QuoteYtForExactSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["syOut", "maxYtIn", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_yt_for_exact_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TotalPoolSyArguments {
    state: RawTransactionArgument<string>;
}
export interface TotalPoolSyOptions {
    package?: string;
    arguments: TotalPoolSyArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function totalPoolSy(options: TotalPoolSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'total_pool_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TotalPoolPtArguments {
    state: RawTransactionArgument<string>;
}
export interface TotalPoolPtOptions {
    package?: string;
    arguments: TotalPoolPtArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function totalPoolPt(options: TotalPoolPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'total_pool_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpSupplyArguments {
    state: RawTransactionArgument<string>;
}
export interface LpSupplyOptions {
    package?: string;
    arguments: LpSupplyArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function lpSupply(options: LpSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'lp_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PoolStatusArguments {
    state: RawTransactionArgument<string>;
}
export interface PoolStatusOptions {
    package?: string;
    arguments: PoolStatusArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function poolStatus(options: PoolStatusOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_status',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PoolGenerationArguments {
    state: RawTransactionArgument<string>;
}
export interface PoolGenerationOptions {
    package?: string;
    arguments: PoolGenerationArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function poolGeneration(options: PoolGenerationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_generation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PoolUninitializedOptions {
    package?: string;
    arguments?: [
    ];
}
export function poolUninitialized(options: PoolUninitializedOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_uninitialized',
    });
}
export interface PoolActiveOptions {
    package?: string;
    arguments?: [
    ];
}
export function poolActive(options: PoolActiveOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_active',
    });
}
export interface PoolEmptyOptions {
    package?: string;
    arguments?: [
    ];
}
export function poolEmpty(options: PoolEmptyOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'pool_empty',
    });
}
export interface IsPoolActiveArguments {
    state: RawTransactionArgument<string>;
}
export interface IsPoolActiveOptions {
    package?: string;
    arguments: IsPoolActiveArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function isPoolActive(options: IsPoolActiveOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'is_pool_active',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CirculatingLpSupplyArguments {
    state: RawTransactionArgument<string>;
}
export interface CirculatingLpSupplyOptions {
    package?: string;
    arguments: CirculatingLpSupplyArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/** All minted LP belongs to positions. C2 has no permanently locked supply. */
export function circulatingLpSupply(options: CirculatingLpSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'circulating_lp_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtSupplyArguments {
    state: RawTransactionArgument<string>;
}
export interface YtSupplyOptions {
    package?: string;
    arguments: YtSupplyArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function ytSupply(options: YtSupplyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'yt_supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface QuoteExactSyForPtArguments {
    syIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface QuoteExactSyForPtOptions {
    package?: string;
    arguments: QuoteExactSyForPtArguments | [
        syIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function quoteExactSyForPt(options: QuoteExactSyForPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["syIn", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_state',
        function: 'quote_exact_sy_for_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}