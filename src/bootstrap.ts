/**
 * Atomic "create a whole demo market" PTB.
 *
 * This builder creates the new unified MarketState object graph:
 *
 * 1. `jitter::market_state::create_by_admin_cap`
 * 2. `jitter_oracle::aggregator::create_aggregator_by_admin_cap`
 * 3. Approve the demo source and bind the canonical aggregator.
 * 4. `demo_adapter::demo_market_vault::create_market_vault_by_admin`
 * 5. Share the returned MarketState and PriceAggregator objects.
 *
 * It intentionally does not create the legacy split Market + PyState + Pool
 * object set. New SDK/admin flows should use MarketState records.
 */

import {
  Transaction,
  type TransactionArgument,
  type TransactionObjectArgument,
} from "@mysten/sui/transactions";

export type BootstrapMarketParams = {
  senderAddress: string;

  jitterPackageId: string;
  jitterOraclePackageId: string;
  jitterMathPackageId: string;
  demoAdapterPackageId: string;

  adminCapObjectId: string;
  globalConfigObjectId: string;
  syStateObjectId: string;
  aclObjectId?: string;

  syTypeTag: string;
  ptTypeTag: string;
  ytTypeTag: string;
  underlyingTypeTag: string;

  syTreasuryCapId: string;
  ptTreasuryCapId: string;
  ytTreasuryCapId: string;

  expiryMs: bigint;

  maxStalenessMs: bigint;
  minTotalWeightBps: bigint;
  minSourceCount?: bigint;
  outlierToleranceBps: bigint;

  initialSyIndexRaw: bigint;

  yieldInterestFeeRaw?: bigint;
  yieldExpiryDivisorMs?: bigint;
  ammScalarRootRaw?: bigint;
  ammScalarRootPositive?: boolean;
  ammInitialAnchorRaw?: bigint;
  ammInitialAnchorPositive?: boolean;
  ammLnFeeRateRootRaw?: bigint;
  ammProtocolFeeRateRaw?: bigint;
  rawSyMarketCap?: bigint;
  assetMarketCap?: bigint;
  treasuryAddress?: string;

  gasBudget?: bigint;
};

const DEFAULT_GAS = BigInt(900_000_000);
const FP64_ONE = BigInt("18446744073709551616");
const DEFAULT_EXPIRY_DIVISOR_MS = BigInt(86_400_000);
const DEFAULT_AMM_SCALAR_ROOT_RAW = FP64_ONE * BigInt(10);
const DEFAULT_AMM_INITIAL_ANCHOR_RAW = FP64_ONE;
const DEFAULT_AMM_LN_FEE_RATE_ROOT_RAW = BigInt("18446744073709551");
const DEFAULT_AMM_PROTOCOL_FEE_RATE_RAW = BigInt("1844674407370955161");
const SUI_CLOCK_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000006";

function fixedPoint64(
  tx: Transaction,
  mathPackageId: string,
  value: bigint,
): TransactionArgument {
  return tx.moveCall({
    target: `${mathPackageId}::fixed_point64::create_from_raw_value`,
    arguments: [tx.pure.u128(value)],
  }) as TransactionArgument;
}

function fixedPoint64WithSign(
  tx: Transaction,
  mathPackageId: string,
  value: bigint,
  positive = true,
): TransactionArgument {
  return tx.moveCall({
    target: `${mathPackageId}::fixed_point64_with_sign::create_from_raw_value`,
    arguments: [tx.pure.u128(value), tx.pure.bool(positive)],
  }) as TransactionArgument;
}

