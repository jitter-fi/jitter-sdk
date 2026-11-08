/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs, type BcsType } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as project from './deps/liquidlink_incentive_system/project.js';
import * as type_name from './deps/std/type_name.js';
const $moduleName = 'jitter/jitter-referral::referral_policy';
export const JitterReferralPolicy = new MoveStruct({ name: `${$moduleName}::JitterReferralPolicy`, fields: {
        dummy_field: bcs.bool()
    } });
export const ReferralPolicyState = new MoveStruct({ name: `${$moduleName}::ReferralPolicyState`, fields: {
        id: bcs.Address,
        project_object_id: bcs.Address,
        project_id: bcs.Address,
        enabled: bcs.bool(),
        closed: bcs.bool(),
        closed_at_ms: bcs.u64(),
        referral_bps: bcs.u64(),
        settlement_cap: project.PolicySettlementCap
    } });
export const LpReferralSourceCap = new MoveStruct({ name: `${$moduleName}::LpReferralSourceCap<phantom W>`, fields: {
        project_id: bcs.Address,
        source_id: bcs.Address
    } });
export const YtReferralSourceCap = new MoveStruct({ name: `${$moduleName}::YtReferralSourceCap<phantom W>`, fields: {
        project_id: bcs.Address,
        source_id: bcs.Address
    } });
export const LpReferralRecord = new MoveStruct({ name: `${$moduleName}::LpReferralRecord`, fields: {
        id: bcs.Address,
        project_id: bcs.Address,
        state_id: bcs.Address,
        source_id: bcs.Address,
        pool_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referral_bps: bcs.u64(),
        lp_amount: bcs.u64(),
        point_exposure: bcs.u64(),
        reward_debt: bcs.u256(),
        pending_points: bcs.u64(),
        pending_bonus_numerator_remainder: bcs.u256()
    } });
export const YtReferralRecord = new MoveStruct({ name: `${$moduleName}::YtReferralRecord`, fields: {
        id: bcs.Address,
        project_id: bcs.Address,
        state_id: bcs.Address,
        source_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referral_bps: bcs.u64(),
        base_amount: bcs.u256(),
        reward_debt_scaled: bcs.u256(),
        pending_points: bcs.u64(),
        pending_bonus_numerator_remainder: bcs.u256()
    } });
export const DeferredReferralClaim = new MoveStruct({ name: `${$moduleName}::DeferredReferralClaim`, fields: {
        id: bcs.Address,
        owner: bcs.Address,
        referee: bcs.Address,
        project_object_id: bcs.Address,
        project_id: bcs.Address,
        state_id: bcs.Address,
        source_id: bcs.Address,
        source_witness: type_name.TypeName,
        market_id: bcs.Address,
        position_id: bcs.Address,
        record_id: bcs.Address,
        is_lp: bcs.bool(),
        pending_points: bcs.u64(),
        pending_bonus_numerator_remainder: bcs.u256(),
        precision: bcs.u256()
    } });
export const ReferralArchivedKey = new MoveStruct({ name: `${$moduleName}::ReferralArchivedKey`, fields: {
        dummy_field: bcs.bool()
    } });
export const ReferralArchived = new MoveStruct({ name: `${$moduleName}::ReferralArchived`, fields: {
        claim_id: bcs.Address,
        record_id: bcs.Address,
        owner: bcs.Address,
        pending_points: bcs.u64(),
        pending_bonus_numerator_remainder: bcs.u256(),
        precision: bcs.u256()
    } });
export const ArchivedReferralClaimed = new MoveStruct({ name: `${$moduleName}::ArchivedReferralClaimed`, fields: {
        claim_id: bcs.Address,
        record_id: bcs.Address,
        owner: bcs.Address,
        amount: bcs.u64(),
        pending_bonus_numerator_remainder: bcs.u256()
    } });
export const ReferralPolicyStateCreated = new MoveStruct({ name: `${$moduleName}::ReferralPolicyStateCreated`, fields: {
        state_id: bcs.Address,
        project_object_id: bcs.Address,
        project_id: bcs.Address,
        referral_bps: bcs.u64()
    } });
export const ReferralBpsUpdated = new MoveStruct({ name: `${$moduleName}::ReferralBpsUpdated`, fields: {
        state_id: bcs.Address,
        project_id: bcs.Address,
        referral_bps: bcs.u64()
    } });
