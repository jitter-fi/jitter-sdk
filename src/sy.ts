/**
 * @jitter/sdk — sy.ts
 */

import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";

import type { JitterMarketConfig } from "./types.js";

function requireConfigValue(value: string | undefined, field: string): string {
  if (!value) {
    throw new Error(`Missing Jitter market config field: ${field}.`);
  }
  return value;
}

function requireGlobalConfig(config: JitterMarketConfig): string {
  return requireConfigValue(config.globalConfigObjectId, "globalConfigObjectId");
}

function addCoinIntoBalance(
  tx: Transaction,
  coin: TransactionObjectArgument,
  typeTag: string,
): TransactionObjectArgument {
  return tx.moveCall({
    target: "0x2::coin::into_balance",
    arguments: [coin],
    typeArguments: [typeTag],
  }) as TransactionObjectArgument;
}

// ---------------------------------------------------------------------------
// SY minting
// ---------------------------------------------------------------------------

/**
 * Mint SY from underlying (exact underlying amount in).
 * Returns [Coin<SY>, MintSyRequest<SY>].  Consume MintSyRequest with addDemoDeposit.
 */
export function addMintSyExactIn(
  tx: Transaction,
  config: JitterMarketConfig,
  priceInfo: TransactionObjectArgument,
  exactIn: bigint,
): [TransactionObjectArgument, TransactionObjectArgument] {
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::sy::mint_sy_exact_in_market_state`,
    arguments: [
      tx.object(config.marketObjectId),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      tx.pure.u64(exactIn),
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  });
  return [result[0] as TransactionObjectArgument, result[1] as TransactionObjectArgument];
}

/**
 * Satisfy a MintSyRequest by depositing underlying into the demo vault.
 */
export function addDemoDeposit(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  underlyingCoin: TransactionObjectArgument,
): void {
  tx.moveCall({
    target: `${config.demoAdapterPackageId}::demo_market_vault::deposit`,
    arguments: [
      mintRequest,
      underlyingCoin,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(config.demoMarketVaultObjectId),
      tx.object(config.marketObjectId),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  });
}

/**
 * Mint Scallop MarketCoin<Underlying> from base Coin<Underlying>.
 */
export function addScallopMintMarketCoin(
  tx: Transaction,
  config: JitterMarketConfig,
  underlyingCoin: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.scallopProtocolPackageId, "scallopProtocolPackageId")}::mint::mint`,
    arguments: [
      tx.object(requireConfigValue(config.scallopVersionObjectId, "scallopVersionObjectId")),
      tx.object(requireConfigValue(config.scallopMarketObjectId, "scallopMarketObjectId")),
      underlyingCoin,
      tx.object.clock(),
    ],
    typeArguments: [config.underlyingTypeTag],
  }) as TransactionObjectArgument;
}

/**
 * Satisfy a MintSyRequest by escrowing Scallop MarketCoin<Underlying> in the
 * Scallop adapter vault.
 *
 * minMarketCoinOut should normally be the SY amount minted by mint_sy_exact_in_market_state.
 */
