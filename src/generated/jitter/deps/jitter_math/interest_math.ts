/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../../../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'jitter_math::interest_math';
export const InterestSegment = new MoveStruct({ name: `${$moduleName}::InterestSegment`, fields: {
        start_index: bcs.u128(),
        supply: bcs.u64(),
        user_accounted: bcs.u128(),
        fee_accounted: bcs.u128(),
        index_accounted: bcs.u128(),
        terminal_dust: bcs.u128()
    } });