export const ReferralEnabledUpdated = new MoveStruct({ name: `${$moduleName}::ReferralEnabledUpdated`, fields: {
        state_id: bcs.Address,
        project_id: bcs.Address,
        enabled: bcs.bool()
    } });
export const ReferralCampaignClosed = new MoveStruct({ name: `${$moduleName}::ReferralCampaignClosed`, fields: {
        state_id: bcs.Address,
        project_id: bcs.Address,
        closed_at_ms: bcs.u64()
    } });
export const ReferralPolicyApplied = new MoveStruct({ name: `${$moduleName}::ReferralPolicyApplied`, fields: {
        state_id: bcs.Address,
        project_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.option(bcs.Address),
        referral_bps: bcs.u64()
    } });
export const LpReferralRecordCreated = new MoveStruct({ name: `${$moduleName}::LpReferralRecordCreated`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        pool_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referral_bps: bcs.u64(),
        lp_amount: bcs.u64(),
        point_exposure: bcs.u64()
    } });
export const LpReferralRecordSynced = new MoveStruct({ name: `${$moduleName}::LpReferralRecordSynced`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        pool_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        lp_amount_before: bcs.u64(),
        lp_amount_after: bcs.u64(),
        point_exposure_before: bcs.u64(),
        point_exposure_after: bcs.u64(),
        referral_bps_before: bcs.u64(),
        referral_bps_after: bcs.u64(),
        pending_points: bcs.u64()
    } });
export const LpReferrerBound = new MoveStruct({ name: `${$moduleName}::LpReferrerBound`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        pool_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referral_bps: bcs.u64(),
        acc_point_per_lp: bcs.u128(),
        forfeited_pending_points: bcs.u64(),
        forfeited_bonus_numerator_remainder: bcs.u256()
    } });
export const LpReferralClaimed = new MoveStruct({ name: `${$moduleName}::LpReferralClaimed`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        pool_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        amount: bcs.u64(),
        pending_after: bcs.u64()
    } });
export const LpReferralRecordClosed = new MoveStruct({ name: `${$moduleName}::LpReferralRecordClosed`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        pool_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        forfeited_bonus_numerator_remainder: bcs.u256()
    } });
export const YtReferralRecordCreated = new MoveStruct({ name: `${$moduleName}::YtReferralRecordCreated`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referral_bps: bcs.u64(),
        base_amount: bcs.u256()
    } });
export const YtReferralRecordSynced = new MoveStruct({ name: `${$moduleName}::YtReferralRecordSynced`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        base_amount_before: bcs.u256(),
        base_amount_after: bcs.u256(),
        referral_bps_before: bcs.u64(),
        referral_bps_after: bcs.u64(),
        pending_points: bcs.u64()
    } });
export const YtReferrerBound = new MoveStruct({ name: `${$moduleName}::YtReferrerBound`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        referral_bps: bcs.u64(),
        acc_point_per_base: bcs.u256(),
        forfeited_pending_points: bcs.u64(),
        forfeited_bonus_numerator_remainder: bcs.u256()
    } });
export const YtReferralClaimed = new MoveStruct({ name: `${$moduleName}::YtReferralClaimed`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        amount: bcs.u64(),
        pending_after: bcs.u64()
    } });
export const YtReferralRecordClosed = new MoveStruct({ name: `${$moduleName}::YtReferralRecordClosed`, fields: {
        record_id: bcs.Address,
        state_id: bcs.Address,
        project_id: bcs.Address,
        source_id: bcs.Address,
        market_id: bcs.Address,
        position_id: bcs.Address,
        referee: bcs.Address,
        referrer: bcs.Address,
        forfeited_bonus_numerator_remainder: bcs.u256()
    } });
export interface ShareLpRecordArguments {
    record: RawTransactionArgument<string>;
}
export interface ShareLpRecordOptions {
    package?: string;
    arguments: ShareLpRecordArguments | [
        record: RawTransactionArgument<string>
    ];
}
/**
 * Records are shared, non-custodial accounting state. Without `store`, callers
 * cannot transfer, freeze or wrap them separately from the locked Position.
 * Publishing a newly created record does not change rewards or bypass pause.
 */
