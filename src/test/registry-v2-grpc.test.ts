import { expect, spyOn, test } from "bun:test";
import { getSuiGrpcClient } from "../rpc.js";
import { SuiJitterChainReader } from "../infrastructure/sui-chain-reader.js";
import { listRegistryMarkets } from "../registry-v2.js";
import { registryFixture, id } from "./registry-v2-fixtures.js";

test("10,000-row gRPC adapter integration uses 200 batched object reads, never 10,000 individual reads", async () => {
  const f = registryFixture(10000);
  const rows = f.rows.get(id(12))!;
  const byId = new Map(rows.map((r) => [r.objectId, r]));
  const client = getSuiGrpcClient("testnet");
  const listing = spyOn(client, "listDynamicFields").mockImplementation(
    async (q) => {
      const start = q.cursor ? Number(q.cursor) : 0;
      const data = rows.slice(start, start + 50);
      const end = start + data.length;
      return {
        dynamicFields: data.map((r) => ({ fieldId: r.objectId })),
        hasNextPage: end < rows.length,
        cursor: end < rows.length ? String(end) : null,
      } as any;
    },
  );
  const batch = spyOn(client, "getObjects").mockImplementation(
    async (q) =>
      ({
        objects: [...q.objectIds].reverse().map((objectId) => {
          const r = byId.get(objectId)!;
          return { ...r, json: r.fields };
        }),
      }) as any,
  );
  const single = spyOn(client, "getObject").mockRejectedValue(
    new Error("Individual field fetch is forbidden"),
  );
  try {
    const reader = new SuiJitterChainReader("testnet", {
      getObjectInfo: async <T>(_network: unknown, objectId: string) =>
        f.reader.getObjectInfo<T>(objectId),
    });
    expect(await listRegistryMarkets(reader, id(1))).toHaveLength(10000);
    expect(listing).toHaveBeenCalledTimes(200);
    expect(batch).toHaveBeenCalledTimes(200);
    expect(single).not.toHaveBeenCalled();
    expect(
      batch.mock.calls.every(
        ([q]) => q.objectIds.length === 50 && q.include?.json === true,
      ),
    ).toBe(true);
    expect(
      listing.mock.calls.every(
        ([q]) => q.parentId === id(12) && q.limit === 50,
      ),
    ).toBe(true);
  } finally {
    listing.mockRestore();
    batch.mockRestore();
    single.mockRestore();
  }
});

test("batch errors, missing records, duplicate records and substituted IDs never yield a partial page", async () => {
  const client = getSuiGrpcClient("testnet");
  const listing = spyOn(client, "listDynamicFields").mockResolvedValue({
    dynamicFields: [{ fieldId: id(20) }, { fieldId: id(21) }],
    hasNextPage: false,
    cursor: null,
  } as any);
  const row = (n: number) => ({
    objectId: id(n),
    type: "0x2::dynamic_field::Field<u64,bool>",
    version: "1",
    owner: { $kind: "ObjectOwner", ObjectOwner: id(12) },
    json: { name: String(n), value: true },
  });
  const batch = spyOn(client, "getObjects");
  try {
    const reader = new SuiJitterChainReader("testnet");
    for (const response of [
      [row(20)],
      [row(20), new Error("Not found")],
      [row(20), row(20)],
      [row(20), row(99)],
    ]) {
      batch.mockResolvedValueOnce({ objects: response } as any);
      await expect(
        reader.getDynamicFieldPage({ parentId: id(12), limit: 50 }),
      ).rejects.toThrow();
    }
  } finally {
    listing.mockRestore();
    batch.mockRestore();
  }
});
