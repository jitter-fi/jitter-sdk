/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** navi_price_ticket - NAVI supply-index quote source. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/navi-adapter::navi_price_ticket';
export const QuoteCollectedEvent = new MoveStruct({ name: `${$moduleName}::QuoteCollectedEvent`, fields: {
        market_id: bcs.Address,
        navi_storage_id: bcs.Address,
        navi_pool_id: bcs.Address,
        asset_id: bcs.u8(),
        supply_index_ray: bcs.u256(),
        sy_index: bcs.u128(),
        updated_at: bcs.u64()
    } });
export interface QuoteArguments {
    globalConfig: RawTransactionArgument<string>;
    collector: RawTransactionArgument<string>;
    vault: RawTransactionArgument<string>;
    storage: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
}
export interface QuoteOptions {
    package?: string;
    arguments: QuoteArguments | [
        globalConfig: RawTransactionArgument<string>,
        collector: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        storage: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function quote(options: QuoteOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "collector", "vault", "storage", "pool"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_price_ticket',
        function: 'quote',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyIndexFromSupplyIndexRayArguments {
    supplyIndexRay: RawTransactionArgument<number | bigint>;
}
export interface SyIndexFromSupplyIndexRayOptions {
    package?: string;
    arguments: SyIndexFromSupplyIndexRayArguments | [
        supplyIndexRay: RawTransactionArgument<number | bigint>
    ];
}
export function syIndexFromSupplyIndexRay(options: SyIndexFromSupplyIndexRayOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["supplyIndexRay"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_price_ticket',
        function: 'sy_index_from_supply_index_ray',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}