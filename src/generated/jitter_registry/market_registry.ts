/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** An admin-curated discovery catalogue. It never authorizes asset movements. */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs, type BcsType } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as table from './deps/sui/table.js';
import * as table_1 from './deps/sui/table.js';
import * as table_2 from './deps/sui/table.js';
import * as table_3 from './deps/sui/table.js';
import * as table_4 from './deps/sui/table.js';
import * as table_5 from './deps/sui/table.js';
import * as bag from './deps/sui/bag.js';
import * as table_6 from './deps/sui/table.js';
import * as type_name from './deps/std/type_name.js';
import * as type_name_1 from './deps/std/type_name.js';
import * as table_7 from './deps/sui/table.js';
import * as type_name_2 from './deps/std/type_name.js';
import * as type_name_3 from './deps/std/type_name.js';
import * as type_name_4 from './deps/std/type_name.js';
import * as table_8 from './deps/sui/table.js';
import * as table_9 from './deps/sui/table.js';
import * as type_name_5 from './deps/std/type_name.js';
import * as type_name_6 from './deps/std/type_name.js';
import * as table_10 from './deps/sui/table.js';
import * as type_name_7 from './deps/std/type_name.js';
import * as type_name_8 from './deps/std/type_name.js';
import * as type_name_9 from './deps/std/type_name.js';
import * as type_name_10 from './deps/std/type_name.js';
import * as type_name_11 from './deps/std/type_name.js';
import * as type_name_12 from './deps/std/type_name.js';
import * as type_name_13 from './deps/std/type_name.js';
import * as type_name_14 from './deps/std/type_name.js';
import * as type_name_15 from './deps/std/type_name.js';
import * as type_name_16 from './deps/std/type_name.js';
import * as type_name_17 from './deps/std/type_name.js';
import * as type_name_18 from './deps/std/type_name.js';
import * as type_name_19 from './deps/std/type_name.js';
import * as type_name_20 from './deps/std/type_name.js';
import * as type_name_21 from './deps/std/type_name.js';
const $moduleName = 'jitter/jitter-registry::market_registry';
export const Registry = new MoveStruct({ name: `${$moduleName}::Registry`, fields: {
        id: bcs.Address,
        config_id: bcs.Address,
        admin_cap_id: bcs.Address,
        sy_state_id: bcs.Address,
        schema_version: bcs.u64(),
        next_protocol_id: bcs.u64(),
        next_series_id: bcs.u64(),
        protocols: table.Table,
        series: table_1.Table,
        markets: table_2.Table,
        programs: table_3.Table,
        sources: table_4.Table,
        market_sources: table_5.Table,
        extensions: bag.Bag
    } });
export const ProtocolMetadata = new MoveStruct({ name: `${$moduleName}::ProtocolMetadata`, fields: {
        name: bcs.vector(bcs.u8()),
        slug: bcs.vector(bcs.u8()),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        website_uri: bcs.vector(bcs.u8()),
        docs_uri: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8())
    } });
export const SeriesMetadata = new MoveStruct({ name: `${$moduleName}::SeriesMetadata`, fields: {
        name: bcs.vector(bcs.u8()),
        symbol: bcs.vector(bcs.u8()),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        category: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8())
    } });
export const MarketMetadata = new MoveStruct({ name: `${$moduleName}::MarketMetadata`, fields: {
        name: bcs.vector(bcs.u8()),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8())
    } });
export const ProgramMetadata = new MoveStruct({ name: `${$moduleName}::ProgramMetadata`, fields: {
        name: bcs.vector(bcs.u8()),
        season: bcs.vector(bcs.u8()),
        description: bcs.vector(bcs.u8()),
        icon_uri: bcs.vector(bcs.u8()),
        metadata_uri: bcs.vector(bcs.u8())
    } });
export const Protocol = new MoveStruct({ name: `${$moduleName}::Protocol`, fields: {
        protocol_id: bcs.u64(),
        metadata: ProtocolMetadata,
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64(),
        series_ids: table_6.Table
    } });
export const Series = new MoveStruct({ name: `${$moduleName}::Series`, fields: {
        series_id: bcs.u64(),
        protocol_id: bcs.u64(),
        underlying_type: type_name.TypeName,
        receipt_type: type_name_1.TypeName,
        metadata: SeriesMetadata,
        default_market_id: bcs.option(bcs.Address),
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64(),
        market_ids: table_7.Table
    } });
