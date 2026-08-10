/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Optional LiquidLink v2 point extension for Jitter.
 *
 * Core Jitter objects and normal router entrypoints stay unchanged. Projects that
 * opt in call these extension entrypoints instead.
 *
 * YT points use a per-market accumulator capped at market maturity and are
 * materialized into LiquidLink when a position is synchronized. LP points use a
 * pool-level accumulator because LP exposure changes whenever pool.total_sy
 * changes; users claim settled LP points into LiquidLink explicitly.
 */

import { MoveStruct, MoveTuple, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as referral_policy from './deps/jitter_referral/referral_policy.js';
import * as reward_distributor from './deps/jitter/reward_distributor.js';
import * as reward_distributor_1 from './deps/jitter/reward_distributor.js';
import * as referral_policy_1 from './deps/jitter_referral/referral_policy.js';
import * as reward_distributor_2 from './deps/jitter/reward_distributor.js';
const $moduleName = 'jitter/jitter-extensions::liquidlink_points';
export const PointConfig = new MoveStruct({ name: `${$moduleName}::PointConfig`, fields: {
        id: bcs.Address,
        project_object_id: bcs.Address,
        scoreboard_id: bcs.Address,
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        duration: bcs.u64(),
        enabled: bcs.bool(),
        total_yt_amount: bcs.u256(),
        total_yt_base: bcs.u256(),
        config_version: bcs.u64(),
        /**
         * YT-only configuration history. Market accumulators replay this history lazily so
         * a local pause does not require enumerating every market.
         */
        yt_config_version: bcs.u64(),
        /**
         * LP-only configuration history. This version changes only when an LP emission
         * parameter changes, so unrelated YT configuration updates do not force every pool
         * accumulator to catch up.
         */
        lp_config_version: bcs.u64(),
        yt_referral_source_cap: bcs.option(referral_policy.YtReferralSourceCap)
    } });
export const LpPointState = new MoveStruct({ name: `${$moduleName}::LpPointState<phantom SY>`, fields: {
        id: bcs.Address,
        lp_rewarder_uid: bcs.Address,
        pool_rewarder_uid: bcs.Address,
        point_config_id: bcs.Address,
        pool_id: bcs.Address,
        lp_settlement_cap: bcs.option(reward_distributor.RewarderSettlementCap),
        pool_settlement_cap: bcs.option(reward_distributor_1.RewarderSettlementCap),
        lp_referral_source_cap: bcs.option(referral_policy_1.LpReferralSourceCap),
        lp_multiplier_bps: bcs.u64(),
        acc_point_per_lp: bcs.u128(),
        /**
         * Snapshot of the pool accumulator when this LP point program became active. A
         * position that already had LP at attachment but has no record earns only the
         * growth after this baseline.
         */
        attachment_acc_point_per_lp: bcs.u128(),
        /**
         * Wall-clock boundary paired with `attachment_acc_point_per_lp` for off-chain
         * auditability and season discovery.
         */
        attachment_ms: bcs.u64(),
        /**
         * Remainder from converting whole pool points into `acc_point_per_lp`. Units are
         * `point * ACC_PRECISION` modulo circulating LP supply.
         */
        acc_point_remainder: bcs.u256(),
        /**
         * Fractional pool points carried across checkpoints. The value is the remainder of
         * the pre-division point numerator over `BPS_DENOMINATOR * PointConfig.duration`.
         */
        point_numerator_remainder: bcs.u256(),
        /**
         * Q128 carry used only when a duration transition changes the denominator of
         * `point_numerator_remainder`.
         */
        point_fraction_remainder_q128: bcs.u256(),
        last_updated_ms: bcs.u64(),
        total_lp_points_accrued: bcs.u64(),
        point_config_version: bcs.u64(),
        reward_attached: bcs.bool()
    } });
export const LpConfigVersionKey = new MoveTuple({ name: `${$moduleName}::LpConfigVersionKey`, fields: [bcs.u64()] });
export const LpConfigVersion = new MoveStruct({ name: `${$moduleName}::LpConfigVersion`, fields: {
        effective_at_ms: bcs.u64(),
        multiplier_bps: bcs.u64(),
        duration: bcs.u64(),
        enabled: bcs.bool()
    } });
export const YtConfigVersionKey = new MoveTuple({ name: `${$moduleName}::YtConfigVersionKey`, fields: [bcs.u64()] });
export const YtConfigVersion = new MoveStruct({ name: `${$moduleName}::YtConfigVersion`, fields: {
        effective_at_ms: bcs.u64(),
        multiplier_bps: bcs.u64(),
        duration: bcs.u64(),
        enabled: bcs.bool()
    } });
export const UserKey = new MoveTuple({ name: `${$moduleName}::UserKey`, fields: [bcs.Address] });
export const PositionKey = new MoveTuple({ name: `${$moduleName}::PositionKey`, fields: [bcs.Address] });
export const LpReferralRecordKey = new MoveTuple({ name: `${$moduleName}::LpReferralRecordKey`, fields: [bcs.Address] });
export const YtReferralRecordKey = new MoveTuple({ name: `${$moduleName}::YtReferralRecordKey`, fields: [bcs.Address] });
export const YtPointWeightKey = new MoveTuple({ name: `${$moduleName}::YtPointWeightKey`, fields: [bcs.Address] });
export const YtMarketAllowedKey = new MoveTuple({ name: `${$moduleName}::YtMarketAllowedKey`, fields: [bcs.Address] });
export const JitterLpPointSource = new MoveStruct({ name: `${$moduleName}::JitterLpPointSource`, fields: {
        dummy_field: bcs.bool()
    } });
export const JitterPointSource = new MoveStruct({ name: `${$moduleName}::JitterPointSource`, fields: {
        dummy_field: bcs.bool()
    } });
export const JitterYtPointSource = new MoveStruct({ name: `${$moduleName}::JitterYtPointSource`, fields: {
        dummy_field: bcs.bool()
    } });
export const LpPointClaimLock = new MoveStruct({ name: `${$moduleName}::LpPointClaimLock`, fields: {
        _reserved: bcs.bool()
    } });
export const YtPointWeight = new MoveStruct({ name: `${$moduleName}::YtPointWeight`, fields: {
        multiplier_bps: bcs.u64()
    } });
export const UserYtExposure = new MoveStruct({ name: `${$moduleName}::UserYtExposure`, fields: {
        yt_base: bcs.u256()
    } });
export const YtPositionContribution = new MoveStruct({ name: `${$moduleName}::YtPositionContribution`, fields: {
        owner: bcs.Address,
        raw_amount: bcs.u256(),
        base_amount: bcs.u256(),
        /**
         * Exact Q128 baseline. Keeping this scaled avoids checkpoint-frequency rounding
         * loss while an exposure remains attached to the same owner.
         */
        reward_debt_scaled: bcs.u256(),
        point_remainder_scaled: bcs.u256()
    } });
export const YtMarketExposure = new MoveStruct({ name: `${$moduleName}::YtMarketExposure`, fields: {
        yt_amount: bcs.u256(),
        yt_base: bcs.u256(),
        acc_point_per_base: bcs.u256(),
        point_numerator_remainder: bcs.u256(),
        last_updated_ms: bcs.u64(),
        expiry_ms: bcs.u64(),
        point_config_version: bcs.u64(),
        initialized: bcs.bool(),
        reward_attached: bcs.bool(),
        settlement_cap: bcs.option(reward_distributor_2.RewarderSettlementCap)
    } });
export const LpLegPointRecord = new MoveStruct({ name: `${$moduleName}::LpLegPointRecord`, fields: {
        owner: bcs.Address,
        lp_amount: bcs.u64(),
        reward_debt: bcs.u256(),
        pending_points: bcs.u64(),
        /**
         * Remainder from converting this position's accumulated reward debt into whole
         * points. Always less than `ACC_PRECISION`.
         */
        pending_point_remainder: bcs.u256()
    } });
export const LpReferralRecordMarker = new MoveStruct({ name: `${$moduleName}::LpReferralRecordMarker`, fields: {
        record_id: bcs.Address
    } });
export const YtReferralRecordMarker = new MoveStruct({ name: `${$moduleName}::YtReferralRecordMarker`, fields: {
        record_id: bcs.Address
    } });
export const PointConfigCreatedEvent = new MoveStruct({ name: `${$moduleName}::PointConfigCreatedEvent`, fields: {
        config_id: bcs.Address,
        project_object_id: bcs.Address,
        scoreboard_id: bcs.Address,
        owner: bcs.Address,
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        duration: bcs.u64(),
        enabled: bcs.bool(),
        total_yt_amount: bcs.u256(),
        total_yt_base: bcs.u256(),
        config_version: bcs.u64(),
        yt_config_version: bcs.u64(),
        lp_config_version: bcs.u64()
    } });
export const PointConfigUpdatedEvent = new MoveStruct({ name: `${$moduleName}::PointConfigUpdatedEvent`, fields: {
        config_id: bcs.Address,
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        duration: bcs.u64(),
        enabled: bcs.bool(),
        total_yt_amount: bcs.u256(),
        total_yt_base: bcs.u256(),
        config_version: bcs.u64(),
        yt_config_version: bcs.u64(),
        lp_config_version: bcs.u64()
    } });
export const LpPointStateCreatedEvent = new MoveStruct({ name: `${$moduleName}::LpPointStateCreatedEvent`, fields: {
        state_id: bcs.Address,
        config_id: bcs.Address,
        pool_id: bcs.Address,
        lp_multiplier_bps: bcs.u64()
    } });
export const YtPointWeightConfiguredEvent = new MoveStruct({ name: `${$moduleName}::YtPointWeightConfiguredEvent`, fields: {
        config_id: bcs.Address,
        market_id: bcs.Address,
        multiplier_bps: bcs.u64()
    } });
export const YtMarketAllowedEvent = new MoveStruct({ name: `${$moduleName}::YtMarketAllowedEvent`, fields: {
        config_id: bcs.Address,
        market_id: bcs.Address
    } });
export const LpPointWeightConfiguredEvent = new MoveStruct({ name: `${$moduleName}::LpPointWeightConfiguredEvent`, fields: {
        state_id: bcs.Address,
        pool_id: bcs.Address,
        multiplier_bps: bcs.u64()
    } });
export const YtPointsSyncedEvent = new MoveStruct({ name: `${$moduleName}::YtPointsSyncedEvent`, fields: {
        config_id: bcs.Address,
        position_id: bcs.Address,
        owner: bcs.Address,
        previous_base_amount: bcs.u256(),
        new_base_amount: bcs.u256(),
        points_added: bcs.u64(),
        point_remainder_scaled: bcs.u256(),
        effective_updated_at_ms: bcs.u64()
    } });
export const PointRewardAttachmentUpdatedEvent = new MoveStruct({ name: `${$moduleName}::PointRewardAttachmentUpdatedEvent`, fields: {
        config_id: bcs.Address,
        scoreboard_id: bcs.Address,
        market_id: bcs.Address,
        scope: bcs.u8(),
        rewarder_id: bcs.Address,
        attached: bcs.bool()
    } });
export const LpPointAttachmentBaselineCapturedEvent = new MoveStruct({ name: `${$moduleName}::LpPointAttachmentBaselineCapturedEvent`, fields: {
        state_id: bcs.Address,
        pool_id: bcs.Address,
        attachment_ms: bcs.u64(),
        attachment_acc_point_per_lp: bcs.u128()
    } });
export const LpPointAccumulatorUpdatedEvent = new MoveStruct({ name: `${$moduleName}::LpPointAccumulatorUpdatedEvent`, fields: {
        state_id: bcs.Address,
        pool_id: bcs.Address,
        elapsed_ms: bcs.u64(),
        total_sy: bcs.u64(),
        circulating_lp_supply: bcs.u64(),
        points_accrued: bcs.u64(),
        point_numerator_remainder: bcs.u256(),
        acc_point_remainder: bcs.u256(),
        acc_point_per_lp: bcs.u128()
    } });
export const PointConfigCheckpointedEvent = new MoveStruct({ name: `${$moduleName}::PointConfigCheckpointedEvent`, fields: {
        config_id: bcs.Address,
        subject_id: bcs.Address,
        scope: bcs.u8(),
        from_version: bcs.u64(),
        to_version: bcs.u64(),
        current_version: bcs.u64(),
        checkpointed_until_ms: bcs.u64(),
        complete: bcs.bool()
    } });
export const LpLegPointsSettledEvent = new MoveStruct({ name: `${$moduleName}::LpLegPointsSettledEvent`, fields: {
        state_id: bcs.Address,
        position_id: bcs.Address,
        owner: bcs.Address,
        pending_added: bcs.u64(),
        pending_total: bcs.u64(),
        pending_point_remainder: bcs.u256(),
        lp_amount: bcs.u64(),
        reward_debt: bcs.u256()
    } });
export const LpPointsClaimedEvent = new MoveStruct({ name: `${$moduleName}::LpPointsClaimedEvent`, fields: {
        state_id: bcs.Address,
        position_id: bcs.Address,
        owner: bcs.Address,
        points: bcs.u64()
    } });
export const LpReferralDetachedEvent = new MoveStruct({ name: `${$moduleName}::LpReferralDetachedEvent`, fields: {
        state_id: bcs.Address,
        position_id: bcs.Address,
        record_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referee_points_claimed: bcs.u64(),
        referrer_points_claimed: bcs.u64(),
        forfeited_referee_remainder: bcs.u256(),
        forfeited_referrer_remainder: bcs.u256()
    } });
export const YtReferralDetachedEvent = new MoveStruct({ name: `${$moduleName}::YtReferralDetachedEvent`, fields: {
        config_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        record_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referrer_points_claimed: bcs.u64(),
        forfeited_referee_remainder: bcs.u256(),
        forfeited_referrer_remainder: bcs.u256()
    } });
export interface CreateAndShareDefaultByAdminArguments {
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CreateAndShareDefaultByAdminOptions {
    package?: string;
    arguments: CreateAndShareDefaultByAdminArguments | [
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
}
export function createAndShareDefaultByAdmin(options: CreateAndShareDefaultByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["liquidlinkGlobalConfig", "projectCap", "project", "scoreboard", "globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'create_and_share_default_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateAndShareByAdminArguments {
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    ytMultiplierBps: RawTransactionArgument<number | bigint>;
    lpMultiplierBps: RawTransactionArgument<number | bigint>;
    duration: RawTransactionArgument<number | bigint>;
}
export interface CreateAndShareByAdminOptions {
    package?: string;
    arguments: CreateAndShareByAdminArguments | [
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        ytMultiplierBps: RawTransactionArgument<number | bigint>,
        lpMultiplierBps: RawTransactionArgument<number | bigint>,
        duration: RawTransactionArgument<number | bigint>
    ];
}
export function createAndShareByAdmin(options: CreateAndShareByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["liquidlinkGlobalConfig", "projectCap", "project", "scoreboard", "globalConfig", "AdminCap", "ytMultiplierBps", "lpMultiplierBps", "duration"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'create_and_share_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateLpPointStateByAdminArguments {
    pointConfig: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CreateLpPointStateByAdminOptions {
    package?: string;
    arguments: CreateLpPointStateByAdminArguments | [
        pointConfig: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function createLpPointStateByAdmin(options: CreateLpPointStateByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "pool", "globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'create_lp_point_state_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMultipliersByAdminArguments {
    config: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    ytMultiplierBps: RawTransactionArgument<number | bigint>;
    lpMultiplierBps: RawTransactionArgument<number | bigint>;
    duration: RawTransactionArgument<number | bigint>;
}
export interface SetMultipliersByAdminOptions {
    package?: string;
    arguments: SetMultipliersByAdminArguments | [
        config: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        ytMultiplierBps: RawTransactionArgument<number | bigint>,
        lpMultiplierBps: RawTransactionArgument<number | bigint>,
        duration: RawTransactionArgument<number | bigint>
    ];
}
export function setMultipliersByAdmin(options: SetMultipliersByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "globalConfig", "AdminCap", "ytMultiplierBps", "lpMultiplierBps", "duration"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'set_multipliers_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RepairMultipliersByAdminArguments {
    config: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    ytMultiplierBps: RawTransactionArgument<number | bigint>;
    lpMultiplierBps: RawTransactionArgument<number | bigint>;
    duration: RawTransactionArgument<number | bigint>;
}
export interface RepairMultipliersByAdminOptions {
    package?: string;
    arguments: RepairMultipliersByAdminArguments | [
        config: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        ytMultiplierBps: RawTransactionArgument<number | bigint>,
        lpMultiplierBps: RawTransactionArgument<number | bigint>,
        duration: RawTransactionArgument<number | bigint>
    ];
}
export function repairMultipliersByAdmin(options: RepairMultipliersByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "globalConfig", "AdminCap", "ytMultiplierBps", "lpMultiplierBps", "duration"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'repair_multipliers_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetEnabledByAclArguments {
    config: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    acl: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetEnabledByAclOptions {
    package?: string;
    arguments: SetEnabledByAclArguments | [
        config: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        acl: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
}
export function setEnabledByAcl(options: SetEnabledByAclOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'bool',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "globalConfig", "acl", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'set_enabled_by_acl',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetEnabledByAdminArguments {
    config: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetEnabledByAdminOptions {
    package?: string;
    arguments: SetEnabledByAdminArguments | [
        config: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
}
export function setEnabledByAdmin(options: SetEnabledByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'bool',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "globalConfig", "AdminCap", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'set_enabled_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetYtMarketMultiplierByAdminArguments {
    config: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    multiplierBps: RawTransactionArgument<number | bigint>;
}
export interface SetYtMarketMultiplierByAdminOptions {
    package?: string;
    arguments: SetYtMarketMultiplierByAdminArguments | [
        config: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        multiplierBps: RawTransactionArgument<number | bigint>
    ];
}
export function setYtMarketMultiplierByAdmin(options: SetYtMarketMultiplierByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "globalConfig", "AdminCap", "marketId", "multiplierBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'set_yt_market_multiplier_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AllowYtMarketByAdminArguments {
    config: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface AllowYtMarketByAdminOptions {
    package?: string;
    arguments: AllowYtMarketByAdminArguments | [
        config: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function allowYtMarketByAdmin(options: AllowYtMarketByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "globalConfig", "AdminCap", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'allow_yt_market_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetLpStateMultiplierByAdminArguments {
    pointConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    multiplierBps: RawTransactionArgument<number | bigint>;
}
export interface SetLpStateMultiplierByAdminOptions {
    package?: string;
    arguments: SetLpStateMultiplierByAdminArguments | [
        pointConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        multiplierBps: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setLpStateMultiplierByAdmin(options: SetLpStateMultiplierByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "state", "pool", "globalConfig", "AdminCap", "multiplierBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'set_lp_state_multiplier_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AttachYtRewarderByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    adminCap: RawTransactionArgument<string>;
}
export interface AttachYtRewarderByAdminOptions {
    package?: string;
    arguments: AttachYtRewarderByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        adminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Attach this Scoreboard's YT point program to one market.
 *
 * The same PointConfig can be attached to many markets, and one market's
 * distributor can contain several PointConfigs backed by different Scoreboards.
 */
export function attachYtRewarderByAdmin(options: AttachYtRewarderByAdminOptions) {
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
    const parameterNames = ["distributor", "globalConfig", "pointConfig", "scoreboard", "market", "adminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'attach_yt_rewarder_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DetachYtRewarderByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    adminCap: RawTransactionArgument<string>;
}
export interface DetachYtRewarderByAdminOptions {
    package?: string;
    arguments: DetachYtRewarderByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        adminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Stop this Scoreboard's YT accrual for one market and remove it from future
 * reward operations. Historical points remain available through manual sync.
 */
export function detachYtRewarderByAdmin(options: DetachYtRewarderByAdminOptions) {
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
    const parameterNames = ["distributor", "globalConfig", "pointConfig", "scoreboard", "market", "adminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'detach_yt_rewarder_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AttachLpPointRewardersByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    adminCap: RawTransactionArgument<string>;
}
export interface AttachLpPointRewardersByAdminOptions {
    package?: string;
    arguments: AttachLpPointRewardersByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        adminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Attach the position-level LP rewarder and pool checkpoint rewarder atomically.
 * LP point accounting is unsafe if either side exists alone: position mutations
 * need the LP scope while reserve mutations need the pool scope.
 */
export function attachLpPointRewardersByAdmin(options: AttachLpPointRewardersByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "pointConfig", "lpPointState", "scoreboard", "market", "adminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'attach_lp_point_rewarders_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DetachLpPointRewardersByAdminArguments {
    distributor: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    adminCap: RawTransactionArgument<string>;
}
export interface DetachLpPointRewardersByAdminOptions {
    package?: string;
    arguments: DetachLpPointRewardersByAdminArguments | [
        distributor: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        adminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Checkpoint one pool and stop this Scoreboard's LP accrual.
 *
 * The pool checkpoint rewarder is removed immediately. The LP rewarder stays
 * registered as a settlement-only tail: it produces no further points while
 * `reward_attached` is false, but it forces an LP exit/transfer to establish the
 * original owner's historical claim before the Position can move. The tail
 * intentionally remains registered because an unknown legacy Position may need its
 * first checkpoint long after the campaign is detached. It is a zero-accrual
 * settlement lane, not an active reward program.
 */
export function detachLpPointRewardersByAdmin(options: DetachLpPointRewardersByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["distributor", "globalConfig", "pointConfig", "lpPointState", "scoreboard", "market", "adminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'detach_lp_point_rewarders_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleYtRewardOperationArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    pyState: RawTransactionArgument<string>;
}
export interface SettleYtRewardOperationOptions {
    package?: string;
    arguments: SettleYtRewardOperationArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        pyState: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function settleYtRewardOperation(options: SettleYtRewardOperationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "project", "distributor", "operation", "position", "pyState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'settle_yt_reward_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleYtRewardOperationWithReferralArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    pyState: RawTransactionArgument<string>;
}
export interface SettleYtRewardOperationWithReferralOptions {
    package?: string;
    arguments: SettleYtRewardOperationWithReferralArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        pyState: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Referral-aware YT settlement. The owner receives the same gross base Stamp as
 * the generic route; the independent referral record accrues only the additional
 * referrer bonus. A marked position cannot use the generic route.
 */
export function settleYtRewardOperationWithReferral(options: SettleYtRewardOperationWithReferralOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "project", "referralState", "referralRecord", "distributor", "operation", "position", "pyState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'settle_yt_reward_operation_with_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleLpRewardOperationArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface SettleLpRewardOperationOptions {
    package?: string;
    arguments: SettleLpRewardOperationArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function settleLpRewardOperation(options: SettleLpRewardOperationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "lpPointState", "project", "distributor", "operation", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'settle_lp_reward_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleLpRewardOperationWithReferralArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface SettleLpRewardOperationWithReferralOptions {
    package?: string;
    arguments: SettleLpRewardOperationWithReferralArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Settle one LP reward operation for a referral-enabled position. The referee
 * keeps gross LP points; the referrer accrues an additional bonus.
 */
export function settleLpRewardOperationWithReferral(options: SettleLpRewardOperationWithReferralOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "lpPointState", "scoreboard", "distributor", "operation", "project", "referralState", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'settle_lp_reward_operation_with_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettlePoolRewardOperationArguments {
    globalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    distributor: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface SettlePoolRewardOperationOptions {
    package?: string;
    arguments: SettlePoolRewardOperationArguments | [
        globalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        distributor: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function settlePoolRewardOperation(options: SettlePoolRewardOperationOptions) {
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
    const parameterNames = ["globalConfig", "pointConfig", "lpPointState", "distributor", "operation", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'settle_pool_reward_operation',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CheckpointYtConfigToVersionArguments {
    pointConfig: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    targetVersion: RawTransactionArgument<number | bigint>;
}
export interface CheckpointYtConfigToVersionOptions {
    package?: string;
    arguments: CheckpointYtConfigToVersionArguments | [
        pointConfig: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        targetVersion: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Permissionlessly replay this market's YT configuration history up to an explicit
 * target. SDKs may choose their own batch size; ordinary settlement remains
 * blocked until the applied version reaches the current version.
 */
export function checkpointYtConfigToVersion(options: CheckpointYtConfigToVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "globalConfig", "market", "targetVersion"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'checkpoint_yt_config_to_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CheckpointLpConfigToVersionArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    targetVersion: RawTransactionArgument<number | bigint>;
}
export interface CheckpointLpConfigToVersionOptions {
    package?: string;
    arguments: CheckpointLpConfigToVersionArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        targetVersion: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Permissionlessly replay this pool's LP configuration history up to an explicit
 * target. The caller cannot alter parameters, exposure or ownership.
 */
export function checkpointLpConfigToVersion(options: CheckpointLpConfigToVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "globalConfig", "market", "targetVersion"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'checkpoint_lp_config_to_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RefreshPoolLpPointsWithPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface RefreshPoolLpPointsWithPointsOptions {
    package?: string;
    arguments: RefreshPoolLpPointsWithPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function refreshPoolLpPointsWithPoints(options: RefreshPoolLpPointsWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "globalConfig", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'refresh_pool_lp_points_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimLpPointsWithPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface ClaimLpPointsWithPointsOptions {
    package?: string;
    arguments: ClaimLpPointsWithPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Claim historical LP points without requiring an active reward attachment.
 *
 * This remains available after a season is detached. The accumulator is frozen
 * while detached, so this can only materialize points earned before the detach
 * checkpoint.
 */
export function claimLpPointsWithPoints(options: ClaimLpPointsWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "project", "globalConfig", "liquidlinkGlobalConfig", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'claim_lp_points_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyncPyPositionWithPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    pyState: RawTransactionArgument<string>;
}
export interface SyncPyPositionWithPointsOptions {
    package?: string;
    arguments: SyncPyPositionWithPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        pyState: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function syncPyPositionWithPoints(options: SyncPyPositionWithPointsOptions) {
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
    const parameterNames = ["pointConfig", "project", "globalConfig", "liquidlinkGlobalConfig", "position", "pyState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'sync_py_position_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtMultiplierBpsArguments {
    config: RawTransactionArgument<string>;
}
export interface YtMultiplierBpsOptions {
    package?: string;
    arguments: YtMultiplierBpsArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function ytMultiplierBps(options: YtMultiplierBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_multiplier_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpMultiplierBpsArguments {
    config: RawTransactionArgument<string>;
}
export interface LpMultiplierBpsOptions {
    package?: string;
    arguments: LpMultiplierBpsArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function lpMultiplierBps(options: LpMultiplierBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_multiplier_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DurationArguments {
    config: RawTransactionArgument<string>;
}
export interface DurationOptions {
    package?: string;
    arguments: DurationArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function duration(options: DurationOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'duration',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EnabledArguments {
    config: RawTransactionArgument<string>;
}
export interface EnabledOptions {
    package?: string;
    arguments: EnabledArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function enabled(options: EnabledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'enabled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ScoreboardIdArguments {
    config: RawTransactionArgument<string>;
}
export interface ScoreboardIdOptions {
    package?: string;
    arguments: ScoreboardIdArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function scoreboardId(options: ScoreboardIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'scoreboard_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectObjectIdArguments {
    config: RawTransactionArgument<string>;
}
export interface ProjectObjectIdOptions {
    package?: string;
    arguments: ProjectObjectIdArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function projectObjectId(options: ProjectObjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'project_object_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalYtAmountArguments {
    config: RawTransactionArgument<string>;
}
export interface TotalYtAmountOptions {
    package?: string;
    arguments: TotalYtAmountArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function totalYtAmount(options: TotalYtAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'total_yt_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalYtBaseArguments {
    config: RawTransactionArgument<string>;
}
export interface TotalYtBaseOptions {
    package?: string;
    arguments: TotalYtBaseArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function totalYtBase(options: TotalYtBaseOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'total_yt_base',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ConfigVersionArguments {
    config: RawTransactionArgument<string>;
}
export interface ConfigVersionOptions {
    package?: string;
    arguments: ConfigVersionArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function configVersion(options: ConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtConfigVersionArguments {
    config: RawTransactionArgument<string>;
}
export interface YtConfigVersionOptions {
    package?: string;
    arguments: YtConfigVersionArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function ytConfigVersion(options: YtConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpConfigVersionArguments {
    config: RawTransactionArgument<string>;
}
export interface LpConfigVersionOptions {
    package?: string;
    arguments: LpConfigVersionArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function lpConfigVersion(options: LpConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketMultiplierBpsArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketMultiplierBpsOptions {
    package?: string;
    arguments: YtMarketMultiplierBpsArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketMultiplierBps(options: YtMarketMultiplierBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_multiplier_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketAllowedArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketAllowedOptions {
    package?: string;
    arguments: YtMarketAllowedArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketAllowed(options: YtMarketAllowedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_allowed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtRewardAttachedArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtRewardAttachedOptions {
    package?: string;
    arguments: YtRewardAttachedArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytRewardAttached(options: YtRewardAttachedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_reward_attached',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtRewardInitializedArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtRewardInitializedOptions {
    package?: string;
    arguments: YtRewardInitializedArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytRewardInitialized(options: YtRewardInitializedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_reward_initialized',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketPointConfigVersionArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketPointConfigVersionOptions {
    package?: string;
    arguments: YtMarketPointConfigVersionArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketPointConfigVersion(options: YtMarketPointConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_point_config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpStateMultiplierBpsArguments {
    state: RawTransactionArgument<string>;
}
export interface LpStateMultiplierBpsOptions {
    package?: string;
    arguments: LpStateMultiplierBpsArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpStateMultiplierBps(options: LpStateMultiplierBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_state_multiplier_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpRewardAttachedArguments {
    state: RawTransactionArgument<string>;
}
export interface LpRewardAttachedOptions {
    package?: string;
    arguments: LpRewardAttachedArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpRewardAttached(options: LpRewardAttachedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_reward_attached',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpRewarderIdArguments {
    state: RawTransactionArgument<string>;
}
export interface LpRewarderIdOptions {
    package?: string;
    arguments: LpRewarderIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpRewarderId(options: LpRewarderIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_rewarder_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PoolRewarderIdArguments {
    state: RawTransactionArgument<string>;
}
export interface PoolRewarderIdOptions {
    package?: string;
    arguments: PoolRewarderIdArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function poolRewarderId(options: PoolRewarderIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'pool_rewarder_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpAccPointPerLpArguments {
    state: RawTransactionArgument<string>;
}
export interface LpAccPointPerLpOptions {
    package?: string;
    arguments: LpAccPointPerLpArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpAccPointPerLp(options: LpAccPointPerLpOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_acc_point_per_lp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpAccPointRemainderArguments {
    state: RawTransactionArgument<string>;
}
export interface LpAccPointRemainderOptions {
    package?: string;
    arguments: LpAccPointRemainderArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpAccPointRemainder(options: LpAccPointRemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_acc_point_remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpPointFractionRemainderQ128Arguments {
    state: RawTransactionArgument<string>;
}
export interface LpPointFractionRemainderQ128Options {
    package?: string;
    arguments: LpPointFractionRemainderQ128Arguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpPointFractionRemainderQ128(options: LpPointFractionRemainderQ128Options) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_point_fraction_remainder_q128',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpLastUpdatedMsArguments {
    state: RawTransactionArgument<string>;
}
export interface LpLastUpdatedMsOptions {
    package?: string;
    arguments: LpLastUpdatedMsArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpLastUpdatedMs(options: LpLastUpdatedMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_last_updated_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TotalLpPointsAccruedArguments {
    state: RawTransactionArgument<string>;
}
export interface TotalLpPointsAccruedOptions {
    package?: string;
    arguments: TotalLpPointsAccruedArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function totalLpPointsAccrued(options: TotalLpPointsAccruedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'total_lp_points_accrued',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpPointConfigVersionArguments {
    state: RawTransactionArgument<string>;
}
export interface LpPointConfigVersionOptions {
    package?: string;
    arguments: LpPointConfigVersionArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpPointConfigVersion(options: LpPointConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_point_config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpRewardTopologyRegisteredArguments {
    state: RawTransactionArgument<string>;
}
export interface LpRewardTopologyRegisteredOptions {
    package?: string;
    arguments: LpRewardTopologyRegisteredArguments | [
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpRewardTopologyRegistered(options: LpRewardTopologyRegisteredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_reward_topology_registered',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface UserYtBaseArguments {
    config: RawTransactionArgument<string>;
    owner: RawTransactionArgument<string>;
}
export interface UserYtBaseOptions {
    package?: string;
    arguments: UserYtBaseArguments | [
        config: RawTransactionArgument<string>,
        owner: RawTransactionArgument<string>
    ];
}
export function userYtBase(options: UserYtBaseOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "owner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'user_yt_base',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtPositionBaseArguments {
    config: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
}
export interface YtPositionBaseOptions {
    package?: string;
    arguments: YtPositionBaseArguments | [
        config: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>
    ];
}
export function ytPositionBase(options: YtPositionBaseOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "positionId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_position_base',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtPositionAmountArguments {
    config: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
}
export interface YtPositionAmountOptions {
    package?: string;
    arguments: YtPositionAmountArguments | [
        config: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>
    ];
}
export function ytPositionAmount(options: YtPositionAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "positionId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_position_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketBaseArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketBaseOptions {
    package?: string;
    arguments: YtMarketBaseArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketBase(options: YtMarketBaseOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_base',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketAmountArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketAmountOptions {
    package?: string;
    arguments: YtMarketAmountArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketAmount(options: YtMarketAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketLastUpdatedMsArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketLastUpdatedMsOptions {
    package?: string;
    arguments: YtMarketLastUpdatedMsArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketLastUpdatedMs(options: YtMarketLastUpdatedMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_last_updated_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtMarketAccPointPerBaseArguments {
    config: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface YtMarketAccPointPerBaseOptions {
    package?: string;
    arguments: YtMarketAccPointPerBaseArguments | [
        config: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function ytMarketAccPointPerBase(options: YtMarketAccPointPerBaseOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_market_acc_point_per_base',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtPositionPointRemainderArguments {
    config: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
}
export interface YtPositionPointRemainderOptions {
    package?: string;
    arguments: YtPositionPointRemainderArguments | [
        config: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>
    ];
}
export function ytPositionPointRemainder(options: YtPositionPointRemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "positionId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'yt_position_point_remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpPendingPointsArguments {
    state: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
}
export interface LpPendingPointsOptions {
    package?: string;
    arguments: LpPendingPointsArguments | [
        state: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpPendingPoints(options: LpPendingPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "positionId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_pending_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpPendingPointRemainderArguments {
    state: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
}
export interface LpPendingPointRemainderOptions {
    package?: string;
    arguments: LpPendingPointRemainderArguments | [
        state: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpPendingPointRemainder(options: LpPendingPointRemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "positionId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'lp_pending_point_remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RegisterYtReferralSourceByProjectCapArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
}
export interface RegisterYtReferralSourceByProjectCapOptions {
    package?: string;
    arguments: RegisterYtReferralSourceByProjectCapArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>
    ];
}
export function registerYtReferralSourceByProjectCap(options: RegisterYtReferralSourceByProjectCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "projectCap", "project", "pointConfig"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'register_yt_referral_source_by_project_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateYtReferralRecordWithPointsArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface CreateYtReferralRecordWithPointsOptions {
    package?: string;
    arguments: CreateYtReferralRecordWithPointsArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Create a YT referral mirror at the current accumulator baseline. Existing owner
 * accrual is intentionally excluded, so enabling referral is never retroactive.
 */
export function createYtReferralRecordWithPoints(options: CreateYtReferralRecordWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralTable", "pointConfig", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'create_yt_referral_record_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BindYtReferrerArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface BindYtReferrerOptions {
    package?: string;
    arguments: BindYtReferrerArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function bindYtReferrer(options: BindYtReferrerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "project", "referralState", "referralTable", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'bind_yt_referrer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyncPyPositionWithReferralPointsArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface SyncPyPositionWithReferralPointsOptions {
    package?: string;
    arguments: SyncPyPositionWithReferralPointsArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function syncPyPositionWithReferralPoints(options: SyncPyPositionWithReferralPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "project", "referralState", "referralRecord", "position", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'sync_py_position_with_referral_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimYtReferralPointsWithPointsArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface ClaimYtReferralPointsWithPointsOptions {
    package?: string;
    arguments: ClaimYtReferralPointsWithPointsArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Anyone may checkpoint and claim the referrer bonus. The caller supplies no
 * owner, referrer, exposure or amount; all values come from bound on-chain state.
 */
export function claimYtReferralPointsWithPoints(options: ClaimYtReferralPointsWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "scoreboard", "project", "referralState", "referralRecord", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'claim_yt_referral_points_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DetachYtReferralRecordWithPointsArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface DetachYtReferralRecordWithPointsOptions {
    package?: string;
    arguments: DetachYtReferralRecordWithPointsArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * A YT referral mirror can be detached only after YT exposure is zero. This closes
 * bonus accounting and releases the Position transfer lock.
 */
export function detachYtReferralRecordWithPoints(options: DetachYtReferralRecordWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "pointConfig", "scoreboard", "project", "referralState", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'detach_yt_referral_record_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RegisterLpReferralSourceByProjectCapArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
}
export interface RegisterLpReferralSourceByProjectCapOptions {
    package?: string;
    arguments: RegisterLpReferralSourceByProjectCapArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function registerLpReferralSourceByProjectCap(options: RegisterLpReferralSourceByProjectCapOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "projectCap", "project", "lpPointState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'register_lp_referral_source_by_project_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CreateLpReferralRecordWithPointsArguments {
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface CreateLpReferralRecordWithPointsOptions {
    package?: string;
    arguments: CreateLpReferralRecordWithPointsArguments | [
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function createLpReferralRecordWithPoints(options: CreateLpReferralRecordWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralTable", "pointConfig", "lpPointState", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'create_lp_referral_record_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BindLpReferrerArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface BindLpReferrerOptions {
    package?: string;
    arguments: BindLpReferrerArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Bind an LP referral record after the position owner has selected a referral
 * code. The pool accumulator and record exposure are checkpointed first, so the
 * referrer receives bonus only for subsequent LP point growth.
 */
export function bindLpReferrer(options: BindLpReferrerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralTable", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'bind_lp_referrer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SettleLpPositionWithReferralPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface SettleLpPositionWithReferralPointsOptions {
    package?: string;
    arguments: SettleLpPositionWithReferralPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function settleLpPositionWithReferralPoints(options: SettleLpPositionWithReferralPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'settle_lp_position_with_referral_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimLpPointsWithReferralPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface ClaimLpPointsWithReferralPointsOptions {
    package?: string;
    arguments: ClaimLpPointsWithReferralPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function claimLpPointsWithReferralPoints(options: ClaimLpPointsWithReferralPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'claim_lp_points_with_referral_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimLpReferralPointsWithPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
}
export interface ClaimLpReferralPointsWithPointsOptions {
    package?: string;
    arguments: ClaimLpReferralPointsWithPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function claimLpReferralPointsWithPoints(options: ClaimLpReferralPointsWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "scoreboard", "globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralRecord", "market"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'claim_lp_referral_points_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DetachLpReferralRecordWithPointsArguments {
    pointConfig: RawTransactionArgument<string>;
    lpPointState: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    liquidlinkGlobalConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralState: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    position: RawTransactionArgument<string>;
}
export interface DetachLpReferralRecordWithPointsOptions {
    package?: string;
    arguments: DetachLpReferralRecordWithPointsArguments | [
        pointConfig: RawTransactionArgument<string>,
        lpPointState: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        liquidlinkGlobalConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralState: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        position: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Settle and detach all owner-bound LP referral accounting before an empty
 * position is transferred or destroyed. Whole points are paid to the old
 * referee/referrer; unrepresentable sub-point dust is explicitly reported and
 * forfeited. The position transfer lock is released only after both records and
 * the marker have been closed.
 */
export function detachLpReferralRecordWithPoints(options: DetachLpReferralRecordWithPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["pointConfig", "lpPointState", "scoreboard", "globalConfig", "liquidlinkGlobalConfig", "project", "referralState", "referralRecord", "market", "position"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'liquidlink_points',
        function: 'detach_lp_referral_record_with_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}