import { expect, test } from "bun:test";
import {
  validateRegistryAdapter,
  validateRegistryPointTrading,
  validateRegistryPointSource,
  validateRegistryLpSource,
  validateRegistryOrderbooks,
} from "../registry-v2-validation.js";
import type {
  RegistryReader,
  RegistryRoot,
  RegistryMarket,
  RegistrySeries,
  RegistryProgram,
  RegistryPointTrading,
  RegistrySource,
} from "../registry-v2.js";
import type { ChainObjectInfo } from "../ports/chain-reader.js";
import { MAINNET_LP_RELEASE } from "../lp-deployment.js";
const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const core = id(700),
  adapter = id(701),
  ll = id(702),
  sourcePkg = id(703),
  upstream = id(704);
const sy = `${id(800)}::sy::SY`,
  pt = `${id(800)}::pt::PT`,
  yt = `${id(800)}::yt::YT`,
  sui = "0x2::sui::SUI",
  usdc = `${id(900)}::usdc::USDC`;
const trust = {
  liquidlinkPackageId: ll,
  liquidlinkConfigPackageId: id(705),
  expectedConfigId: id(12),
  expectedPolicies: [],
};
function fixture(adapter = id(701)) {
  const objects = new Map<string, ChainObjectInfo<unknown>>();
  function add(objectId: string, type: string, fields: unknown) {
    objects.set(objectId, {
      objectId,
      type,
      fields,
      version: "1",
      owner: { $kind: "Shared", Shared: { initialSharedVersion: "1" } },
    });
  }
  const reader: RegistryReader = {
    async getObjectInfo<T>(objectId: string) {
      const o = objects.get(objectId);
      if (!o) throw new Error("Missing object");
      return structuredClone(o) as ChainObjectInfo<T>;
    },
  };
  const root = {
    registryId: id(1),
    syStateId: id(4),
    packageId: id(999),
  } as RegistryRoot;
  const market = {
    marketId: id(5),
    syType: sy,
    ptType: pt,
    ytType: yt,
    expiryMs: "100",
  } as RegistryMarket;
  const series = {
    underlyingType: sui,
    receiptType: `${upstream}::reserve::MarketCoin<${sui}>`,
  } as RegistrySeries;
  add(id(4), `${core}::sy::SyState`, {
    sy_info: {
      contents: [
        {
          key: { name: sy },
          value: {
            underlying_type: { name: sui },
            sign_type: { name: `${adapter}::sign::SCALLOP` },
            market_id: { vec: [id(5)] },
            vault_id: { vec: [id(6)] },
          },
        },
      ],
    },
  });
  add(id(5), `${core}::market::Market<${sy},${pt},${yt}>`, { expiry: "100" });
  add(
    id(6),
    `${adapter}::scallop_market_vault::ScallopMarketVault<${sui},${sy},${pt},${yt}>`,
    { market_id: id(5), scallop_market_id: id(7) },
  );
  add(id(7), `${upstream}::market::Market`, {});
  add(id(8), `${upstream}::version::Version`, {});
  const binding = {
    kind: "adapter" as const,
    payloadType: `${id(999)}::market_registry::ScallopBinding`,
    marketId: id(5),
    adapterType: `${adapter}::sign::SCALLOP`,
    vaultId: id(6),
    revision: "1",
    payload: { scallop_market_id: id(7), version_id: id(8) },
  };
  const program = {
    scoreboardId: id(10),
    projectObjectId: id(11),
    liquidlinkConfigId: id(12),
  } as RegistryProgram;
  add(id(10), `${ll}::scoreboard::Scoreboard`, { project_id: id(13) });
  add(id(11), `${ll}::project::Project`, {
    project_id: id(13),
    scoreboard_id: id(10),
    policy_registrations: [],
    policy_generations: [],
    auth_sources: [
      {
        project_object_id: id(11),
        source_id: id(16),
        witness: { name: `${sourcePkg}::liquidlink_points::JitterPointSource` },
        enabled: true,
      },
    ],
  });
  add(id(12), `${id(705)}::global_config::GlobalConfig`, {});
  const trading = {
    kind: "pointTrading",
    scoreboardId: id(10),
    pointTokenMarketId: id(14),
    orderbookId: id(15),
    revision: "1",
  } as RegistryPointTrading;
  const token = `${id(801)}::point::POINT`;
  add(id(14), `${ll}::token::PointTokenMarket<${token}>`, {
    scoreboard_id: id(10),
    project_id: id(13),
    scale: "1000000",
  });
  add(id(15), `${ll}::orderbook::OrderBook<${token},${usdc}>`, {
    decimals_t: 6,
    decimals_t1: 6,
  });
  const source = {
    sourceId: id(16),
    scoreboardId: id(10),
    sourceType: `${sourcePkg}::liquidlink_points::PointConfig`,
    policyType: `${sourcePkg}::liquidlink_points::PointPolicy`,
  } as RegistrySource;
  add(id(16), source.sourceType, {
    project_object_id: id(11),
    scoreboard_id: id(10),
    yt_multiplier_bps: "0",
    lp_multiplier_bps: "0",
    duration: "86400000",
  });
  return {
    objects,
    reader,
    root,
    market,
    series,
    binding,
    program,
    trading,
    source,
  };
}
test("validates actual SyState sign/vault, Market, underlying, and upstream types", async () => {
  const f = fixture();
  const result = await validateRegistryAdapter(f.reader, {
    ...f,
    corePackageId: core,
    adapterPackageId: adapter,
    expectedReceiptType: f.series.receiptType,
    upstreamTypes: {
      scallopMarket: `${upstream}::market::Market`,
      scallopVersion: `${upstream}::version::Version`,
    },
  });
  expect(result.kind).toBe("scallop");
  expect(result.vaultId).toBe(id(6));
});

