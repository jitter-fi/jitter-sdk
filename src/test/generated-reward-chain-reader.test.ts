import { describe, expect, test } from "bun:test";
import { bcs } from "@mysten/sui/bcs";
import { createGeneratedRewardChainReader } from "../infrastructure/generated-reward-chain-reader.js";
import type { JitterMarketConfig } from "../types.js";
const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const config = {
  marketObjectId: id(1),
  marketStateObjectId: id(1),
  jitterExtensionsPackageId: id(2),
  globalConfigObjectId: id(3),
  syTypeTag: "0x1::sy::SY",
  ptTypeTag: "0x1::pt::PT",
  ytTypeTag: "0x1::yt::YT",
  liquidlink: {
    enabled: true,
    liquidlinkPackageId: id(4),
    liquidlinkGlobalConfigObjectId: id(5),
    pointPrograms: [
      {
        label: "Season 1",
        scoreboardObjectId: id(6),
        projectObjectId: id(7),
        pointConfigObjectId: id(8),
        lpPointStateObjectId: id(9),
        scopes: ["yt", "lp", "pool"],
      },
    ],
  },
} as JitterMarketConfig;
const input = {
  network: "mainnet" as const,
  scoreboardId: id(6),
  configs: [config],
};
function client() {
  const objects: Record<string, any> = {
    [id(8)]: {
      objectId: id(8),
      json: { scoreboard_id: id(6), project_object_id: id(7), closed: false },
    },
    [id(10)]: {
      objectId: id(10),
      json: { market_state_id: id(1) },
      owner: { $kind: "AddressOwner", AddressOwner: id(11) },
    },
    [id(12)]: {
      objectId: id(12),
      json: {
        name: { pos0: id(10) },
        value: { owner: id(11), raw_amount: "100" },
      },
      owner: { $kind: "ObjectOwner", ObjectOwner: id(8) },
    },
    [id(13)]: {
      objectId: id(13),
      json: {
        name: { pos0: id(10) },
        value: { owner: id(11), lp_amount: "50", pending_points: "0" },
      },
      owner: { $kind: "ObjectOwner", ObjectOwner: id(9) },
    },
  };
  return {
    objects,
    getObject: async ({ objectId }: any) => ({ object: objects[objectId] }),
    getObjects: async ({ objectIds }: any) => ({
      objects: objectIds.map((i: string) => objects[i]),
    }),
    listDynamicFields: async ({ parentId }: any) => ({
      hasNextPage: false,
      cursor: null as string|null,
      dynamicFields: [
        {
          fieldId: parentId === id(8) ? id(12) : id(13),
          name: { type: `${id(2)}::liquidlink_points::PositionKey` },
        },
      ],
    }),
  };
}
describe("generated chain reader", () => {
  function holdingClient() {
    const c = client();
    c.objects[id(6)] = { objectId: id(6), type: `${id(4)}::scoreboard::Scoreboard`, json: { project_id: id(20) } };
    c.objects[id(21)] = { objectId: id(21), type: `${id(4)}::token::PointTokenMarket<${id(22)}::point::POINT>`,
      owner: { $kind: "Shared", Shared: {} },
      json: { scoreboard_id: id(6), project_id: id(20), scale: "10", holdings: { id: id(23), size: "1" } } };
    c.objects[id(24)] = { objectId: id(24), json: { name: id(11), value: "405" },
      owner: { $kind: "ObjectOwner", ObjectOwner: id(23) } };
    c.listDynamicFields = async () => ({ hasNextPage: false, cursor: null,
      dynamicFields: [{ fieldId: id(24), name: { type: "address" } }] });
    return { ...c, movePackageService: { getPackage: async () => ({response: {package: {originalId: id(4)}}}) } };
  }
  const holdingInput = { ...input, trustedPointMarket: { pointTokenMarketId: id(21) } };
  test("discovers holding-only owners from the canonical mirror", async () => {
    expect(await createGeneratedRewardChainReader(holdingInput, holdingClient() as any).holders!()).toEqual([id(11)]);
  });
  test("discovers the Registry market without trusting tokenized wallet configuration", async () => {
    const snapshot = { extensions: [{kind: "pointTrading", scoreboardId: id(6), pointTokenMarketId: id(21)}], marketSources: [] } as any;
    const registryInput = { ...input, configs: [{...config, marketRegistryObjectId: id(30)}] };
    const reader = createGeneratedRewardChainReader(registryInput, holdingClient() as any, async () => snapshot);
    expect(await reader.holders!()).toEqual([id(11)]);
    await expect(createGeneratedRewardChainReader({ ...registryInput, trustedPointMarket: {pointTokenMarketId: id(99)} },
      holdingClient() as any, async () => snapshot).holders!()).rejects.toThrow("differs from Registry");
    await expect(createGeneratedRewardChainReader(registryInput, holdingClient() as any,
      async () => ({...snapshot, extensions: [...snapshot.extensions, ...snapshot.extensions]})).holders!()).rejects.toThrow("Ambiguous");
  });
  test("rejects missing and duplicate holding rows rather than publishing partial ranks", async () => {
    const missing = holdingClient(); missing.getObjects = async () => ({objects: []});
    await expect(createGeneratedRewardChainReader(holdingInput, missing as any).holders!()).rejects.toThrow("Incomplete");
    const wrongOwner = holdingClient(); wrongOwner.objects[id(24)].owner.ObjectOwner = id(99);
    await expect(createGeneratedRewardChainReader(holdingInput, wrongOwner as any).holders!()).rejects.toThrow("identity mismatch");
  });
  test("validates the market origin, Scoreboard, project, shared ownership, scale and complete table", async () => {
    for (const mutate of [
      (c: ReturnType<typeof holdingClient>) => { c.objects[id(21)].json.scoreboard_id = id(99); },
      (c: ReturnType<typeof holdingClient>) => { c.objects[id(21)].json.project_id = id(99); },
      (c: ReturnType<typeof holdingClient>) => { c.objects[id(21)].type = `${id(99)}::token::PointTokenMarket<${id(22)}::point::POINT>`; },
      (c: ReturnType<typeof holdingClient>) => { c.objects[id(21)].owner = { $kind: "AddressOwner", AddressOwner: id(11) }; },
      (c: ReturnType<typeof holdingClient>) => { c.objects[id(21)].json.scale = "0"; },
      (c: ReturnType<typeof holdingClient>) => { c.objects[id(21)].json.holdings.size = "2"; },
      (c: ReturnType<typeof holdingClient>) => {
        c.objects[id(6)].type = `${id(99)}::scoreboard::Scoreboard`;
        c.objects[id(21)].type = `${id(99)}::token::PointTokenMarket<${id(22)}::point::POINT>`;
      },
    ]) {
      const c = holdingClient(); mutate(c);
      await expect(createGeneratedRewardChainReader(holdingInput, c as any).holders!()).rejects.toThrow();
    }
  });
  test("reads score and scaled holdings together; never adds ask escrow", async () => {
    const c = { ...holdingClient(), simulateTransaction: async ({transaction}: any) => {
      expect(transaction.getData().commands.map((c: any) => c.MoveCall?.function)).toEqual([
        "get_unconverted_score_by_address", "get_unconverted_score_by_address", "holding_token_amount_by_address", "timestamp_ms",
      ]);
      return { $kind: "Transaction", Transaction: { status: { success: true } },
        commandResults: [60, 65, 405, 1000].map(n => ({ returnValues: [{bcs: bcs.u64().serialize(n).toBytes()}] })) };
    } };
    expect(await createGeneratedRewardChainReader(holdingInput, c as any).simulate(id(11), [])).toMatchObject({
      settledPoints: "60", pendingPoints: "5", tokenizedPoints: "40",
    });
  });
  test("accepts original object types while calling the configured upgraded runtime", async () => {
    const upgraded = {...holdingInput, configs: [{...config, liquidlink: {...config.liquidlink, liquidlinkPackageId: id(40)}}]};
    const c = { ...holdingClient(), simulateTransaction: async ({transaction}: any) => {
      const calls = transaction.getData().commands.map((c: any) => c.MoveCall);
      expect(calls.slice(0, 3).every((c: any) => c.package === id(40))).toBe(true);
      expect(calls[2].typeArguments).toEqual([`${id(22)}::point::POINT`]);
      return { $kind: "Transaction", Transaction: {status: {success: true}},
        commandResults: [0, 0, 405, 1000].map(n => ({returnValues: [{bcs: bcs.u64().serialize(n).toBytes()}]})) };
    }};
    expect((await createGeneratedRewardChainReader(upgraded, c as any).simulate(id(11), [])).tokenizedPoints).toBe("40");
  });
  test("discovers pending-only owners and merges YT/LP records for the same position", async () => {
    const c = client();
    const owners = await createGeneratedRewardChainReader(
      input,
      c as any,
    ).registered();
    expect(owners.size).toBe(1);
    expect(owners.get(id(11))).toMatchObject([
      { positionId: id(10), yt: true, lp: true },
    ]);
  });
  test("rejects missing point batches and ownership changes instead of returning partial ranks", async () => {
    const c = client();
    c.getObjects = async () => ({ objects: [] });
    await expect(
      createGeneratedRewardChainReader(input, c as any).registered(),
    ).rejects.toThrow("Incomplete point owner batch");
    const moved = client();
    moved.objects[id(10)].owner.AddressOwner = id(20);
    await expect(
      createGeneratedRewardChainReader(input, moved as any).registered(),
    ).rejects.toThrow("owner changed");
  });
  test("rejects a stalled pagination cursor", async () => {
    const c = client();
    c.listDynamicFields = async () => ({
      hasNextPage: true,
      cursor: "stalled",
      dynamicFields: [],
    });
    await expect(
      createGeneratedRewardChainReader(input, c as any).registered(),
    ).rejects.toThrow("Stalled");
  });
  test("reads before and after scores in one unsigned simulation; never submits", async () => {
    const c = client();
    let simulations = 0;
    const rpc = {
      ...c,
      simulateTransaction: async ({ transaction, checksEnabled }: any) => {
        simulations++;
        expect(checksEnabled).toBe(false);
        const commands = transaction.getData().commands;
        expect(commands.map((c: any) => c.MoveCall?.function)).toEqual([
          "get_unconverted_score_by_address",
          "get_unconverted_score_by_address",
          "timestamp_ms",
        ]);
        return {
          $kind: "Transaction",
          Transaction: { status: { success: true } },
          commandResults: [100, 150, 1000].map((n) => ({
            returnValues: [{ bcs: bcs.u64().serialize(n).toBytes() }],
          })),
        };
      },
    };
    expect(
      await createGeneratedRewardChainReader(input, rpc as any).simulate(
        id(11),
        [],
      ),
    ).toEqual({
      owner: id(11),
      settledPoints: "100",
      pendingPoints: "50",
      updatedAtMs: "1000",
    });
    expect(simulations).toBe(1);
  });
  test("does not interpret a failed simulation as zero pending", async () => {
    const c = {
      ...client(),
      simulateTransaction: async () => ({ $kind: "FailedTransaction" }),
    };
    await expect(
      createGeneratedRewardChainReader(input, c as any).simulate(id(11), []),
    ).rejects.toThrow("simulation failed");
  });
});
