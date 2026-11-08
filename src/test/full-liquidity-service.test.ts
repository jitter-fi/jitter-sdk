import { describe, expect, spyOn, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { fromBase64 } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { getDefaultJitterMarketConfig } from "../config.js";
import { getSuiGrpcClient } from "../rpc.js";
import { createFullLiquidityService, type FullLiquiditySimulation } from "../services/full-liquidity-service.js";

const configured = getDefaultJitterMarketConfig("testnet");
if (!configured) throw new Error("Missing testnet market fixture");
const { liquidlink: _points, coinReward: _rewards, ...config } = configured;
const params = { senderAddress: "0xaa", inputCoinId: "0x40", inputAmount: 1_000_000n,
  syToMintHint: 0n, positionId: "0x41", rewardSettlement: { strategy: "empty-vector" as const } };
const bytes = (n: bigint) => ({ bcs: bcs.u64().serialize(n).toBytes() });

function simulate(tx: Transaction, lp = 1000n, yt = 400n, refund = 0n, treasury = 1n,
  inputSy = 1_000_000n): Extract<FullLiquiditySimulation, { success: true }> {
  let afterRouter = false;
  return { success: true, commandResults: tx.getData().commands.map(command => {
    if (command.$kind !== "MoveCall") return {};
    const call = command.MoveCall;
    if (call.module === "router" && ["add_lp_keep_yt", "add_lp_from_sy"].includes(call.function)) {
      afterRouter = true;
      return { returnValues: [bytes(lp), bytes(yt)] };
    }
    if (call.module === "coin" && call.function === "value") {
      return { returnValues: [bytes(afterRouter ? refund : inputSy)] };
    }
    if (call.module === "market" && call.function === "total_accounted_sy") {
      return { returnValues: [{ bcs: bcs.u128().serialize(afterRouter ? 1000n + inputSy - treasury - refund : 1000n).toBytes() }] };
    }
    return {};
  }) };
}

function firstSplitAmount(tx: Transaction): bigint {
  const split = tx.getData().commands.find(command => command.$kind === "SplitCoins");
  if (split?.$kind !== "SplitCoins") throw new Error("Missing funding split");
  const amount = split.SplitCoins.amounts[0];
  if (amount?.$kind !== "Input") throw new Error("Missing funding amount");
  const input = tx.getData().inputs[amount.Input];
  if (input?.$kind !== "Pure") throw new Error("Funding amount is not pure");
  return BigInt(bcs.u64().parse(fromBase64(input.Pure.bytes)));
}

function minimum(tx: Transaction, slot: number) {
  const data = tx.getData();
  const call = data.commands.find(c => c.$kind === "MoveCall" && c.MoveCall.function ===
    (slot === 7 ? "assert_yt_delta_at_least" : "add_lp_keep_yt"));
  if (call?.$kind !== "MoveCall") throw new Error("Missing full route");
  const arg = call.MoveCall.arguments[slot === 7 ? 3 : slot];
  if (arg.$kind !== "Input") throw new Error("Not a pure minimum");
  const input = data.inputs[arg.Input];
  if (input.$kind !== "Pure") throw new Error("Not a pure minimum");
  return BigInt(bcs.u64().parse(fromBase64(input.Pure.bytes)));
}

describe("full-liquidity preparation", () => {
  test("retains the quoted Keep remainder in the wallet and simulates the final reduced PTB", async () => {
    const amounts: bigint[] = [];
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        amounts.push(amount);
        return simulate(tx, 1000n, 400n, 0n, amount === 1_000_000n ? 4n : 0n, amount);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(amounts).toEqual([1_000_000n, 999_996n, 999_996n]);
    expect(firstSplitAmount(prepared.transaction)).toBe(999_996n);
    expect(prepared.quote).toEqual({ inputSy: 999_996n, lpOut: 1000n, ytOut: 400n,
      refundSy: 0n, treasurySy: 0n, minLpOut: 995n, minYtOut: 398n,
      inputAllocation: { funding: "sy", budgetAmount: 1_000_000n, routedAmount: 999_996n, retainedAmount: 4n } });
  });

  test.each([1_000_000_000n, 10_000_000_000_000n])(
    "preserves raw precision when retaining one SY atom from a %s-atom budget", async budget => {
      const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
        simulate: async tx => {
          const amount = firstSplitAmount(tx);
          return simulate(tx, 1000n, 400n, 0n, amount === budget ? 1n : 0n, amount);
        } });
      const prepared = await service.prepare({ mode: "keep-yt", funding: "sy",
        params: { ...params, inputAmount: budget }, slippageBps: 50, inputPolicy: "retain-treasury" });
      expect(firstSplitAmount(prepared.transaction)).toBe(budget - 1n);
      expect(prepared.quote.inputAllocation?.retainedAmount).toBe(1n);
      expect(prepared.quote.treasurySy).toBe(0n);
    });

  test("requotes against the original budget when the remainder changes after subtraction", async () => {
    const amounts: bigint[] = [];
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        amounts.push(amount);
        const treasury = amount === 1_000_000n ? 4n : amount === 999_996n ? 3n : 0n;
        return simulate(tx, 1000n, 400n, 0n, treasury, amount);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(amounts).toEqual([1_000_000n, 999_996n, 999_997n, 999_997n]);
    expect(prepared.quote.inputAllocation?.retainedAmount).toBe(3n);
    expect(prepared.quote.treasurySy).toBe(0n);
  });

  test("does not retain input if the reduced quote breaches the original LP minimum", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        return simulate(tx, amount === 1_000_000n ? 1000n : 900n, 400n,
          0n, amount === 1_000_000n ? 10n : 0n, amount);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(firstSplitAmount(prepared.transaction)).toBe(1_000_000n);
    expect(prepared.quote.inputAllocation?.retainedAmount).toBe(0n);
    expect(prepared.quote.treasurySy).toBe(10n);
  });

  test("adjusts Non-Keep without inventing YT or a user SY refund", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        return simulate(tx, 1000n, 0n, 0n, amount === 1_000_000n ? 1n : 0n, amount);
      } });
    const prepared = await service.prepare({ mode: "non-keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(firstSplitAmount(prepared.transaction)).toBe(999_999n);
    expect(prepared.quote.ytOut).toBe(0n);
    expect(prepared.quote.refundSy).toBe(0n);
    expect(prepared.quote.inputAllocation?.retainedAmount).toBe(1n);
  });

  test("uses source units when retaining receipt input rather than subtracting raw SY", async () => {
    const scallop = { ...config, demoMarketVaultObjectId: "", underlyingTypeTag: "0x2::sui::SUI",
      scallopAdapterPackageId: "0x20", scallopProtocolPackageId: "0x24", scallopMarketVaultObjectId: "0x21",
      scallopMarketObjectId: "0x22", scallopVersionObjectId: "0x23",
      scallopMarketCoinTypeTag: "0x24::reserve::MarketCoin<0x2::sui::SUI>" };
    const amounts: bigint[] = [];
    const service = createFullLiquidityService({ config: scallop, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const source = firstSplitAmount(tx);
        amounts.push(source);
        return simulate(tx, 1000n, 400n, 0n, source === 2_000_000n ? 2n : 0n, source / 2n);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "receipt", slippageBps: 50,
      inputPolicy: "retain-treasury", params: { senderAddress: params.senderAddress,
        syToMintHint: 0n, positionId: params.positionId, rewardSettlement: params.rewardSettlement,
        marketCoinId: "0x40", marketCoinAmount: 2_000_000n } });
    expect(amounts).toEqual([2_000_000n, 1_999_996n, 1_999_996n]);
    expect(prepared.quote.inputAllocation).toEqual({ funding: "receipt", budgetAmount: 2_000_000n,
      routedAmount: 1_999_996n, retainedAmount: 4n });
  });

  test("converts a six-decimal underlying reduction using simulated SY, not fixed decimals", async () => {
    const usdc = "0x91::usdc::USDC";
    const scallop = { ...config, demoMarketVaultObjectId: "", underlyingTypeTag: usdc, marketDecimals: 6,
      scallopAdapterPackageId: "0x20", scallopProtocolPackageId: "0x24", scallopMarketVaultObjectId: "0x21",
      scallopMarketObjectId: "0x22", scallopVersionObjectId: "0x23",
      scallopMarketCoinTypeTag: `0x24::reserve::MarketCoin<${usdc}>` };
    const amounts: bigint[] = [];
    const service = createFullLiquidityService({ config: scallop, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const source = firstSplitAmount(tx);
        amounts.push(source);
        return simulate(tx, 1000n, 400n, 0n, source === 1_000_000n ? 2000n : 0n, source * 1000n);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "underlying", slippageBps: 50,
      inputPolicy: "retain-treasury", params: { senderAddress: params.senderAddress,
        syToMintHint: 0n, positionId: params.positionId, rewardSettlement: params.rewardSettlement,
        underlyingCoinId: "0x40", underlyingAmount: 1_000_000n } });
    expect(amounts).toEqual([1_000_000n, 999_998n, 999_998n]);
    expect(prepared.quote.inputAllocation).toEqual({ funding: "underlying", budgetAmount: 1_000_000n,
      routedAmount: 999_998n, retainedAmount: 2n });
  });

  test("keeps the original route when the reduced candidate aborts", async () => {
    const amounts: bigint[] = [];
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        amounts.push(amount);
        return amount === 1_000_000n ? simulate(tx, 1000n, 400n, 0n, 4n, amount)
          : { success: false, error: "curve limit", moveAbort: { package: config.jitterPackageId,
              module: "router", code: 3010 } };
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(amounts).toEqual([1_000_000n, 999_996n, 1_000_000n]);
    expect(prepared.quote.inputAllocation?.retainedAmount).toBe(0n);
    expect(prepared.quote.treasurySy).toBe(4n);
  });

  test("does not hide an unclassified candidate simulation failure", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        return amount === 1_000_000n ? simulate(tx, 1000n, 400n, 0n, 4n, amount)
          : { success: false, error: "simulation transport unavailable" };
      } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" })).rejects.toThrow("transport unavailable");
  });

  test("rejects a final candidate if its Treasury remainder grows before signing", async () => {
    let call = 0;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        call++;
        return simulate(tx, 1000n, 400n, 0n, call === 1 ? 4n : call === 2 ? 0n : 1n, amount);
      } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" })).rejects.toThrow("Treasury remainder increased");
  });

  test("retains a reduced input only if the original YT minimum still holds", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        return simulate(tx, 1000n, amount === 1_000_000n ? 400n : 397n,
          0n, amount === 1_000_000n ? 4n : 0n, amount);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(prepared.quote.inputAllocation?.routedAmount).toBe(1_000_000n);
    expect(prepared.quote.minYtOut).toBe(398n);
  });

  test("does not requote when the original route has no Treasury remainder", async () => {
    let calls = 0;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => { calls++; return simulate(tx, 1000n, 400n, 0n, 0n); } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(calls).toBe(2);
    expect(prepared.quote.inputAllocation?.retainedAmount).toBe(0n);
  });

  test("reports remaining Treasury SY when an SDK-only reduction cannot eliminate it", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const amount = firstSplitAmount(tx);
        return simulate(tx, 1000n, 400n, 0n, amount === 1_000_000n ? 4n : 3n, amount);
      } });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "retain-treasury" });
    expect(prepared.quote.inputAllocation?.retainedAmount).toBe(4n);
    expect(prepared.quote.treasurySy).toBe(3n);
  });

  test("rejects an unknown input policy before simulation", async () => {
    let called = false;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => { called = true; return simulate(tx); } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params,
      slippageBps: 50, inputPolicy: "other" as "exact" })).rejects.toThrow("input policy");
    expect(called).toBe(false);
  });

  test("quotes actual execution, rebuilds LP and YT minima, and verifies the final PTB", async () => {
    const txs: Transaction[] = [];
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => { txs.push(tx); return simulate(tx); } });
    const result = await service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 });
    expect(txs).toHaveLength(2);
    expect(result.transaction).toBe(txs[1]);
    expect(result.quote).toEqual({ inputSy: 1_000_000n, lpOut: 1000n, ytOut: 400n,
      refundSy: 0n, treasurySy: 1n, minLpOut: 995n, minYtOut: 398n });
    expect(minimum(txs[0], 6)).toBe(1n);
    expect(minimum(txs[1], 6)).toBe(995n);
    expect(minimum(txs[1], 7)).toBe(398n);
  });

  test("does not quote a large refund as full investment", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 0n, 1000n) });
    await expect(service.prepare({ mode: "non-keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("refund");
  });

  test("rejects an excessive Treasury sweep even when the user refund is zero", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 0n, 0n, 1000n) });
    await expect(service.prepare({ mode: "non-keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("Treasury dust");
  });

  test("Keep reports its Treasury remainder and still returns a zero SY coin", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 400n, 0n, 879n) });
    const prepared = await service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 });
    expect(prepared.quote.treasurySy).toBe(879n);
    expect(prepared.quote.refundSy).toBe(0n);
    expect(prepared.quote.minLpOut).toBe(995n);
    expect(prepared.quote.minYtOut).toBe(398n);
  });

  test.each([1001n, 2000n, 900000n])("Keep accepts the actual Treasury remainder without an amount or percentage cap: %s", async treasury => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 400n, 0n, treasury) });
    const result = await service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 });
    expect(result.quote.treasurySy).toBe(treasury);
    expect(result.quote.refundSy).toBe(0n);
  });

  test("Keep does not apply the removed percentage cap to small funding", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const result = simulate(tx, 1000n, 400n, 0n, 6n);
        const commandResults = [...result.commandResults!];
        let afterRouter = false;
        tx.getData().commands.forEach((command, i) => {
          if (command.$kind !== "MoveCall") return;
          if (command.MoveCall.module === "router") afterRouter = true;
          if (command.MoveCall.module === "coin" && command.MoveCall.function === "value" && !afterRouter)
            commandResults[i] = { returnValues: [bytes(5000n)] };
          if (command.MoveCall.module === "market" && command.MoveCall.function === "total_accounted_sy" && afterRouter)
            commandResults[i] = { returnValues: [{ bcs: bcs.u128().serialize(5994n).toBytes() }] };
        });
        return { ...result, commandResults };
      } });
    const result = await service.prepare({ mode: "keep-yt", funding: "sy", params: { ...params, inputAmount: 5000n }, slippageBps: 50 });
    expect(result.quote.treasurySy).toBe(6n);
    expect(result.quote.inputSy).toBe(5000n);
  });

  test("Keep cannot send the entire funding to Treasury even with nonzero output probes", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 400n, 0n, 1_000_000n) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 }))
      .rejects.toThrow("Treasury accounting");
  });

  test("rejects even a one-atom user refund on the zero-refund route", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 400n, 1n, 0n) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("nonzero SY refund");
  });

  test("rejects backing growth that exceeds the entire input", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, 400n, 0n, -1n) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("Treasury accounting");
  });

  test("rejects a backing probe for a different market", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const data = tx.getData();
        const route = data.commands.findIndex(c => c.$kind === "MoveCall" && c.MoveCall.function === "add_lp_keep_yt");
        const probe = data.commands[route + 2];
        if (probe.$kind !== "MoveCall") throw new Error("Missing backing probe");
        probe.MoveCall.arguments = [{ $kind: "Input", Input: data.inputs.length }];
        spyOn(tx, "getData").mockReturnValue(data);
        return simulate(tx);
      } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("backing probe");
  });

  test("stops if the final rebuilt transaction fails or violates either minimum", async () => {
    let count = 0;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, ++count === 1 ? 1000n : 994n) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("minimum");
  });

  test("failed simulations never become zero-valued quotes", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async () => ({ success: false, error: "1413: search incomplete" }) });
    await expect(service.prepare({ mode: "non-keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("search incomplete");
  });

  test("missing return values fail closed", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async () => ({ success: true, commandResults: [] }) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("return");
  });

  test("rejects a probe that observes the wrong coin even if its amount looks valid", async () => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const data = tx.getData();
        const route = data.commands.findIndex(c => c.$kind === "MoveCall" && c.MoveCall.function === "add_lp_keep_yt");
        const probe = data.commands[route + 1];
        if (probe.$kind !== "MoveCall") throw new Error("Missing probe");
        probe.MoveCall.arguments = [{ $kind: "NestedResult", NestedResult: [route, 0] }];
        spyOn(tx, "getData").mockReturnValue(data);
        return simulate(tx);
      } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("probe");
  });

  test.each(["keep-yt", "non-keep-yt"] as const)("prepares %s with SY, native and receipt funding", async mode => {
    const scallop = { ...config, demoMarketVaultObjectId: "", underlyingTypeTag: "0x2::sui::SUI",
      scallopAdapterPackageId: "0x20", scallopProtocolPackageId: "0x24", scallopMarketVaultObjectId: "0x21",
      scallopMarketObjectId: "0x22", scallopVersionObjectId: "0x23",
      scallopMarketCoinTypeTag: "0x24::reserve::MarketCoin<0x2::sui::SUI>" };
    const service = createFullLiquidityService({ config: scallop, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx) });
    const common = { senderAddress: params.senderAddress, syToMintHint: 0n,
      positionId: params.positionId, rewardSettlement: params.rewardSettlement };
    const results = await Promise.all([
      service.prepare({ mode, funding: "sy", params, slippageBps: 50 }),
      service.prepare({ mode, funding: "underlying", params: { ...common, underlyingAmount: 2_000_000n }, slippageBps: 50 }),
      service.prepare({ mode, funding: "receipt", params: { ...common, marketCoinId: "0x40", marketCoinAmount: 2_000_000n }, slippageBps: 50 }),
    ]);
    for (const result of results) {
      expect(result.quote.inputSy).toBe(1_000_000n);
      expect(result.quote.minLpOut).toBe(995n);
      expect(result.quote.minYtOut).toBe(mode === "keep-yt" ? 398n : 0n);
      expect(result.transaction.getData().commands.filter(c => c.$kind === "MoveCall"
        && c.MoveCall.module === "reward_distributor" && c.MoveCall.function === "finish_operation")).toHaveLength(6);
    }
  });

  test("checks minimum YT as well as minimum LP in the final simulation", async () => {
    let count = 0;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx, 1000n, ++count === 1 ? 400n : 397n) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("minimum");
  });

  test("does not return a draft when the final simulation aborts", async () => {
    let count = 0;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => ++count === 1 ? simulate(tx) : { success: false, error: "market paused" } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("market paused");
  });

  test("freezes input parameters across asynchronous quote preparation", async () => {
    const mutable = { ...params };
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => { mutable.inputAmount = 2n; return simulate(tx); } });
    const result = await service.prepare({ mode: "keep-yt", funding: "sy", params: mutable, slippageBps: 50 });
    expect(result.quote.inputSy).toBe(1_000_000n);
  });

  test("pins package and market configuration for both simulations", async () => {
    const mutableConfig = { ...config };
    const originalPackage = mutableConfig.jitterPackageId;
    const service = createFullLiquidityService({ config: mutableConfig, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => { mutableConfig.jitterPackageId = "0xdead"; return simulate(tx); } });
    const result = await service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 });
    const route = result.transaction.getData().commands.find(c => c.$kind === "MoveCall" && c.MoveCall.function === "add_lp_keep_yt");
    expect(route?.$kind === "MoveCall" && route.MoveCall.package).toBe(originalPackage);
  });

  test.each([0, 7, 9])("rejects malformed %s-byte return values", async length => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => {
        const result = simulate(tx);
        if (!result.success) throw new Error("Invalid fixture");
        return { ...result, commandResults: result.commandResults?.map(() => ({ returnValues: [{ bcs: new Uint8Array(length) }] })) };
      } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 })).rejects.toThrow("return value");
  });

  test("rejects expired deadlines before any simulation", async () => {
    let called = false;
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => { called = true; return simulate(tx); } });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params: { ...params, deadlineMs: 1n }, slippageBps: 50 })).rejects.toThrow("expired");
    expect(called).toBe(false);
  });

  test.each(["haedal", "ember-sui", "ember-usdc", "scallop-sui", "scallop-usdc", "scallop-usdsui"])("builds both full modes for all funding assets of %s", async family => {
    const underlyingTypeTag = family.endsWith("usdc") ? "0x91::usdc::USDC"
      : family.endsWith("usdsui") ? "0x92::usdsui::USDSUI" : "0x2::sui::SUI";
    const base = { ...config, demoMarketVaultObjectId: "", jitterMathPackageId: "0x16", underlyingTypeTag,
      marketDecimals: underlyingTypeTag === "0x2::sui::SUI" ? 9 : 6 };
    const marketConfig = family === "haedal" ? { ...base, adapterKind: "haedal" as const,
      haedalAdapterPackageId: "0x10", haedalMarketVaultObjectId: "0x11", haedalStakingObjectId: "0x12", haedalProtocolPackageId: "0x13" }
      : family.startsWith("ember") ? { ...base, adapterKind: "ember" as const,
        emberAdapterPackageId: "0x10", emberMarketVaultObjectId: "0x11", emberVaultObjectId: "0x12",
        emberVaultsPackageId: "0x13", emberProtocolConfigObjectId: "0x14", emberReceiptTypeTag: "0x15::receipt::RECEIPT" }
      : { ...base, adapterKind: "scallop" as const, scallopAdapterPackageId: "0x20", scallopProtocolPackageId: "0x24",
        scallopMarketVaultObjectId: "0x21", scallopMarketObjectId: "0x22", scallopVersionObjectId: "0x23",
        scallopMarketCoinTypeTag: `0x24::reserve::MarketCoin<${underlyingTypeTag}>` };
    const service = createFullLiquidityService({ config: marketConfig, resolveSyIndex: () => 1n << 64n,
      simulate: async tx => simulate(tx) });
    const common = { senderAddress: params.senderAddress, positionId: params.positionId,
      syToMintHint: 0n, syIndex: 1n << 64n, rewardSettlement: params.rewardSettlement };
    for (const mode of ["keep-yt", "non-keep-yt"] as const) {
      const prepared = [
        await service.prepare({ mode, funding: "sy", params, slippageBps: 50 }),
        await service.prepare({ mode, funding: "underlying", params: { ...common, underlyingAmount: 2_000_000n }, slippageBps: 50 }),
        await service.prepare({ mode, funding: "receipt", params: { ...common, marketCoinId: "0x40", marketCoinAmount: 2_000_000n }, slippageBps: 50 }),
      ];
      expect(prepared.every(p => p.quote.lpOut === 1000n && p.quote.inputSy === 1_000_000n)).toBe(true);
    }
  });

  test("the default gRPC transport resolves commands before reading probes", async () => {
    const restores: (() => void)[] = [];
    const resolved = new WeakSet<Transaction>();
    const build = spyOn(Transaction.prototype, "build").mockImplementation(async function(this: Transaction) {
      if (resolved.has(this)) return new Uint8Array();
      resolved.add(this);
      if (this.getData().gasData.budget == null) this.setGasBudget(10_000n);
      const data = this.getData();
      for (const command of data.commands) {
        if (command.$kind !== "MoveCall") continue;
        for (const arg of command.MoveCall.arguments) {
          if (arg.$kind === "Result") arg.Result += 1;
          if (arg.$kind === "NestedResult") arg.NestedResult[0] += 1;
        }
      }
      const prefix = new Transaction();
      prefix.moveCall({ target: "0x2::coin::zero", typeArguments: [config.syTypeTag] });
      const dataSpy = spyOn(this, "getData").mockReturnValue({ ...data, commands: [...prefix.getData().commands, ...data.commands] });
      restores.push(() => dataSpy.mockRestore());
      return new Uint8Array();
    });
    const transport = spyOn(getSuiGrpcClient("testnet"), "simulateTransaction").mockImplementation(async input => {
      const tx = input.transaction as Transaction;
      const output = simulate(tx);
      if (!output.success) throw new Error("Invalid fixture");
      return { $kind: "Transaction", Transaction: { status: { success: true } }, commandResults: output.commandResults } as never;
    });
    try {
      const result = await createFullLiquidityService({ config, network: "testnet", resolveSyIndex: () => 1n << 64n })
        .prepare({ mode: "keep-yt", funding: "sy", params, slippageBps: 50 });
      expect(result.quote.lpOut).toBe(1000n);
      expect(build).toHaveBeenCalledTimes(4);
      expect(transport.mock.calls.every(([input]) => input.checksEnabled === true)).toBe(true);
    } finally { restores.forEach(restore => restore()); build.mockRestore(); transport.mockRestore(); }
  });

  test.each([-1, 10000, 0.5, NaN])("rejects invalid slippage %s", async slippageBps => {
    const service = createFullLiquidityService({ config, resolveSyIndex: () => 1n << 64n, simulate: async tx => simulate(tx) });
    await expect(service.prepare({ mode: "keep-yt", funding: "sy", params, slippageBps })).rejects.toThrow("slippage");
  });
});
