/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * market_registry - canonical on-chain project and market registry.
 *
 * The registry does not custody assets. It gives deployment tooling, SDKs, and
 * indexers one source of truth for project-level reward configuration and the
 * object IDs that make up each market.
 */

import { MoveStruct, MoveTuple, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as type_name from './deps/std/type_name.js';
import * as type_name_1 from './deps/std/type_name.js';
import * as type_name_2 from './deps/std/type_name.js';
import * as type_name_3 from './deps/std/type_name.js';
import * as type_name_4 from './deps/std/type_name.js';
import * as type_name_5 from './deps/std/type_name.js';
import * as type_name_6 from './deps/std/type_name.js';
import * as type_name_7 from './deps/std/type_name.js';
const $moduleName = 'jitter/jitter-registry::market_registry';
export const MarketRegistry = new MoveStruct({ name: `${$moduleName}::MarketRegistry`, fields: {
        id: bcs.Address,
        next_project_id: bcs.u64(),
        next_series_id: bcs.u64(),
        project_count: bcs.u64(),
        series_count: bcs.u64(),
        market_count: bcs.u64(),
        series_ids: bcs.vector(bcs.u64()),
        market_ids: bcs.vector(bcs.Address),
        point_program_ids: bcs.vector(bcs.Address)
    } });
export const ProjectKey = new MoveTuple({ name: `${$moduleName}::ProjectKey`, fields: [bcs.u64()] });
export const SeriesKey = new MoveTuple({ name: `${$moduleName}::SeriesKey`, fields: [bcs.u64()] });
export const MarketKey = new MoveTuple({ name: `${$moduleName}::MarketKey`, fields: [bcs.Address] });
export const ProjectPointConfigKey = new MoveTuple({ name: `${$moduleName}::ProjectPointConfigKey`, fields: [bcs.u64()] });
export const MarketPointConfigKey = new MoveTuple({ name: `${$moduleName}::MarketPointConfigKey`, fields: [bcs.Address] });
export const PointProgramKey = new MoveTuple({ name: `${$moduleName}::PointProgramKey`, fields: [bcs.Address] });
export const MarketPointProgramKey = new MoveStruct({ name: `${$moduleName}::MarketPointProgramKey`, fields: {
        market_id: bcs.Address,
        point_config_id: bcs.Address
    } });
export const MarketPointProgramIdsKey = new MoveTuple({ name: `${$moduleName}::MarketPointProgramIdsKey`, fields: [bcs.Address] });
export const PointProgramMarketIdsKey = new MoveTuple({ name: `${$moduleName}::PointProgramMarketIdsKey`, fields: [bcs.Address] });
export const ProjectMetadataKey = new MoveTuple({ name: `${$moduleName}::ProjectMetadataKey`, fields: [bcs.u64()] });
export const MarketMetadataKey = new MoveTuple({ name: `${$moduleName}::MarketMetadataKey`, fields: [bcs.Address] });
export const Project = new MoveStruct({ name: `${$moduleName}::Project`, fields: {
        project_id: bcs.u64(),
        owner: bcs.Address,
        name: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8())
    } });
export const MarketSeries = new MoveStruct({ name: `${$moduleName}::MarketSeries`, fields: {
        series_id: bcs.u64(),
        project_id: bcs.u64(),
        name: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8()),
        default_market_id: bcs.Address,
        market_ids: bcs.vector(bcs.Address),
        listed: bcs.bool()
    } });
export const MarketRecord = new MoveStruct({ name: `${$moduleName}::MarketRecord`, fields: {
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        market_id: bcs.Address,
        market_state_id: bcs.Address,
        py_state_id: bcs.Address,
        pool_id: bcs.Address,
        reward_distributor_id: bcs.Address,
        pt_orderbook_id: bcs.Address,
        yt_orderbook_id: bcs.Address,
        expiry: bcs.u64(),
        listed: bcs.bool(),
        display_rank: bcs.u64()
    } });
export const ProjectMetadata = new MoveStruct({ name: `${$moduleName}::ProjectMetadata`, fields: {
        project_id: bcs.u64(),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        website_uri: bcs.vector(bcs.u8())
    } });
