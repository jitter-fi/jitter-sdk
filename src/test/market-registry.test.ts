import { expect, test } from "bun:test";
import {
  listJitterMarketRegistryRecords,
  listJitterPointProgramRegistryRecords,
  overlayJitterMarketConfigFromRegistry,
  overlayJitterMarketConfigFromRegistrySnapshot,
} from "../market-registry.js";
import { discoverJitterRegistry } from "../registry-v2.js";
import { makeTestMarketConfig } from "./fakes.js";
import { registryFixture, id, pkg, bytes } from "./registry-v2-fixtures.js";

test("a shared Registry snapshot cannot replace a different deployment's bindings", async () => {
  const snapshot = await discoverJitterRegistry(registryFixture().reader as never, id(1));
  const config = makeTestMarketConfig({
    marketRegistryObjectId: id(1), marketObjectId: id(100), syStateObjectId: id(4),
  });
  expect(() => overlayJitterMarketConfigFromRegistrySnapshot({ ...config, marketRegistryObjectId: id(99) }, snapshot)).toThrow("Registry object");
  expect(() => overlayJitterMarketConfigFromRegistrySnapshot({ ...config, jitterRegistryPackageId: id(99) }, snapshot)).toThrow("Registry package");
  expect(() => overlayJitterMarketConfigFromRegistrySnapshot({ ...config, globalConfigObjectId: id(99) }, snapshot)).toThrow("Registry config");
  expect(() => overlayJitterMarketConfigFromRegistrySnapshot({ ...config, syStateObjectId: id(99) }, snapshot)).toThrow("Registry SyState");
});

test("V2 aliases inherit display fields without rewriting official metadata or inventing rates", async () => {
  const f = registryFixture();
  const [record] = await listJitterMarketRegistryRecords(f.reader as never, {
    marketRegistryObjectId: id(1),
    marketObjectId: id(100),
  });
  expect(record?.project?.owner).toBe("");
  expect(record?.projectPointConfig).toBeNull();
  expect(record?.marketPointConfig).toBeNull();
  expect(record?.rewardDistributorId).toBeNull();
  expect(record?.metadata).toMatchObject({
    name: "Scallop sSUI",
    symbol: "sSUI",
    description: "Series",
  });
  const config = makeTestMarketConfig({
    marketRegistryObjectId: id(1),
    marketObjectId: id(100),
    syStateObjectId: id(4),
    rewardDistributorObjectId: id(80),
    marketDecimals: 6,
  });
  const next = await overlayJitterMarketConfigFromRegistry(
    f.reader as never,
    config,
  );
  expect(next.rewardDistributorObjectId).toBe(id(80));
  expect(next.marketDecimals).toBe(6);
  expect(next.marketCategory).toBe("Lending");
});

test("multiple sources share one Scoreboard and archived sources remain discoverable", async () => {
  const f = registryFixture();
  f.root.programs.size = "1";
  f.root.sources.size = "2";
  f.root.market_sources.size = "2";
  f.rows.set(id(13), [
    f.field(90, "0x2::object::ID", "PointProgram", id(60), {
      scoreboard_id: id(60),
      project_object_id: id(61),
      liquidlink_config_id: id(62),
      protocol_id: { vec: ["1"] },
      metadata: {
        name: bytes("Jitter Points"),
        season: bytes("Season 1"),
        description: [],
        icon_uri: [],
        metadata_uri: [],
      },
      listed: false,
      revision: "1",
      source_ids: { id: id(63), size: "2" },
    }),
  ]);
  f.rows.set(
    id(14),
    [64, 65].map((n, i) =>
      f.field(1000 + n, "0x2::object::ID", "PointSource", id(n), {
        source_id: id(n),
        scoreboard_id: id(60),
        policy_type: { name: `${pkg}::liquidlink_points::Policy` },
        source_type: { name: `${pkg}::liquidlink_points::PointConfig` },
        label: bytes(`Source ${i}`),
        archived: true,
        revision: "1",
        market_ids: { id: id(1100 + n), size: "1" },
      }),
    ),
  );
  f.rows.set(
    id(15),
    [64, 65].map((n, i) =>
      f.field(
        2000 + n,
        `${pkg}::market_registry::MarketSourceKey`,
        "MarketPointSource",
        { market_id: id(100), source_id: id(n) },
        {
          market_id: id(100),
          source_id: id(n),
          lp_point_state_id: { vec: i ? [id(80)] : [] },
          yt_enabled: true,
          lp_enabled: Boolean(i),
          archived: true,
          revision: "1",
        },
      ),
    ),
  );
  const definitions = await listJitterPointProgramRegistryRecords(
    f.reader as never,
    { marketRegistryObjectId: id(1) },
  );
  expect(definitions).toHaveLength(2);
  expect(definitions.every((p) => p.scoreboardObjectId === id(60))).toBe(true);
  expect(definitions[0]?.enabled).toBe(true);
  const [record] = await listJitterMarketRegistryRecords(f.reader as never, {
    marketRegistryObjectId: id(1),
    marketObjectId: id(100),
  });
  expect(record?.pointPrograms).toHaveLength(2);
  expect(record?.pointPrograms[1]?.scopes).toEqual(["yt", "lp", "pool"]);
});

test("does not fetch metadata URIs or decode category from legacy inline JSON", async () => {
  const f = registryFixture();
  const metadata = (f.rows.get(id(11))![0]!.fields as any).value.metadata;
  metadata.metadata_uri = bytes(
    'data:application/json,{"version":1,"category":"Wrong"}',
  );
  const config = makeTestMarketConfig({
    marketRegistryObjectId: id(1),
    marketObjectId: id(100),
    syStateObjectId: id(4),
  });
  const result = await overlayJitterMarketConfigFromRegistry(
    f.reader as never,
    config,
  );
  expect(result.marketCategory).toBe("Lending");
  expect(f.queries.every((q) => q.parentId !== id(1))).toBe(true);
});
