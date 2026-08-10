/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * suilend_market_vault - Suilend cToken backed SY adapter.
 *
 * This adapter wraps Suilend `CToken<P, Underlying>` receipt assets as Jitter SY.
 * Supplying underlying into Suilend and redeeming cTokens back to underlying are
 * external routing steps.
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as balance from './deps/sui/balance.js';
const $moduleName = 'jitter/suilend-adapter::suilend_market_vault';
export const SuilendMarketVault = new MoveStruct({ name: `${$moduleName}::SuilendMarketVault<phantom P, phantom Underlying, phantom SY, phantom PT, phantom YT>`, fields: {
        id: bcs.Address,
        market_id: bcs.Address,
        reserve_id: bcs.Address,
        reserve_array_index: bcs.u64(),
        ctoken_balance: balance.Balance,
        updated_at: bcs.u64()
    } });
export const MarketVaultCreatedEvent = new MoveStruct({ name: `${$moduleName}::MarketVaultCreatedEvent`, fields: {
        vault_id: bcs.Address,
        market_id: bcs.Address,
        reserve_id: bcs.Address,
        reserve_array_index: bcs.u64(),
        created_by: bcs.Address
    } });
export const DepositEvent = new MoveStruct({ name: `${$moduleName}::DepositEvent`, fields: {
        market_id: bcs.Address,
        reserve_id: bcs.Address,
        underlying_value_in: bcs.u64(),
        ctoken_in: bcs.u64(),
        ctoken_change_out: bcs.u64(),
        depositor: bcs.Address
    } });
export const RedeemEvent = new MoveStruct({ name: `${$moduleName}::RedeemEvent`, fields: {
        market_id: bcs.Address,
        reserve_id: bcs.Address,
        underlying_value_out: bcs.u64(),
        ctoken_out: bcs.u64(),
        redeemer: bcs.Address
    } });
export interface CreateMarketVaultBy_ACLArguments {
    acl: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    reserve: RawTransactionArgument<string>;
}
export interface CreateMarketVaultBy_ACLOptions {
    package?: string;
    arguments: CreateMarketVaultBy_ACLArguments | [
        acl: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
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
export function createMarketVaultBy_ACL(options: CreateMarketVaultBy_ACLOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["acl", "syState", "globalConfig", "market", "reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'create_market_vault_by_ACL',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CreateMarketVaultByAdminArguments {
    Admin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    reserve: RawTransactionArgument<string>;
}
export interface CreateMarketVaultByAdminOptions {
    package?: string;
    arguments: CreateMarketVaultByAdminArguments | [
        Admin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
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
export function createMarketVaultByAdmin(options: CreateMarketVaultByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["Admin", "syState", "globalConfig", "market", "reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'create_market_vault_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DepositArguments {
    request: RawTransactionArgument<string>;
    ctokenCoin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    vault: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    reserve: RawTransactionArgument<string>;
}
export interface DepositOptions {
    package?: string;
    arguments: DepositArguments | [
        request: RawTransactionArgument<string>,
        ctokenCoin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
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
/**
 * Escrow Suilend cTokens and settle a Jitter `MintSyRequest`.
 *
 * `MintSyRequest.amount` is denominated in the underlying token while
 * `MintSyRequest.sy_amount` records the exact cToken share amount. The adapter
 * escrows that exact share amount and returns any excess cTokens.
 */
export function deposit(options: DepositOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
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
    const parameterNames = ["request", "ctokenCoin", "syState", "globalConfig", "vault", "market", "reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'deposit',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RedeemArguments {
    request: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    vault: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    reserve: RawTransactionArgument<string>;
}
export interface RedeemOptions {
    package?: string;
    arguments: RedeemArguments | [
        request: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
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
/** Burn Jitter SY and return Suilend cTokens. */
export function redeem(options: RedeemOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["request", "syState", "globalConfig", "vault", "market", "reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'redeem',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface VaultIdArguments {
    vault: RawTransactionArgument<string>;
}
export interface VaultIdOptions {
    package?: string;
    arguments: VaultIdArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function vaultId(options: VaultIdOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'vault_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface MarketIdArguments {
    vault: RawTransactionArgument<string>;
}
export interface MarketIdOptions {
    package?: string;
    arguments: MarketIdArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function marketId(options: MarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ReserveIdArguments {
    vault: RawTransactionArgument<string>;
}
export interface ReserveIdOptions {
    package?: string;
    arguments: ReserveIdArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function reserveId(options: ReserveIdOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'reserve_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ReserveArrayIndexArguments {
    vault: RawTransactionArgument<string>;
}
export interface ReserveArrayIndexOptions {
    package?: string;
    arguments: ReserveArrayIndexArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function reserveArrayIndex(options: ReserveArrayIndexOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'reserve_array_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CtokenBalanceArguments {
    vault: RawTransactionArgument<string>;
}
export interface CtokenBalanceOptions {
    package?: string;
    arguments: CtokenBalanceArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function ctokenBalance(options: CtokenBalanceOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'ctoken_balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface UpdatedAtArguments {
    vault: RawTransactionArgument<string>;
}
export interface UpdatedAtOptions {
    package?: string;
    arguments: UpdatedAtArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function updatedAt(options: UpdatedAtOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'updated_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CurrentCtokenRatioWadArguments {
    reserve: RawTransactionArgument<string>;
}
export interface CurrentCtokenRatioWadOptions {
    package?: string;
    arguments: CurrentCtokenRatioWadArguments | [
        reserve: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Returns the cToken exchange rate stored in the active Suilend Reserve.
 *
 * Suilend updates this value when its lending market accrues interest. The active
 * mainnet ABI does not expose the source-only simulated ratio helper.
 */
export function currentCtokenRatioWad(options: CurrentCtokenRatioWadOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["reserve"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'current_ctoken_ratio_wad',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CtokensForUnderlyingCeilArguments {
    underlyingAmount: RawTransactionArgument<number | bigint>;
    ratioWad: RawTransactionArgument<number | bigint>;
}
export interface CtokensForUnderlyingCeilOptions {
    package?: string;
    arguments: CtokensForUnderlyingCeilArguments | [
        underlyingAmount: RawTransactionArgument<number | bigint>,
        ratioWad: RawTransactionArgument<number | bigint>
    ];
}
export function ctokensForUnderlyingCeil(options: CtokensForUnderlyingCeilOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        'u64',
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["underlyingAmount", "ratioWad"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'ctokens_for_underlying_ceil',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CtokensForUnderlyingFloorArguments {
    underlyingAmount: RawTransactionArgument<number | bigint>;
    ratioWad: RawTransactionArgument<number | bigint>;
}
export interface CtokensForUnderlyingFloorOptions {
    package?: string;
    arguments: CtokensForUnderlyingFloorArguments | [
        underlyingAmount: RawTransactionArgument<number | bigint>,
        ratioWad: RawTransactionArgument<number | bigint>
    ];
}
export function ctokensForUnderlyingFloor(options: CtokensForUnderlyingFloorOptions) {
    const packageAddress = options.package ?? 'jitter/suilend-adapter';
    const argumentsTypes = [
        'u64',
        'u256'
    ] satisfies (string | null)[];
    const parameterNames = ["underlyingAmount", "ratioWad"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'suilend_market_vault',
        function: 'ctokens_for_underlying_floor',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}