/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * linked_table - dynamic-field doubly linked table with keyed access.
 *
 * This is useful for FIFO queues inside price levels: each node is stored as a
 * dynamic field keyed by its order id, so removing a middle order does not scan or
 * resize an unbounded vector.
 */

import { type BcsType, bcs } from '@mysten/sui/bcs';
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'jitter/jitter-framework::linked_table';
export function LinkedTable<K extends BcsType<any>>(...typeParameters: [
    K
]) : MoveStruct<any> {
    return new MoveStruct({ name: `${$moduleName}::LinkedTable<${typeParameters[0].name as K['name']}, phantom V>`, fields: {
            id: bcs.Address,
            size: bcs.u64(),
            head: bcs.option(typeParameters[0]),
            tail: bcs.option(typeParameters[0])
        } });
}
export function Node<K extends BcsType<any>, V extends BcsType<any>>(...typeParameters: [
    K,
    V
]) : MoveStruct<any> {
    return new MoveStruct({ name: `${$moduleName}::Node<${typeParameters[0].name as K['name']}, ${typeParameters[1].name as V['name']}>`, fields: {
            prev: bcs.option(typeParameters[0]),
            next: bcs.option(typeParameters[0]),
            value: typeParameters[1]
        } });
}
export interface NewOptions {
    package?: string;
    arguments?: [
    ];
    typeArguments: [
        string,
        string
    ];
}
export function _new(options: NewOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'new',
        typeArguments: options.typeArguments
    });
}
export interface FrontArguments {
    table: RawTransactionArgument<string>;
}
export interface FrontOptions {
    package?: string;
    arguments: FrontArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function front(options: FrontOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'front',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BackArguments {
    table: RawTransactionArgument<string>;
}
export interface BackOptions {
    package?: string;
    arguments: BackArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function back(options: BackOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'back',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface LengthArguments {
    table: RawTransactionArgument<string>;
}
export interface LengthOptions {
    package?: string;
    arguments: LengthArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function length(options: LengthOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'length',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface IsEmptyArguments {
    table: RawTransactionArgument<string>;
}
export interface IsEmptyOptions {
    package?: string;
    arguments: IsEmptyArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function isEmpty(options: IsEmptyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'is_empty',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ContainsArguments<K extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
}
export interface ContainsOptions<K extends BcsType<any>> {
    package?: string;
    arguments: ContainsArguments<K> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function contains<K extends BcsType<any>>(options: ContainsOptions<K>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'contains',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PushFrontArguments<K extends BcsType<any>, V extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
    value: RawTransactionArgument<V>;
}
export interface PushFrontOptions<K extends BcsType<any>, V extends BcsType<any>> {
    package?: string;
    arguments: PushFrontArguments<K, V> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>,
        value: RawTransactionArgument<V>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function pushFront<K extends BcsType<any>, V extends BcsType<any>>(options: PushFrontOptions<K, V>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`,
        `${options.typeArguments[1]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'push_front',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PushBackArguments<K extends BcsType<any>, V extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
    value: RawTransactionArgument<V>;
}
export interface PushBackOptions<K extends BcsType<any>, V extends BcsType<any>> {
    package?: string;
    arguments: PushBackArguments<K, V> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>,
        value: RawTransactionArgument<V>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function pushBack<K extends BcsType<any>, V extends BcsType<any>>(options: PushBackOptions<K, V>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`,
        `${options.typeArguments[1]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'push_back',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BorrowArguments<K extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
}
export interface BorrowOptions<K extends BcsType<any>> {
    package?: string;
    arguments: BorrowArguments<K> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function borrow<K extends BcsType<any>>(options: BorrowOptions<K>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'borrow',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface BorrowMutArguments<K extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
}
export interface BorrowMutOptions<K extends BcsType<any>> {
    package?: string;
    arguments: BorrowMutArguments<K> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function borrowMut<K extends BcsType<any>>(options: BorrowMutOptions<K>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'borrow_mut',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PrevArguments<K extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
}
export interface PrevOptions<K extends BcsType<any>> {
    package?: string;
    arguments: PrevArguments<K> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function prev<K extends BcsType<any>>(options: PrevOptions<K>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'prev',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface NextArguments<K extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
}
export interface NextOptions<K extends BcsType<any>> {
    package?: string;
    arguments: NextArguments<K> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function next<K extends BcsType<any>>(options: NextOptions<K>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'next',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RemoveArguments<K extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    key: RawTransactionArgument<K>;
}
export interface RemoveOptions<K extends BcsType<any>> {
    package?: string;
    arguments: RemoveArguments<K> | [
        table: RawTransactionArgument<string>,
        key: RawTransactionArgument<K>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function remove<K extends BcsType<any>>(options: RemoveOptions<K>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `${options.typeArguments[0]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "key"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'remove',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PopFrontArguments {
    table: RawTransactionArgument<string>;
}
export interface PopFrontOptions {
    package?: string;
    arguments: PopFrontArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function popFront(options: PopFrontOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'pop_front',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface PopBackArguments {
    table: RawTransactionArgument<string>;
}
export interface PopBackOptions {
    package?: string;
    arguments: PopBackArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function popBack(options: PopBackOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'pop_back',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface InsertFrontArguments<K extends BcsType<any>, V extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    nextKey: RawTransactionArgument<K | null>;
    key: RawTransactionArgument<K>;
    value: RawTransactionArgument<V>;
}
export interface InsertFrontOptions<K extends BcsType<any>, V extends BcsType<any>> {
    package?: string;
    arguments: InsertFrontArguments<K, V> | [
        table: RawTransactionArgument<string>,
        nextKey: RawTransactionArgument<K | null>,
        key: RawTransactionArgument<K>,
        value: RawTransactionArgument<V>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function insertFront<K extends BcsType<any>, V extends BcsType<any>>(options: InsertFrontOptions<K, V>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `0x1::option::Option<${options.typeArguments[0]}>`,
        `${options.typeArguments[0]}`,
        `${options.typeArguments[1]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "nextKey", "key", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'insert_front',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface InsertBackArguments<K extends BcsType<any>, V extends BcsType<any>> {
    table: RawTransactionArgument<string>;
    prevKey: RawTransactionArgument<K | null>;
    key: RawTransactionArgument<K>;
    value: RawTransactionArgument<V>;
}
export interface InsertBackOptions<K extends BcsType<any>, V extends BcsType<any>> {
    package?: string;
    arguments: InsertBackArguments<K, V> | [
        table: RawTransactionArgument<string>,
        prevKey: RawTransactionArgument<K | null>,
        key: RawTransactionArgument<K>,
        value: RawTransactionArgument<V>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function insertBack<K extends BcsType<any>, V extends BcsType<any>>(options: InsertBackOptions<K, V>) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null,
        `0x1::option::Option<${options.typeArguments[0]}>`,
        `${options.typeArguments[0]}`,
        `${options.typeArguments[1]}`
    ] satisfies (string | null)[];
    const parameterNames = ["table", "prevKey", "key", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'insert_back',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface DestroyEmptyArguments {
    table: RawTransactionArgument<string>;
}
export interface DestroyEmptyOptions {
    package?: string;
    arguments: DestroyEmptyArguments | [
        table: RawTransactionArgument<string>
    ];
    typeArguments: [
        string,
        string
    ];
}
export function destroyEmpty(options: DestroyEmptyOptions) {
    const packageAddress = options.package ?? 'jitter/jitter-framework';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    const parameterNames = ["table"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'linked_table',
        function: 'destroy_empty',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}