export function buildBootstrapMarketTx(p: BootstrapMarketParams): Transaction {
  const tx = new Transaction();
  tx.setSender(p.senderAddress);
  tx.setGasBudget(p.gasBudget ?? DEFAULT_GAS);

  const sy = p.syTypeTag;
  const pt = p.ptTypeTag;
  const yt = p.ytTypeTag;
  const underlying = p.underlyingTypeTag;
  const treasury = p.treasuryAddress ?? p.senderAddress;

  const marketStateObj = tx.moveCall({
    target: `${p.jitterPackageId}::market_state::create_by_admin_cap`,
    typeArguments: [sy, pt, yt],
    arguments: [
      tx.object(p.adminCapObjectId),
      tx.object(p.globalConfigObjectId),
      tx.pure.u64(p.expiryMs),
      tx.pure.u128(p.yieldInterestFeeRaw ?? BigInt(0)),
      tx.pure.u64(p.yieldExpiryDivisorMs ?? DEFAULT_EXPIRY_DIVISOR_MS),
      tx.pure.address(treasury),
      fixedPoint64WithSign(
        tx,
        p.jitterMathPackageId,
        p.ammScalarRootRaw ?? DEFAULT_AMM_SCALAR_ROOT_RAW,
        p.ammScalarRootPositive ?? true,
      ),
      fixedPoint64WithSign(
        tx,
        p.jitterMathPackageId,
        p.ammInitialAnchorRaw ?? DEFAULT_AMM_INITIAL_ANCHOR_RAW,
        p.ammInitialAnchorPositive ?? true,
      ),
      fixedPoint64(
        tx,
        p.jitterMathPackageId,
        p.ammLnFeeRateRootRaw ?? DEFAULT_AMM_LN_FEE_RATE_ROOT_RAW,
      ),
      fixedPoint64(
        tx,
        p.jitterMathPackageId,
        p.ammProtocolFeeRateRaw ?? DEFAULT_AMM_PROTOCOL_FEE_RATE_RAW,
      ),
      tx.pure.u64(p.rawSyMarketCap ?? BigInt(0)),
      tx.pure.u64(p.assetMarketCap ?? BigInt(0)),
      tx.object(p.syTreasuryCapId),
      tx.object(p.ptTreasuryCapId),
      tx.object(p.ytTreasuryCapId),
      tx.object(SUI_CLOCK_ID),
    ],
  }) as TransactionObjectArgument;

  const marketStateId = tx.moveCall({
    target: `${p.jitterPackageId}::market_state::id`,
    typeArguments: [sy, pt, yt],
    arguments: [marketStateObj],
  });

  const aggregatorObj = tx.moveCall({
    target: `${p.jitterOraclePackageId}::aggregator::create_aggregator_by_admin_cap`,
    typeArguments: [sy],
    arguments: [
      tx.object(p.adminCapObjectId),
      marketStateId,
      tx.pure.u64(p.maxStalenessMs),
      tx.pure.u64(p.minTotalWeightBps),
      tx.pure.u64(p.minSourceCount ?? BigInt(1)),
      tx.pure.u64(p.outlierToleranceBps),
    ],
  }) as TransactionObjectArgument;

  tx.moveCall({
    target: `${p.jitterOraclePackageId}::aggregator::add_source_rule_by_admin_cap`,
    typeArguments: [
      sy,
      `${p.demoAdapterPackageId}::sign::DEMO`,
    ],
    arguments: [
      tx.object(p.adminCapObjectId),
      aggregatorObj,
      tx.pure.u16(10_000),
      tx.pure.bool(true),
      tx.pure.bool(true),
    ],
  });

  tx.moveCall({
    target: `${p.jitterPackageId}::market_state::bind_price_aggregator_by_admin`,
    typeArguments: [sy, pt, yt],
    arguments: [
      marketStateObj,
      tx.object(p.globalConfigObjectId),
      tx.object(p.adminCapObjectId),
      aggregatorObj,
    ],
  });

  tx.moveCall({
    target: `${p.demoAdapterPackageId}::demo_market_vault::create_market_vault_by_admin`,
    typeArguments: [underlying, sy, pt, yt],
    arguments: [
      tx.object(p.adminCapObjectId),
      tx.object(p.syStateObjectId),
      tx.object(p.globalConfigObjectId),
      marketStateObj,
      tx.pure.u128(p.initialSyIndexRaw),
      tx.object(SUI_CLOCK_ID),
    ],
  });

  tx.moveCall({
    target: "0x2::transfer::public_share_object",
    typeArguments: [
      `${p.jitterPackageId}::market_state::MarketState<${sy},${pt},${yt}>`,
    ],
    arguments: [marketStateObj],
  });

  tx.moveCall({
    target: "0x2::transfer::public_share_object",
    typeArguments: [
      `${p.jitterOraclePackageId}::aggregator::PriceAggregator<${sy}>`,
    ],
    arguments: [aggregatorObj],
  });

  return tx;
}
