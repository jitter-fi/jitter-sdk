import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { addClaimClosedPoints, addClaimArchivedReferral } from "../liquidlink-points.js";
import type { ClosedPointClaim, DeferredReferralClaim } from "../point-claims.js";
import { getDefaultJitterMarketConfig } from "../config.js";
import { createJitterTransactionService } from "../services/transaction-service.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
function config() {
  return { ...getDefaultJitterMarketConfig("testnet")!,
    globalConfigObjectId: id(1), jitterExtensionsPackageId: id(2), marketStateObjectId: id(3),
    liquidlink: { enabled: true, liquidlinkPackageId: id(4), liquidlinkGlobalConfigObjectId: id(5), referralPackageId: id(6),
      pointPrograms: [{ label: "Closed", protocol: "Jitter", closed: true, projectObjectId: id(7), scoreboardObjectId: id(8), pointConfigObjectId: id(9), lpPointStateObjectId: id(10), scopes: ["yt", "lp", "pool"] as Array<"yt" | "lp" | "pool">,
        referral: { policyStateObjectId: id(11), referralTableObjectId: id(12) } }] } };
}
function receipt(): ClosedPointClaim {
  return { objectId: id(13), pointConfigObjectId: id(9), marketObjectId: id(3), sourceObjectId: id(10), positionObjectId: id(14), owner: id(15), scope: "lp", points: "42", remainder: "1", precision: "100", closedAtMs: "123", referralStateObjectId: id(11), referralRecordObjectId: id(16), projectObjectId: id(7), scoreboardObjectId: id(8) };
}
const calls = (tx: Transaction) => tx.getData().commands.flatMap(c => c.$kind === "MoveCall" ? [c.MoveCall] : []);