export const MarketRecord = new MoveStruct({ name: `${$moduleName}::MarketRecord`, fields: {
        market_id: bcs.Address,
        series_id: bcs.u64(),
        expiry_ms: bcs.u64(),
        sy_type: type_name_2.TypeName,
        pt_type: type_name_3.TypeName,
        yt_type: type_name_4.TypeName,
        metadata: MarketMetadata,
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64(),
        source_ids: table_8.Table
    } });
export const PointProgram = new MoveStruct({ name: `${$moduleName}::PointProgram`, fields: {
        scoreboard_id: bcs.Address,
        project_object_id: bcs.Address,
        liquidlink_config_id: bcs.Address,
        protocol_id: bcs.option(bcs.u64()),
        metadata: ProgramMetadata,
        listed: bcs.bool(),
        revision: bcs.u64(),
        source_ids: table_9.Table
    } });
export const PointSource = new MoveStruct({ name: `${$moduleName}::PointSource`, fields: {
        source_id: bcs.Address,
        scoreboard_id: bcs.Address,
        policy_type: type_name_5.TypeName,
        source_type: type_name_6.TypeName,
        label: bcs.vector(bcs.u8()),
        archived: bcs.bool(),
        revision: bcs.u64(),
        market_ids: table_10.Table
    } });
export const MarketSourceKey = new MoveStruct({ name: `${$moduleName}::MarketSourceKey`, fields: {
        market_id: bcs.Address,
        source_id: bcs.Address
    } });
export const MarketPointSource = new MoveStruct({ name: `${$moduleName}::MarketPointSource`, fields: {
        market_id: bcs.Address,
        source_id: bcs.Address,
        lp_point_state_id: bcs.option(bcs.Address),
        yt_enabled: bcs.bool(),
        lp_enabled: bcs.bool(),
        archived: bcs.bool(),
        revision: bcs.u64()
    } });
export const ScallopBinding = new MoveStruct({ name: `${$moduleName}::ScallopBinding`, fields: {
        scallop_market_id: bcs.Address,
        version_id: bcs.Address
    } });
export const HaedalBinding = new MoveStruct({ name: `${$moduleName}::HaedalBinding`, fields: {
        staking_id: bcs.Address
    } });
export const EmberBinding = new MoveStruct({ name: `${$moduleName}::EmberBinding`, fields: {
        ember_vault_id: bcs.Address
    } });
export const AdapterKey = new MoveStruct({ name: `${$moduleName}::AdapterKey<phantom Payload>`, fields: {
        market_id: bcs.Address
    } });
export function AdapterBinding<Payload extends BcsType<any>>(...typeParameters: [
    Payload
]) {
    return new MoveStruct({ name: `${$moduleName}::AdapterBinding<${typeParameters[0].name as Payload['name']}>`, fields: {
            market_id: bcs.Address,
            adapter_type: type_name_7.TypeName,
            vault_id: bcs.Address,
            revision: bcs.u64(),
            payload: typeParameters[0]
        } });
}
export const OrderbookKey = new MoveStruct({ name: `${$moduleName}::OrderbookKey`, fields: {
        market_id: bcs.Address
    } });
export const OrderbookLinks = new MoveStruct({ name: `${$moduleName}::OrderbookLinks`, fields: {
        pt_orderbook_id: bcs.option(bcs.Address),
        yt_orderbook_id: bcs.option(bcs.Address),
        revision: bcs.u64()
    } });
export const PointTradingKey = new MoveStruct({ name: `${$moduleName}::PointTradingKey`, fields: {
        scoreboard_id: bcs.Address
    } });
export const PointTradingLink = new MoveStruct({ name: `${$moduleName}::PointTradingLink`, fields: {
        scoreboard_id: bcs.Address,
        point_token_market_id: bcs.Address,
        orderbook_id: bcs.option(bcs.Address),
        revision: bcs.u64()
    } });