test("upgraded adapter calls validate original vault/sign types and reject another lineage", async () => {
  const release = MAINNET_LP_RELEASE.scallop;
  const f = fixture(release.originalId);
  const input = {...f, corePackageId:core, adapterPackageId:release.packageId,
    expectedReceiptType:f.series.receiptType,
    upstreamTypes:{scallopMarket:`${upstream}::market::Market`,scallopVersion:`${upstream}::version::Version`}};
  expect((await validateRegistryAdapter(f.reader,input)).adapterType).toBe(`${release.originalId}::sign::SCALLOP`);
  await expect(validateRegistryAdapter(f.reader,{...input,adapterPackageId:MAINNET_LP_RELEASE.haedal.packageId})).rejects.toThrow("adapter sign mismatch");
});

test("validates native gRPC TypeName strings and unwrapped Option IDs", async () => {
  const f = fixture();
  const entry = (f.objects.get(id(4))!.fields as any).sy_info.contents[0];
  entry.key = sy;
  entry.value = {
    underlying_type: sui,
    sign_type: `${adapter}::sign::SCALLOP`,
    market_id: id(5),
    vault_id: id(6),
  };
  expect(
    (
      await validateRegistryAdapter(f.reader, {
        ...f,
        corePackageId: core,
        adapterPackageId: adapter,
        expectedReceiptType: f.series.receiptType,
        upstreamTypes: {
          scallopMarket: `${upstream}::market::Market`,
          scallopVersion: `${upstream}::version::Version`,
        },
      })
    ).marketId,
  ).toBe(id(5));
});

