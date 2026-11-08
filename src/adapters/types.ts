import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";

import type { JitterMarketConfig } from "../types.js";

export type JitterAdapterKind =
  | "demo"
  | "current"
  | "scallop"
  | "ember"
  | "haedal"
  | "suilend"
  | "navi";

export type AdapterPriceInfoArgs = {
  tx: Transaction;
  config: JitterMarketConfig;
  /** Required by demo-style fixed index quotes. Protocol adapters may ignore it. */
  syIndex?: bigint;
};

export type AdapterDepositArgs = {
  sweepDepositDust?: boolean;
  tx: Transaction;
  config: JitterMarketConfig;
  mintRequest: TransactionObjectArgument;
  inputCoin: TransactionObjectArgument;
  /** SY amount minted by jitter::sy::mint_sy_exact_in_market_state; useful as adapter min-out. */
  syAmount: bigint;
};

export type AdapterRedeemArgs = {
  tx: Transaction;
  config: JitterMarketConfig;
  /** Scallop consumes Coin<SY>; request-based adapters consume BurnSyRequest<SY>. */
  input: TransactionObjectArgument;
  /** Minimum receipt shares for Scallop; SY amount for request-based adapters. */
  syAmount: bigint;
};

export type AdapterDepositResult = {
  /** Adapter-specific excess coin returned from receipt-token adapters. */
  excessCoin?: TransactionObjectArgument;
};

export type AdapterRedeemResult = {
  outputCoin: TransactionObjectArgument;
};

export type JitterAdapterManifest = {
  kind: JitterAdapterKind;
  canDepositUnderlying: boolean;
  canRedeemUnderlying: boolean;
  depositInputType(config: JitterMarketConfig): string;
  redeemOutputType(config: JitterMarketConfig): string;
  requiredObjectIds(config: JitterMarketConfig): Record<string, string>;
  addPriceInfo(args: AdapterPriceInfoArgs): TransactionObjectArgument;
  /** Deposit-first adapters mint SY only after receiving actual upstream shares. */
  addMintFromUnderlying?(args: {
    sweepDepositDust?: boolean;
    tx: Transaction;
    config: JitterMarketConfig;
    inputCoin: TransactionObjectArgument;
    minSyOut: bigint;
  }): TransactionObjectArgument;
  addDepositToSy(args: AdapterDepositArgs): AdapterDepositResult;
  addRedeemFromSy(args: AdapterRedeemArgs): AdapterRedeemResult;
};
