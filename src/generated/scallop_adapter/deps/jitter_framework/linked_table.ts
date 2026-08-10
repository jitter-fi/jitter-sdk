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
import { MoveStruct } from '../../../utils/index.js';
const $moduleName = 'jitter_framework::linked_table';
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