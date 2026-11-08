/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as table from './deps/sui/table.js';
import * as table_1 from './deps/sui/table.js';
import * as table_2 from './deps/sui/table.js';
const $moduleName = 'jitter/jitter-referral::bonding_table';
export const ReferralTableCreated = new MoveStruct({ name: `${$moduleName}::ReferralTableCreated`, fields: {
        table_id: bcs.Address
    } });
export const SetReferralCode = new MoveStruct({ name: `${$moduleName}::SetReferralCode`, fields: {
        table_id: bcs.Address,
        refer: bcs.Address,
        code: bcs.string()
    } });
export const UseReferralCode = new MoveStruct({ name: `${$moduleName}::UseReferralCode`, fields: {
        table_id: bcs.Address,
        referee: bcs.Address,
        refer: bcs.Address,
        code: bcs.string()
    } });
export const ReferralTable = new MoveStruct({ name: `${$moduleName}::ReferralTable`, fields: {
        id: bcs.Address,
        code_to_refer: table.Table,
        refer_to_code: table_1.Table,
        referee_to_code: table_2.Table
    } });
export interface SetReferralCode_Arguments {
    config: RawTransactionArgument<string>;
    table: RawTransactionArgument<string>;
    code: RawTransactionArgument<string>;
}
export interface SetReferralCode_Options {
    package?: string;
    arguments: SetReferralCode_Arguments | [
        config: RawTransactionArgument<string>,
        table: RawTransactionArgument<string>,
        code: RawTransactionArgument<string>
    ];
}
export function setReferralCode_(options: SetReferralCode_Options) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        '0x1::string::String'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "table", "code"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'set_referral_code_',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UseReferralCode_Arguments {
    config: RawTransactionArgument<string>;
    table: RawTransactionArgument<string>;
    code: RawTransactionArgument<string>;
}
export interface UseReferralCode_Options {
    package?: string;
    arguments: UseReferralCode_Arguments | [
        config: RawTransactionArgument<string>,
        table: RawTransactionArgument<string>,
        code: RawTransactionArgument<string>
    ];
}
export function useReferralCode_(options: UseReferralCode_Options) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        null,
        '0x1::string::String'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "table", "code"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'use_referral_code_',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CodeToReferArguments {
    table: RawTransactionArgument<string>;
}
export interface CodeToReferOptions {
    package?: string;
    arguments: CodeToReferArguments | [
        table: RawTransactionArgument<string>
    ];
}
/** Getter Funs */
export function codeToRefer(options: CodeToReferOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'code_to_refer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RefereeToCodeArguments {
    table: RawTransactionArgument<string>;
}
export interface RefereeToCodeOptions {
    package?: string;
    arguments: RefereeToCodeArguments | [
        table: RawTransactionArgument<string>
    ];
}
export function refereeToCode(options: RefereeToCodeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'referee_to_code',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ReferToCodeArguments {
    table: RawTransactionArgument<string>;
}
export interface ReferToCodeOptions {
    package?: string;
    arguments: ReferToCodeArguments | [
        table: RawTransactionArgument<string>
    ];
}
export function referToCode(options: ReferToCodeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'refer_to_code',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TryGetReferArguments {
    table: RawTransactionArgument<string>;
    referee: RawTransactionArgument<string>;
}
export interface TryGetReferOptions {
    package?: string;
    arguments: TryGetReferArguments | [
        table: RawTransactionArgument<string>,
        referee: RawTransactionArgument<string>
    ];
}
export function tryGetRefer(options: TryGetReferOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        'address'
    ] satisfies (string | null)[];
    const parameterNames = ["table", "referee"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'try_get_refer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsValidReferralCodeArguments {
    code: RawTransactionArgument<string>;
}
export interface IsValidReferralCodeOptions {
    package?: string;
    arguments: IsValidReferralCodeArguments | [
        code: RawTransactionArgument<string>
    ];
}
export function isValidReferralCode(options: IsValidReferralCodeOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        '0x1::string::String'
    ] satisfies (string | null)[];
    const parameterNames = ["code"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'is_valid_referral_code',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ReferralCodeExistsArguments {
    table: RawTransactionArgument<string>;
    code: RawTransactionArgument<string>;
}
export interface ReferralCodeExistsOptions {
    package?: string;
    arguments: ReferralCodeExistsArguments | [
        table: RawTransactionArgument<string>,
        code: RawTransactionArgument<string>
    ];
}
export function referralCodeExists(options: ReferralCodeExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-referral';
    const argumentsTypes = [
        null,
        '0x1::string::String'
    ] satisfies (string | null)[];
    const parameterNames = ["table", "code"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bonding_table',
        function: 'referral_code_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}