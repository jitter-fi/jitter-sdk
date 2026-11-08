import { addScallopPriceInfo } from "../oracle.js";
import {
  addScallopDepositFromUnderlying,
  addScallopRedeemToUnderlying,
} from "../sy.js";
import type { JitterMarketConfig } from "../types.js";
import type { JitterAdapterManifest } from "./types.js";
import { addDepositDustToTreasury } from "./deposit-dust.js";

export const scallopAdapterManifest: JitterAdapterManifest = {
  kind: "scallop",
  canDepositUnderlying: true,
  canRedeemUnderlying: true,

  depositInputType(config: JitterMarketConfig): string {
    return config.underlyingTypeTag;
  },

  redeemOutputType(config: JitterMarketConfig): string {
    return config.underlyingTypeTag;
  },

  requiredObjectIds(config: JitterMarketConfig): Record<string, string> {
    return {
      scallopProtocolPackageId: requireConfigValue(
        config.scallopProtocolPackageId,
        "scallopProtocolPackageId",
      ),
      scallopMarketVaultObjectId: requireConfigValue(
        config.scallopMarketVaultObjectId,
        "scallopMarketVaultObjectId",
      ),
      scallopMarketObjectId: requireConfigValue(
        config.scallopMarketObjectId,
        "scallopMarketObjectId",
      ),
      scallopVersionObjectId: requireConfigValue(
        config.scallopVersionObjectId,
        "scallopVersionObjectId",
      ),
    };
  },

  addPriceInfo({ tx, config }) {
    return addScallopPriceInfo(tx, config);
  },

  addDepositToSy({ tx, config, mintRequest, inputCoin, syAmount, sweepDepositDust }) {
    const excessCoin = addScallopDepositFromUnderlying(
        tx,
        config,
        mintRequest,
        inputCoin,
        syAmount,
      );
    if (sweepDepositDust) {
      addDepositDustToTreasury(tx, config, excessCoin, requireConfigValue(config.scallopMarketCoinTypeTag, "scallopMarketCoinTypeTag"));
      return {};
    }
    return { excessCoin };
  },

  addRedeemFromSy({ tx, config, input, syAmount }) {
    return {
      outputCoin: addScallopRedeemToUnderlying(tx, config, input, syAmount),
    };
  },
};

function requireConfigValue(value: string | undefined, field: string): string {
  if (!value) {
    throw new Error(`Missing Jitter market config field: ${field}.`);
  }
  return value;
}