export const MarketMetadata = new MoveStruct({ name: `${$moduleName}::MarketMetadata`, fields: {
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        market_id: bcs.Address,
        adapter: bcs.vector(bcs.u8()),
        name: bcs.vector(bcs.u8()),
        symbol: bcs.vector(bcs.u8()),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8()),
        underlying_type: type_name.TypeName,
        sy_type: type_name_1.TypeName,
        pt_type: type_name_2.TypeName,
        yt_type: type_name_3.TypeName
    } });
export const ProjectPointConfig = new MoveStruct({ name: `${$moduleName}::ProjectPointConfig`, fields: {
        project_id: bcs.u64(),
        enabled: bcs.bool(),
        liquidlink_global_config_id: bcs.Address,
        scoreboard_id: bcs.Address,
        point_cap_id: bcs.Address,
        point_config_id: bcs.Address,
        point_token_market_id: bcs.Address,
        point_orderbook_id: bcs.Address,
        point_token_type: bcs.vector(bcs.u8()),
        quote_coin_type: bcs.vector(bcs.u8()),
        quote_symbol: bcs.vector(bcs.u8()),
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        point_duration_ms: bcs.u64()
    } });
export const MarketPointConfig = new MoveStruct({ name: `${$moduleName}::MarketPointConfig`, fields: {
        project_id: bcs.u64(),
        market_id: bcs.Address,
        point_config_id: bcs.Address,
        lp_point_state_id: bcs.Address,
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        point_duration_ms: bcs.u64()
    } });
export const PointProgram = new MoveStruct({ name: `${$moduleName}::PointProgram`, fields: {
        point_config_id: bcs.Address,
        liquidlink_global_config_id: bcs.Address,
        project_object_id: bcs.Address,
        scoreboard_id: bcs.Address,
        name: bcs.vector(bcs.u8()),
        protocol: bcs.vector(bcs.u8()),
        season: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8()),
        enabled: bcs.bool()
    } });
export const MarketPointProgram = new MoveStruct({ name: `${$moduleName}::MarketPointProgram`, fields: {
        market_id: bcs.Address,
        point_config_id: bcs.Address,
        lp_point_state_id: bcs.Address,
        yt_enabled: bcs.bool(),
        lp_enabled: bcs.bool(),
        pool_enabled: bcs.bool()
    } });
export const ProjectRegistered = new MoveStruct({ name: `${$moduleName}::ProjectRegistered`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        owner: bcs.Address,
        name: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8())
    } });
export const SeriesRegistered = new MoveStruct({ name: `${$moduleName}::SeriesRegistered`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        name: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8()),
        listed: bcs.bool()
    } });
export const SeriesListedUpdated = new MoveStruct({ name: `${$moduleName}::SeriesListedUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        listed: bcs.bool()
    } });
export const SeriesDefaultMarketUpdated = new MoveStruct({ name: `${$moduleName}::SeriesDefaultMarketUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        default_market_id: bcs.Address
    } });
export const MarketRegistered = new MoveStruct({ name: `${$moduleName}::MarketRegistered`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        market_id: bcs.Address,
        market_state_id: bcs.Address,
        py_state_id: bcs.Address,
        pool_id: bcs.Address,
        reward_distributor_id: bcs.Address,
        expiry: bcs.u64(),
        listed: bcs.bool(),
        display_rank: bcs.u64()
    } });
export const MarketOrderbookUpdated = new MoveStruct({ name: `${$moduleName}::MarketOrderbookUpdated`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        pt_orderbook_id: bcs.Address,
        yt_orderbook_id: bcs.Address
    } });
export const MarketListedUpdated = new MoveStruct({ name: `${$moduleName}::MarketListedUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        market_id: bcs.Address,
        listed: bcs.bool(),
        display_rank: bcs.u64()
    } });
export const ProjectMetadataUpdated = new MoveStruct({ name: `${$moduleName}::ProjectMetadataUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        website_uri: bcs.vector(bcs.u8())
    } });
export const MarketMetadataUpdated = new MoveStruct({ name: `${$moduleName}::MarketMetadataUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        series_id: bcs.u64(),
        market_id: bcs.Address,
        adapter: bcs.vector(bcs.u8()),
        name: bcs.vector(bcs.u8()),
        symbol: bcs.vector(bcs.u8()),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8()),
        underlying_type: type_name_4.TypeName,
        sy_type: type_name_5.TypeName,
        pt_type: type_name_6.TypeName,
        yt_type: type_name_7.TypeName
    } });
export const ProjectPointConfigUpdated = new MoveStruct({ name: `${$moduleName}::ProjectPointConfigUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        enabled: bcs.bool(),
        liquidlink_global_config_id: bcs.Address,
        scoreboard_id: bcs.Address,
        point_cap_id: bcs.Address,
        point_config_id: bcs.Address,
        point_token_market_id: bcs.Address,
        point_orderbook_id: bcs.Address,
        point_token_type: bcs.vector(bcs.u8()),
        quote_coin_type: bcs.vector(bcs.u8()),
        quote_symbol: bcs.vector(bcs.u8()),
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        point_duration_ms: bcs.u64()
    } });