export const RegistryCreated = new MoveStruct({ name: `${$moduleName}::RegistryCreated`, fields: {
        registry_id: bcs.Address,
        creator: bcs.Address,
        config_id: bcs.Address,
        admin_cap_id: bcs.Address,
        sy_state_id: bcs.Address,
        schema_version: bcs.u64()
    } });
export const ProtocolRegistered = new MoveStruct({ name: `${$moduleName}::ProtocolRegistered`, fields: {
        registry_id: bcs.Address,
        protocol_id: bcs.u64(),
        metadata: ProtocolMetadata,
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64()
    } });
export const ProtocolUpdated = new MoveStruct({ name: `${$moduleName}::ProtocolUpdated`, fields: {
        registry_id: bcs.Address,
        protocol_id: bcs.u64(),
        metadata: ProtocolMetadata,
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64()
    } });
export const SeriesRegistered = new MoveStruct({ name: `${$moduleName}::SeriesRegistered`, fields: {
        registry_id: bcs.Address,
        series_id: bcs.u64(),
        protocol_id: bcs.u64(),
        underlying_type: type_name_8.TypeName,
        receipt_type: type_name_9.TypeName,
        metadata: SeriesMetadata,
        default_market_id: bcs.option(bcs.Address),
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64()
    } });
export const SeriesUpdated = new MoveStruct({ name: `${$moduleName}::SeriesUpdated`, fields: {
        registry_id: bcs.Address,
        series_id: bcs.u64(),
        protocol_id: bcs.u64(),
        underlying_type: type_name_10.TypeName,
        receipt_type: type_name_11.TypeName,
        metadata: SeriesMetadata,
        default_market_id: bcs.option(bcs.Address),
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64()
    } });
export const MarketRegistered = new MoveStruct({ name: `${$moduleName}::MarketRegistered`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        series_id: bcs.u64(),
        expiry_ms: bcs.u64(),
        sy_type: type_name_12.TypeName,
        pt_type: type_name_13.TypeName,
        yt_type: type_name_14.TypeName,
        metadata: MarketMetadata,
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64()
    } });
export const MarketUpdated = new MoveStruct({ name: `${$moduleName}::MarketUpdated`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        series_id: bcs.u64(),
        expiry_ms: bcs.u64(),
        sy_type: type_name_15.TypeName,
        pt_type: type_name_16.TypeName,
        yt_type: type_name_17.TypeName,
        metadata: MarketMetadata,
        listed: bcs.bool(),
        display_rank: bcs.u64(),
        revision: bcs.u64()
    } });
export const ProgramRegistered = new MoveStruct({ name: `${$moduleName}::ProgramRegistered`, fields: {
        registry_id: bcs.Address,
        scoreboard_id: bcs.Address,
        project_object_id: bcs.Address,
        liquidlink_config_id: bcs.Address,
        protocol_id: bcs.option(bcs.u64()),
        metadata: ProgramMetadata,
        listed: bcs.bool(),
        revision: bcs.u64()
    } });
export const ProgramUpdated = new MoveStruct({ name: `${$moduleName}::ProgramUpdated`, fields: {
        registry_id: bcs.Address,
        scoreboard_id: bcs.Address,
        project_object_id: bcs.Address,
        liquidlink_config_id: bcs.Address,
        protocol_id: bcs.option(bcs.u64()),
        metadata: ProgramMetadata,
        listed: bcs.bool(),
        revision: bcs.u64()
    } });
export const SourceRegistered = new MoveStruct({ name: `${$moduleName}::SourceRegistered`, fields: {
        registry_id: bcs.Address,
        source_id: bcs.Address,
        scoreboard_id: bcs.Address,
        policy_type: type_name_18.TypeName,
        source_type: type_name_19.TypeName,
        label: bcs.vector(bcs.u8()),
        archived: bcs.bool(),
        revision: bcs.u64()
    } });
export const SourceArchived = new MoveStruct({ name: `${$moduleName}::SourceArchived`, fields: {
        registry_id: bcs.Address,
        source_id: bcs.Address,
        archived: bcs.bool(),
        revision: bcs.u64()
    } });
export const MarketSourceAttached = new MoveStruct({ name: `${$moduleName}::MarketSourceAttached`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        source_id: bcs.Address,
        lp_point_state_id: bcs.option(bcs.Address),
        yt_enabled: bcs.bool(),
        lp_enabled: bcs.bool(),
        archived: bcs.bool(),
        revision: bcs.u64()
    } });
