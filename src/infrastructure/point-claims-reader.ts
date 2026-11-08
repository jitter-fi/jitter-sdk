import { normalizeSuiAddress } from "@mysten/sui/utils";
import { PointClaim } from "../generated/jitter_extensions/point_claim.js";
import { JitterPosition } from "../generated/jitter/jitter_position.js";
import { PointConfig, ClosedPositionKey } from "../generated/jitter_extensions/liquidlink_points.js";
import { DeferredReferralClaim as ReferralClaimBcs } from "../generated/jitter_referral/referral_policy.js";
import { getSuiGrpcClient, type GrpcNetworkKind } from "../rpc.js";
import type { ClosedPointClaim, DeferredReferralClaim } from "../point-claims.js";
import type { JitterLiquidlinkPointProgramConfig, JitterMarketConfig } from "../types.js";

export type PointConfigSnapshot = { closed: boolean; projectObjectId: string; scoreboardObjectId: string };
export type PointConfigReader = { getPointConfig(objectId: string): Promise<PointConfigSnapshot> };
export type PointClaimsGrpcReader = {
  listOwnedObjects(input: { owner: string; type: string; cursor: string | null; limit: number; include: { content: true } }): Promise<{
    objects: Array<{ objectId: string; content: Uint8Array }>;
    hasNextPage: boolean;
    cursor: string | null;
  }>;
};
export type ClosedPointMarkerGrpcReader = {
  getDynamicField(input: { parentId: string; name: { type: string; bcs: Uint8Array } }): Promise<{ dynamicField: { fieldId: string } }>;
  getObject(input: { objectId: string; include: { json: true } }): Promise<{ object: { json: Record<string, unknown> | null } }>;
};

const sameId = (a: string, b: string) => normalizeSuiAddress(a) === normalizeSuiAddress(b);

export function liquidlinkPointPrograms(config: JitterMarketConfig): JitterLiquidlinkPointProgramConfig[] {
  const ll = config.liquidlink;
  if (!ll) return [];
  if (ll.pointPrograms?.length) return ll.pointPrograms;
  const pointConfigObjectId = ll.pointConfigObjectId ?? config.liquidlinkPointConfigObjectId;
  const scoreboardObjectId = ll.scoreboardObjectId ?? config.liquidlinkScoreboardObjectId;
  if (!pointConfigObjectId || !scoreboardObjectId || !ll.projectObjectId) return [];
  return [{ label: "Default", protocol: "Jitter", pointConfigObjectId, scoreboardObjectId,
    projectObjectId: ll.projectObjectId, lpPointStateObjectId: ll.lpPointStateObjectId, closed: ll.closed }];
}

export function createPointConfigReader(network: GrpcNetworkKind): PointConfigReader {
  return { async getPointConfig(objectId) {
    const { object } = await getSuiGrpcClient(network).getObject({ objectId, include: { content: true } });
    const fields = PointConfig.parse(object.content);
    return { closed: fields.closed, projectObjectId: fields.project_object_id, scoreboardObjectId: fields.scoreboard_id };
  } };
}

/** Fresh state at the transaction boundary, not a manual close flag or a cached UI hint. */
export async function resolveLiquidlinkPointConfig(config: JitterMarketConfig, reader: PointConfigReader): Promise<JitterMarketConfig> {
  if (!config.liquidlink) return config;
  const programs = liquidlinkPointPrograms(config);
  const pointPrograms = await Promise.all(programs.map(async program => {
    const state = await reader.getPointConfig(program.pointConfigObjectId);
    if (typeof state.closed !== "boolean") throw new Error(`Missing PointConfig.closed for ${program.pointConfigObjectId}.`);
    if (!sameId(program.projectObjectId, state.projectObjectId) || !sameId(program.scoreboardObjectId, state.scoreboardObjectId)) {
      throw new Error(`PointConfig ${program.pointConfigObjectId} does not match its original Project/Scoreboard mapping.`);
    }
    return { ...program, closed: state.closed };
  }));
  return { ...config, liquidlink: { ...config.liquidlink, pointPrograms,
    ...(!config.liquidlink.pointPrograms?.length && pointPrograms[0] ? { closed: pointPrograms[0].closed } : {}) } };
}

async function ownedReceipts<T>(client: PointClaimsGrpcReader, owner: string, type: string, parse: (bytes: Uint8Array) => T): Promise<T[]> {
  const rows = new Map<string, T>();
  const cursors = new Set<string>();
  let cursor: string | null = null;
  do {
    const page = await client.listOwnedObjects({ owner, type, cursor, limit: 50, include: { content: true } });
    for (const object of page.objects) rows.set(normalizeSuiAddress(object.objectId), parse(object.content));
    if (!page.hasNextPage) break;
    if (!page.cursor || cursors.has(page.cursor)) throw new Error("Receipt pagination did not advance.");
    cursor = page.cursor;
    cursors.add(cursor);
  } while (cursor);
  return [...rows.values()];
}

