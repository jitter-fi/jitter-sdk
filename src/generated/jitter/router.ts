/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * router - user entrypoints that compose Jitter SY/PT/YT flows
 *
 * The router only orchestrates protocol actions. It starts from SY and stays
 * adapter-agnostic; underlying custody and quoting belong to adapter packages.
 *
 * Common composed flows:
 *
 * - mint_py_from_sy
 * - buy_pt / buy_exact_pt / sell_pt / sell_pt_for_exact_sy
 * - buy_yt / buy_exact_yt / sell_yt / sell_yt_for_exact_sy
 * - add_lp / add_lp_keep_yt / add_lp_from_sy / remove_lp
 * - redeem_before_expiry / redeem_after_expiry / claim_yt_interest
 *
 * Design principles:
 *
 * - Router composes, lower modules calculate
 * - Adapter packages handle underlying custody and oracle snapshots
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter::router';
export const RouterSwapEvent = new MoveStruct({ name: `${$moduleName}::RouterSwapEvent`, fields: {
        user: bcs.Address,
        direction: bcs.u8(),
        amount_in: bcs.u64(),
        amount_out: bcs.u64()
    } });
export const RouterSwapYtEvent = new MoveStruct({ name: `${$moduleName}::RouterSwapYtEvent`, fields: {
        user: bcs.Address,
        sy_amount_in: bcs.u64(),
        yt_amount_out: bcs.u64(),
        sy_amount_out: bcs.u64()
    } });
export const RouterSwapYtForSyEvent = new MoveStruct({ name: `${$moduleName}::RouterSwapYtForSyEvent`, fields: {
        user: bcs.Address,
        yt_amount_in: bcs.u64(),
        sy_amount_out: bcs.u64(),
        sy_amount_repaid: bcs.u64()
    } });
