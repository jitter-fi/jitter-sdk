/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Root administration capability for the Jitter package family.
 *
 * This capability intentionally lives below `jitter_admin` in the dependency graph
 * so ACL operations can themselves be version-gated and paused.
 */

import { MoveStruct } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'jitter/jitter-config::admin';
export const AdminCap = new MoveStruct({ name: `${$moduleName}::AdminCap`, fields: {
        id: bcs.Address
    } });