export function addScallopDeposit(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  underlyingCoin: TransactionObjectArgument,
  minMarketCoinOut: bigint | number = 1n,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.scallopAdapterPackageId, "scallopAdapterPackageId")}::scallop_market_vault::deposit`,
    arguments: [
      mintRequest,
      underlyingCoin,
      tx.pure.u64(minMarketCoinOut),
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.scallopMarketVaultObjectId, "scallopMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.scallopVersionObjectId, "scallopVersionObjectId")),
      tx.object(requireConfigValue(config.scallopMarketObjectId, "scallopMarketObjectId")),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * Satisfy a MintSyRequest from base underlying by first minting Scallop
 * MarketCoin<Underlying>, then escrowing the receipt coin in the Jitter adapter.
 */
export function addScallopDepositFromUnderlying(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  underlyingCoin: TransactionObjectArgument,
  minMarketCoinOut: bigint | number = 1n,
): TransactionObjectArgument {
  const marketCoin = addScallopMintMarketCoin(tx, config, underlyingCoin);
  return addScallopDeposit(tx, config, mintRequest, marketCoin, minMarketCoinOut);
}

/**
 * Satisfy a MintSyRequest by escrowing Ember receipt shares in the Ember
 * adapter vault.
 *
 * This is the `Ember receipt asset -> Jitter SY` path. Base asset ->
 * Ember receipt asset conversion is an external routing step and is not
 * performed by this adapter. Returns excess receipt coin, if any.
 */
export function addEmberDeposit(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  receiptCoin: TransactionObjectArgument,
  maxReceiptIn: bigint,
): TransactionObjectArgument {
  assertReceiptBudget(maxReceiptIn);
  const budget = splitReceiptBudget(tx, receiptCoin, requireConfigValue(config.emberReceiptTypeTag, "emberReceiptTypeTag"), maxReceiptIn);
  const change = tx.moveCall({
    target: `${requireConfigValue(config.emberAdapterPackageId, "emberAdapterPackageId")}::ember_market_vault::deposit`,
    arguments: [
      mintRequest,
      budget,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.emberMarketVaultObjectId, "emberMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.emberVaultObjectId, "emberVaultObjectId")),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      requireConfigValue(config.emberReceiptTypeTag, "emberReceiptTypeTag"),
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
  tx.mergeCoins(receiptCoin, [change]);
  return receiptCoin;
}

function assertReceiptBudget(maxReceiptIn: bigint): void {
  if (typeof maxReceiptIn !== "bigint" || maxReceiptIn <= 0n || maxReceiptIn > (1n << 64n) - 1n) {
    throw new Error("maxReceiptIn must be a positive raw u64 bigint.");
  }
}

// Coin type uses Haedal's original package, not its latest implementation or adapter ID.
const HAEDAL_RECEIPT_TYPE = "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI";

function splitReceiptBudget(tx: Transaction, coin: TransactionObjectArgument, type: string, maximum: bigint): TransactionObjectArgument {
  const balance = tx.moveCall({ target: "0x2::coin::value", arguments: [coin], typeArguments: [type] });
  const capped = tx.moveCall({ target: "0x1::u64::min", arguments: [balance, tx.pure.u64(maximum)] });
  return tx.splitCoins(coin, [capped])[0];
}

export type HaedalDepositConfig = JitterMarketConfig & {
  haedalAdapterPackageId: string; haedalMarketVaultObjectId: string; haedalStakingObjectId: string;
};

/** Escrow at most maxReceiptIn haSUI shares; return the entire unspent input Coin. */
export function addHaedalDeposit(tx: Transaction, config: HaedalDepositConfig,
  mintRequest: TransactionObjectArgument, receiptCoin: TransactionObjectArgument, maxReceiptIn: bigint): TransactionObjectArgument {
  assertReceiptBudget(maxReceiptIn);
  const budget = splitReceiptBudget(tx, receiptCoin, HAEDAL_RECEIPT_TYPE, maxReceiptIn);
  const change = tx.moveCall({
    target: `${requireConfigValue(config.haedalAdapterPackageId, "haedalAdapterPackageId")}::haedal_market_vault::deposit`,
    arguments: [mintRequest, budget, tx.object(config.syStateObjectId), tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.haedalMarketVaultObjectId, "haedalMarketVaultObjectId")), tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.haedalStakingObjectId, "haedalStakingObjectId")), tx.object.clock()],
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  });
  tx.mergeCoins(receiptCoin, [change]);
  return receiptCoin;
}

/**
 * Deposit base underlying into Ember and receive Ember receipt shares.
 *
 * This is the optional upstream leg for an Ember-backed market:
 * Coin<Underlying> -> Ember Coin<Receipt>. The returned receipt coin can be
 * consumed by addEmberDeposit to settle Jitter's MintSyRequest.
 */
export function addEmberMintReceiptFromUnderlying(
  tx: Transaction,
  config: JitterMarketConfig,
  underlyingCoin: TransactionObjectArgument,
  minReceiptShares: bigint | number = 1n,
): TransactionObjectArgument {
  const underlyingBalance = addCoinIntoBalance(tx, underlyingCoin, config.underlyingTypeTag);
  return tx.moveCall({
    target: `${requireConfigValue(config.emberVaultsPackageId, "emberVaultsPackageId")}::vault::deposit_asset_v2`,
    arguments: [
      tx.object(requireConfigValue(config.emberVaultObjectId, "emberVaultObjectId")),
      tx.object(requireConfigValue(config.emberProtocolConfigObjectId, "emberProtocolConfigObjectId")),
      underlyingBalance,
      tx.pure.u64(minReceiptShares),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      requireConfigValue(config.emberReceiptTypeTag, "emberReceiptTypeTag"),
    ],
  }) as TransactionObjectArgument;
}

/**
 * Satisfy a MintSyRequest from base underlying by first depositing into Ember,
 * then escrowing the receipt shares in the Jitter Ember adapter.
 */
export function addEmberDepositFromUnderlying(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  underlyingCoin: TransactionObjectArgument,
  budgets: { maxUnderlyingIn: bigint; maxReceiptIn: bigint; minReceiptShares: bigint },
): { receiptChange: TransactionObjectArgument; underlyingChange: TransactionObjectArgument } {
  if (!budgets || typeof budgets !== "object") throw new Error("Explicit underlying and receipt deposit budgets are required.");
  assertReceiptBudget(budgets.maxReceiptIn);
  if (typeof budgets.maxUnderlyingIn !== "bigint" || budgets.maxUnderlyingIn <= 0n || budgets.maxUnderlyingIn > (1n << 64n) - 1n) {
    throw new Error("maxUnderlyingIn must be a positive raw u64 bigint.");
  }
  if (typeof budgets.minReceiptShares !== "bigint" || budgets.minReceiptShares < 0n || budgets.minReceiptShares > (1n << 64n) - 1n) {
    throw new Error("minReceiptShares must be an explicit raw u64 bigint.");
  }
  const boundedUnderlying = splitReceiptBudget(tx, underlyingCoin, config.underlyingTypeTag, budgets.maxUnderlyingIn);
  const receiptCoin = addEmberMintReceiptFromUnderlying(
    tx,
    config,
    boundedUnderlying,
    budgets.minReceiptShares,
  );
  return { receiptChange: addEmberDeposit(tx, config, mintRequest, receiptCoin, budgets.maxReceiptIn), underlyingChange: underlyingCoin };
}

/**
 * Satisfy a MintSyRequest by escrowing Suilend CToken<P, Underlying>.
 *
 * Supplying underlying into Suilend and receiving the cToken is an external
 * route step. This call wraps the cToken receipt into Jitter SY and returns
 * any excess cToken.
 */
export function addSuilendDeposit(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  ctokenCoin: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.suilendAdapterPackageId, "suilendAdapterPackageId")}::suilend_market_vault::deposit`,
    arguments: [
      mintRequest,
      ctokenCoin,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.suilendMarketVaultObjectId, "suilendMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.suilendLendingMarketObjectId, "suilendLendingMarketObjectId")),
      tx.object.clock(),
    ],
    typeArguments: [
      requireConfigValue(config.suilendProtocolTypeTag, "suilendProtocolTypeTag"),
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * Satisfy a MintSyRequest by depositing underlying into NAVI through the
 * adapter-owned NAVI AccountCap.
 */
export function addNaviDeposit(
  tx: Transaction,
  config: JitterMarketConfig,
  mintRequest: TransactionObjectArgument,
  underlyingCoin: TransactionObjectArgument,
): void {
  tx.moveCall({
    target: `${requireConfigValue(config.naviAdapterPackageId, "naviAdapterPackageId")}::navi_market_vault::deposit`,
    arguments: [
      mintRequest,
      underlyingCoin,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.naviMarketVaultObjectId, "naviMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.naviStorageObjectId, "naviStorageObjectId")),
      tx.object(requireConfigValue(config.naviPoolObjectId, "naviPoolObjectId")),
      tx.object(requireConfigValue(config.naviIncentiveV2ObjectId, "naviIncentiveV2ObjectId")),
      tx.object(requireConfigValue(config.naviIncentiveV3ObjectId, "naviIncentiveV3ObjectId")),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  });
}

// ---------------------------------------------------------------------------
// SY burning
// ---------------------------------------------------------------------------

/**
 * Burn SY (exact SY in).  Returns BurnSyRequest<SY> hot-potato.
 * Consume with addDemoRedeem.
 */
export function addBurnSyExactIn(
  tx: Transaction,
  config: JitterMarketConfig,
  priceInfo: TransactionObjectArgument,
  syInCoin: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${config.jitterPackageId}::sy::burn_sy_exact_in_market_state`,
    arguments: [
      tx.object(config.marketObjectId),
      tx.object(requireGlobalConfig(config)),
      priceInfo,
      syInCoin,
      tx.object.clock(),
    ],
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  }) as TransactionObjectArgument;
}

/**
 * Satisfy a BurnSyRequest by withdrawing underlying from the demo vault.
 * Returns Coin<Underlying>.
 */
export function addDemoRedeem(
  tx: Transaction,
  config: JitterMarketConfig,
  burnRequest: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${config.demoAdapterPackageId}::demo_market_vault::redeem`,
    arguments: [
      burnRequest,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(config.demoMarketVaultObjectId),
      tx.object(config.marketObjectId),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * Burn SY and release exact Scallop receipt shares, without querying upstream.
 */
export function addScallopRedeem(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  minMarketCoinOut: bigint | number,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.scallopAdapterPackageId, "scallopAdapterPackageId")}::scallop_market_vault::redeem`,
    arguments: [
      syCoin,
      tx.pure.u64(minMarketCoinOut),
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.scallopMarketVaultObjectId, "scallopMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * Redeem Scallop MarketCoin<Underlying> back to base Coin<Underlying>.
 */
export function addScallopRedeemMarketCoinToUnderlying(
  tx: Transaction,
  config: JitterMarketConfig,
  marketCoin: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.scallopProtocolPackageId, "scallopProtocolPackageId")}::redeem::redeem`,
    arguments: [
      tx.object(requireConfigValue(config.scallopVersionObjectId, "scallopVersionObjectId")),
      tx.object(requireConfigValue(config.scallopMarketObjectId, "scallopMarketObjectId")),
      marketCoin,
      tx.object.clock(),
    ],
    typeArguments: [config.underlyingTypeTag],
  }) as TransactionObjectArgument;
}

