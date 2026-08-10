/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Market-scoped reward coordination.
 *
 * Every distributor belongs to exactly one MarketState. Rewarders are grouped by
 * scope and must settle their own ID before a mutation or transfer can consume the
 * hot-potato operation.
 */

import { MoveStruct, MoveTuple, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as vec_set from './deps/sui/vec_set.js';
import * as vec_set_1 from './deps/sui/vec_set.js';
const $moduleName = 'jitter/jitter::reward_distributor';
export const RewardDistributor = new MoveStruct({ name: `${$moduleName}::RewardDistributor`, fields: {
        id: bcs.Address,
        market_state_id: bcs.Address,
        config_version: bcs.u64(),
        /**
         * Controls topology changes only. Existing operations, claims, and exits remain
         * settleable while disabled.
         */
        enabled: bcs.bool()
    } });
export const RewardOperation = new MoveStruct({ name: `${$moduleName}::RewardOperation`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8(),
        owner: bcs.Address,
        operation_kind: bcs.u8(),
        next_owner: bcs.Address,
        subject_id: bcs.Address,
        previous_exposure: bcs.u64(),
        guard: bcs.u64(),
        config_version: bcs.u64(),
        pending_rewarder_ids: vec_set.VecSet(bcs.Address)
    } });
export const RewardSettlement = new MoveStruct({ name: `${$moduleName}::RewardSettlement`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8(),
        owner: bcs.Address,
        operation_kind: bcs.u8(),
        next_owner: bcs.Address,
        subject_id: bcs.Address,
        previous_exposure: bcs.u64(),
        guard: bcs.u64(),
        config_version: bcs.u64()
    } });
export const RewarderMetadataKey = new MoveTuple({ name: `${$moduleName}::RewarderMetadataKey`, fields: [bcs.Address] });
export const ScopeRewarderSetKey = new MoveTuple({ name: `${$moduleName}::ScopeRewarderSetKey`, fields: [bcs.u8()] });
export const RetiredRewarderKey = new MoveTuple({ name: `${$moduleName}::RetiredRewarderKey`, fields: [bcs.Address] });
export const RewarderSet = new MoveStruct({ name: `${$moduleName}::RewarderSet`, fields: {
        ids: vec_set_1.VecSet(bcs.Address)
    } });
export const RewarderMetadata = new MoveStruct({ name: `${$moduleName}::RewarderMetadata`, fields: {
        rewarder_id: bcs.Address,
        scope: bcs.u8(),
        kind: bcs.vector(bcs.u8()),
        label: bcs.vector(bcs.u8())
    } });
export const RewarderSettlementCap = new MoveStruct({ name: `${$moduleName}::RewarderSettlementCap`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8(),
        rewarder_id: bcs.Address
    } });
export const RewardDistributorCreatedEvent = new MoveStruct({ name: `${$moduleName}::RewardDistributorCreatedEvent`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        owner: bcs.Address
    } });
export const RewardDistributorStatusChangedEvent = new MoveStruct({ name: `${$moduleName}::RewardDistributorStatusChangedEvent`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        enabled: bcs.bool()
    } });
export const RewarderRegisteredEvent = new MoveStruct({ name: `${$moduleName}::RewarderRegisteredEvent`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        rewarder_id: bcs.Address,
        scope: bcs.u8(),
        kind: bcs.vector(bcs.u8()),
        label: bcs.vector(bcs.u8())
    } });
export const RewarderUnregisteredEvent = new MoveStruct({ name: `${$moduleName}::RewarderUnregisteredEvent`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        rewarder_id: bcs.Address,
        scope: bcs.u8()
    } });
export const RewarderSettledEvent = new MoveStruct({ name: `${$moduleName}::RewarderSettledEvent`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        rewarder_id: bcs.Address,
        scope: bcs.u8(),
        owner: bcs.Address,
        operation_kind: bcs.u8(),
        next_owner: bcs.Address,
        subject_id: bcs.Address,
        previous_exposure: bcs.u64()
    } });
export const RewardOperationFinishedEvent = new MoveStruct({ name: `${$moduleName}::RewardOperationFinishedEvent`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8(),
        owner: bcs.Address,
        operation_kind: bcs.u8(),
        next_owner: bcs.Address,
        subject_id: bcs.Address,
        previous_exposure: bcs.u64()
    } });
