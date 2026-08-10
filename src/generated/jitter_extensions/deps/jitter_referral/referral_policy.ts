/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../../../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'jitter_referral::referral_policy';
export const YtReferralSourceCap = new MoveStruct({ name: `${$moduleName}::YtReferralSourceCap<phantom W>`, fields: {
        project_id: bcs.Address,
        source_id: bcs.Address
    } });
export const LpReferralSourceCap = new MoveStruct({ name: `${$moduleName}::LpReferralSourceCap<phantom W>`, fields: {
        project_id: bcs.Address,
        source_id: bcs.Address
    } });