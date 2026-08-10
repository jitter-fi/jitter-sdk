/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs, type BcsType } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as type_name from './deps/std/type_name.js';
import * as type_name_1 from './deps/std/type_name.js';
import * as vec_map from './deps/sui/vec_map.js';
import * as type_name_2 from './deps/std/type_name.js';
import * as type_name_3 from './deps/std/type_name.js';
import * as type_name_4 from './deps/std/type_name.js';
import * as type_name_5 from './deps/std/type_name.js';
import * as type_name_6 from './deps/std/type_name.js';
import * as type_name_7 from './deps/std/type_name.js';
import * as type_name_8 from './deps/std/type_name.js';
import * as type_name_9 from './deps/std/type_name.js';
const $moduleName = 'jitter/jitter::sy';
export const SyInfo = new MoveStruct({ name: `${$moduleName}::SyInfo`, fields: {
        underlying_type: type_name.TypeName,
        sign_type: type_name_1.TypeName,
        market_id: bcs.option(bcs.Address),
        vault_id: bcs.option(bcs.Address)
    } });
export const SyState = new MoveStruct({ name: `${$moduleName}::SyState`, fields: {
        id: bcs.Address,
        sy_info: vec_map.VecMap(type_name_2.TypeName, SyInfo)
    } });
export const MintSyRequest = new MoveStruct({ name: `${$moduleName}::MintSyRequest<phantom SY>`, fields: {
        market_id: bcs.Address,
        sy_amount: bcs.u64(),
        amount: bcs.u64()
    } });
export const BurnSyRequest = new MoveStruct({ name: `${$moduleName}::BurnSyRequest<phantom SY>`, fields: {
        market_id: bcs.Address,
        sy_amount: bcs.u64(),
        amount: bcs.u64()
    } });
export const SyRegisteredEvent = new MoveStruct({ name: `${$moduleName}::SyRegisteredEvent`, fields: {
        sy_type: type_name_3.TypeName,
        underlying_type: type_name_4.TypeName,
        sign_type: type_name_5.TypeName
    } });
export const SyUnregisteredEvent = new MoveStruct({ name: `${$moduleName}::SyUnregisteredEvent`, fields: {
        sy_type: type_name_6.TypeName
    } });
export const SyMarketVaultBoundEvent = new MoveStruct({ name: `${$moduleName}::SyMarketVaultBoundEvent`, fields: {
        sy_type: type_name_7.TypeName,
        underlying_type: type_name_8.TypeName,
        sign_type: type_name_9.TypeName,
        market_id: bcs.Address,
        vault_id: bcs.Address
    } });
