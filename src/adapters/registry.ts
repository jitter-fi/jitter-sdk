import type { JitterMarketConfig } from "../types.js";
import { demoAdapterManifest } from "./demo.js";
import { currentAdapterManifest } from "./current.js";
import { scallopAdapterManifest } from "./scallop.js";
import type { JitterAdapterKind, JitterAdapterManifest } from "./types.js";

export function detectAdapterKind(
  config: JitterMarketConfig,
): JitterAdapterKind | null {
  if (config.adapterKind === "current" || config.currentAdapterPackageId) return "current";
  if (config.demoMarketVaultObjectId) return "demo";
  if (
    config.scallopAdapterPackageId &&
    config.scallopMarketVaultObjectId &&
    config.scallopMarketObjectId &&
    config.scallopVersionObjectId
  ) {
    return "scallop";
  }
  if (config.emberAdapterPackageId && config.emberMarketVaultObjectId) {
    return "ember";
  }
  if (config.suilendAdapterPackageId && config.suilendMarketVaultObjectId) {
    return "suilend";
  }
  if (config.naviAdapterPackageId && config.naviMarketVaultObjectId) {
    return "navi";
  }
  return null;
}

export function getJitterAdapterManifest(
  config: JitterMarketConfig,
): JitterAdapterManifest {
  const kind = detectAdapterKind(config);
  if (kind === "current") return currentAdapterManifest;
  if (kind === "demo") return demoAdapterManifest;
  if (kind === "scallop") return scallopAdapterManifest;

  throw new Error(
    "Unsupported Jitter adapter for market config. " +
      "Phase 1 service manifests currently support demo and scallop markets.",
  );
}
