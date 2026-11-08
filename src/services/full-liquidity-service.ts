import { bcs } from "@mysten/sui/bcs";
import { normalizeStructTag, normalizeSuiAddress } from "@mysten/sui/utils";
import type { Transaction, TransactionArgument } from "@mysten/sui/transactions";
import { getSuiGrpcClient } from "../rpc.js";
import { buildWithGasHeadroom } from "./transaction-gas.js";
import { createJitterTransactionService, type CreateJitterTransactionServiceOptions,
  type JitterTransactionService, type BuildAddLpKeepYtTxParams,
  type BuildAddLpKeepYtFromUnderlyingTxParams, type BuildAddLpKeepYtFromMarketCoinTxParams,
  type BuildAddLpFromSyTxParams, type BuildAddLpFromSyFromUnderlyingTxParams,
  type BuildAddLpFromSyFromMarketCoinTxParams } from "./transaction-service.js";

type FundingParams<T> = Omit<T, "minLpOut" | "minYtOut" | "minSyOut">;
export type FullLiquidityInputPolicy = "exact" | "retain-treasury";
export type FullLiquidityPrepareRequest = { slippageBps: number; inputPolicy?: FullLiquidityInputPolicy } & (
  | { mode: "keep-yt"; funding: "sy"; params: FundingParams<BuildAddLpKeepYtTxParams> }
  | { mode: "keep-yt"; funding: "underlying"; params: FundingParams<BuildAddLpKeepYtFromUnderlyingTxParams> }
  | { mode: "keep-yt"; funding: "receipt"; params: FundingParams<BuildAddLpKeepYtFromMarketCoinTxParams> }
  | { mode: "non-keep-yt"; funding: "sy"; params: FundingParams<BuildAddLpFromSyTxParams> }
  | { mode: "non-keep-yt"; funding: "underlying"; params: FundingParams<BuildAddLpFromSyFromUnderlyingTxParams> }
  | { mode: "non-keep-yt"; funding: "receipt"; params: FundingParams<BuildAddLpFromSyFromMarketCoinTxParams> }
);
export type FullLiquiditySimulation = { success: false; error: string;
  moveAbort?: { package: string; module: string; code: number } } | {
  success: true;
  commandResults?: readonly { returnValues?: readonly { bcs: Uint8Array | null }[] }[];
};
export type FullLiquidityQuote = {
  inputSy: bigint; lpOut: bigint; ytOut: bigint; refundSy: bigint; treasurySy: bigint;
  minLpOut: bigint; minYtOut: bigint;
  inputAllocation?: { funding: FullLiquidityPrepareRequest["funding"];
    budgetAmount: bigint; routedAmount: bigint; retainedAmount: bigint };
};
export type FullLiquidityFailureKind = "curve-limit" | "precision-unresolved" | "search-incomplete" | "simulation-failed";
export class FullLiquidityPreparationError extends Error {
  constructor(public readonly kind: FullLiquidityFailureKind, detail: string) {
    super(`Full LP simulation failed (${kind}): ${detail}`);
    this.name = "FullLiquidityPreparationError";
  }
}
export type CreateFullLiquidityServiceOptions =
  Omit<CreateJitterTransactionServiceOptions, "liquidityInputMode" | "observeFullLiquidity"> & {
    simulate?: (tx: Transaction) => Promise<FullLiquiditySimulation>;
  };

