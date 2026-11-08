import { expect, test } from "bun:test";
import { discoverJitterMarketConfigEntries } from "../market-discovery.js";
import { registryFixture, id, pkg } from "./registry-v2-fixtures.js";
import type { ChainObjectInfo } from "../ports/chain-reader.js";
import {EMBER_EEARN, EMBER_ESUI} from '../ember-deployment.js';

function fixture(count = 1) {
  const f = registryFixture(count);
  const objects = new Map<string, ChainObjectInfo<unknown>>();
  for (let i = 0; i < count; i++)
    objects.set(id(100 + i), {
      objectId: id(100 + i),
      type: `${pkg}::market::Market<${pkg}::sy::SY,${pkg}::pt::PT,${pkg}::yt::YT>`,
      version: "1",
      owner: { $kind: "Shared", Shared: { initialSharedVersion: "1" } },
      fields: {
        expiry: "1800057600000",
        price_aggregator_id: id(70),
        reward_distributor_id: id(71),
      },
    });
  const trust = {
    network: "mainnet" as const,
    chainId: "35834a8a",
    registryObjectId: id(1),
    registryPackageId: pkg,
    configId: id(2),
    adminCapId: id(3),
    syStateId: id(4),
    packages: {
      jitterPackageId: pkg,
      oraclePackageId: id(60),
      aclObjectId: id(61),
    },
    assets: [
      {
        underlyingType: "0x2::sui::SUI",
        underlyingDecimals: 9,
        marketDecimals: 9,
      },
    ],
  };
  const reader = {
    ...f.reader,
    async getObjectInfo<T>(objectId: string) {
      const value = objects.get(objectId);
      return value
        ? (structuredClone(value) as ChainObjectInfo<T>)
        : f.reader.getObjectInfo<T>(objectId);
    },
  };
  return { ...f, objects, reader, trust };
}

test("discovers listed markets from an empty seed list, inherits metadata, and never enables trades", async () => {
  const f = fixture();
  const [entry] = await discoverJitterMarketConfigEntries(f.reader, f.trust);
  expect(entry?.id).toBe(id(100));
  expect(entry?.name).toBe("Scallop sSUI");
  expect(entry?.config.marketIconUri).toBe("https://example.com/ssui.png");
  expect(entry?.config.marketObjectId).toBe(id(100));
  expect(entry?.config.rewardDistributorObjectId).toBe(id(71));
  expect(entry?.tradeReady).toBe(false);
  expect(entry?.config.liquidlink).toBeUndefined();
  expect(entry?.config.orderbookObjectId).toBeNull();
});

test("market validation overlaps at most four markets and preserves Registry order", async () => {
  const f = fixture(10);
  let active = 0, peak = 0;
  const reader = { ...f.reader, async getObjectInfo<T>(objectId: string) {
    if (!f.objects.has(objectId)) return f.reader.getObjectInfo<T>(objectId);
    active++;
    peak = Math.max(peak, active);
    try {
      await new Promise(resolve => setTimeout(resolve, 2));
      return await f.reader.getObjectInfo<T>(objectId);
    } finally { active--; }
  } };
  const entries = await discoverJitterMarketConfigEntries(reader, f.trust);
  expect(peak).toBe(4);
  expect(entries.map(entry => entry.id)).toEqual(Array.from({ length: 10 }, (_, i) => id(100 + i)));
  expect(entries.every(entry => entry.tradeReady === false)).toBe(true);
});

test("discovers every page and sees subsequently registered markets without per-market config", async () => {
  const f = fixture(101);
  const entries = await discoverJitterMarketConfigEntries(f.reader, f.trust);
  expect(entries).toHaveLength(101);
  expect(entries[100]?.id).toBe(id(200));
  expect(f.queries.some((q) => q.parentId === id(12) && q.cursor)).toBe(true);
});

for (const [table, key] of [
  [10, "protocol"],
  [11, "series"],
  [12, "market"],
] as const) {
  test(`hides markets with an unlisted ${key}`, async () => {
    const f = fixture();
    const fields = f.rows.get(id(table))![0]!.fields as {
      value: { listed: boolean };
    };
    fields.value.listed = false;
    expect(await discoverJitterMarketConfigEntries(f.reader, f.trust)).toEqual(
      [],
    );
  });
}

for (const key of [
  "configId",
  "syStateId",
  "adminCapId",
  "registryPackageId",
] as const) {
  test(`rejects mismatched trusted ${key}`, async () => {
    const f = fixture();
    await expect(
      discoverJitterMarketConfigEntries(f.reader, {
        ...f.trust,
        [key]: id(999),
      }),
    ).rejects.toThrow();
  });
}

