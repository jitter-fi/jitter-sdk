import { expect, spyOn, test } from "bun:test";
import { getSuiGrpcClient } from "../rpc.js";
import { SuiJitterChainReader } from "../infrastructure/sui-chain-reader.js";

test("owned inventory follows all pages and deduplicates objects", async () => {
  const client = getSuiGrpcClient("testnet");
  const listing = spyOn(client, "listOwnedObjects").mockImplementation(async q => ({
    objects: Array.from({ length: q.cursor ? 2 : 50 }, (_, i) => {
      const id = String(q.cursor ? 49 + i : i);
      return { objectId: id, json: { id, balance: "1" } };
    }),
    hasNextPage: !q.cursor, cursor: q.cursor ? null : "page2",
  }) as any);
  try {
    const rows = await new SuiJitterChainReader("testnet").getOwnedObjects({ owner: "0x1", structType: "0x2::coin::Coin<0x2::sui::SUI>" });
    expect(rows).toHaveLength(51);
    expect(listing).toHaveBeenCalledTimes(2);
  } finally { listing.mockRestore(); }
});

test("owned inventory rejects incomplete pagination", async () => {
  const listing = spyOn(getSuiGrpcClient("testnet"), "listOwnedObjects").mockResolvedValue({
    objects: [], hasNextPage: true, cursor: null,
  } as any);
  try {
    await expect(new SuiJitterChainReader("testnet").getOwnedObjects({ owner: "0x1", structType: "Type" })).rejects.toThrow("pagination");
  } finally { listing.mockRestore(); }
});