/** Owned receipts survive Position deletion. Call again after each confirmed preparation/claim transaction. */
export async function getOwnedClosedPointClaims(network: GrpcNetworkKind, config: JitterMarketConfig, owner: string, client: PointClaimsGrpcReader = getSuiGrpcClient(network)): Promise<ClosedPointClaim[]> {
  const packageId = config.liquidlink?.extensionsOriginalPackageId ?? config.jitterExtensionsPackageId;
  if (!packageId) return [];
  const programs = liquidlinkPointPrograms(config);
  const receipts = await ownedReceipts(client, owner, `${packageId}::point_claim::PointClaim`, bytes => PointClaim.parse(bytes));
  return receipts.flatMap(claim => {
    const program = programs.find(p => sameId(p.pointConfigObjectId, claim.config_id));
    if (!program || !sameId(owner, claim.owner) || !sameId(config.marketStateObjectId ?? config.marketObjectId, claim.market_id)) return [];
    if (claim.scope !== 1 && claim.scope !== 2) throw new Error(`Unknown closed point scope ${claim.scope}.`);
    return [{ objectId: claim.id, pointConfigObjectId: claim.config_id, projectObjectId: program.projectObjectId,
      scoreboardObjectId: program.scoreboardObjectId, marketObjectId: claim.market_id, sourceObjectId: claim.source_id,
      positionObjectId: claim.position_id, owner: claim.owner, scope: claim.scope === 1 ? "yt" as const : "lp" as const,
      points: claim.points, remainder: claim.remainder, precision: claim.precision, closedAtMs: claim.closed_at_ms,
      referralStateObjectId: claim.referral_state_id, referralRecordObjectId: claim.referral_record_id }];
  });
}

export async function getOwnedDeferredReferralClaims(network: GrpcNetworkKind, config: JitterMarketConfig, owner: string, client: PointClaimsGrpcReader = getSuiGrpcClient(network)): Promise<DeferredReferralClaim[]> {
  const packageId = config.liquidlink?.referralOriginalPackageId ?? config.liquidlink?.referralPackageId;
  if (!packageId) return [];
  const programs = liquidlinkPointPrograms(config);
  const receipts = await ownedReceipts(client, owner, `${packageId}::referral_policy::DeferredReferralClaim`, bytes => ReferralClaimBcs.parse(bytes));
  return receipts.flatMap(claim => {
    const program = programs.find(p => sameId(p.projectObjectId, claim.project_object_id)
      && sameId(claim.source_id, claim.is_lp ? p.lpPointStateObjectId ?? "0x0" : p.pointConfigObjectId));
    const marketId = claim.is_lp ? config.poolObjectId : config.marketStateObjectId ?? config.marketObjectId;
    if (!program || !sameId(owner, claim.owner) || !sameId(marketId, claim.market_id)) return [];
    return [{ objectId: claim.id, owner: claim.owner, referee: claim.referee, projectObjectId: claim.project_object_id,
      projectId: claim.project_id, stateObjectId: claim.state_id, sourceObjectId: claim.source_id,
      sourceWitness: claim.source_witness.name, marketObjectId: claim.market_id, positionObjectId: claim.position_id,
      recordObjectId: claim.record_id, scope: claim.is_lp ? "lp" as const : "yt" as const, points: claim.pending_points,
      remainder: claim.pending_bonus_numerator_remainder, precision: claim.precision,
      pointConfigObjectId: program.pointConfigObjectId, scoreboardObjectId: program.scoreboardObjectId }];
  });
}

export async function getPointPositionIds(network: GrpcNetworkKind, config: JitterMarketConfig, owner: string): Promise<string[]> {
  const packageId = config.jitterOriginalPackageId ?? config.jitterPackageId;
  const positions = await ownedReceipts(getSuiGrpcClient(network), owner, `${packageId}::jitter_position::JitterPosition`, bytes => JitterPosition.parse(bytes));
  return positions.filter(p => sameId(p.market_state_id, config.marketStateObjectId ?? config.marketObjectId)).map(p => p.id);
}

export async function isClosedPointPositionArchived(network: GrpcNetworkKind, config: JitterMarketConfig, parentId: string, positionId: string, client: ClosedPointMarkerGrpcReader = getSuiGrpcClient(network)): Promise<boolean> {
  const packageId = config.liquidlink?.extensionsOriginalPackageId ?? config.jitterExtensionsPackageId;
  if (!packageId) throw new Error("Closed point marker requires jitterExtensionsPackageId.");
  try {
    const { dynamicField } = await client.getDynamicField({ parentId,
      name: { type: `${packageId}::liquidlink_points::ClosedPositionKey`, bcs: ClosedPositionKey.serialize([positionId]).toBytes() } });
    const { object } = await client.getObject({ objectId: dynamicField.fieldId, include: { json: true } });
    if (typeof object.json?.value !== "boolean") throw new Error("Invalid closed point archive marker.");
    return object.json.value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not.?found|does not exist|dynamic field.*missing|code\s*[:=]\s*5/i.test(message)) return false;
    throw error;
  }
}
