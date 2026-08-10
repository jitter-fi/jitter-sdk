import {
  Transaction,
  type TransactionArgument,
  type TransactionObjectArgument,
} from "@mysten/sui/transactions";

import { getJitterAdapterManifest } from "../adapters/registry.js";
import type { JitterAdapterManifest } from "../adapters/types.js";

import { DEFAULT_DEMO_SY_INDEX, FP64_ONE, SUI_TYPE_TAG } from "../constants.js";
import {
  addCancelOrder,
  addClaimOrder,
  addPlaceBidOrder,
  type OrderbookAsset,
} from "../orderbook.js";
import { addClaimYtInterest, addCreatePosition, addCreatePyPosition } from "../py.js";
import { addSwapSyForPt } from "../pool.js";
import type { RemoveLpToSyRoute } from "../simulation.js";
import {
  addCreateLpReferralRecordWithLiquidlinkPoints,
  addCreateYtReferralRecordWithLiquidlinkPoints,
  addSyncPyPositionWithLiquidlinkPoints,
  addSettleLpRewardOperationWithLiquidlinkPoints,
  addSettlePoolRewardOperationWithLiquidlinkPoints,
  addSettleYtRewardOperationWithLiquidlinkPoints,
} from "../liquidlink-points.js";
import {
  addSettleCoinRewardOperation,
  hasCoinRewardConfig,
} from "../coin-reward.js";
import { addBurnSyExactIn, addMintSyExactIn, addScallopDeposit } from "../sy.js";
import type { JitterMarketConfig } from "../types.js";
import type { GrpcNetworkKind } from "../rpc.js";

export type CreateJitterTransactionServiceOptions = {
  config: JitterMarketConfig;
  adapter?: JitterAdapterManifest;
  gasBudget?: bigint;
  resolveSyIndex?: () => Promise<bigint> | bigint;
  network?: GrpcNetworkKind;
};

export type SwapSyForPtTxParams = {
  syCoinId: string;
  syAmount: bigint;
  minPtOut: bigint;
  pyPositionId: string;
  senderAddress: string;
  syIndex?: bigint;
};

export type DepositToSyTxParams = {
  underlyingCoinId: string;
  underlyingAmount: bigint;
  senderAddress: string;
  syIndex?: bigint;
};

export type RedeemSyToUnderlyingTxParams = {
  syCoinId: string;
  syCoinIds?: readonly string[];
  syAmount: bigint;
  senderAddress: string;
  syIndex?: bigint;
};

export type QueueRedeemSyTxParams = {
  syCoinId: string;
  syCoinIds?: readonly string[];
  syAmount: bigint;
  minMarketCoinOut?: bigint;
  senderAddress: string;
};

export type CancelQueuedRedeemSyTxParams = {
  requestId: string;
  senderAddress: string;
};

export type ClaimYtInterestTxParams = {
  pyPositionId: string;
  senderAddress: string;
  syIndex?: bigint;
};

export type PlaceBidOrderTxParams = {
  syCoinId: string;
  syAmount: bigint;
  priceRaw: bigint;
  minPtAmount: bigint;
  senderAddress: string;
  expiryMs?: bigint;
  asset?: OrderbookAsset;
};

export type OrderActionTxParams = {
  orderId: bigint;
  senderAddress: string;
  asset?: OrderbookAsset;
};

export type EmptyRewardSettlementStrategy = {
  strategy: "empty-vector";
  /** PointConfig id -> shared LpReferralRecord id for this position. */
  lpReferralRecordObjectIds?: Readonly<Record<string, string>>;
  /** PointConfig id -> shared YtReferralRecord id for this position. */
  ytReferralRecordObjectIds?: Readonly<Record<string, string>>;
};

export type ProductTxRewardSettlementParams = {
  /**
   * The SDK owns settlement composition for the market's bound RewardDistributor.
   * `empty-vector` means the caller is not injecting external settlements; it does
   * not disable the core pool/YT/LP gate settlements required by MarketState.
   */
  rewardSettlement: EmptyRewardSettlementStrategy;
};

export type BuildBuyPtTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  inputCoinId: string;
  inputCoinIds?: readonly string[];
  inputAmount: bigint;
  minPtOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildBuyPtFromUnderlyingTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  underlyingCoinId?: string;
  underlyingCoinIds?: readonly string[];
  underlyingAmount: bigint;
  minPtOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildBuyPtFromMarketCoinTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  marketCoinId?: string;
  marketCoinIds?: readonly string[];
  marketCoinAmount: bigint;
  minPtOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildSellPtTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  ptAmount: bigint;
  minSyOut: bigint;
  positionId: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildSellPtToUnderlyingTxParams = BuildSellPtTxParams;

export type BuildBuyPtRouteTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  inputCoinId: string;
  inputCoinIds?: readonly string[];
  inputAmount: bigint;
  orderIds: Array<bigint | number | string>;
  maxBookPriceRaw: bigint;
  minTotalPtOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildSellPtRouteTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  ptAmount: bigint;
  orderIds: Array<bigint | number | string>;
  minBookPriceRaw: bigint;
  minTotalSyOut: bigint;
  positionId: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildBuyYtTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  inputCoinId: string;
  inputCoinIds?: readonly string[];
  inputAmount: bigint;
  ytAmountOut?: bigint;
  minYtOut: bigint;
  minSyOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildBuyYtFromUnderlyingTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  underlyingCoinId?: string;
  underlyingCoinIds?: readonly string[];
  underlyingAmount: bigint;
  syAmountIn?: bigint;
  ytAmountOut?: bigint;
  minYtOut: bigint;
  minSyOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildBuyYtFromMarketCoinTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  marketCoinId?: string;
  marketCoinIds?: readonly string[];
  marketCoinAmount: bigint;
  syAmountIn?: bigint;
  ytAmountOut?: bigint;
  minYtOut: bigint;
  minSyOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildSellYtTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  ytAmount: bigint;
  minSyOut: bigint;
  positionId: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildSellYtToUnderlyingTxParams = BuildSellYtTxParams;

export type BuildSellYtForExactSyTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  syAmountOut: bigint;
  maxYtIn: bigint;
  positionId: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildAddLpTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  inputCoinId: string;
  inputCoinIds?: readonly string[];
  inputAmount: bigint;
  ptAmount: bigint;
  positionId: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildAddLpKeepYtTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  inputCoinId: string;
  inputCoinIds?: readonly string[];
  inputAmount: bigint;
  syToMintHint: bigint;
  minLpOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildAddLpKeepYtFromUnderlyingTxParams =
  ProductTxRewardSettlementParams & {
    senderAddress: string;
    underlyingCoinId?: string;
    underlyingCoinIds?: readonly string[];
    underlyingAmount: bigint;
    syToMintHint: bigint;
    minLpOut: bigint;
    positionId?: string;
    deadlineMs?: bigint;
    syIndex?: bigint;
  };

export type BuildAddLpKeepYtFromMarketCoinTxParams =
  ProductTxRewardSettlementParams & {
    senderAddress: string;
    marketCoinId?: string;
    marketCoinIds?: readonly string[];
    marketCoinAmount: bigint;
    syToMintHint: bigint;
    minLpOut: bigint;
    positionId?: string;
    deadlineMs?: bigint;
    syIndex?: bigint;
  };

export type BuildAddLpFromSyTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  inputCoinId: string;
  inputCoinIds?: readonly string[];
  inputAmount: bigint;
  syToMintHint: bigint;
  minLpOut: bigint;
  minSyOut: bigint;
  positionId?: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
};

export type BuildAddLpFromSyFromUnderlyingTxParams =
  ProductTxRewardSettlementParams & {
    senderAddress: string;
    underlyingCoinId?: string;
    underlyingCoinIds?: readonly string[];
    underlyingAmount: bigint;
    syToMintHint: bigint;
    minLpOut: bigint;
    minSyOut: bigint;
    positionId?: string;
    deadlineMs?: bigint;
    syIndex?: bigint;
  };

export type BuildAddLpFromSyFromMarketCoinTxParams =
  ProductTxRewardSettlementParams & {
    senderAddress: string;
    marketCoinId?: string;
    marketCoinIds?: readonly string[];
    marketCoinAmount: bigint;
    syToMintHint: bigint;
    minLpOut: bigint;
    minSyOut: bigint;
    positionId?: string;
    deadlineMs?: bigint;
    syIndex?: bigint;
  };

export type BuildRemoveLpTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  lpAmount: bigint;
  minSyOut: bigint;
  minPtOut: bigint;
  positionId: string;
  deadlineMs?: bigint;
};

