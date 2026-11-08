import { describe, expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";

import {
  addSetJitterReferralCode,
  addUseJitterReferralCode,
  isValidJitterReferralCode,
  resolveLpReferralRecordObjectIds,
  resolveYtReferralRecordObjectIds,
  type JitterReferralObjects,
} from "../referral.js";
import { InMemoryJitterEventReader } from "./fakes.js";
import type { EventReaderQuery, JitterEventReader } from "../ports/event-reader.js";

function objectId(byte: string): string {
  return `0x${byte.repeat(64)}`;
}

const OBJECTS: JitterReferralObjects = {
  packageId: objectId("1"),
  globalConfigObjectId: objectId("2"),
  referralTableObjectId: objectId("3"),
};

describe("referral builder", () => {
  test("matches the on-chain referral code character and length rules", () => {
    expect(isValidJitterReferralCode("abc")).toBe(true);
    expect(isValidJitterReferralCode("jitter2026")).toBe(true);
    expect(isValidJitterReferralCode("ab")).toBe(false);
    expect(isValidJitterReferralCode("ABC")).toBe(false);
    expect(isValidJitterReferralCode("abc def")).toBe(false);
    expect(isValidJitterReferralCode("a".repeat(33))).toBe(false);
  });

  test("builds set-code and use-code Move calls", () => {
    const setTx = new Transaction();
    addSetJitterReferralCode(setTx, OBJECTS, "alice2026");
    expect(JSON.stringify(setTx.getData().commands[0])).toContain("set_referral_code_");
    expect(setTx.getData().inputs).toHaveLength(3);

    const useTx = new Transaction();
    addUseJitterReferralCode(useTx, OBJECTS, "alice2026");
    expect(JSON.stringify(useTx.getData().commands[0])).toContain("use_referral_code_");
    expect(useTx.getData().inputs).toHaveLength(3);
  });

  test("rejects invalid code before constructing a transaction", () => {
    const tx = new Transaction();
    expect(() => addUseJitterReferralCode(tx, OBJECTS, "BAD CODE")).toThrow(
      "3-32 lowercase letters or digits",
    );
    expect(tx.getData().commands).toHaveLength(0);
  });

  test("resolves active LP referral records by owner, position, and source", async () => {
    const packageId = objectId("4");
    const createdType = `${packageId}::referral_policy::LpReferralRecordCreated`;
    const closedType = `${packageId}::referral_policy::LpReferralRecordClosed`;
    const sourceId = objectId("5");
    const positionId = objectId("6");
    const owner = objectId("7");
    const activeRecordId = objectId("8");
    const closedRecordId = objectId("9");
    const reader = new InMemoryJitterEventReader(new Map([
      [createdType, [
        { record_id: closedRecordId, source_id: sourceId, position_id: positionId, referee: owner },
        { record_id: activeRecordId, source_id: sourceId, position_id: positionId, referee: owner },
        { record_id: objectId("a"), source_id: sourceId, position_id: positionId, referee: objectId("b") },
      ]],
      [closedType, [
        { record_id: closedRecordId, source_id: sourceId, position_id: positionId, referee: owner },
      ]],
    ]));

    const records = await resolveLpReferralRecordObjectIds({
      eventReader: reader,
      network: "testnet",
      referralPackageId: packageId,
      owner,
      positionId,
      pointPrograms: [{
        label: "Jitter Points",
        protocol: "jitter",
        projectId: "jitter",
        projectObjectId: objectId("c"),
        scoreboardObjectId: objectId("d"),
        pointConfigObjectId: objectId("e"),
        lpPointStateObjectId: sourceId,
        enabled: true,
        scopes: ["lp"],
        referral: {
          policyStateObjectId: objectId("f"),
          referralTableObjectId: OBJECTS.referralTableObjectId,
        },
      }],
    });

    expect(records).toEqual({ [objectId("e")]: activeRecordId });
  });

  test("keeps referral event queries within the Sui page-size limit", async () => {
    const queries: EventReaderQuery[] = [];
    const reader: JitterEventReader = {
      async queryEvents<TEvent>(query: EventReaderQuery): Promise<TEvent[]> {
        queries.push(query);
        return [];
      },
    };

    await resolveYtReferralRecordObjectIds({
      eventReader: reader,
      network: "testnet",
      referralPackageId: objectId("4"),
      owner: objectId("5"),
      positionId: objectId("6"),
      pointPrograms: [],
    });

    expect(queries).toHaveLength(2);
    expect(queries.every((query) => query.limit === 50)).toBe(true);
  });

  test("resolves YT records by PointConfig source without mixing LP records", async () => {
    const packageId = objectId("a");
    const pointConfigId = objectId("b");
    const lpStateId = objectId("c");
    const positionId = objectId("d");
    const owner = objectId("e");
    const ytRecordId = objectId("f");
    const lpRecordId = objectId("1");
    const reader = new InMemoryJitterEventReader(new Map([
      [`${packageId}::referral_policy::YtReferralRecordCreated`, [{
        record_id: ytRecordId,
        source_id: pointConfigId,
        position_id: positionId,
        referee: owner,
      }]],
      [`${packageId}::referral_policy::YtReferralRecordClosed`, []],
      [`${packageId}::referral_policy::LpReferralRecordCreated`, [{
        record_id: lpRecordId,
        source_id: lpStateId,
        position_id: positionId,
        referee: owner,
      }]],
    ]));

    const records = await resolveYtReferralRecordObjectIds({
      eventReader: reader,
      network: "testnet",
      referralPackageId: packageId,
      owner,
      positionId,
      pointPrograms: [{
        label: "Jitter Points",
        protocol: "jitter",
        projectId: "jitter",
        projectObjectId: objectId("2"),
        scoreboardObjectId: objectId("3"),
        pointConfigObjectId: pointConfigId,
        lpPointStateObjectId: lpStateId,
        enabled: true,
        scopes: ["yt", "lp"],
        referral: {
          policyStateObjectId: objectId("4"),
          referralTableObjectId: OBJECTS.referralTableObjectId,
        },
      }],
    });

    expect(records).toEqual({ [pointConfigId]: ytRecordId });
  });

  test("uses referral markers as the authoritative record discovery source", async () => {
    const packageId = objectId("a");
    const extensionsPackageId = objectId("b");
    const pointConfigId = objectId("c");
    const positionId = objectId("d");
    const recordId = objectId("e");
    const queries: EventReaderQuery[] = [];
    const records = await resolveYtReferralRecordObjectIds({
      eventReader: {
        async queryEvents<TEvent>(query: EventReaderQuery): Promise<TEvent[]> {
          queries.push(query);
          return [];
        },
      },
      network: "testnet",
      referralPackageId: packageId,
      extensionsPackageId,
      owner: objectId("f"),
      positionId,
      pointPrograms: [{
        label: "Jitter Points",
        protocol: "jitter",
        projectObjectId: objectId("1"),
        scoreboardObjectId: objectId("2"),
        pointConfigObjectId: pointConfigId,
        scopes: ["yt"],
        referral: {
          policyStateObjectId: objectId("3"),
          referralTableObjectId: objectId("4"),
        },
      }],
      markerReader: async (input) => {
        expect(input).toEqual({
          parentId: pointConfigId,
          keyType: `${extensionsPackageId}::liquidlink_points::YtReferralRecordKey`,
          positionId,
        });
        return recordId;
      },
    });

    expect(records).toEqual({ [pointConfigId]: recordId });
    expect(queries).toHaveLength(0);
  });

  test("treats a missing referral marker as an uninitialized reward record", async () => {
    const queries: EventReaderQuery[] = [];
    const pointConfigId = objectId("6");
    const records = await resolveYtReferralRecordObjectIds({
      eventReader: {
        async queryEvents<TEvent>(query: EventReaderQuery): Promise<TEvent[]> {
          queries.push(query);
          return [];
        },
      },
      network: "testnet",
      referralPackageId: objectId("7"),
      extensionsPackageId: objectId("8"),
      owner: objectId("9"),
      positionId: objectId("a"),
      pointPrograms: [{
        label: "Jitter Points",
        protocol: "jitter",
        projectObjectId: objectId("b"),
        scoreboardObjectId: objectId("c"),
        pointConfigObjectId: pointConfigId,
        scopes: ["yt"],
        referral: {
          policyStateObjectId: objectId("d"),
          referralTableObjectId: objectId("e"),
        },
      }],
      markerReader: async () => null,
    });

    expect(records).toEqual({});
    expect(queries).toHaveLength(0);
  });
});
