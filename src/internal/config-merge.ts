import type { JitterMarketConfig } from "../types.js";

/**
 * Environment entries are partial deployment overrides. Preserve nested
 * protocol bindings from the generated config unless the override replaces
 * the individual field explicitly.
 */
export function mergeJitterMarketConfig(
  base: JitterMarketConfig,
  override: JitterMarketConfig,
): JitterMarketConfig {
  return {
    ...base,
    ...override,
    jitterOriginalPackageId:
      override.jitterOriginalPackageId ?? base.jitterOriginalPackageId,
    liquidlink:
      base.liquidlink || override.liquidlink
        ? {
            ...base.liquidlink,
            ...override.liquidlink,
            checkIn:
              base.liquidlink?.checkIn || override.liquidlink?.checkIn
                ? {
                    ...base.liquidlink?.checkIn,
                    ...override.liquidlink?.checkIn,
                  }
                : undefined,
            tokenizedPoint:
              base.liquidlink?.tokenizedPoint ||
              override.liquidlink?.tokenizedPoint
                ? {
                    ...base.liquidlink?.tokenizedPoint,
                    ...override.liquidlink?.tokenizedPoint,
                  }
                : undefined,
          }
        : undefined,
    coinReward: override.coinReward
      ? {
          ...base.coinReward,
          ...override.coinReward,
        }
      : base.coinReward,
  };
}
