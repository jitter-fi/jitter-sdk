/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** Small predicates shared by registry mutations and the formal harness. */

import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
export interface RevisionMatchesArguments {
    current: RawTransactionArgument<number | bigint>;
    expected: RawTransactionArgument<number | bigint>;
}
export interface RevisionMatchesOptions {
    package?: string;
    arguments: RevisionMatchesArguments | [
        current: RawTransactionArgument<number | bigint>,
        expected: RawTransactionArgument<number | bigint>
    ];
}
export function revisionMatches(options: RevisionMatchesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["current", "expected"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'registry_rules',
        function: 'revision_matches',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NextRevisionArguments {
    current: RawTransactionArgument<number | bigint>;
}
export interface NextRevisionOptions {
    package?: string;
    arguments: NextRevisionArguments | [
        current: RawTransactionArgument<number | bigint>
    ];
}
export function nextRevision(options: NextRevisionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["current"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'registry_rules',
        function: 'next_revision',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ValidScopesArguments {
    yt: RawTransactionArgument<boolean>;
    lp: RawTransactionArgument<boolean>;
    hasLpState: RawTransactionArgument<boolean>;
}
export interface ValidScopesOptions {
    package?: string;
    arguments: ValidScopesArguments | [
        yt: RawTransactionArgument<boolean>,
        lp: RawTransactionArgument<boolean>,
        hasLpState: RawTransactionArgument<boolean>
    ];
}
export function validScopes(options: ValidScopesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'bool',
        'bool',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["yt", "lp", "hasLpState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'registry_rules',
        function: 'valid_scopes',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SameParentArguments {
    actual: RawTransactionArgument<number | bigint>;
    expected: RawTransactionArgument<number | bigint>;
}
export interface SameParentOptions {
    package?: string;
    arguments: SameParentArguments | [
        actual: RawTransactionArgument<number | bigint>,
        expected: RawTransactionArgument<number | bigint>
    ];
}
export function sameParent(options: SameParentOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["actual", "expected"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'registry_rules',
        function: 'same_parent',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithinSizeArguments {
    size: RawTransactionArgument<number | bigint>;
    limit: RawTransactionArgument<number | bigint>;
}
export interface WithinSizeOptions {
    package?: string;
    arguments: WithinSizeArguments | [
        size: RawTransactionArgument<number | bigint>,
        limit: RawTransactionArgument<number | bigint>
    ];
}
export function withinSize(options: WithinSizeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["size", "limit"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'registry_rules',
        function: 'within_size',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}