export const MarketSourceArchived = new MoveStruct({ name: `${$moduleName}::MarketSourceArchived`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        source_id: bcs.Address,
        archived: bcs.bool(),
        revision: bcs.u64()
    } });
export const MarketSourceUpdated = new MoveStruct({ name: `${$moduleName}::MarketSourceUpdated`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        source_id: bcs.Address,
        lp_point_state_id: bcs.option(bcs.Address),
        yt_enabled: bcs.bool(),
        lp_enabled: bcs.bool(),
        archived: bcs.bool(),
        revision: bcs.u64()
    } });
export const AdapterBindingUpdated = new MoveStruct({ name: `${$moduleName}::AdapterBindingUpdated`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        adapter_type: type_name_20.TypeName,
        payload_type: type_name_21.TypeName,
        vault_id: bcs.Address,
        revision: bcs.u64(),
        payload_bcs: bcs.vector(bcs.u8())
    } });
export const OrderbooksUpdated = new MoveStruct({ name: `${$moduleName}::OrderbooksUpdated`, fields: {
        registry_id: bcs.Address,
        market_id: bcs.Address,
        pt_orderbook_id: bcs.option(bcs.Address),
        yt_orderbook_id: bcs.option(bcs.Address),
        revision: bcs.u64()
    } });
export const PointTradingUpdated = new MoveStruct({ name: `${$moduleName}::PointTradingUpdated`, fields: {
        registry_id: bcs.Address,
        scoreboard_id: bcs.Address,
        point_token_market_id: bcs.Address,
        orderbook_id: bcs.option(bcs.Address),
        revision: bcs.u64()
    } });
