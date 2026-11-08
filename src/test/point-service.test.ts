import { expect, test } from "bun:test";
import { createJitterPointService } from "../services/point-service.js";
import { getDefaultJitterMarketConfig } from "../config.js";
import type { ClosedPointClaim } from "../point-claims.js";
const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;

test("normal preparation archives then re-reads receipts without a second manual action", async () => {
  const config = { ...getDefaultJitterMarketConfig("testnet")!, globalConfigObjectId: id(1), jitterExtensionsPackageId: id(2), marketStateObjectId: id(3), liquidlink: {
    enabled: true, liquidlinkPackageId: id(4), liquidlinkGlobalConfigObjectId: id(5), pointPrograms: [{ label: "A", protocol: "Jitter", pointConfigObjectId: id(6), projectObjectId: id(7), scoreboardObjectId: id(8), scopes: ["yt"] as Array<"yt"> }],
  } };
  let stage = 0;
  const reads: number[] = [];
  const claim: ClosedPointClaim = { objectId: id(9), pointConfigObjectId: id(6), projectObjectId: id(7), scoreboardObjectId: id(8), marketObjectId: id(3), sourceObjectId: id(6), positionObjectId: id(10), owner: id(11), scope: "yt", points: "42", remainder: "0", precision: "100", closedAtMs: "12", referralStateObjectId: null, referralRecordObjectId: null };
  const service = createJitterPointService({ network: "testnet", config, delegates: {
    pointConfigReader: { getPointConfig: async () => ({ closed: true, projectObjectId: id(7), scoreboardObjectId: id(8) }) },
    getPositionIds: async () => stage === 0 ? [id(10)] : [],
    isArchived: async () => stage > 0,
    getClosedClaims: async () => { reads.push(stage); return stage === 0 ? [] : [{ ...claim, points: stage === 1 ? "42" : "0" }]; },
    getReferralClaims: async () => [],
  } });
  const functions: string[][] = [];
  const result = await service.prepare({ owner: id(11), liquidlinkAvailable: true, applyPolicies: () => {}, submitAndWait: async tx => {
    functions.push(tx.getData().commands.flatMap(c => c.$kind === "MoveCall" ? [c.MoveCall.function] : []));
    stage++;
  } });
  expect(functions).toEqual([["checkpoint_closed_yt"], ["claim_closed_points", "settle_stamp"]]);
  expect(reads).toEqual([0, 1, 2]);
  expect(result.closedClaims[0]!.points).toBe("0");
});

test("unavailable LiquidLink leaves independent owned receipts pending", async () => {
  let submissions = 0;
  const config = { ...getDefaultJitterMarketConfig("testnet")!, liquidlink: {
    enabled: true, pointPrograms: [{ label: "A", protocol: "Jitter", pointConfigObjectId: id(6), projectObjectId: id(7), scoreboardObjectId: id(8) }],
  } };
  const claim: ClosedPointClaim = { objectId: id(9), pointConfigObjectId: id(6), projectObjectId: id(7), scoreboardObjectId: id(8), marketObjectId: id(3), sourceObjectId: id(6), positionObjectId: id(10), owner: id(11), scope: "yt", points: "42", remainder: "1", precision: "100", closedAtMs: "12", referralStateObjectId: null, referralRecordObjectId: null };
  const service = createJitterPointService({ network: "testnet", config, delegates: {
    pointConfigReader: { getPointConfig: async () => ({ closed: true, projectObjectId: id(7), scoreboardObjectId: id(8) }) },
    getPositionIds: async () => [], getClosedClaims: async () => [claim], getReferralClaims: async () => [],
  } });
  const snapshot = await service.prepare({ owner: id(11), liquidlinkAvailable: false, submitAndWait: async () => { submissions++; } });
  expect(submissions).toBe(0);
  expect(snapshot.closedClaims[0]!.points).toBe("42");
  expect(snapshot).not.toHaveProperty("availablePoints");
  expect(snapshot).not.toHaveProperty("tokenizedPoints");
});

test("retained positions with permanent archive markers do not cause another prepare transaction", async () => {
  const config = { ...getDefaultJitterMarketConfig("testnet")!, liquidlink: {
    enabled: true, pointPrograms: [{ label: "A", protocol: "Jitter", pointConfigObjectId: id(6), projectObjectId: id(7), scoreboardObjectId: id(8) }],
  } };
  const service = createJitterPointService({ network: "testnet", config, delegates: {
    pointConfigReader: { getPointConfig: async () => ({ closed: true, projectObjectId: id(7), scoreboardObjectId: id(8) }) },
    getPositionIds: async () => [id(10)], isArchived: async () => true,
    getClosedClaims: async () => [], getReferralClaims: async () => [],
  } });
  const snapshot = await service.getSnapshot(id(11));
  expect(snapshot.archiveTargets).toEqual([]);
  expect(service.buildArchiveTx(id(11), snapshot)).toBeNull();
});
