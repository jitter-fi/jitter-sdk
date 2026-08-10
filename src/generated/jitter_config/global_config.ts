/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Shared version and pause authority for the Jitter package family.
 *
 * Every stateful package registers an opaque marker type with an independent set
 * of accepted versions. Unregistered packages fail closed. Governance recovery
 * functions are authorized by the root `AdminCap` and deliberately remain callable
 * while the protocol or a package is paused.
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as type_name from './deps/std/type_name.js';
import * as vec_set from './deps/sui/vec_set.js';
import * as type_name_1 from './deps/std/type_name.js';
import * as type_name_2 from './deps/std/type_name.js';
import * as type_name_3 from './deps/std/type_name.js';
const $moduleName = 'jitter/jitter-config::global_config';
export const PackagePolicy = new MoveStruct({ name: `${$moduleName}::PackagePolicy`, fields: {
        package: type_name.TypeName,
        allowed_versions: vec_set.VecSet(bcs.u64()),
        paused: bcs.bool()
    } });
export const DomainPause = new MoveStruct({ name: `${$moduleName}::DomainPause`, fields: {
        domain: bcs.vector(bcs.u8()),
        target: bcs.Address,
        has_target: bcs.bool(),
        paused: bcs.bool()
    } });
export const GlobalConfig = new MoveStruct({ name: `${$moduleName}::GlobalConfig`, fields: {
        id: bcs.Address,
        config_version: bcs.u64(),
        global_paused: bcs.bool(),
        package_policies: bcs.vector(PackagePolicy),
        domain_pauses: bcs.vector(DomainPause)
    } });
export const GlobalConfigCreatedEvent = new MoveStruct({ name: `${$moduleName}::GlobalConfigCreatedEvent`, fields: {
        config_id: bcs.Address,
        config_version: bcs.u64()
    } });
export const PackageRegisteredEvent = new MoveStruct({ name: `${$moduleName}::PackageRegisteredEvent`, fields: {
        config_id: bcs.Address,
        package: type_name_1.TypeName,
        initial_version: bcs.u64()
    } });
export const PackageVersionUpdatedEvent = new MoveStruct({ name: `${$moduleName}::PackageVersionUpdatedEvent`, fields: {
        config_id: bcs.Address,
        package: type_name_2.TypeName,
        version: bcs.u64(),
        allowed: bcs.bool()
    } });
export const PackagePauseUpdatedEvent = new MoveStruct({ name: `${$moduleName}::PackagePauseUpdatedEvent`, fields: {
        config_id: bcs.Address,
        package: type_name_3.TypeName,
        paused: bcs.bool()
    } });
export const GlobalPauseUpdatedEvent = new MoveStruct({ name: `${$moduleName}::GlobalPauseUpdatedEvent`, fields: {
        config_id: bcs.Address,
        paused: bcs.bool()
    } });
export const DomainPauseUpdatedEvent = new MoveStruct({ name: `${$moduleName}::DomainPauseUpdatedEvent`, fields: {
        config_id: bcs.Address,
        domain: bcs.vector(bcs.u8()),
        target: bcs.option(bcs.Address),
        paused: bcs.bool()
    } });
