/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** Package-scoped version and pause checks for Jitter reward extensions. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter-extensions::package_version';
export const PackageMarker = new MoveStruct({ name: `${$moduleName}::PackageMarker`, fields: {
        dummy_field: bcs.bool()
    } });
export interface VersionOptions {
    package?: string;
    arguments?: [
    ];
}
export function version(options: VersionOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'package_version',
        function: 'version',
    });
}
export interface CurrentArguments {
    config: RawTransactionArgument<string>;
}
export interface CurrentOptions {
    package?: string;
    arguments: CurrentArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function current(options: CurrentOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-extensions';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'package_version',
        function: 'current',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}