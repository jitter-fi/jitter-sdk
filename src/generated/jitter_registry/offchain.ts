/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** offchain - version-checked registry read helpers for SDKs and indexers. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter-registry::offchain';
export const RegistrySnapshot = new MoveStruct({ name: `${$moduleName}::RegistrySnapshot`, fields: {
        registry_id: bcs.Address,
        project_count: bcs.u64(),
        series_count: bcs.u64(),
        market_count: bcs.u64(),
        point_program_count: bcs.u64()
    } });
export interface RegistrySnapshotArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
}
export interface RegistrySnapshotOptions {
    package?: string;
    arguments: RegistrySnapshotArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>
    ];
}
export function registrySnapshot(options: RegistrySnapshotOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_snapshot',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectOptions {
    package?: string;
    arguments: RegistryProjectArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProject(options: RegistryProjectOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectMetadataExistsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectMetadataExistsOptions {
    package?: string;
    arguments: RegistryProjectMetadataExistsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectMetadataExists(options: RegistryProjectMetadataExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_metadata_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectMetadataArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectMetadataOptions {
    package?: string;
    arguments: RegistryProjectMetadataArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectMetadata(options: RegistryProjectMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketRecordArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketRecordOptions {
    package?: string;
    arguments: RegistryMarketRecordArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketRecord(options: RegistryMarketRecordOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketMetadataExistsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketMetadataExistsOptions {
    package?: string;
    arguments: RegistryMarketMetadataExistsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketMetadataExists(options: RegistryMarketMetadataExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_metadata_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketMetadataArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketMetadataOptions {
    package?: string;
    arguments: RegistryMarketMetadataArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketMetadata(options: RegistryMarketMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistrySeriesArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface RegistrySeriesOptions {
    package?: string;
    arguments: RegistrySeriesArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function registrySeries(options: RegistrySeriesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_series',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectPointConfigExistsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectPointConfigExistsOptions {
    package?: string;
    arguments: RegistryProjectPointConfigExistsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectPointConfigExists(options: RegistryProjectPointConfigExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_point_config_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectPointConfigArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectPointConfigOptions {
    package?: string;
    arguments: RegistryProjectPointConfigArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectPointConfig(options: RegistryProjectPointConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_point_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectPointConfigIdsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectPointConfigIdsOptions {
    package?: string;
    arguments: RegistryProjectPointConfigIdsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectPointConfigIds(options: RegistryProjectPointConfigIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_point_config_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectPointConfigMetadataArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectPointConfigMetadataOptions {
    package?: string;
    arguments: RegistryProjectPointConfigMetadataArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectPointConfigMetadata(options: RegistryProjectPointConfigMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_point_config_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryProjectPointConfigParamsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface RegistryProjectPointConfigParamsOptions {
    package?: string;
    arguments: RegistryProjectPointConfigParamsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function registryProjectPointConfigParams(options: RegistryProjectPointConfigParamsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_project_point_config_params',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointConfigExistsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointConfigExistsOptions {
    package?: string;
    arguments: RegistryMarketPointConfigExistsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointConfigExists(options: RegistryMarketPointConfigExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_config_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointConfigArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointConfigOptions {
    package?: string;
    arguments: RegistryMarketPointConfigArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointConfig(options: RegistryMarketPointConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointConfigIdsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointConfigIdsOptions {
    package?: string;
    arguments: RegistryMarketPointConfigIdsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointConfigIds(options: RegistryMarketPointConfigIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_config_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointConfigParamsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointConfigParamsOptions {
    package?: string;
    arguments: RegistryMarketPointConfigParamsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointConfigParams(options: RegistryMarketPointConfigParamsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_config_params',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryPointProgramIdsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
}
export interface RegistryPointProgramIdsOptions {
    package?: string;
    arguments: RegistryPointProgramIdsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>
    ];
}
export function registryPointProgramIds(options: RegistryPointProgramIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_point_program_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryPointProgramArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface RegistryPointProgramOptions {
    package?: string;
    arguments: RegistryPointProgramArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function registryPointProgram(options: RegistryPointProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_point_program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryPointProgramIdsConfigArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface RegistryPointProgramIdsConfigOptions {
    package?: string;
    arguments: RegistryPointProgramIdsConfigArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function registryPointProgramIdsConfig(options: RegistryPointProgramIdsConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_point_program_ids_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryPointProgramMetadataArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface RegistryPointProgramMetadataOptions {
    package?: string;
    arguments: RegistryPointProgramMetadataArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function registryPointProgramMetadata(options: RegistryPointProgramMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_point_program_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointProgramIdsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointProgramIdsOptions {
    package?: string;
    arguments: RegistryMarketPointProgramIdsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointProgramIds(options: RegistryMarketPointProgramIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_program_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointProgramArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointProgramOptions {
    package?: string;
    arguments: RegistryMarketPointProgramArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointProgram(options: RegistryMarketPointProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryMarketPointProgramConfigArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface RegistryMarketPointProgramConfigOptions {
    package?: string;
    arguments: RegistryMarketPointProgramConfigArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function registryMarketPointProgramConfig(options: RegistryMarketPointProgramConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "marketId", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_market_point_program_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryPointProgramMarketIdsArguments {
    globalConfig: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface RegistryPointProgramMarketIdsOptions {
    package?: string;
    arguments: RegistryPointProgramMarketIdsArguments | [
        globalConfig: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function registryPointProgramMarketIds(options: RegistryPointProgramMarketIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'offchain',
        function: 'registry_point_program_market_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}