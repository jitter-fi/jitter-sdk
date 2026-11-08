import { expect, test } from "bun:test";
import { PointClaim } from "../generated/jitter_extensions/point_claim.js";
import { PointConfig, ClosedPositionKey } from "../generated/jitter_extensions/liquidlink_points.js";
import { DeferredReferralClaim } from "../generated/jitter_referral/referral_policy.js";
import { getOwnedClosedPointClaims, getOwnedDeferredReferralClaims, isClosedPointPositionArchived, resolveLiquidlinkPointConfig } from "../infrastructure/point-claims-reader.js";
import { getDefaultJitterMarketConfig } from "../config.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const config = () => ({ ...getDefaultJitterMarketConfig("testnet")!, jitterExtensionsPackageId: id(1), marketStateObjectId: id(2), liquidlink: {
  enabled: true, pointPrograms: [{ label: "A", protocol: "Jitter", pointConfigObjectId: id(3), projectObjectId: id(4), scoreboardObjectId: id(5) }],
} });

test("chain-discovered closed state overrides local program routing", async () => {
  const c = config();
  const resolved = await resolveLiquidlinkPointConfig(c, { getPointConfig: async () => ({ closed: true, projectObjectId: id(4), scoreboardObjectId: id(5) }) });
  expect(resolved.liquidlink!.pointPrograms![0]!.closed).toBe(true);
  expect(c.liquidlink.pointPrograms[0]).not.toHaveProperty("closed");
});

test("disabled local display flags do not skip terminal PointConfig discovery", async () => {
  const c = config();
  c.liquidlink.enabled = false;
  Object.assign(c.liquidlink.pointPrograms[0]!, { enabled: false });
  let reads = 0;
  const resolved = await resolveLiquidlinkPointConfig(c, { getPointConfig: async () => {
    reads++;
    return { closed: true, projectObjectId: id(4), scoreboardObjectId: id(5) };
  } });
  expect(reads).toBe(1);
  expect(resolved.liquidlink!.pointPrograms![0]).toMatchObject({ enabled: false, closed: true });
});

test("gRPC discovers owned receipts with 50 pagination, dedupe and original owner without Position reads", async () => {
  const data = { id: id(6), config_id: id(3), market_id: id(2), source_id: id(3), position_id: id(7), owner: id(8), scope: 1, points: "42", remainder: "1", precision: "100", closed_at_ms: "123", referral_state_id: null, referral_record_id: null };
  const requests: unknown[] = [];
  const client = { listOwnedObjects: async (request: { cursor?: string | null }) => {
    requests.push(request);
    return { objects: [{ objectId: data.id, content: PointClaim.serialize(data).toBytes() }], hasNextPage: !request.cursor, cursor: request.cursor ? null : "page2" };
  }, getObject: async () => { throw new Error("Position must not be fetched"); } };
  const claims = await getOwnedClosedPointClaims("testnet", config(), id(8), client);
  expect(claims).toHaveLength(1);
  expect(claims[0]).toMatchObject({ owner: id(8), scoreboardObjectId: id(5), projectObjectId: id(4), scope: "yt", points: "42", positionObjectId: id(7) });
  expect(requests).toEqual([
    { owner: id(8), type: `${id(1)}::point_claim::PointClaim`, include: { content: true }, limit: 50, cursor: null },
    { owner: id(8), type: `${id(1)}::point_claim::PointClaim`, include: { content: true }, limit: 50, cursor: "page2" },
  ]);
  expect(await getOwnedClosedPointClaims("testnet", config(), id(9), client)).toEqual([]);
});

test("generated PointConfig BCS exposes terminal state", () => {
  const state = PointConfig.parse(PointConfig.serialize({ id: id(3), project_object_id: id(4), scoreboard_id: id(5),
    yt_multiplier_bps: "10000", lp_multiplier_bps: "10000", duration: "1000", enabled: false, closed: true,
    closed_at_ms: "123", total_yt_amount: "0", total_yt_base: "0", uncheckpointed_yt: "0", config_version: "1",
    yt_config_version: "1", lp_config_version: "1", yt_referral_source_cap: null }).toBytes());
  expect(state.closed).toBe(true);
  expect(state.project_object_id).toBe(id(4));
});

test("referral receipt BCS keeps immutable beneficiary and original Scoreboard after Position deletion", async () => {
  const c = { ...config(), liquidlink: { ...config().liquidlink, referralPackageId: id(20) } };
  const content = DeferredReferralClaim.serialize({ id: id(21), owner: id(8), referee: id(22), project_object_id: id(4),
    project_id: id(23), state_id: id(24), source_id: id(3), source_witness: { name: "original::points::YT" },
    market_id: id(2), position_id: id(7), record_id: id(25), is_lp: false, pending_points: "42",
    pending_bonus_numerator_remainder: "1", precision: "100" }).toBytes();
  const requests: unknown[] = [];
  const client = { listOwnedObjects: async (request: unknown) => {
    requests.push(request);
    return { objects: [{ objectId: id(21), content }], hasNextPage: false, cursor: null };
  } };
  const [claim] = await getOwnedDeferredReferralClaims("testnet", c, id(8), client);
  expect(claim).toMatchObject({ owner: id(8), referee: id(22), scoreboardObjectId: id(5), projectObjectId: id(4),
    stateObjectId: id(24), recordObjectId: id(25), scope: "yt", points: "42", sourceWitness: "original::points::YT" });
  expect(requests[0]).toMatchObject({ limit: 50, type: `${id(20)}::referral_policy::DeferredReferralClaim` });
  expect(await getOwnedDeferredReferralClaims("testnet", c, id(22), client)).toEqual([]);
});

test("refuses to route a PointConfig through a substituted Project mapping", async () => {
  await expect(resolveLiquidlinkPointConfig(config(), { getPointConfig: async () => ({ closed: true, projectObjectId: id(99), scoreboardObjectId: id(5) }) })).rejects.toThrow("original Project/Scoreboard");
});

test("archive marker lookup uses generated ClosedPositionKey BCS directly over gRPC", async () => {
  const requests: unknown[] = [];
  const client = {
    getDynamicField: async (input: unknown) => { requests.push(input); return { dynamicField: { fieldId: id(30) } }; },
    getObject: async () => ({ object: { json: { value: true } } }),
  };
  expect(await isClosedPointPositionArchived("testnet", config(), id(3), id(7), client)).toBe(true);
  expect(requests).toEqual([{ parentId: id(3), name: { type: `${id(1)}::liquidlink_points::ClosedPositionKey`, bcs: ClosedPositionKey.serialize([id(7)]).toBytes() } }]);
});
