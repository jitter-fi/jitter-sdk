import { bcs } from "@mysten/sui/bcs";
import { Transaction, type TransactionObjectArgument } from "@mysten/sui/transactions";
import { normalizeStructTag } from "@mysten/sui/utils";
import { getSuiGrpcClient, type GrpcNetworkKind } from "../rpc.js";
import type { JitterMarketConfig } from "../types.js";
import type { JitterAdapterManifest } from "./types.js";
import { addDepositDustToTreasury } from "./deposit-dust.js";
import { _new as collectorNew } from "../generated/jitter_oracle/collector.js";
import { aggregate } from "../generated/jitter_oracle/aggregator.js";
import { quote as haedalPriceTicketQuote } from "../generated/haedal_adapter/haedal_price_ticket.js";

export const HAEDAL_RECEIPT_TYPE = "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI";
const U64_MAX = (1n << 64n) - 1n;
function required(value: string | undefined, key: string): string {
  if (!value) throw new Error(`Missing Jitter market config field: ${key}.`);
  return value;
}
function context(config: JitterMarketConfig) {
  return {
    adapter: required(config.haedalAdapterPackageId, "haedalAdapterPackageId"),
    vault: required(config.haedalMarketVaultObjectId, "haedalMarketVaultObjectId"),
    staking: required(config.haedalStakingObjectId, "haedalStakingObjectId"),
    global: required(config.globalConfigObjectId, "globalConfigObjectId"),
    types: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
  };
}

/** Official published rate, observed in this PTB. TTL does not imply new reward publication. */
export function addHaedalPriceInfo(tx: Transaction, config: JitterMarketConfig): TransactionObjectArgument {
  const c = context(config);
  const collector = collectorNew({package: config.oraclePackageId,
    arguments: [config.marketObjectId], typeArguments: [config.syTypeTag]})(tx);
  haedalPriceTicketQuote({package: c.adapter,
    arguments: [c.global, collector, c.vault, c.staking],
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag]})(tx);
  return aggregate({package: config.oraclePackageId,
    arguments: [c.global, config.priceAggregatorObjectId, collector],
    typeArguments: [config.syTypeTag]})(tx);
}

/** Consumes SUI and returns the actual official stake result; does not unstake. */
export function addHaedalStake(tx: Transaction, config: JitterMarketConfig, suiCoin: TransactionObjectArgument): TransactionObjectArgument {
  const call = required(config.haedalProtocolPackageId, "haedalProtocolPackageId");
  const staking = required(config.haedalStakingObjectId, "haedalStakingObjectId");
  if (normalizeStructTag(config.underlyingTypeTag) !== normalizeStructTag("0x2::sui::SUI"))
    throw new Error("Haedal native stake requires SUI underlying.");
  return tx.moveCall({ target: `${call}::staking::request_stake_coin`,
    arguments: [tx.object("0x5"), tx.object(staking), suiCoin, tx.pure.address("0x0")] });
}

/** Mint from the runtime receipt balance. Floor twice can leave one share; return that change explicitly. */
export function addHaedalMintReceiptToSy(tx: Transaction, config: JitterMarketConfig, receiptCoin: TransactionObjectArgument,
  minSyOut: bigint): { syCoin: TransactionObjectArgument; receiptChange: TransactionObjectArgument } {
  const c = context(config);
  const math = required(config.jitterMathPackageId, "jitterMathPackageId");
  if (typeof minSyOut !== "bigint" || minSyOut < 0n || minSyOut > U64_MAX) throw new Error("minSyOut must fit u64.");
  const shares = tx.moveCall({ target: "0x2::coin::value", arguments: [receiptCoin], typeArguments: [HAEDAL_RECEIPT_TYPE] });
  const rate = tx.moveCall({ target: `${c.adapter}::haedal_market_vault::exchange_rate`, arguments: [tx.object(c.staking)] });
  const index = tx.moveCall({ target: `${c.adapter}::haedal_price_ticket::sy_index_from_exchange_rate`, arguments: [rate] });
  const fixedShares = tx.moveCall({ target: `${math}::fixed_point64::from_uint64`, arguments: [shares] });
  const fixedIndex = tx.moveCall({ target: `${math}::fixed_point64::create_from_raw_value`, arguments: [index] });
  const value = tx.moveCall({ target: `${math}::fixed_point64::multiply`, arguments: [fixedShares, fixedIndex] });
  const exactIn = tx.moveCall({ target: `${math}::fixed_point64::truncate`, arguments: [value] });
  const price = addHaedalPriceInfo(tx, config);
  const minted = tx.moveCall({ target: `${config.jitterPackageId}::sy::mint_sy_exact_in_market_state`, typeArguments: c.types,
    arguments: [tx.object(config.marketObjectId), tx.object(c.global), price, exactIn, tx.object.clock()] });
  const receiptChange = tx.moveCall({ target: `${c.adapter}::haedal_market_vault::deposit`, typeArguments: c.types,
    arguments: [minted[1], receiptCoin, tx.object(config.syStateObjectId), tx.object(c.global), tx.object(c.vault),
      tx.object(config.marketObjectId), tx.object(c.staking), tx.object.clock()] });
  tx.moveCall({ target: `${config.jitterPackageId}::router::assert_coin_min_value`, typeArguments: [config.syTypeTag],
    arguments: [tx.object(c.global), minted[0], tx.pure.u64(minSyOut)] });
  return { syCoin: minted[0], receiptChange };
}

