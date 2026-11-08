import type { JitterMarketConfig } from "../types.js";

const EXIT_ADAPTERS = {
  scallop: { package: "scallopAdapterPackageId", vault: "scallopMarketVaultObjectId" },
  haedal: { package: "haedalAdapterPackageId", vault: "haedalMarketVaultObjectId" },
  ember: { package: "emberAdapterPackageId", vault: "emberMarketVaultObjectId" },
} as const;

export function resolveReceiptAdapter(config: JitterMarketConfig, kind: string) {
  if (kind !== "scallop" && kind !== "haedal" && kind !== "ember") {
    throw new Error("SY receipt exits require a Scallop, Haedal or Ember adapter.");
  }
  const fields = EXIT_ADAPTERS[kind];
  function required(key: keyof JitterMarketConfig): string {
    const value = config[key];
    if (typeof value !== "string" || !value) throw new Error(`Missing Jitter market config field: ${key}.`);
    return value;
  }
  const typeArguments = [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
  if (kind === "scallop") typeArguments.unshift(config.underlyingTypeTag);
  if (kind === "ember") typeArguments.unshift(config.underlyingTypeTag, required("emberReceiptTypeTag"));
  return {
    kind, packageId: required(fields.package), vaultObjectId: required(fields.vault),
    vaultConfigKey: fields.vault, typeArguments,
  } as const;
}
