/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Market-scoped reward coordination.
 *
 * Every distributor belongs to exactly one MarketState. Rewarders are grouped by
 * scope and must settle their own ID before a mutation or transfer can consume the
 * hot-potato operation.
 */

import { MoveStruct } from '../../../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'jitter::reward_distributor';
export const RewarderSettlementCap = new MoveStruct({ name: `${$moduleName}::RewarderSettlementCap`, fields: {
        distributor_id: bcs.Address,
        market_state_id: bcs.Address,
        scope: bcs.u8(),
        rewarder_id: bcs.Address
    } });