/** Quotes only the actual new contract route. It never signs or submits. */
export function createFullLiquidityService(inputOptions: CreateFullLiquidityServiceOptions) {
  const options = {
    ...inputOptions,
    config: structuredClone(inputOptions.config),
    depositDustToTreasury: inputOptions.depositDustToTreasury ?? (inputOptions.network === "mainnet"),
  };
  const { simulate: injectedSimulation, ...transactionOptions } = options;
  const simulate = injectedSimulation ?? (async (tx: Transaction): Promise<FullLiquiditySimulation> => {
    if (!options.network) throw new Error("Full LP preparation requires a network or simulation transport");
    const client = getSuiGrpcClient(options.network);
    // Resolve coin intents before locating probes; intent expansion shifts commands.
    await buildWithGasHeadroom(tx, { client });
    const result = await client.simulateTransaction({ transaction: tx, checksEnabled: true, include: { commandResults: true } });
    if (result.$kind !== "Transaction" || !result.Transaction.status.success) {
      const failed = result.$kind === "FailedTransaction" ? result.FailedTransaction : result.Transaction;
      const error = failed.status.error;
      const abort = error?.$kind === "MoveAbort" ? error.MoveAbort : undefined;
      return { success: false, error: error?.message ?? "Full LP simulation failed",
        moveAbort: abort?.location?.package && abort.location.module && abort.abortCode !== undefined
          ? { package: abort.location.package, module: abort.location.module, code: Number(abort.abortCode) } : undefined };
    }
    return { success: true, commandResults: result.commandResults };
  });

  return {
    async prepare(request: FullLiquidityPrepareRequest): Promise<{ transaction: Transaction; quote: FullLiquidityQuote }> {
      const stable = structuredClone(request);
      if (!Number.isInteger(stable.slippageBps) || stable.slippageBps < 0 || stable.slippageBps >= 10_000) {
        throw new Error("Invalid full-liquidity slippage");
      }
      if (stable.inputPolicy !== undefined && stable.inputPolicy !== "exact" && stable.inputPolicy !== "retain-treasury") {
        throw new Error("Invalid full-liquidity input policy");
      }
      const now = BigInt(Date.now());
      const deadline = stable.params.deadlineMs ?? now + 120_000n;
      if (deadline <= now) throw new Error("Full-liquidity deadline has expired");
      const service = createJitterTransactionService({ ...transactionOptions, liquidityInputMode: "full",
        observeFullLiquidity: (tx, observation) => {
          tx.moveCall({ target: "0x2::coin::value", typeArguments: [options.config.syTypeTag], arguments: [observation.refundSy] });
          tx.moveCall({ target: `${options.config.jitterPackageId}::market::total_accounted_sy`,
            typeArguments: [options.config.syTypeTag, options.config.ptTypeTag, options.config.ytTypeTag],
            arguments: [tx.object(options.config.marketStateObjectId ?? options.config.marketObjectId)] });
        },
      });
      const draft = await build(service, stable, 1n, stable.mode === "keep-yt" ? 1n : 0n, deadline);
      const estimate = readResult(draft, await simulate(draft), stable, options);
      const minimum = (amount: bigint) => {
        const value = amount * BigInt(10_000 - stable.slippageBps) / 10_000n;
        return value > 0n ? value : 1n;
      };
      const minLpOut = minimum(estimate.lpOut);
      const minYtOut = stable.mode === "keep-yt" ? minimum(estimate.ytOut) : 0n;
      let selected = stable;
      let selectedEstimate = estimate;
      if (stable.inputPolicy === "retain-treasury") {
        const budget = fundingAmount(stable);
        const visited = new Set<bigint>([budget]);
        let current = stable;
        let currentEstimate = estimate;
        for (let attempt = 0; attempt < 4 && currentEstimate.treasurySy > 0n; attempt++) {
          // Convert the observed SY remainder into the funding asset's raw units.
          const reduction = stable.funding === "sy" ? currentEstimate.treasurySy
            : (fundingAmount(current) * currentEstimate.treasurySy + currentEstimate.inputSy - 1n)
              / currentEstimate.inputSy;
          const nextAmount = budget - reduction;
          if (nextAmount <= 1n || visited.has(nextAmount)) break;
          visited.add(nextAmount);
          const candidate = withFundingAmount(stable, nextAmount);
          const candidateTx = await build(service, candidate, 1n, candidate.mode === "keep-yt" ? 1n : 0n, deadline);
          let candidateEstimate: ReturnType<typeof readResult>;
          try {
            candidateEstimate = readResult(candidateTx, await simulate(candidateTx), candidate, options);
          } catch (error) {
            if (error instanceof FullLiquidityPreparationError && error.kind !== "simulation-failed") break;
            throw error;
          }
          if (candidateEstimate.lpOut < minLpOut || candidateEstimate.ytOut < minYtOut) break;
          if (candidateEstimate.treasurySy < selectedEstimate.treasurySy) {
            selected = candidate;
            selectedEstimate = candidateEstimate;
          }
          current = candidate;
          currentEstimate = candidateEstimate;
        }
      }
      const transaction = await build(service, selected, minLpOut, minYtOut, deadline);
      const actual = readResult(transaction, await simulate(transaction), selected, options);
      if (actual.lpOut < minLpOut || actual.ytOut < minYtOut) throw new Error("Full LP simulation violates an output minimum");
      if (stable.inputPolicy === "retain-treasury" && actual.treasurySy > selectedEstimate.treasurySy) {
        throw new Error("Full LP Treasury remainder increased during final simulation");
      }
      if (deadline <= BigInt(Date.now())) throw new Error("Full-liquidity deadline expired during preparation");
      const inputAllocation = stable.inputPolicy === "retain-treasury"
        ? { funding: stable.funding, budgetAmount: fundingAmount(stable),
            routedAmount: fundingAmount(selected), retainedAmount: fundingAmount(stable) - fundingAmount(selected) }
        : undefined;
      return { transaction, quote: { ...actual, minLpOut, minYtOut,
        ...(inputAllocation ? { inputAllocation } : {}) } };
    },
  };
}

