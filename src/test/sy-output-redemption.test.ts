import { expect, spyOn, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { buildWithSyOutputRedemption, syOutputSimulator } from "../services/sy-output-redemption.js";
import { getSuiGrpcClient } from "../rpc.js";
import { getDefaultJitterMarketConfig } from "../config.js";
import type { SyOutputTransform } from "../services/transaction-service.js";

const id = (suffix: string) => `0x${suffix.padStart(64, "0")}`;
const owner = id("aa");
const base = getDefaultJitterMarketConfig("testnet")!;
const config = { ...base, adapterKind: "scallop" as const,
  demoMarketVaultObjectId: "",
  scallopAdapterPackageId: id("ab"), scallopMarketVaultObjectId: id("ac") };

function build(outputs: number) {
  return async (transform: SyOutputTransform) => {
    const tx = new Transaction();
    tx.setSender(owner);
    for (let i = 0; i < outputs; i++) {
      const coin = tx.object(id(String(i + 1)));
      const result = transform(tx, coin);
      if (result) tx.transferObjects([result], tx.pure.address(owner));
    }
    return tx;
  };
}
function calls(tx: Transaction) {
  return tx.getData().commands.flatMap(c => c.$kind === "MoveCall" ? [c.MoveCall] : []);
}

test("probes actual SY amounts and redeems positive output only to Scallop YBA", async () => {
  let simulations = 0;
  const result = await buildWithSyOutputRedemption({ config, build: build(2),
    simulate: async (tx, indexes) => {
      simulations++;
      if (simulations === 1) {
        expect(indexes).toHaveLength(2);
        expect(calls(tx).filter(c => c.function === "value")).toHaveLength(2);
        return [0n, 123n];
      }
      expect(indexes).toEqual([]);
      expect(calls(tx).map(c => c.function)).toEqual(["destroy_zero", "redeem"]);
      expect(calls(tx).every(c => c.module !== "redeem")).toBe(true);
      return [];
    } });
  expect(simulations).toBe(2);
  expect(result.redeemedSyAmount).toBe(123n);
  expect(result.zeroOutputs).toBe(1);
});

test.each(["haedal", "ember"] as const)("%s returns YBA without upstream withdrawal", async (kind) => {
  const receiptConfig = { ...config, adapterKind: kind,
    [`${kind}AdapterPackageId`]: id("ad"), [`${kind}MarketVaultObjectId`]: id("ae"),
    emberReceiptTypeTag: `${id("af")}::receipt::RECEIPT` };
  const result = await buildWithSyOutputRedemption({ config: receiptConfig, build: build(1),
    simulate: async (_tx, indexes) => indexes.length ? [10n] : [] });
  expect(calls(result.transaction).map(c => c.function)).toEqual(["redeem_receipt"]);
});

test("does not return a transaction if complete redemption simulation fails", async () => {
  await expect(buildWithSyOutputRedemption({ config, build: build(1),
    simulate: async (_tx, indexes) => {
      if (indexes.length) return [10n];
      throw new Error("Withdrawal capacity changed");
    } })).rejects.toThrow("Withdrawal capacity changed");
});

test("does not interpret a missing probe result as zero", async () => {
  await expect(buildWithSyOutputRedemption({ config, build: build(1),
    simulate: async () => [] })).rejects.toThrow("Missing SY output");
});

test("rejects output layout changes between the two builds", async () => {
  let builds = 0;
  await expect(buildWithSyOutputRedemption({ config,
    build: transform => build(++builds)(transform),
    simulate: async () => [1n],
  })).rejects.toThrow("SY output layout changed");
});

test("reads probe indexes after coin intents insert commands", async () => {
  const tx = new Transaction();
  tx.moveCall({ target: "0x2::coin::value", typeArguments: [config.syTypeTag], arguments: [tx.object(id("1"))] });
  const prefix = new Transaction();
  prefix.moveCall({ target: "0x2::coin::zero", typeArguments: [config.syTypeTag] });
  let restoreData = () => {};
  let resolved = false;
  const build = spyOn(tx, "build").mockImplementation(async () => {
    if (resolved) return new Uint8Array();
    resolved = true;
    if (tx.getData().gasData.budget == null) tx.setGasBudget(10_000n);
    const data = tx.getData();
    const read = spyOn(tx, "getData").mockReturnValue({ ...data, commands: [...prefix.getData().commands, ...data.commands] });
    restoreData = () => read.mockRestore();
    return new Uint8Array();
  });
  const simulate = spyOn(getSuiGrpcClient("testnet"), "simulateTransaction").mockResolvedValue({
    $kind: "Transaction", Transaction: { status: { success: true } },
    commandResults: [999n, 123n].map(value => ({ returnValues: [{ bcs: bcs.u64().serialize(value).toBytes() }] })),
  } as never);
  try {
    expect(await syOutputSimulator("testnet")(tx, [0])).toEqual([123n]);
    expect(simulate.mock.calls[0]?.[0].checksEnabled).toBe(true);
  } finally { restoreData(); build.mockRestore(); simulate.mockRestore(); }
});

test("transport rejects failed execution and absent command results", async () => {
  const tx = new Transaction();
  tx.setGasBudget(10_000n);
  tx.moveCall({ target: "0x2::coin::value", typeArguments: [config.syTypeTag], arguments: [tx.object(id("1"))] });
  const build = spyOn(tx, "build").mockResolvedValue(new Uint8Array());
  const simulate = spyOn(getSuiGrpcClient("testnet"), "simulateTransaction").mockResolvedValue({
    $kind: "Transaction", Transaction: { status: { success: false, error: { message: "quota exhausted" } } },
  } as never);
  try {
    await expect(syOutputSimulator("testnet")(tx, [0])).rejects.toThrow("quota exhausted");
    simulate.mockResolvedValue({ $kind: "Transaction", Transaction: { status: { success: true } } } as never);
    await expect(syOutputSimulator("testnet")(tx, [0])).rejects.toThrow("Missing SY output");
  } finally { build.mockRestore(); simulate.mockRestore(); }
});

test("automatic gas selection leaves headroom before the second checked simulation", async () => {
  const tx = new Transaction();
  tx.moveCall({target:'0x2::coin::value',typeArguments:[config.syTypeTag],arguments:[tx.object(id('1'))]});
  const build = spyOn(tx,'build').mockImplementation(async()=>{
    if(tx.getData().gasData.budget==null)tx.setGasBudget(9_759_582n);
    return new Uint8Array();
  });
  const simulate = spyOn(getSuiGrpcClient('testnet'),'simulateTransaction').mockImplementation(async input=>{
    const budget=BigInt((input.transaction as Transaction).getData().gasData.budget!);
    return budget<9_859_582n
      ? {$kind:'FailedTransaction',FailedTransaction:{status:{success:false,error:{message:'InsufficientGas'}}}} as never
      : {$kind:'Transaction',Transaction:{status:{success:true}},commandResults:[{returnValues:[{bcs:bcs.u64().serialize(0n).toBytes()}]}]} as never;
  });
  try{
    expect(await syOutputSimulator('testnet')(tx,[0])).toEqual([0n]);
    expect(tx.getData().gasData.budget).toBe('11711499');
    expect(simulate.mock.calls[0]![0].checksEnabled).toBe(true);
  }finally{build.mockRestore();simulate.mockRestore();}
});

test("an explicitly supplied gas budget is never increased or retried",async()=>{
  const tx=new Transaction();tx.setGasBudget(9_759_582n);
  const build=spyOn(tx,'build').mockResolvedValue(new Uint8Array());
  const simulate=spyOn(getSuiGrpcClient('testnet'),'simulateTransaction').mockResolvedValue({$kind:'FailedTransaction',FailedTransaction:{status:{success:false,error:{message:'InsufficientGas'}}}} as never);
  try{
    await expect(syOutputSimulator('testnet')(tx,[])).rejects.toThrow('InsufficientGas');
    expect(tx.getData().gasData.budget).toBe('9759582');
    expect(simulate).toHaveBeenCalledTimes(1);
  }finally{build.mockRestore();simulate.mockRestore();}
});