export interface RegisterPackageByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    initialVersion: RawTransactionArgument<number | bigint>;
}
export interface RegisterPackageByAdminOptions {
    package?: string;
    arguments: RegisterPackageByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        initialVersion: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Registers a package marker. Missing policies are never interpreted as enabled,
 * so deployment must explicitly register every stateful package.
 */
export function registerPackageByAdmin(options: RegisterPackageByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "initialVersion"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'register_package_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AllowPackageVersionByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
}
export interface AllowPackageVersionByAdminOptions {
    package?: string;
    arguments: AllowPackageVersionByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function allowPackageVersionByAdmin(options: AllowPackageVersionByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "version"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'allow_package_version_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DisallowPackageVersionByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
}
export interface DisallowPackageVersionByAdminOptions {
    package?: string;
    arguments: DisallowPackageVersionByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function disallowPackageVersionByAdmin(options: DisallowPackageVersionByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "version"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'disallow_package_version_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetPackagePauseByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    paused: RawTransactionArgument<boolean>;
}
export interface SetPackagePauseByAdminOptions {
    package?: string;
    arguments: SetPackagePauseByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        paused: RawTransactionArgument<boolean>
    ];
    typeArguments: [
        string
    ];
}
export function setPackagePauseByAdmin(options: SetPackagePauseByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "paused"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'set_package_pause_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetGlobalPauseByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    paused: RawTransactionArgument<boolean>;
}
export interface SetGlobalPauseByAdminOptions {
    package?: string;
    arguments: SetGlobalPauseByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        paused: RawTransactionArgument<boolean>
    ];
}
export function setGlobalPauseByAdmin(options: SetGlobalPauseByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "paused"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'set_global_pause_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetDomainPauseByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    domain: RawTransactionArgument<Array<number>>;
    paused: RawTransactionArgument<boolean>;
}
export interface SetDomainPauseByAdminOptions {
    package?: string;
    arguments: SetDomainPauseByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        domain: RawTransactionArgument<Array<number>>,
        paused: RawTransactionArgument<boolean>
    ];
}
export function setDomainPauseByAdmin(options: SetDomainPauseByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'vector<u8>',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "domain", "paused"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'set_domain_pause_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetTargetPauseByAdminArguments {
    config: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    domain: RawTransactionArgument<Array<number>>;
    target: RawTransactionArgument<string>;
    paused: RawTransactionArgument<boolean>;
}
export interface SetTargetPauseByAdminOptions {
    package?: string;
    arguments: SetTargetPauseByAdminArguments | [
        config: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        domain: RawTransactionArgument<Array<number>>,
        target: RawTransactionArgument<string>,
        paused: RawTransactionArgument<boolean>
    ];
}
export function setTargetPauseByAdmin(options: SetTargetPauseByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        null,
        'vector<u8>',
        '0x2::object::ID',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "AdminCap", "domain", "target", "paused"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'set_target_pause_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AssertPackageActiveArguments {
    config: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
}
export interface AssertPackageActiveOptions {
    package?: string;
    arguments: AssertPackageActiveArguments | [
        config: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function assertPackageActive(options: AssertPackageActiveOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "version"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'assert_package_active',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertPackageVersionArguments {
    config: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
}
export interface AssertPackageVersionOptions {
    package?: string;
    arguments: AssertPackageVersionArguments | [
        config: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Checks package compatibility without enforcing pause state. This is for status
 * and diagnostic views that must remain readable during an incident.
 */
export function assertPackageVersion(options: AssertPackageVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "version"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'assert_package_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertDomainActiveArguments {
    config: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
    domain: RawTransactionArgument<Array<number>>;
    abortCode: RawTransactionArgument<number | bigint>;
}
export interface AssertDomainActiveOptions {
    package?: string;
    arguments: AssertDomainActiveArguments | [
        config: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>,
        domain: RawTransactionArgument<Array<number>>,
        abortCode: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function assertDomainActive(options: AssertDomainActiveOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'u64',
        'vector<u8>',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "version", "domain", "abortCode"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'assert_domain_active',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AssertTargetActiveArguments {
    config: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
    domain: RawTransactionArgument<Array<number>>;
    target: RawTransactionArgument<string>;
    abortCode: RawTransactionArgument<number | bigint>;
}
export interface AssertTargetActiveOptions {
    package?: string;
    arguments: AssertTargetActiveArguments | [
        config: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>,
        domain: RawTransactionArgument<Array<number>>,
        target: RawTransactionArgument<string>,
        abortCode: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function assertTargetActive(options: AssertTargetActiveOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'u64',
        'vector<u8>',
        '0x2::object::ID',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "version", "domain", "target", "abortCode"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'assert_target_active',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface IdArguments {
    config: RawTransactionArgument<string>;
}
export interface IdOptions {
    package?: string;
    arguments: IdArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function id(options: IdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ConfigVersionArguments {
    config: RawTransactionArgument<string>;
}
export interface ConfigVersionOptions {
    package?: string;
    arguments: ConfigVersionArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function configVersion(options: ConfigVersionOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'config_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CurrentConfigVersionOptions {
    package?: string;
    arguments?: [
    ];
}
export function currentConfigVersion(options: CurrentConfigVersionOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'current_config_version',
    });
}
export interface GlobalPausedArguments {
    config: RawTransactionArgument<string>;
}
export interface GlobalPausedOptions {
    package?: string;
    arguments: GlobalPausedArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function globalPaused(options: GlobalPausedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'global_paused',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PackageRegisteredArguments {
    config: RawTransactionArgument<string>;
}
export interface PackageRegisteredOptions {
    package?: string;
    arguments: PackageRegisteredArguments | [
        config: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function packageRegistered(options: PackageRegisteredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'package_registered',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PackagePausedArguments {
    config: RawTransactionArgument<string>;
}
export interface PackagePausedOptions {
    package?: string;
    arguments: PackagePausedArguments | [
        config: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function packagePaused(options: PackagePausedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'package_paused',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PackageVersionAllowedArguments {
    config: RawTransactionArgument<string>;
    version: RawTransactionArgument<number | bigint>;
}
export interface PackageVersionAllowedOptions {
    package?: string;
    arguments: PackageVersionAllowedArguments | [
        config: RawTransactionArgument<string>,
        version: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function packageVersionAllowed(options: PackageVersionAllowedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "version"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'package_version_allowed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PackageAllowedVersionsArguments {
    config: RawTransactionArgument<string>;
}
export interface PackageAllowedVersionsOptions {
    package?: string;
    arguments: PackageAllowedVersionsArguments | [
        config: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function packageAllowedVersions(options: PackageAllowedVersionsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'package_allowed_versions',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DomainPausedArguments {
    config: RawTransactionArgument<string>;
    domain: RawTransactionArgument<Array<number>>;
}
export interface DomainPausedOptions {
    package?: string;
    arguments: DomainPausedArguments | [
        config: RawTransactionArgument<string>,
        domain: RawTransactionArgument<Array<number>>
    ];
}
export function domainPaused(options: DomainPausedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "domain"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'domain_paused',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TargetPausedArguments {
    config: RawTransactionArgument<string>;
    domain: RawTransactionArgument<Array<number>>;
    target: RawTransactionArgument<string>;
}
export interface TargetPausedOptions {
    package?: string;
    arguments: TargetPausedArguments | [
        config: RawTransactionArgument<string>,
        domain: RawTransactionArgument<Array<number>>,
        target: RawTransactionArgument<string>
    ];
}
export function targetPaused(options: TargetPausedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'vector<u8>',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "domain", "target"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'target_paused',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PauseEntryCountArguments {
    config: RawTransactionArgument<string>;
}
export interface PauseEntryCountOptions {
    package?: string;
    arguments: PauseEntryCountArguments | [
        config: RawTransactionArgument<string>
    ];
}
export function pauseEntryCount(options: PauseEntryCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'pause_entry_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PausedArguments {
    config: RawTransactionArgument<string>;
    domain: RawTransactionArgument<Array<number>>;
    target: RawTransactionArgument<string>;
}
export interface PausedOptions {
    package?: string;
    arguments: PausedArguments | [
        config: RawTransactionArgument<string>,
        domain: RawTransactionArgument<Array<number>>,
        target: RawTransactionArgument<string>
    ];
}
export function paused(options: PausedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-config';
    const argumentsTypes = [
        null,
        'vector<u8>',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["config", "domain", "target"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'global_config',
        function: 'paused',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}