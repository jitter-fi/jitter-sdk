import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import {
  createRegistryV2Builder,
  createSharedRegistry,
} from "../registry-v2-builders.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const m = {
  name: "Scallop",
  slug: "scallop",
  description: "",
  iconUri: "https://example.com/icon.png",
  websiteUri: "https://scallop.io",
  docsUri: "",
  metadataUri: "",
};
test("Registry V2 mutation builders compose metadata and mandatory authority objects", () => {
  const tx = new Transaction();
  const b = createRegistryV2Builder(tx, id(9), {
    registry: id(1),
    config: id(2),
    admin: id(3),
  });
  b.registerProtocol(m);
  b.registerSeries({
    protocolId: "1",
    underlyingType: "0x2::sui::SUI",
    receiptType: `${id(8)}::receipt::R`,
    metadata: {
      name: "sSUI",
      symbol: "sSUI",
      description: "",
      iconUri: "",
      category: "Lending",
      metadataUri: "",
    },
  });
  b.updateProtocol({ protocolId: "1", expectedRevision: "2", metadata: m });
  const calls = tx.getData().commands.map((c) => c.MoveCall!);
  expect(calls.map((c) => c.function)).toEqual([
    "protocol_metadata",
    "register_protocol",
    "series_metadata",
    "register_series",
    "protocol_metadata",
    "update_protocol",
  ]);
  expect(calls[1]!.arguments).toHaveLength(4);
  expect(calls[3]!.typeArguments).toHaveLength(2);
  expect(
    calls.every((c) => c.package === id(9) && c.module === "market_registry"),
  ).toBe(true);
});
test("adapter builders use the curated five-generic ABI and explicit vault ID", () => {
  const tx = new Transaction();
  const b = createRegistryV2Builder(tx, id(9), {
    registry: id(1),
    config: id(2),
    admin: id(3),
  });
  b.setAdapterBinding({
    syState: id(4),
    market: id(5),
    syType: `${id(8)}::sy::SY`,
    ptType: `${id(8)}::pt::PT`,
    ytType: `${id(8)}::yt::YT`,
    adapterType: `${id(7)}::sign::Sign`,
    expectedRevision: "0",
    vaultId: id(6),
    binding: { kind: "scallop", scallopMarketId: id(20), versionId: id(21) },
  });
  const calls = tx.getData().commands.map((c) => c.MoveCall!);
  expect(calls.map((c) => c.function)).toEqual([
    "scallop_binding",
    "set_adapter_binding",
  ]);
  expect(calls[1]!.typeArguments).toHaveLength(5);
  expect(calls[1]!.arguments).toHaveLength(8);
});
test("builders reject unsafe inputs before appending any command", () => {
  for (const invalid of [
    { ...m, iconUri: "javascript:alert(1)" },
    { ...m, name: "x".repeat(1000) },
    { ...m, slug: "a b" },
  ]) {
    const tx = new Transaction();
    const b = createRegistryV2Builder(tx, id(9), {
      registry: id(1),
      config: id(2),
      admin: id(3),
    });
    expect(() => b.registerProtocol(invalid)).toThrow();
    expect(tx.getData().commands).toHaveLength(0);
  }
});
test("createSharedRegistry does not take an existing Registry or TreasuryCap", () => {
  const tx = new Transaction();
  createSharedRegistry(tx, id(9), {
    config: id(2),
    admin: id(3),
    syState: id(4),
  });
  expect(tx.getData().commands[0]?.MoveCall?.function).toBe("create_shared");
  expect(tx.getData().commands[0]?.MoveCall?.arguments).toHaveLength(3);
});
test("matches Move UTF-8 label/description/URI boundaries, including 64-byte symbols", () => {
  const tx = new Transaction();
  const b = createRegistryV2Builder(tx, id(9), {
    registry: id(1),
    config: id(2),
    admin: id(3),
  });
  b.registerProtocol({
    ...m,
    name: "\u4e2d".repeat(21) + "a",
    description: "x".repeat(512),
  });
  b.registerSeries({
    protocolId: "1",
    underlyingType: "0x2::sui::SUI",
    receiptType: `${id(8)}::receipt::R`,
    metadata: {
      name: "sSUI",
      symbol: "S".repeat(64),
      description: "",
      iconUri: "",
      category: "",
      metadataUri: "",
    },
  });
  for (const bad of [
    { ...m, name: "a".repeat(65) },
    { ...m, name: "\u4e2d".repeat(22) },
    { ...m, description: "a".repeat(513) },
    { ...m, slug: "" },
  ])
    expect(() => b.registerProtocol(bad)).toThrow();
  expect(() =>
    b.registerSource({
      scoreboardId: id(20),
      source: id(21),
      sourceType: `${id(7)}::source::S`,
      policyType: `${id(7)}::policy::P`,
      label: "",
    }),
  ).toThrow();
});