export interface RegisterNewSyArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface RegisterNewSyOptions {
    package?: string;
    arguments: RegisterNewSyArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function registerNewSy(options: RegisterNewSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'register_new_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface UnregisterSyArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface UnregisterSyOptions {
    package?: string;
    arguments: UnregisterSyArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Remove an SY registration. Intended for deprecating a misconfigured adapter
 * before any liquidity is onboarded; new mints via this SY type will fail at
 * `destroy_mint_request` (no sign_type match), and callers holding outstanding
 * `MintSyRequest`/`BurnSyRequest` should be settled first. (audit finding M-2)
 */
export function unregisterSy(options: UnregisterSyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'unregister_sy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface MintSyExactInMarketStateArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    exactIn: RawTransactionArgument<number | bigint>;
}
export interface MintSyExactInMarketStateOptions {
    package?: string;
    arguments: MintSyExactInMarketStateArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        exactIn: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function mintSyExactInMarketState(options: MintSyExactInMarketStateOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "priceInfo", "exactIn"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'mint_sy_exact_in_market_state',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BindMarketVaultArguments<Sign extends BcsType<any>> {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    Sign: RawTransactionArgument<Sign>;
    marketId: RawTransactionArgument<string>;
    vaultId: RawTransactionArgument<string>;
}
export interface BindMarketVaultOptions<Sign extends BcsType<any>> {
    package?: string;
    arguments: BindMarketVaultArguments<Sign> | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        Sign: RawTransactionArgument<Sign>,
        marketId: RawTransactionArgument<string>,
        vaultId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
/**
 * Bind one registered SY type to its unique economic underlying, MarketState, and
 * adapter vault. The adapter witness prevents arbitrary callers from claiming a
 * registration. V1 intentionally has no replacement path.
 */
export function bindMarketVault<Sign extends BcsType<any>>(options: BindMarketVaultOptions<Sign>) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        `${options.typeArguments[2]}`,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "Sign", "marketId", "vaultId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'bind_market_vault',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface MarketUnderlyingTypeArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    expectedMarketId: RawTransactionArgument<string>;
}
export interface MarketUnderlyingTypeOptions {
    package?: string;
    arguments: MarketUnderlyingTypeArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        expectedMarketId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Returns the registered economic underlying for an SY type after proving the
 * registration is bound to the expected MarketState.
 */
export function marketUnderlyingType(options: MarketUnderlyingTypeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "expectedMarketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'market_underlying_type',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BurnSyExactInMarketStateArguments {
    state: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    priceInfo: RawTransactionArgument<string>;
    syIn: RawTransactionArgument<string>;
}
export interface BurnSyExactInMarketStateOptions {
    package?: string;
    arguments: BurnSyExactInMarketStateArguments | [
        state: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        priceInfo: RawTransactionArgument<string>,
        syIn: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function burnSyExactInMarketState(options: BurnSyExactInMarketStateOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    const parameterNames = ["state", "globalConfig", "priceInfo", "syIn"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'burn_sy_exact_in_market_state',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface GetMintRequestAmountArguments {
    request: RawTransactionArgument<string>;
}
export interface GetMintRequestAmountOptions {
    package?: string;
    arguments: GetMintRequestAmountArguments | [
        request: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function getMintRequestAmount(options: GetMintRequestAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["request"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'get_mint_request_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface GetMintRequestSyAmountArguments {
    request: RawTransactionArgument<string>;
}
export interface GetMintRequestSyAmountOptions {
    package?: string;
    arguments: GetMintRequestSyAmountArguments | [
        request: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function getMintRequestSyAmount(options: GetMintRequestSyAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["request"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'get_mint_request_sy_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface GetMintRequestMarketIdArguments {
    request: RawTransactionArgument<string>;
}
export interface GetMintRequestMarketIdOptions {
    package?: string;
    arguments: GetMintRequestMarketIdArguments | [
        request: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function getMintRequestMarketId(options: GetMintRequestMarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["request"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'get_mint_request_market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface GetBurnRequestAmountArguments {
    request: RawTransactionArgument<string>;
}
export interface GetBurnRequestAmountOptions {
    package?: string;
    arguments: GetBurnRequestAmountArguments | [
        request: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function getBurnRequestAmount(options: GetBurnRequestAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["request"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'get_burn_request_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface GetBurnRequestSyAmountArguments {
    request: RawTransactionArgument<string>;
}
export interface GetBurnRequestSyAmountOptions {
    package?: string;
    arguments: GetBurnRequestSyAmountArguments | [
        request: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function getBurnRequestSyAmount(options: GetBurnRequestSyAmountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["request"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'get_burn_request_sy_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface GetBurnRequestMarketIdArguments {
    request: RawTransactionArgument<string>;
}
export interface GetBurnRequestMarketIdOptions {
    package?: string;
    arguments: GetBurnRequestMarketIdArguments | [
        request: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function getBurnRequestMarketId(options: GetBurnRequestMarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["request"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'get_burn_request_market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DestroyMintRequestArguments<Sign extends BcsType<any>> {
    request: RawTransactionArgument<string>;
    Sign: RawTransactionArgument<Sign>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    expectedMarketId: RawTransactionArgument<string>;
    expectedVaultId: RawTransactionArgument<string>;
}
export interface DestroyMintRequestOptions<Sign extends BcsType<any>> {
    package?: string;
    arguments: DestroyMintRequestArguments<Sign> | [
        request: RawTransactionArgument<string>,
        Sign: RawTransactionArgument<Sign>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        expectedMarketId: RawTransactionArgument<string>,
        expectedVaultId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function destroyMintRequest<Sign extends BcsType<any>>(options: DestroyMintRequestOptions<Sign>) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        `${options.typeArguments[2]}`,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["request", "Sign", "syState", "globalConfig", "expectedMarketId", "expectedVaultId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'destroy_mint_request',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DestroyBurnRequestArguments<Sign extends BcsType<any>> {
    request: RawTransactionArgument<string>;
    Sign: RawTransactionArgument<Sign>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    expectedMarketId: RawTransactionArgument<string>;
    expectedVaultId: RawTransactionArgument<string>;
}
export interface DestroyBurnRequestOptions<Sign extends BcsType<any>> {
    package?: string;
    arguments: DestroyBurnRequestArguments<Sign> | [
        request: RawTransactionArgument<string>,
        Sign: RawTransactionArgument<Sign>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        expectedMarketId: RawTransactionArgument<string>,
        expectedVaultId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function destroyBurnRequest<Sign extends BcsType<any>>(options: DestroyBurnRequestOptions<Sign>) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        `${options.typeArguments[2]}`,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["request", "Sign", "syState", "globalConfig", "expectedMarketId", "expectedVaultId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'destroy_burn_request',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface CancelBurnRequestMarketStateArguments<Sign extends BcsType<any>> {
    request: RawTransactionArgument<string>;
    Sign: RawTransactionArgument<Sign>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    expectedVaultId: RawTransactionArgument<string>;
}
export interface CancelBurnRequestMarketStateOptions<Sign extends BcsType<any>> {
    package?: string;
    arguments: CancelBurnRequestMarketStateArguments<Sign> | [
        request: RawTransactionArgument<string>,
        Sign: RawTransactionArgument<Sign>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        expectedVaultId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function cancelBurnRequestMarketState<Sign extends BcsType<any>>(options: CancelBurnRequestMarketStateOptions<Sign>) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        `${options.typeArguments[4]}`,
        null,
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["request", "Sign", "syState", "globalConfig", "state", "expectedVaultId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'cancel_burn_request_market_state',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BurnEscrowedSyMarketStateArguments<Sign extends BcsType<any>> {
    syCoin: RawTransactionArgument<string>;
    Sign: RawTransactionArgument<Sign>;
    syState: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    expectedVaultId: RawTransactionArgument<string>;
}
export interface BurnEscrowedSyMarketStateOptions<Sign extends BcsType<any>> {
    package?: string;
    arguments: BurnEscrowedSyMarketStateArguments<Sign> | [
        syCoin: RawTransactionArgument<string>,
        Sign: RawTransactionArgument<Sign>,
        syState: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        expectedVaultId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
export function burnEscrowedSyMarketState<Sign extends BcsType<any>>(options: BurnEscrowedSyMarketStateOptions<Sign>) {
    const packageAddress = options.package ?? 'jitter/jitter';
    const argumentsTypes = [
        null,
        `${options.typeArguments[4]}`,
        null,
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["syCoin", "Sign", "syState", "globalConfig", "state", "expectedVaultId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sy',
        function: 'burn_escrowed_sy_market_state',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}