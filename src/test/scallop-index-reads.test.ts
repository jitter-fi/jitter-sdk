import { expect, spyOn, test } from "bun:test";
import { getScallopMarketIndex } from "../queries.js";
import { getSuiGrpcClient } from "../rpc.js";
import { makeTestMarketConfig } from "./fakes.js";
import { id } from "./registry-v2-fixtures.js";

function fixture() {
  const client = getSuiGrpcClient("testnet");
  const config = makeTestMarketConfig({ scallopMarketObjectId: id(40), underlyingTypeTag: "0x2::sui::SUI" });
  const objects = new Map<string, { objectId: string; json: unknown }>();
  const tables = new Map<string, string[]>();
  const values = [
    { cash: "1000", debt: "200", revenue: "10", market_coin_supply: "1190" },
    { interest_rate: { value: "1" } },
    { revenue_factor: { value: "0" } },
  ];
  for (let table = 0; table < 3; table++) {
    const rows = Array.from({ length: 60 }, (_, row) => id(1000 + table * 100 + row));
    tables.set(id(50 + table), rows);
    rows.forEach((objectId, row) => objects.set(objectId, { objectId, json: {
      name: row === 59 ? `${"2".padStart(64, "0")}::sui::SUI` : "0x3::other::OTHER",
      value: values[table],
    } }));
  }
  const single = spyOn(client, "getObject").mockImplementation(async (q) => {
    if (q.objectId !== id(40)) throw Error("Individual field reads are forbidden");
    return { object: { json: {
      vault: { balance_sheets: { table: { id: id(50) } } },
      borrow_dynamics: { table: { id: id(51) } },
      interest_models: { table: { id: id(52) } },
    } } } as never;
  });
  const list = spyOn(client, "listDynamicFields").mockImplementation(async (q) => {
    const start = Number(q.cursor ?? 0), rows = tables.get(q.parentId)!;
    const end = Math.min(start + 50, rows.length);
    return { dynamicFields: rows.slice(start, end).map(fieldId => ({ fieldId })), hasNextPage: end < rows.length, cursor: end < rows.length ? String(end) : null } as never;
  });
  const batch = spyOn(client, "getObjects").mockImplementation(async (q) => ({
    objects: [...q.objectIds].reverse().map(objectId => objects.get(objectId)),
  }) as never);
  return { config, single, list, batch, restore() { single.mockRestore(); list.mockRestore(); batch.mockRestore(); } };
}

test("Scallop index batches each page and reads all three tables concurrently", async () => {
  const f = fixture();
  try {
    const result = await getScallopMarketIndex("testnet", f.config);
    expect(result.syIndexRaw).toBe(String(1n << 64n));
    expect(f.single).toHaveBeenCalledTimes(1);
    expect(f.batch).toHaveBeenCalledTimes(6);
    expect(f.list.mock.calls.slice(0, 3).map(([q]) => q.parentId).sort()).toEqual([id(50), id(51), id(52)]);
    expect(f.batch.mock.calls.every(([q]) => q.objectIds.length <= 50 && q.include?.json === true)).toBe(true);
  } finally { f.restore(); }
});

for (const mode of ["error", "missing", "duplicate", "substituted"] as const) {
  test(`Scallop index rejects ${mode} object batches`, async () => {
    const f = fixture();
    f.batch.mockImplementation(async (q) => ({ objects: mode === "error" ? [Error("upstream failure")]
      : mode === "missing" ? []
      : mode === "duplicate" ? q.objectIds.map(() => ({ objectId: q.objectIds[0], json: {} }))
      : q.objectIds.map(() => ({ objectId: id(99), json: {} })) }) as never);
    const message = mode === "error" ? "upstream failure" : mode === "missing" ? "Incomplete Scallop" : "Unexpected or duplicate Scallop";
    try { await expect(getScallopMarketIndex("testnet", f.config)).rejects.toThrow(message); }
    finally { f.restore(); }
  });
}

test("Scallop index rejects nonadvancing pagination", async () => {
  const f = fixture();
  f.list.mockResolvedValue({ dynamicFields: [{ fieldId: id(1000) }], hasNextPage: true, cursor: "stuck" } as never);
  try { await expect(getScallopMarketIndex("testnet", f.config)).rejects.toThrow("Stalled Scallop"); }
  finally { f.restore(); }
});

test("Scallop index never substitutes another token's balance sheet", async () => {
  const f = fixture();
  f.batch.mockImplementation(async (q) => ({ objects: q.objectIds.map(objectId => ({
    objectId, json: { name: "0x3::other::OTHER", value: { cash: "1" } },
  })) }) as never);
  try { await expect(getScallopMarketIndex("testnet", f.config)).rejects.toThrow("balance sheet not found"); }
  finally { f.restore(); }
});
