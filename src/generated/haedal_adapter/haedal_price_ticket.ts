/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/haedal-adapter::haedal_price_ticket';
export const QuoteCollectedEvent = new MoveStruct({ name: `${$moduleName}::QuoteCollectedEvent`, fields: {
        market_id: bcs.Address,
        staking_id: bcs.Address,
        exchange_rate: bcs.u64(),
        sy_index: bcs.u128(),
        updated_at: bcs.u64()
    } });
export interface QuoteArguments {
    globalConfig: RawTransactionArgument<string>;
    collector: RawTransactionArgument<string>;
    vault: RawTransactionArgument<string>;
    staking: RawTransactionArgument<string>;
}
export interface QuoteOptions {
    package?: string;
    arguments: QuoteArguments | [
        globalConfig: RawTransactionArgument<string>,
        collector: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        staking: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Use Haedal's officially published on-chain rate, without projecting rewards. The
 * ticket's updated_at is the observation time. Its TTL cannot certify upstream
 * accrual freshness; delayed publication is an accepted source risk.
 */
export function quote(options: QuoteOptions) {
    const packageAddress = options.package ?? 'jitter/haedal-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "collector", "vault", "staking"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'haedal_price_ticket',
        function: 'quote',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SyIndexFromExchangeRateArguments {
    exchangeRate: RawTransactionArgument<number | bigint>;
}
export interface SyIndexFromExchangeRateOptions {
    package?: string;
    arguments: SyIndexFromExchangeRateArguments | [
        exchangeRate: RawTransactionArgument<number | bigint>
    ];
}
export function syIndexFromExchangeRate(options: SyIndexFromExchangeRateOptions) {
    const packageAddress = options.package ?? 'jitter/haedal-adapter';
    const argumentsTypes = [
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["exchangeRate"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'haedal_price_ticket',
        function: 'sy_index_from_exchange_rate',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}