export interface CreateMarketStatePositionArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
}
export interface CreateMarketStatePositionOptions {
    package?: string;
    arguments: CreateMarketStatePositionArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function createMarketStatePosition(options: CreateMarketStatePositionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'create_market_state_position',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TransferPositionArguments {
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
}
export interface TransferPositionOptions {
    package?: string;
    arguments: TransferPositionArguments | [
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>
    ];
}
export function transferPosition(options: TransferPositionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["position", "globalConfig", "recipient"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'transfer_position',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TransferMarketStatePositionAfterRewardSettlementArguments {
    ytSettlements: RawTransactionArgument<Array<string>>;
    lpSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
}
export interface TransferMarketStatePositionAfterRewardSettlementOptions {
    package?: string;
    arguments: TransferMarketStatePositionAfterRewardSettlementArguments | [
        ytSettlements: RawTransactionArgument<Array<string>>,
        lpSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Transfer a MarketState-bound position after all reward-bearing legs are settled
 * for the current owner.
 */
export function transferMarketStatePositionAfterRewardSettlement(options: TransferMarketStatePositionAfterRewardSettlementOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        null,
        null,
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["ytSettlements", "lpSettlements", "distributor", "position", "state", "globalConfig", "recipient"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'transfer_market_state_position_after_reward_settlement',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertBeforeArguments {
    globalConfig: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface AssertBeforeOptions {
    package?: string;
    arguments: AssertBeforeArguments | [
        globalConfig: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
}
/**
 * Guard a frontend-routed PTB by checking the user-supplied deadline.
 * `deadline_ms = 0` means no deadline.
 */
export function assertBefore(options: AssertBeforeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'assert_before',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertCoinMinValueArguments {
    globalConfig: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
    minValue: RawTransactionArgument<number | bigint>;
}
export interface AssertCoinMinValueOptions {
    package?: string;
    arguments: AssertCoinMinValueArguments | [
        globalConfig: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>,
        minValue: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Guard a frontend-routed PTB by checking an output coin after composed route legs
 * have executed.
 */
export function assertCoinMinValue(options: AssertCoinMinValueOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "coin", "minValue"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'assert_coin_min_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertCoinMaxValueArguments {
    globalConfig: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
    maxValue: RawTransactionArgument<number | bigint>;
}
export interface AssertCoinMaxValueOptions {
    package?: string;
    arguments: AssertCoinMaxValueArguments | [
        globalConfig: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>,
        maxValue: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Guard a frontend-routed PTB by checking leftover input does not exceed the
 * caller's expected refund. Useful for exact-out routes.
 */
export function assertCoinMaxValue(options: AssertCoinMaxValueOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "coin", "maxValue"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'assert_coin_max_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertPtDeltaAtLeastArguments {
    globalConfig: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    initialPtBalance: RawTransactionArgument<number | bigint>;
    minPtDelta: RawTransactionArgument<number | bigint>;
}
export interface AssertPtDeltaAtLeastOptions {
    package?: string;
    arguments: AssertPtDeltaAtLeastArguments | [
        globalConfig: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        initialPtBalance: RawTransactionArgument<number | bigint>,
        minPtDelta: RawTransactionArgument<number | bigint>
    ];
}
/**
 * Guard total PT acquired across explicit order fills and AMM legs by comparing
 * the final JitterPosition balance against an off-chain snapshot.
 */
export function assertPtDeltaAtLeast(options: AssertPtDeltaAtLeastOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "position", "initialPtBalance", "minPtDelta"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'assert_pt_delta_at_least',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertYtDeltaAtLeastArguments {
    globalConfig: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    initialYtBalance: RawTransactionArgument<number | bigint>;
    minYtDelta: RawTransactionArgument<number | bigint>;
}
export interface AssertYtDeltaAtLeastOptions {
    package?: string;
    arguments: AssertYtDeltaAtLeastArguments | [
        globalConfig: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        initialYtBalance: RawTransactionArgument<number | bigint>,
        minYtDelta: RawTransactionArgument<number | bigint>
    ];
}
/** Guard total YT acquired across composed PTB legs. */
export function assertYtDeltaAtLeast(options: AssertYtDeltaAtLeastOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "position", "initialYtBalance", "minYtDelta"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'assert_yt_delta_at_least',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertLpDeltaAtLeastArguments {
    globalConfig: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    initialLpAmount: RawTransactionArgument<number | bigint>;
    minLpDelta: RawTransactionArgument<number | bigint>;
}
export interface AssertLpDeltaAtLeastOptions {
    package?: string;
    arguments: AssertLpDeltaAtLeastArguments | [
        globalConfig: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        initialLpAmount: RawTransactionArgument<number | bigint>,
        minLpDelta: RawTransactionArgument<number | bigint>
    ];
}
/** Guard total LP acquired across composed deposit legs. */
export function assertLpDeltaAtLeast(options: AssertLpDeltaAtLeastOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "position", "initialLpAmount", "minLpDelta"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'assert_lp_delta_at_least',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MintPyArguments {
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
}
export interface MintPyOptions {
    package?: string;
    arguments: MintPyArguments | [
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function mintPy(options: MintPyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["ytSettlements", "distributor", "syCoin", "priceInfo", "position", "state", "globalConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'mint_py',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface InitializePoolByAdminArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    lpSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    ptAmount: RawTransactionArgument<number | bigint>;
    minLpOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
    adminCap: RawTransactionArgument<string>;
}
export interface InitializePoolByAdminOptions {
    package?: string;
    arguments: InitializePoolByAdminArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        lpSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        ptAmount: RawTransactionArgument<number | bigint>,
        minLpOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>,
        adminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Initialize an uninitialized or empty pool. Every LP token minted by this
 * transition belongs to `position`; C2 does not create locked LP supply.
 */
export function initializePoolByAdmin(options: InitializePoolByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "lpSettlements", "distributor", "syCoin", "ptAmount", "minLpOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs", "adminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'initialize_pool_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AddLpArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    lpSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    ptAmount: RawTransactionArgument<number | bigint>;
    minLpOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface AddLpOptions {
    package?: string;
    arguments: AddLpArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        lpSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        ptAmount: RawTransactionArgument<number | bigint>,
        minLpOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function addLp(options: AddLpOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "lpSettlements", "distributor", "syCoin", "ptAmount", "minLpOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'add_lp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AddLpKeepYtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    ytSettlements: RawTransactionArgument<Array<string>>;
    lpSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    syToMintHint: RawTransactionArgument<number | bigint>;
    minLpOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface AddLpKeepYtOptions {
    package?: string;
    arguments: AddLpKeepYtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        ytSettlements: RawTransactionArgument<Array<string>>,
        lpSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        syToMintHint: RawTransactionArgument<number | bigint>,
        minLpOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function addLpKeepYt(options: AddLpKeepYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "ytSettlements", "lpSettlements", "distributor", "syCoin", "syToMintHint", "minLpOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'add_lp_keep_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AddLpFromSyArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    ytSettlements: RawTransactionArgument<Array<string>>;
    lpSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    syToMintHint: RawTransactionArgument<number | bigint>;
    minLpOut: RawTransactionArgument<number | bigint>;
    minSyOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface AddLpFromSyOptions {
    package?: string;
    arguments: AddLpFromSyArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        ytSettlements: RawTransactionArgument<Array<string>>,
        lpSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        syToMintHint: RawTransactionArgument<number | bigint>,
        minLpOut: RawTransactionArgument<number | bigint>,
        minSyOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function addLpFromSy(options: AddLpFromSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "ytSettlements", "lpSettlements", "distributor", "syCoin", "syToMintHint", "minLpOut", "minSyOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'add_lp_from_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BuyPtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    minPtOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface BuyPtOptions {
    package?: string;
    arguments: BuyPtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        minPtOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function buyPt(options: BuyPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        null,
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "distributor", "syCoin", "minPtOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'buy_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BuyExactPtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    ptOut: RawTransactionArgument<number | bigint>;
    maxSyIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface BuyExactPtOptions {
    package?: string;
    arguments: BuyExactPtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        ptOut: RawTransactionArgument<number | bigint>,
        maxSyIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function buyExactPt(options: BuyExactPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "distributor", "syCoin", "ptOut", "maxSyIn", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'buy_exact_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SellPtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    ptAmount: RawTransactionArgument<number | bigint>;
    minSyOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface SellPtOptions {
    package?: string;
    arguments: SellPtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        ptAmount: RawTransactionArgument<number | bigint>,
        minSyOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function sellPt(options: SellPtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "distributor", "ptAmount", "minSyOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'sell_pt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SellPtForExactSyArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syOut: RawTransactionArgument<number | bigint>;
    maxPtIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface SellPtForExactSyOptions {
    package?: string;
    arguments: SellPtForExactSyArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syOut: RawTransactionArgument<number | bigint>,
        maxPtIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function sellPtForExactSy(options: SellPtForExactSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "distributor", "syOut", "maxPtIn", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'sell_pt_for_exact_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BuyYtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    minYtOut: RawTransactionArgument<number | bigint>;
    minSyOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface BuyYtOptions {
    package?: string;
    arguments: BuyYtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        minYtOut: RawTransactionArgument<number | bigint>,
        minSyOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function buyYt(options: BuyYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "ytSettlements", "distributor", "syCoin", "minYtOut", "minSyOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'buy_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BuyExactYtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syCoin: RawTransactionArgument<string>;
    ytOut: RawTransactionArgument<number | bigint>;
    maxSyIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface BuyExactYtOptions {
    package?: string;
    arguments: BuyExactYtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syCoin: RawTransactionArgument<string>,
        ytOut: RawTransactionArgument<number | bigint>,
        maxSyIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function buyExactYt(options: BuyExactYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "ytSettlements", "distributor", "syCoin", "ytOut", "maxSyIn", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'buy_exact_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SellYtArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    ytAmount: RawTransactionArgument<number | bigint>;
    minSyOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface SellYtOptions {
    package?: string;
    arguments: SellYtArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        ytAmount: RawTransactionArgument<number | bigint>,
        minSyOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function sellYt(options: SellYtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "ytSettlements", "distributor", "ytAmount", "minSyOut", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'sell_yt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RedeemPyArguments {
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    ptAmount: RawTransactionArgument<number | bigint>;
    priceInfo: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
}
export interface RedeemPyOptions {
    package?: string;
    arguments: RedeemPyArguments | [
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        ptAmount: RawTransactionArgument<number | bigint>,
        priceInfo: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function redeemPy(options: RedeemPyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        'u64',
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["ytSettlements", "distributor", "ptAmount", "priceInfo", "position", "state", "globalConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'redeem_py',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SellYtForExactSyArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    syOut: RawTransactionArgument<number | bigint>;
    maxYtIn: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface SellYtForExactSyOptions {
    package?: string;
    arguments: SellYtForExactSyArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        syOut: RawTransactionArgument<number | bigint>,
        maxYtIn: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function sellYtForExactSy(options: SellYtForExactSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        'u64',
        'u64',
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "ytSettlements", "distributor", "syOut", "maxYtIn", "state", "position", "globalConfig", "priceInfo", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'sell_yt_for_exact_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleMarketStateByAdminArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface SettleMarketStateByAdminOptions {
    package?: string;
    arguments: SettleMarketStateByAdminArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function settleMarketStateByAdmin(options: SettleMarketStateByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "priceInfo", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'settle_market_state_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RedeemMarketStateAfterExpiryArguments {
    ptAmount: RawTransactionArgument<number | bigint>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
}
export interface RedeemMarketStateAfterExpiryOptions {
    package?: string;
    arguments: RedeemMarketStateAfterExpiryArguments | [
        ptAmount: RawTransactionArgument<number | bigint>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function redeemMarketStateAfterExpiry(options: RedeemMarketStateAfterExpiryOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'u64',
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["ptAmount", "position", "state", "globalConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'redeem_market_state_after_expiry',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RedeemYtAfterExpiryArguments {
    ytSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    ytAmount: RawTransactionArgument<number | bigint>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
}
export interface RedeemYtAfterExpiryOptions {
    package?: string;
    arguments: RedeemYtAfterExpiryArguments | [
        ytSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        ytAmount: RawTransactionArgument<number | bigint>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Redeem expired YT for accrued interest only.
 *
 * Expired YT has no principal claim. Reward-enabled markets must settle the
 * previous YT exposure before the burn and settle the returned post-operation
 * afterwards.
 */
export function redeemYtAfterExpiry(options: RedeemYtAfterExpiryOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        null,
        'u64',
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["ytSettlements", "distributor", "ytAmount", "position", "state", "globalConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'redeem_yt_after_expiry',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimMarketStateYtInterestArguments {
    priceInfoOpt: RawTransactionArgument<string | null>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
}
export interface ClaimMarketStateYtInterestOptions {
    package?: string;
    arguments: ClaimMarketStateYtInterestArguments | [
        priceInfoOpt: RawTransactionArgument<string | null>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function claimMarketStateYtInterest(options: ClaimMarketStateYtInterestOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        '0x1::option::Option<null>',
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["priceInfoOpt", "position", "state", "globalConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'claim_market_state_yt_interest',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RemoveLpArguments {
    poolSettlements: RawTransactionArgument<Array<string>>;
    lpSettlements: RawTransactionArgument<Array<string>>;
    distributor: RawTransactionArgument<string>;
    lpAmount: RawTransactionArgument<number | bigint>;
    minSyOut: RawTransactionArgument<number | bigint>;
    minPtOut: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    deadlineMs: RawTransactionArgument<number | bigint>;
}
export interface RemoveLpOptions {
    package?: string;
    arguments: RemoveLpArguments | [
        poolSettlements: RawTransactionArgument<Array<string>>,
        lpSettlements: RawTransactionArgument<Array<string>>,
        distributor: RawTransactionArgument<string>,
        lpAmount: RawTransactionArgument<number | bigint>,
        minSyOut: RawTransactionArgument<number | bigint>,
        minPtOut: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        deadlineMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function removeLp(options: RemoveLpOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        'vector<null>',
        'vector<null>',
        null,
        'u64',
        'u64',
        'u64',
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["poolSettlements", "lpSettlements", "distributor", "lpAmount", "minSyOut", "minPtOut", "state", "position", "globalConfig", "deadlineMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'router',
        function: 'remove_lp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}