test("does not guess decimals for unsupported assets", async () => {
  const f = fixture();
  expect(
    await discoverJitterMarketConfigEntries(f.reader, {
      ...f.trust,
      assets: [],
    }),
  ).toEqual([]);
});

test("rejects wrong Market types, ownership and expiry instead of returning an empty list", async () => {
  for (const mutation of [
    (o: ChainObjectInfo<unknown>) => {
      o.type = `${id(999)}::market::Market`;
    },
    (o: ChainObjectInfo<unknown>) => {
      o.owner = { $kind: "AddressOwner", AddressOwner: id(9) };
    },
    (o: ChainObjectInfo<unknown>) => {
      o.fields = { expiry: "1" };
    },
  ]) {
    const f = fixture();
    mutation(f.objects.get(id(100))!);
    await expect(
      discoverJitterMarketConfigEntries(f.reader, f.trust),
    ).rejects.toThrow();
  }
});

test("propagates incomplete Registry pagination instead of pretending there are no markets", async () => {
  const f = fixture();
  f.root.markets.size = "2";
  await expect(
    discoverJitterMarketConfigEntries(f.reader, f.trust),
  ).rejects.toThrow();
});

function haedalFixture() {
  const f = fixture();
  const adapter = id(701), origin = id(704), staking = id(705), vault = id(706);
  const receipt = `${origin}::hasui::HASUI`, sign = `${adapter}::sign::HAEDAL`;
  const series = (f.rows.get(id(11))![0]!.fields as { value: { receipt_type: { name: string } } }).value;
  series.receipt_type.name = receipt;
  const add = (objectId: string, type: string, fields: unknown) => f.objects.set(objectId, {
    objectId, type, fields, version: "1", owner: { $kind: "Shared", Shared: { initialSharedVersion: "1" } },
  });
  add(id(4), `${pkg}::sy::SyState`, { sy_info: { contents: [{ key: { name: `${pkg}::sy::SY` }, value: {
    underlying_type: { name: "0x2::sui::SUI" }, sign_type: { name: sign }, market_id: { vec: [id(100)] }, vault_id: { vec: [vault] },
  } }] } });
  add(vault, `${adapter}::haedal_market_vault::HaedalMarketVault<${pkg}::sy::SY,${pkg}::pt::PT,${pkg}::yt::YT>`,
    { market_id: id(100), staking_id: staking });
  add(staking, `${origin}::staking::Staking`, {});
  const payload = `${pkg}::market_registry::HaedalBinding`;
  f.root.extensions.size = "1";
  f.rows.set(id(16), [{ objectId: id(707), version: "1", owner: { $kind: "ObjectOwner", ObjectOwner: id(16) },
    type: `0x2::dynamic_field::Field<${pkg}::market_registry::AdapterKey<${payload}>,${pkg}::market_registry::AdapterBinding<${payload}>>`,
    fields: { name: { market_id: id(100) }, value: { market_id: id(100), adapter_type: { name: sign }, vault_id: vault,
      payload: { staking_id: staking }, revision: "1" } },
  }]);
  return { ...f, vault, staking, trust: { ...f.trust, packages: { ...f.trust.packages, jitterMathPackageId: id(710) },
    haedal: { adapterPackageId: adapter, stakingTypePackageId: origin, callPackageId: id(708), stakingObjectId: staking } } };
}

test("discovers typed Haedal binding and uses latest call package distinct from defining origin", async () => {
  const f = haedalFixture();
  const [entry] = await discoverJitterMarketConfigEntries(f.reader, f.trust);
  expect(entry?.tradeReady).toBe(false);
  expect(entry?.config).toMatchObject({ adapterKind: "haedal", haedalAdapterPackageId: id(701), haedalMarketVaultObjectId: f.vault,
    haedalProtocolPackageId: id(708), haedalStakingObjectId: f.staking, jitterMathPackageId: id(710) });
});

for (const corrupt of ["staking", "receipt", "owner", "sign", "syBinding"] as const) {
  test(`rejects untrusted Haedal ${corrupt}`, async () => {
    const f = haedalFixture();
    if (corrupt === "staking") f.trust.haedal.stakingObjectId = id(999);
    if (corrupt === "receipt") f.trust.haedal.stakingTypePackageId = id(999);
    if (corrupt === "owner") f.objects.get(f.staking)!.owner = { $kind: "AddressOwner", AddressOwner: id(999) };
    if (corrupt === "sign") f.trust.haedal.adapterPackageId = id(999);
    if (corrupt === "syBinding") f.objects.get(id(4))!.fields = { sy_info: { contents: [] } };
    await expect(discoverJitterMarketConfigEntries(f.reader, f.trust)).rejects.toThrow();
  });
}

