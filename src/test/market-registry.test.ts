import { describe, expect, test } from "bun:test";

import {
  listJitterMarketRegistryRecords,
  listJitterPointProgramRegistryRecords,
  overlayJitterMarketConfigFromRegistry,
} from "../market-registry.js";
import {
  InMemoryJitterChainReader,
  makeTestMarketConfig,
} from "./fakes.js";

const REGISTRY_ID = "0xregistry";
const MARKET_ID = "0xmarket-live";
const PY_STATE_ID = "0xpy-live";
const POOL_ID = "0xpool-live";
const REWARD_DISTRIBUTOR_ID = "0xreward-live";
const bytes = (value: string) => Array.from(new TextEncoder().encode(value));

describe("market registry", () => {
  test("lists records in on-chain registry market_ids order", async () => {
    const chainReader = new InMemoryJitterChainReader({
      objects: new Map([
        [
          REGISTRY_ID,
          {
            market_count: "1",
            market_ids: [MARKET_ID],
          },
        ],
      ]),
      dynamicFieldObjects: new Map([
        [
          REGISTRY_ID,
          [
            {
              name: { pos0: MARKET_ID },
              value: {
                project_id: "1",
                market_id: MARKET_ID,
                py_state_id: PY_STATE_ID,
                pool_id: POOL_ID,
                pt_orderbook_id:
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                yt_orderbook_id: "0xyt-orderbook",
                reward_distributor_id: REWARD_DISTRIBUTOR_ID,
                expiry: "4102444800000",
              },
            },
          ],
        ],
      ]),
    });

    await expect(
      listJitterMarketRegistryRecords(chainReader, {
        marketRegistryObjectId: REGISTRY_ID,
        marketObjectId: "0xmarket-stale",
      }),
    ).resolves.toEqual([
      {
        projectId: "1",
        project: null,
        metadata: null,
        marketId: MARKET_ID,
        marketStateId: MARKET_ID,
        pyStateId: PY_STATE_ID,
        poolId: POOL_ID,
        ptOrderbookId: null,
        ytOrderbookId: "0xyt-orderbook",
        rewardDistributorId: REWARD_DISTRIBUTOR_ID,
        expiryMs: "4102444800000",
        projectPointConfig: null,
        marketPointConfig: null,
        pointPrograms: [],
      },
    ]);
  });

  test("overlays project and market display metadata from registry", async () => {
    const config = makeTestMarketConfig({
      marketRegistryObjectId: REGISTRY_ID,
      marketObjectId: MARKET_ID,
      underlyingTypeTag: "0xold::underlying::OLD",
      syTypeTag: "0xold::sy::OLD",
      ptTypeTag: "0xold::pt::OLD",
      ytTypeTag: "0xold::yt::OLD",
    });
    const chainReader = new InMemoryJitterChainReader({
      objects: new Map([[REGISTRY_ID, { market_ids: [MARKET_ID] }]]),
      dynamicFieldObjects: new Map([
        [
          REGISTRY_ID,
          [
            {
              value: {
                project_id: "1",
                owner: "0xabc",
                name: bytes("Scallop"),
                metadata_uri: bytes("ipfs://scallop"),
              },
            },
            {
              value: {
                project_id: "1",
                description: bytes("Scallop yield markets"),
                icon_uri: bytes("https://assets.jitter.fi/scallop.png"),
                website_uri: bytes("https://scallop.io"),
              },
            },
            {
              value: {
                project_id: "1",
                market_id: MARKET_ID,
                market_state_id: MARKET_ID,
                py_state_id: MARKET_ID,
                pool_id: MARKET_ID,
                reward_distributor_id: REWARD_DISTRIBUTOR_ID,
                expiry: "4102444800000",
              },
            },
            {
              value: {
                project_id: "1",
                series_id: "2",
                market_id: MARKET_ID,
                adapter: bytes("scallop"),
                name: bytes("Scallop sSUI 90D"),
                symbol: bytes("sSUI"),
                description: bytes("Fixed and floating yield market."),
                icon_uri: bytes("https://assets.jitter.fi/ssui.png"),
                metadata_uri: bytes("ipfs://jitter/ssui-90d"),
                underlying_type: { name: bytes("0x1::sui::SUI") },
                sy_type: { name: bytes("0x2::sy::SY") },
                pt_type: { name: bytes("0x3::pt::PT") },
                yt_type: { name: bytes("0x4::yt::YT") },
              },
            },
          ],
        ],
      ]),
    });

    await expect(
      overlayJitterMarketConfigFromRegistry(chainReader, config),
    ).resolves.toMatchObject({
      projectId: "1",
      projectName: "Scallop",
      projectDescription: "Scallop yield markets",
      projectIconUri: "https://assets.jitter.fi/scallop.png",
      projectWebsiteUri: "https://scallop.io",
      adapterKind: "scallop",
      marketName: "Scallop sSUI 90D",
      marketSymbol: "sSUI",
      marketDescription: "Fixed and floating yield market.",
      marketIconUri: "https://assets.jitter.fi/ssui.png",
      marketMetadataUri: "ipfs://jitter/ssui-90d",
      underlyingTypeTag: "0x1::sui::SUI",
      syTypeTag: "0x2::sy::SY",
      ptTypeTag: "0x3::pt::PT",
      ytTypeTag: "0x4::yt::YT",
    });
  });

  test("overlays stale core object ids from registry record", async () => {
    const config = makeTestMarketConfig({
      marketRegistryObjectId: REGISTRY_ID,
      marketObjectId: "0xmarket-stale",
      pyStateObjectId: "0xpy-stale",
      poolObjectId: "0xpool-stale",
      rewardDistributorObjectId: "0xreward-stale",
    });
    const chainReader = new InMemoryJitterChainReader({
      objects: new Map([
        [
          REGISTRY_ID,
          {
            market_ids: [MARKET_ID],
          },
        ],
      ]),
      dynamicFieldObjects: new Map([
        [
          REGISTRY_ID,
          [
            {
              value: {
                project_id: "1",
                market_id: MARKET_ID,
                py_state_id: PY_STATE_ID,
                pool_id: POOL_ID,
                pt_orderbook_id: "0xpt-orderbook",
                yt_orderbook_id: "0xyt-orderbook",
                reward_distributor_id: REWARD_DISTRIBUTOR_ID,
                expiry: "4102444800000",
              },
            },
          ],
        ],
      ]),
    });

    await expect(
      overlayJitterMarketConfigFromRegistry(chainReader, config),
    ).resolves.toMatchObject({
      marketObjectId: MARKET_ID,
      marketStateObjectId: MARKET_ID,
      pyStateObjectId: PY_STATE_ID,
      poolObjectId: POOL_ID,
      orderbookObjectId: "0xpt-orderbook",
      ytOrderbookObjectId: "0xyt-orderbook",
      rewardDistributorObjectId: REWARD_DISTRIBUTOR_ID,
      underlyingTypeTag: config.underlyingTypeTag,
      demoMarketVaultObjectId: config.demoMarketVaultObjectId,
    });
  });

  test("overlays liquidlink project and market point metadata from registry", async () => {
    const config = makeTestMarketConfig({
      marketRegistryObjectId: REGISTRY_ID,
      marketObjectId: MARKET_ID,
      liquidlink: {
        enabled: false,
        pointConfigObjectId: "0xpoint-config-stale",
        scoreboardObjectId: "0xscoreboard-stale",
        lpPointStateObjectId: "0xlp-point-stale",
        tokenizedPoint: {
          enabled: false,
          tokenTypeTag: "0xold::point::POINT",
        },
      },
    });
    const chainReader = new InMemoryJitterChainReader({
      objects: new Map([
        [
          REGISTRY_ID,
          {
            market_ids: [MARKET_ID],
          },
        ],
      ]),
      dynamicFieldObjects: new Map([
        [
          REGISTRY_ID,
          [
            {
              value: {
                project_id: "7",
                market_id: MARKET_ID,
                market_state_id: MARKET_ID,
                py_state_id: MARKET_ID,
                pool_id: MARKET_ID,
                reward_distributor_id: REWARD_DISTRIBUTOR_ID,
                expiry: "4102444800000",
              },
            },
            {
              value: {
                project_id: "7",
                enabled: true,
                liquidlink_global_config_id: "0xll-global",
                scoreboard_id: "0xscoreboard",
                point_cap_id: "0xpoint-cap",
                point_config_id: "0xpoint-config",
                point_token_market_id: "0xpoint-token-market",
                point_orderbook_id: "0xpoint-orderbook",
                point_token_type: Array.from(
                  new TextEncoder().encode("0xpoint::jitter_point::JITTER_POINT"),
                ),
                quote_coin_type: Array.from(
                  new TextEncoder().encode("0x2::sui::SUI"),
                ),
                quote_symbol: Array.from(new TextEncoder().encode("SUI")),
                yt_multiplier_bps: "10000",
                lp_multiplier_bps: "12000",
                point_duration_ms: "86400000000000000",
              },
            },
            {
              value: {
                project_id: "7",
                market_id: MARKET_ID,
                point_config_id: "0xpoint-config-market",
                lp_point_state_id: "0xlp-point",
                yt_multiplier_bps: "11000",
                lp_multiplier_bps: "12500",
                point_duration_ms: "123",
              },
            },
          ],
        ],
      ]),
    });

    await expect(
      overlayJitterMarketConfigFromRegistry(chainReader, config),
    ).resolves.toMatchObject({
      projectId: "7",
      liquidlink: {
        enabled: true,
        liquidlinkGlobalConfigObjectId: "0xll-global",
        scoreboardObjectId: "0xscoreboard",
        pointCapObjectId: "0xpoint-cap",
        pointConfigObjectId: "0xpoint-config-market",
        lpPointStateObjectId: "0xlp-point",
        ytMultiplierBps: 11000,
        lpMultiplierBps: 12500,
        pointDurationMs: "123",
        tokenizedPoint: {
          enabled: false,
          tokenTypeTag: "0xpoint::jitter_point::JITTER_POINT",
          pointTokenMarketObjectId: "0xpoint-token-market",
          quoteTokenTypeTag: "0x2::sui::SUI",
          quoteSymbol: "SUI",
          orderbookObjectId: "0xpoint-orderbook",
        },
      },
    });
  });

  test("discovers multiple point programs attached to one market", async () => {
    const config = makeTestMarketConfig({
      marketRegistryObjectId: REGISTRY_ID,
      marketObjectId: MARKET_ID,
      liquidlink: {
        enabled: true,
        liquidlinkGlobalConfigObjectId: "0xll-global",
      },
    });
    const bytes = (value: string) =>
      Array.from(new TextEncoder().encode(value));
    const chainReader = new InMemoryJitterChainReader({
      objects: new Map([
        [REGISTRY_ID, { market_ids: [MARKET_ID] }],
      ]),
      dynamicFieldObjects: new Map([
        [
          REGISTRY_ID,
          [
            {
              value: {
                project_id: "7",
                market_id: MARKET_ID,
                market_state_id: MARKET_ID,
                py_state_id: MARKET_ID,
                pool_id: MARKET_ID,
                reward_distributor_id: REWARD_DISTRIBUTOR_ID,
                expiry: "4102444800000",
              },
            },
            {
              value: {
                point_config_id: "0xjitter-config",
                liquidlink_global_config_id: "0xll-global",
                project_object_id: "0xjitter-project",
                scoreboard_id: "0xjitter-scoreboard",
                name: bytes("Jitter Protocol Points"),
                protocol: bytes("Jitter"),
                season: bytes("Season 2"),
                metadata_uri: bytes("ipfs://jitter/s2"),
                enabled: true,
              },
            },
            {
              value: {
                point_config_id: "0xscallop-config",
                liquidlink_global_config_id: "0xll-global",
                project_object_id: "0xscallop-project",
                scoreboard_id: "0xscallop-scoreboard",
                name: bytes("Scallop Points"),
                protocol: bytes("Scallop"),
                season: [],
                metadata_uri: bytes("ipfs://scallop"),
                enabled: true,
              },
            },
            {
              value: {
                market_id: MARKET_ID,
                point_config_id: "0xjitter-config",
                lp_point_state_id: "0xjitter-lp-state",
                yt_enabled: true,
                lp_enabled: true,
                pool_enabled: true,
              },
            },
            {
              value: {
                market_id: MARKET_ID,
                point_config_id: "0xscallop-config",
                lp_point_state_id: NONE_ID_FOR_TEST,
                yt_enabled: true,
                lp_enabled: false,
                pool_enabled: false,
              },
            },
          ],
        ],
      ]),
    });

    const resolved = await overlayJitterMarketConfigFromRegistry(
      chainReader,
      config,
    );
    expect(resolved.liquidlink?.pointPrograms).toEqual([
      {
        label: "Jitter Protocol Points",
        protocol: "Jitter",
        season: "Season 2",
        projectObjectId: "0xjitter-project",
        scoreboardObjectId: "0xjitter-scoreboard",
        pointConfigObjectId: "0xjitter-config",
        lpPointStateObjectId: "0xjitter-lp-state",
        enabled: true,
        scopes: ["yt", "lp", "pool"],
      },
      {
        label: "Scallop Points",
        protocol: "Scallop",
        projectObjectId: "0xscallop-project",
        scoreboardObjectId: "0xscallop-scoreboard",
        pointConfigObjectId: "0xscallop-config",
        enabled: true,
        scopes: ["yt"],
      },
    ]);
  });

  test("enumerates detached and disabled point programs", async () => {
    const bytes = (value: string) =>
      Array.from(new TextEncoder().encode(value));
    const base64 = (value: string) =>
      globalThis.btoa(String.fromCharCode(...bytes(value)));
    const chainReader = new InMemoryJitterChainReader({
      objects: new Map([
        [
          REGISTRY_ID,
          {
            point_program_ids: ["0xseason-1", "0xseason-2"],
          },
        ],
      ]),
      dynamicFieldObjects: new Map([
        [
          REGISTRY_ID,
          [
            {
              value: {
                point_config_id: "0xseason-1",
                liquidlink_global_config_id: "0xll-global",
                project_object_id: "0xproject-1",
                scoreboard_id: "0xscoreboard-1",
                name: bytes("Jitter Season 1"),
                protocol: bytes("Jitter"),
                season: bytes("Season 1"),
                metadata_uri: [],
                enabled: false,
              },
            },
            {
              value: {
                point_config_id: "0xseason-2",
                liquidlink_global_config_id: "0xll-global",
                project_object_id: "0xproject-2",
                scoreboard_id: "0xscoreboard-2",
                name: base64("Jitter Season 2"),
                protocol: base64("Jitter"),
                season: base64("Season 2"),
                metadata_uri: [],
                enabled: true,
              },
            },
            {
              value: {
                market_id: MARKET_ID,
                point_config_id: "0xseason-2",
                lp_point_state_id: NONE_ID_FOR_TEST,
                yt_enabled: true,
                lp_enabled: false,
                pool_enabled: false,
              },
            },
          ],
        ],
      ]),
    });

    await expect(
      listJitterPointProgramRegistryRecords(chainReader, {
        marketRegistryObjectId: REGISTRY_ID,
      }),
    ).resolves.toEqual([
      {
        pointConfigObjectId: "0xseason-1",
        liquidlinkGlobalConfigObjectId: "0xll-global",
        projectObjectId: "0xproject-1",
        scoreboardObjectId: "0xscoreboard-1",
        label: "Jitter Season 1",
        protocol: "Jitter",
        season: "Season 1",
        metadataUri: "",
        enabled: false,
        marketAttachments: [],
      },
      {
        pointConfigObjectId: "0xseason-2",
        liquidlinkGlobalConfigObjectId: "0xll-global",
        projectObjectId: "0xproject-2",
        scoreboardObjectId: "0xscoreboard-2",
        label: "Jitter Season 2",
        protocol: "Jitter",
        season: "Season 2",
        metadataUri: "",
        enabled: true,
        marketAttachments: [
          {
            marketId: MARKET_ID,
            lpPointStateObjectId: null,
            scopes: ["yt"],
          },
        ],
      },
    ]);
  });
});

const NONE_ID_FOR_TEST =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
