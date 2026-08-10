import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import { getJitterAdapterManifest } from "../adapters/registry.js";
import { buildClaimCoinRewardTx } from "../coin-reward.js";
import { DEFAULT_DEMO_SY_INDEX, SUI_TYPE_TAG } from "../constants.js";
import { getDefaultJitterMarketConfig } from "../config.js";
import {
  createJitterTransactionService,
  type BuildAddLpFromSyTxParams,
  type BuildAddLpKeepYtTxParams,
  type BuildAddLpTxParams,
  type BuildBuyPtRouteTxParams,
  type BuildBuyPtTxParams,
  type BuildBuyYtTxParams,
  type BuildRemoveLpTxParams,
  type RedeemSyToUnderlyingTxParams,
  type BuildSellPtRouteTxParams,
  type BuildSellPtTxParams,
  type BuildSellYtForExactSyTxParams,
  type BuildSellYtTxParams,
  type EmptyRewardSettlementStrategy,
  type ProductTxRewardSettlementParams,
} from "../services/transaction-service.js";

const senderAddress =
  "0x00000000000000000000000000000000000000000000000000000000000000aa";

describe("JitterTransactionService", () => {
  test("exposes product transaction parameter model without breaking legacy builders", () => {
    const buyPtParams = {
      senderAddress,
      inputCoinId: "0xsy",
      inputAmount: 100n,
      minPtOut: 90n,
      positionId: "0xpy-position",
      deadlineMs: 4_102_444_800_000n,
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildBuyPtTxParams;

    const sellPtParams = {
      senderAddress,
      ptAmount: 90n,
      minSyOut: 80n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildSellPtTxParams;

    const buyYtParams = {
      senderAddress,
      inputCoinId: "0xsy",
      inputAmount: 100n,
      minYtOut: 20n,
      minSyOut: 1n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildBuyYtTxParams;

    const sellYtParams = {
      senderAddress,
      ytAmount: 20n,
      minSyOut: 80n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildSellYtTxParams;

    const sellYtForExactSyParams = {
      senderAddress,
      syAmountOut: 80n,
      maxYtIn: 25n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildSellYtForExactSyTxParams;

    const addLpParams = {
      senderAddress,
      inputCoinId: "0xsy",
      inputAmount: 100n,
      ptAmount: 50n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildAddLpTxParams;

    const addLpKeepYtParams = {
      senderAddress,
      inputCoinId: "0xsy",
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildAddLpKeepYtTxParams;

    const addLpFromSyParams = {
      senderAddress,
      inputCoinId: "0xsy",
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      minSyOut: 1n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildAddLpFromSyTxParams;

    const removeLpParams = {
      senderAddress,
      lpAmount: 20n,
      minSyOut: 10n,
      minPtOut: 8n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildRemoveLpTxParams;

    const redeemSyParams = {
      senderAddress,
      syCoinId: "0xsy",
      syAmount: 100n,
    } satisfies RedeemSyToUnderlyingTxParams;

    const buyPtRouteParams = {
      senderAddress,
      inputCoinId: "0xsy",
      inputAmount: 100n,
      orderIds: [1n, 2n],
      maxBookPriceRaw: 200n,
      minTotalPtOut: 90n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildBuyPtRouteTxParams;

    const sellPtRouteParams = {
      senderAddress,
      ptAmount: 90n,
      orderIds: [3n, 4n],
      minBookPriceRaw: 180n,
      minTotalSyOut: 80n,
      positionId: "0xpy-position",
      rewardSettlement: { strategy: "empty-vector" },
    } satisfies BuildSellPtRouteTxParams;

    const settlement = {
      strategy: "empty-vector",
    } satisfies EmptyRewardSettlementStrategy;

    const rewardParams = {
      rewardSettlement: settlement,
    } satisfies ProductTxRewardSettlementParams;

    const service = createJitterTransactionService({ config: getTestConfig() });

    expect(buyPtParams.inputCoinId).toBe("0xsy");
    expect(sellPtParams.ptAmount).toBe(90n);
    expect(buyYtParams.minYtOut).toBe(20n);
    expect(sellYtParams.ytAmount).toBe(20n);
    expect(sellYtForExactSyParams.syAmountOut).toBe(80n);
    expect(addLpParams.ptAmount).toBe(50n);
    expect(addLpKeepYtParams.syToMintHint).toBe(60n);
    expect(addLpFromSyParams.minSyOut).toBe(1n);
    expect(removeLpParams.lpAmount).toBe(20n);
    expect(redeemSyParams.syAmount).toBe(100n);
    expect(buyPtRouteParams.maxBookPriceRaw).toBe(200n);
    expect(sellPtRouteParams.minBookPriceRaw).toBe(180n);
    expect(rewardParams.rewardSettlement.strategy).toBe("empty-vector");
    expect(typeof service.buildBuyPtTx).toBe("function");
    expect(typeof service.buildSellPtTx).toBe("function");
    expect(typeof service.buildBuyPtRouteTx).toBe("function");
    expect(typeof service.buildSellPtRouteTx).toBe("function");
    expect(typeof service.buildBuyYtTx).toBe("function");
    expect(typeof service.buildSellYtTx).toBe("function");
    expect(typeof service.buildSellYtForExactSyTx).toBe("function");
    expect(typeof service.buildEnableReferralTx).toBe("function");
    expect(typeof service.buildAddLpTx).toBe("function");
    expect(typeof service.buildAddLpKeepYtTx).toBe("function");
    expect(typeof service.buildAddLpFromSyTx).toBe("function");
    expect(typeof service.buildRemoveLpTx).toBe("function");
    expect(typeof service.buildRedeemSyToUnderlyingTx).toBe("function");
    expect(typeof (service as Record<string, unknown>).buildRemoveLpKeepYtTx).toBe("undefined");
    expect(typeof service.buildSwapSyForPtTx).toBe("function");
  });

  test("builds PT product transactions against unified router entrypoints", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const buyTx = await service.buildBuyPtTx({
      senderAddress,
      inputCoinId: objectId("40"),
      inputAmount: 100n,
      minPtOut: 90n,
      positionId: objectId("41"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const sellTx = await service.buildSellPtTx({
      senderAddress,
      ptAmount: 90n,
      minSyOut: 80n,
      positionId: objectId("41"),
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectMoveCalls(buyTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "buy_pt" }),
    );
    expect(collectMoveCalls(sellTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "sell_pt" }),
    );
  });

  test("leaves gas estimation to wallets unless an override is provided", async () => {
    const params = {
      senderAddress,
      inputCoinId: objectId("40"),
      inputAmount: 100n,
      minPtOut: 90n,
      positionId: objectId("41"),
      rewardSettlement: { strategy: "empty-vector" as const },
    };
    const walletManagedTx = await createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    }).buildBuyPtTx(params);
    const overriddenTx = await createJitterTransactionService({
      config: getTestConfig(),
      gasBudget: 1_500_000_000n,
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    }).buildBuyPtTx(params);

    expect(walletManagedTx.getData().gasData.budget).toBeNull();
    expect(overriddenTx.getData().gasData.budget).toBe("1500000000");
  });

  test("merges multiple input coin objects before splitting trade amount", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const tx = await service.buildBuyPtTx({
      senderAddress,
      inputCoinId: objectId("40"),
      inputCoinIds: [objectId("40"), objectId("41")],
      inputAmount: 100n,
      minPtOut: 90n,
      positionId: objectId("42"),
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectCommandKinds(tx)).toContain("MergeCoins");
    expect(collectMoveCalls(tx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "buy_pt" }),
    );
  });

  test("auto-creates a PY position for first-time PT and YT buys", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const buyPtTx = await service.buildBuyPtTx({
      senderAddress,
      inputCoinId: objectId("40"),
      inputAmount: 100n,
      minPtOut: 90n,
      rewardSettlement: { strategy: "empty-vector" },
    });
    const buyYtTx = await service.buildBuyYtTx({
      senderAddress,
      inputCoinId: objectId("42"),
      inputAmount: 100n,
      minYtOut: 20n,
      minSyOut: 1n,
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectMoveCalls(buyPtTx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "router", function: "create_market_state_position" }),
        expect.objectContaining({ module: "router", function: "buy_pt" }),
        expect.objectContaining({
          module: "router",
          function: "transfer_market_state_position_after_reward_settlement",
        }),
      ]),
    );
    expect(
      findMoveCall(buyPtTx, "router", "transfer_market_state_position_after_reward_settlement")
        ?.arguments,
    ).toHaveLength(7);
    expect(collectMoveCalls(buyYtTx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "router", function: "create_market_state_position" }),
        expect.objectContaining({ module: "router", function: "buy_yt" }),
        expect.objectContaining({
          module: "router",
          function: "transfer_market_state_position_after_reward_settlement",
        }),
      ]),
    );
    expect(
      findMoveCall(buyYtTx, "router", "transfer_market_state_position_after_reward_settlement")
        ?.arguments,
    ).toHaveLength(7);
  });

  test("auto-creates and transfers a full position for first-time keep-YT LP deposits", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const keepYtTx = await service.buildAddLpKeepYtFromUnderlyingTx({
      senderAddress,
      underlyingCoinId: objectId("44"),
      underlyingAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectMoveCalls(keepYtTx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "router", function: "create_market_state_position" }),
        expect.objectContaining({ module: "router", function: "add_lp_keep_yt" }),
        expect.objectContaining({
          module: "router",
          function: "transfer_market_state_position_after_reward_settlement",
        }),
      ]),
    );
    expect(
      findMoveCall(keepYtTx, "router", "transfer_market_state_position_after_reward_settlement")
        ?.arguments,
    ).toHaveLength(7);
    expect(
      collectMoveCalls(keepYtTx).filter(
        (call) =>
          call.module === "reward_distributor"
          && call.function === "begin_transfer_operation",
      ),
    ).toHaveLength(2);
  });

  test("builds direct-underlying product transactions by minting SY before routing", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const buyPtTx = await service.buildBuyPtFromUnderlyingTx({
      senderAddress,
      underlyingCoinId: objectId("40"),
      underlyingAmount: 100n,
      minPtOut: 90n,
      positionId: objectId("41"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const buyYtTx = await service.buildBuyYtFromUnderlyingTx({
      senderAddress,
      underlyingCoinId: objectId("42"),
      underlyingAmount: 100n,
      minYtOut: 20n,
      minSyOut: 1n,
      positionId: objectId("43"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const keepYtTx = await service.buildAddLpKeepYtFromUnderlyingTx({
      senderAddress,
      underlyingCoinId: objectId("44"),
      underlyingAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      positionId: objectId("45"),
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectMoveCalls(buyPtTx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "sy", function: "mint_sy_exact_in_market_state" }),
        expect.objectContaining({ module: "demo_market_vault", function: "deposit" }),
        expect.objectContaining({ module: "router", function: "buy_pt" }),
      ]),
    );
    expect(collectMoveCalls(buyYtTx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "sy", function: "mint_sy_exact_in_market_state" }),
        expect.objectContaining({ module: "demo_market_vault", function: "deposit" }),
        expect.objectContaining({ module: "router", function: "buy_yt" }),
      ]),
    );
    expect(collectMoveCalls(keepYtTx)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: "sy", function: "mint_sy_exact_in_market_state" }),
        expect.objectContaining({ module: "demo_market_vault", function: "deposit" }),
        expect.objectContaining({ module: "router", function: "add_lp_keep_yt" }),
      ]),
    );
  });

  test("builds core gate settlements when a distributor is bound without rewarders", async () => {
    const service = createJitterTransactionService({
      config: getUnrewardedTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const tx = await service.buildAddLpFromSyTx({
      senderAddress,
      inputCoinId: objectId("40"),
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      minSyOut: 1n,
      positionId: objectId("41"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const calls = collectMoveCalls(tx);
    const beginCalls = calls.filter(
      (call) =>
        call.module === "reward_distributor"
        && call.function === "begin_scoped_operation_with_guard",
    );
    const finishCalls = calls.filter(
      (call) =>
        call.module === "reward_distributor"
        && call.function === "finish_operation",
    );

    // add_lp_from_sy needs pool + YT + LP pre-settlements and produces the
    // same three post-operations. No external rewarder is required for the
    // core one-shot gate protocol itself.
    expect(beginCalls).toHaveLength(3);
    expect(finishCalls).toHaveLength(6);
    expect(
      calls.some(
        (call) =>
          call.module === "liquidlink_points"
          || call.module === "coin_rewarder",
      ),
    ).toBeFalse();
  });

  test("sources SUI direct-underlying inputs with coinWithBalance so wallets can still select gas", async () => {
    const service = createJitterTransactionService({
      config: getScallopTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });
    const suiCoinId = objectId("40");

    const tx = await service.buildAddLpFromSyFromUnderlyingTx({
      senderAddress,
      underlyingCoinId: suiCoinId,
      underlyingAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      minSyOut: 1n,
      positionId: objectId("45"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const txData = stringifyTransactionData(tx);

    expect(collectCommandKinds(tx)).toContain("$Intent");
    expect(txData).toContain("CoinWithBalance");
    expect(txData).not.toContain(suiCoinId);
  });

  test("rejects PT orderbook hybrid routes while MarketState router keeps orderbook experimental", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    await expect(service.buildBuyPtRouteTx({
      senderAddress,
      inputCoinId: objectId("45"),
      inputAmount: 100n,
      orderIds: [1n, 2n],
      maxBookPriceRaw: 200n,
      minTotalPtOut: 90n,
      positionId: objectId("46"),
      rewardSettlement: { strategy: "empty-vector" },
    })).rejects.toThrow("Hybrid orderbook routes are experimental");
    await expect(service.buildSellPtRouteTx({
      senderAddress,
      ptAmount: 90n,
      orderIds: [3n, 4n],
      minBookPriceRaw: 180n,
      minTotalSyOut: 80n,
      positionId: objectId("46"),
      rewardSettlement: { strategy: "empty-vector" },
    })).rejects.toThrow("Hybrid orderbook routes are experimental");
  });

  test("builds YT product transactions against AMM router entrypoints", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const buyTx = await service.buildBuyYtTx({
      senderAddress,
      inputCoinId: objectId("50"),
      inputAmount: 100n,
      ytAmountOut: 21n,
      minYtOut: 20n,
      minSyOut: 1n,
      positionId: objectId("51"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const sellTx = await service.buildSellYtTx({
      senderAddress,
      ytAmount: 20n,
      minSyOut: 80n,
      positionId: objectId("51"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const exactSellTx = await service.buildSellYtForExactSyTx({
      senderAddress,
      syAmountOut: 80n,
      maxYtIn: 25n,
      positionId: objectId("51"),
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectMoveCalls(buyTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "buy_exact_yt" }),
    );
    expect(collectMoveCalls(sellTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "sell_yt" }),
    );
    expect(collectMoveCalls(exactSellTx)).toContainEqual(
      expect.objectContaining({
        module: "router",
        function: "sell_yt_for_exact_sy",
      }),
    );
  });

  test("rejects Buy YT exact-output bounds when minimum SY change exceeds input", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    await expect(service.buildBuyYtTx({
      senderAddress,
      inputCoinId: objectId("52"),
      inputAmount: 100n,
      ytAmountOut: 20n,
      minYtOut: 20n,
      minSyOut: 101n,
      positionId: objectId("53"),
      rewardSettlement: { strategy: "empty-vector" },
    })).rejects.toThrow("Minimum SY change exceeds the available SY input.");
  });

  test("settles Point and Coin rewarders on the same YT/LP operations before finish", async () => {
    const config = getRewardedTestConfig();
    const service = createJitterTransactionService({
      config,
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const buyYtTx = await service.buildBuyYtTx({
      senderAddress,
      inputCoinId: objectId("d0"),
      inputAmount: 100n,
      minYtOut: 20n,
      minSyOut: 1n,
      positionId: objectId("d1"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const addLpTx = await service.buildAddLpFromSyTx({
      senderAddress,
      inputCoinId: objectId("d2"),
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      minSyOut: 1n,
      positionId: objectId("d1"),
      rewardSettlement: { strategy: "empty-vector" },
    });

    assertRewarderSettledBeforeFinish(buyYtTx, "settle_yt_reward_operation", "settle_yt_position");
    assertRewarderSettledBeforeFinish(addLpTx, "settle_lp_reward_operation", "settle_lp_position");
  });

  test("builds YT and LP referral enrollment and uses both referral-aware settlements", async () => {
    const config = getReferralRewardedTestConfig();
    const service = createJitterTransactionService({
      config,
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });
    const pointConfigObjectId = config.liquidlink!.pointPrograms![0]!.pointConfigObjectId;
    const lpReferralRecordObjectId = objectId("d8");
    const ytReferralRecordObjectId = objectId("d9");

    const enableTx = await service.buildEnableReferralTx({
      senderAddress,
      positionId: objectId("d1"),
      pointConfigObjectId,
    });
    const addLpTx = await service.buildAddLpFromSyTx({
      senderAddress,
      inputCoinId: objectId("d2"),
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      minSyOut: 1n,
      positionId: objectId("d1"),
      rewardSettlement: {
        strategy: "empty-vector",
        lpReferralRecordObjectIds: {
          [pointConfigObjectId.toLowerCase()]: lpReferralRecordObjectId,
        },
        ytReferralRecordObjectIds: {
          [pointConfigObjectId.toLowerCase()]: ytReferralRecordObjectId,
        },
      },
    });

    expect(findMoveCall(enableTx, "liquidlink_points", "sync_py_position_with_points"))
      .toBeDefined();
    expect(findMoveCall(enableTx, "liquidlink_points", "create_yt_referral_record_with_points"))
      .toBeDefined();
    expect(findMoveCall(enableTx, "liquidlink_points", "create_lp_referral_record_with_points"))
      .toBeDefined();
    expect(findMoveCall(enableTx, "transfer", "public_share_object")).toBeDefined();
    const lpReferralSettles = collectMoveCalls(addLpTx).filter(
      (call) => call.module === "liquidlink_points"
        && call.function === "settle_lp_reward_operation_with_referral",
    );
    const ytReferralSettles = collectMoveCalls(addLpTx).filter(
      (call) => call.module === "liquidlink_points"
        && call.function === "settle_yt_reward_operation_with_referral",
    );
    const ytPolicies = collectMoveCalls(addLpTx).filter(
      (call) => call.module === "referral_policy"
        && call.function === "apply_yt_bonus_policy",
    );
    expect(lpReferralSettles).toHaveLength(2);
    expect(ytReferralSettles).toHaveLength(2);
    expect(ytPolicies).toHaveLength(2);
    expect(stringifyTransactionData(addLpTx)).toContain(lpReferralRecordObjectId.slice(2));
    expect(stringifyTransactionData(addLpTx)).toContain(ytReferralRecordObjectId.slice(2));
  });

  test("repairs partially enrolled referral scopes without recreating existing records", async () => {
    const config = getReferralRewardedTestConfig();
    const service = createJitterTransactionService({ config });
    const pointConfigObjectId = config.liquidlink!.pointPrograms![0]!.pointConfigObjectId;

    const ytOnlyTx = await service.buildEnableReferralTx({
      senderAddress,
      positionId: objectId("d1"),
      pointConfigObjectIds: [pointConfigObjectId],
      scopesByPointConfig: { [pointConfigObjectId]: ["yt"] },
    });
    const lpOnlyTx = await service.buildEnableReferralTx({
      senderAddress,
      positionId: objectId("d1"),
      pointConfigObjectIds: [pointConfigObjectId],
      scopesByPointConfig: { [pointConfigObjectId]: ["lp"] },
    });

    expect(findMoveCall(ytOnlyTx, "liquidlink_points", "sync_py_position_with_points"))
      .toBeDefined();
    expect(findMoveCall(ytOnlyTx, "liquidlink_points", "create_yt_referral_record_with_points"))
      .toBeDefined();
    expect(findMoveCall(ytOnlyTx, "liquidlink_points", "create_lp_referral_record_with_points"))
      .toBeUndefined();

    expect(findMoveCall(lpOnlyTx, "liquidlink_points", "sync_py_position_with_points"))
      .toBeUndefined();
    expect(findMoveCall(lpOnlyTx, "liquidlink_points", "create_yt_referral_record_with_points"))
      .toBeUndefined();
    expect(findMoveCall(lpOnlyTx, "liquidlink_points", "create_lp_referral_record_with_points"))
      .toBeDefined();
  });

  test("settles Point rewarders before standalone Coin reward claims", () => {
    const config = getRewardedTestConfig();
    const positionId = objectId("d1");
    const ytClaimTx = buildClaimCoinRewardTx(
      config,
      positionId,
      senderAddress,
      "yt",
    );
    const lpClaimTx = buildClaimCoinRewardTx(
      config,
      positionId,
      senderAddress,
      "lp",
    );

    assertMoveCallOrder(
      ytClaimTx,
      ["liquidlink_points", "settle_yt_reward_operation"],
      ["coin_rewarder", "claim_yt_position"],
      ["reward_distributor", "finish_operation"],
    );
    assertMoveCallOrder(
      lpClaimTx,
      ["liquidlink_points", "settle_lp_reward_operation"],
      ["coin_rewarder", "claim_lp_position"],
      ["reward_distributor", "finish_operation"],
    );
  });

  test("builds LP product transactions and does not expose remove LP keep-YT semantics", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const addTx = await service.buildAddLpTx({
      senderAddress,
      inputCoinId: objectId("60"),
      inputAmount: 100n,
      ptAmount: 50n,
      positionId: objectId("61"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const keepYtTx = await service.buildAddLpKeepYtTx({
      senderAddress,
      inputCoinId: objectId("62"),
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      positionId: objectId("61"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const fromSyTx = await service.buildAddLpFromSyTx({
      senderAddress,
      inputCoinId: objectId("63"),
      inputAmount: 100n,
      syToMintHint: 60n,
      minLpOut: 20n,
      minSyOut: 1n,
      positionId: objectId("61"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const removeTx = await service.buildRemoveLpTx({
      senderAddress,
      lpAmount: 20n,
      minSyOut: 10n,
      minPtOut: 8n,
      positionId: objectId("61"),
      rewardSettlement: { strategy: "empty-vector" },
    });
    const activeZapTx = await service.buildRemoveLpToSyTx({
      senderAddress,
      lpAmount: 20n,
      minSyOut: 10n,
      minPtOut: 8n,
      minTotalSyOut: 17n,
      positionId: objectId("61"),
      route: "active-swap",
      rewardSettlement: { strategy: "empty-vector" },
    });
    const settledZapTx = await service.buildRemoveLpToSyTx({
      senderAddress,
      lpAmount: 20n,
      minSyOut: 10n,
      minPtOut: 8n,
      minTotalSyOut: 16n,
      positionId: objectId("61"),
      route: "settled-redeem",
      rewardSettlement: { strategy: "empty-vector" },
    });
    const directSyTx = await service.buildRemoveLpToSyTx({
      senderAddress,
      lpAmount: 1n,
      minSyOut: 1n,
      minPtOut: 0n,
      minTotalSyOut: 1n,
      positionId: objectId("61"),
      route: "direct-sy",
      rewardSettlement: { strategy: "empty-vector" },
    });

    expect(collectMoveCalls(addTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "add_lp" }),
    );
    expect(collectMoveCalls(keepYtTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "add_lp_keep_yt" }),
    );
    expect(collectMoveCalls(fromSyTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "add_lp_from_sy" }),
    );
    expect(collectMoveCalls(removeTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "remove_lp" }),
    );
    expect(collectMoveCalls(removeTx)).not.toContainEqual(
      expect.objectContaining({ module: "router", function: "remove_lp_keep_yt" }),
    );
    expect(collectMoveCalls(activeZapTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "sell_pt" }),
    );
    expect(collectMoveCalls(activeZapTx)).toContainEqual(
      expect.objectContaining({ module: "router", function: "assert_coin_min_value" }),
    );
    expect(collectMoveCalls(settledZapTx)).toContainEqual(
      expect.objectContaining({
        module: "router",
        function: "redeem_market_state_after_expiry",
      }),
    );
    expect(collectMoveCalls(settledZapTx)).not.toContainEqual(
      expect.objectContaining({ module: "router", function: "sell_pt" }),
    );
    expect(collectMoveCalls(directSyTx)).not.toContainEqual(
      expect.objectContaining({ module: "router", function: "sell_pt" }),
    );
    expect(collectMoveCalls(directSyTx)).not.toContainEqual(
      expect.objectContaining({
        module: "router",
        function: "redeem_market_state_after_expiry",
      }),
    );
    expect(findMoveCall(addTx, "router", "add_lp")?.arguments).toHaveLength(12);
    expect(findMoveCall(keepYtTx, "router", "add_lp_keep_yt")?.arguments).toHaveLength(13);
    expect(findMoveCall(fromSyTx, "router", "add_lp_from_sy")?.arguments).toHaveLength(14);
  });

  test("builds core router and SY transactions as Transaction blocks", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    await expect(
      service.buildDepositToSyTx({
        underlyingCoinId: "0xunderlying",
        underlyingAmount: 100n,
        senderAddress,
      }),
    ).resolves.toBeInstanceOf(Transaction);
    await expect(
      service.buildRedeemSyToUnderlyingTx({
        syCoinId: "0xsy",
        syAmount: 100n,
        senderAddress,
      }),
    ).resolves.toBeInstanceOf(Transaction);
    await expect(
      service.buildSwapSyForPtTx({
        syCoinId: "0xsy",
        syAmount: 100n,
        minPtOut: 90n,
        pyPositionId: "0xpy-position",
        senderAddress,
      }),
    ).resolves.toBeInstanceOf(Transaction);
    const claimTx = await service.buildClaimYtInterestTx({
      pyPositionId: objectId("32"),
      senderAddress,
    });
    expect(claimTx).toBeInstanceOf(Transaction);
    expect(collectMoveCalls(claimTx)).toContainEqual(
      expect.objectContaining({ module: "option", function: "some" }),
    );
    expect(collectMoveCalls(claimTx)).toContainEqual(
      expect.objectContaining({
        module: "router",
        function: "claim_market_state_yt_interest",
      }),
    );
  });

  test("uses adapter manifest for scallop price info and routes underlying through Scallop mint", async () => {
    const config = getScallopTestConfig();
    const service = createJitterTransactionService({
      config,
      adapter: getJitterAdapterManifest(config),
      resolveSyIndex: async () => DEFAULT_DEMO_SY_INDEX,
    });

    const depositTx = await service.buildDepositToSyTx({
      underlyingCoinId: objectId("30"),
      underlyingAmount: 100n,
      senderAddress,
    });
    const depositCalls = collectMoveCalls(depositTx);

    expect(depositCalls).toContainEqual(
      expect.objectContaining({ module: "mint", function: "mint" }),
    );
    expect(depositCalls).toContainEqual(
      expect.objectContaining({ module: "scallop_market_vault", function: "deposit" }),
    );

    const redeemTx = await service.buildRedeemSyToUnderlyingTx({
      syCoinId: objectId("33"),
      syCoinIds: [objectId("33"), objectId("34")],
      syAmount: 100n,
      senderAddress,
    });
    const redeemCalls = collectMoveCalls(redeemTx);

    expect(redeemCalls).toContainEqual(
      expect.objectContaining({ module: "scallop_market_vault", function: "redeem" }),
    );
    expect(redeemCalls).toContainEqual(
      expect.objectContaining({ module: "redeem", function: "redeem" }),
    );

    const queueTx = await service.buildQueueRedeemSyTx({
      syCoinId: objectId("35"),
      syCoinIds: [objectId("35"), objectId("36")],
      syAmount: 100n,
      senderAddress,
    });
    const queueCalls = collectMoveCalls(queueTx);

    expect(queueCalls).toContainEqual(
      expect.objectContaining({ module: "scallop_market_vault", function: "queue_redeem" }),
    );

    const cancelQueuedTx = await service.buildCancelQueuedRedeemSyTx({
      requestId: objectId("37"),
      senderAddress,
    });
    const cancelQueuedCalls = collectMoveCalls(cancelQueuedTx);

    expect(cancelQueuedCalls).toContainEqual(
      expect.objectContaining({
        module: "scallop_market_vault",
        function: "cancel_queued_redeem",
      }),
    );

    const tx = await service.buildSwapSyForPtTx({
      syCoinId: objectId("31"),
      syAmount: 100n,
      minPtOut: 90n,
      pyPositionId: objectId("32"),
      senderAddress,
    });
    const calls = collectMoveCalls(tx);

    expect(calls).toContainEqual(
      expect.objectContaining({ module: "scallop_price_ticket", function: "quote" }),
    );
    expect(calls).not.toContainEqual(
      expect.objectContaining({ module: "demo_price_ticket", function: "quote" }),
    );
  });

  test("builds orderbook action transactions as Transaction blocks", async () => {
    const service = createJitterTransactionService({
      config: getTestConfig(),
    });

    expect(
      service.buildPlaceBidOrderTx({
        syCoinId: "0xsy",
        syAmount: 100n,
        priceRaw: 2n,
        minPtAmount: 50n,
        senderAddress,
      }),
    ).toBeInstanceOf(Transaction);
    expect(
      service.buildClaimOrderTx({
        orderId: 1n,
        senderAddress,
        asset: "pt",
      }),
    ).toBeInstanceOf(Transaction);
    expect(
      service.buildCancelOrderTx({
        orderId: 2n,
        senderAddress,
        asset: "yt",
      }),
    ).toBeInstanceOf(Transaction);
  });
});

function getTestConfig() {
  const config = getDefaultJitterMarketConfig("testnet");
  if (!config) throw new Error("missing default SDK testnet market config");
  return {
    ...config,
    orderbookObjectId: config.orderbookObjectId ?? objectId("ab"),
    ytOrderbookObjectId: config.ytOrderbookObjectId ?? objectId("ac"),
  };
}

function getScallopTestConfig() {
  return {
    ...getTestConfig(),
    underlyingTypeTag: SUI_TYPE_TAG,
    demoMarketVaultObjectId: "",
    scallopAdapterPackageId: objectId("20"),
    scallopProtocolPackageId: objectId("24"),
    scallopMarketVaultObjectId: objectId("21"),
    scallopMarketObjectId: objectId("22"),
    scallopVersionObjectId: objectId("23"),
    scallopMarketCoinTypeTag: `${objectId("24")}::reserve::MarketCoin<0x2::sui::SUI>`,
  };
}

function getUnrewardedTestConfig() {
  const { coinReward: _coinReward, liquidlink: _liquidlink, ...config } = getTestConfig();
  return config;
}

function getRewardedTestConfig() {
  return {
    ...getTestConfig(),
    liquidlink: {
      enabled: true,
      liquidlinkPackageId: objectId("bf"),
      liquidlinkGlobalConfigObjectId: objectId("c0"),
      projectObjectId: objectId("cf"),
      pointConfigObjectId: objectId("c1"),
      scoreboardObjectId: objectId("c2"),
      lpPointStateObjectId: objectId("c3"),
    },
    coinReward: {
      rewardCoinTypeTag: `${objectId("c4")}::qa_reward::QA_REWARD`,
      ytRewarderObjectId: objectId("c5"),
      lpRewarderObjectId: objectId("c6"),
    },
  };
}

function getReferralRewardedTestConfig() {
  const config = getRewardedTestConfig();
  const pointConfigObjectId = config.liquidlink.pointConfigObjectId;
  return {
    ...config,
    liquidlink: {
      ...config.liquidlink,
      referralPackageId: objectId("c7"),
      pointPrograms: [{
        label: "Jitter points",
        protocol: "jitter",
        projectObjectId: config.liquidlink.projectObjectId,
        scoreboardObjectId: config.liquidlink.scoreboardObjectId,
        pointConfigObjectId,
        lpPointStateObjectId: config.liquidlink.lpPointStateObjectId,
        scopes: ["yt", "lp", "pool"] as Array<"yt" | "lp" | "pool">,
        referral: {
          policyStateObjectId: objectId("c8"),
          referralTableObjectId: objectId("c9"),
        },
      }],
    },
  };
}

function objectId(suffix: string): string {
  return `0x${suffix.padStart(64, "0")}`;
}

function collectMoveCalls(tx: Transaction) {
  return tx.getData().commands.flatMap((command) => {
    if (command.$kind !== "MoveCall") return [];
    return [command.MoveCall];
  });
}

function collectCommandKinds(tx: Transaction) {
  return tx.getData().commands.map((command) => command.$kind);
}

function stringifyTransactionData(tx: Transaction): string {
  return JSON.stringify(tx.getData(), (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}

function findMoveCall(tx: Transaction, module: string, fn: string) {
  return collectMoveCalls(tx).find(
    (call) => call.module === module && call.function === fn,
  );
}

function assertRewarderSettledBeforeFinish(
  tx: Transaction,
  pointFunction: string,
  coinFunction: string,
): void {
  const calls = collectMoveCalls(tx);
  const coinIndexes = calls.flatMap((call, index) =>
    call.module === "coin_rewarder" && call.function === coinFunction ? [index] : [],
  );
  expect(coinIndexes.length).toBeGreaterThan(0);

  for (const coinIndex of coinIndexes) {
    let pointIndex = -1;
    for (let index = 0; index < coinIndex; index += 1) {
      const call = calls[index];
      if (
        call.module === "liquidlink_points"
        && call.function === pointFunction
      ) {
        pointIndex = index;
      }
    }
    const finishIndex = calls.findIndex(
      (call, index) =>
        index > coinIndex
        && call.module === "reward_distributor"
        && call.function === "finish_operation",
    );
    expect(pointIndex).toBeGreaterThanOrEqual(0);
    expect(finishIndex).toBeGreaterThan(coinIndex);
  }
}

function assertMoveCallOrder(
  tx: Transaction,
  first: readonly [module: string, fn: string],
  second: readonly [module: string, fn: string],
  third: readonly [module: string, fn: string],
): void {
  const calls = collectMoveCalls(tx);
  const indexes = [first, second, third].map(([module, fn]) =>
    calls.findIndex((call) => call.module === module && call.function === fn),
  );
  expect(indexes[0]).toBeGreaterThanOrEqual(0);
  expect(indexes[1]).toBeGreaterThan(indexes[0]);
  expect(indexes[2]).toBeGreaterThan(indexes[1]);
}
