import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import type { JitterMarketConfig } from "../types.js";

/** Only deposit conversion change belongs here, never trade refunds or wallet balances. */
export function addDepositDustToTreasury(
  tx: Transaction,
  config: JitterMarketConfig,
  change: TransactionObjectArgument,
  coinType: string,
): void {
  if (!config.globalConfigObjectId) throw new Error("Missing globalConfigObjectId for deposit dust.");
  tx.moveCall({
    target: `${config.jitterPackageId}::router::assert_coin_max_value`,
    typeArguments: [coinType],
    arguments: [tx.object(config.globalConfigObjectId), change, tx.pure.u64(2n)],
  });
  const treasury = tx.moveCall({
    target: `${config.jitterPackageId}::market::treasury`,
    typeArguments: [config.syTypeTag, config.ptTypeTag, config.ytTypeTag],
    arguments: [tx.object(config.marketObjectId)],
  });
  // Address-balance credit consumes even a zero coin without creating another Coin object.
  tx.moveCall({
    target: "0x2::coin::send_funds",
    typeArguments: [coinType],
    arguments: [change, treasury],
  });
}
