import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { getDefaultJitterMarketConfig } from "../config.js";
import { overlayJitterMarketConfigFromRegistry } from "../market-registry.js";
import { PointClaim } from "../generated/jitter_extensions/point_claim.js";
import {
  getOwnedClosedPointClaims,
  resolveLiquidlinkPointConfig,
} from "../infrastructure/point-claims-reader.js";
import { addClaimClosedPoints } from "../liquidlink-points.js";
import { createJitterTransactionService } from "../services/transaction-service.js";
import { registryFixture, id, pkg, bytes } from "./registry-v2-fixtures.js";
import type { JitterMarketConfig } from "../types.js";

function setup() {
  const f = registryFixture();
  f.root.programs.size = "1";
  f.root.sources.size = "1";
  f.root.market_sources.size = "1";
  f.rows.set(id(13), [
    f.field(90, "0x2::object::ID", "PointProgram", id(60), {
      scoreboard_id: id(60),
      project_object_id: id(61),
      liquidlink_config_id: id(62),
      protocol_id: { vec: [] },
      metadata: {
        name: bytes("New program"),
        season: [],
        description: [],
        icon_uri: [],
        metadata_uri: [],
      },
      listed: false,
      revision: "1",
      source_ids: { id: id(63), size: "1" },
    }),
  ]);
  f.rows.set(id(14), [
    f.field(91, "0x2::object::ID", "PointSource", id(64), {
      source_id: id(64),
      scoreboard_id: id(60),
      policy_type: { name: `${pkg}::policy::P` },
      source_type: { name: `${pkg}::liquidlink_points::PointConfig` },
      label: bytes("Archived descriptor"),
      archived: true,
      revision: "1",
      market_ids: { id: id(65), size: "1" },
    }),
  ]);
  f.rows.set(id(15), [
    f.field(
      92,
      `${pkg}::market_registry::MarketSourceKey`,
      "MarketPointSource",
      { market_id: id(100), source_id: id(64) },
      {
        market_id: id(100),
        source_id: id(64),
        lp_point_state_id: { vec: [id(999)] },
        yt_enabled: true,
        lp_enabled: true,
        archived: true,
        revision: "1",
      },
    ),
  ]);
  const oldProgram = {
    label: "Original",
    protocol: "Jitter",
    pointConfigObjectId: id(9),
    projectObjectId: id(7),
    scoreboardObjectId: id(8),
    lpPointStateObjectId: id(10),
    closed: true,
    enabled: false,
    scopes: ["yt", "lp", "pool"] as Array<"yt" | "lp" | "pool">,
    referral: { policyStateObjectId: id(11), referralTableObjectId: id(12) },
  };
  const matchingProgram = {
    ...oldProgram,
    pointConfigObjectId: id(64),
    projectObjectId: id(61),
    scoreboardObjectId: id(60),
    enabled: true,
  };
  const config: JitterMarketConfig = {
    ...getDefaultJitterMarketConfig("testnet")!,
    marketRegistryObjectId: id(1),
    jitterRegistryPackageId: pkg,
    globalConfigObjectId: id(2),
    syStateObjectId: id(4),
    marketObjectId: id(100),
    marketStateObjectId: id(100),
    poolObjectId: id(100),
    pyStateObjectId: id(100),
    jitterExtensionsPackageId: id(500),
    orderbookObjectId: id(70),
    ytOrderbookObjectId: id(71),
    liquidlink: {
      enabled: true,
      liquidlinkPackageId: id(501),
      liquidlinkGlobalConfigObjectId: id(502),
      referralPackageId: id(503),
      pointPrograms: [oldProgram, matchingProgram],
    },
  };
  return { ...f, config };
}

test("display overlay retains matching referral mode and every non-catalogued historical program", async () => {
  const f = setup();
  const result = await overlayJitterMarketConfigFromRegistry(
    f.reader as never,
    f.config,
  );
  expect(result.liquidlink).toEqual(f.config.liquidlink);
  expect(result.liquidlink?.pointPrograms?.[1]?.referral).toEqual({
    policyStateObjectId: id(11),
    referralTableObjectId: id(12),
  });
  expect(result.liquidlink?.pointPrograms?.[1]?.lpPointStateObjectId).toBe(
    id(10),
  );
  expect(result.orderbookObjectId).toBe(id(70));
  expect(result.ytOrderbookObjectId).toBe(id(71));
  expect(result.liquidlink?.pointPrograms?.[0]?.closed).toBe(true);
});

test("overlay followed by owned historical claim discovery and original referral claim build succeeds", async () => {
  const f = setup();
  const result = await overlayJitterMarketConfigFromRegistry(
    f.reader as never,
    f.config,
  );
  const data = {
    id: id(13),
    config_id: id(9),
    market_id: id(100),
    source_id: id(9),
    position_id: id(14),
    owner: id(15),
    scope: 1,
    points: "42",
    remainder: "1",
    precision: "100",
    closed_at_ms: "123",
    referral_state_id: id(11),
    referral_record_id: id(16),
  };
  const client = {
    listOwnedObjects: async () => ({
      objects: [
        { objectId: id(13), content: PointClaim.serialize(data).toBytes() },
      ],
      hasNextPage: false,
      cursor: null,
    }),
  };
  const before = await getOwnedClosedPointClaims(
    "testnet",
    f.config,
    id(15),
    client,
  );
  const after = await getOwnedClosedPointClaims(
    "testnet",
    result,
    id(15),
    client,
  );
  expect(before).toHaveLength(1);
  expect(after).toEqual(before);
  const tx = new Transaction();
  tx.setSender(id(15));
  expect(
    addClaimClosedPoints(tx, result, after[0]!, (_, confirm) => confirm()),
  ).toBe(true);
  expect(tx.getData().commands.map((c) => c.MoveCall?.function)).toContain(
    "apply_yt_bonus_policy",
  );
});

test("overlay plus chain closed-state hydration preserves a referral-aware YT exit", async () => {
  const f = setup();
  const result = await overlayJitterMarketConfigFromRegistry(
    f.reader as never,
    f.config,
  );
  const reader = {
    getPointConfig: async (configId: string) =>
      configId === id(9)
        ? { closed: true, projectObjectId: id(7), scoreboardObjectId: id(8) }
        : { closed: true, projectObjectId: id(61), scoreboardObjectId: id(60) },
  };
  const resolved = await resolveLiquidlinkPointConfig(result, reader);
  expect(
    resolved.liquidlink?.pointPrograms?.[0]?.referral?.policyStateObjectId,
  ).toBe(id(11));
  const service = createJitterTransactionService({
    config: resolved,
    pointConfigReader: reader,
  });
  const tx = await service.buildSellYtTx({
    senderAddress: id(15),
    positionId: id(14),
    ytAmount: 1n,
    minSyOut: 0n,
    syIndex: 1n << 64n,
    rewardSettlement: { strategy: "empty-vector" },
  });
  expect(
    tx
      .getData()
      .commands.some((c) => c.MoveCall?.function === "settle_closed_yt"),
  ).toBe(true);
});