export const MarketPointConfigUpdated = new MoveStruct({ name: `${$moduleName}::MarketPointConfigUpdated`, fields: {
        registry_id: bcs.Address,
        project_id: bcs.u64(),
        market_id: bcs.Address,
        point_config_id: bcs.Address,
        lp_point_state_id: bcs.Address,
        yt_multiplier_bps: bcs.u64(),
        lp_multiplier_bps: bcs.u64(),
        point_duration_ms: bcs.u64()
    } });
export const PointProgramRegistered = new MoveStruct({ name: `${$moduleName}::PointProgramRegistered`, fields: {
        registry_id: bcs.Address,
        point_config_id: bcs.Address,
        liquidlink_global_config_id: bcs.Address,
        project_object_id: bcs.Address,
        scoreboard_id: bcs.Address,
        name: bcs.vector(bcs.u8()),
        protocol: bcs.vector(bcs.u8()),
        season: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8()),
        enabled: bcs.bool()
    } });
export const PointProgramEnabledUpdated = new MoveStruct({ name: `${$moduleName}::PointProgramEnabledUpdated`, fields: {
        registry_id: bcs.Address,
        point_config_id: bcs.Address,
        enabled: bcs.bool()
    } });
export const MarketPointProgramAttached = new MoveStruct({ name: `${$moduleName}::MarketPointProgramAttached`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        point_config_id: bcs.Address,
        lp_point_state_id: bcs.Address,
        yt_enabled: bcs.bool(),
        lp_enabled: bcs.bool(),
        pool_enabled: bcs.bool()
    } });
export const MarketPointProgramDetached = new MoveStruct({ name: `${$moduleName}::MarketPointProgramDetached`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        point_config_id: bcs.Address
    } });