test("Haedal and Ember descriptors use their actual distinct Vault generic layouts", async () => {
  for (const kind of ["haedal", "ember"] as const) {
    const f = fixture();
    const sign = `${adapter}::sign::${kind.toUpperCase()}`;
    (f.objects.get(id(4))!.fields as any).sy_info.contents[0].value.sign_type =
      { name: sign };
    f.binding.adapterType = sign;
    f.binding.payloadType = `${id(999)}::market_registry::${kind === "haedal" ? "Haedal" : "Ember"}Binding`;
    f.binding.payload =
      kind === "haedal"
        ? ({ staking_id: id(7) } as any)
        : ({ ember_vault_id: id(7) } as any);
    const upType =
      kind === "haedal"
        ? `${upstream}::staking::Staking`
        : `${upstream}::vault::Vault<${sui},${f.series.receiptType}>`;
    f.objects.get(id(7))!.type = upType;
    f.objects.get(id(6))!.type =
      kind === "haedal"
        ? `${adapter}::haedal_market_vault::HaedalMarketVault<${sy},${pt},${yt}>`
        : `${adapter}::ember_market_vault::EmberMarketVault<${sui},${f.series.receiptType},${sy},${pt},${yt}>`;
    f.objects.get(id(6))!.fields = {
      market_id: id(5),
      ...(kind === "haedal"
        ? { staking_id: id(7) }
        : { ember_vault_id: id(7) }),
    };
    expect(
      (
        await validateRegistryAdapter(f.reader, {
          ...f,
          corePackageId: core,
          adapterPackageId: adapter,
          expectedReceiptType: f.series.receiptType,
          upstreamTypes:
            kind === "haedal"
              ? { haedalStaking: upType }
              : { emberVault: upType },
        })
      ).kind,
    ).toBe(kind);
  }
});
test("rejects wrong vault/market/sign/underlying/upstream and absent canonical binding", async () => {
  for (const corrupt of [
    (f: ReturnType<typeof fixture>) => {
      (f.objects.get(id(6))!.fields as any).market_id = id(55);
    },
    (f: ReturnType<typeof fixture>) => {
      f.objects.get(id(6))!.type =
        `${id(333)}::scallop_market_vault::ScallopMarketVault<${sui},${sy},${pt},${yt}>`;
    },
    (f: ReturnType<typeof fixture>) => {
      f.binding.adapterType = `${id(333)}::sign::Sign`;
    },
    (f: ReturnType<typeof fixture>) => {
      (
        f.objects.get(id(4))!.fields as any
      ).sy_info.contents[0].value.underlying_type = { name: usdc };
    },
    (f: ReturnType<typeof fixture>) => {
      f.objects.get(id(8))!.type = `${upstream}::other::Version`;
    },
    (f: ReturnType<typeof fixture>) => {
      delete (f.objects.get(id(4))!.fields as any).sy_info.contents[0].value
        .vault_id;
    },
  ]) {
    const f = fixture();
    corrupt(f);
    await expect(
      validateRegistryAdapter(f.reader, {
        ...f,
        corePackageId: core,
        adapterPackageId: adapter,
        expectedReceiptType: f.series.receiptType,
        upstreamTypes: {
          scallopMarket: `${upstream}::market::Market`,
          scallopVersion: `${upstream}::version::Version`,
        },
      }),
    ).rejects.toThrow();
  }
});
test("Point Trading validates Scoreboard, Project cap identity, token base and full quote type", async () => {
  const f = fixture();
  const result = await validateRegistryPointTrading(f.reader, {
    ...trust,
    program: f.program,
    link: f.trading,
    expectedQuoteType: usdc,
  });
  expect(result.quoteType).toContain("::usdc::USDC");
  expect(result.scale).toBe("1000000");
  for (const change of [
    "scoreboard",
    "project",
    "quote",
    "coin-base",
    "missing-scale",
  ]) {
    const f = fixture();
    if (change === "scoreboard")
      (f.objects.get(id(14))!.fields as any).scoreboard_id = id(200);
    if (change === "project")
      (f.objects.get(id(14))!.fields as any).project_id = id(200);
    if (change === "quote")
      f.objects.get(id(15))!.type =
        `${ll}::orderbook::OrderBook<${id(801)}::point::POINT,${id(202)}::usdc::USDC>`;
    if (change === "coin-base")
      f.objects.get(id(14))!.type = `0x2::coin::Coin<${id(801)}::point::POINT>`;
    if (change === "missing-scale")
      delete (f.objects.get(id(14))!.fields as any).scale;
    await expect(
      validateRegistryPointTrading(f.reader, {
        ...trust,
        program: f.program,
        link: f.trading,
        expectedQuoteType: usdc,
      }),
    ).rejects.toThrow();
  }
});
test("PointConfig zero multipliers are retained and missing values are not zero", async () => {
  const f = fixture();
  const input = {
    ...trust,
    program: f.program,
    source: f.source,
    expectedSourceType: f.source.sourceType,
    expectedAuthWitness: `${sourcePkg}::liquidlink_points::JitterPointSource`,
  };
  const result = await validateRegistryPointSource(f.reader, input);
  expect(result.ytMultiplierBps).toBe("0");
  delete (f.objects.get(id(16))!.fields as any).yt_multiplier_bps;
  await expect(validateRegistryPointSource(f.reader, input)).rejects.toThrow(
    "yt_multiplier_bps",
  );
});