export type BuildRemoveLpToSyTxParams = ProductTxRewardSettlementParams & {
  senderAddress: string;
  lpAmount: bigint;
  minSyOut: bigint;
  minPtOut: bigint;
  minTotalSyOut: bigint;
  positionId: string;
  deadlineMs?: bigint;
  syIndex?: bigint;
  route: Extract<
    RemoveLpToSyRoute,
    "active-swap" | "settled-redeem" | "direct-sy"
  >;
};

export type BuildRemoveLpToUnderlyingTxParams = BuildRemoveLpToSyTxParams;

export type BuildEnableReferralTxParams = {
  senderAddress: string;
  positionId: string;
  pointConfigObjectId?: string;
  pointConfigObjectIds?: readonly string[];
  scopesByPointConfig?: Readonly<
    Record<string, readonly ("yt" | "lp")[]>
  >;
};

export type JitterTransactionService = {
  buildEnableReferralTx(params: BuildEnableReferralTxParams): Promise<Transaction>;
  buildBuyPtTx(params: BuildBuyPtTxParams): Promise<Transaction>;
  buildBuyPtFromUnderlyingTx(
    params: BuildBuyPtFromUnderlyingTxParams,
  ): Promise<Transaction>;
  buildBuyPtFromMarketCoinTx(
    params: BuildBuyPtFromMarketCoinTxParams,
  ): Promise<Transaction>;
  buildSellPtTx(params: BuildSellPtTxParams): Promise<Transaction>;
  buildSellPtToUnderlyingTx(params: BuildSellPtToUnderlyingTxParams): Promise<Transaction>;
  buildBuyPtRouteTx(params: BuildBuyPtRouteTxParams): Promise<Transaction>;
  buildSellPtRouteTx(params: BuildSellPtRouteTxParams): Promise<Transaction>;
  buildBuyYtTx(params: BuildBuyYtTxParams): Promise<Transaction>;
  buildBuyYtFromUnderlyingTx(
    params: BuildBuyYtFromUnderlyingTxParams,
  ): Promise<Transaction>;
  buildBuyYtFromMarketCoinTx(
    params: BuildBuyYtFromMarketCoinTxParams,
  ): Promise<Transaction>;
  buildSellYtTx(params: BuildSellYtTxParams): Promise<Transaction>;
  buildSellYtForExactSyTx(
    params: BuildSellYtForExactSyTxParams,
  ): Promise<Transaction>;
  buildSellYtToUnderlyingTx(params: BuildSellYtToUnderlyingTxParams): Promise<Transaction>;
  buildAddLpTx(params: BuildAddLpTxParams): Promise<Transaction>;
  buildAddLpKeepYtTx(params: BuildAddLpKeepYtTxParams): Promise<Transaction>;
  buildAddLpKeepYtFromUnderlyingTx(
    params: BuildAddLpKeepYtFromUnderlyingTxParams,
  ): Promise<Transaction>;
  buildAddLpKeepYtFromMarketCoinTx(
    params: BuildAddLpKeepYtFromMarketCoinTxParams,
  ): Promise<Transaction>;
  buildAddLpFromSyTx(params: BuildAddLpFromSyTxParams): Promise<Transaction>;
  buildAddLpFromSyFromUnderlyingTx(
    params: BuildAddLpFromSyFromUnderlyingTxParams,
  ): Promise<Transaction>;
  buildAddLpFromSyFromMarketCoinTx(
    params: BuildAddLpFromSyFromMarketCoinTxParams,
  ): Promise<Transaction>;
  buildRemoveLpTx(params: BuildRemoveLpTxParams): Promise<Transaction>;
  buildRemoveLpToSyTx(params: BuildRemoveLpToSyTxParams): Promise<Transaction>;
  buildRemoveLpToUnderlyingTx(params: BuildRemoveLpToUnderlyingTxParams): Promise<Transaction>;
  buildDepositToSyTx(params: DepositToSyTxParams): Promise<Transaction>;
  buildRedeemSyToUnderlyingTx(params: RedeemSyToUnderlyingTxParams): Promise<Transaction>;
  buildQueueRedeemSyTx(params: QueueRedeemSyTxParams): Promise<Transaction>;
  buildCancelQueuedRedeemSyTx(
    params: CancelQueuedRedeemSyTxParams,
  ): Promise<Transaction>;
  buildSwapSyForPtTx(params: SwapSyForPtTxParams): Promise<Transaction>;
  buildClaimYtInterestTx(params: ClaimYtInterestTxParams): Promise<Transaction>;
  buildPlaceBidOrderTx(params: PlaceBidOrderTxParams): Transaction;
  buildClaimOrderTx(params: OrderActionTxParams): Transaction;
  buildCancelOrderTx(params: OrderActionTxParams): Transaction;
};