export interface CreateByAdminArguments {
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CreateByAdminOptions {
    package?: string;
    arguments: CreateByAdminArguments | [
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
}
export function createByAdmin(options: CreateByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'create_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateAndShareByAdminArguments {
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
}
export interface CreateAndShareByAdminOptions {
    package?: string;
    arguments: CreateAndShareByAdminArguments | [
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>
    ];
}
export function createAndShareByAdmin(options: CreateAndShareByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["globalConfig", "AdminCap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'create_and_share_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterProjectByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    name: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
}
export interface RegisterProjectByAdminOptions {
    package?: string;
    arguments: RegisterProjectByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        name: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>
    ];
}
export function registerProjectByAdmin(options: RegisterProjectByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "name", "metadataUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_project_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetProjectMetadataByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
    description: RawTransactionArgument<Array<number>>;
    iconUri: RawTransactionArgument<Array<number>>;
    websiteUri: RawTransactionArgument<Array<number>>;
}
export interface SetProjectMetadataByAdminOptions {
    package?: string;
    arguments: SetProjectMetadataByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>,
        description: RawTransactionArgument<Array<number>>,
        iconUri: RawTransactionArgument<Array<number>>,
        websiteUri: RawTransactionArgument<Array<number>>
    ];
}
export function setProjectMetadataByAdmin(options: SetProjectMetadataByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "projectId", "description", "iconUri", "websiteUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_project_metadata_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetProjectPointConfigByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
    enabled: RawTransactionArgument<boolean>;
    liquidlinkGlobalConfigId: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    pointCapId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
    pointTokenMarketId: RawTransactionArgument<string>;
    pointOrderbookId: RawTransactionArgument<string>;
    pointTokenType: RawTransactionArgument<Array<number>>;
    quoteCoinType: RawTransactionArgument<Array<number>>;
    quoteSymbol: RawTransactionArgument<Array<number>>;
    ytMultiplierBps: RawTransactionArgument<number | bigint>;
    lpMultiplierBps: RawTransactionArgument<number | bigint>;
    pointDurationMs: RawTransactionArgument<number | bigint>;
}
export interface SetProjectPointConfigByAdminOptions {
    package?: string;
    arguments: SetProjectPointConfigByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>,
        enabled: RawTransactionArgument<boolean>,
        liquidlinkGlobalConfigId: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        pointCapId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>,
        pointTokenMarketId: RawTransactionArgument<string>,
        pointOrderbookId: RawTransactionArgument<string>,
        pointTokenType: RawTransactionArgument<Array<number>>,
        quoteCoinType: RawTransactionArgument<Array<number>>,
        quoteSymbol: RawTransactionArgument<Array<number>>,
        ytMultiplierBps: RawTransactionArgument<number | bigint>,
        lpMultiplierBps: RawTransactionArgument<number | bigint>,
        pointDurationMs: RawTransactionArgument<number | bigint>
    ];
}
export function setProjectPointConfigByAdmin(options: SetProjectPointConfigByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'bool',
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'u64',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "projectId", "enabled", "liquidlinkGlobalConfigId", "scoreboardId", "pointCapId", "pointConfigId", "pointTokenMarketId", "pointOrderbookId", "pointTokenType", "quoteCoinType", "quoteSymbol", "ytMultiplierBps", "lpMultiplierBps", "pointDurationMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_project_point_config_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ClearProjectPointConfigByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ClearProjectPointConfigByAdminOptions {
    package?: string;
    arguments: ClearProjectPointConfigByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function clearProjectPointConfigByAdmin(options: ClearProjectPointConfigByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'clear_project_point_config_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterPointProgramByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    liquidlinkGlobalConfigId: RawTransactionArgument<string>;
    projectObjectId: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
    name: RawTransactionArgument<Array<number>>;
    protocol: RawTransactionArgument<Array<number>>;
    season: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
    enabled: RawTransactionArgument<boolean>;
}
export interface RegisterPointProgramByAdminOptions {
    package?: string;
    arguments: RegisterPointProgramByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        liquidlinkGlobalConfigId: RawTransactionArgument<string>,
        projectObjectId: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>,
        name: RawTransactionArgument<Array<number>>,
        protocol: RawTransactionArgument<Array<number>>,
        season: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>,
        enabled: RawTransactionArgument<boolean>
    ];
}
/**
 * Registers one Scoreboard + PointConfig program for discovery. A program can be
 * attached to markets from any registry project.
 */
