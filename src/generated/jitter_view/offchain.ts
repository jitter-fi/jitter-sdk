/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * offchain - read-only helpers for frontends, SDKs, and PTB simulation.
 *
 * `jitter_view` is intentionally replaceable. It provides MarketState-first
 * snapshots, quote previews, and guardrail helpers without adding more surface
 * area to the core protocol package.
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter-view::offchain';
export const PauseSnapshot = new MoveStruct({ name: `${$moduleName}::PauseSnapshot`, fields: {
        global_paused: bcs.bool(),
        view_package_paused: bcs.bool(),
        core_package_paused: bcs.bool(),
        domain_paused: bcs.bool(),
        target_paused: bcs.bool(),
        paused: bcs.bool()
    } });
export const RewardSnapshot = new MoveStruct({ name: `${$moduleName}::RewardSnapshot`, fields: {
        distributor_required: bcs.bool(),
        distributor_id: bcs.Address,
        pool_gate_open: bcs.bool(),
        yt_gate_open: bcs.bool(),
        yt_guard: bcs.u64(),
        lp_guard: bcs.u64(),
        pool_guard: bcs.u64()
    } });
export const MarketStateViewSnapshot = new MoveStruct({ name: `${$moduleName}::MarketStateViewSnapshot`, fields: {
        market_state_id: bcs.Address,
        pause: PauseSnapshot,
        expiry: bcs.u64(),
        sy_treasury_id: bcs.Address,
        pt_treasury_id: bcs.Address,
        yt_treasury_id: bcs.Address,
        sy_total_supply: bcs.u64(),
        pt_total_supply: bcs.u64(),
        yt_total_supply: bcs.u64(),
        pt_supply: bcs.u64(),
        yt_supply: bcs.u64(),
        py_sy_balance: bcs.u64(),
        py_index_stored: bcs.u128(),
        global_interest_index: bcs.u128(),
        is_settled: bcs.bool(),
        settled_py_index: bcs.u128(),
        total_pt: bcs.u64(),
        pool_sy_balance: bcs.u64(),
        reserve_fee_balance: bcs.u64(),
        lp_supply: bcs.u64(),
        treasury: bcs.Address,
        interest_fee_rate: bcs.u128(),
        expiry_divisor: bcs.u64(),
        market_cap: bcs.u64(),
        asset_market_cap: bcs.u64(),
        asset_exposure: bcs.u64(),
        reward: RewardSnapshot,
        expired: bcs.bool()
    } });
export const PositionSnapshot = new MoveStruct({ name: `${$moduleName}::PositionSnapshot`, fields: {
        position_id: bcs.Address,
        pause: PauseSnapshot,
        market_state_id: bcs.Address,
        expiry: bcs.u64(),
        created_at: bcs.u64(),
        pt_balance: bcs.u64(),
        yt_balance: bcs.u64(),
        yt_reward_guard: bcs.u64(),
        index: bcs.u128(),
        py_index: bcs.u128(),
        accrued: bcs.u128(),
        is_py_empty: bcs.bool(),
        pool_id: bcs.Address,
        lp_amount: bcs.u64(),
        lp_reward_guard: bcs.u64(),
        is_lp_empty: bcs.bool()
    } });
export const RewardDistributorSnapshot = new MoveStruct({ name: `${$moduleName}::RewardDistributorSnapshot`, fields: {
        distributor_id: bcs.Address,
        pause: PauseSnapshot,
        enabled: bcs.bool(),
        config_version: bcs.u64(),
        yt_rewarder_count: bcs.u64(),
        lp_rewarder_count: bcs.u64(),
        pool_rewarder_count: bcs.u64()
    } });