describe("closed point receipts", () => {
  test("transaction service discovers terminal state before building an exit", async () => {
    const c = config();
    c.liquidlink.pointPrograms[0]!.closed = false;
    const service = createJitterTransactionService({ config: c, pointConfigReader: {
      getPointConfig: async () => ({ closed: true, projectObjectId: id(7), scoreboardObjectId: id(8) }),
    } });
    const tx = await service.buildSellYtTx({ senderAddress: id(15), positionId: id(14), ytAmount: 1n, minSyOut: 0n, syIndex: 1n << 64n, rewardSettlement: { strategy: "empty-vector" } });
    expect(calls(tx).some(c => c.function === "settle_closed_yt")).toBe(true);
    expect(calls(tx).some(c => c.function === "settle_yt_reward_operation")).toBe(false);
    expect(c.liquidlink.pointPrograms[0]!.closed).toBe(false);
  });

  test("disabled UI flags cannot bypass a discovered closed reward obligation", async () => {
    const c = config();
    c.liquidlink.enabled = false;
    Object.assign(c.liquidlink.pointPrograms[0]!, { enabled: false, closed: false });
    const service = createJitterTransactionService({ config: c, pointConfigReader: {
      getPointConfig: async () => ({ closed: true, projectObjectId: id(7), scoreboardObjectId: id(8) }),
    } });
    const tx = await service.buildSellYtTx({ senderAddress: id(15), positionId: id(14), ytAmount: 1n, minSyOut: 0n, syIndex: 1n << 64n, rewardSettlement: { strategy: "empty-vector" } });
    expect(calls(tx).some(c => c.function === "settle_closed_yt")).toBe(true);
  });
  test("claims without Position and runs original policies in caller order", () => {
    const tx = new Transaction();
    tx.setSender(id(15));
    addClaimClosedPoints(tx, config(), receipt(), (stamp, confirm) => {
      tx.moveCall({ target: `${id(17)}::first::apply`, arguments: [stamp] });
      confirm();
      tx.moveCall({ target: `${id(18)}::last::apply`, arguments: [stamp] });
    });
    expect(calls(tx).map(c => c.function)).toEqual(["claim_closed_points", "apply", "apply_lp_bonus_policy", "apply", "settle_stamp"]);
    expect(calls(tx)[0]!.typeArguments).toEqual([]);
    expect(calls(tx)[0]!.arguments).toHaveLength(5);
    expect(JSON.stringify(tx.getData().inputs)).not.toContain(id(14));
  });

  test("does not claim a duplicate or re-read empty receipt", () => {
    const tx = new Transaction();
    const claim = receipt();
    const policies = (_: unknown, confirm: () => void) => confirm();
    expect(addClaimClosedPoints(tx, config(), claim, policies)).toBe(true);
    expect(addClaimClosedPoints(tx, config(), claim, policies)).toBe(false);
    const cleanup = new Transaction();
    expect(addClaimClosedPoints(cleanup, config(), { ...claim, points: "0" }, () => { throw new Error("no policies for empty cleanup"); })).toBe(true);
    expect(calls(cleanup).map(c => c.function)).toEqual(["destroy_empty_claim"]);
    expect(addClaimClosedPoints(cleanup, config(), { ...claim, points: "0" }, policies)).toBe(false);
    expect(calls(tx).filter(c => c.function === "claim_closed_points")).toHaveLength(1);
  });

  test("rejects substituting a different referral policy generation", () => {
    const tx = new Transaction();
    expect(() => addClaimClosedPoints(tx, config(), { ...receipt(), referralStateObjectId: id(99) }, (_, confirm) => confirm())).toThrow("original referral");
    expect(calls(tx)).toHaveLength(0);
  });

  test("rejects an owner or Scoreboard substitution before adding commands", () => {
    const tx = new Transaction();
    tx.setSender(id(99));
    expect(() => addClaimClosedPoints(tx, config(), receipt(), () => {})).toThrow("original owner");
    expect(() => addClaimClosedPoints(new Transaction(), config(), { ...receipt(), scoreboardObjectId: id(99) }, () => {})).toThrow("original Project and Scoreboard");
    expect(calls(tx)).toHaveLength(0);
  });

  test("missing LiquidLink config leaves a nonzero receipt unclaimed", () => {
    const c = config();
    Object.assign(c.liquidlink, { liquidlinkGlobalConfigObjectId: undefined });
    const tx = new Transaction();
    expect(() => addClaimClosedPoints(tx, c, receipt(), () => {})).toThrow("remain pending");
    expect(calls(tx)).toHaveLength(0);
  });

  test("disabling display/accrual configuration does not hide an original receipt claim", () => {
    const c = config();
    c.liquidlink.enabled = false;
    Object.assign(c.liquidlink.pointPrograms[0]!, { enabled: false });
    const tx = new Transaction();
    expect(addClaimClosedPoints(tx, c, receipt(), (_, confirm) => confirm())).toBe(true);
    expect(calls(tx)[0]!.function).toBe("claim_closed_points");
  });

  test("archived referral claim is non-generic, unit and independent of Position", () => {
    const claim: DeferredReferralClaim = { objectId: id(20), owner: id(15), referee: id(21), projectObjectId: id(7), projectId: id(22), stateObjectId: id(11), sourceObjectId: id(10), sourceWitness: "test", marketObjectId: id(3), positionObjectId: id(14), recordObjectId: id(16), scope: "lp", points: "12", remainder: "1", precision: "100", scoreboardObjectId: id(8), pointConfigObjectId: id(9) };
    const tx = new Transaction();
    addClaimArchivedReferral(tx, config(), claim);
    addClaimArchivedReferral(tx, config(), claim);
    expect(calls(tx).map(c => c.function)).toEqual(["claim_archived_referral"]);
    expect(calls(tx)[0]!.arguments).toHaveLength(6);
    expect(calls(tx)[0]!.typeArguments).toEqual([]);
    expect(JSON.stringify(tx.getData().inputs)).not.toContain(id(14));
  });
});
