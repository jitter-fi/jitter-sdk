/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** Closed-campaign rights remain owned independently of the original Position. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter-extensions::point_claim';
export const PointClaim = new MoveStruct({ name: `${$moduleName}::PointClaim`, fields: {
        id: bcs.Address,
        config_id: bcs.Address,
        market_id: bcs.Address,
        source_id: bcs.Address,
        position_id: bcs.Address,
        owner: bcs.Address,
        scope: bcs.u8(),
        points: bcs.u64(),
        remainder: bcs.u256(),
        precision: bcs.u256(),
        closed_at_ms: bcs.u64(),
        referral_state_id: bcs.option(bcs.Address),
        referral_record_id: bcs.option(bcs.Address)
    } });
export const PointsArchived = new MoveStruct({ name: `${$moduleName}::PointsArchived`, fields: {
        claim_id: bcs.Address,
        config_id: bcs.Address,
        market_id: bcs.Address,
        source_id: bcs.Address,
        position_id: bcs.Address,
        owner: bcs.Address,
        scope: bcs.u8(),
        points: bcs.u64(),
        remainder: bcs.u256(),
        precision: bcs.u256(),
        closed_at_ms: bcs.u64()
    } });
export const PointsClaimed = new MoveStruct({ name: `${$moduleName}::PointsClaimed`, fields: {
        claim_id: bcs.Address,
        config_id: bcs.Address,
        owner: bcs.Address,
        points: bcs.u64(),
        remainder: bcs.u256()
    } });
export const PointClaimDestroyed = new MoveStruct({ name: `${$moduleName}::PointClaimDestroyed`, fields: {
        claim_id: bcs.Address,
        owner: bcs.Address,
        discarded_remainder: bcs.u256(),
        precision: bcs.u256()
    } });
export interface ConfigIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface ConfigIdOptions {
    package?: string;
    arguments: ConfigIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function configId(options: ConfigIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'config_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface MarketIdOptions {
    package?: string;
    arguments: MarketIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function marketId(options: MarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SourceIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface SourceIdOptions {
    package?: string;
    arguments: SourceIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function sourceId(options: SourceIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'source_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PositionIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface PositionIdOptions {
    package?: string;
    arguments: PositionIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function positionId(options: PositionIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'position_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OwnerArguments {
    claim: RawTransactionArgument<string>;
}
export interface OwnerOptions {
    package?: string;
    arguments: OwnerArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function owner(options: OwnerOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ScopeArguments {
    claim: RawTransactionArgument<string>;
}
export interface ScopeOptions {
    package?: string;
    arguments: ScopeArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function scope(options: ScopeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'scope',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointsArguments {
    claim: RawTransactionArgument<string>;
}
export interface PointsOptions {
    package?: string;
    arguments: PointsArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function points(options: PointsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'points',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RemainderArguments {
    claim: RawTransactionArgument<string>;
}
export interface RemainderOptions {
    package?: string;
    arguments: RemainderArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function remainder(options: RemainderOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'remainder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PrecisionArguments {
    claim: RawTransactionArgument<string>;
}
export interface PrecisionOptions {
    package?: string;
    arguments: PrecisionArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function precision(options: PrecisionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'precision',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ClosedAtMsArguments {
    claim: RawTransactionArgument<string>;
}
export interface ClosedAtMsOptions {
    package?: string;
    arguments: ClosedAtMsArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function closedAtMs(options: ClosedAtMsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'closed_at_ms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ReferralStateIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface ReferralStateIdOptions {
    package?: string;
    arguments: ReferralStateIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function referralStateId(options: ReferralStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'referral_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ReferralRecordIdArguments {
    claim: RawTransactionArgument<string>;
}
export interface ReferralRecordIdOptions {
    package?: string;
    arguments: ReferralRecordIdArguments | [
        claim: RawTransactionArgument<string>
    ];
}
export function referralRecordId(options: ReferralRecordIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["claim"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'point_claim',
        function: 'referral_record_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}