export function shareLpRecord(options: ShareLpRecordOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'share_lp_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ShareYtRecordArguments {
    record: RawTransactionArgument<string>;
}
export interface ShareYtRecordOptions {
    package?: string;
    arguments: ShareYtRecordArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function shareYtRecord(options: ShareYtRecordOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'share_yt_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterPolicyArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface RegisterPolicyOptions {
    package?: string;
    arguments: RegisterPolicyArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
}
export function registerPolicy(options: RegisterPolicyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'register_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UnregisterPolicyArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface UnregisterPolicyOptions {
    package?: string;
    arguments: UnregisterPolicyArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
}
export function unregisterPolicy(options: UnregisterPolicyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "scoreboard", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'unregister_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateStateArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    referralBps: RawTransactionArgument<number | bigint>;
}
export interface CreateStateOptions {
    package?: string;
    arguments: CreateStateArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        referralBps: RawTransactionArgument<number | bigint>
    ];
}
export function createState(options: CreateStateOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "referralBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'create_state',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetReferralBpsArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralBps: RawTransactionArgument<number | bigint>;
}
export interface SetReferralBpsOptions {
    package?: string;
    arguments: SetReferralBpsArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralBps: RawTransactionArgument<number | bigint>
    ];
}
export function setReferralBps(options: SetReferralBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "state", "referralBps"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'set_referral_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetEnabledArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetEnabledOptions {
    package?: string;
    arguments: SetEnabledArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
}
export function setEnabled(options: SetEnabledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "state", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'set_enabled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CloseCampaignArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface CloseCampaignOptions {
    package?: string;
    arguments: CloseCampaignArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
}
/**
 * Close new referral participation without unregistering the policy cap. Existing
 * records still need that cap to claim their pre-close bonus. The associated
 * PointConfig must be closed in the same admin transaction.
 */
export function closeCampaign(options: CloseCampaignOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "scoreboard", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'close_campaign',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateLpReferralSourceCapArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceId: RawTransactionArgument<string>;
}
export interface CreateLpReferralSourceCapOptions<W extends BcsType<any>> {
    package?: string;
    arguments: CreateLpReferralSourceCapArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function createLpReferralSourceCap<W extends BcsType<any>>(options: CreateLpReferralSourceCapOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "auth", "sourceId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'create_lp_referral_source_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CreateYtReferralSourceCapArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    projectCap: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceId: RawTransactionArgument<string>;
}
export interface CreateYtReferralSourceCapOptions<W extends BcsType<any>> {
    package?: string;
    arguments: CreateYtReferralSourceCapArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        projectCap: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function createYtReferralSourceCap<W extends BcsType<any>>(options: CreateYtReferralSourceCapOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "projectCap", "project", "auth", "sourceId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'create_yt_referral_source_cap',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ApplyPolicyArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    stamp: RawTransactionArgument<string>;
}
export interface ApplyPolicyOptions {
    package?: string;
    arguments: ApplyPolicyArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        stamp: RawTransactionArgument<string>
    ];
}
export function applyPolicy(options: ApplyPolicyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "state", "referralTable", "stamp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'apply_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ApplyLpBonusPolicyArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    stamp: RawTransactionArgument<string>;
}
export interface ApplyLpBonusPolicyOptions {
    package?: string;
    arguments: ApplyLpBonusPolicyArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        stamp: RawTransactionArgument<string>
    ];
}
/**
 * Confirm the referral policy for an LP stamp whose referrer bonus is tracked by
 * `LpReferralRecord`. Unlike the generic redirect policy, this preserves 100% of
 * the referee's points because the record accounts for the referrer bonus
 * separately.
 */
export function applyLpBonusPolicy(options: ApplyLpBonusPolicyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "state", "referralRecord", "stamp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'apply_lp_bonus_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ApplyYtBonusPolicyArguments {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralRecord: RawTransactionArgument<string>;
    stamp: RawTransactionArgument<string>;
}
export interface ApplyYtBonusPolicyOptions {
    package?: string;
    arguments: ApplyYtBonusPolicyArguments | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralRecord: RawTransactionArgument<string>,
        stamp: RawTransactionArgument<string>
    ];
}
/**
 * Confirm referral policy completion without redirecting any of the referee's YT
 * points. Referrer bonus is settled independently from `YtReferralRecord`, so
 * staking or other policies applied to this Stamp do not multiply the referral
 * bonus.
 */
