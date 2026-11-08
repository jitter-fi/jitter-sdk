/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** Constant-sized snapshot; catalogue pages are read from the Table UIDs. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter-registry::offchain';
export const RegistrySnapshot = new MoveStruct({ name: `${$moduleName}::RegistrySnapshot`, fields: {
        registry_id: bcs.Address,
        protocol_count: bcs.u64(),
        series_count: bcs.u64(),
        market_count: bcs.u64(),
        program_count: bcs.u64(),
        source_count: bcs.u64(),
        market_source_count: bcs.u64()
    } });
export interface RegistrySnapshotArguments {
    config: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
}
export interface RegistrySnapshotOptions {
    package?: string;
    arguments: RegistrySnapshotArguments | [
        config: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>
    ];
}
export function registrySnapshot(options: RegistrySnapshotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config", "registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_snapshot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}