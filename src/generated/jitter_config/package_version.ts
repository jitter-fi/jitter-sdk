/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** Version identity for the `jitter_config` package itself. */

import { MoveStruct } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'jitter/jitter-config::package_version';
export const PackageMarker = new MoveStruct({ name: `${$moduleName}::PackageMarker`, fields: {
        dummy_field: bcs.bool()
    } });