test("current Point Trading rejects substituted Config and stale/missing/reordered Project policies", async () => {
  const policyA = {
    policyType: `${id(707)}::policy::A`,
    stateId: id(708),
    generation: "2",
  };
  const policyB = {
    policyType: `${id(707)}::policy::B`,
    stateId: id(709),
    generation: "1",
  };
  const f = fixture();
  const project = f.objects.get(id(11))!.fields as any;
  project.policy_registrations = [policyA, policyB].map((p) => ({
    policy: { name: p.policyType },
    policy_state_id: p.stateId,
    generation: p.generation,
  }));
  project.policy_generations = [policyA, policyB].map((p) => ({
    policy: { name: p.policyType },
    generation: p.generation,
  }));
  const input = {
    ...trust,
    program: f.program,
    link: f.trading,
    expectedQuoteType: usdc,
    expectedPolicies: [policyA, policyB],
  };
  expect(
    (await validateRegistryPointTrading(f.reader, input)).policies,
  ).toHaveLength(2);
  for (const expectedPolicies of [
    [],
    [policyB, policyA],
    [{ ...policyA, generation: "1" }, policyB],
    [{ ...policyA, stateId: id(999) }, policyB],
  ])
    await expect(
      validateRegistryPointTrading(f.reader, { ...input, expectedPolicies }),
    ).rejects.toThrow();
  await expect(
    validateRegistryPointTrading(f.reader, {
      ...input,
      expectedConfigId: id(999),
    }),
  ).rejects.toThrow("config");
  await expect(
    validateRegistryPointTrading(f.reader, {
      ...input,
      liquidlinkConfigPackageId: id(999),
    }),
  ).rejects.toThrow("type/ID");
});

test("current source validation requires the actual Project auth-source witness", async () => {
  const f = fixture();
  const input = {
    ...trust,
    program: f.program,
    source: f.source,
    expectedSourceType: f.source.sourceType,
    expectedAuthWitness: `${sourcePkg}::liquidlink_points::JitterPointSource`,
  };
  const auth = (f.objects.get(id(11))!.fields as any).auth_sources;
  auth[0].enabled = false;
  await expect(validateRegistryPointSource(f.reader, input)).rejects.toThrow(
    "auth source",
  );
  auth[0].enabled = true;
  auth[0].source_id = id(99);
  await expect(validateRegistryPointSource(f.reader, input)).rejects.toThrow(
    "auth source",
  );
});

test("LP descriptor verifies real PointConfig/pool topology and ordinary Orderbooks verify full generics", async () => {
  const f = fixture();
  const lp = id(40),
    book = id(41);
  f.objects.set(lp, {
    objectId: lp,
    type: `${sourcePkg}::liquidlink_points::LpPointState<${sy}>`,
    version: "1",
    owner: { $kind: "Shared", Shared: {} },
    fields: {
      point_config_id: id(16),
      pool_id: id(5),
      initialized: true,
      lp_rewarder_uid: id(42),
      pool_rewarder_uid: id(43),
    },
  });
  const association = {
    marketId: id(5),
    sourceId: id(16),
    lpPointStateId: lp,
    ytEnabled: true,
    lpEnabled: true,
    archived: false,
    revision: "1",
  };
  expect(
    (
      await validateRegistryLpSource(f.reader, {
        association,
        source: f.source,
        market: f.market,
        extensionsPackageId: sourcePkg,
      })
    ).lpPointStateId,
  ).toBe(lp);
  (f.objects.get(lp)!.fields as any).point_config_id = id(17);
  await expect(
    validateRegistryLpSource(f.reader, {
      association,
      source: f.source,
      market: f.market,
      extensionsPackageId: sourcePkg,
    }),
  ).rejects.toThrow("PointConfig");
  f.objects.set(book, {
    objectId: book,
    type: `${id(710)}::orderbook::OrderBook<${usdc},${pt}>`,
    version: "1",
    owner: { $kind: "Shared", Shared: {} },
    fields: { market_id: id(5), market_expiry_ms: "100", base_kind: 0 },
  });
  const input = {
    market: f.market,
    links: {
      kind: "orderbooks" as const,
      marketId: id(5),
      ptOrderbookId: book,
      ytOrderbookId: null,
      revision: "1",
    },
    orderbookPackageId: id(710),
    expectedQuoteType: usdc,
  };
  expect(
    (await validateRegistryOrderbooks(f.reader, input)).ptOrderbookId,
  ).toBe(book);
  (f.objects.get(book)!.fields as any).base_kind = 1;
  await expect(validateRegistryOrderbooks(f.reader, input)).rejects.toThrow(
    "base kind",
  );
  (f.objects.get(book)!.fields as any).base_kind = 0;
  f.objects.get(book)!.type = `${id(710)}::orderbook::OrderBook<${usdc},${yt}>`;
  await expect(validateRegistryOrderbooks(f.reader, input)).rejects.toThrow(
    "type/ID",
  );
});
