import { coinWithBalance, type Transaction, type TransactionObjectArgument } from "@mysten/sui/transactions";
import { _new as newCollector } from "../generated/jitter_oracle/collector.js";
import { aggregate } from "../generated/jitter_oracle/aggregator.js";
import type { JitterMarketConfig } from "../types.js";
import type { JitterAdapterManifest } from "./types.js";

function required(value: string | undefined, field: string): string {
  if (!value) throw new Error(`Missing Jitter market config field: ${field}.`);
  return value;
}

function context(config: JitterMarketConfig) {
  return {
    packageId: required(config.currentAdapterPackageId, "currentAdapterPackageId"),
    global: required(config.globalConfigObjectId, "globalConfigObjectId"),
    vault: required(config.currentMarketVaultObjectId, "currentMarketVaultObjectId"),
    app: required(config.currentProtocolAppObjectId, "currentProtocolAppObjectId"),
    market: required(config.currentMarketObjectId, "currentMarketObjectId"),
    types: [required(config.currentProtocolTypeTag, "currentProtocolTypeTag"), config.underlyingTypeTag,
      config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  };
}

function collect(tx: Transaction, config: JitterMarketConfig) {
  return newCollector({ package: config.oraclePackageId, arguments: [config.marketObjectId], typeArguments: [config.syTypeTag] })(tx);
}

function aggregatePrice(tx: Transaction, config: JitterMarketConfig, collector: TransactionObjectArgument) {
  return aggregate({ package: config.oraclePackageId,
    arguments: [required(config.globalConfigObjectId, "globalConfigObjectId"), config.priceAggregatorObjectId, collector],
    typeArguments: [config.syTypeTag],
  })(tx);
}

/** Borrows explicit funding, or selects one raw underlying unit from the sender.
 * Auto-selected coin remainder is returned even if a future official refresh spends nothing.
 * Upstream pause/caps may block this donation-based refresh; there is no stale fallback.
 */
export function addCurrentPriceInfo(tx: Transaction, config: JitterMarketConfig, fundingCoin?: TransactionObjectArgument): TransactionObjectArgument {
  const c = context(config);
  const sender = tx.getData().sender;
  if (!fundingCoin && !sender) throw new Error("Current refresh funding requires a transaction sender or an explicit funding coin.");
  const funding = fundingCoin ?? tx.add(coinWithBalance({ type: config.underlyingTypeTag, balance: 1n, useGasCoin: false }));
  const collector = collect(tx, config);
  tx.moveCall({ target: `${c.packageId}::current_price_ticket::refresh_and_quote`, typeArguments: c.types,
    arguments: [tx.object(c.global), collector, funding, tx.object(c.vault), tx.object(c.app), tx.object(c.market), tx.object("0x6")],
  });
  if (!fundingCoin) tx.transferObjects([funding], tx.pure.address(sender!));
  return aggregatePrice(tx, config, collector);
}

/** Consumes the entire input coin; minSyOut protects the final capped SY amount. */
export function addCurrentDepositToSy(tx: Transaction, config: JitterMarketConfig, inputCoin: TransactionObjectArgument, minSyOut: bigint): TransactionObjectArgument {
  const c = context(config);
  if (minSyOut < 0n || minSyOut > 0xffffffffffffffffn) throw new Error("minSyOut must fit u64.");
  const collector = collect(tx, config);
  const receipt = tx.moveCall({ target: `${c.packageId}::current_price_ticket::deposit_and_quote`, typeArguments: c.types,
    arguments: [tx.object(c.global), collector, inputCoin, tx.object(c.vault), tx.object(c.app), tx.object(c.market), tx.object("0x6")],
  });
  const price = aggregatePrice(tx, config, collector);
  return tx.moveCall({ target: `${c.packageId}::current_market_vault::finish_deposit`, typeArguments: c.types,
    arguments: [receipt, price, tx.object(config.syStateObjectId), tx.object(c.global), tx.object(c.vault), tx.object(config.marketObjectId), tx.pure.u64(minSyOut), tx.object("0x6")],
  });
}

export function addCurrentRedeem(tx: Transaction, config: JitterMarketConfig, burnRequest: TransactionObjectArgument): TransactionObjectArgument {
  const c = context(config);
  const decimals = required(config.currentDecimalsRegistryObjectId, "currentDecimalsRegistryObjectId");
  const oracle = required(config.currentXOracleObjectId, "currentXOracleObjectId");
  return tx.moveCall({ target: `${c.packageId}::current_market_vault::redeem`, typeArguments: c.types,
    arguments: [burnRequest, tx.object(config.syStateObjectId), tx.object(c.global), tx.object(c.vault), tx.object(config.marketObjectId), tx.object(c.app), tx.object(c.market), tx.object(decimals), tx.object(oracle), tx.object("0x6")],
  });
}

export const currentAdapterManifest: JitterAdapterManifest = {
  kind: "current", canDepositUnderlying: true, canRedeemUnderlying: true,
  depositInputType: config => config.underlyingTypeTag,
  redeemOutputType: config => config.underlyingTypeTag,
  requiredObjectIds(config) {
    const c = context(config);
    return { currentMarketVaultObjectId: c.vault, currentProtocolAppObjectId: c.app, currentMarketObjectId: c.market,
      currentDecimalsRegistryObjectId: required(config.currentDecimalsRegistryObjectId, "currentDecimalsRegistryObjectId"),
      currentXOracleObjectId: required(config.currentXOracleObjectId, "currentXOracleObjectId") };
  },
  addPriceInfo: ({ tx, config }) => addCurrentPriceInfo(tx, config),
  addMintFromUnderlying: ({ tx, config, inputCoin, minSyOut }) => addCurrentDepositToSy(tx, config, inputCoin, minSyOut),
  addDepositToSy() { throw new Error("Current requires the deposit-first receipt flow; use addCurrentDepositToSy."); },
  addRedeemFromSy: ({ tx, config, burnRequest }) => ({ outputCoin: addCurrentRedeem(tx, config, burnRequest) }),
};
