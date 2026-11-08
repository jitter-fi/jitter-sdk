import { expect, spyOn, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { makeTestMarketConfig } from "./fakes.js";
import { getJitterAdapterManifest } from "../adapters/registry.js";
import { addHaedalStake, addHaedalMintReceiptToSy, getHaedalStakeQuote, HAEDAL_RECEIPT_TYPE } from "../adapters/haedal.js";
import { getSuiGrpcClient } from "../rpc.js";
import { createJitterQuoteService } from "../services/quote-service.js";
import { createJitterTransactionService } from "../services/transaction-service.js";
import { createJitterTradeService } from "../services/trade-service.js";
import { createJitterMarketDataService, getMissingTradeReadyConfigKeys } from "../services/market-data-service.js";
import { InMemoryJitterMarketConfigProvider, InMemoryJitterChainReader, makeTestPoolFields, makeTestPyStateFields } from "./fakes.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
export const haedalConfig = () => makeTestMarketConfig({
  demoMarketVaultObjectId: "", adapterKind: "haedal", underlyingTypeTag: "0x2::sui::SUI",
  haedalAdapterPackageId: id(101), haedalMarketVaultObjectId: id(102),
  haedalStakingObjectId: id(103), haedalProtocolPackageId: id(104),
  jitterMathPackageId: id(105), globalConfigObjectId: id(106),
  marketObjectId: id(107), pyStateObjectId: id(107), poolObjectId: id(107), rewardDistributorObjectId: id(108),
});

test("Haedal manifest deposits SUI but never claims SUI redemption", () => {
  const config = haedalConfig();
  const adapter = getJitterAdapterManifest(config);
  expect(adapter.kind).toBe("haedal");
  expect(adapter.canDepositUnderlying).toBe(true);
  expect(adapter.canRedeemUnderlying).toBe(false);
  expect(adapter.redeemOutputType(config)).toBe(HAEDAL_RECEIPT_TYPE);
  const tx = new Transaction();
  adapter.addPriceInfo({ tx, config });
  const calls = tx.getData().commands.filter(c => c.$kind === "MoveCall").map(c => c.MoveCall);
  expect(calls.find(c => c.module === "haedal_price_ticket")?.arguments).toHaveLength(5);
  expect(calls.at(-1)?.function).toBe("aggregate");
  const collector = calls.find(c => c.module === "collector")!;
  const collectorInput = collector.arguments[0]!;
  expect(collectorInput.$kind).toBe("Input");
  expect(tx.getData().inputs[collectorInput.$kind === "Input" ? collectorInput.Input : -1]?.$kind).toBe("Pure");
  const encodedId = tx.getData().inputs[collectorInput.$kind === "Input" ? collectorInput.Input : -1]?.Pure;
  expect(bcs.Address.parse(Buffer.from(encodedId!.bytes, "base64"))).toBe(config.marketObjectId);
  expect(calls.at(-1)?.arguments).toHaveLength(4);
});

test("native stake and receipt mint use actual returned coin value and dynamic exact-in", () => {
  const tx = new Transaction();
  const config = haedalConfig();
  const receipt = addHaedalStake(tx, config, tx.object(id(200)));
  addHaedalMintReceiptToSy(tx, config, receipt, 1n);
  const calls = tx.getData().commands.filter(c => c.$kind === "MoveCall").map(c => c.MoveCall);
  expect(calls[0]?.function).toBe("request_stake_coin");
  expect(calls[0]?.arguments).toHaveLength(4);
  expect(calls.find(c => c.function === "value")?.arguments[0]).toEqual({ Result: 0, $kind: "Result" });
  const mint = calls.find(c => c.function === "mint_sy_exact_in_market_state")!;
  expect(mint.arguments[3]?.$kind).toBe("Result");
  expect(calls.some(c => c.function === "deposit")).toBe(true);
  expect(calls.some(c => c.function === "assert_coin_min_value")).toBe(true);
});

test("missing math dependency rejects before adding receipt mint commands", () => {
  const tx = new Transaction();
  const config = haedalConfig();
  config.jitterMathPackageId = undefined;
  expect(() => addHaedalMintReceiptToSy(tx, config, tx.object(id(200)), 1n)).toThrow("jitterMathPackageId");
  expect(tx.getData().commands).toHaveLength(0);
});

test("incomplete Haedal configs cannot fall back to a leftover demo vault", () => {
  const config = haedalConfig();
  config.demoMarketVaultObjectId = id(999);
  config.haedalMarketVaultObjectId = undefined;
  config.jitterMathPackageId = undefined;
  const manifest = getJitterAdapterManifest(config);
  expect(manifest.kind).toBe("haedal");
  expect(getMissingTradeReadyConfigKeys(config)).toContain("haedalMarketVaultObjectId");
  expect(() => manifest.addPriceInfo({ tx: new Transaction(), config })).toThrow("haedalMarketVaultObjectId");
});

test("SUI quote uses upstream getter rather than rounded rate division", async () => {
  const client = getSuiGrpcClient("mainnet");
  const simulate = spyOn(client, "simulateTransaction").mockResolvedValue({
    $kind: "Transaction", commandResults: [92336589149n, 1082994n].map(n => ({ returnValues: [{ bcs: bcs.u64().serialize(n).toBytes() }] })),
  } as never);
  try {
    const service = createJitterQuoteService({ config: haedalConfig(), network: "mainnet" });
    const quote = await service.quoteUnderlyingToSy(100_000_000_000n, 1n << 64n);
    const index = 1082994n * (1n << 64n) / 1000000n;
    expect(quote.syIn).toBe((92336589149n * index / (1n << 64n)) * (1n << 64n) / index);
    expect(quote.syIn).not.toBe(100_000_000_000n * (1n << 64n) / index);
  } finally { simulate.mockRestore(); }
});

test("Haedal getter rejects failed Transaction status even when partial command results exist", async () => {
  const simulate = spyOn(getSuiGrpcClient("mainnet"), "simulateTransaction").mockResolvedValue({
    $kind: "Transaction", Transaction: { status: { success: false, error: { message: "MoveAbort" } } },
    commandResults: [92336589149n, 1082994n].map(n => ({ returnValues: [{ bcs: bcs.u64().serialize(n).toBytes() }] })),
  } as never);
  try {
    await expect(getHaedalStakeQuote("mainnet", haedalConfig(), 100_000_000_000n)).rejects.toThrow("simulation failed");
  } finally { simulate.mockRestore(); }
});

test("receipt input is converted once and Haedal sell quotes default to haSUI", async () => {
  const config = haedalConfig();
  const reader = spyOn(getSuiGrpcClient("mainnet"), "getObject").mockResolvedValue({ object: { json: {
    receipt_balance: { value: "1000000" }, queued_receipt: "0", withdraw_window_ms: "86400000",
    withdraw_window_start_ms: "0", withdraw_bps_per_window: "1000", withdraw_window_base_reserve: "1000000",
    withdraw_window_withdrawn: "0", withdraw_window_minted: "0",
  } } } as never);
  try {
    const service = createJitterTradeService({ marketId: "h", config, network: "mainnet",
      quoteService: createJitterQuoteService({ config, delegates: {
        quoteSwapPtForSy: async () => ({ syOut: 80n, slippageBps: 0n }),
      } }) });
    const quote = await service.quoteTrade({ marketId: "h", product: "pt", side: "sell", inputAsset: "pt", amount: "80",
      owner: id(200), slippageBps: 100, syIndex: (1n << 64n).toString() });
    expect(quote.expectedOutput).toEqual([{ asset: "marketCoin", amount: "80" }]);
  } finally { reader.mockRestore(); }
});

for (const kind of ["Pt", "Yt"] as const) {
  test(`Haedal ${kind} receipt builders do not expose SUI redemption`, async () => {
    const service = createJitterTransactionService({ config: haedalConfig() });
    const params = { senderAddress: id(200), positionId: id(201), ptAmount: 100n, ytAmount: 100n,
      minSyOut: 1n, syIndex: 1n << 64n, rewardSettlement: { strategy: "empty-vector" as const } };
    await expect(service[`buildSell${kind}ToUnderlyingTx`](params)).rejects.toThrow("underlying");
    const tx = await service[`buildSell${kind}ToReceiptTx`](params);
    expect(tx.getData().commands.filter(c => c.$kind === "MoveCall").some(c => c.MoveCall.function === "redeem_receipt")).toBe(true);
  });
}

const common = { senderAddress: id(200), positionId: id(201), syIndex: 1082994n * (1n << 64n) / 1000000n,
  rewardSettlement: { strategy: "empty-vector" as const }, minPtOut: 1n, minYtOut: 1n, minSyOut: 1n, minLpOut: 1n,
  syToMintHint: 50n, underlyingAmount: 100n, marketCoinAmount: 100n, marketCoinId: id(202), inputCoinId: id(203), inputAmount: 100n };

for (const method of ["buildBuyPtFromUnderlyingTx", "buildBuyYtFromUnderlyingTx", "buildAddLpKeepYtFromUnderlyingTx", "buildAddLpFromSyFromUnderlyingTx", "buildBuyPtFromMarketCoinTx", "buildBuyYtFromMarketCoinTx", "buildAddLpKeepYtFromMarketCoinTx", "buildAddLpFromSyFromMarketCoinTx"] as const) {
  test(`${method} sweeps only deposit receipt change, not router refunds`, async () => {
    const tx = await createJitterTransactionService({config:haedalConfig(),depositDustToTreasury:true})[method](common);
    const commands = tx.getData().commands;
    const sends = commands.filter(c=>c.MoveCall?.function === "send_funds");
    expect(sends).toHaveLength(1);
    expect(sends[0].MoveCall!.typeArguments).toEqual([HAEDAL_RECEIPT_TYPE]);
    expect(commands.some(c=>c.MoveCall?.function === "assert_coin_max_value")).toBe(true);
    const routerIndex = commands.findIndex(c=>c.MoveCall?.module === "router" && /^(buy_|add_lp)/.test(c.MoveCall.function));
    expect(commands.findIndex(c=>c.MoveCall?.function === "send_funds")).toBeLessThan(routerIndex);
    expect(commands.some(c=>c.TransferObjects?.objects.some(o=>o.$kind === "NestedResult" && o.NestedResult[0] === routerIndex))).toBe(true);
  });
}

for (const [method, stake] of [
  ["buildBuyPtFromUnderlyingTx", true], ["buildBuyYtFromUnderlyingTx", true],
  ["buildAddLpKeepYtFromUnderlyingTx", true], ["buildAddLpFromSyFromUnderlyingTx", true],
  ["buildBuyPtFromMarketCoinTx", false], ["buildBuyYtFromMarketCoinTx", false],
  ["buildAddLpKeepYtFromMarketCoinTx", false], ["buildAddLpFromSyFromMarketCoinTx", false],
  ["buildBuyPtTx", false], ["buildBuyYtTx", false], ["buildAddLpKeepYtTx", false], ["buildAddLpFromSyTx", false],
] as const) {
  test(`${method} supports Haedal without Scallop or upstream unstake commands`, async () => {
    const tx = await createJitterTransactionService({ config: haedalConfig() })[method]({
      ...common, minYtOut: method.includes("KeepYt") ? 0n : common.minYtOut,
    });
    const calls = tx.getData().commands.filter(c => c.$kind === "MoveCall").map(c => c.MoveCall);
    expect(calls.some(c => c.function === "request_stake_coin")).toBe(stake);
    expect(calls.some(c => /scallop|unstake/.test(c.module + c.function))).toBe(false);
    expect(calls.some(c => c.module === "haedal_price_ticket")).toBe(true);
  });
}

test("LP receipt exit supports active, settled and direct routes", async () => {
  for (const route of ["active-swap", "settled-redeem", "direct-sy"] as const) {
    const tx = await createJitterTransactionService({ config: haedalConfig() }).buildRemoveLpToReceiptTx({
      ...common, route, lpAmount: 100n, minTotalSyOut: 1n,
    });
    const calls = tx.getData().commands.filter(c => c.$kind === "MoveCall").map(c => c.MoveCall);
    expect(calls.at(-1)?.function).toBe("redeem_receipt");
  }
});

test("Haedal metadata requires every execution dependency and never treats an undiscovered market as enabled", () => {
  const config = haedalConfig();
  const provider = new InMemoryJitterMarketConfigProvider([{ id: "h", name: "haSUI", config, network: "mainnet", chainId: "35834a8a", tradeReady: false }]);
  const service = createJitterMarketDataService({ network: "mainnet", configProvider: provider, chainReader: new InMemoryJitterChainReader() });
  expect(service.getMarketTradeMetadata("h")).toMatchObject({ adapterKind: "haedal", tradeReady: false, missingConfigKeys: [] });
  expect(service.getMarketTradeMetadata("h")!.actions.find(a => a.id === "buy_pt")!.inputAssets).toContain("marketCoin");
});

test("receipt buy quote does not invoke the native staking getter", async () => {
  const config = haedalConfig();
  const native = spyOn(getSuiGrpcClient("mainnet"), "simulateTransaction").mockRejectedValue(new Error("must not stake"));
  let observed = 0n;
  try {
    const service = createJitterTradeService({ marketId: "h", config, quoteService: createJitterQuoteService({ config,
      delegates: { quoteSwapSyForPt: async syIn => { observed = syIn; return { ptOut: syIn, slippageBps: 0n }; } },
    }) });
    const index = 1082994n * (1n << 64n) / 1000000n;
    const quote = await service.quoteTrade({ marketId: "h", product: "pt", side: "buy", inputAsset: "marketCoin", amount: "1000",
      owner: id(200), slippageBps: 100, syIndex: index.toString() });
    expect(quote.status).toBe("available");
    expect(observed).toBe((1000n * index / (1n << 64n)) * (1n << 64n) / index);
    expect(native).not.toHaveBeenCalled();
  } finally { native.mockRestore(); }
});

test("reviewed receipt output rejects lost capacity rather than returning a different asset", async () => {
  const config = haedalConfig();
  let exhausted = false;
  const read = spyOn(getSuiGrpcClient("mainnet"), "getObject").mockImplementation(async () => ({ object: { json: {
    receipt_balance: { value: exhausted ? "0" : "1000000" }, queued_receipt: "0", withdraw_window_ms: "86400000",
    withdraw_window_start_ms: "0", withdraw_bps_per_window: "1000", withdraw_window_base_reserve: "1000000",
    withdraw_window_withdrawn: "0", withdraw_window_minted: "0",
  } } }) as never);
  try {
    const service = createJitterTradeService({ marketId: "h", config, network: "mainnet",
      quoteService: createJitterQuoteService({ config, delegates: { quoteSwapPtForSy: async () => ({ syOut: 80n, slippageBps: 0n }) } }) });
    const request = { marketId: "h", product: "pt" as const, side: "sell" as const, inputAsset: "pt" as const,
      amount: "80", owner: id(200), slippageBps: 100, syIndex: (1n << 64n).toString() };
    const quote = await service.quoteTrade(request);
    expect(quote.expectedOutput[0]?.asset).toBe("marketCoin");
    exhausted = true;
    await expect(service.buildTradeTransaction({ ...request, reviewedQuote: quote, positionId: id(201) })).rejects.toThrow("capacity changed");
    expect((await service.quoteTrade(request)).status).toBe("unavailable");
  } finally { read.mockRestore(); }
});

test("receipt and SY USD prices use explicit underlying USD and a live index, never stored py_index", async () => {
  const config = { ...haedalConfig(), underlyingPriceUsd: 2 };
  const reader = new InMemoryJitterChainReader({ objects: new Map([[config.marketObjectId, {
    ...makeTestPoolFields(), ...makeTestPyStateFields(), py_index_stored: ((1n << 64n) * 5n).toString(),
  }]]) });
  const simulate = spyOn(getSuiGrpcClient("mainnet"), "simulateTransaction").mockResolvedValue({
    $kind: "Transaction", commandResults: [0n, 1082994n].map(n => ({ returnValues: [{ bcs: bcs.u64().serialize(n).toBytes() }] })),
  } as never);
  try {
    const service = createJitterMarketDataService({ network: "mainnet", configProvider: new InMemoryJitterMarketConfigProvider([]), chainReader: reader });
    const overview = await service.getMarketSnapshot(config);
    expect(overview.marketCoinPrice).toBeCloseTo(2.165988, 8);
    expect(overview.syPrice).toBeCloseTo(2.165988, 8);
    simulate.mockRejectedValue(new Error("upstream unavailable"));
    expect((await service.getMarketSnapshot(config)).syPrice).toBeUndefined();
    expect((await service.getMarketSnapshot({ ...config, underlyingPriceUsd: undefined })).marketCoinPrice).toBeUndefined();
  } finally { simulate.mockRestore(); }
});