export function createJitterTransactionService(
  options: CreateJitterTransactionServiceOptions,
): JitterTransactionService {
  const adapter = options.adapter ?? getJitterAdapterManifest(options.config);
  return {
    async buildEnableReferralTx(
      params: BuildEnableReferralTxParams,
    ): Promise<Transaction> {
      const referralPackageId = options.config.liquidlink?.referralPackageId;
      if (!referralPackageId) {
        throw new Error("Referral requires liquidlink.referralPackageId in market config.");
      }
      const pointConfigObjectIds = params.pointConfigObjectIds
        ?? (params.pointConfigObjectId ? [params.pointConfigObjectId] : []);
      if (pointConfigObjectIds.length === 0) {
        throw new Error("Referral requires at least one PointConfig object id.");
      }
      const tx = newTransaction(options, params.senderAddress);
      const configuredPrograms = options.config.liquidlink?.pointPrograms ?? [];
      const selectedPrograms = pointConfigObjectIds.map((pointConfigObjectId) => {
        const program = configuredPrograms.find(
          (candidate) => candidate.pointConfigObjectId.toLowerCase() === pointConfigObjectId.toLowerCase(),
        );
        const configuredScopes = program?.scopes
          ?? (program?.lpPointStateObjectId ? ["yt", "lp", "pool"] as const : ["yt"] as const);
        const requestedScopes = params.scopesByPointConfig?.[pointConfigObjectId]
          ?? params.scopesByPointConfig?.[pointConfigObjectId.toLowerCase()];
        const scopes = requestedScopes ?? configuredScopes.filter(
          (scope): scope is "yt" | "lp" => scope === "yt" || scope === "lp",
        );
        if (scopes.length === 0) {
          throw new Error(`Referral requires a YT or LP scope for PointConfig ${pointConfigObjectId}.`);
        }
        for (const scope of scopes) {
          if (!configuredScopes.includes(scope)) {
            throw new Error(
              `Referral scope ${scope} is not configured for PointConfig ${pointConfigObjectId}.`,
            );
          }
        }
        return { pointConfigObjectId, scopes };
      });
      if (selectedPrograms.some((program) => program.scopes.includes("yt"))) {
        // Materialize the pre-referral owner accrual first. The newly created
        // referral record starts at this accumulator and cannot claim history.
        addSyncPyPositionWithLiquidlinkPoints(
          tx,
          options.config,
          params.positionId,
          {},
          selectedPrograms
            .filter((program) => program.scopes.includes("yt"))
            .map((program) => program.pointConfigObjectId),
        );
      }
      for (const pointConfigObjectId of pointConfigObjectIds) {
        const program = selectedPrograms.find(
          (candidate) => candidate.pointConfigObjectId === pointConfigObjectId,
        )!;
        if (program.scopes.includes("yt")) {
          const record = addCreateYtReferralRecordWithLiquidlinkPoints(
            tx,
            options.config,
            pointConfigObjectId,
            params.positionId,
          );
          tx.moveCall({
            target: "0x2::transfer::public_share_object",
            typeArguments: [`${referralPackageId}::referral_policy::YtReferralRecord`],
            arguments: [record],
          });
        }
        if (program.scopes.includes("lp")) {
          const record = addCreateLpReferralRecordWithLiquidlinkPoints(
            tx,
            options.config,
            pointConfigObjectId,
            params.positionId,
          );
          tx.moveCall({
            target: "0x2::transfer::public_share_object",
            typeArguments: [`${referralPackageId}::referral_policy::LpReferralRecord`],
            arguments: [record],
          });
        }
      }
      return tx;
    },

    async buildBuyPtTx(params: BuildBuyPtTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.inputCoinId,
        coinIds: params.inputCoinIds,
        amount: params.inputAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addBuyPt(tx, options.config, {
        syCoin,
        minPtOut: params.minPtOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL]);
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildBuyPtFromUnderlyingTx(
      params: BuildBuyPtFromUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingDeposit(adapter, "buildBuyPtFromUnderlyingTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromUnderlyingExactIn(
        tx,
        options.config,
        adapter,
        {
          underlyingCoinId: params.underlyingCoinId,
          underlyingCoinIds: params.underlyingCoinIds,
          underlyingAmount: params.underlyingAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addBuyPt(tx, options.config, {
        syCoin,
        minPtOut: params.minPtOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL]);
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildBuyPtFromMarketCoinTx(
      params: BuildBuyPtFromMarketCoinTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertScallopMarketCoinDeposit(options.config, adapter, "buildBuyPtFromMarketCoinTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromScallopMarketCoinExactIn(
        tx,
        options.config,
        adapter,
        {
          marketCoinId: params.marketCoinId,
          marketCoinIds: params.marketCoinIds,
          marketCoinAmount: params.marketCoinAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addBuyPt(tx, options.config, {
        syCoin,
        minPtOut: params.minPtOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL]);
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildSellPtTx(params: BuildSellPtTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syCoin, postOps] = addSellPt(tx, options.config, {
        ptAmount: params.ptAmount,
        minSyOut: params.minSyOut,
        positionId: params.positionId,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL]);
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildSellPtToUnderlyingTx(
      params: BuildSellPtToUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingRedeem(adapter, "buildSellPtToUnderlyingTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syCoin, postOps] = addSellPt(tx, options.config, {
        ptAmount: params.ptAmount,
        minSyOut: params.minSyOut,
        positionId: params.positionId,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL]);
      const underlyingCoin = addRedeemSyCoinToUnderlying(
        tx,
        options.config,
        adapter,
        syCoin,
        params.minSyOut,
        syIndex,
      );
      tx.transferObjects([underlyingCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildBuyPtRouteTx(params: BuildBuyPtRouteTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.inputCoinId,
        coinIds: params.inputCoinIds,
        amount: params.inputAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syChange, postOps] = addBuyPtRoute(tx, options.config, {
        syCoin,
        orderIds: params.orderIds,
        maxBookPriceRaw: params.maxBookPriceRaw,
        minTotalPtOut: params.minTotalPtOut,
        position: position.argument,
        priceInfo,
      });
      destroyEmptyRewardOperations(tx, options.config, postOps);
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildSellPtRouteTx(params: BuildSellPtRouteTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syCoin, postOps] = addSellPtRoute(tx, options.config, {
        ptAmount: params.ptAmount,
        orderIds: params.orderIds,
        minBookPriceRaw: params.minBookPriceRaw,
        minTotalSyOut: params.minTotalSyOut,
        positionId: params.positionId,
        priceInfo,
      });
      destroyEmptyRewardOperations(tx, options.config, postOps);
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildBuyYtTx(params: BuildBuyYtTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.inputCoinId,
        coinIds: params.inputCoinIds,
        amount: params.inputAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addBuyYt(tx, options.config, {
        syCoin,
        ytAmountOut: params.ytAmountOut,
        minYtOut: params.minYtOut,
        minSyOut: params.minSyOut,
        maxSyIn:
          params.ytAmountOut === undefined
            ? undefined
            : maxNetSyIn(params.inputAmount, params.minSyOut),
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx,
        options.config,
        postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildBuyYtFromUnderlyingTx(
      params: BuildBuyYtFromUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingDeposit(adapter, "buildBuyYtFromUnderlyingTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromUnderlyingExactIn(
        tx,
        options.config,
        adapter,
        {
          underlyingCoinId: params.underlyingCoinId,
          underlyingCoinIds: params.underlyingCoinIds,
          underlyingAmount: params.underlyingAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addBuyYt(tx, options.config, {
        syCoin,
        ytAmountOut: params.ytAmountOut,
        minYtOut: params.minYtOut,
        minSyOut: params.minSyOut,
        maxSyIn:
          params.ytAmountOut === undefined || params.syAmountIn === undefined
            ? undefined
            : maxNetSyIn(params.syAmountIn, params.minSyOut),
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx,
        options.config,
        postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildBuyYtFromMarketCoinTx(
      params: BuildBuyYtFromMarketCoinTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertScallopMarketCoinDeposit(options.config, adapter, "buildBuyYtFromMarketCoinTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensurePyPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromScallopMarketCoinExactIn(
        tx,
        options.config,
        adapter,
        {
          marketCoinId: params.marketCoinId,
          marketCoinIds: params.marketCoinIds,
          marketCoinAmount: params.marketCoinAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addBuyYt(tx, options.config, {
        syCoin,
        ytAmountOut: params.ytAmountOut,
        minYtOut: params.minYtOut,
        minSyOut: params.minSyOut,
        maxSyIn:
          params.ytAmountOut === undefined || params.syAmountIn === undefined
            ? undefined
            : maxNetSyIn(params.syAmountIn, params.minSyOut),
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx,
        options.config,
        postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildSellYtTx(params: BuildSellYtTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syCoin, postOps] = addSellYt(tx, options.config, {
        ytAmount: params.ytAmount,
        minSyOut: params.minSyOut,
        positionId: params.positionId,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx,
        options.config,
        postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_YT],
        params.positionId,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildSellYtToUnderlyingTx(
      params: BuildSellYtToUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingRedeem(adapter, "buildSellYtToUnderlyingTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syCoin, postOps] = addSellYt(tx, options.config, {
        ytAmount: params.ytAmount,
        minSyOut: params.minSyOut,
        positionId: params.positionId,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx,
        options.config,
        postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_YT],
        params.positionId,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      const underlyingCoin = addRedeemSyCoinToUnderlying(
        tx,
        options.config,
        adapter,
        syCoin,
        params.minSyOut,
        syIndex,
      );
      tx.transferObjects([underlyingCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildAddLpTx(params: BuildAddLpTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.inputCoinId,
        coinIds: params.inputCoinIds,
        amount: params.inputAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, , syChange, postOps] = addLp(tx, options.config, {
        syCoin,
        ptAmount: params.ptAmount,
        positionId: params.positionId,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL, REWARD_SCOPE_LP], params.positionId, params.rewardSettlement.lpReferralRecordObjectIds);
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildAddLpKeepYtTx(params: BuildAddLpKeepYtTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensureFullPosition(tx, options.config, params.positionId);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.inputCoinId,
        coinIds: params.inputCoinIds,
        amount: params.inputAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, , syChange, postOps] = addLpKeepYt(tx, options.config, {
        syCoin,
        syToMintHint: params.syToMintHint,
        minLpOut: params.minLpOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx, options.config, postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_LP, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildAddLpKeepYtFromUnderlyingTx(
      params: BuildAddLpKeepYtFromUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingDeposit(
        adapter,
        "buildAddLpKeepYtFromUnderlyingTx",
      );
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensureFullPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromUnderlyingExactIn(
        tx,
        options.config,
        adapter,
        {
          underlyingCoinId: params.underlyingCoinId,
          underlyingCoinIds: params.underlyingCoinIds,
          underlyingAmount: params.underlyingAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, , syChange, postOps] = addLpKeepYt(tx, options.config, {
        syCoin,
        syToMintHint: params.syToMintHint,
        minLpOut: params.minLpOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx, options.config, postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_LP, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildSellYtForExactSyTx(
      params: BuildSellYtForExactSyTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [exactSyCoin, sySurplus, postOps] = addSellYtForExactSy(
        tx,
        options.config,
        {
          syAmountOut: params.syAmountOut,
          maxYtIn: params.maxYtIn,
          positionId: params.positionId,
          ownerAddress: params.senderAddress,
          priceInfo,
          deadlineMs: params.deadlineMs ?? 0n,
          rewardSettlement: params.rewardSettlement,
        },
      );
      finishOrDestroyRewardOperations(
        tx,
        options.config,
        postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_YT],
        params.positionId,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        [exactSyCoin, sySurplus],
        tx.pure.address(params.senderAddress),
      );
      return tx;
    },

    async buildAddLpKeepYtFromMarketCoinTx(
      params: BuildAddLpKeepYtFromMarketCoinTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertScallopMarketCoinDeposit(
        options.config,
        adapter,
        "buildAddLpKeepYtFromMarketCoinTx",
      );
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensureFullPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromScallopMarketCoinExactIn(
        tx,
        options.config,
        adapter,
        {
          marketCoinId: params.marketCoinId,
          marketCoinIds: params.marketCoinIds,
          marketCoinAmount: params.marketCoinAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, , syChange, postOps] = addLpKeepYt(tx, options.config, {
        syCoin,
        syToMintHint: params.syToMintHint,
        minLpOut: params.minLpOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx, options.config, postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_LP, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildAddLpFromSyTx(params: BuildAddLpFromSyTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensureFullPosition(tx, options.config, params.positionId);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.inputCoinId,
        coinIds: params.inputCoinIds,
        amount: params.inputAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addLpFromSy(tx, options.config, {
        syCoin,
        syToMintHint: params.syToMintHint,
        minLpOut: params.minLpOut,
        minSyOut: params.minSyOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx, options.config, postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_LP, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildAddLpFromSyFromUnderlyingTx(
      params: BuildAddLpFromSyFromUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingDeposit(
        adapter,
        "buildAddLpFromSyFromUnderlyingTx",
      );
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensureFullPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromUnderlyingExactIn(
        tx,
        options.config,
        adapter,
        {
          underlyingCoinId: params.underlyingCoinId,
          underlyingCoinIds: params.underlyingCoinIds,
          underlyingAmount: params.underlyingAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addLpFromSy(tx, options.config, {
        syCoin,
        syToMintHint: params.syToMintHint,
        minLpOut: params.minLpOut,
        minSyOut: params.minSyOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx, options.config, postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_LP, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildAddLpFromSyFromMarketCoinTx(
      params: BuildAddLpFromSyFromMarketCoinTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertScallopMarketCoinDeposit(
        options.config,
        adapter,
        "buildAddLpFromSyFromMarketCoinTx",
      );
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const position = ensureFullPosition(tx, options.config, params.positionId);
      const { syCoin, excessCoin } = addSyFromScallopMarketCoinExactIn(
        tx,
        options.config,
        adapter,
        {
          marketCoinId: params.marketCoinId,
          marketCoinIds: params.marketCoinIds,
          marketCoinAmount: params.marketCoinAmount,
          syIndex,
        },
      );
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange, postOps] = addLpFromSy(tx, options.config, {
        syCoin,
        syToMintHint: params.syToMintHint,
        minLpOut: params.minLpOut,
        minSyOut: params.minSyOut,
        position: position.argument,
        ownerAddress: params.senderAddress,
        priceInfo,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(
        tx, options.config, postOps,
        [REWARD_SCOPE_POOL, REWARD_SCOPE_LP, REWARD_SCOPE_YT],
        position.argument,
        params.rewardSettlement.lpReferralRecordObjectIds,
        params.rewardSettlement.ytReferralRecordObjectIds,
      );
      tx.transferObjects(
        appendOptionalObject([syChange], excessCoin),
        tx.pure.address(params.senderAddress),
      );
      transferCreatedPosition(tx, options.config, position, params.senderAddress);
      return tx;
    },

    async buildRemoveLpTx(params: BuildRemoveLpTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const tx = newTransaction(options, params.senderAddress);
      const [syCoin, , postOps] = addRemoveLp(tx, options.config, {
        lpAmount: params.lpAmount,
        minSyOut: params.minSyOut,
        minPtOut: params.minPtOut,
        positionId: params.positionId,
        ownerAddress: params.senderAddress,
        deadlineMs: params.deadlineMs ?? 0n,
        rewardSettlement: params.rewardSettlement,
      });
      finishOrDestroyRewardOperations(tx, options.config, postOps, [REWARD_SCOPE_POOL, REWARD_SCOPE_LP], params.positionId, params.rewardSettlement.lpReferralRecordObjectIds);
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildRemoveLpToSyTx(params: BuildRemoveLpToSyTxParams): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      const syIndex =
        params.route === "active-swap"
          ? await resolveSyIndex(options, params.syIndex)
          : params.syIndex;
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = addRemoveLpToSy(
        tx,
        options.config,
        adapter,
        params,
        syIndex,
      );
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildRemoveLpToUnderlyingTx(
      params: BuildRemoveLpToUnderlyingTxParams,
    ): Promise<Transaction> {
      assertEmptyRewardSettlement(params.rewardSettlement);
      assertDirectUnderlyingRedeem(adapter, "buildRemoveLpToUnderlyingTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = addRemoveLpToSy(
        tx,
        options.config,
        adapter,
        params,
        syIndex,
      );
      const underlyingCoin = addRedeemSyCoinToUnderlying(
        tx,
        options.config,
        adapter,
        syCoin,
        params.minTotalSyOut,
        syIndex,
      );
      tx.transferObjects([underlyingCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildDepositToSyTx(params: DepositToSyTxParams): Promise<Transaction> {
      if (!adapter.canDepositUnderlying) {
        throw new Error(
          `Adapter ${adapter.kind} does not support direct underlying deposits through buildDepositToSyTx.`,
        );
      }
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const underlyingCoin = splitUnderlyingCoinExactIn(tx, options.config, {
        underlyingCoinId: params.underlyingCoinId,
        underlyingAmount: params.underlyingAmount,
      });
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [syCoin, mintRequest] = addMintSyExactIn(
        tx,
        options.config,
        priceInfo,
        params.underlyingAmount,
      );
      const depositResult = adapter.addDepositToSy({
        tx,
        config: options.config,
        mintRequest,
        inputCoin: underlyingCoin,
        syAmount: params.underlyingAmount,
      });
      const transferObjects = depositResult.excessCoin
        ? [syCoin, depositResult.excessCoin]
        : [syCoin];
      tx.transferObjects(transferObjects, tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildRedeemSyToUnderlyingTx(
      params: RedeemSyToUnderlyingTxParams,
    ): Promise<Transaction> {
      assertDirectUnderlyingRedeem(adapter, "buildRedeemSyToUnderlyingTx");
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.syCoinId,
        coinIds: params.syCoinIds,
        amount: params.syAmount,
      });
      const redeemResult = addRedeemSyCoinToUnderlying(
        tx,
        options.config,
        adapter,
        syCoin,
        params.syAmount,
        syIndex,
      );
      tx.transferObjects(
        [redeemResult],
        tx.pure.address(params.senderAddress),
      );
      return tx;
    },

    async buildQueueRedeemSyTx(params: QueueRedeemSyTxParams): Promise<Transaction> {
      assertScallopQueueRedeemSupported(options.config, adapter.kind);
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = splitCoinFromIds(tx, {
        primaryCoinId: params.syCoinId,
        coinIds: params.syCoinIds,
        amount: params.syAmount,
      });
      const request = tx.moveCall({
        target: `${requireConfigValue(options.config.scallopAdapterPackageId, "scallopAdapterPackageId")}::scallop_market_vault::queue_redeem`,
        arguments: [
          syCoin,
          tx.pure.u64(params.minMarketCoinOut ?? 0n),
          tx.object(requireGlobalConfigObjectId(options.config)),
          tx.object(requireConfigValue(options.config.scallopMarketVaultObjectId, "scallopMarketVaultObjectId")),
          tx.object(marketStateObjectId(options.config)),
          tx.object(requireConfigValue(options.config.scallopVersionObjectId, "scallopVersionObjectId")),
          tx.object(requireConfigValue(options.config.scallopMarketObjectId, "scallopMarketObjectId")),
          tx.object.clock(),
        ],
        typeArguments: [
          options.config.underlyingTypeTag,
          options.config.syTypeTag,
          options.config.ptTypeTag,
          options.config.ytTypeTag,
        ],
      }) as TransactionObjectArgument;
      tx.transferObjects([request], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildCancelQueuedRedeemSyTx(
      params: CancelQueuedRedeemSyTxParams,
    ): Promise<Transaction> {
      assertScallopQueueRedeemSupported(options.config, adapter.kind);
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = tx.moveCall({
        target: `${requireConfigValue(options.config.scallopAdapterPackageId, "scallopAdapterPackageId")}::scallop_market_vault::cancel_queued_redeem`,
        arguments: [
          tx.object(params.requestId),
          tx.object(requireGlobalConfigObjectId(options.config)),
          tx.object(requireConfigValue(options.config.scallopMarketVaultObjectId, "scallopMarketVaultObjectId")),
          tx.object.clock(),
        ],
        typeArguments: [
          options.config.underlyingTypeTag,
          options.config.syTypeTag,
          options.config.ptTypeTag,
          options.config.ytTypeTag,
        ],
      }) as TransactionObjectArgument;
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildSwapSyForPtTx(params: SwapSyForPtTxParams): Promise<Transaction> {
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = tx.splitCoins(tx.object(params.syCoinId), [
        tx.pure.u64(params.syAmount),
      ]);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const [, syChange] = addSwapSyForPt(
        tx,
        options.config,
        syCoin,
        params.minPtOut,
        priceInfo,
        params.pyPositionId,
      );
      tx.transferObjects([syChange], tx.pure.address(params.senderAddress));
      return tx;
    },

    async buildClaimYtInterestTx(
      params: ClaimYtInterestTxParams,
    ): Promise<Transaction> {
      const syIndex = await resolveSyIndex(options, params.syIndex);
      const tx = newTransaction(options, params.senderAddress);
      const priceInfo = adapter.addPriceInfo({ tx, config: options.config, syIndex });
      const syCoin = addClaimYtInterest(
        tx,
        options.config,
        priceInfo,
        params.pyPositionId,
      );
      tx.transferObjects([syCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    buildPlaceBidOrderTx(params: PlaceBidOrderTxParams): Transaction {
      const tx = newTransaction(options, params.senderAddress);
      const syCoin = tx.splitCoins(tx.object(params.syCoinId), [
        tx.pure.u64(params.syAmount),
      ]);
      addPlaceBidOrder(
        tx,
        options.config,
        syCoin,
        params.priceRaw,
        params.minPtAmount,
        params.expiryMs ?? 0n,
        params.asset ?? "pt",
      );
      return tx;
    },

    buildClaimOrderTx(params: OrderActionTxParams): Transaction {
      const tx = newTransaction(options, params.senderAddress);
      const [syCoin, assetCoin] = addClaimOrder(
        tx,
        options.config,
        params.orderId,
        params.asset ?? "pt",
      );
      tx.transferObjects([syCoin, assetCoin], tx.pure.address(params.senderAddress));
      return tx;
    },

    buildCancelOrderTx(params: OrderActionTxParams): Transaction {
      const tx = newTransaction(options, params.senderAddress);
      const [syCoin, assetCoin] = addCancelOrder(
        tx,
        options.config,
        params.orderId,
        params.asset ?? "pt",
      );
      tx.transferObjects([syCoin, assetCoin], tx.pure.address(params.senderAddress));
      return tx;
    },
  };
}

function addBuyPt(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syCoin: TransactionObjectArgument;
    minPtOut: bigint;
    position: TransactionObjectArgument | string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
  },
): [TransactionArgument, TransactionObjectArgument, TransactionArgument] {
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::buy_pt`,
    arguments: [
      poolSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      params.syCoin,
      tx.pure.u64(params.minPtOut),
      tx.object(marketStateObjectId(config)),
      positionArgument(tx, params.position),
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionObjectArgument,
    result[2] as TransactionArgument,
  ];
}

function addSellPt(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    ptAmount: bigint | TransactionArgument;
    minSyOut: bigint;
    positionId: string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
  },
): [TransactionObjectArgument, TransactionArgument] {
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_pt`,
    arguments: [
      poolSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      u64Argument(tx, params.ptAmount),
      tx.pure.u64(params.minSyOut),
      tx.object(marketStateObjectId(config)),
      tx.object(params.positionId),
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [result[0] as TransactionObjectArgument, result[1] as TransactionArgument];
}

function addBuyPtRoute(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syCoin: TransactionObjectArgument;
    orderIds: Array<bigint | number | string>;
    maxBookPriceRaw: bigint;
    minTotalPtOut: bigint;
    position: TransactionObjectArgument | string;
    priceInfo: TransactionObjectArgument;
  },
): [TransactionObjectArgument, TransactionArgument] {
  void tx;
  void config;
  void params;
  throw new Error("Hybrid orderbook routes are experimental and are not exposed by the MarketState router.");
}

function addSellPtRoute(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    ptAmount: bigint;
    orderIds: Array<bigint | number | string>;
    minBookPriceRaw: bigint;
    minTotalSyOut: bigint;
    positionId: string;
    priceInfo: TransactionObjectArgument;
  },
): [TransactionObjectArgument, TransactionArgument] {
  void tx;
  void config;
  void params;
  throw new Error("Hybrid orderbook routes are experimental and are not exposed by the MarketState router.");
}

function addBuyYt(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syCoin: TransactionObjectArgument;
    ytAmountOut?: bigint;
    minYtOut: bigint;
    minSyOut: bigint;
    maxSyIn?: bigint;
    position: TransactionObjectArgument | string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionArgument, TransactionObjectArgument, TransactionArgument] {
  const position = positionArgument(tx, params.position);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const ytSettlements = ytRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.ytReferralRecordObjectIds,
  );
  const exactOutput =
    params.ytAmountOut !== undefined
    && params.maxSyIn !== undefined;
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::${exactOutput ? "buy_exact_yt" : "buy_yt"}`,
    arguments: [
      poolSettlements,
      ytSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      params.syCoin,
      tx.pure.u64(exactOutput ? params.ytAmountOut! : params.minYtOut),
      tx.pure.u64(exactOutput ? params.maxSyIn! : params.minSyOut),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionObjectArgument,
    result[2] as TransactionArgument,
  ];
}

function maxNetSyIn(syAmountIn: bigint, minSyOut: bigint): bigint {
  if (minSyOut < 0n || minSyOut > syAmountIn) {
    throw new Error("Minimum SY change exceeds the available SY input.");
  }
  return syAmountIn - minSyOut;
}

function addSellYt(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    ytAmount: bigint;
    minSyOut: bigint;
    positionId: string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionObjectArgument, TransactionArgument] {
  const position = tx.object(params.positionId);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const ytSettlements = ytRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.ytReferralRecordObjectIds,
  );
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_yt`,
    arguments: [
      poolSettlements,
      ytSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      tx.pure.u64(params.ytAmount),
      tx.pure.u64(params.minSyOut),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [result[0] as TransactionObjectArgument, result[1] as TransactionArgument];
}

function addSellYtForExactSy(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syAmountOut: bigint;
    maxYtIn: bigint;
    positionId: string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionObjectArgument, TransactionObjectArgument, TransactionArgument] {
  const position = tx.object(params.positionId);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const ytSettlements = ytRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.ytReferralRecordObjectIds,
  );
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::sell_yt_for_exact_sy`,
    arguments: [
      poolSettlements,
      ytSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      tx.pure.u64(params.syAmountOut),
      tx.pure.u64(params.maxYtIn),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[1] as TransactionObjectArgument,
    result[2] as TransactionObjectArgument,
    result[3] as TransactionArgument,
  ];
}

function addLp(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syCoin: TransactionObjectArgument;
    ptAmount: bigint;
    positionId: string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionArgument, TransactionArgument, TransactionObjectArgument, TransactionArgument] {
  const position = tx.object(params.positionId);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const lpSettlements = lpRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.lpReferralRecordObjectIds,
  );
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::add_lp`,
    arguments: [
      poolSettlements,
      lpSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      params.syCoin,
      tx.pure.u64(params.ptAmount),
      tx.pure.u64(0),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionObjectArgument,
    result[3] as TransactionArgument,
  ];
}

function addLpKeepYt(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syCoin: TransactionObjectArgument;
    syToMintHint: bigint;
    minLpOut: bigint;
    position: TransactionObjectArgument | string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionArgument, TransactionArgument, TransactionObjectArgument, TransactionArgument] {
  const position = positionArgument(tx, params.position);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const ytSettlements = ytRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.ytReferralRecordObjectIds,
  );
  const lpSettlements = lpRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.lpReferralRecordObjectIds,
  );
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::add_lp_keep_yt`,
    arguments: [
      poolSettlements,
      ytSettlements,
      lpSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      params.syCoin,
      tx.pure.u64(params.syToMintHint),
      tx.pure.u64(params.minLpOut),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionObjectArgument,
    result[3] as TransactionArgument,
  ];
}

function addLpFromSy(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    syCoin: TransactionObjectArgument;
    syToMintHint: bigint;
    minLpOut: bigint;
    minSyOut: bigint;
    position: TransactionObjectArgument | string;
    ownerAddress: string;
    priceInfo: TransactionObjectArgument;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionArgument, TransactionObjectArgument, TransactionArgument] {
  const position = positionArgument(tx, params.position);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const ytSettlements = ytRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.ytReferralRecordObjectIds,
  );
  const lpSettlements = lpRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.lpReferralRecordObjectIds,
  );
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::add_lp_from_sy`,
    arguments: [
      poolSettlements,
      ytSettlements,
      lpSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      params.syCoin,
      tx.pure.u64(params.syToMintHint),
      tx.pure.u64(params.minLpOut),
      tx.pure.u64(params.minSyOut),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      params.priceInfo,
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[0] as TransactionArgument,
    result[1] as TransactionObjectArgument,
    result[2] as TransactionArgument,
  ];
}

function addRemoveLp(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    lpAmount: bigint;
    minSyOut: bigint;
    minPtOut: bigint;
    positionId: string;
    ownerAddress: string;
    deadlineMs: bigint;
    rewardSettlement: EmptyRewardSettlementStrategy;
  },
): [TransactionObjectArgument, TransactionArgument, TransactionArgument] {
  const position = tx.object(params.positionId);
  const poolSettlements = poolRewardSettlementVector(tx, config);
  const lpSettlements = lpRewardSettlementVector(
    tx,
    config,
    position,
    params.ownerAddress,
    params.rewardSettlement.lpReferralRecordObjectIds,
  );
  const result = tx.moveCall({
    target: `${config.jitterPackageId}::router::remove_lp`,
    arguments: [
      poolSettlements,
      lpSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      tx.pure.u64(params.lpAmount),
      tx.pure.u64(params.minSyOut),
      tx.pure.u64(params.minPtOut),
      tx.object(marketStateObjectId(config)),
      position,
      tx.object(requireGlobalConfigObjectId(config)),
      tx.pure.u64(params.deadlineMs),
      tx.object.clock(),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
  return [
    result[0] as TransactionObjectArgument,
    result[1] as TransactionArgument,
    result[2] as TransactionArgument,
  ];
}

function addRemoveLpToSy(
  tx: Transaction,
  config: JitterMarketConfig,
  adapter: JitterAdapterManifest,
  params: BuildRemoveLpToSyTxParams,
  syIndex?: bigint,
): TransactionObjectArgument {
  const [syCoin, ptAmount, removePostOps] = addRemoveLp(tx, config, {
    lpAmount: params.lpAmount,
    minSyOut: params.minSyOut,
    minPtOut: params.minPtOut,
    positionId: params.positionId,
    ownerAddress: params.senderAddress,
    deadlineMs: params.deadlineMs ?? 0n,
    rewardSettlement: params.rewardSettlement,
  });
  finishOrDestroyRewardOperations(
    tx,
    config,
    removePostOps,
    [REWARD_SCOPE_POOL, REWARD_SCOPE_LP],
    params.positionId,
    params.rewardSettlement.lpReferralRecordObjectIds,
  );

  let convertedSyCoin: TransactionObjectArgument | null = null;
  if (params.route === "active-swap") {
    if (syIndex === undefined) {
      throw new Error("active-swap LP Zap Out requires syIndex.");
    }
    const priceInfo = adapter.addPriceInfo({ tx, config, syIndex });
    const [swappedSyCoin, sellPostOps] = addSellPt(tx, config, {
      ptAmount,
      minSyOut:
        params.minTotalSyOut > params.minSyOut
          ? params.minTotalSyOut - params.minSyOut
          : 0n,
      positionId: params.positionId,
      ownerAddress: params.senderAddress,
      priceInfo,
      deadlineMs: params.deadlineMs ?? 0n,
    });
    finishOrDestroyRewardOperations(
      tx,
      config,
      sellPostOps,
      [REWARD_SCOPE_POOL],
    );
    convertedSyCoin = swappedSyCoin;
  } else if (params.route === "settled-redeem") {
    convertedSyCoin = tx.moveCall({
      target: `${config.jitterPackageId}::router::redeem_market_state_after_expiry`,
      arguments: [
        ptAmount,
        tx.object(params.positionId),
        tx.object(marketStateObjectId(config)),
        tx.object(requireGlobalConfigObjectId(config)),
        tx.object.clock(),
      ],
      typeArguments: marketStateTypeArgs(config),
    });
  }

  if (convertedSyCoin) {
    tx.mergeCoins(syCoin, [convertedSyCoin]);
  }
  tx.moveCall({
    target: `${config.jitterPackageId}::router::assert_coin_min_value`,
    arguments: [
      tx.object(requireGlobalConfigObjectId(config)),
      syCoin,
      tx.pure.u64(params.minTotalSyOut),
    ],
    typeArguments: [config.syTypeTag],
  });
  return syCoin;
}

function addSyFromUnderlyingExactIn(
  tx: Transaction,
  config: JitterMarketConfig,
  adapter: JitterAdapterManifest,
  params: {
    underlyingCoinId?: string;
    underlyingCoinIds?: readonly string[];
    underlyingAmount: bigint;
    syIndex: bigint;
  },
): {
  syCoin: TransactionObjectArgument;
  excessCoin?: TransactionObjectArgument;
} {
  const underlyingCoin = splitUnderlyingCoinExactIn(tx, config, params);
  const priceInfo = adapter.addPriceInfo({ tx, config, syIndex: params.syIndex });
  const [syCoin, mintRequest] = addMintSyExactIn(
    tx,
    config,
    priceInfo,
    params.underlyingAmount,
  );
  const depositResult = adapter.addDepositToSy({
    tx,
    config,
    mintRequest,
    inputCoin: underlyingCoin,
    syAmount: params.underlyingAmount,
  });
  return {
    syCoin,
    ...(depositResult.excessCoin ? { excessCoin: depositResult.excessCoin } : {}),
  };
}

function addSyFromScallopMarketCoinExactIn(
  tx: Transaction,
  config: JitterMarketConfig,
  adapter: JitterAdapterManifest,
  params: {
    marketCoinId?: string;
    marketCoinIds?: readonly string[];
    marketCoinAmount: bigint;
    syIndex: bigint;
  },
): {
  syCoin: TransactionObjectArgument;
  excessCoin?: TransactionObjectArgument;
} {
  assertScallopMarketCoinDeposit(config, adapter, "addSyFromScallopMarketCoinExactIn");
  const marketCoin = splitCoinFromIds(tx, {
    primaryCoinId: requireMarketCoinId(params.marketCoinId),
    coinIds: params.marketCoinIds,
    amount: params.marketCoinAmount,
  });
  const underlyingValue = marketCoinToUnderlyingFloor(
    params.marketCoinAmount,
    params.syIndex,
  );
  const priceInfo = adapter.addPriceInfo({ tx, config, syIndex: params.syIndex });
  const [syCoin, mintRequest] = addMintSyExactIn(
    tx,
    config,
    priceInfo,
    underlyingValue,
  );
  const excessCoin = addScallopDeposit(
    tx,
    config,
    mintRequest,
    marketCoin,
    params.marketCoinAmount,
  );
  return { syCoin, excessCoin };
}

function splitUnderlyingCoinExactIn(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    underlyingCoinId?: string;
    underlyingCoinIds?: readonly string[];
    underlyingAmount: bigint;
  },
): TransactionObjectArgument {
  if (config.underlyingTypeTag === SUI_TYPE_TAG) {
    return tx.coin({ balance: params.underlyingAmount });
  }

  return splitCoinFromIds(tx, {
    primaryCoinId: requireUnderlyingCoinId(params.underlyingCoinId),
    coinIds: params.underlyingCoinIds,
    amount: params.underlyingAmount,
  });
}

function requireUnderlyingCoinId(coinId: string | undefined): string {
  if (!coinId) {
    throw new Error("underlyingCoinId is required for non-SUI underlying inputs.");
  }
  return coinId;
}

function requireMarketCoinId(coinId: string | undefined): string {
  if (!coinId) {
    throw new Error("marketCoinId is required for market coin inputs.");
  }
  return coinId;
}

function marketCoinToUnderlyingFloor(
  marketCoinAmount: bigint,
  syIndex: bigint,
): bigint {
  if (marketCoinAmount <= 0n) return 0n;
  if (syIndex <= 0n) {
    throw new Error("Invalid sy_index for market coin conversion.");
  }
  return (marketCoinAmount * syIndex) / FP64_ONE;
}

function splitCoinFromIds(
  tx: Transaction,
  params: {
    primaryCoinId: string;
    coinIds?: readonly string[];
    amount: bigint;
  },
): TransactionObjectArgument {
  const coinIds = normalizeCoinIds(params.primaryCoinId, params.coinIds);
  const primaryCoin = tx.object(coinIds[0]);
  const mergeCoinIds = coinIds.slice(1);

  if (mergeCoinIds.length > 0) {
    tx.mergeCoins(
      primaryCoin,
      mergeCoinIds.map((coinId) => tx.object(coinId)),
    );
  }

  return tx.splitCoins(primaryCoin, [tx.pure.u64(params.amount)]);
}

function normalizeCoinIds(
  primaryCoinId: string,
  coinIds: readonly string[] | undefined,
): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const coinId of [primaryCoinId, ...(coinIds ?? [])]) {
    if (seen.has(coinId)) continue;
    seen.add(coinId);
    normalized.push(coinId);
  }

  return normalized;
}

function ensurePyPosition(
  tx: Transaction,
  config: JitterMarketConfig,
  positionId?: string,
): {
  argument: TransactionObjectArgument | string;
  created: TransactionObjectArgument | null;
  transferKind: "py" | null;
} {
  if (positionId) {
    return { argument: positionId, created: null, transferKind: null };
  }

  const created = addCreatePyPosition(tx, config);
  return { argument: created, created, transferKind: "py" };
}

function ensureFullPosition(
  tx: Transaction,
  config: JitterMarketConfig,
  positionId?: string,
): {
  argument: TransactionObjectArgument | string;
  created: TransactionObjectArgument | null;
  transferKind: "full" | null;
} {
  if (positionId) {
    return { argument: positionId, created: null, transferKind: null };
  }

  const created = addCreatePosition(tx, config);
  return { argument: created, created, transferKind: "full" };
}

function positionArgument(
  tx: Transaction,
  position: TransactionObjectArgument | string,
): TransactionObjectArgument {
  return typeof position === "string" ? tx.object(position) : position;
}

function marketStateObjectId(config: JitterMarketConfig): string {
  return config.marketStateObjectId ?? config.marketObjectId;
}

function marketStateTypeArgs(config: JitterMarketConfig): [string, string, string] {
  return [config.syTypeTag, config.ptTypeTag, config.ytTypeTag];
}

function transferCreatedPosition(
  tx: Transaction,
  config: JitterMarketConfig,
  position: {
    created: TransactionObjectArgument | null;
    transferKind: "py" | "full" | null;
  },
  senderAddress: string,
): void {
  if (!position.created || !position.transferKind) return;

  const ytSettlements = transferRewardSettlementVector(
    tx,
    config,
    position.created,
    senderAddress,
    senderAddress,
    REWARD_SCOPE_YT,
  );
  const lpSettlements = transferRewardSettlementVector(
    tx,
    config,
    position.created,
    senderAddress,
    senderAddress,
    REWARD_SCOPE_LP,
  );
  tx.moveCall({
    target: `${config.jitterPackageId}::router::transfer_market_state_position_after_reward_settlement`,
    arguments: [
      ytSettlements,
      lpSettlements,
      tx.object(requireRewardDistributorObjectId(config)),
      position.created,
      tx.object(marketStateObjectId(config)),
      tx.object(requireGlobalConfigObjectId(config)),
      tx.pure.address(senderAddress),
    ],
    typeArguments: marketStateTypeArgs(config),
  });
}

function appendOptionalObject(
  objects: TransactionObjectArgument[],
  optionalObject?: TransactionObjectArgument,
): TransactionObjectArgument[] {
  return optionalObject ? [...objects, optionalObject] : objects;
}

function emptyRewardSettlementVector(
  tx: Transaction,
  config: JitterMarketConfig,
): TransactionArgument {
  return tx.makeMoveVec({
    type: `${config.jitterPackageId}::reward_distributor::RewardSettlement`,
    elements: [],
  });
}

const REWARD_SCOPE_YT = 1;
const REWARD_SCOPE_LP = 2;
const REWARD_SCOPE_POOL = 3;
const ZERO_ADDRESS = "0x0";
type RewardScope =
  | typeof REWARD_SCOPE_YT
  | typeof REWARD_SCOPE_LP
  | typeof REWARD_SCOPE_POOL;

function shouldUseCoreRewardSettlements(config: JitterMarketConfig): boolean {
  // MarketState gates mutations as soon as a canonical RewardDistributor is
  // bound, even when that distributor currently has no Point/Coin rewarders.
  // Mirror that topology here; reward-program configuration only controls
  // which rewarder-specific settlement calls are appended to the operation.
  return Boolean(config.rewardDistributorObjectId);
}

function rewardSettlementVector(
  tx: Transaction,
  config: JitterMarketConfig,
  settlements: TransactionArgument[],
): TransactionArgument {
  return tx.makeMoveVec({
    type: `${config.jitterPackageId}::reward_distributor::RewardSettlement`,
    elements: settlements as unknown as TransactionObjectArgument[],
  });
}

function finishRewardOperation(
  tx: Transaction,
  config: JitterMarketConfig,
  operation: TransactionArgument,
): TransactionArgument {
  return tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::finish_operation`,
    arguments: [tx.object(requireGlobalConfigObjectId(config)), operation],
  }) as TransactionArgument;
}

function destroyRewardSettlement(
  tx: Transaction,
  config: JitterMarketConfig,
  settlement: TransactionArgument,
): void {
  tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::destroy_settlement`,
    arguments: [tx.object(requireGlobalConfigObjectId(config)), settlement],
  });
}

function settleRewardOperation(
  tx: Transaction,
  config: JitterMarketConfig,
  operation: TransactionArgument,
  scope: RewardScope,
  position?: TransactionObjectArgument | string,
  lpReferralRecordObjectIds: Readonly<Record<string, string>> = {},
  ytReferralRecordObjectIds: Readonly<Record<string, string>> = {},
): void {
  if (scope === REWARD_SCOPE_POOL) {
    if (config.liquidlink?.enabled) {
      addSettlePoolRewardOperationWithLiquidlinkPoints(tx, config, operation);
    }
    return;
  }

  if (!position) {
    throw new Error("Reward operation settlement requires a position object for YT/LP scopes.");
  }

  if (scope === REWARD_SCOPE_YT) {
    if (config.liquidlink?.enabled) {
      addSettleYtRewardOperationWithLiquidlinkPoints(
        tx,
        config,
        operation,
        position,
        ytReferralRecordObjectIds,
      );
    }
    if (hasCoinRewardConfig(config, "yt")) {
      addSettleCoinRewardOperation(tx, config, operation, position, "yt");
    }
    return;
  }

  if (config.liquidlink?.enabled) {
    addSettleLpRewardOperationWithLiquidlinkPoints(
      tx,
      config,
      operation,
      position,
      lpReferralRecordObjectIds,
    );
  }
  if (hasCoinRewardConfig(config, "lp")) {
    addSettleCoinRewardOperation(tx, config, operation, position, "lp");
  }
}

function beginFinishedSettlementWithGuard(
  tx: Transaction,
  config: JitterMarketConfig,
  params: {
    scope: RewardScope;
    owner: string;
    subjectId: TransactionArgument;
    exposure: TransactionArgument;
    guard: TransactionArgument;
    position?: TransactionObjectArgument | string;
    lpReferralRecordObjectIds?: Readonly<Record<string, string>>;
    ytReferralRecordObjectIds?: Readonly<Record<string, string>>;
  },
): TransactionArgument {
  const operation = tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::begin_scoped_operation_with_guard`,
    arguments: [
      tx.object(requireRewardDistributorObjectId(config)),
      tx.object(requireGlobalConfigObjectId(config)),
      tx.pure.u8(params.scope),
      tx.pure.address(params.owner),
      params.subjectId,
      params.exposure,
      params.guard,
    ],
  }) as TransactionArgument;
  settleRewardOperation(
    tx,
    config,
    operation,
    params.scope,
    params.position,
    params.lpReferralRecordObjectIds,
    params.ytReferralRecordObjectIds,
  );
  return finishRewardOperation(tx, config, operation);
}

function poolRewardSettlementVector(
  tx: Transaction,
  config: JitterMarketConfig,
): TransactionArgument {
  if (!shouldUseCoreRewardSettlements(config)) {
    return emptyRewardSettlementVector(tx, config);
  }
  const exposure = tx.moveCall({
    target: `${config.jitterPackageId}::market_state::total_pool_sy`,
    arguments: [tx.object(marketStateObjectId(config))],
    typeArguments: marketStateTypeArgs(config),
  }) as TransactionArgument;
  const guard = tx.moveCall({
    target: `${config.jitterPackageId}::market_state::pool_reward_guard`,
    arguments: [tx.object(marketStateObjectId(config))],
    typeArguments: marketStateTypeArgs(config),
  }) as TransactionArgument;
  const settlement = beginFinishedSettlementWithGuard(tx, config, {
    scope: REWARD_SCOPE_POOL,
    owner: ZERO_ADDRESS,
    subjectId: tx.pure.id(marketStateObjectId(config)),
    exposure,
    guard,
  });
  return rewardSettlementVector(tx, config, [settlement]);
}

function ytRewardSettlementVector(
  tx: Transaction,
  config: JitterMarketConfig,
  position: TransactionObjectArgument,
  ownerAddress: string,
  ytReferralRecordObjectIds: Readonly<Record<string, string>> = {},
): TransactionArgument {
  if (!shouldUseCoreRewardSettlements(config)) {
    return emptyRewardSettlementVector(tx, config);
  }
  const positionId = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::id`,
    arguments: [position],
  }) as TransactionArgument;
  const exposure = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::yt_balance`,
    arguments: [position],
  }) as TransactionArgument;
  const guard = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::yt_reward_guard`,
    arguments: [position],
  }) as TransactionArgument;
  const settlement = beginFinishedSettlementWithGuard(tx, config, {
    scope: REWARD_SCOPE_YT,
    owner: ownerAddress,
    subjectId: positionId,
    exposure,
    guard,
    position,
    ytReferralRecordObjectIds,
  });
  return rewardSettlementVector(tx, config, [settlement]);
}

function lpRewardSettlementVector(
  tx: Transaction,
  config: JitterMarketConfig,
  position: TransactionObjectArgument,
  ownerAddress: string,
  lpReferralRecordObjectIds: Readonly<Record<string, string>> = {},
): TransactionArgument {
  if (!shouldUseCoreRewardSettlements(config)) {
    return emptyRewardSettlementVector(tx, config);
  }
  const positionId = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::id`,
    arguments: [position],
  }) as TransactionArgument;
  const exposure = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::lp_amount`,
    arguments: [position],
  }) as TransactionArgument;
  const guard = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::lp_reward_guard`,
    arguments: [position],
  }) as TransactionArgument;
  const settlement = beginFinishedSettlementWithGuard(tx, config, {
    scope: REWARD_SCOPE_LP,
    owner: ownerAddress,
    subjectId: positionId,
    exposure,
    guard,
    position,
    lpReferralRecordObjectIds,
  });
  return rewardSettlementVector(tx, config, [settlement]);
}

function transferRewardSettlementVector(
  tx: Transaction,
  config: JitterMarketConfig,
  position: TransactionObjectArgument,
  fromOwner: string,
  toOwner: string,
  scope: typeof REWARD_SCOPE_YT | typeof REWARD_SCOPE_LP,
): TransactionArgument {
  if (!shouldUseCoreRewardSettlements(config)) {
    return emptyRewardSettlementVector(tx, config);
  }
  const positionId = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::id`,
    arguments: [position],
  }) as TransactionArgument;
  const exposure = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::${
      scope === REWARD_SCOPE_YT ? "yt_balance" : "lp_amount"
    }`,
    arguments: [position],
  }) as TransactionArgument;
  const guard = tx.moveCall({
    target: `${config.jitterPackageId}::jitter_position::${
      scope === REWARD_SCOPE_YT ? "yt_reward_guard" : "lp_reward_guard"
    }`,
    arguments: [position],
  }) as TransactionArgument;
  const operation = tx.moveCall({
    target: `${config.jitterPackageId}::reward_distributor::begin_transfer_operation`,
    arguments: [
      tx.object(requireRewardDistributorObjectId(config)),
      tx.object(requireGlobalConfigObjectId(config)),
      tx.pure.u8(scope),
      tx.pure.address(fromOwner),
      tx.pure.address(toOwner),
      positionId,
      exposure,
      guard,
    ],
  }) as TransactionArgument;
  settleRewardOperation(tx, config, operation, scope, position);
  return rewardSettlementVector(tx, config, [finishRewardOperation(tx, config, operation)]);
}

function destroyEmptyRewardOperations(
  tx: Transaction,
  config: JitterMarketConfig,
  postOps: TransactionArgument,
): void {
  tx.moveCall({
    target: `0x1::vector::destroy_empty`,
    arguments: [postOps],
    typeArguments: [`${config.jitterPackageId}::reward_distributor::RewardOperation`],
  });
}

function finishOrDestroyRewardOperations(
  tx: Transaction,
  config: JitterMarketConfig,
  postOps: TransactionArgument,
  scopesFromPopBack: RewardScope[],
  position?: TransactionObjectArgument | string,
  lpReferralRecordObjectIds: Readonly<Record<string, string>> = {},
  ytReferralRecordObjectIds: Readonly<Record<string, string>> = {},
): void {
  if (!shouldUseCoreRewardSettlements(config)) {
    destroyEmptyRewardOperations(tx, config, postOps);
    return;
  }

  for (const scope of scopesFromPopBack) {
    const operation = tx.moveCall({
      target: `0x1::vector::pop_back`,
      arguments: [postOps],
      typeArguments: [`${config.jitterPackageId}::reward_distributor::RewardOperation`],
    }) as TransactionArgument;
    settleRewardOperation(
      tx,
      config,
      operation,
      scope,
      position,
      lpReferralRecordObjectIds,
      ytReferralRecordObjectIds,
    );
    const settlement = finishRewardOperation(tx, config, operation);
    destroyRewardSettlement(tx, config, settlement);
  }

  destroyEmptyRewardOperations(tx, config, postOps);
}

function assertEmptyRewardSettlement(
  settlement: EmptyRewardSettlementStrategy,
): void {
  if (settlement.strategy !== "empty-vector") {
    throw new Error(`Unsupported reward settlement strategy: ${settlement.strategy}`);
  }
}

function assertDirectUnderlyingDeposit(
  adapter: JitterAdapterManifest,
  builderName: string,
): void {
  if (!adapter.canDepositUnderlying) {
    throw new Error(
      `Adapter ${adapter.kind} does not support direct underlying deposits through ${builderName}.`,
    );
  }
}

function assertDirectUnderlyingRedeem(
  adapter: JitterAdapterManifest,
  builderName: string,
): void {
  if (!adapter.canRedeemUnderlying) {
    throw new Error(
      `Adapter ${adapter.kind} does not support direct underlying redemptions through ${builderName}.`,
    );
  }
}

function assertScallopMarketCoinDeposit(
  config: JitterMarketConfig,
  adapter: JitterAdapterManifest,
  builderName: string,
): void {
  if (adapter.kind !== "scallop" || !config.scallopMarketCoinTypeTag) {
    throw new Error(
      `${builderName} requires a Scallop market with scallopMarketCoinTypeTag configured.`,
    );
  }
}

function assertScallopQueueRedeemSupported(
  config: JitterMarketConfig,
  adapterKind: JitterAdapterManifest["kind"],
): void {
  if (adapterKind !== "scallop") {
    throw new Error("Queued SY redemption is only supported by the Scallop adapter.");
  }
  requireConfigValue(config.scallopAdapterPackageId, "scallopAdapterPackageId");
  requireConfigValue(config.scallopMarketVaultObjectId, "scallopMarketVaultObjectId");
  requireConfigValue(config.scallopVersionObjectId, "scallopVersionObjectId");
  requireConfigValue(config.scallopMarketObjectId, "scallopMarketObjectId");
}

function addRedeemSyCoinToUnderlying(
  tx: Transaction,
  config: JitterMarketConfig,
  adapter: JitterAdapterManifest,
  syCoin: TransactionObjectArgument,
  minSyAmount: bigint,
  syIndex: bigint,
): TransactionObjectArgument {
  const priceInfo = adapter.addPriceInfo({ tx, config, syIndex });
  const burnRequest = addBurnSyExactIn(tx, config, priceInfo, syCoin);
  return adapter.addRedeemFromSy({
    tx,
    config,
    burnRequest,
    syAmount: minSyAmount,
  }).outputCoin;
}

function requireRewardDistributorObjectId(config: JitterMarketConfig): string {
  if (!config.rewardDistributorObjectId) {
    throw new Error("Product transaction builders require rewardDistributorObjectId in market config.");
  }
  return config.rewardDistributorObjectId;
}

function requireGlobalConfigObjectId(config: JitterMarketConfig): string {
  if (!config.globalConfigObjectId) {
    throw new Error("Product transaction builders require globalConfigObjectId in market config.");
  }
  return config.globalConfigObjectId;
}

function u64Argument(
  tx: Transaction,
  value: bigint | TransactionArgument,
): TransactionArgument {
  return typeof value === "bigint" ? tx.pure.u64(value) : value;
}

function requirePtOrderbookObjectId(config: JitterMarketConfig): string {
  if (!config.orderbookObjectId) {
    throw new Error("PT route transaction builders require orderbookObjectId in market config.");
  }
  return config.orderbookObjectId;
}

function requireConfigValue(value: string | undefined, field: string): string {
  if (!value) {
    throw new Error(`Missing Jitter market config field: ${field}.`);
  }
  return value;
}

function orderIdsArg(
  tx: Transaction,
  orderIds: Array<bigint | number | string>,
): TransactionArgument {
  return tx.pure.vector(
    "u64",
    orderIds.map((value) => BigInt(value)),
  );
}

function newTransaction(
  options: CreateJitterTransactionServiceOptions,
  senderAddress: string,
): Transaction {
  const tx = new Transaction();
  tx.setSender(senderAddress);
  if (options.gasBudget !== undefined) {
    tx.setGasBudget(options.gasBudget);
  }
  return tx;
}

async function resolveSyIndex(
  options: CreateJitterTransactionServiceOptions,
  override?: bigint,
): Promise<bigint> {
  if (override !== undefined) return override;
  if (options.resolveSyIndex) return options.resolveSyIndex();
  return DEFAULT_DEMO_SY_INDEX;
}