function fundingAmount(request: FullLiquidityPrepareRequest): bigint {
  switch (request.funding) {
    case "sy": return request.params.inputAmount;
    case "underlying": return request.params.underlyingAmount;
    case "receipt": return request.params.marketCoinAmount;
  }
}

function withFundingAmount(request: FullLiquidityPrepareRequest, amount: bigint): FullLiquidityPrepareRequest {
  switch (request.funding) {
    case "sy": return { ...request, params: { ...request.params, inputAmount: amount } };
    case "underlying": return { ...request, params: { ...request.params, underlyingAmount: amount } };
    case "receipt": return { ...request, params: { ...request.params, marketCoinAmount: amount } };
  }
}

async function build(service: JitterTransactionService, request: FullLiquidityPrepareRequest, minLpOut: bigint, minYtOut: bigint, deadlineMs: bigint) {
  if (request.mode === "keep-yt") {
    switch (request.funding) {
      case "sy": return service.buildAddLpKeepYtTx({ ...request.params, minLpOut, minYtOut, deadlineMs });
      case "underlying": return service.buildAddLpKeepYtFromUnderlyingTx({ ...request.params, minLpOut, minYtOut, deadlineMs });
      case "receipt": return service.buildAddLpKeepYtFromMarketCoinTx({ ...request.params, minLpOut, minYtOut, deadlineMs });
    }
  } else {
    switch (request.funding) {
      case "sy": return service.buildAddLpFromSyTx({ ...request.params, minLpOut, minSyOut: 0n, deadlineMs });
      case "underlying": return service.buildAddLpFromSyFromUnderlyingTx({ ...request.params, minLpOut, minSyOut: 0n, deadlineMs });
      case "receipt": return service.buildAddLpFromSyFromMarketCoinTx({ ...request.params, minLpOut, minSyOut: 0n, deadlineMs });
    }
  }
}

