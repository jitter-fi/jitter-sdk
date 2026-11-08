import { describe, expect, test } from "bun:test";
import {
  discoverJitterRegistry,
  listRegistryMarkets,
  listRegistryMembership,
} from "../registry-v2.js";
import {
  listJitterMarketRegistryRecords,
  overlayJitterMarketConfigFromRegistry,
} from "../market-registry.js";
import { makeTestMarketConfig } from "./fakes.js";
import type {
  ChainObjectInfo,
  DynamicFieldPage,
  DynamicFieldObjectQuery,
} from "../ports/chain-reader.js";

import { id, pkg, registryFixture } from "./registry-v2-fixtures.js";

describe("Registry V2 Table discovery", () => {
  test("independent Registry tables overlap with at most two pages in flight", async () => {
    const f = registryFixture();
    let active = 0, peak = 0;
    const reader = { ...f.reader, async getDynamicFieldPage<T>(query: DynamicFieldObjectQuery) {
      active++;
      peak = Math.max(peak, active);
      try {
        await new Promise(resolve => setTimeout(resolve, 2));
        return await f.reader.getDynamicFieldPage<T>(query);
      } finally { active--; }
    } };
    const snapshot = await discoverJitterRegistry(reader, id(1));
    expect(peak).toBe(2);
    expect(snapshot.markets).toHaveLength(1);
  });
  test("reads Table UIDs, resolves native metadata, and computes consumer aliases", async () => {
    const fixture = registryFixture();
    const snapshot = await discoverJitterRegistry(fixture.reader, id(1));
    expect(snapshot.protocols[0]?.displayRank).toBe("0");
    expect(snapshot.series[0]?.metadata.category).toBe("Lending");
    expect(snapshot.markets[0]?.marketId).toBe(id(100));
    expect(fixture.queries.every((q) => q.parentId !== id(1))).toBe(true);
    const records = await listJitterMarketRegistryRecords(
      fixture.reader as never,
      { marketRegistryObjectId: id(1), marketObjectId: id(100) },
    );
    expect(records[0]).toMatchObject({
      marketId: id(100),
      marketStateId: id(100),
      pyStateId: id(100),
      poolId: id(100),
      rewardDistributorId: null,
      metadata: { name: "Scallop sSUI", adapterKind: "", symbol: "sSUI" },
    });
    const config = makeTestMarketConfig({
      marketRegistryObjectId: id(1),
      marketObjectId: id(100),
      syStateObjectId: id(4),
    });
    const overlaid = await overlayJitterMarketConfigFromRegistry(
      fixture.reader as never,
      config,
    );
    expect(overlaid.marketCategory).toBe("Lending");
  });

  test("lists 10,000 rows over 200 pages without scanning root dynamic fields", async () => {
    const fixture = registryFixture(10000);
    const records = await listRegistryMarkets(fixture.reader, id(1));
    expect(records).toHaveLength(10000);
    expect(new Set(records.map((r) => r.marketId)).size).toBe(10000);
    expect(fixture.queries.filter((q) => q.parentId === id(12))).toHaveLength(
      200,
    );
    expect(fixture.queries.every((q) => q.limit === 50)).toBe(true);
  });

  test("does not invent zero for missing fields, but preserves real zero values", async () => {
    const fixture = registryFixture();
    delete (fixture.rows.get(id(12))![0]!.fields as any).value.expiry_ms;
    await expect(listRegistryMarkets(fixture.reader, id(1))).rejects.toThrow(
      "expiry_ms",
    );
    (fixture.rows.get(id(12))![0]!.fields as any).value.expiry_ms = "0";
    expect(
      (await listRegistryMarkets(fixture.reader, id(1)))[0]?.expiryMs,
    ).toBe("0");
  });

  test("rejects legacy schema, wrong object type, and owned roots", async () => {
    for (const alter of [
      (o: any) => {
        o.fields = { market_ids: [id(100)] };
      },
      (o: any) => {
        o.type = `${pkg}::market_registry::MarketRegistry`;
      },
      (o: any) => {
        o.owner = { $kind: "AddressOwner", AddressOwner: id(2) };
      },
    ]) {
      const fixture = registryFixture();
      const read = fixture.reader.getObjectInfo;
      fixture.reader.getObjectInfo = async <T>(objectId: string) => {
        const o = await read<T>(objectId);
        alter(o);
        return o;
      };
      await expect(
        listRegistryMarkets(fixture.reader, id(1)),
      ).rejects.toThrow();
    }
  });

  test("rejects cyclic/duplicate cursors, empty incomplete pages, duplicate rows and truncation", async () => {
    for (const mode of [
      "cycle",
      "no-cursor",
      "empty",
      "duplicate",
      "truncate",
    ]) {
      const fixture = registryFixture(101);
      const page = fixture.reader.getDynamicFieldPage;
      fixture.reader.getDynamicFieldPage = async <T>(
        q: DynamicFieldObjectQuery,
      ) => {
        const result = await page<T>(q);
        if (mode === "cycle")
          return { ...result, hasNextPage: true, nextCursor: "50" };
        if (mode === "no-cursor")
          return { ...result, hasNextPage: true, nextCursor: null };
        if (mode === "empty")
          return { data: [], hasNextPage: true, nextCursor: "50" };
        if (mode === "duplicate")
          return { ...result, data: [result.data[0]!, result.data[0]!] };
        return { ...result, hasNextPage: false, nextCursor: null };
      };
      await expect(
        listRegistryMarkets(fixture.reader, id(1)),
      ).rejects.toThrow();
    }
  });

  test("surfaces page transport failures instead of partial success", async () => {
    const fixture = registryFixture(101);
    const page = fixture.reader.getDynamicFieldPage;
    fixture.reader.getDynamicFieldPage = async (q) => {
      if (q.cursor) throw new Error("page unavailable");
      return page(q);
    };
    await expect(listRegistryMarkets(fixture.reader, id(1))).rejects.toThrow(
      "page unavailable",
    );
  });

  test("decodes native gRPC base64 metadata without misreading zero and rejects invalid UTF-8", async () => {
    const fixture = registryFixture();
    const row = (fixture.rows.get(id(10))![0]!.fields as any).value;
    for (const [key, value] of Object.entries(row.metadata))
      row.metadata[key] = Buffer.from(value as number[]).toString("base64");
    expect(
      (await discoverJitterRegistry(fixture.reader, id(1))).protocols[0]
        ?.metadata.name,
    ).toBe("Scallop");
    row.metadata.name = [0xff];
    await expect(
      discoverJitterRegistry(fixture.reader, id(1)),
    ).rejects.toThrow();
  });

  test("supports native scalar/null Option encoding without treating missing Option fields as None", async () => {
    const f = registryFixture();
    const series = (f.rows.get(id(11))![0]!.fields as any).value;
    series.default_market_id = id(100);
    expect(
      (await discoverJitterRegistry(f.reader, id(1))).series[0]
        ?.defaultMarketId,
    ).toBe(id(100));
    series.default_market_id = null;
    expect(
      (await discoverJitterRegistry(f.reader, id(1))).series[0]
        ?.defaultMarketId,
    ).toBeNull();
    delete series.default_market_id;
    await expect(discoverJitterRegistry(f.reader, id(1))).rejects.toThrow(
      "default_market_id",
    );
  });

  test("keeps unknown typed extensions opaque instead of interpreting an arbitrary route", async () => {
    const f = registryFixture();
    f.root.extensions.size = "1";
    f.rows.set(id(16), [
      {
        objectId: id(700),
        type: `0x2::dynamic_field::Field<${pkg}::future::Key,u64>`,
        version: "1",
        owner: { $kind: "ObjectOwner", ObjectOwner: id(16) },
        fields: { name: { market_id: id(100) }, value: "99" },
      },
    ]);
    const snapshot = await discoverJitterRegistry(f.reader, id(1));
    expect(snapshot.markets).toHaveLength(1);
    expect(snapshot.extensions[0]).toMatchObject({
      kind: "unsupported",
      fieldId: id(700),
    });
  });

  test("rejects distinct field objects containing duplicate logical keys and foreign Table owners", async () => {
    const fixture = registryFixture(2);
    (fixture.rows.get(id(12))![1]!.fields as any).name = id(100);
    await expect(listRegistryMarkets(fixture.reader, id(1))).rejects.toThrow(
      "key",
    );
    const other = registryFixture();
    other.rows.get(id(12))![0]!.owner = {
      $kind: "ObjectOwner",
      ObjectOwner: id(13),
    };
    await expect(listRegistryMarkets(other.reader, id(1))).rejects.toThrow(
      "another Table",
    );
  });

  test("nested membership tables page 10,000 IDs and reject false membership", async () => {
    const fixture = registryFixture(0);
    const rows = Array.from({ length: 10000 }, (_, i) => ({
      objectId: id(100000 + i),
      type: "0x2::dynamic_field::Field<0x2::object::ID,bool>",
      version: "1",
      owner: { $kind: "ObjectOwner", ObjectOwner: id(31) },
      fields: { name: id(100 + i), value: true },
    }));
    fixture.rows.set(id(31), rows);
    expect(
      await listRegistryMembership(
        fixture.reader,
        { id: id(31), size: "10000" },
        "id",
      ),
    ).toHaveLength(10000);
    rows[0]!.fields.value = false;
    await expect(
      listRegistryMembership(
        fixture.reader,
        { id: id(31), size: "10000" },
        "id",
      ),
    ).rejects.toThrow("must be true");
  });

  test("rejects cross-page mutation and does not overlay a different singleton market", async () => {
    const fixture = registryFixture();
    const page = fixture.reader.getDynamicFieldPage;
    fixture.reader.getDynamicFieldPage = async (q) => {
      fixture.setVersion("2");
      return page(q);
    };
    await expect(listRegistryMarkets(fixture.reader, id(1))).rejects.toThrow(
      "changed",
    );
    const config = makeTestMarketConfig({
      marketRegistryObjectId: id(1),
      marketObjectId: id(999),
    });
    const other = registryFixture();
    expect(
      await overlayJitterMarketConfigFromRegistry(
        other.reader as never,
        config,
      ),
    ).toEqual(config);
  });
});
