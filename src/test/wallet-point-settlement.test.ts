import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import type { JitterMarketConfig } from "../types.js";
import {
  prepareWalletPointSettlement,
  type WalletPointSettlementDependencies,
} from "../services/wallet-point-settlement.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
function config(market = 10): JitterMarketConfig {
  return {
    marketObjectId: id(market),
    marketStateObjectId: id(market),
    poolObjectId: id(market + 1),
    jitterPackageId: id(1),
    jitterExtensionsPackageId: id(2),
    globalConfigObjectId: id(3),
    syTypeTag: `${id(4)}::sy::SY`,
    ptTypeTag: `${id(4)}::pt::PT`,
    ytTypeTag: `${id(4)}::yt::YT`,
    liquidlink: {
      enabled: true,
      liquidlinkPackageId: id(5),
      liquidlinkGlobalConfigObjectId: id(6),
      pointPrograms: [
        {
          label: "Season",
          protocol: "Jitter",
          pointConfigObjectId: id(7),
          projectObjectId: id(8),
          scoreboardObjectId: id(9),
          lpPointStateObjectId: id(market + 2),
          scopes: ["yt", "lp", "pool"],
        },
      ],
    },
  } as JitterMarketConfig;
}
function deps(
  positions = [
    {
      id: id(30),
      marketId: id(10),
      poolId: id(11),
      ytBalance: 50n,
      lpAmount: 40n,
    },
  ],
): WalletPointSettlementDependencies {
  return {
    getPositions: async () => positions,
    resolveConfig: async (c) => c,
    hasLedger: async () => false,
    getReferralRecords: async () => ({}),
    assertClosedPrepared: async () => {},
  };
}
const base = () => {
  const tx = new Transaction();
  tx.setSender(id(20));
  return tx;
};
const calls = (tx: Transaction) =>
  tx
    .getData()
    .commands.flatMap((c) => (c.MoveCall ? [c.MoveCall.function] : []));

