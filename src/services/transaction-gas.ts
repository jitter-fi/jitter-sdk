import type { BuildTransactionOptions, Transaction } from '@mysten/sui/transactions';

const MAX_U64 = (1n << 64n) - 1n;

/** A spending ceiling with 20% headroom, not an additional transaction fee. */
export function gasBudgetWithHeadroom(estimate: bigint): bigint {
  if (estimate <= 0n || estimate > MAX_U64) throw new Error('Invalid gas estimate.');
  const budget = (estimate * 120n + 99n) / 100n;
  if (budget > MAX_U64) throw new Error('Gas budget with headroom exceeds u64.');
  return budget;
}

/** Capture automatic selection before resolution populates the transaction. */
export async function buildWithGasHeadroom(transaction: Transaction, options: BuildTransactionOptions = {}): Promise<Uint8Array> {
  if (options.onlyTransactionKind) throw new Error('Gas preparation requires a complete transaction.');
  const automatic = transaction.getData().gasData.budget == null;
  const bytes = await transaction.build(options);
  if (!automatic) return bytes;
  const estimate = transaction.getData().gasData.budget;
  if (estimate == null) throw new Error('Automatic gas estimate is unavailable.');
  transaction.setGasBudget(gasBudgetWithHeadroom(BigInt(estimate)));
  // Resolve/check the exact ceiling that subsequent simulations and signing use.
  return transaction.build(options);
}
