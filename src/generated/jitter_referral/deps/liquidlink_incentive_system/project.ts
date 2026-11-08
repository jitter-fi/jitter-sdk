/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../../../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import * as type_name from '../std/type_name.js';
const $moduleName = 'liquidlink_incentive_system::project';
export const PolicySettlementCap = new MoveStruct({ name: `${$moduleName}::PolicySettlementCap<phantom P>`, fields: {
        project_object_id: bcs.Address,
        project_id: bcs.Address,
        scoreboard_id: bcs.Address,
        policy: type_name.TypeName,
        policy_state_id: bcs.Address,
        registration_generation: bcs.u64()
    } });