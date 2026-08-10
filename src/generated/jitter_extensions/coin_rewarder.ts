/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * coin_rewarder - generic no-stake coin rewarder.
 *
 * The rewarder does not custody principal. It settles rewards for the
 * `RewardOperation` subject using exposure derived from live Jitter objects.
 */

import { MoveStruct, MoveTuple, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as balance from './deps/sui/balance.js';
import * as reward_distributor from './deps/jitter/reward_distributor.js';
const $moduleName = 'jitter/jitter-extensions::coin_rewarder';
export const FundingLot = new MoveStruct({ name: `${$moduleName}::FundingLot`, fields: {
        lot_id: bcs.u64(),
        start_ms: bcs.u64(),
        end_ms: bcs.u64(),
        budget: bcs.u64(),
        accounted_amount: bcs.u64()
    } });
export const CoinRewarder = new MoveStruct({ name: `${$moduleName}::CoinRewarder<phantom R>`, fields: {
        id: bcs.Address,
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8(),
        reward_vault: balance.Balance,
        settlement_cap: reward_distributor.RewarderSettlementCap,
        funding_lots: bcs.vector(FundingLot),
        next_lot_id: bcs.u64(),
        acc_reward_per_exposure: bcs.u256(),
        acc_reward_remainder: bcs.u256(),
        last_updated_ms: bcs.u64(),
        allocated_rewards: bcs.u64(),
        undistributed_rewards: bcs.u64(),
        total_distributed: bcs.u256(),
        enabled: bcs.bool(),
        closed: bcs.bool(),
        closed_at_ms: bcs.u64()
    } });
export const PositionKey = new MoveTuple({ name: `${$moduleName}::PositionKey`, fields: [bcs.Address] });
export const OwnerSubjectKey = new MoveStruct({ name: `${$moduleName}::OwnerSubjectKey`, fields: {
        subject_id: bcs.Address,
        owner: bcs.Address
    } });
export const PositionRewardRecord = new MoveStruct({ name: `${$moduleName}::PositionRewardRecord`, fields: {
        owner: bcs.Address,
        exposure: bcs.u64(),
        reward_debt: bcs.u256(),
        reward_remainder: bcs.u256(),
        pending: bcs.u64()
    } });
export const DetachedRewardRecord = new MoveStruct({ name: `${$moduleName}::DetachedRewardRecord`, fields: {
        pending: bcs.u64(),
        reward_remainder: bcs.u256()
    } });
export const CoinRewarderCreatedEvent = new MoveStruct({ name: `${$moduleName}::CoinRewarderCreatedEvent`, fields: {
        rewarder_id: bcs.Address,
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8()
    } });
export const CoinRewarderFundedEvent = new MoveStruct({ name: `${$moduleName}::CoinRewarderFundedEvent`, fields: {
        rewarder_id: bcs.Address,
        lot_id: bcs.u64(),
        budget: bcs.u64(),
        start_ms: bcs.u64(),
        end_ms: bcs.u64()
    } });
export const CoinRewarderUpdatedEvent = new MoveStruct({ name: `${$moduleName}::CoinRewarderUpdatedEvent`, fields: {
        rewarder_id: bcs.Address,
        enabled: bcs.bool(),
        closed: bcs.bool(),
        closed_at_ms: bcs.u64()
    } });
export const CoinRewarderClosedEvent = new MoveStruct({ name: `${$moduleName}::CoinRewarderClosedEvent`, fields: {
        rewarder_id: bcs.Address,
        closed_at_ms: bcs.u64(),
        allocated_rewards: bcs.u64(),
        moved_to_undistributed: bcs.u64(),
        undistributed_rewards: bcs.u64()
    } });
export const CoinRewardFundingLotAdjustedEvent = new MoveStruct({ name: `${$moduleName}::CoinRewardFundingLotAdjustedEvent`, fields: {
        rewarder_id: bcs.Address,
        lot_id: bcs.u64(),
        previous_remaining_budget: bcs.u64(),
        new_remaining_budget: bcs.u64(),
        moved_to_undistributed: bcs.u64(),
        new_start_ms: bcs.u64(),
        new_end_ms: bcs.u64()
    } });
export const CoinRewardUndistributedSweptEvent = new MoveStruct({ name: `${$moduleName}::CoinRewardUndistributedSweptEvent`, fields: {
        rewarder_id: bcs.Address,
        caller: bcs.Address,
        amount: bcs.u64()
    } });
export const CoinRewardSettledEvent = new MoveStruct({ name: `${$moduleName}::CoinRewardSettledEvent`, fields: {
        rewarder_id: bcs.Address,
        subject_id: bcs.Address,
        owner: bcs.Address,
        previous_exposure: bcs.u64(),
        new_exposure: bcs.u64(),
        pending_added: bcs.u64(),
        pending_total: bcs.u64()
    } });
export const CoinRewardOwnerTransferredEvent = new MoveStruct({ name: `${$moduleName}::CoinRewardOwnerTransferredEvent`, fields: {
        rewarder_id: bcs.Address,
        subject_id: bcs.Address,
        previous_owner: bcs.Address,
        new_owner: bcs.Address,
        detached_pending: bcs.u64(),
        detached_remainder: bcs.u256()
    } });
export const CoinRewardClaimedEvent = new MoveStruct({ name: `${$moduleName}::CoinRewardClaimedEvent`, fields: {
        rewarder_id: bcs.Address,
        subject_id: bcs.Address,
        owner: bcs.Address,
        amount: bcs.u64()
    } });
export interface CreateAndRegisterByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    adminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
}
export interface CreateAndRegisterByAdminOptions {
    package?: string;
    arguments: CreateAndRegisterByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        adminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function createAndRegisterByAdmin(options: CreateAndRegisterByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u8',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "adminCap", "state", "scope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'create_and_register_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface FundArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
    startDelayMs: RawTransactionArgument<number | bigint>;
    durationMs: RawTransactionArgument<number | bigint>;
}
export interface FundOptions {
    package?: string;
    arguments: FundArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>,
        startDelayMs: RawTransactionArgument<number | bigint>,
        durationMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function fund(options: FundOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "AdminCap", "coin", "startDelayMs", "durationMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'fund',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface FundByAclArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    acl: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
    startDelayMs: RawTransactionArgument<number | bigint>;
    durationMs: RawTransactionArgument<number | bigint>;
}
export interface FundByAclOptions {
    package?: string;
    arguments: FundByAclArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        acl: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>,
        startDelayMs: RawTransactionArgument<number | bigint>,
        durationMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function fundByAcl(options: FundByAclOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "acl", "coin", "startDelayMs", "durationMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'fund_by_acl',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetEnabledByAdminArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetEnabledByAdminOptions {
    package?: string;
    arguments: SetEnabledByAdminArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function setEnabledByAdmin(options: SetEnabledByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'bool',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "AdminCap", "state", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'set_enabled_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetEnabledByAclArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    acl: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetEnabledByAclOptions {
    package?: string;
    arguments: SetEnabledByAclArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        acl: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function setEnabledByAcl(options: SetEnabledByAclOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'bool',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "acl", "state", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'set_enabled_by_acl',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CloseByAdminArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface CloseByAdminOptions {
    package?: string;
    arguments: CloseByAdminArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
/**
 * Permanently stops this reward program at `Clock.timestamp_ms` while keeping it
 * registered for lazy settlement and historical claims. Scheduled rewards after
 * the cutoff become admin-recoverable `undistributed_rewards`; already allocated
 * user liabilities remain locked in the vault until claimed.
 */
export function closeByAdmin(options: CloseByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "AdminCap", "distributor", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'close_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AdjustLotByAdminArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    lotId: RawTransactionArgument<number | bigint>;
    newRemainingBudget: RawTransactionArgument<number | bigint>;
    newStartDelayMs: RawTransactionArgument<number | bigint>;
    newDurationMs: RawTransactionArgument<number | bigint>;
}
export interface AdjustLotByAdminOptions {
    package?: string;
    arguments: AdjustLotByAdminArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        lotId: RawTransactionArgument<number | bigint>,
        newRemainingBudget: RawTransactionArgument<number | bigint>,
        newStartDelayMs: RawTransactionArgument<number | bigint>,
        newDurationMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
/**
 * Checkpoints the old calendar at `Clock.timestamp_ms`, then replaces only the
 * selected lot's unaccounted remainder. Reducing the remaining budget moves the
 * difference to `undistributed_rewards`; already-accounted rewards are never
 * rewritten.
 */
export function adjustLotByAdmin(options: AdjustLotByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "AdminCap", "state", "lotId", "newRemainingBudget", "newStartDelayMs", "newDurationMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'adjust_lot_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AdjustLotByAclArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    acl: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    lotId: RawTransactionArgument<number | bigint>;
    newRemainingBudget: RawTransactionArgument<number | bigint>;
    newStartDelayMs: RawTransactionArgument<number | bigint>;
    newDurationMs: RawTransactionArgument<number | bigint>;
}
export interface AdjustLotByAclOptions {
    package?: string;
    arguments: AdjustLotByAclArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        acl: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        lotId: RawTransactionArgument<number | bigint>,
        newRemainingBudget: RawTransactionArgument<number | bigint>,
        newStartDelayMs: RawTransactionArgument<number | bigint>,
        newDurationMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function adjustLotByAcl(options: AdjustLotByAclOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "acl", "state", "lotId", "newRemainingBudget", "newStartDelayMs", "newDurationMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'adjust_lot_by_acl',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SweepUndistributedByAdminArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface SweepUndistributedByAdminOptions {
    package?: string;
    arguments: SweepUndistributedByAdminArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function sweepUndistributedByAdmin(options: SweepUndistributedByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "AdminCap", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'sweep_undistributed_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SweepUndistributedByAclArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    acl: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface SweepUndistributedByAclOptions {
    package?: string;
    arguments: SweepUndistributedByAclArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        acl: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function sweepUndistributedByAcl(options: SweepUndistributedByAclOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "acl", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'sweep_undistributed_by_acl',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleYtPositionArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface SettleYtPositionOptions {
    package?: string;
    arguments: SettleYtPositionArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function settleYtPosition(options: SettleYtPositionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "distributor", "operation", "position", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'settle_yt_position',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleLpPositionArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface SettleLpPositionOptions {
    package?: string;
    arguments: SettleLpPositionArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function settleLpPosition(options: SettleLpPositionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "distributor", "operation", "position", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'settle_lp_position',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettlePoolArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface SettlePoolOptions {
    package?: string;
    arguments: SettlePoolArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function settlePool(options: SettlePoolOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "distributor", "operation", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'settle_pool',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimYtPositionArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface ClaimYtPositionOptions {
    package?: string;
    arguments: ClaimYtPositionArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function claimYtPosition(options: ClaimYtPositionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "distributor", "operation", "position", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'claim_yt_position',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimLpPositionArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface ClaimLpPositionOptions {
    package?: string;
    arguments: ClaimLpPositionArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function claimLpPosition(options: ClaimLpPositionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "distributor", "operation", "position", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'claim_lp_position',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimPendingArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    subjectId: RawTransactionArgument<string>;
}
export interface ClaimPendingOptions {
    package?: string;
    arguments: ClaimPendingArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        subjectId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function claimPending(options: ClaimPendingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "subjectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'claim_pending',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RecoverPoolPendingByAdminArguments {
    rewarder: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface RecoverPoolPendingByAdminOptions {
    package?: string;
    arguments: RecoverPoolPendingByAdminArguments | [
        rewarder: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function recoverPoolPendingByAdmin(options: RecoverPoolPendingByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "globalConfig", "AdminCap", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'recover_pool_pending_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RewarderIdArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface RewarderIdOptions {
    package?: string;
    arguments: RewarderIdArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function rewarderId(options: RewarderIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'rewarder_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DistributorIdArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface DistributorIdOptions {
    package?: string;
    arguments: DistributorIdArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function distributorId(options: DistributorIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'distributor_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface MarketStateIdArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface MarketStateIdOptions {
    package?: string;
    arguments: MarketStateIdArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function marketStateId(options: MarketStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'market_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ScopeArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface ScopeOptions {
    package?: string;
    arguments: ScopeArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function scope(options: ScopeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'scope',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RewardVaultAmountArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface RewardVaultAmountOptions {
    package?: string;
    arguments: RewardVaultAmountArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function rewardVaultAmount(options: RewardVaultAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'reward_vault_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AccRewardPerExposureArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface AccRewardPerExposureOptions {
    package?: string;
    arguments: AccRewardPerExposureArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function accRewardPerExposure(options: AccRewardPerExposureOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'acc_reward_per_exposure',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LastUpdatedMsArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface LastUpdatedMsOptions {
    package?: string;
    arguments: LastUpdatedMsArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lastUpdatedMs(options: LastUpdatedMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'last_updated_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AllocatedRewardAmountArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface AllocatedRewardAmountOptions {
    package?: string;
    arguments: AllocatedRewardAmountArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function allocatedRewardAmount(options: AllocatedRewardAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'allocated_reward_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ScheduledRewardAmountArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface ScheduledRewardAmountOptions {
    package?: string;
    arguments: ScheduledRewardAmountArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function scheduledRewardAmount(options: ScheduledRewardAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'scheduled_reward_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface UndistributedRewardAmountArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface UndistributedRewardAmountOptions {
    package?: string;
    arguments: UndistributedRewardAmountArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function undistributedRewardAmount(options: UndistributedRewardAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'undistributed_reward_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface UnallocatedRewardAmountArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface UnallocatedRewardAmountOptions {
    package?: string;
    arguments: UnallocatedRewardAmountArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function unallocatedRewardAmount(options: UnallocatedRewardAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'unallocated_reward_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TotalDistributedArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface TotalDistributedOptions {
    package?: string;
    arguments: TotalDistributedArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function totalDistributed(options: TotalDistributedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'total_distributed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface EnabledArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface EnabledOptions {
    package?: string;
    arguments: EnabledArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function enabled(options: EnabledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'enabled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClosedArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface ClosedOptions {
    package?: string;
    arguments: ClosedArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function closed(options: ClosedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'closed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClosedAtMsArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface ClosedAtMsOptions {
    package?: string;
    arguments: ClosedAtMsArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function closedAtMs(options: ClosedAtMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'closed_at_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface MaxFundingLotsOptions {
    package?: string;
    arguments?: [
    ];
}
export function maxFundingLots(options: MaxFundingLotsOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'max_funding_lots',
    });
}
export interface FundingLotCountArguments {
    rewarder: RawTransactionArgument<string>;
}
export interface FundingLotCountOptions {
    package?: string;
    arguments: FundingLotCountArguments | [
        rewarder: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function fundingLotCount(options: FundingLotCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'funding_lot_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface FundingLotArguments {
    rewarder: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface FundingLotOptions {
    package?: string;
    arguments: FundingLotArguments | [
        rewarder: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function fundingLot(options: FundingLotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'funding_lot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PendingArguments {
    rewarder: RawTransactionArgument<string>;
    subjectId: RawTransactionArgument<string>;
}
export interface PendingOptions {
    package?: string;
    arguments: PendingArguments | [
        rewarder: RawTransactionArgument<string>,
        subjectId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function pending(options: PendingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "subjectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'pending',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PendingForOwnerArguments {
    rewarder: RawTransactionArgument<string>;
    subjectId: RawTransactionArgument<string>;
    owner: RawTransactionArgument<string>;
}
export interface PendingForOwnerOptions {
    package?: string;
    arguments: PendingForOwnerArguments | [
        rewarder: RawTransactionArgument<string>,
        subjectId: RawTransactionArgument<string>,
        owner: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function pendingForOwner(options: PendingForOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["rewarder", "subjectId", "owner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'coin_rewarder',
        function: 'pending_for_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}