export function registerPointProgramByAdmin(options: RegisterPointProgramByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "liquidlinkGlobalConfigId", "projectObjectId", "scoreboardId", "pointConfigId", "name", "protocol", "season", "metadataUri", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_point_program_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetPointProgramEnabledByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
    enabled: RawTransactionArgument<boolean>;
}
export interface SetPointProgramEnabledByAdminOptions {
    package?: string;
    arguments: SetPointProgramEnabledByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>,
        enabled: RawTransactionArgument<boolean>
    ];
}
/** A program can only be disabled after all market attachments are removed. */
export function setPointProgramEnabledByAdmin(options: SetPointProgramEnabledByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "pointConfigId", "enabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_point_program_enabled_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AttachMarketStatePointProgramByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
    lpPointStateId: RawTransactionArgument<string>;
    ytEnabled: RawTransactionArgument<boolean>;
    lpEnabled: RawTransactionArgument<boolean>;
    poolEnabled: RawTransactionArgument<boolean>;
}
export interface AttachMarketStatePointProgramByAdminOptions {
    package?: string;
    arguments: AttachMarketStatePointProgramByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>,
        lpPointStateId: RawTransactionArgument<string>,
        ytEnabled: RawTransactionArgument<boolean>,
        lpEnabled: RawTransactionArgument<boolean>,
        poolEnabled: RawTransactionArgument<boolean>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function attachMarketStatePointProgramByAdmin(options: AttachMarketStatePointProgramByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        'bool',
        'bool',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state", "pointConfigId", "lpPointStateId", "ytEnabled", "lpEnabled", "poolEnabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'attach_market_state_point_program_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DetachMarketStatePointProgramByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface DetachMarketStatePointProgramByAdminOptions {
    package?: string;
    arguments: DetachMarketStatePointProgramByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function detachMarketStatePointProgramByAdmin(options: DetachMarketStatePointProgramByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'detach_market_state_point_program_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RegisterSeriesByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
    name: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
    listed: RawTransactionArgument<boolean>;
}
export interface RegisterSeriesByAdminOptions {
    package?: string;
    arguments: RegisterSeriesByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>,
        name: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>,
        listed: RawTransactionArgument<boolean>
    ];
}
export function registerSeriesByAdmin(options: RegisterSeriesByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'vector<u8>',
        'vector<u8>',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "projectId", "name", "metadataUri", "listed"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_series_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetSeriesListedByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    listed: RawTransactionArgument<boolean>;
}
export interface SetSeriesListedByAdminOptions {
    package?: string;
    arguments: SetSeriesListedByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        listed: RawTransactionArgument<boolean>
    ];
}
export function setSeriesListedByAdmin(options: SetSeriesListedByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "seriesId", "listed"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_series_listed_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetDefaultMarketByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    marketId: RawTransactionArgument<string>;
}
export interface SetDefaultMarketByAdminOptions {
    package?: string;
    arguments: SetDefaultMarketByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        marketId: RawTransactionArgument<string>
    ];
}
export function setDefaultMarketByAdmin(options: SetDefaultMarketByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "seriesId", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_default_market_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterMarketStateByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    state: RawTransactionArgument<string>;
    listed: RawTransactionArgument<boolean>;
    displayRank: RawTransactionArgument<number | bigint>;
}
export interface RegisterMarketStateByAdminOptions {
    package?: string;
    arguments: RegisterMarketStateByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        state: RawTransactionArgument<string>,
        listed: RawTransactionArgument<boolean>,
        displayRank: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function registerMarketStateByAdmin(options: RegisterMarketStateByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        null,
        'bool',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "seriesId", "state", "listed", "displayRank"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_market_state_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMarketStateMetadataByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    adapter: RawTransactionArgument<Array<number>>;
    name: RawTransactionArgument<Array<number>>;
    symbol: RawTransactionArgument<Array<number>>;
    description: RawTransactionArgument<Array<number>>;
    iconUri: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
}
export interface SetMarketStateMetadataByAdminOptions {
    package?: string;
    arguments: SetMarketStateMetadataByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        adapter: RawTransactionArgument<Array<number>>,
        name: RawTransactionArgument<Array<number>>,
        symbol: RawTransactionArgument<Array<number>>,
        description: RawTransactionArgument<Array<number>>,
        iconUri: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setMarketStateMetadataByAdmin(options: SetMarketStateMetadataByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "syState", "state", "adapter", "name", "symbol", "description", "iconUri", "metadataUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_market_state_metadata_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMarketStateListingByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    listed: RawTransactionArgument<boolean>;
    displayRank: RawTransactionArgument<number | bigint>;
}
export interface SetMarketStateListingByAdminOptions {
    package?: string;
    arguments: SetMarketStateListingByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        listed: RawTransactionArgument<boolean>,
        displayRank: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setMarketStateListingByAdmin(options: SetMarketStateListingByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'bool',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state", "listed", "displayRank"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_market_state_listing_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMarketStatePtOrderbookIdByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    orderbookId: RawTransactionArgument<string>;
}
export interface SetMarketStatePtOrderbookIdByAdminOptions {
    package?: string;
    arguments: SetMarketStatePtOrderbookIdByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        orderbookId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setMarketStatePtOrderbookIdByAdmin(options: SetMarketStatePtOrderbookIdByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state", "orderbookId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_market_state_pt_orderbook_id_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMarketStateYtOrderbookIdByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    orderbookId: RawTransactionArgument<string>;
}
export interface SetMarketStateYtOrderbookIdByAdminOptions {
    package?: string;
    arguments: SetMarketStateYtOrderbookIdByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        orderbookId: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setMarketStateYtOrderbookIdByAdmin(options: SetMarketStateYtOrderbookIdByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state", "orderbookId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_market_state_yt_orderbook_id_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetMarketStatePointConfigByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
    lpPointStateId: RawTransactionArgument<string>;
    ytMultiplierBps: RawTransactionArgument<number | bigint>;
    lpMultiplierBps: RawTransactionArgument<number | bigint>;
    pointDurationMs: RawTransactionArgument<number | bigint>;
}
export interface SetMarketStatePointConfigByAdminOptions {
    package?: string;
    arguments: SetMarketStatePointConfigByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>,
        lpPointStateId: RawTransactionArgument<string>,
        ytMultiplierBps: RawTransactionArgument<number | bigint>,
        lpMultiplierBps: RawTransactionArgument<number | bigint>,
        pointDurationMs: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function setMarketStatePointConfigByAdmin(options: SetMarketStatePointConfigByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        'u64',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state", "pointConfigId", "lpPointStateId", "ytMultiplierBps", "lpMultiplierBps", "pointDurationMs"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_market_state_point_config_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClearMarketStatePointConfigByAdminArguments {
    registry: RawTransactionArgument<string>;
    globalConfig: RawTransactionArgument<string>;
    AdminCap: RawTransactionArgument<string>;
    state: RawTransactionArgument<string>;
}
export interface ClearMarketStatePointConfigByAdminOptions {
    package?: string;
    arguments: ClearMarketStatePointConfigByAdminArguments | [
        registry: RawTransactionArgument<string>,
        globalConfig: RawTransactionArgument<string>,
        AdminCap: RawTransactionArgument<string>,
        state: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function clearMarketStatePointConfigByAdmin(options: ClearMarketStatePointConfigByAdminOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "globalConfig", "AdminCap", "state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'clear_market_state_point_config_by_admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface IdArguments {
    registry: RawTransactionArgument<string>;
}
export interface IdOptions {
    package?: string;
    arguments: IdArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function id(options: IdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectCountArguments {
    registry: RawTransactionArgument<string>;
}
export interface ProjectCountOptions {
    package?: string;
    arguments: ProjectCountArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function projectCount(options: ProjectCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesCountArguments {
    registry: RawTransactionArgument<string>;
}
export interface SeriesCountOptions {
    package?: string;
    arguments: SeriesCountArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function seriesCount(options: SeriesCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketCountArguments {
    registry: RawTransactionArgument<string>;
}
export interface MarketCountOptions {
    package?: string;
    arguments: MarketCountArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function marketCount(options: MarketCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectIdAtArguments {
    registry: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface ProjectIdAtOptions {
    package?: string;
    arguments: ProjectIdAtArguments | [
        registry: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function projectIdAt(options: ProjectIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesIdAtArguments {
    registry: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface SeriesIdAtOptions {
    package?: string;
    arguments: SeriesIdAtArguments | [
        registry: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function seriesIdAt(options: SeriesIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketIdAtArguments {
    registry: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface MarketIdAtOptions {
    package?: string;
    arguments: MarketIdAtArguments | [
        registry: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function marketIdAt(options: MarketIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesIdsArguments {
    registry: RawTransactionArgument<string>;
}
export interface SeriesIdsOptions {
    package?: string;
    arguments: SeriesIdsArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function seriesIds(options: SeriesIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketIdsArguments {
    registry: RawTransactionArgument<string>;
}
export interface MarketIdsOptions {
    package?: string;
    arguments: MarketIdsArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function marketIds(options: MarketIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectExistsArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectExistsOptions {
    package?: string;
    arguments: ProjectExistsArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectExists(options: ProjectExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectMetadataExistsArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectMetadataExistsOptions {
    package?: string;
    arguments: ProjectMetadataExistsArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectMetadataExists(options: ProjectMetadataExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_metadata_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectMetadataArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectMetadataOptions {
    package?: string;
    arguments: ProjectMetadataArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectMetadata(options: ProjectMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesExistsArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface SeriesExistsOptions {
    package?: string;
    arguments: SeriesExistsArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function seriesExists(options: SeriesExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketRegisteredArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketRegisteredOptions {
    package?: string;
    arguments: MarketRegisteredArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketRegistered(options: MarketRegisteredOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_registered',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketMetadataExistsArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketMetadataExistsOptions {
    package?: string;
    arguments: MarketMetadataExistsArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketMetadataExists(options: MarketMetadataExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_metadata_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketMetadataArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketMetadataOptions {
    package?: string;
    arguments: MarketMetadataArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketMetadata(options: MarketMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectPointConfigExistsArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectPointConfigExistsOptions {
    package?: string;
    arguments: ProjectPointConfigExistsArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectPointConfigExists(options: ProjectPointConfigExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_point_config_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectPointConfigArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectPointConfigOptions {
    package?: string;
    arguments: ProjectPointConfigArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectPointConfig(options: ProjectPointConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_point_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectPointsEnabledArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectPointsEnabledOptions {
    package?: string;
    arguments: ProjectPointsEnabledArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectPointsEnabled(options: ProjectPointsEnabledOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_points_enabled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectPointConfigIdsArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectPointConfigIdsOptions {
    package?: string;
    arguments: ProjectPointConfigIdsArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectPointConfigIds(options: ProjectPointConfigIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_point_config_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectPointConfigMetadataArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectPointConfigMetadataOptions {
    package?: string;
    arguments: ProjectPointConfigMetadataArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectPointConfigMetadata(options: ProjectPointConfigMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_point_config_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectPointConfigParamsArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectPointConfigParamsOptions {
    package?: string;
    arguments: ProjectPointConfigParamsArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function projectPointConfigParams(options: ProjectPointConfigParamsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project_point_config_params',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketProjectIdArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketProjectIdOptions {
    package?: string;
    arguments: MarketProjectIdArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketProjectId(options: MarketProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketSeriesIdArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketSeriesIdOptions {
    package?: string;
    arguments: MarketSeriesIdArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketSeriesId(options: MarketSeriesIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_series_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketStateIdArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketStateIdOptions {
    package?: string;
    arguments: MarketStateIdArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketStateId(options: MarketStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketRewardDistributorIdArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketRewardDistributorIdOptions {
    package?: string;
    arguments: MarketRewardDistributorIdArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketRewardDistributorId(options: MarketRewardDistributorIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_reward_distributor_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointConfigExistsArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketPointConfigExistsOptions {
    package?: string;
    arguments: MarketPointConfigExistsArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketPointConfigExists(options: MarketPointConfigExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_config_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointConfigArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketPointConfigOptions {
    package?: string;
    arguments: MarketPointConfigArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketPointConfig(options: MarketPointConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketLpPointStateIdArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketLpPointStateIdOptions {
    package?: string;
    arguments: MarketLpPointStateIdArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketLpPointStateId(options: MarketLpPointStateIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_lp_point_state_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointConfigIdsArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketPointConfigIdsOptions {
    package?: string;
    arguments: MarketPointConfigIdsArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketPointConfigIds(options: MarketPointConfigIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_config_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointConfigParamsArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketPointConfigParamsOptions {
    package?: string;
    arguments: MarketPointConfigParamsArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketPointConfigParams(options: MarketPointConfigParamsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_config_params',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramCountArguments {
    registry: RawTransactionArgument<string>;
}
export interface PointProgramCountOptions {
    package?: string;
    arguments: PointProgramCountArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function pointProgramCount(options: PointProgramCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramIdAtArguments {
    registry: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface PointProgramIdAtOptions {
    package?: string;
    arguments: PointProgramIdAtArguments | [
        registry: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function pointProgramIdAt(options: PointProgramIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramIdsArguments {
    registry: RawTransactionArgument<string>;
}
export interface PointProgramIdsOptions {
    package?: string;
    arguments: PointProgramIdsArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function pointProgramIds(options: PointProgramIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramExistsArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface PointProgramExistsOptions {
    package?: string;
    arguments: PointProgramExistsArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function pointProgramExists(options: PointProgramExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface PointProgramOptions {
    package?: string;
    arguments: PointProgramArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function pointProgram(options: PointProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramIdsConfigArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface PointProgramIdsConfigOptions {
    package?: string;
    arguments: PointProgramIdsConfigArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function pointProgramIdsConfig(options: PointProgramIdsConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_ids_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramMetadataArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface PointProgramMetadataOptions {
    package?: string;
    arguments: PointProgramMetadataArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function pointProgramMetadata(options: PointProgramMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointProgramExistsArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface MarketPointProgramExistsOptions {
    package?: string;
    arguments: MarketPointProgramExistsArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function marketPointProgramExists(options: MarketPointProgramExistsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_program_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointProgramArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface MarketPointProgramOptions {
    package?: string;
    arguments: MarketPointProgramArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function marketPointProgram(options: MarketPointProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointProgramConfigArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface MarketPointProgramConfigOptions {
    package?: string;
    arguments: MarketPointProgramConfigArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function marketPointProgramConfig(options: MarketPointProgramConfigOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_program_config',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointProgramCountArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketPointProgramCountOptions {
    package?: string;
    arguments: MarketPointProgramCountArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketPointProgramCount(options: MarketPointProgramCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_program_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointProgramIdAtArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface MarketPointProgramIdAtOptions {
    package?: string;
    arguments: MarketPointProgramIdAtArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function marketPointProgramIdAt(options: MarketPointProgramIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_program_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketPointProgramIdsArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketPointProgramIdsOptions {
    package?: string;
    arguments: MarketPointProgramIdsArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketPointProgramIds(options: MarketPointProgramIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_point_program_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramMarketCountArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface PointProgramMarketCountOptions {
    package?: string;
    arguments: PointProgramMarketCountArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function pointProgramMarketCount(options: PointProgramMarketCountOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_market_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramMarketIdAtArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface PointProgramMarketIdAtOptions {
    package?: string;
    arguments: PointProgramMarketIdAtArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function pointProgramMarketIdAt(options: PointProgramMarketIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_market_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PointProgramMarketIdsArguments {
    registry: RawTransactionArgument<string>;
    pointConfigId: RawTransactionArgument<string>;
}
export interface PointProgramMarketIdsOptions {
    package?: string;
    arguments: PointProgramMarketIdsArguments | [
        registry: RawTransactionArgument<string>,
        pointConfigId: RawTransactionArgument<string>
    ];
}
export function pointProgramMarketIds(options: PointProgramMarketIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "pointConfigId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'point_program_market_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProjectArguments {
    registry: RawTransactionArgument<string>;
    projectId: RawTransactionArgument<number | bigint>;
}
export interface ProjectOptions {
    package?: string;
    arguments: ProjectArguments | [
        registry: RawTransactionArgument<string>,
        projectId: RawTransactionArgument<number | bigint>
    ];
}
export function project(options: ProjectOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "projectId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'project',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface SeriesOptions {
    package?: string;
    arguments: SeriesArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function series(options: SeriesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesAtArguments {
    registry: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface SeriesAtOptions {
    package?: string;
    arguments: SeriesAtArguments | [
        registry: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function seriesAt(options: SeriesAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesMarketIdAtArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    index: RawTransactionArgument<number | bigint>;
}
export interface SeriesMarketIdAtOptions {
    package?: string;
    arguments: SeriesMarketIdAtArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function seriesMarketIdAt(options: SeriesMarketIdAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_market_id_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesMarketIdsArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface SeriesMarketIdsOptions {
    package?: string;
    arguments: SeriesMarketIdsArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function seriesMarketIds(options: SeriesMarketIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_market_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesProjectIdArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface SeriesProjectIdOptions {
    package?: string;
    arguments: SeriesProjectIdArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function seriesProjectId(options: SeriesProjectIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_project_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesDefaultMarketIdArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface SeriesDefaultMarketIdOptions {
    package?: string;
    arguments: SeriesDefaultMarketIdArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function seriesDefaultMarketId(options: SeriesDefaultMarketIdOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_default_market_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesListedArguments {
    registry: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
}
export interface SeriesListedOptions {
    package?: string;
    arguments: SeriesListedArguments | [
        registry: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>
    ];
}
export function seriesListed(options: SeriesListedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "seriesId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_listed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketExpiryArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketExpiryOptions {
    package?: string;
    arguments: MarketExpiryArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketExpiry(options: MarketExpiryOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_expiry',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketListedArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketListedOptions {
    package?: string;
    arguments: MarketListedArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketListed(options: MarketListedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_listed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketDisplayRankArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketDisplayRankOptions {
    package?: string;
    arguments: MarketDisplayRankArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketDisplayRank(options: MarketDisplayRankOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_display_rank',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketRecordArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
}
export interface MarketRecordOptions {
    package?: string;
    arguments: MarketRecordArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>
    ];
}
export function marketRecord(options: MarketRecordOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketRecordAtArguments {
    registry: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface MarketRecordAtOptions {
    package?: string;
    arguments: MarketRecordAtArguments | [
        registry: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
export function marketRecordAt(options: MarketRecordAtOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_record_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NoneIdOptions {
    package?: string;
    arguments?: [
    ];
}
export function noneId(options: NoneIdOptions = {}) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'none_id',
    });
}