export function applyYtBonusPolicy(options: ApplyYtBonusPolicyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "state", "referralRecord", "stamp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'apply_yt_bonus_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateLpReferralRecordArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    referee: RawTransactionArgument<string>;
    poolId: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
    lpAmount: RawTransactionArgument<number | bigint>;
    pointExposure: RawTransactionArgument<number | bigint>;
    accPointPerLp: RawTransactionArgument<number | bigint>;
}
export interface CreateLpReferralRecordOptions<W extends BcsType<any>> {
    package?: string;
    arguments: CreateLpReferralRecordArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        referee: RawTransactionArgument<string>,
        poolId: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>,
        lpAmount: RawTransactionArgument<number | bigint>,
        pointExposure: RawTransactionArgument<number | bigint>,
        accPointPerLp: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function createLpReferralRecord<W extends BcsType<any>>(options: CreateLpReferralRecordOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        'address',
        '0x2::object::ID',
        '0x2::object::ID',
        'u64',
        'u64',
        'u128'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "referralTable", "referee", "poolId", "positionId", "lpAmount", "pointExposure", "accPointPerLp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'create_lp_referral_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyncLpReferralRecordArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    lpAmount: RawTransactionArgument<number | bigint>;
    pointExposure: RawTransactionArgument<number | bigint>;
    accPointPerLp: RawTransactionArgument<number | bigint>;
}
export interface SyncLpReferralRecordOptions<W extends BcsType<any>> {
    package?: string;
    arguments: SyncLpReferralRecordArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        lpAmount: RawTransactionArgument<number | bigint>,
        pointExposure: RawTransactionArgument<number | bigint>,
        accPointPerLp: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function syncLpReferralRecord<W extends BcsType<any>>(options: SyncLpReferralRecordOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        'u64',
        'u64',
        'u128'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "record", "lpAmount", "pointExposure", "accPointPerLp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'sync_lp_referral_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BindLpReferrerArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    accPointPerLp: RawTransactionArgument<number | bigint>;
}
export interface BindLpReferrerOptions<W extends BcsType<any>> {
    package?: string;
    arguments: BindLpReferrerArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        accPointPerLp: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Bind a previously unbound LP referral record to the referee's current
 * ReferralTable entry. Historical accumulator growth is checkpointed without
 * referral bps, so only growth after this call can produce referral bonus.
 */
export function bindLpReferrer<W extends BcsType<any>>(options: BindLpReferrerOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        null,
        'u128'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "referralTable", "record", "accPointPerLp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'bind_lp_referrer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimLpReferralArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    accPointPerLp: RawTransactionArgument<number | bigint>;
    duration: RawTransactionArgument<number | bigint>;
}
export interface ClaimLpReferralOptions<W extends BcsType<any>> {
    package?: string;
    arguments: ClaimLpReferralArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        accPointPerLp: RawTransactionArgument<number | bigint>,
        duration: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function claimLpReferral<W extends BcsType<any>>(options: ClaimLpReferralOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        null,
        'u128',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "record", "scoreboard", "accPointPerLp", "duration"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'claim_lp_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CloseLpReferralRecordArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
}
export interface CloseLpReferralRecordOptions<W extends BcsType<any>> {
    package?: string;
    arguments: CloseLpReferralRecordArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Close a fully settled LP referral record. Sub-point referral dust cannot be
 * represented by Scoreboard's whole-point unit, so it is reported and deliberately
 * forfeited rather than rounded up.
 */
export function closeLpReferralRecord<W extends BcsType<any>>(options: CloseLpReferralRecordOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'close_lp_referral_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CreateYtReferralRecordArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    referee: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    positionId: RawTransactionArgument<string>;
    baseAmount: RawTransactionArgument<number | bigint>;
    accPointPerBase: RawTransactionArgument<number | bigint>;
}
export interface CreateYtReferralRecordOptions<W extends BcsType<any>> {
    package?: string;
    arguments: CreateYtReferralRecordArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        referee: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        positionId: RawTransactionArgument<string>,
        baseAmount: RawTransactionArgument<number | bigint>,
        accPointPerBase: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function createYtReferralRecord<W extends BcsType<any>>(options: CreateYtReferralRecordOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        'address',
        '0x2::object::ID',
        '0x2::object::ID',
        'u256',
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "referralTable", "referee", "marketId", "positionId", "baseAmount", "accPointPerBase"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'create_yt_referral_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyncYtReferralRecordArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    baseAmount: RawTransactionArgument<number | bigint>;
    accPointPerBase: RawTransactionArgument<number | bigint>;
}
export interface SyncYtReferralRecordOptions<W extends BcsType<any>> {
    package?: string;
    arguments: SyncYtReferralRecordArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        baseAmount: RawTransactionArgument<number | bigint>,
        accPointPerBase: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function syncYtReferralRecord<W extends BcsType<any>>(options: SyncYtReferralRecordOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        'u256',
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "record", "baseAmount", "accPointPerBase"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'sync_yt_referral_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BindYtReferrerArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    referralTable: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    accPointPerBase: RawTransactionArgument<number | bigint>;
}
export interface BindYtReferrerOptions<W extends BcsType<any>> {
    package?: string;
    arguments: BindYtReferrerArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        referralTable: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        accPointPerBase: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Bind at the current accumulator baseline. Historical YT accrual is never
 * reassigned to the newly selected referrer.
 */
export function bindYtReferrer<W extends BcsType<any>>(options: BindYtReferrerOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        null,
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "referralTable", "record", "accPointPerBase"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'bind_yt_referrer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimYtReferralArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    accPointPerBase: RawTransactionArgument<number | bigint>;
    duration: RawTransactionArgument<number | bigint>;
}
export interface ClaimYtReferralOptions<W extends BcsType<any>> {
    package?: string;
    arguments: ClaimYtReferralArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        accPointPerBase: RawTransactionArgument<number | bigint>,
        duration: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Permissionless settlement is safe because recipient, exposure, source and amount
 * are all derived from the authenticated record and accumulator.
 */
export function claimYtReferral<W extends BcsType<any>>(options: ClaimYtReferralOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        null,
        'u256',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "record", "scoreboard", "accPointPerBase", "duration"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'claim_yt_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CloseYtReferralRecordArguments<W extends BcsType<any>> {
    referralConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    auth: RawTransactionArgument<W>;
    sourceCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
}
export interface CloseYtReferralRecordOptions<W extends BcsType<any>> {
    package?: string;
    arguments: CloseYtReferralRecordArguments<W> | [
        referralConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        auth: RawTransactionArgument<W>,
        sourceCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function closeYtReferralRecord<W extends BcsType<any>>(options: CloseYtReferralRecordOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["referralConfig", "liquidlinkConfig", "project", "auth", "sourceCap", "state", "record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'close_yt_referral_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ArchiveLpReferralArguments<W extends BcsType<any>> {
    jitterConfig: RawTransactionArgument<string>;
    Auth: RawTransactionArgument<W>;
    cap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    acc: RawTransactionArgument<number | bigint>;
}
export interface ArchiveLpReferralOptions<W extends BcsType<any>> {
    package?: string;
    arguments: ArchiveLpReferralArguments<W> | [
        jitterConfig: RawTransactionArgument<string>,
        Auth: RawTransactionArgument<W>,
        cap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        acc: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * The trusted source must supply its frozen campaign accumulator and validate the
 * caller's position. Liquidlink availability is checked only when crediting.
 */
export function archiveLpReferral<W extends BcsType<any>>(options: ArchiveLpReferralOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        'u128'
    ] satisfies (string | null)[];
    const parameterNames = ["jitterConfig", "Auth", "cap", "state", "record", "acc"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'archive_lp_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ArchiveYtReferralArguments<W extends BcsType<any>> {
    jitterConfig: RawTransactionArgument<string>;
    Auth: RawTransactionArgument<W>;
    cap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    record: RawTransactionArgument<string>;
    acc: RawTransactionArgument<number | bigint>;
}
export interface ArchiveYtReferralOptions<W extends BcsType<any>> {
    package?: string;
    arguments: ArchiveYtReferralArguments<W> | [
        jitterConfig: RawTransactionArgument<string>,
        Auth: RawTransactionArgument<W>,
        cap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        record: RawTransactionArgument<string>,
        acc: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function archiveYtReferral<W extends BcsType<any>>(options: ArchiveYtReferralOptions<W>) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`,
        null,
        null,
        null,
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["jitterConfig", "Auth", "cap", "state", "record", "acc"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'archive_yt_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimArchivedReferralArguments {
    jitterConfig: RawTransactionArgument<string>;
    liquidlinkConfig: RawTransactionArgument<string>;
    project: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    scoreboard: RawTransactionArgument<string>;
    claim: RawTransactionArgument<string>;
}
export interface ClaimArchivedReferralOptions {
    package?: string;
    arguments: ClaimArchivedReferralArguments | [
        jitterConfig: RawTransactionArgument<string>,
        liquidlinkConfig: RawTransactionArgument<string>,
        project: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        scoreboard: RawTransactionArgument<string>,
        claim: RawTransactionArgument<string>
    ];
}
export function claimArchivedReferral(options: ClaimArchivedReferralOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["jitterConfig", "liquidlinkConfig", "project", "state", "scoreboard", "claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'claim_archived_referral',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimOwnerArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimOwnerOptions {
    package?: string;
    arguments: DeferredReferralClaimOwnerArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimOwner(options: DeferredReferralClaimOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimRefereeArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimRefereeOptions {
    package?: string;
    arguments: DeferredReferralClaimRefereeArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimReferee(options: DeferredReferralClaimRefereeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_referee',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimProjectObjectIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimProjectObjectIdOptions {
    package?: string;
    arguments: DeferredReferralClaimProjectObjectIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimProjectObjectId(options: DeferredReferralClaimProjectObjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_project_object_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimProjectIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimProjectIdOptions {
    package?: string;
    arguments: DeferredReferralClaimProjectIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimProjectId(options: DeferredReferralClaimProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimStateIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimStateIdOptions {
    package?: string;
    arguments: DeferredReferralClaimStateIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimStateId(options: DeferredReferralClaimStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimSourceIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimSourceIdOptions {
    package?: string;
    arguments: DeferredReferralClaimSourceIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimSourceId(options: DeferredReferralClaimSourceIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_source_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimSourceWitnessArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimSourceWitnessOptions {
    package?: string;
    arguments: DeferredReferralClaimSourceWitnessArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimSourceWitness(options: DeferredReferralClaimSourceWitnessOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_source_witness',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimMarketIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimMarketIdOptions {
    package?: string;
    arguments: DeferredReferralClaimMarketIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
/** For LP claims this is the original pool ID. */
export function deferredReferralClaimMarketId(options: DeferredReferralClaimMarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimPositionIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimPositionIdOptions {
    package?: string;
    arguments: DeferredReferralClaimPositionIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimPositionId(options: DeferredReferralClaimPositionIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_position_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimRecordIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimRecordIdOptions {
    package?: string;
    arguments: DeferredReferralClaimRecordIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimRecordId(options: DeferredReferralClaimRecordIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_record_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimIsLpArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimIsLpOptions {
    package?: string;
    arguments: DeferredReferralClaimIsLpArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimIsLp(options: DeferredReferralClaimIsLpOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_is_lp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimPendingPointsArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimPendingPointsOptions {
    package?: string;
    arguments: DeferredReferralClaimPendingPointsArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimPendingPoints(options: DeferredReferralClaimPendingPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_pending_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimPendingBonusNumeratorRemainderArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimPendingBonusNumeratorRemainderOptions {
    package?: string;
    arguments: DeferredReferralClaimPendingBonusNumeratorRemainderArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimPendingBonusNumeratorRemainder(options: DeferredReferralClaimPendingBonusNumeratorRemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_pending_bonus_numerator_remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeferredReferralClaimPrecisionArguments {
    claim: RawTransactionArgument<string>;
}
export interface DeferredReferralClaimPrecisionOptions {
    package?: string;
    arguments: DeferredReferralClaimPrecisionArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function deferredReferralClaimPrecision(options: DeferredReferralClaimPrecisionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'deferred_referral_claim_precision',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordArchivedArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordArchivedOptions {
    package?: string;
    arguments: LpReferralRecordArchivedArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordArchived(options: LpReferralRecordArchivedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_archived',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordArchivedArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordArchivedOptions {
    package?: string;
    arguments: YtReferralRecordArchivedArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordArchived(options: YtReferralRecordArchivedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_archived',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectIdArguments {
    state: RawTransactionArgument<string>;
}
export interface ProjectIdOptions {
    package?: string;
    arguments: ProjectIdArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function projectId(options: ProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectObjectIdArguments {
    state: RawTransactionArgument<string>;
}
export interface ProjectObjectIdOptions {
    package?: string;
    arguments: ProjectObjectIdArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function projectObjectId(options: ProjectObjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'project_object_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ReferralBpsArguments {
    state: RawTransactionArgument<string>;
}
export interface ReferralBpsOptions {
    package?: string;
    arguments: ReferralBpsArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function referralBps(options: ReferralBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'referral_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EnabledArguments {
    state: RawTransactionArgument<string>;
}
export interface EnabledOptions {
    package?: string;
    arguments: EnabledArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function enabled(options: EnabledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'enabled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ClosedArguments {
    state: RawTransactionArgument<string>;
}
export interface ClosedOptions {
    package?: string;
    arguments: ClosedArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function closed(options: ClosedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'closed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ClosedAtMsArguments {
    state: RawTransactionArgument<string>;
}
export interface ClosedAtMsOptions {
    package?: string;
    arguments: ClosedAtMsArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function closedAtMs(options: ClosedAtMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'closed_at_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralSourceCapProjectIdArguments {
    cap: RawTransactionArgument<string>;
}
export interface LpReferralSourceCapProjectIdOptions {
    package?: string;
    arguments: LpReferralSourceCapProjectIdArguments | [
        cap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpReferralSourceCapProjectId(options: LpReferralSourceCapProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_source_cap_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpReferralSourceCapSourceIdArguments {
    cap: RawTransactionArgument<string>;
}
export interface LpReferralSourceCapSourceIdOptions {
    package?: string;
    arguments: LpReferralSourceCapSourceIdArguments | [
        cap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function lpReferralSourceCapSourceId(options: LpReferralSourceCapSourceIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_source_cap_source_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtReferralSourceCapProjectIdArguments {
    cap: RawTransactionArgument<string>;
}
export interface YtReferralSourceCapProjectIdOptions {
    package?: string;
    arguments: YtReferralSourceCapProjectIdArguments | [
        cap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function ytReferralSourceCapProjectId(options: YtReferralSourceCapProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_source_cap_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface YtReferralSourceCapSourceIdArguments {
    cap: RawTransactionArgument<string>;
}
export interface YtReferralSourceCapSourceIdOptions {
    package?: string;
    arguments: YtReferralSourceCapSourceIdArguments | [
        cap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function ytReferralSourceCapSourceId(options: YtReferralSourceCapSourceIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_source_cap_source_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LpReferralRecordProjectIdArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordProjectIdOptions {
    package?: string;
    arguments: LpReferralRecordProjectIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordProjectId(options: LpReferralRecordProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordStateIdArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordStateIdOptions {
    package?: string;
    arguments: LpReferralRecordStateIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordStateId(options: LpReferralRecordStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordSourceIdArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordSourceIdOptions {
    package?: string;
    arguments: LpReferralRecordSourceIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordSourceId(options: LpReferralRecordSourceIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_source_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordPoolIdArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordPoolIdOptions {
    package?: string;
    arguments: LpReferralRecordPoolIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordPoolId(options: LpReferralRecordPoolIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_pool_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordPositionIdArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordPositionIdOptions {
    package?: string;
    arguments: LpReferralRecordPositionIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordPositionId(options: LpReferralRecordPositionIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_position_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordRefereeArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordRefereeOptions {
    package?: string;
    arguments: LpReferralRecordRefereeArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordReferee(options: LpReferralRecordRefereeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_referee',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordReferrerArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordReferrerOptions {
    package?: string;
    arguments: LpReferralRecordReferrerArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordReferrer(options: LpReferralRecordReferrerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_referrer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordReferralBpsArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordReferralBpsOptions {
    package?: string;
    arguments: LpReferralRecordReferralBpsArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordReferralBps(options: LpReferralRecordReferralBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_referral_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordLpAmountArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordLpAmountOptions {
    package?: string;
    arguments: LpReferralRecordLpAmountArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordLpAmount(options: LpReferralRecordLpAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_lp_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordPointExposureArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordPointExposureOptions {
    package?: string;
    arguments: LpReferralRecordPointExposureArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordPointExposure(options: LpReferralRecordPointExposureOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_point_exposure',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordPendingPointsArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordPendingPointsOptions {
    package?: string;
    arguments: LpReferralRecordPendingPointsArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordPendingPoints(options: LpReferralRecordPendingPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_pending_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LpReferralRecordPendingBonusNumeratorRemainderArguments {
    record: RawTransactionArgument<string>;
}
export interface LpReferralRecordPendingBonusNumeratorRemainderOptions {
    package?: string;
    arguments: LpReferralRecordPendingBonusNumeratorRemainderArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function lpReferralRecordPendingBonusNumeratorRemainder(options: LpReferralRecordPendingBonusNumeratorRemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'lp_referral_record_pending_bonus_numerator_remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PendingLpReferralPointsArguments {
    record: RawTransactionArgument<string>;
    accPointPerLp: RawTransactionArgument<number | bigint>;
}
export interface PendingLpReferralPointsOptions {
    package?: string;
    arguments: PendingLpReferralPointsArguments | [
        record: RawTransactionArgument<string>,
        accPointPerLp: RawTransactionArgument<number | bigint>
    ];
}
export function pendingLpReferralPoints(options: PendingLpReferralPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        'u128'
    ] satisfies (string | null)[];
    const parameterNames = ["record", "accPointPerLp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'pending_lp_referral_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordProjectIdArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordProjectIdOptions {
    package?: string;
    arguments: YtReferralRecordProjectIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordProjectId(options: YtReferralRecordProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordStateIdArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordStateIdOptions {
    package?: string;
    arguments: YtReferralRecordStateIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordStateId(options: YtReferralRecordStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordSourceIdArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordSourceIdOptions {
    package?: string;
    arguments: YtReferralRecordSourceIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordSourceId(options: YtReferralRecordSourceIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_source_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordMarketIdArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordMarketIdOptions {
    package?: string;
    arguments: YtReferralRecordMarketIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordMarketId(options: YtReferralRecordMarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordPositionIdArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordPositionIdOptions {
    package?: string;
    arguments: YtReferralRecordPositionIdArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordPositionId(options: YtReferralRecordPositionIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_position_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordRefereeArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordRefereeOptions {
    package?: string;
    arguments: YtReferralRecordRefereeArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordReferee(options: YtReferralRecordRefereeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_referee',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordReferrerArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordReferrerOptions {
    package?: string;
    arguments: YtReferralRecordReferrerArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordReferrer(options: YtReferralRecordReferrerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_referrer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordReferralBpsArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordReferralBpsOptions {
    package?: string;
    arguments: YtReferralRecordReferralBpsArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordReferralBps(options: YtReferralRecordReferralBpsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_referral_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordBaseAmountArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordBaseAmountOptions {
    package?: string;
    arguments: YtReferralRecordBaseAmountArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordBaseAmount(options: YtReferralRecordBaseAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_base_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordPendingPointsArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordPendingPointsOptions {
    package?: string;
    arguments: YtReferralRecordPendingPointsArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordPendingPoints(options: YtReferralRecordPendingPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_pending_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface YtReferralRecordPendingBonusNumeratorRemainderArguments {
    record: RawTransactionArgument<string>;
}
export interface YtReferralRecordPendingBonusNumeratorRemainderOptions {
    package?: string;
    arguments: YtReferralRecordPendingBonusNumeratorRemainderArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function ytReferralRecordPendingBonusNumeratorRemainder(options: YtReferralRecordPendingBonusNumeratorRemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'yt_referral_record_pending_bonus_numerator_remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PendingYtReferralPointsArguments {
    record: RawTransactionArgument<string>;
    accPointPerBase: RawTransactionArgument<number | bigint>;
}
export interface PendingYtReferralPointsOptions {
    package?: string;
    arguments: PendingYtReferralPointsArguments | [
        record: RawTransactionArgument<string>,
        accPointPerBase: RawTransactionArgument<number | bigint>
    ];
}
export function pendingYtReferralPoints(options: PendingYtReferralPointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["record", "accPointPerBase"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'referral_policy',
        function: 'pending_yt_referral_points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}