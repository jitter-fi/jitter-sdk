import { FP64_ONE } from "../constants.js";

export type MarketValuationInput = {
  poolSyRaw: string;
  poolPtRaw: string;
  pySyRaw: string;
  reserveFeeSyRaw: string;
  /** Complete adapter receipt reserve in SY accounting units; includes queued withdrawals. */
  backingSyRaw?: string;
  volume24hSyRaw: string;
  volume7dSyRaw: string;
  totalFeesSyRaw: string;
  marketDecimals: number;
  underlyingDecimals: number;
  syIndexRaw: bigint;
  underlyingPriceUsd: number;
  ptPriceUsd: number;
};

/** USD display estimates. PT is an AMM asset, not extra protocol backing. */
export function valueMarketBalances(input: MarketValuationInput) {
  for (const decimals of [input.marketDecimals, input.underlyingDecimals])
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18)
      throw Error("Invalid valuation decimals.");
  if (
    input.syIndexRaw <= 0n ||
    !Number.isFinite(input.underlyingPriceUsd) ||
    input.underlyingPriceUsd <= 0 ||
    !Number.isFinite(input.ptPriceUsd) ||
    input.ptPriceUsd < 0
  )
    throw Error("Market valuation price unavailable.");
  const raw = (value: string) => {
    if (!/^\d+$/.test(value) || value.length > 39)
      throw Error("Invalid market reserve.");
    return BigInt(value);
  };
  const unit = 10 ** input.marketDecimals;
  const syValue = (amount: bigint) =>
    (Number((amount * input.syIndexRaw) / FP64_ONE) /
      10 ** input.underlyingDecimals) *
    input.underlyingPriceUsd;
  const sy = raw(input.poolSyRaw),
    pt = raw(input.poolPtRaw),
    py = raw(input.pySyRaw),
    fees = raw(input.reserveFeeSyRaw);
  const syUsd = syValue(sy),
    ptUsd = (Number(pt) / unit) * input.ptPriceUsd;
  const liquidity = syUsd + ptUsd;
  const result = {
    liquidity,
    tvl: syValue(input.backingSyRaw === undefined ? sy + py + fees : raw(input.backingSyRaw)),
    syPrice:
      (Number(input.syIndexRaw) / Number(FP64_ONE)) *
      10 ** (input.marketDecimals - input.underlyingDecimals) *
      input.underlyingPriceUsd,
    syWeight: liquidity > 0 ? syUsd / liquidity : 0,
    ptWeight: liquidity > 0 ? ptUsd / liquidity : 0,
    volume24h: syValue(raw(input.volume24hSyRaw)),
    volume7d: syValue(raw(input.volume7dSyRaw)),
    totalFees: syValue(raw(input.totalFeesSyRaw)),
  };
  if (
    Object.values(result).some((value) => !Number.isFinite(value) || value < 0)
  )
    throw Error("Invalid market valuation.");
  return result;
}