describe("wallet-wide point settlement", () => {
  test("rejects a sender mismatch before scanning another wallet", async () => {
    await expect(
      prepareWalletPointSettlement({
        network: "mainnet",
        owner: id(21),
        configs: [config()],
        transaction: base(),
        dependencies: {
          ...deps(),
          getPositions: async () => {
            throw Error("must not read");
          },
        },
      }),
    ).rejects.toThrow("sender mismatch");
  });
  test.each([
    ["checkpoint_yt", 0, 4],
    ["sync_py_position_with_referral_points", 2, 6],
    ["claim_lp_points", 0, 6],
    ["claim_lp_points_with_referral_points", 0, 8],
    ["settle_yt_reward_operation", 2, 6],
    ["settle_yt_reward_operation_with_referral", 2, 8],
    ["settle_lp_reward_operation", 2, 8],
    ["settle_lp_reward_operation_with_referral", 2, 11],
  ] as const)(
    "recognizes the exact %s ABI scope",
    async (name, configArg, positionArg) => {
      const tx = base();
      const args = Array.from({ length: positionArg + 1 }, (_, index) =>
        tx.object(id(100 + index)),
      );
      args[configArg] = tx.object(id(7));
      args[positionArg] = tx.object(id(30));
      tx.moveCall({
        target: `${id(2)}::liquidlink_points::${name}`,
        arguments: args,
      });
      const result = await prepareWalletPointSettlement({
        network: "mainnet",
        owner: id(20),
        configs: [config()],
        transaction: tx,
        dependencies: deps(),
      });
      expect(result.coveredCount).toBe(1);
      expect(result.targetCount).toBe(1);
    },
  );
  test("an untrusted package cannot suppress a wallet checkpoint", async () => {
    const tx = base();
    tx.moveCall({
      target: `${id(99)}::liquidlink_points::checkpoint_yt`,
      arguments: [
        tx.object(id(7)),
        tx.object(id(8)),
        tx.object(id(3)),
        tx.object(id(6)),
        tx.object(id(30)),
      ],
    });
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config()],
      transaction: tx,
      dependencies: deps(),
    });
    expect(result.coveredCount).toBe(0);
    expect(result.targetCount).toBe(2);
  });
  test("re-estimates composed gas rather than reusing the original trade budget", async () => {
    const tx = base();
    tx.setGasBudget(1_000);
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config()],
      transaction: tx,
      dependencies: deps(),
    });
    expect(result.transaction!.getData().gasData.budget).toBeNull();
    expect(result.transaction!.getData().gasData.payment).toBeNull();
    expect(tx.getData().gasData.budget).toBe("1000");
  });
  test("disabled sources settle only existing ledgers, including earned tails", async () => {
    const c = config();
    c.liquidlink!.enabled = false;
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [c],
      transaction: base(),
      dependencies: {
        ...deps(),
        hasLedger: async (_c, _p, _id, scope) => scope === "lp",
      },
    });
    expect(result.targetCount).toBe(1);
    expect(calls(result.transaction!)).toEqual([
      "claim_lp_points",
      "settle_stamp",
    ]);
    expect(c.liquidlink!.enabled).toBe(false);
  });
  test("settles YT and LP on every owned market, not just the traded market", async () => {
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config(), config(40)],
      transaction: base(),
      dependencies: deps([
        {
          id: id(30),
          marketId: id(10),
          poolId: id(11),
          ytBalance: 50n,
          lpAmount: 40n,
        },
        {
          id: id(50),
          marketId: id(40),
          poolId: id(41),
          ytBalance: 20n,
          lpAmount: 10n,
        },
      ]),
    });
    expect(result.targetCount).toBe(4);
    expect(result.kind).toBe("combined");
    expect(calls(result.transaction!)).toEqual([
      "checkpoint_yt",
      "settle_stamp",
      "claim_lp_points",
      "settle_stamp",
      "checkpoint_yt",
      "settle_stamp",
      "claim_lp_points",
      "settle_stamp",
    ]);
  });
  test("deduplicates market aliases and positions without dropping LP beside YT", async () => {
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config(), config()],
      transaction: base(),
      dependencies: deps(),
    });
    expect(result.targetCount).toBe(2);
  });
  test("preserves original nested results and places settlement before a destructive operation", async () => {
    const tx = base();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1)]);
    tx.transferObjects([coin], tx.pure.address(id(20)));
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config()],
      transaction: tx,
      dependencies: deps(),
    });
    const commands = result.transaction!.getData().commands;
    expect(commands[0]!.MoveCall!.function).toBe("checkpoint_yt");
    const transferred = commands.at(-1)!.TransferObjects!.objects[0]!;
    expect("NestedResult" in transferred && transferred.NestedResult).toEqual([
      4, 0,
    ]);
    expect(tx.getData().commands.length).toBe(2);
  });
  test("skips only the exact position/program/scope already checkpointed by the main transaction", async () => {
    const tx = base();
    tx.moveCall({
      target: `${id(2)}::liquidlink_points::checkpoint_yt`,
      arguments: [
        tx.object(id(7)),
        tx.object(id(8)),
        tx.object(id(3)),
        tx.object(id(6)),
        tx.object(id(30)),
        tx.object(id(10)),
        tx.object.clock(),
      ],
      typeArguments: [
        config().syTypeTag,
        config().ptTypeTag,
        config().ytTypeTag,
      ],
    });
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config()],
      transaction: tx,
      dependencies: deps(),
    });
    expect(result.coveredCount).toBe(1);
    expect(result.targetCount).toBe(1);
    expect(
      calls(result.transaction!).filter((x) => x === "checkpoint_yt"),
    ).toHaveLength(1);
  });
  test("cannot silently omit unknown markets or a failed position read", async () => {
    await expect(
      prepareWalletPointSettlement({
        network: "mainnet",
        owner: id(20),
        configs: [config()],
        transaction: base(),
        dependencies: deps([
          {
            id: id(30),
            marketId: id(99),
            poolId: id(0),
            ytBalance: 1n,
            lpAmount: 0n,
          },
        ]),
      }),
    ).rejects.toThrow("not configured");
    await expect(
      prepareWalletPointSettlement({
        network: "mainnet",
        owner: id(20),
        configs: [config()],
        transaction: base(),
        dependencies: {
          ...deps(),
          getPositions: async () => {
            throw Error("RPC unavailable");
          },
        },
      }),
    ).rejects.toThrow("RPC unavailable");
  });
  test("empty exposure can still settle an existing pending ledger", async () => {
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config()],
      transaction: base(),
      dependencies: {
        ...deps([
          {
            id: id(30),
            marketId: id(10),
            poolId: id(11),
            ytBalance: 0n,
            lpAmount: 0n,
          },
        ]),
        hasLedger: async () => true,
      },
    });
    expect(result.targetCount).toBe(2);
  });
  test("large wallets return explicit batches and never a partly synchronized trade", async () => {
    const result = await prepareWalletPointSettlement({
      network: "mainnet",
      owner: id(20),
      configs: [config()],
      transaction: base(),
      dependencies: deps(),
      limits: { maxTargets: 1 },
    });
    expect(result.kind).toBe("batches");
    expect(result.transaction).toBeNull();
    expect(result.batches).toHaveLength(2);
    expect(result.targetCount).toBe(2);
  });
  test("closed-source preparation and missing referral records fail before signing", async () => {
    await expect(
      prepareWalletPointSettlement({
        network: "mainnet",
        owner: id(20),
        configs: [config()],
        transaction: base(),
        dependencies: {
          ...deps(),
          assertClosedPrepared: async () => {
            throw Error("Closed points require preparation");
          },
        },
      }),
    ).rejects.toThrow("Closed points require preparation");
    const c = config();
    c.liquidlink!.pointPrograms![0]!.referral = {
      policyStateObjectId: id(80),
      referralTableObjectId: id(81),
    };
    await expect(
      prepareWalletPointSettlement({
        network: "mainnet",
        owner: id(20),
        configs: [c],
        transaction: base(),
        dependencies: deps(),
      }),
    ).rejects.toThrow("referral");
  });
});