function readResult(tx: Transaction, result: FullLiquiditySimulation, request: FullLiquidityPrepareRequest, options: CreateFullLiquidityServiceOptions) {
  if (!result.success) {
    let kind: FullLiquidityFailureKind = "simulation-failed";
    const abort = result.moveAbort;
    if (abort?.module === "router") {
      let ownPackage = false;
      try { ownPackage = normalizeSuiAddress(abort.package) === normalizeSuiAddress(options.config.jitterPackageId); } catch { /* Untrusted transport data is not a classified contract error. */ }
      if (ownPackage) {
        if (abort.code === 3010) kind = "curve-limit";
        else if (abort.code === 3011) kind = "precision-unresolved";
        else if (abort.code === 3012) kind = "search-incomplete";
      }
    }
    throw new FullLiquidityPreparationError(kind, result.error);
  }
  const commands = tx.getData().commands;
  const fn = request.mode === "keep-yt" ? "add_lp_keep_yt" : "add_lp_from_sy";
  const routes = commands.flatMap((command, i) => command.$kind === "MoveCall"
    && normalizeSuiAddress(command.MoveCall.package) === normalizeSuiAddress(options.config.jitterPackageId)
    && command.MoveCall.module === "router" && command.MoveCall.function === fn ? [i] : []);
  if (routes.length !== 1) throw new Error("Full LP simulation route layout changed");
  const route = routes[0];
  const router = commands[route];
  if (router.$kind !== "MoveCall" || router.MoveCall.arguments.length !== (request.mode === "keep-yt" ? 13 : 14)
    || router.MoveCall.typeArguments.length !== 3
    || router.MoveCall.typeArguments.some((type, i) => normalizeStructTag(type)
      !== normalizeStructTag([options.config.syTypeTag, options.config.ptTypeTag, options.config.ytTypeTag][i]))) {
    throw new Error("Full LP simulation route layout changed");
  }
  for (const index of [route - 1, route + 1]) {
    const command = commands[index];
    if (command?.$kind !== "MoveCall" || command.MoveCall.module !== "coin" || command.MoveCall.function !== "value"
      || normalizeSuiAddress(command.MoveCall.package) !== normalizeSuiAddress("0x2")
      || command.MoveCall.typeArguments.length !== 1 || command.MoveCall.arguments.length !== 1
      || normalizeStructTag(command.MoveCall.typeArguments[0]) !== normalizeStructTag(options.config.syTypeTag)) {
      throw new Error("Full LP simulation probe layout changed");
    }
    const expected: TransactionArgument = index < route ? router.MoveCall.arguments[4]
      : { $kind: "NestedResult", NestedResult: [route, request.mode === "keep-yt" ? 2 : 1] };
    if (!sameArgument(command.MoveCall.arguments[0], expected)) throw new Error("Full LP simulation probe references the wrong coin");
  }
  for (const index of [route - 2, route + 2]) {
    const command = commands[index];
    if (command?.$kind !== "MoveCall" || command.MoveCall.module !== "market"
      || command.MoveCall.function !== "total_accounted_sy"
      || normalizeSuiAddress(command.MoveCall.package) !== normalizeSuiAddress(options.config.jitterPackageId)
      || command.MoveCall.typeArguments.length !== 3 || command.MoveCall.arguments.length !== 1
      || command.MoveCall.typeArguments.some((type, i) => normalizeStructTag(type) !== normalizeStructTag(router.MoveCall.typeArguments[i]))
      || !sameArgument(command.MoveCall.arguments[0], router.MoveCall.arguments[request.mode === "keep-yt" ? 7 : 8])) {
      throw new Error("Full LP simulation backing probe layout changed");
    }
  }
  const read = (command: number, slot = 0, wide = false) => {
    const value = result.commandResults?.[command]?.returnValues?.[slot]?.bcs;
    if (!value || value.length !== (wide ? 16 : 8)) throw new Error("Missing full LP simulation return value");
    return BigInt((wide ? bcs.u128() : bcs.u64()).parse(value));
  };
  const inputSy = read(route - 1);
  const lpOut = read(route);
  const ytOut = request.mode === "keep-yt" ? read(route, 1) : 0n;
  const refundSy = read(route + 1);
  const treasurySy = read(route - 2, 0, true) + inputSy - read(route + 2, 0, true) - refundSy;
  const originalDust = inputSy / 1_000_000n > 1n ? inputSy / 1_000_000n : 1n;
  if (refundSy !== 0n) throw new Error("Full LP simulation returned a nonzero SY refund");
  if (inputSy <= 1n || treasurySy < 0n || treasurySy >= inputSy) {
    throw new Error("Full LP simulation has invalid SY Treasury accounting");
  }
  if (request.mode !== "keep-yt" && treasurySy > originalDust) {
    throw new Error("Full LP simulation exceeds the SY Treasury dust limit");
  }
  if (lpOut === 0n || (request.mode === "keep-yt" && ytOut === 0n)) throw new Error("Full LP simulation returned no position credit");
  if (request.funding === "sy" && inputSy !== request.params.inputAmount) throw new Error("Full LP simulation changed the input amount");
  return { inputSy, lpOut, ytOut, refundSy, treasurySy };
}

function sameArgument(a: TransactionArgument, b: TransactionArgument): boolean {
  if (typeof a === "function" || typeof b === "function" || a.$kind !== b.$kind) return false;
  if (a.$kind === "Input" && b.$kind === "Input") return a.Input === b.Input;
  if (a.$kind === "Result" && b.$kind === "Result") return a.Result === b.Result;
  return a.$kind === "NestedResult" && b.$kind === "NestedResult"
    && a.NestedResult[0] === b.NestedResult[0] && a.NestedResult[1] === b.NestedResult[1];
}