test("all twenty-one mutation primitives preserve ABI argument order/count and authority prefix", () => {
  const tx = new Transaction();
  const b = createRegistryV2Builder(tx, id(9), {
    registry: id(1),
    config: id(2),
    admin: id(3),
  });
  const series = {
    name: "sSUI",
    symbol: "sSUI",
    description: "",
    iconUri: "",
    category: "Lending",
    metadataUri: "",
  };
  const market = { name: "", description: "", iconUri: "", metadataUri: "" };
  const program = {
    name: "Jitter",
    season: "1",
    description: "",
    iconUri: "",
    metadataUri: "",
  };
  b.registerProtocol(m);
  b.registerSeries({
    protocolId: "1",
    underlyingType: "0x2::sui::SUI",
    receiptType: `${id(7)}::receipt::R`,
    metadata: series,
  });
  b.registerMarket({
    syState: id(4),
    market: id(5),
    seriesId: "1",
    syType: `${id(7)}::sy::S`,
    ptType: `${id(7)}::pt::P`,
    ytType: `${id(7)}::yt::Y`,
    metadata: market,
  });
  b.registerProgram({
    scoreboardId: id(10),
    projectObjectId: id(11),
    liquidlinkConfigId: id(12),
    protocolId: null,
    metadata: program,
  });
  b.registerSource({
    scoreboardId: id(10),
    source: id(13),
    sourceType: `${id(7)}::source::S`,
    policyType: `${id(7)}::policy::P`,
    label: "Points",
  });
  b.attachSource({
    marketId: id(5),
    sourceId: id(13),
    lpPointStateId: null,
    ytEnabled: true,
    lpEnabled: false,
  });
  b.updateMarketSource({
    marketId: id(5),
    sourceId: id(13),
    expectedRevision: "1",
    lpPointStateId: id(16),
    ytEnabled: true,
    lpEnabled: true,
  });
  b.updateProtocol({ protocolId: "1", expectedRevision: "1", metadata: m });
  b.updateSeries({ seriesId: "1", expectedRevision: "1", metadata: series });
  b.updateMarket({ marketId: id(5), expectedRevision: "1", metadata: market });
  b.updateProgram({
    scoreboardId: id(10),
    expectedRevision: "1",
    metadata: program,
  });
  b.setProtocolListing({
    protocolId: "1",
    expectedRevision: "2",
    listed: false,
    displayRank: "0",
  });
  b.setSeriesListing({
    seriesId: "1",
    expectedRevision: "2",
    listed: false,
    displayRank: "0",
  });
  b.setMarketListing({
    marketId: id(5),
    expectedRevision: "2",
    listed: false,
    displayRank: "0",
  });
  b.setProgramListing({
    scoreboardId: id(10),
    expectedRevision: "2",
    listed: false,
  });
  b.setDefaultMarket({ seriesId: "1", expectedRevision: "3", marketId: id(5) });
  b.archiveSource({ sourceId: id(13), expectedRevision: "1", archived: true });
  b.archiveMarketSource({
    marketId: id(5),
    sourceId: id(13),
    expectedRevision: "1",
    archived: true,
  });
  b.setOrderbooks({
    marketId: id(5),
    expectedRevision: "0",
    ptOrderbookId: null,
    ytOrderbookId: null,
  });
  b.setPointTrading({
    scoreboardId: id(10),
    expectedRevision: "0",
    pointTokenMarketId: id(14),
    orderbookId: id(15),
  });
  b.setAdapterBinding({
    syState: id(4),
    market: id(5),
    syType: `${id(7)}::sy::S`,
    ptType: `${id(7)}::pt::P`,
    ytType: `${id(7)}::yt::Y`,
    adapterType: `${id(8)}::sign::HAEDAL`,
    expectedRevision: "0",
    vaultId: id(6),
    binding: { kind: "haedal", stakingId: id(20) },
  });
  const arities: Record<string, number> = {
    register_protocol: 4,
    register_series: 5,
    register_market: 7,
    register_program: 8,
    register_source: 6,
    attach_source: 8,
    update_market_source: 9,
    update_protocol: 6,
    update_series: 6,
    update_market: 6,
    update_program: 6,
    set_protocol_listing: 7,
    set_series_listing: 7,
    set_market_listing: 7,
    set_program_listing: 6,
    set_default_market: 6,
    archive_source: 6,
    archive_market_source: 7,
    set_orderbooks: 7,
    set_point_trading: 7,
    set_adapter_binding: 8,
  };
  const mutations = tx
    .getData()
    .commands.flatMap((c) =>
      c.MoveCall && c.MoveCall.function in arities ? [c.MoveCall] : [],
    );
  expect(mutations).toHaveLength(21);
  const authority = mutations[0]!.arguments.slice(0, 3);
  for (const c of mutations) {
    expect(c.arguments).toHaveLength(arities[c.function]!);
    expect(c.arguments.slice(0, 3)).toEqual(authority);
  }
  expect(() =>
    b.attachSource({
      marketId: id(5),
      sourceId: id(13),
      lpPointStateId: null,
      ytEnabled: false,
      lpEnabled: false,
    }),
  ).toThrow("scopes");
});
