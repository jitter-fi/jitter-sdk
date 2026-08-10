/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * navi_market_vault - NAVI supply-position backed SY adapter.
 *
 * NAVI lending does not mint transferable receipt coins. This adapter creates and
 * wraps a NAVI `AccountCap`; deposits and withdrawals are booked to that account,
 * while Jitter SY represents a claim on the adapter's NAVI supply position.
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as account from './deps/lending_core/account.js';
const $moduleName = 'jitter/navi-adapter::navi_market_vault';
export const NaviMarketVault = new MoveStruct({ name: `${$moduleName}::NaviMarketVault<phantom Underlying, phantom SY, phantom PT, phantom YT>`, fields: {
        id: bcs.Address,
        market_id: bcs.Address,
        navi_storage_id: bcs.Address,
        navi_pool_id: bcs.Address,
        asset_id: bcs.u8(),
        account_cap: account.AccountCap,
        total_underlying_deposited: bcs.u128(),
        total_underlying_withdrawn: bcs.u128(),
        updated_at: bcs.u64()
    } });
export const MarketVaultCreatedEvent = new MoveStruct({ name: `${$moduleName}::MarketVaultCreatedEvent`, fields: {
        vault_id: bcs.Address,
        market_id: bcs.Address,
        navi_storage_id: bcs.Address,
        navi_pool_id: bcs.Address,
        asset_id: bcs.u8(),
        account_owner: bcs.Address,
        created_by: bcs.Address
    } });
export const DepositEvent = new MoveStruct({ name: `${$moduleName}::DepositEvent`, fields: {
        market_id: bcs.Address,
        navi_storage_id: bcs.Address,
        navi_pool_id: bcs.Address,
        asset_id: bcs.u8(),
        underlying_in: bcs.u64(),
        account_owner: bcs.Address,
        depositor: bcs.Address
    } });
export const RedeemEvent = new MoveStruct({ name: `${$moduleName}::RedeemEvent`, fields: {
        market_id: bcs.Address,
        navi_storage_id: bcs.Address,
        navi_pool_id: bcs.Address,
        asset_id: bcs.u8(),
        underlying_out: bcs.u64(),
        account_owner: bcs.Address,
        redeemer: bcs.Address
    } });
export interface CreateMarketVaultBy_ACLArguments {
    acl: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    storage: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
    assetId: RawTransactionArgument<number>;
}
export interface CreateMarketVaultBy_ACLOptions {
    package?: string;
    arguments: CreateMarketVaultBy_ACLArguments | [
        acl: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        storage: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>,
        assetId: RawTransactionArgument<number>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function createMarketVaultBy_ACL(options: CreateMarketVaultBy_ACLOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        'u8',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["acl", "syState", "globalConfig", "market", "storage", "pool", "assetId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
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
    storage: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
    assetId: RawTransactionArgument<number>;
}
export interface CreateMarketVaultByAdminOptions {
    package?: string;
    arguments: CreateMarketVaultByAdminArguments | [
        Admin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        storage: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>,
        assetId: RawTransactionArgument<number>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function createMarketVaultByAdmin(options: CreateMarketVaultByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        null,
        'u8',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["Admin", "syState", "globalConfig", "market", "storage", "pool", "assetId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'create_market_vault_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DepositArguments {
    request: RawTransactionArgument<string>;
    underlyingCoin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    vault: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    storage: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
    incentive: RawTransactionArgument<string>;
    incentiveV2: RawTransactionArgument<string>;
}
export interface DepositOptions {
    package?: string;
    arguments: DepositArguments | [
        request: RawTransactionArgument<string>,
        underlyingCoin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        storage: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>,
        incentive: RawTransactionArgument<string>,
        incentiveV2: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
/**
 * Deposit underlying into NAVI under the adapter-owned NAVI account and settle the
 * Jitter `MintSyRequest`.
 */
export function deposit(options: DepositOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
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
    const parameterNames = ["request", "underlyingCoin", "syState", "globalConfig", "vault", "market", "storage", "pool", "incentive", "incentiveV2"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
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
    storage: RawTransactionArgument<string>;
    pool: RawTransactionArgument<string>;
    oracle: RawTransactionArgument<string>;
    incentive: RawTransactionArgument<string>;
    incentiveV2: RawTransactionArgument<string>;
}
export interface RedeemOptions {
    package?: string;
    arguments: RedeemArguments | [
        request: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        vault: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        storage: RawTransactionArgument<string>,
        pool: RawTransactionArgument<string>,
        oracle: RawTransactionArgument<string>,
        incentive: RawTransactionArgument<string>,
        incentiveV2: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
/**
 * Burn Jitter SY and withdraw underlying from the adapter-owned NAVI account.
 *
 * This uses NAVI's active `incentive_v2` account-cap withdrawal route.
 */
export function redeem(options: RedeemOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
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
    const parameterNames = ["request", "syState", "globalConfig", "vault", "market", "storage", "pool", "oracle", "incentive", "incentiveV2"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
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
        string
    ];
}
export function vaultId(options: VaultIdOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
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
        string
    ];
}
export function marketId(options: MarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface NaviStorageIdArguments {
    vault: RawTransactionArgument<string>;
}
export interface NaviStorageIdOptions {
    package?: string;
    arguments: NaviStorageIdArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function naviStorageId(options: NaviStorageIdOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'navi_storage_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface NaviPoolIdArguments {
    vault: RawTransactionArgument<string>;
}
export interface NaviPoolIdOptions {
    package?: string;
    arguments: NaviPoolIdArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function naviPoolId(options: NaviPoolIdOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'navi_pool_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssetIdArguments {
    vault: RawTransactionArgument<string>;
}
export interface AssetIdOptions {
    package?: string;
    arguments: AssetIdArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function assetId(options: AssetIdOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'asset_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AccountOwnerArguments {
    vault: RawTransactionArgument<string>;
}
export interface AccountOwnerOptions {
    package?: string;
    arguments: AccountOwnerArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function accountOwner(options: AccountOwnerOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'account_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TotalUnderlyingDepositedArguments {
    vault: RawTransactionArgument<string>;
}
export interface TotalUnderlyingDepositedOptions {
    package?: string;
    arguments: TotalUnderlyingDepositedArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function totalUnderlyingDeposited(options: TotalUnderlyingDepositedOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'total_underlying_deposited',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface TotalUnderlyingWithdrawnArguments {
    vault: RawTransactionArgument<string>;
}
export interface TotalUnderlyingWithdrawnOptions {
    package?: string;
    arguments: TotalUnderlyingWithdrawnArguments | [
        vault: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string
    ];
}
export function totalUnderlyingWithdrawn(options: TotalUnderlyingWithdrawnOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'total_underlying_withdrawn',
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
        string
    ];
}
export function updatedAt(options: UpdatedAtOptions) {
    const packageAddress = options.package ?? 'jitter/navi-adapter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["vault"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'navi_market_vault',
        function: 'updated_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}