/**
 * Burn SY and redeem its receipt shares to underlying. Unlike the receipt-only
 * leg, this downstream conversion still depends on Scallop availability.
 */
export function addScallopRedeemToUnderlying(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  minMarketCoinOut: bigint | number,
): TransactionObjectArgument {
  const marketCoin = addScallopRedeem(tx, config, syCoin, minMarketCoinOut);
  return addScallopRedeemMarketCoinToUnderlying(tx, config, marketCoin);
}

/**
 * Satisfy a BurnSyRequest by returning Ember receipt shares from the adapter
 * vault.
 *
 * This is the reverse `Jitter SY -> Ember receipt asset` exit path. It does
 * not create an Ember withdrawal request; base-asset withdrawal from Ember is
 * an external routing step.
 */
/** Receipt-only exit: no PriceInfo, upstream refresh, or BurnSyRequest. */
export function addReceiptRedeem(
  tx: Transaction,
  config: JitterMarketConfig,
  syCoin: TransactionObjectArgument,
  adapter: {
    kind: "ember" | "suilend" | "spring" | "haedal";
    packageId: string;
    vaultObjectId: string;
    typeArguments: string[];
  },
): TransactionObjectArgument {
  const typeCount = { ember: 5, suilend: 5, spring: 4, haedal: 3 }[adapter.kind];
  if (adapter.typeArguments.length !== typeCount) {
    throw new Error(`Receipt exit for ${adapter.kind} requires ${typeCount} type arguments.`);
  }
  return tx.moveCall({
    target: `${adapter.packageId}::${adapter.kind}_market_vault::redeem_receipt`,
    typeArguments: adapter.typeArguments,
    arguments: [
      syCoin,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(adapter.vaultObjectId),
      tx.object(config.marketObjectId),
      tx.object.clock(),
    ],
  });
}