export interface SetEnabledByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetEnabledByAdminOptions {
    package?: string;
    arguments: SetEnabledByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
}
export function setEnabledByAdmin(options: SetEnabledByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "AdminCap", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'set_enabled_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterRewarderByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    rewarderId: RawTransactionArgument<string>;
}
export interface RegisterRewarderByAdminOptions {
    package?: string;
    arguments: RegisterRewarderByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        rewarderId: RawTransactionArgument<string>
    ];
}
export function registerRewarderByAdmin(options: RegisterRewarderByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        'u8',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "AdminCap", "scope", "rewarderId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'register_rewarder_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterRewarderWithMetadataByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    rewarderId: RawTransactionArgument<string>;
    kind: RawTransactionArgument<Array<number>>;
    label: RawTransactionArgument<Array<number>>;
}
export interface RegisterRewarderWithMetadataByAdminOptions {
    package?: string;
    arguments: RegisterRewarderWithMetadataByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        rewarderId: RawTransactionArgument<string>,
        kind: RawTransactionArgument<Array<number>>,
        label: RawTransactionArgument<Array<number>>
    ];
}
export function registerRewarderWithMetadataByAdmin(options: RegisterRewarderWithMetadataByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        'u8',
        '0x2::object::ID',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "AdminCap", "scope", "rewarderId", "kind", "label"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'register_rewarder_with_metadata_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterRewarderWithSettlementCapByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    rewarderId: RawTransactionArgument<string>;
    kind: RawTransactionArgument<Array<number>>;
    label: RawTransactionArgument<Array<number>>;
}
export interface RegisterRewarderWithSettlementCapByAdminOptions {
    package?: string;
    arguments: RegisterRewarderWithSettlementCapByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        rewarderId: RawTransactionArgument<string>,
        kind: RawTransactionArgument<Array<number>>,
        label: RawTransactionArgument<Array<number>>
    ];
}
export function registerRewarderWithSettlementCapByAdmin(options: RegisterRewarderWithSettlementCapByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        'u8',
        '0x2::object::ID',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "AdminCap", "scope", "rewarderId", "kind", "label"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'register_rewarder_with_settlement_cap_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UnregisterRewarderByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    rewarderId: RawTransactionArgument<string>;
}
export interface UnregisterRewarderByAdminOptions {
    package?: string;
    arguments: UnregisterRewarderByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        rewarderId: RawTransactionArgument<string>
    ];
}
export function unregisterRewarderByAdmin(options: UnregisterRewarderByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        'u8',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "AdminCap", "scope", "rewarderId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'unregister_rewarder_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface BeginScopedOperationWithGuardArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    owner: RawTransactionArgument<string>;
    subjectId: RawTransactionArgument<string>;
    previousExposure: RawTransactionArgument<number | bigint>;
    guard: RawTransactionArgument<number | bigint>;
}
export interface BeginScopedOperationWithGuardOptions {
    package?: string;
    arguments: BeginScopedOperationWithGuardArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        owner: RawTransactionArgument<string>,
        subjectId: RawTransactionArgument<string>,
        previousExposure: RawTransactionArgument<number | bigint>,
        guard: RawTransactionArgument<number | bigint>
    ];
}
export function beginScopedOperationWithGuard(options: BeginScopedOperationWithGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u8',
        'address',
        '0x2::object::ID',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "scope", "owner", "subjectId", "previousExposure", "guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'begin_scoped_operation_with_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface BeginTransferOperationArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    owner: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
    subjectId: RawTransactionArgument<string>;
    previousExposure: RawTransactionArgument<number | bigint>;
    guard: RawTransactionArgument<number | bigint>;
}
export interface BeginTransferOperationOptions {
    package?: string;
    arguments: BeginTransferOperationArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        owner: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>,
        subjectId: RawTransactionArgument<string>,
        previousExposure: RawTransactionArgument<number | bigint>,
        guard: RawTransactionArgument<number | bigint>
    ];
}
export function beginTransferOperation(options: BeginTransferOperationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        'u8',
        'address',
        'address',
        '0x2::object::ID',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "scope", "owner", "recipient", "subjectId", "previousExposure", "guard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'begin_transfer_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FinishOperationArguments {
    globalConfig: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
}
export interface FinishOperationOptions {
    package?: string;
    arguments: FinishOperationArguments | [
        globalConfig: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>
    ];
}
export function finishOperation(options: FinishOperationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'finish_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DestroySettlementArguments {
    globalConfig: RawTransactionArgument<string>;
    settlement: RawTransactionArgument<string>;
}
export interface DestroySettlementOptions {
    package?: string;
    arguments: DestroySettlementArguments | [
        globalConfig: RawTransactionArgument<string>,
        settlement: RawTransactionArgument<string>
    ];
}
export function destroySettlement(options: DestroySettlementOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "settlement"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'destroy_settlement',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SettleRewarderWithCapArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
}
export interface SettleRewarderWithCapOptions {
    package?: string;
    arguments: SettleRewarderWithCapArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>
    ];
}
export function settleRewarderWithCap(options: SettleRewarderWithCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "operation", "cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'settle_rewarder_with_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SettleTransferRewarderWithCapArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
}
export interface SettleTransferRewarderWithCapOptions {
    package?: string;
    arguments: SettleTransferRewarderWithCapArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>
    ];
}
export function settleTransferRewarderWithCap(options: SettleTransferRewarderWithCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "operation", "cap", "recipient"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'settle_transfer_rewarder_with_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSubjectArguments {
    operation: RawTransactionArgument<string>;
    subjectId: RawTransactionArgument<string>;
}
export interface AssertSubjectOptions {
    package?: string;
    arguments: AssertSubjectArguments | [
        operation: RawTransactionArgument<string>,
        subjectId: RawTransactionArgument<string>
    ];
}
export function assertSubject(options: AssertSubjectOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["operation", "subjectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_subject',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertOwnerArguments {
    operation: RawTransactionArgument<string>;
    owner: RawTransactionArgument<string>;
}
export interface AssertOwnerOptions {
    package?: string;
    arguments: AssertOwnerArguments | [
        operation: RawTransactionArgument<string>,
        owner: RawTransactionArgument<string>
    ];
}
export function assertOwner(options: AssertOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["operation", "owner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertMutationOperationArguments {
    operation: RawTransactionArgument<string>;
}
export interface AssertMutationOperationOptions {
    package?: string;
    arguments: AssertMutationOperationArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function assertMutationOperation(options: AssertMutationOperationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_mutation_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertTransferOperationArguments {
    operation: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
}
export interface AssertTransferOperationOptions {
    package?: string;
    arguments: AssertTransferOperationArguments | [
        operation: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>
    ];
}
export function assertTransferOperation(options: AssertTransferOperationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["operation", "recipient"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_transfer_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertOperationMarketMatchesArguments {
    operation: RawTransactionArgument<string>;
    expectedMarketStateId: RawTransactionArgument<string>;
}
export interface AssertOperationMarketMatchesOptions {
    package?: string;
    arguments: AssertOperationMarketMatchesArguments | [
        operation: RawTransactionArgument<string>,
        expectedMarketStateId: RawTransactionArgument<string>
    ];
}
export function assertOperationMarketMatches(options: AssertOperationMarketMatchesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["operation", "expectedMarketStateId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_operation_market_matches',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementMarketMatchesArguments {
    settlement: RawTransactionArgument<string>;
    expectedMarketStateId: RawTransactionArgument<string>;
}
export interface AssertSettlementMarketMatchesOptions {
    package?: string;
    arguments: AssertSettlementMarketMatchesArguments | [
        settlement: RawTransactionArgument<string>,
        expectedMarketStateId: RawTransactionArgument<string>
    ];
}
export function assertSettlementMarketMatches(options: AssertSettlementMarketMatchesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedMarketStateId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_market_matches',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementPreviousExposureArguments {
    settlement: RawTransactionArgument<string>;
    expectedPreviousExposure: RawTransactionArgument<number | bigint>;
}
export interface AssertSettlementPreviousExposureOptions {
    package?: string;
    arguments: AssertSettlementPreviousExposureArguments | [
        settlement: RawTransactionArgument<string>,
        expectedPreviousExposure: RawTransactionArgument<number | bigint>
    ];
}
export function assertSettlementPreviousExposure(options: AssertSettlementPreviousExposureOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedPreviousExposure"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_previous_exposure',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementGuardArguments {
    settlement: RawTransactionArgument<string>;
    expectedGuard: RawTransactionArgument<number | bigint>;
}
export interface AssertSettlementGuardOptions {
    package?: string;
    arguments: AssertSettlementGuardArguments | [
        settlement: RawTransactionArgument<string>,
        expectedGuard: RawTransactionArgument<number | bigint>
    ];
}
export function assertSettlementGuard(options: AssertSettlementGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedGuard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementScopeArguments {
    settlement: RawTransactionArgument<string>;
    expectedScope: RawTransactionArgument<number>;
}
export interface AssertSettlementScopeOptions {
    package?: string;
    arguments: AssertSettlementScopeArguments | [
        settlement: RawTransactionArgument<string>,
        expectedScope: RawTransactionArgument<number>
    ];
}
export function assertSettlementScope(options: AssertSettlementScopeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u8'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedScope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_scope',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementSubjectArguments {
    settlement: RawTransactionArgument<string>;
    expectedSubjectId: RawTransactionArgument<string>;
}
export interface AssertSettlementSubjectOptions {
    package?: string;
    arguments: AssertSettlementSubjectArguments | [
        settlement: RawTransactionArgument<string>,
        expectedSubjectId: RawTransactionArgument<string>
    ];
}
export function assertSettlementSubject(options: AssertSettlementSubjectOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedSubjectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_subject',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementOwnerArguments {
    settlement: RawTransactionArgument<string>;
    expectedOwner: RawTransactionArgument<string>;
}
export interface AssertSettlementOwnerOptions {
    package?: string;
    arguments: AssertSettlementOwnerArguments | [
        settlement: RawTransactionArgument<string>,
        expectedOwner: RawTransactionArgument<string>
    ];
}
export function assertSettlementOwner(options: AssertSettlementOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedOwner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementMutationArguments {
    settlement: RawTransactionArgument<string>;
}
export interface AssertSettlementMutationOptions {
    package?: string;
    arguments: AssertSettlementMutationArguments | [
        settlement: RawTransactionArgument<string>
    ];
}
export function assertSettlementMutation(options: AssertSettlementMutationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["settlement"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_mutation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementTransferToArguments {
    settlement: RawTransactionArgument<string>;
    expectedRecipient: RawTransactionArgument<string>;
}
export interface AssertSettlementTransferToOptions {
    package?: string;
    arguments: AssertSettlementTransferToArguments | [
        settlement: RawTransactionArgument<string>,
        expectedRecipient: RawTransactionArgument<string>
    ];
}
export function assertSettlementTransferTo(options: AssertSettlementTransferToOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedRecipient"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_transfer_to',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertSettlementConfigCurrentArguments {
    distributor: RawTransactionArgument<string>;
    settlement: RawTransactionArgument<string>;
}
export interface AssertSettlementConfigCurrentOptions {
    package?: string;
    arguments: AssertSettlementConfigCurrentArguments | [
        distributor: RawTransactionArgument<string>,
        settlement: RawTransactionArgument<string>
    ];
}
export function assertSettlementConfigCurrent(options: AssertSettlementConfigCurrentOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "settlement"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'assert_settlement_config_current',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IdArguments {
    distributor: RawTransactionArgument<string>;
}
export interface IdOptions {
    package?: string;
    arguments: IdArguments | [
        distributor: RawTransactionArgument<string>
    ];
}
export function id(options: IdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["distributor"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketStateIdArguments {
    distributor: RawTransactionArgument<string>;
}
export interface MarketStateIdOptions {
    package?: string;
    arguments: MarketStateIdArguments | [
        distributor: RawTransactionArgument<string>
    ];
}
export function marketStateId(options: MarketStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["distributor"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'market_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtScopeOptions {
    package?: string;
    arguments?: [
    ];
}
export function ytScope(options: YtScopeOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'yt_scope',
    });
}
export interface LpScopeOptions {
    package?: string;
    arguments?: [
    ];
}
export function lpScope(options: LpScopeOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'lp_scope',
    });
}
export interface PoolScopeOptions {
    package?: string;
    arguments?: [
    ];
}
export function poolScope(options: PoolScopeOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'pool_scope',
    });
}
export interface OrderbookScopeOptions {
    package?: string;
    arguments?: [
    ];
}
export function orderbookScope(options: OrderbookScopeOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'orderbook_scope',
    });
}
export interface PtScopeOptions {
    package?: string;
    arguments?: [
    ];
}
export function ptScope(options: PtScopeOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'pt_scope',
    });
}
export interface EnabledArguments {
    distributor: RawTransactionArgument<string>;
}
export interface EnabledOptions {
    package?: string;
    arguments: EnabledArguments | [
        distributor: RawTransactionArgument<string>
    ];
}
export function enabled(options: EnabledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["distributor"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'enabled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ConfigVersionArguments {
    distributor: RawTransactionArgument<string>;
}
export interface ConfigVersionOptions {
    package?: string;
    arguments: ConfigVersionArguments | [
        distributor: RawTransactionArgument<string>
    ];
}
export function configVersion(options: ConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["distributor"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OperationOwnerArguments {
    operation: RawTransactionArgument<string>;
}
export interface OperationOwnerOptions {
    package?: string;
    arguments: OperationOwnerArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function operationOwner(options: OperationOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'operation_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OperationIsTransferArguments {
    operation: RawTransactionArgument<string>;
}
export interface OperationIsTransferOptions {
    package?: string;
    arguments: OperationIsTransferArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function operationIsTransfer(options: OperationIsTransferOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'operation_is_transfer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OperationNextOwnerArguments {
    operation: RawTransactionArgument<string>;
}
export interface OperationNextOwnerOptions {
    package?: string;
    arguments: OperationNextOwnerArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function operationNextOwner(options: OperationNextOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'operation_next_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OperationScopeArguments {
    operation: RawTransactionArgument<string>;
}
export interface OperationScopeOptions {
    package?: string;
    arguments: OperationScopeArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function operationScope(options: OperationScopeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'operation_scope',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PreviousExposureArguments {
    operation: RawTransactionArgument<string>;
}
export interface PreviousExposureOptions {
    package?: string;
    arguments: PreviousExposureArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function previousExposure(options: PreviousExposureOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'previous_exposure',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OperationGuardArguments {
    operation: RawTransactionArgument<string>;
}
export interface OperationGuardOptions {
    package?: string;
    arguments: OperationGuardArguments | [
        operation: RawTransactionArgument<string>
    ];
}
export function operationGuard(options: OperationGuardOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'operation_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RewarderRegisteredArguments {
    distributor: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
    rewarderId: RawTransactionArgument<string>;
}
export interface RewarderRegisteredOptions {
    package?: string;
    arguments: RewarderRegisteredArguments | [
        distributor: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>,
        rewarderId: RawTransactionArgument<string>
    ];
}
export function rewarderRegistered(options: RewarderRegisteredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u8',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "scope", "rewarderId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'rewarder_registered',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RewarderCountArguments {
    distributor: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
}
export interface RewarderCountOptions {
    package?: string;
    arguments: RewarderCountArguments | [
        distributor: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>
    ];
}
export function rewarderCount(options: RewarderCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u8'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "scope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'rewarder_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ScopeRewarderIdsArguments {
    distributor: RawTransactionArgument<string>;
    scope: RawTransactionArgument<number>;
}
export interface ScopeRewarderIdsOptions {
    package?: string;
    arguments: ScopeRewarderIdsArguments | [
        distributor: RawTransactionArgument<string>,
        scope: RawTransactionArgument<number>
    ];
}
export function scopeRewarderIds(options: ScopeRewarderIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        'u8'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "scope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'scope_rewarder_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RewarderMetadataArguments {
    distributor: RawTransactionArgument<string>;
    rewarderId: RawTransactionArgument<string>;
}
export interface RewarderMetadataOptions {
    package?: string;
    arguments: RewarderMetadataArguments | [
        distributor: RawTransactionArgument<string>,
        rewarderId: RawTransactionArgument<string>
    ];
}
export function rewarderMetadata(options: RewarderMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "rewarderId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'rewarder_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ConsumeScopedSubjectSettlementArguments {
    settlement: RawTransactionArgument<string>;
    expectedDistributorId: RawTransactionArgument<string>;
    expectedScope: RawTransactionArgument<number>;
    expectedSubjectId: RawTransactionArgument<string>;
}
export interface ConsumeScopedSubjectSettlementOptions {
    package?: string;
    arguments: ConsumeScopedSubjectSettlementArguments | [
        settlement: RawTransactionArgument<string>,
        expectedDistributorId: RawTransactionArgument<string>,
        expectedScope: RawTransactionArgument<number>,
        expectedSubjectId: RawTransactionArgument<string>
    ];
}
export function consumeScopedSubjectSettlement(options: ConsumeScopedSubjectSettlementOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        'u8',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["settlement", "expectedDistributorId", "expectedScope", "expectedSubjectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'reward_distributor',
        function: 'consume_scoped_subject_settlement',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}