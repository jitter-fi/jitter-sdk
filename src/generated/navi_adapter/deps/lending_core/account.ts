/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../../../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'lending_core::account';
export const AccountCap = new MoveStruct({ name: `${$moduleName}::AccountCap`, fields: {
        id: bcs.Address
    } });