/** Getter simulation uses upstream full precision, not division by the rounded exchange rate. */
export async function getHaedalStakeQuote(network: GrpcNetworkKind, config: JitterMarketConfig, suiIn: bigint): Promise<{ receiptOut: bigint; syIndex: bigint }> {
  if (typeof suiIn !== "bigint" || suiIn < 0n || suiIn > U64_MAX) throw new Error("suiIn must fit u64.");
  const call = required(config.haedalProtocolPackageId, "haedalProtocolPackageId");
  const staking = required(config.haedalStakingObjectId, "haedalStakingObjectId");
  const tx = new Transaction();
  tx.moveCall({ target: `${call}::staking::get_stsui_by_sui`, arguments: [tx.object(staking), tx.pure.u64(suiIn)] });
  tx.moveCall({ target: `${call}::staking::get_exchange_rate`, arguments: [tx.object(staking)] });
  const result = await getSuiGrpcClient(network).simulateTransaction({ transaction: tx, checksEnabled: false, include: { commandResults: true } });
  if (result.$kind === "FailedTransaction" || result.Transaction?.status.success === false)
    throw new Error("Haedal stake quote simulation failed.");
  const decode = (i: number) => {
    const raw = result.commandResults?.[i]?.returnValues?.[0]?.bcs;
    if (!raw) throw new Error("Missing Haedal getter result.");
    return BigInt(bcs.u64().parse(raw));
  };
  const receiptOut = decode(0), rate = decode(1);
  if (rate <= 0n) throw new Error("Invalid Haedal exchange rate.");
  return { receiptOut, syIndex: rate * (1n << 64n) / 1_000_000n };
}

export const haedalAdapterManifest: JitterAdapterManifest = {
  kind: "haedal", canDepositUnderlying: true, canRedeemUnderlying: false,
  depositInputType: config => config.underlyingTypeTag,
  redeemOutputType: () => HAEDAL_RECEIPT_TYPE,
  requiredObjectIds(config) { const c = context(config); return { haedalMarketVaultObjectId: c.vault, haedalStakingObjectId: c.staking,
    haedalProtocolPackageId: required(config.haedalProtocolPackageId, "haedalProtocolPackageId"),
    jitterMathPackageId: required(config.jitterMathPackageId, "jitterMathPackageId") }; },
  addPriceInfo: ({ tx, config }) => addHaedalPriceInfo(tx, config),
  addMintFromUnderlying({ tx, config, inputCoin, minSyOut, sweepDepositDust }) {
    const owner = required(tx.getData().sender ?? undefined, "sender");
    const { syCoin, receiptChange } = addHaedalMintReceiptToSy(tx, config, addHaedalStake(tx, config, inputCoin), minSyOut);
    if (sweepDepositDust) addDepositDustToTreasury(tx, config, receiptChange, HAEDAL_RECEIPT_TYPE);
    else tx.transferObjects([receiptChange], tx.pure.address(owner));
    return syCoin;
  },
  addDepositToSy() { throw new Error("Haedal requires deposit from the actual receipt balance."); },
  addRedeemFromSy() { throw new Error("Haedal returns haSUI; use receipt redemption, not underlying redemption."); },
};