export interface MarketStateSnapshotArguments {
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface MarketStateSnapshotOptions {
    package?: string;
    arguments: MarketStateSnapshotArguments | [
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function marketStateSnapshot(options: MarketStateSnapshotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'market_state_snapshot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PositionSnapshotArguments {
    globalConfig: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface PositionSnapshotOptions {
    package?: string;
    arguments: PositionSnapshotArguments | [
        globalConfig: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
}
export function positionSnapshot(options: PositionSnapshotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'position_snapshot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RewardDistributorSnapshotArguments {
    globalConfig: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
}
export interface RewardDistributorSnapshotOptions {
    package?: string;
    arguments: RewardDistributorSnapshotArguments | [
        globalConfig: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>
    ];
}
export function rewardDistributorSnapshot(options: RewardDistributorSnapshotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "distributor"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'reward_distributor_snapshot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EstimateMarketStatePtPriceArguments {
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
}
export interface EstimateMarketStatePtPriceOptions {
    package?: string;
    arguments: EstimateMarketStatePtPriceArguments | [
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStatePtPrice(options: EstimateMarketStatePtPriceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        null,
        'u128',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "state", "syIndexRaw"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_pt_price',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateYtPriceArguments {
    globalConfig: RawTransactionArgument<string>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateYtPriceOptions {
    package?: string;
    arguments: EstimateMarketStateYtPriceArguments | [
        globalConfig: RawTransactionArgument<string>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateYtPrice(options: EstimateMarketStateYtPriceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_yt_price',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForPtArguments {
    globalConfig: RawTransactionArgument<string>;
    syIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForPtOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForPtArguments | [
        globalConfig: RawTransactionArgument<string>,
        syIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForPt(options: EstimateMarketStateSwapSyForPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForPtSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    syIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForPtSlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForPtSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        syIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForPtSlippageBps(options: EstimateMarketStateSwapSyForPtSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_pt_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapPtForSyArguments {
    globalConfig: RawTransactionArgument<string>;
    ptIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapPtForSyOptions {
    package?: string;
    arguments: EstimateMarketStateSwapPtForSyArguments | [
        globalConfig: RawTransactionArgument<string>,
        ptIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapPtForSy(options: EstimateMarketStateSwapPtForSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ptIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_pt_for_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapPtForSySlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    ptIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapPtForSySlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapPtForSySlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        ptIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapPtForSySlippageBps(options: EstimateMarketStateSwapPtForSySlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ptIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_pt_for_sy_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForExactPtArguments {
    globalConfig: RawTransactionArgument<string>;
    ptOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForExactPtOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForExactPtArguments | [
        globalConfig: RawTransactionArgument<string>,
        ptOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForExactPt(options: EstimateMarketStateSwapSyForExactPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ptOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_exact_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForExactPtSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    ptOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForExactPtSlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForExactPtSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        ptOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForExactPtSlippageBps(options: EstimateMarketStateSwapSyForExactPtSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ptOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_exact_pt_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapPtForExactSyArguments {
    globalConfig: RawTransactionArgument<string>;
    syOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapPtForExactSyOptions {
    package?: string;
    arguments: EstimateMarketStateSwapPtForExactSyArguments | [
        globalConfig: RawTransactionArgument<string>,
        syOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapPtForExactSy(options: EstimateMarketStateSwapPtForExactSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_pt_for_exact_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapPtForExactSySlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    syOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapPtForExactSySlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapPtForExactSySlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        syOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapPtForExactSySlippageBps(options: EstimateMarketStateSwapPtForExactSySlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_pt_for_exact_sy_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForYtArguments {
    globalConfig: RawTransactionArgument<string>;
    syIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForYtOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForYtArguments | [
        globalConfig: RawTransactionArgument<string>,
        syIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForYt(options: EstimateMarketStateSwapSyForYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForYtSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    syIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForYtSlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForYtSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        syIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForYtSlippageBps(options: EstimateMarketStateSwapSyForYtSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_yt_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForExactYtArguments {
    globalConfig: RawTransactionArgument<string>;
    minYtOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForExactYtOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForExactYtArguments | [
        globalConfig: RawTransactionArgument<string>,
        minYtOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForExactYt(options: EstimateMarketStateSwapSyForExactYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "minYtOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_exact_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapSyForExactYtSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    ytOut: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapSyForExactYtSlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapSyForExactYtSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        ytOut: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapSyForExactYtSlippageBps(options: EstimateMarketStateSwapSyForExactYtSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ytOut", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_sy_for_exact_yt_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapYtForSyArguments {
    globalConfig: RawTransactionArgument<string>;
    ytIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapYtForSyOptions {
    package?: string;
    arguments: EstimateMarketStateSwapYtForSyArguments | [
        globalConfig: RawTransactionArgument<string>,
        ytIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapYtForSy(options: EstimateMarketStateSwapYtForSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ytIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_yt_for_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapYtForSySlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    ytIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapYtForSySlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapYtForSySlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        ytIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapYtForSySlippageBps(options: EstimateMarketStateSwapYtForSySlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "ytIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_yt_for_sy_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapYtForExactSyArguments {
    globalConfig: RawTransactionArgument<string>;
    syOut: RawTransactionArgument<number | bigint>;
    maxYtIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapYtForExactSyOptions {
    package?: string;
    arguments: EstimateMarketStateSwapYtForExactSyArguments | [
        globalConfig: RawTransactionArgument<string>,
        syOut: RawTransactionArgument<number | bigint>,
        maxYtIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapYtForExactSy(options: EstimateMarketStateSwapYtForExactSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syOut", "maxYtIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_yt_for_exact_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateSwapYtForExactSySlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    syOut: RawTransactionArgument<number | bigint>;
    maxYtIn: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateSwapYtForExactSySlippageBpsOptions {
    package?: string;
    arguments: EstimateMarketStateSwapYtForExactSySlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        syOut: RawTransactionArgument<number | bigint>,
        maxYtIn: RawTransactionArgument<number | bigint>,
        syIndexRaw: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateSwapYtForExactSySlippageBps(options: EstimateMarketStateSwapYtForExactSySlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "syOut", "maxYtIn", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_swap_yt_for_exact_sy_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateLpValueArguments {
    globalConfig: RawTransactionArgument<string>;
    lpAmount: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateLpValueOptions {
    package?: string;
    arguments: EstimateMarketStateLpValueArguments | [
        globalConfig: RawTransactionArgument<string>,
        lpAmount: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateLpValue(options: EstimateMarketStateLpValueOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "lpAmount", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_lp_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateRemoveLpToSyArguments {
    globalConfig: RawTransactionArgument<string>;
    lpAmount: RawTransactionArgument<number | bigint>;
    syIndexRaw: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateRemoveLpToSyOptions {
    package?: string;
    arguments: EstimateMarketStateRemoveLpToSyArguments | [
        globalConfig: RawTransactionArgument<string>,
        lpAmount: RawTransactionArgument<number | bigint>,
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
 * Quote the complete LP Zap Out using the post-removal pool state.
 *
 * Route values are part of the view ABI: 1 = active PT swap, 2 = settled PT
 * redemption, 3 = direct SY, 4 = awaiting settlement, 5 = insufficient
 * post-removal liquidity.
 */
export function estimateMarketStateRemoveLpToSy(options: EstimateMarketStateRemoveLpToSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u128',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "lpAmount", "syIndexRaw", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_remove_lp_to_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EstimateMarketStateClaimableInterestArguments {
    globalConfig: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface EstimateMarketStateClaimableInterestOptions {
    package?: string;
    arguments: EstimateMarketStateClaimableInterestArguments | [
        globalConfig: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function estimateMarketStateClaimableInterest(options: EstimateMarketStateClaimableInterestOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "position", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'estimate_market_state_claimable_interest',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface IsMarketStateExpiredArguments {
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface IsMarketStateExpiredOptions {
    package?: string;
    arguments: IsMarketStateExpiredArguments | [
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function isMarketStateExpired(options: IsMarketStateExpiredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'is_market_state_expired',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CalcSwapSyForPtSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>;
    syUsed: RawTransactionArgument<number | bigint>;
    ptOut: RawTransactionArgument<number | bigint>;
}
export interface CalcSwapSyForPtSlippageBpsOptions {
    package?: string;
    arguments: CalcSwapSyForPtSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>,
        syUsed: RawTransactionArgument<number | bigint>,
        ptOut: RawTransactionArgument<number | bigint>
    ];
}
export function calcSwapSyForPtSlippageBps(options: CalcSwapSyForPtSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeSpotPriceRaw", "syUsed", "ptOut"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'calc_swap_sy_for_pt_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CalcSwapPtForSySlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>;
    ptIn: RawTransactionArgument<number | bigint>;
    syOut: RawTransactionArgument<number | bigint>;
}
export interface CalcSwapPtForSySlippageBpsOptions {
    package?: string;
    arguments: CalcSwapPtForSySlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>,
        ptIn: RawTransactionArgument<number | bigint>,
        syOut: RawTransactionArgument<number | bigint>
    ];
}
export function calcSwapPtForSySlippageBps(options: CalcSwapPtForSySlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeSpotPriceRaw", "ptIn", "syOut"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'calc_swap_pt_for_sy_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CalcSwapSyForYtSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeYtPriceRaw: RawTransactionArgument<number | bigint>;
    netSyIn: RawTransactionArgument<number | bigint>;
    ytOut: RawTransactionArgument<number | bigint>;
}
export interface CalcSwapSyForYtSlippageBpsOptions {
    package?: string;
    arguments: CalcSwapSyForYtSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeYtPriceRaw: RawTransactionArgument<number | bigint>,
        netSyIn: RawTransactionArgument<number | bigint>,
        ytOut: RawTransactionArgument<number | bigint>
    ];
}
export function calcSwapSyForYtSlippageBps(options: CalcSwapSyForYtSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeYtPriceRaw", "netSyIn", "ytOut"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'calc_swap_sy_for_yt_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CalcSwapYtForSySlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeYtPriceRaw: RawTransactionArgument<number | bigint>;
    ytIn: RawTransactionArgument<number | bigint>;
    netSyOut: RawTransactionArgument<number | bigint>;
}
export interface CalcSwapYtForSySlippageBpsOptions {
    package?: string;
    arguments: CalcSwapYtForSySlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeYtPriceRaw: RawTransactionArgument<number | bigint>,
        ytIn: RawTransactionArgument<number | bigint>,
        netSyOut: RawTransactionArgument<number | bigint>
    ];
}
export function calcSwapYtForSySlippageBps(options: CalcSwapYtForSySlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeYtPriceRaw", "ytIn", "netSyOut"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'calc_swap_yt_for_sy_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UsedAmountFromChangeArguments {
    globalConfig: RawTransactionArgument<string>;
    amountIn: RawTransactionArgument<number | bigint>;
    changeCoin: RawTransactionArgument<string>;
}
export interface UsedAmountFromChangeOptions {
    package?: string;
    arguments: UsedAmountFromChangeArguments | [
        globalConfig: RawTransactionArgument<string>,
        amountIn: RawTransactionArgument<number | bigint>,
        changeCoin: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function usedAmountFromChange(options: UsedAmountFromChangeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "amountIn", "changeCoin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'used_amount_from_change',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertMaxSlippageBpsArguments {
    globalConfig: RawTransactionArgument<string>;
    actualSlippageBps: RawTransactionArgument<number | bigint>;
    maxSlippageBps: RawTransactionArgument<number | bigint>;
}
export interface AssertMaxSlippageBpsOptions {
    package?: string;
    arguments: AssertMaxSlippageBpsArguments | [
        globalConfig: RawTransactionArgument<string>,
        actualSlippageBps: RawTransactionArgument<number | bigint>,
        maxSlippageBps: RawTransactionArgument<number | bigint>
    ];
}
export function assertMaxSlippageBps(options: AssertMaxSlippageBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "actualSlippageBps", "maxSlippageBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'assert_max_slippage_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSwapSyForPtGuardrailArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>;
    amountIn: RawTransactionArgument<number | bigint>;
    ptOut: RawTransactionArgument<number | bigint>;
    changeCoin: RawTransactionArgument<string>;
    maxSlippageBps: RawTransactionArgument<number | bigint>;
}
export interface AssertSwapSyForPtGuardrailOptions {
    package?: string;
    arguments: AssertSwapSyForPtGuardrailArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>,
        amountIn: RawTransactionArgument<number | bigint>,
        ptOut: RawTransactionArgument<number | bigint>,
        changeCoin: RawTransactionArgument<string>,
        maxSlippageBps: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function assertSwapSyForPtGuardrail(options: AssertSwapSyForPtGuardrailOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64',
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeSpotPriceRaw", "amountIn", "ptOut", "changeCoin", "maxSlippageBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'assert_swap_sy_for_pt_guardrail',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertSwapSyForExactPtGuardrailArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>;
    syUsed: RawTransactionArgument<number | bigint>;
    ptOut: RawTransactionArgument<number | bigint>;
    maxSlippageBps: RawTransactionArgument<number | bigint>;
}
export interface AssertSwapSyForExactPtGuardrailOptions {
    package?: string;
    arguments: AssertSwapSyForExactPtGuardrailArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>,
        syUsed: RawTransactionArgument<number | bigint>,
        ptOut: RawTransactionArgument<number | bigint>,
        maxSlippageBps: RawTransactionArgument<number | bigint>
    ];
}
export function assertSwapSyForExactPtGuardrail(options: AssertSwapSyForExactPtGuardrailOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeSpotPriceRaw", "syUsed", "ptOut", "maxSlippageBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'assert_swap_sy_for_exact_pt_guardrail',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSwapPtForSyGuardrailArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>;
    ptIn: RawTransactionArgument<number | bigint>;
    syOut: RawTransactionArgument<number | bigint>;
    maxSlippageBps: RawTransactionArgument<number | bigint>;
}
export interface AssertSwapPtForSyGuardrailOptions {
    package?: string;
    arguments: AssertSwapPtForSyGuardrailArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeSpotPriceRaw: RawTransactionArgument<number | bigint>,
        ptIn: RawTransactionArgument<number | bigint>,
        syOut: RawTransactionArgument<number | bigint>,
        maxSlippageBps: RawTransactionArgument<number | bigint>
    ];
}
export function assertSwapPtForSyGuardrail(options: AssertSwapPtForSyGuardrailOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeSpotPriceRaw", "ptIn", "syOut", "maxSlippageBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'assert_swap_pt_for_sy_guardrail',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSwapSyForYtGuardrailArguments {
    globalConfig: RawTransactionArgument<string>;
    preTradeYtPriceRaw: RawTransactionArgument<number | bigint>;
    amountIn: RawTransactionArgument<number | bigint>;
    ytOut: RawTransactionArgument<number | bigint>;
    changeCoin: RawTransactionArgument<string>;
    maxSlippageBps: RawTransactionArgument<number | bigint>;
}
export interface AssertSwapSyForYtGuardrailOptions {
    package?: string;
    arguments: AssertSwapSyForYtGuardrailArguments | [
        globalConfig: RawTransactionArgument<string>,
        preTradeYtPriceRaw: RawTransactionArgument<number | bigint>,
        amountIn: RawTransactionArgument<number | bigint>,
        ytOut: RawTransactionArgument<number | bigint>,
        changeCoin: RawTransactionArgument<string>,
        maxSlippageBps: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function assertSwapSyForYtGuardrail(options: AssertSwapSyForYtGuardrailOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-view';
    const argumentsTypes = [
        null,
        'u128',
        'u64',
        'u64',
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "preTradeYtPriceRaw", "amountIn", "ytOut", "changeCoin", "maxSlippageBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'assert_swap_sy_for_yt_guardrail',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}