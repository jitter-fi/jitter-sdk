import { afterEach, expect, spyOn, test } from "bun:test";
import { getDefaultJitterMarketConfig } from "../config.js";
import { getLiquidlinkLeaderboard, getLiquidlinkScoreInfo, readLiquidlinkScoreInfo } from "../queries.js";
import { getSuiGrpcClient } from "../rpc.js";
import { deriveDynamicFieldID } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const config = { ...getDefaultJitterMarketConfig("testnet")!, liquidlink: { enabled: true, scoreboardObjectId: id(1) } };
const client = getSuiGrpcClient("testnet");
const mocks: Array<{ mockRestore(): void }> = [];
afterEach(() => { for (const mock of mocks.splice(0)) mock.mockRestore(); });
function objects(values: Record<string, unknown> = {}) {
  mocks.push(spyOn(client, "getObject").mockImplementation(async ({ objectId }) => {
    if (objectId === id(1)) return { object: { json: { scores: { id: id(3) } } } } as never;
    if (!(objectId in values)) throw new Error("read failed");
    return { object: { json: values[objectId] } } as never;
  }));
  mocks.push(spyOn(client, "getObjects").mockImplementation(async ({ objectIds }) => ({
    objects: [...objectIds].reverse().map((objectId) => {
      if (!(objectId in values)) return new Error("read failed");
      return { objectId, json: values[objectId] };
    }),
  }) as never));
}
const field = (owner: number, score: string, debt = "0") => ({ name: id(owner), value: {
  score, score_debt: debt, score_per_duration: "0", duration: "1", updated_at: "1",
} });

test("leaderboard scans beyond limit and ranks available bigint points with address tie breaks", async () => {
  objects({ [id(4)]: field(20, "999999999999999999999", "999999999999999999998"),
    [id(5)]: field(22, "9007199254740993"), [id(6)]: field(21, "9007199254740993") });
  const list = spyOn(client, "listDynamicFields").mockImplementation(async ({ cursor }) => (cursor
    ? { dynamicFields: [{ fieldId: id(5) }, { fieldId: id(6) }], hasNextPage: false, cursor: null }
    : { dynamicFields: [{ fieldId: id(4) }], hasNextPage: true, cursor: "next" }) as never);
  mocks.push(list);
  const result = await getLiquidlinkLeaderboard("testnet", config, 2, 1n);
  expect(result.map(({ owner, rank, unconvertedScore }) => ({ owner, rank, unconvertedScore }))).toEqual([
    { owner: id(21), rank: 1, unconvertedScore: 9007199254740993n },
    { owner: id(22), rank: 2, unconvertedScore: 9007199254740993n },
  ]);
  expect(list).toHaveBeenCalledTimes(2);
  expect(client.getObjects).toHaveBeenCalledTimes(2);
});

for (const cursor of [null, "stalled"]) {
  test(`leaderboard rejects missing/repeated cursors: ${cursor}`, async () => {
    objects();
    mocks.push(spyOn(client, "listDynamicFields").mockResolvedValue({ dynamicFields: [], hasNextPage: true, cursor } as never));
    await expect(getLiquidlinkLeaderboard("testnet", config)).rejects.toThrow("pagination");
  });
}

test("leaderboard refuses incomplete scan beyond 1000 fields", async () => {
  objects(Object.fromEntries(Array.from({ length: 1001 }, (_, i) => [id(i + 10), field(i + 2000, "1")])));
  mocks.push(spyOn(client, "listDynamicFields").mockImplementation(async ({ cursor }) => {
    const start = Number(cursor ?? 0);
    return { dynamicFields: Array.from({ length: 50 }, (_, i) => ({ fieldId: id(start + i + 10) })),
      hasNextPage: true, cursor: String(start + 50) } as never;
  }));
  await expect(getLiquidlinkLeaderboard("testnet", config, 1)).rejects.toThrow("scan limit");
});

test("leaderboard read failure or malformed score never becomes zero/partial success", async () => {
  objects({ [id(4)]: { name: id(20), value: {} } });
  const list = spyOn(client, "listDynamicFields").mockResolvedValue({ dynamicFields: [{ fieldId: id(5) }], hasNextPage: false } as never);
  mocks.push(list);
  await expect(getLiquidlinkLeaderboard("testnet", config)).rejects.toThrow("read failed");
  list.mockResolvedValue({ dynamicFields: [{ fieldId: id(4) }], hasNextPage: false } as never);
  await expect(getLiquidlinkLeaderboard("testnet", config)).rejects.toThrow("score");
});

test("summary distinguishes missing field from transport/read failure", async () => {
  objects();
  const read = spyOn(client.ledgerService, "getObject").mockRejectedValue(new Error("offline"));
  mocks.push(read);
  await expect(getLiquidlinkScoreInfo("testnet", config, id(2))).rejects.toThrow("offline");
  read.mockRejectedValue(Object.assign(new Error("missing field"), { code: "NOT_FOUND" }));
  expect((await getLiquidlinkScoreInfo("testnet", config, id(2))).exists).toBe(false);
  read.mockResolvedValue({ response: { object: { objectId: deriveDynamicFieldID(id(3), "address", bcs.Address.serialize(id(2)).toBytes()) } } } as never);
  await expect(getLiquidlinkScoreInfo("testnet", config, id(2))).rejects.toThrow("read failed");
});

test("summary recognizes structured gRPC NOT_FOUND without swallowing other status errors", async () => {
  objects();
  const read = spyOn(client.ledgerService, "getObject").mockRejectedValue(Object.assign(new Error("missing field"), { code: "NOT_FOUND" }));
  mocks.push(read);
  expect((await getLiquidlinkScoreInfo("testnet", config, id(2))).exists).toBe(false);
  read.mockRejectedValue(Object.assign(new Error("unavailable"), { code: "UNAVAILABLE" }));
  await expect(getLiquidlinkScoreInfo("testnet", config, id(2))).rejects.toThrow("unavailable");
});

test("policy cutoff pagination cannot loop on a repeated cursor", async () => {
  let pages = 0;
  mocks.push(spyOn(client, "listDynamicFields").mockImplementation(async () => {
    if (++pages > 3) throw new Error("unbounded cutoff loop");
    return { dynamicFields: [], hasNextPage: true, cursor: "same" } as never;
  }));
  await expect(readLiquidlinkScoreInfo({ score: "0", linear_groups: [{ policies: [{}] }] },
    1n, 0n, "testnet", id(1))).rejects.toThrow("pagination");
});

test("leaderboard rejects missing pagination metadata instead of claiming completeness", async () => {
  objects();
  mocks.push(spyOn(client, "listDynamicFields").mockResolvedValue({ dynamicFields: [] } as never));
  await expect(getLiquidlinkLeaderboard("testnet", config)).rejects.toThrow("pagination");
});

test("leaderboard rejects incomplete, substituted and duplicate batch responses", async () => {
  objects();
  mocks.push(spyOn(client, "listDynamicFields").mockResolvedValue({ dynamicFields: [{ fieldId: id(4) }], hasNextPage: false } as never));
  const batch = client.getObjects as ReturnType<typeof spyOn<typeof client, "getObjects">>;
  for (const objects of [[], [{ objectId: id(5), json: field(20, "1") }],
    [{ objectId: id(4), json: field(20, "1") }, { objectId: id(4), json: field(20, "1") }]]) {
    batch.mockResolvedValue({ objects } as never);
    await expect(getLiquidlinkLeaderboard("testnet", config)).rejects.toThrow();
  }
});