export interface ProtocolMetadataArguments {
    name: RawTransactionArgument<Array<number>>;
    slug: RawTransactionArgument<Array<number>>;
    description: RawTransactionArgument<Array<number>>;
    iconUri: RawTransactionArgument<Array<number>>;
    websiteUri: RawTransactionArgument<Array<number>>;
    docsUri: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
}
export interface ProtocolMetadataOptions {
    package?: string;
    arguments: ProtocolMetadataArguments | [
        name: RawTransactionArgument<Array<number>>,
        slug: RawTransactionArgument<Array<number>>,
        description: RawTransactionArgument<Array<number>>,
        iconUri: RawTransactionArgument<Array<number>>,
        websiteUri: RawTransactionArgument<Array<number>>,
        docsUri: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>
    ];
}
export function protocolMetadata(options: ProtocolMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["name", "slug", "description", "iconUri", "websiteUri", "docsUri", "metadataUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'protocol_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesMetadataArguments {
    name: RawTransactionArgument<Array<number>>;
    symbol: RawTransactionArgument<Array<number>>;
    description: RawTransactionArgument<Array<number>>;
    iconUri: RawTransactionArgument<Array<number>>;
    category: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
}
export interface SeriesMetadataOptions {
    package?: string;
    arguments: SeriesMetadataArguments | [
        name: RawTransactionArgument<Array<number>>,
        symbol: RawTransactionArgument<Array<number>>,
        description: RawTransactionArgument<Array<number>>,
        iconUri: RawTransactionArgument<Array<number>>,
        category: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>
    ];
}
export function seriesMetadata(options: SeriesMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["name", "symbol", "description", "iconUri", "category", "metadataUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketMetadataArguments {
    name: RawTransactionArgument<Array<number>>;
    description: RawTransactionArgument<Array<number>>;
    iconUri: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
}
export interface MarketMetadataOptions {
    package?: string;
    arguments: MarketMetadataArguments | [
        name: RawTransactionArgument<Array<number>>,
        description: RawTransactionArgument<Array<number>>,
        iconUri: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>
    ];
}
export function marketMetadata(options: MarketMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["name", "description", "iconUri", "metadataUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProgramMetadataArguments {
    name: RawTransactionArgument<Array<number>>;
    season: RawTransactionArgument<Array<number>>;
    description: RawTransactionArgument<Array<number>>;
    iconUri: RawTransactionArgument<Array<number>>;
    metadataUri: RawTransactionArgument<Array<number>>;
}
export interface ProgramMetadataOptions {
    package?: string;
    arguments: ProgramMetadataArguments | [
        name: RawTransactionArgument<Array<number>>,
        season: RawTransactionArgument<Array<number>>,
        description: RawTransactionArgument<Array<number>>,
        iconUri: RawTransactionArgument<Array<number>>,
        metadataUri: RawTransactionArgument<Array<number>>
    ];
}
export function programMetadata(options: ProgramMetadataOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["name", "season", "description", "iconUri", "metadataUri"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'program_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateArguments {
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
}
export interface CreateOptions {
    package?: string;
    arguments: CreateArguments | [
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>
    ];
}
export function create(options: CreateOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config", "admin", "syState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'create',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateSharedArguments {
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
}
export interface CreateSharedOptions {
    package?: string;
    arguments: CreateSharedArguments | [
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>
    ];
}
export function createShared(options: CreateSharedOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["config", "admin", "syState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'create_shared',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterProtocolArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    metadata: RawTransactionArgument<string>;
}
export interface RegisterProtocolOptions {
    package?: string;
    arguments: RegisterProtocolArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        metadata: RawTransactionArgument<string>
    ];
}
export function registerProtocol(options: RegisterProtocolOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_protocol',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterSeriesArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    protocolId: RawTransactionArgument<number | bigint>;
    metadata: RawTransactionArgument<string>;
}
export interface RegisterSeriesOptions {
    package?: string;
    arguments: RegisterSeriesArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        protocolId: RawTransactionArgument<number | bigint>,
        metadata: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function registerSeries(options: RegisterSeriesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "protocolId", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_series',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RegisterMarketArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    market: RawTransactionArgument<string>;
    metadata: RawTransactionArgument<string>;
}
export interface RegisterMarketOptions {
    package?: string;
    arguments: RegisterMarketArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        market: RawTransactionArgument<string>,
        metadata: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string,
        string
    ];
}
export function registerMarket(options: RegisterMarketOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        null,
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "syState", "seriesId", "market", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_market',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RegisterProgramArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    projectObjectId: RawTransactionArgument<string>;
    liquidlinkConfigId: RawTransactionArgument<string>;
    protocolId: RawTransactionArgument<number | bigint | null>;
    metadata: RawTransactionArgument<string>;
}
export interface RegisterProgramOptions {
    package?: string;
    arguments: RegisterProgramArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        projectObjectId: RawTransactionArgument<string>,
        liquidlinkConfigId: RawTransactionArgument<string>,
        protocolId: RawTransactionArgument<number | bigint | null>,
        metadata: RawTransactionArgument<string>
    ];
}
export function registerProgram(options: RegisterProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        '0x2::object::ID',
        '0x1::option::Option<u64>',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "scoreboardId", "projectObjectId", "liquidlinkConfigId", "protocolId", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterSourceArguments<Source extends BcsType<any>> {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    source: RawTransactionArgument<Source>;
    label: RawTransactionArgument<Array<number>>;
}
export interface RegisterSourceOptions<Source extends BcsType<any>> {
    package?: string;
    arguments: RegisterSourceArguments<Source> | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        source: RawTransactionArgument<Source>,
        label: RawTransactionArgument<Array<number>>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function registerSource<Source extends BcsType<any>>(options: RegisterSourceOptions<Source>) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        `${options.typeArguments[0]}`,
        'vector<u8>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "scoreboardId", "source", "label"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'register_source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface AttachSourceArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    sourceId: RawTransactionArgument<string>;
    lpPointStateId: RawTransactionArgument<string | null>;
    ytEnabled: RawTransactionArgument<boolean>;
    lpEnabled: RawTransactionArgument<boolean>;
}
export interface AttachSourceOptions {
    package?: string;
    arguments: AttachSourceArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        sourceId: RawTransactionArgument<string>,
        lpPointStateId: RawTransactionArgument<string | null>,
        ytEnabled: RawTransactionArgument<boolean>,
        lpEnabled: RawTransactionArgument<boolean>
    ];
}
export function attachSource(options: AttachSourceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        '0x1::option::Option<0x2::object::ID>',
        'bool',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "marketId", "sourceId", "lpPointStateId", "ytEnabled", "lpEnabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'attach_source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateMarketSourceArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    sourceId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    lpPointStateId: RawTransactionArgument<string | null>;
    ytEnabled: RawTransactionArgument<boolean>;
    lpEnabled: RawTransactionArgument<boolean>;
}
export interface UpdateMarketSourceOptions {
    package?: string;
    arguments: UpdateMarketSourceArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        sourceId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        lpPointStateId: RawTransactionArgument<string | null>,
        ytEnabled: RawTransactionArgument<boolean>,
        lpEnabled: RawTransactionArgument<boolean>
    ];
}
/** Correct a discovery association without deleting its history or memberships. */
export function updateMarketSource(options: UpdateMarketSourceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        'u64',
        '0x1::option::Option<0x2::object::ID>',
        'bool',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "marketId", "sourceId", "expectedRevision", "lpPointStateId", "ytEnabled", "lpEnabled"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'update_market_source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateProtocolArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    protocolId: RawTransactionArgument<number | bigint>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    metadata: RawTransactionArgument<string>;
}
export interface UpdateProtocolOptions {
    package?: string;
    arguments: UpdateProtocolArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        protocolId: RawTransactionArgument<number | bigint>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        metadata: RawTransactionArgument<string>
    ];
}
export function updateProtocol(options: UpdateProtocolOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "protocolId", "expectedRevision", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'update_protocol',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateSeriesArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    metadata: RawTransactionArgument<string>;
}
export interface UpdateSeriesOptions {
    package?: string;
    arguments: UpdateSeriesArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        metadata: RawTransactionArgument<string>
    ];
}
export function updateSeries(options: UpdateSeriesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "seriesId", "expectedRevision", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'update_series',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateMarketArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    metadata: RawTransactionArgument<string>;
}
export interface UpdateMarketOptions {
    package?: string;
    arguments: UpdateMarketArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        metadata: RawTransactionArgument<string>
    ];
}
export function updateMarket(options: UpdateMarketOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "marketId", "expectedRevision", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'update_market',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateProgramArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    metadata: RawTransactionArgument<string>;
}
export interface UpdateProgramOptions {
    package?: string;
    arguments: UpdateProgramArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        metadata: RawTransactionArgument<string>
    ];
}
export function updateProgram(options: UpdateProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "scoreboardId", "expectedRevision", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'update_program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetProtocolListingArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    protocolId: RawTransactionArgument<number | bigint>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    listed: RawTransactionArgument<boolean>;
    displayRank: RawTransactionArgument<number | bigint>;
}
export interface SetProtocolListingOptions {
    package?: string;
    arguments: SetProtocolListingArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        protocolId: RawTransactionArgument<number | bigint>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        listed: RawTransactionArgument<boolean>,
        displayRank: RawTransactionArgument<number | bigint>
    ];
}
export function setProtocolListing(options: SetProtocolListingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        'bool',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "protocolId", "expectedRevision", "listed", "displayRank"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_protocol_listing',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetSeriesListingArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    listed: RawTransactionArgument<boolean>;
    displayRank: RawTransactionArgument<number | bigint>;
}
export interface SetSeriesListingOptions {
    package?: string;
    arguments: SetSeriesListingArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        listed: RawTransactionArgument<boolean>,
        displayRank: RawTransactionArgument<number | bigint>
    ];
}
export function setSeriesListing(options: SetSeriesListingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        'bool',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "seriesId", "expectedRevision", "listed", "displayRank"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_series_listing',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetMarketListingArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    listed: RawTransactionArgument<boolean>;
    displayRank: RawTransactionArgument<number | bigint>;
}
export interface SetMarketListingOptions {
    package?: string;
    arguments: SetMarketListingArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        listed: RawTransactionArgument<boolean>,
        displayRank: RawTransactionArgument<number | bigint>
    ];
}
export function setMarketListing(options: SetMarketListingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        'bool',
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "marketId", "expectedRevision", "listed", "displayRank"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_market_listing',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetProgramListingArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    listed: RawTransactionArgument<boolean>;
}
export interface SetProgramListingOptions {
    package?: string;
    arguments: SetProgramListingArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        listed: RawTransactionArgument<boolean>
    ];
}
export function setProgramListing(options: SetProgramListingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "scoreboardId", "expectedRevision", "listed"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_program_listing',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetDefaultMarketArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    seriesId: RawTransactionArgument<number | bigint>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    marketId: RawTransactionArgument<string | null>;
}
export interface SetDefaultMarketOptions {
    package?: string;
    arguments: SetDefaultMarketArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        seriesId: RawTransactionArgument<number | bigint>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        marketId: RawTransactionArgument<string | null>
    ];
}
export function setDefaultMarket(options: SetDefaultMarketOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        'u64',
        'u64',
        '0x1::option::Option<0x2::object::ID>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "seriesId", "expectedRevision", "marketId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_default_market',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ArchiveSourceArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    sourceId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    archived: RawTransactionArgument<boolean>;
}
export interface ArchiveSourceOptions {
    package?: string;
    arguments: ArchiveSourceArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        sourceId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        archived: RawTransactionArgument<boolean>
    ];
}
export function archiveSource(options: ArchiveSourceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "sourceId", "expectedRevision", "archived"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'archive_source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ArchiveMarketSourceArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    sourceId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    archived: RawTransactionArgument<boolean>;
}
export interface ArchiveMarketSourceOptions {
    package?: string;
    arguments: ArchiveMarketSourceArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        sourceId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        archived: RawTransactionArgument<boolean>
    ];
}
export function archiveMarketSource(options: ArchiveMarketSourceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        '0x2::object::ID',
        'u64',
        'bool'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "marketId", "sourceId", "expectedRevision", "archived"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'archive_market_source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ScallopBindingArguments {
    scallopMarketId: RawTransactionArgument<string>;
    versionId: RawTransactionArgument<string>;
}
export interface ScallopBindingOptions {
    package?: string;
    arguments: ScallopBindingArguments | [
        scallopMarketId: RawTransactionArgument<string>,
        versionId: RawTransactionArgument<string>
    ];
}
export function scallopBinding(options: ScallopBindingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["scallopMarketId", "versionId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'scallop_binding',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HaedalBindingArguments {
    stakingId: RawTransactionArgument<string>;
}
export interface HaedalBindingOptions {
    package?: string;
    arguments: HaedalBindingArguments | [
        stakingId: RawTransactionArgument<string>
    ];
}
export function haedalBinding(options: HaedalBindingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["stakingId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'haedal_binding',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmberBindingArguments {
    emberVaultId: RawTransactionArgument<string>;
}
export interface EmberBindingOptions {
    package?: string;
    arguments: EmberBindingArguments | [
        emberVaultId: RawTransactionArgument<string>
    ];
}
export function emberBinding(options: EmberBindingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["emberVaultId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'ember_binding',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetAdapterBindingArguments<Payload extends BcsType<any>> {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    syState: RawTransactionArgument<string>;
    market: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    vaultId: RawTransactionArgument<string>;
    payload: RawTransactionArgument<Payload>;
}
export interface SetAdapterBindingOptions<Payload extends BcsType<any>> {
    package?: string;
    arguments: SetAdapterBindingArguments<Payload> | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        syState: RawTransactionArgument<string>,
        market: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        vaultId: RawTransactionArgument<string>,
        payload: RawTransactionArgument<Payload>
    ];
    typeArguments: [
        string,
        string,
        string,
        string,
        string
    ];
}
/** Descriptors are curated; clients verify actual SyState and Vault before use. */
export function setAdapterBinding<Payload extends BcsType<any>>(options: SetAdapterBindingOptions<Payload>) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        'u64',
        '0x2::object::ID',
        `${options.typeArguments[4]}`
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "syState", "market", "expectedRevision", "vaultId", "payload"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_adapter_binding',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SetOrderbooksArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    ptOrderbookId: RawTransactionArgument<string | null>;
    ytOrderbookId: RawTransactionArgument<string | null>;
}
export interface SetOrderbooksOptions {
    package?: string;
    arguments: SetOrderbooksArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        ptOrderbookId: RawTransactionArgument<string | null>,
        ytOrderbookId: RawTransactionArgument<string | null>
    ];
}
export function setOrderbooks(options: SetOrderbooksOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        '0x1::option::Option<0x2::object::ID>',
        '0x1::option::Option<0x2::object::ID>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "marketId", "expectedRevision", "ptOrderbookId", "ytOrderbookId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_orderbooks',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetPointTradingArguments {
    registry: RawTransactionArgument<string>;
    config: RawTransactionArgument<string>;
    admin: RawTransactionArgument<string>;
    scoreboardId: RawTransactionArgument<string>;
    expectedRevision: RawTransactionArgument<number | bigint>;
    pointTokenMarketId: RawTransactionArgument<string>;
    orderbookId: RawTransactionArgument<string | null>;
}
export interface SetPointTradingOptions {
    package?: string;
    arguments: SetPointTradingArguments | [
        registry: RawTransactionArgument<string>,
        config: RawTransactionArgument<string>,
        admin: RawTransactionArgument<string>,
        scoreboardId: RawTransactionArgument<string>,
        expectedRevision: RawTransactionArgument<number | bigint>,
        pointTokenMarketId: RawTransactionArgument<string>,
        orderbookId: RawTransactionArgument<string | null>
    ];
}
export function setPointTrading(options: SetPointTradingOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::object::ID',
        'u64',
        '0x2::object::ID',
        '0x1::option::Option<0x2::object::ID>'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "config", "admin", "scoreboardId", "expectedRevision", "pointTokenMarketId", "orderbookId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'set_point_trading',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
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
export interface CountsArguments {
    registry: RawTransactionArgument<string>;
}
export interface CountsOptions {
    package?: string;
    arguments: CountsArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function counts(options: CountsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'counts',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProtocolArguments {
    registry: RawTransactionArgument<string>;
    id: RawTransactionArgument<number | bigint>;
}
export interface ProtocolOptions {
    package?: string;
    arguments: ProtocolArguments | [
        registry: RawTransactionArgument<string>,
        id: RawTransactionArgument<number | bigint>
    ];
}
export function protocol(options: ProtocolOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "id"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'protocol',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SeriesArguments {
    registry: RawTransactionArgument<string>;
    id: RawTransactionArgument<number | bigint>;
}
export interface SeriesOptions {
    package?: string;
    arguments: SeriesArguments | [
        registry: RawTransactionArgument<string>,
        id: RawTransactionArgument<number | bigint>
    ];
}
export function series(options: SeriesOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "id"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'series',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketArguments {
    registry: RawTransactionArgument<string>;
    id: RawTransactionArgument<string>;
}
export interface MarketOptions {
    package?: string;
    arguments: MarketArguments | [
        registry: RawTransactionArgument<string>,
        id: RawTransactionArgument<string>
    ];
}
export function market(options: MarketOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "id"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProgramArguments {
    registry: RawTransactionArgument<string>;
    id: RawTransactionArgument<string>;
}
export interface ProgramOptions {
    package?: string;
    arguments: ProgramArguments | [
        registry: RawTransactionArgument<string>,
        id: RawTransactionArgument<string>
    ];
}
export function program(options: ProgramOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "id"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'program',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SourceArguments {
    registry: RawTransactionArgument<string>;
    id: RawTransactionArgument<string>;
}
export interface SourceOptions {
    package?: string;
    arguments: SourceArguments | [
        registry: RawTransactionArgument<string>,
        id: RawTransactionArgument<string>
    ];
}
export function source(options: SourceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "id"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MarketSourceArguments {
    registry: RawTransactionArgument<string>;
    marketId: RawTransactionArgument<string>;
    sourceId: RawTransactionArgument<string>;
}
export interface MarketSourceOptions {
    package?: string;
    arguments: MarketSourceArguments | [
        registry: RawTransactionArgument<string>,
        marketId: RawTransactionArgument<string>,
        sourceId: RawTransactionArgument<string>
    ];
}
export function marketSource(options: MarketSourceOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null,
        '0x2::object::ID',
        '0x2::object::ID'
    ] satisfies (string | null)[];
    const parameterNames = ["registry", "marketId", "sourceId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'market_source',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TableIdsArguments {
    registry: RawTransactionArgument<string>;
}
export interface TableIdsOptions {
    package?: string;
    arguments: TableIdsArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function tableIds(options: TableIdsOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-registry';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'market_registry',
        function: 'table_ids',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}