export function addEmberRedeem(
  tx: Transaction,
  config: JitterMarketConfig,
  burnRequest: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.emberAdapterPackageId, "emberAdapterPackageId")}::ember_market_vault::redeem`,
    arguments: [
      burnRequest,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.emberMarketVaultObjectId, "emberMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.emberVaultObjectId, "emberVaultObjectId")),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      requireConfigValue(config.emberReceiptTypeTag, "emberReceiptTypeTag"),
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * Submit Ember receipt shares to Ember's withdrawal queue.
 *
 * This is the optional downstream leg for an Ember-backed market:
 * Ember Coin<Receipt> -> Ember WithdrawalRequest. Ember operators process the
 * queue later and pay the receiver according to Ember's own vault rules.
 */
export function addEmberRedeemReceiptToWithdrawalRequest(
  tx: Transaction,
  config: JitterMarketConfig,
  receiptCoin: TransactionObjectArgument,
  receiver: string,
): TransactionObjectArgument {
  const receiptBalance = addCoinIntoBalance(
    tx,
    receiptCoin,
    requireConfigValue(config.emberReceiptTypeTag, "emberReceiptTypeTag"),
  );
  return tx.moveCall({
    target: `${requireConfigValue(config.emberVaultsPackageId, "emberVaultsPackageId")}::vault::redeem_shares`,
    arguments: [
      tx.object(requireConfigValue(config.emberVaultObjectId, "emberVaultObjectId")),
      tx.object(requireConfigValue(config.emberProtocolConfigObjectId, "emberProtocolConfigObjectId")),
      receiptBalance,
      tx.pure.address(receiver),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      requireConfigValue(config.emberReceiptTypeTag, "emberReceiptTypeTag"),
    ],
  }) as TransactionObjectArgument;
}

/**
 * Burn Jitter SY, receive Ember receipt shares, then submit those shares to
 * Ember's async withdrawal queue.
 */
export function addEmberRedeemToWithdrawalRequest(
  tx: Transaction,
  config: JitterMarketConfig,
  burnRequest: TransactionObjectArgument,
  receiver: string,
): TransactionObjectArgument {
  const receiptCoin = addEmberRedeem(tx, config, burnRequest);
  return addEmberRedeemReceiptToWithdrawalRequest(tx, config, receiptCoin, receiver);
}

/**
 * Satisfy a BurnSyRequest by returning Suilend CToken<P, Underlying>.
 *
 * Redeeming cToken back to underlying is an external route step.
 */
export function addSuilendRedeem(
  tx: Transaction,
  config: JitterMarketConfig,
  burnRequest: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.suilendAdapterPackageId, "suilendAdapterPackageId")}::suilend_market_vault::redeem`,
    arguments: [
      burnRequest,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.suilendMarketVaultObjectId, "suilendMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.suilendLendingMarketObjectId, "suilendLendingMarketObjectId")),
      tx.object.clock(),
    ],
    typeArguments: [
      requireConfigValue(config.suilendProtocolTypeTag, "suilendProtocolTypeTag"),
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * Satisfy a BurnSyRequest by withdrawing underlying from NAVI through the
 * adapter-owned NAVI AccountCap. Supports both SUI and non-SUI markets.
 * Append addNaviOracleRefresh first; update the authenticated Pyth feed before
 * that when stale. This low-level builder does not fetch off-chain price data.
 */
export function addNaviRedeem(
  tx: Transaction,
  config: JitterMarketConfig,
  burnRequest: TransactionObjectArgument,
): TransactionObjectArgument {
  return tx.moveCall({
    target: `${requireConfigValue(config.naviAdapterPackageId, "naviAdapterPackageId")}::navi_market_vault::redeem`,
    arguments: [
      burnRequest,
      tx.object(config.syStateObjectId),
      tx.object(requireGlobalConfig(config)),
      tx.object(requireConfigValue(config.naviMarketVaultObjectId, "naviMarketVaultObjectId")),
      tx.object(config.marketObjectId),
      tx.object(requireConfigValue(config.naviStorageObjectId, "naviStorageObjectId")),
      tx.object(requireConfigValue(config.naviPoolObjectId, "naviPoolObjectId")),
      tx.object(requireConfigValue(config.naviOracleObjectId, "naviOracleObjectId")),
      tx.object(requireConfigValue(config.naviIncentiveV2ObjectId, "naviIncentiveV2ObjectId")),
      tx.object(requireConfigValue(config.naviIncentiveV3ObjectId, "naviIncentiveV3ObjectId")),
      tx.object(config.naviSuiSystemStateObjectId ?? "0x5"),
      tx.object.clock(),
    ],
    typeArguments: [
      config.underlyingTypeTag,
      config.syTypeTag,
      config.ptTypeTag,
      config.ytTypeTag,
    ],
  }) as TransactionObjectArgument;
}

/**
 * @deprecated Use addNaviRedeem; both now use the SuiSystem-aware route.
 */
export function addNaviRedeemV2(
  tx: Transaction,
  config: JitterMarketConfig,
  burnRequest: TransactionObjectArgument,
): TransactionObjectArgument {
  return addNaviRedeem(tx, config, burnRequest);
}
