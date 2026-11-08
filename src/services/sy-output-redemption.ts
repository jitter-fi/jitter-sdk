import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { getJitterAdapterManifest } from "../adapters/registry.js";
import { resolveReceiptAdapter } from "../adapters/receipt.js";
import { getSuiGrpcClient, type GrpcNetworkKind } from "../rpc.js";
import { addReceiptRedeem, addScallopRedeem } from "../sy.js";
import type { JitterMarketConfig } from "../types.js";
import type { SyOutputTransform } from "./transaction-service.js";
import { buildWithGasHeadroom } from "./transaction-gas.js";

export type SyOutputSimulator = (transaction: Transaction, commandIndexes: readonly number[]) => Promise<readonly bigint[]>;

export function syOutputSimulator(network: GrpcNetworkKind): SyOutputSimulator {
  return async (transaction, indexes) => {
    const client = getSuiGrpcClient(network);
    const probeTypes = new Set(indexes.map(index => {
      const command = transaction.getData().commands[index];
      if (command?.$kind !== "MoveCall" || command.MoveCall.module !== "coin" || command.MoveCall.function !== "value") {
        throw new Error("Invalid SY output probe.");
      }
      return command.MoveCall.typeArguments[0];
    }));
    // Coin intents can insert commands and shift indexes during resolution.
    await buildWithGasHeadroom(transaction, { client });
    const resolvedIndexes = transaction.getData().commands.flatMap((command, index) =>
      command.$kind === "MoveCall" && command.MoveCall.module === "coin" &&
      command.MoveCall.function === "value" && probeTypes.has(command.MoveCall.typeArguments[0])
        ? [index] : []);
    if (resolvedIndexes.length !== indexes.length) throw new Error("SY output probe layout changed.");
    const result = await client.simulateTransaction({
      transaction, checksEnabled: true, include: { commandResults: true },
    });
    if (result.$kind !== "Transaction" || !result.Transaction.status.success) {
      const failed = result.$kind === "FailedTransaction" ? result.FailedTransaction : result.Transaction;
      throw new Error(`Trade simulation failed: ${failed.status.error?.message ?? "Review a new quote before signing."}`);
    }
    return resolvedIndexes.map(index => {
      const bytes = result.commandResults?.[index]?.returnValues?.[0]?.bcs;
      if (!bytes) throw new Error("Missing SY output simulation result.");
      return BigInt(bcs.u64().parse(bytes));
    });
  };
}

/** Probe each returned coin, rebuild without retaining probe-only commands, then
 * simulate the exact redeem-to-YBA route. Neither simulation submits a trade. */
export async function buildWithSyOutputRedemption(input: {
  config: JitterMarketConfig;
  build: (transform: SyOutputTransform) => Promise<Transaction>;
  simulate: SyOutputSimulator;
}): Promise<{ transaction: Transaction; redeemedSyAmount: bigint; zeroOutputs: number }> {
  const indexes: number[] = [];
  const probe = await input.build((tx, coin) => {
    indexes.push(tx.getData().commands.length);
    tx.moveCall({ target: "0x2::coin::value", typeArguments: [input.config.syTypeTag], arguments: [coin] });
    return coin;
  });
  const amounts = await input.simulate(probe, indexes);
  if (amounts.length !== indexes.length || amounts.some(amount => amount < 0n)) {
    throw new Error("Missing SY output simulation result.");
  }
  const exit = resolveReceiptAdapter(input.config, getJitterAdapterManifest(input.config).kind);
  let cursor = 0;
  let zeroOutputs = 0;
  const transaction = await input.build((tx, coin) => {
    const amount = amounts[cursor++];
    if (amount === undefined) throw new Error("SY output layout changed. Review a new quote.");
    if (amount === 0n) {
      zeroOutputs++;
      // Enforce the observed zero at execution too: a changed positive refund
      // aborts instead of being silently left as SY or destroyed.
      tx.moveCall({ target: "0x2::coin::destroy_zero", typeArguments: [input.config.syTypeTag], arguments: [coin] });
      return null;
    }
    return exit.kind === "scallop"
      ? addScallopRedeem(tx, input.config, coin, 0n)
      : addReceiptRedeem(tx, input.config, coin, { ...exit, kind: exit.kind });
  });
  if (cursor !== amounts.length) throw new Error("SY output layout changed. Review a new quote.");
  await input.simulate(transaction, []);
  return { transaction, redeemedSyAmount: amounts.reduce((sum, amount) => sum + amount, 0n), zeroOutputs };
}
