import { bcs } from "@mysten/sui/bcs";
import { normalizeStructTag, normalizeSuiAddress, parseStructTag } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { getSuiGrpcClient } from "../rpc.js";
import { getLiquidlinkLeaderboard } from "../queries.js";
import {discoverJitterRegistry} from '../registry-v2.js';
import {SuiJitterChainReader} from './sui-chain-reader.js';
import {
  addSyncPyPositionWithLiquidlinkPoints,
  addClaimLpPointsWithLiquidlinkPoints,
} from "../liquidlink-points.js";
import type {
  GeneratedRewardDependencies,
  GeneratedRewardInput,
  RegisteredPointPosition,
} from "../services/generated-reward-leaderboard.js";

const fields = (v: unknown): Record<string, any> => {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw Error("Unreadable reward fields.");
  const f = v as Record<string, any>;
  return f.fields ?? f;
};
const address = (v: unknown) => {
  if (typeof v !== "string" || !/^0x[\da-f]{1,64}$/i.test(v))
    throw Error("Invalid reward address.");
  return normalizeSuiAddress(v);
};
const amount = (v: unknown) => {
  if (typeof v !== "string" || !/^\d+$/.test(v))
    throw Error("Invalid reward exposure.");
  return BigInt(v);
};

export function createGeneratedRewardChainReader(
  input: GeneratedRewardInput,
  client = getSuiGrpcClient(input.network),
  readRegistry = (registryId: string) => discoverJitterRegistry(new SuiJitterChainReader(input.network), registryId),
): GeneratedRewardDependencies {
  const scoreboardId = address(input.scoreboardId);
  const configs = input.configs.filter((c) =>
    c.liquidlink?.pointPrograms?.some(
      (p) => address(p.scoreboardObjectId) === scoreboardId,
    ),
  );
  if (!configs.length)
    throw Error("No discovered point sources for generated leaderboard.");
  const first = configs[0]!;
  const llPackage = first.liquidlink?.liquidlinkPackageId;
  if (!llPackage) throw Error("Missing LiquidLink read package.");
  const scoreConfig = {
    ...first,
    liquidlink: { ...first.liquidlink, scoreboardObjectId: scoreboardId },
  };

  async function object(id: string) {
    const { object } = await client.getObject({
      objectId: id,
      include: { json: true, owner: true },
    });
    return object;
  }
  const registryIds = [...new Set(configs.map(c => c.marketRegistryObjectId).filter(Boolean).map(id => address(id)))];
  if (registryIds.length > 1) throw Error("Generated reward Registry mismatch.");
  let registryRead: ReturnType<typeof discoverJitterRegistry> | undefined;
  const registry = () => registryIds[0]
    ? registryRead ??= readRegistry(registryIds[0])
    : undefined;
  async function readPointMarket() {
    const snapshot = await registry();
    const links = snapshot?.extensions.filter(e => e.kind === "pointTrading" && address(e.scoreboardId) === scoreboardId) ?? [];
    if (links.length > 1) throw Error("Ambiguous generated reward point trading descriptor.");
    const link = links[0];
    const selected = link?.kind === "pointTrading" ? address(link.pointTokenMarketId) : undefined;
    const trusted = input.trustedPointMarket && address(input.trustedPointMarket.pointTokenMarketId);
    if (snapshot && trusted && trusted !== selected)
      throw Error("Trusted point market differs from Registry.");
    const marketId = selected ?? trusted;
    if (!marketId) return null;
    const [market, scoreboard, runtime] = await Promise.all([
      object(marketId), object(scoreboardId), client.movePackageService.getPackage({packageId: llPackage}),
    ]);
    const scoreType = parseStructTag(scoreboard.type);
    const marketType = parseStructTag(market.type);
    if (address(scoreType.address) !== address(runtime.response.package?.originalId)
      || address(scoreboard.objectId) !== scoreboardId || scoreType.module !== "scoreboard" || scoreType.name !== "Scoreboard" || scoreType.typeParams.length
      || address(market.objectId) !== marketId || address(marketType.address) !== address(scoreType.address)
      || marketType.module !== "token" || marketType.name !== "PointTokenMarket" || marketType.typeParams.length !== 1
      || market.owner.$kind !== "Shared")
      throw Error("Point market type or ownership mismatch.");
    const data = fields(market.json);
    if (address(data.scoreboard_id) !== scoreboardId || address(data.project_id) !== address(fields(scoreboard.json).project_id))
      throw Error("Point market Scoreboard/project binding mismatch.");
    const scale = amount(data.scale);
    const table = fields(data.holdings);
    const size = amount(table.size);
    if (scale === 0n || scale > (1n << 64n) - 1n || size > 1000n)
      throw Error("Invalid point market scale or holdings population.");
    return { marketId, scale, tableId: address(table.id), size, tokenType: normalizeStructTag(marketType.typeParams[0]!) };
  }
  let marketRead: ReturnType<typeof readPointMarket> | undefined;
  const pointMarket = () => marketRead ??= readPointMarket();
  async function scan(parentId: string, type: string) {
    const rows: Record<string, any>[] = [];
    let cursor: string | null | undefined;
    const cursors = new Set<string>(),
      ids = new Set<string>();
    do {
      const page = await client.listDynamicFields({
        parentId,
        cursor,
        limit: 50,
      });
      if (typeof page.hasNextPage !== "boolean")
        throw Error("Incomplete point owner pagination.");
      const selected = page.dynamicFields.filter(
        (f) => type === "address" ? f.name.type === "address" : normalizeStructTag(f.name.type) === normalizeStructTag(type),
      );
      for (const f of page.dynamicFields) {
        if (ids.has(f.fieldId)) throw Error("Duplicate point owner field.");
        ids.add(f.fieldId);
      }
      if (ids.size > 10000)
        throw Error("Point owner scan bound exceeded; refusing partial ranks.");
      const objects = selected.length
        ? (
            await client.getObjects({
              objectIds: selected.map((f) => f.fieldId),
              include: { json: true, owner: true },
            })
          ).objects
        : [];
      if (objects.length !== selected.length)
        throw Error("Incomplete point owner batch.");
      for (let i = 0; i < objects.length; i++) {
        const o = objects[i];
        if (
          !o ||
          o instanceof Error ||
          o.objectId !== selected[i]!.fieldId ||
          o.owner.$kind !== "ObjectOwner" ||
          address(o.owner.ObjectOwner) !== address(parentId)
        )
          throw Error("Point owner field identity mismatch.");
        rows.push(fields(o.json));
      }
      if (page.hasNextPage) {
        if (!page.cursor || cursors.has(page.cursor))
          throw Error("Stalled point owner pagination.");
        cursors.add(page.cursor);
      }
      cursor = page.hasNextPage ? page.cursor : null;
    } while (cursor);
    return rows;
  }
  return {
    async holders() {
      const market = await pointMarket();
      if (!market) return null;
      const rows = await scan(market.tableId, "address");
      if (BigInt(rows.length) !== market.size) throw Error("Incomplete point market holdings table.");
      const owners = new Set<string>();
      for (const row of rows) {
        const owner = address(row.name);
        if (owners.has(owner) || amount(row.value) > (1n << 64n) - 1n)
          throw Error("Invalid or duplicate point market holding.");
        owners.add(owner);
      }
      return [...owners];
    },
    async settled() {
      const clock = fields((await object("0x6")).json),
        now = amount(clock.timestamp_ms);
      const rows = await getLiquidlinkLeaderboard(
        input.network,
        scoreConfig,
        1000,
        now,
      );
      return rows.map((r) => ({
        owner: r.owner,
        settledPoints: r.unconvertedScore.toString(),
        pendingPoints: "0",
        updatedAtMs: now.toString(),
      }));
    },
    async registered() {
      const snapshot = await registry();
      if(snapshot){
        for(const link of snapshot.marketSources){
          const source=snapshot.sources.find(s=>s.sourceId===link.sourceId);
          if(source?.scoreboardId!==scoreboardId)continue;
          if(!configs.some(c=>address(c.marketObjectId)===address(link.marketId)&&c.liquidlink?.pointPrograms?.some(p=>address(p.pointConfigObjectId)===address(link.sourceId))))
            throw Error('Generated reward source population is incomplete; refusing partial ranks.');
        }
      }
      const result = new Map<string, RegisteredPointPosition[]>(),
        scans = new Map<string, Promise<Record<string, any>[]>>(),
        positions = new Map<string, ReturnType<typeof object>>();
      for (const config of configs) {
        const ext =
          config.liquidlink?.extensionsOriginalPackageId ??
          config.jitterExtensionsPackageId;
        if (!ext) throw Error("Missing point source defining package.");
        for (const program of config.liquidlink!.pointPrograms!) {
          if (address(program.scoreboardObjectId) !== scoreboardId) continue;
          if (program.referral)
            throw Error(
              "Referral-aware pending leaderboard requires its policy reader.",
            );
          const point = fields(
            (await object(program.pointConfigObjectId)).json,
          );
          if (
            address(point.scoreboard_id) !== scoreboardId ||
            address(point.project_object_id) !==
              address(program.projectObjectId!)
          )
            throw Error("Point source Scoreboard binding mismatch.");
          if (point.closed === true)
            throw Error(
              "Closed point receipts require a historical pending reader.",
            );
          if (typeof point.closed !== "boolean")
            throw Error("Unreadable point source state.");
          const byPosition = new Map<
            string,
            { yt: boolean; lp: boolean; owner: string }
          >();
          for (const [scope, parent] of [
            ["yt", program.pointConfigObjectId],
            ["lp", program.lpPointStateObjectId],
          ] as const) {
            if (
              !parent ||
              !(program.scopes ?? ["yt", "lp", "pool"]).includes(scope)
            )
              continue;
            const key = `${parent}:${ext}`;
            if (!scans.has(key))
              scans.set(
                key,
                scan(parent, `${ext}::liquidlink_points::PositionKey`),
              );
            for (const row of await scans.get(key)!) {
              const value = fields(row.value),
                positionId = address(fields(row.name).pos0);
              const exposure = amount(
                scope === "yt" ? value.raw_amount : value.lp_amount,
              );
              if (
                exposure === 0n &&
                (scope === "yt" || amount(value.pending_points) === 0n)
              )
                continue;
              const owner = address(value.owner);
              const existing = byPosition.get(positionId) ?? {
                yt: false,
                lp: false,
                owner,
              };
              if (existing.owner !== owner)
                throw Error("YT and LP ledger ownership differs.");
              existing[scope] = true;
              byPosition.set(positionId, existing);
            }
          }
          for (const [positionId, scopes] of byPosition) {
            if (input.owner && address(input.owner) !== scopes.owner) continue;
            if (!positions.has(positionId))
              positions.set(positionId, object(positionId));
            const p = await positions.get(positionId)!,
              data = fields(p.json);
            if (
              address(data.market_state_id) !== address(config.marketObjectId)
            )
              continue;
            if (
              p.owner.$kind !== "AddressOwner" ||
              address(p.owner.AddressOwner) !== scopes.owner
            )
              throw Error("Position owner changed during point read.");
            const list = result.get(scopes.owner) ?? [];
            if (
              list.some(
                (p) =>
                  p.positionId === positionId &&
                  p.pointConfigId === program.pointConfigObjectId,
              )
            )
              throw Error("Duplicate point program exposure.");
            list.push({
              config: {
                ...config,
                liquidlink: { ...config.liquidlink, pointPrograms: [program] },
              },
              positionId,
              pointConfigId: program.pointConfigObjectId,
              yt: scopes.yt,
              lp: scopes.lp,
            });
            result.set(scopes.owner, list);
          }
        }
      }
      return result;
    },
    async simulate(owner, positions) {
      const market = await pointMarket();
      const tx = new Transaction();
      tx.setSender(owner);
      tx.setGasBudget(200000000);
      const scoreView = () =>
        tx.moveCall({
          target: `${llPackage}::scoreboard::get_unconverted_score_by_address`,
          arguments: [
            tx.object(scoreboardId),
            tx.object.clock(),
            tx.pure.address(owner),
          ],
        });
      const beforeIndex = tx.getData().commands.length;
      scoreView();
      for (const p of positions) {
        if (p.yt)
          addSyncPyPositionWithLiquidlinkPoints(
            tx,
            p.config,
            p.positionId,
            {},
            [p.pointConfigId],
          );
        if (p.lp)
          addClaimLpPointsWithLiquidlinkPoints(tx, p.config, p.positionId, {}, [
            p.pointConfigId,
          ]);
      }
      const afterIndex = tx.getData().commands.length;
      scoreView();
      const holdingIndex = market ? tx.getData().commands.length : null;
      if (market) tx.moveCall({
        target: `${llPackage}::token::holding_token_amount_by_address`,
        typeArguments: [market.tokenType],
        arguments: [tx.object(market.marketId), tx.pure.address(owner)],
      });
      const clockIndex = tx.getData().commands.length;
      tx.moveCall({
        target: "0x2::clock::timestamp_ms",
        arguments: [tx.object.clock()],
      });
      // No signature, execution, or gas funding. This only evaluates the actual contract's checkpoint arithmetic.
      const simulated = await client.simulateTransaction({
        transaction: tx,
        checksEnabled: false,
        include: { commandResults: true, effects: true },
      });
      if (
        simulated.$kind !== "Transaction" ||
        !simulated.Transaction.status.success
      )
        throw Error(
          "Pending reward simulation failed; refusing settled-only ranking.",
        );
      const value = (index: number) => {
        const data = simulated.commandResults?.[index]?.returnValues?.[0]?.bcs;
        if (!data || data.length !== 8)
          throw Error("Unreadable reward simulation return.");
        return BigInt(bcs.u64().parse(data));
      };
      const before = value(beforeIndex),
        after = value(afterIndex);
      if (after < before)
        throw Error("Reward checkpoint decreased available score.");
      return {
        owner,
        settledPoints: before.toString(),
        pendingPoints: (after - before).toString(),
        updatedAtMs: value(clockIndex).toString(),
        ...(market && holdingIndex !== null ? { tokenizedPoints: (value(holdingIndex) / market.scale).toString() } : {}),
      };
    },
  };
}