function emberFixture() {
  const f = haedalFixture(), adapter = id(801), origin = id(802), upstream = id(803);
  const receipt = `${id(804)}::esui::ESUI`, sign = `${adapter}::sign::EMBER`;
  (f.rows.get(id(11))![0]!.fields as any).value.receipt_type.name = receipt;
  (f.objects.get(id(4))!.fields as any).sy_info.contents[0].value.sign_type.name = sign;
  Object.assign(f.objects.get(f.vault)!, {type: `${adapter}::ember_market_vault::EmberMarketVault<0x2::sui::SUI,${receipt},${pkg}::sy::SY,${pkg}::pt::PT,${pkg}::yt::YT>`, fields: {market_id: id(100), ember_vault_id: upstream}});
  f.objects.set(upstream, {...f.objects.get(f.staking)!, objectId: upstream, type: `${origin}::vault::Vault<0x2::sui::SUI,${receipt}>`});
  const row = f.rows.get(id(16))![0]!, payload = `${pkg}::market_registry::EmberBinding`;
  row.type = `0x2::dynamic_field::Field<${pkg}::market_registry::AdapterKey<${payload}>,${pkg}::market_registry::AdapterBinding<${payload}>>`;
  Object.assign((row.fields as any).value, {adapter_type: {name: sign}, payload: {ember_vault_id: upstream}});
  return {...f, trust: {...f.trust, ember: {adapterPackageId: adapter, typePackageId: origin, callPackageId: id(805), protocolConfigObjectId: id(806), vaultObjectId: upstream, receiptType: receipt}}};
}

test('discovers eSUI with separate call, defining type and receipt packages, without enabling trading', async () => {
  const f = emberFixture(), [entry] = await discoverJitterMarketConfigEntries(f.reader, f.trust);
  expect(entry?.tradeReady).toBe(false);
  expect(entry?.config).toMatchObject({adapterKind: 'ember', emberVaultsPackageId: id(805), emberVaultObjectId: id(803), emberMarketVaultObjectId: f.vault, emberReceiptTypeTag: `${id(804)}::esui::ESUI`});
  f.trust.ember.vaultObjectId = id(999);
  await expect(discoverJitterMarketConfigEntries(f.reader, f.trust)).rejects.toThrow('trusted deployment');
});

test('multiple Ember vaults select the reviewed receipt and reject cross-vault substitutions', async () => {
  const f = emberFixture(), e = EMBER_EEARN;
  const series = (f.rows.get(id(11))![0]!.fields as any).value;
  series.underlying_type.name = e.underlyingType;
  series.receipt_type.name = e.receiptType;
  const sign = `${e.adapterPackageId}::sign::EMBER`;
  const sy = (f.objects.get(id(4))!.fields as any).sy_info.contents[0].value;
  sy.underlying_type.name = e.underlyingType;
  sy.sign_type.name = sign;
  Object.assign(f.objects.get(f.vault)!, {type: `${e.adapterPackageId}::ember_market_vault::EmberMarketVault<${e.underlyingType},${e.receiptType},${pkg}::sy::SY,${pkg}::pt::PT,${pkg}::yt::YT>`, fields: {market_id: id(100), ember_vault_id: e.vaultObjectId}});
  f.objects.set(e.vaultObjectId, {...f.objects.get(f.staking)!, objectId: e.vaultObjectId, type: `${e.typePackageId}::vault::Vault<${e.underlyingType},${e.receiptType}>`});
  Object.assign((f.rows.get(id(16))![0]!.fields as any).value, {adapter_type: {name: sign}, payload: {ember_vault_id: e.vaultObjectId}});
  const trust = {...f.trust, emberVaults: [EMBER_ESUI, e], assets: [{underlyingType:e.underlyingType, underlyingDecimals:6, marketDecimals:6}]};
  const [entry] = await discoverJitterMarketConfigEntries(f.reader, trust);
  expect(entry?.config.emberVaultObjectId).toBe(e.vaultObjectId);
  expect(entry?.config.marketDecimals).toBe(6);
  expect(entry?.tradeReady).toBe(false);
  (f.objects.get(f.vault)!.fields as any).ember_vault_id = EMBER_ESUI.vaultObjectId;
  await expect(discoverJitterMarketConfigEntries(f.reader, trust)).rejects.toThrow();
});
