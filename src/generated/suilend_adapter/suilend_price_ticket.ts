/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** suilend_price_ticket - Suilend cToken ratio quote source. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/suilend-adapter::suilend_price_ticket';
export const QuoteCollectedEvent = new MoveStruct({ name: `${$moduleName}::QuoteCollectedEvent`, fields: {
        market_id: bcs.Address,
        reserve_id: bcs.Address,
        ratio_wad: bcs.u256(),
        sy_index: bcs.u128(),
        updated_at: bcs.u64()
    } });
export interface QuoteArguments {
    globalConfig: RawTransactionArgument<string>;
    collector: RawTransactionArgument<string>;
    vault: RawTransactionArgument<string>;
    reserve: RawTransactionArgument<string>;
}
export interface QuoteOptions {
    package?: string;
    arguments: QuoteArguments | [
        globalConfig: RawTransactionArgument<string>,
        collector: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        reserve: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function quote(options: QuoteOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "collector", "vault", "reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_price_ticket',
        function: 'quote',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CurrentSyIndexArguments {
    reserve: RawTransactionArgument<string>;
}
export interface CurrentSyIndexOptions {
    package?: string;
    arguments: CurrentSyIndexArguments | [
        reserve: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function currentSyIndex(options: CurrentSyIndexOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_price_ticket',
        function: 'current_sy_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyIndexFromRatioWadArguments {
    ratioWad: RawTransactionArgument<number | bigint>;
}
export interface SyIndexFromRatioWadOptions {
    package?: string;
    arguments: SyIndexFromRatioWadArguments | [
        ratioWad: RawTransactionArgument<number | bigint>
    ];
}
export function syIndexFromRatioWad(options: SyIndexFromRatioWadOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["ratioWad"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_price_ticket',
        function: 'sy_index_from_ratio_wad',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}