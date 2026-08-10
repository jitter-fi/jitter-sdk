import { Transaction } from "@mysten/sui/transactions";
import type { JitterEventReader } from "./ports/event-reader.js";
import type { JitterLiquidlinkPointProgramConfig } from "./types.js";

export type JitterReferralObjects = {
  packageId: string;
  globalConfigObjectId: string;
  referralTableObjectId: string;
};

export type ReferralRecordEvent = {
  record_id: string;
  source_id: string;
  position_id: string;
  referee: string;
};

export type LpReferralRecordEvent = ReferralRecordEvent;
export type YtReferralRecordEvent = ReferralRecordEvent;

export async function resolveLpReferralRecordObjectIds(options: {
  eventReader: JitterEventReader;
  network: "mainnet" | "testnet" | "devnet";
  referralPackageId: string;
  owner: string;
  positionId: string;
  pointPrograms: readonly JitterLiquidlinkPointProgramConfig[];
}): Promise<Record<string, string>> {
  return resolveReferralRecordObjectIds({
    ...options,
    recordKind: "Lp",
  });
}

export async function resolveYtReferralRecordObjectIds(options: {
  eventReader: JitterEventReader;
  network: "mainnet" | "testnet" | "devnet";
  referralPackageId: string;
  owner: string;
  positionId: string;
  pointPrograms: readonly JitterLiquidlinkPointProgramConfig[];
}): Promise<Record<string, string>> {
  return resolveReferralRecordObjectIds({
    ...options,
    recordKind: "Yt",
  });
}

async function resolveReferralRecordObjectIds(options: {
  eventReader: JitterEventReader;
  network: "mainnet" | "testnet" | "devnet";
  referralPackageId: string;
  owner: string;
  positionId: string;
  pointPrograms: readonly JitterLiquidlinkPointProgramConfig[];
  recordKind: "Lp" | "Yt";
}): Promise<Record<string, string>> {
  const eventType = `${options.referralPackageId}::referral_policy::${options.recordKind}ReferralRecordCreated`;
  const closeEventType = `${options.referralPackageId}::referral_policy::${options.recordKind}ReferralRecordClosed`;
  const [created, closed] = await Promise.all([
    options.eventReader.queryEvents<ReferralRecordEvent>({
      network: options.network,
      eventType,
      limit: 100,
      order: "descending",
    }),
    options.eventReader.queryEvents<ReferralRecordEvent>({
      network: options.network,
      eventType: closeEventType,
      limit: 100,
      order: "descending",
    }),
  ]);
  const closedIds = new Set(closed.map((event) => event.record_id));
  const owner = options.owner.toLowerCase();
  const positionId = options.positionId.toLowerCase();
  const recordsBySource = new Map<string, string>();

  for (const event of created) {
    if (closedIds.has(event.record_id)) continue;
    if (event.referee.toLowerCase() !== owner) continue;
    if (event.position_id.toLowerCase() !== positionId) continue;
    if (!recordsBySource.has(event.source_id)) {
      recordsBySource.set(event.source_id, event.record_id);
    }
  }

  const result: Record<string, string> = {};
  for (const program of options.pointPrograms) {
    if (!program.referral) continue;
    const sourceId = options.recordKind === "Lp"
      ? program.lpPointStateObjectId
      : program.pointConfigObjectId;
    if (!sourceId) continue;
    const recordId = recordsBySource.get(sourceId);
    if (recordId) result[program.pointConfigObjectId] = recordId;
  }
  return result;
}

const REFERRAL_CODE_PATTERN = /^[a-z0-9]{3,32}$/;

export function isValidJitterReferralCode(code: string): boolean {
  return REFERRAL_CODE_PATTERN.test(code);
}

export function addSetJitterReferralCode(
  tx: Transaction,
  objects: JitterReferralObjects,
  code: string,
) {
  assertValidReferralCode(code);
  tx.moveCall({
    target: `${objects.packageId}::bonding_table::set_referral_code_`,
    arguments: [
      tx.object(objects.globalConfigObjectId),
      tx.object(objects.referralTableObjectId),
      tx.pure.string(code),
    ],
  });
}

export function addUseJitterReferralCode(
  tx: Transaction,
  objects: JitterReferralObjects,
  code: string,
) {
  assertValidReferralCode(code);
  tx.moveCall({
    target: `${objects.packageId}::bonding_table::use_referral_code_`,
    arguments: [
      tx.object(objects.globalConfigObjectId),
      tx.object(objects.referralTableObjectId),
      tx.pure.string(code),
    ],
  });
}

function assertValidReferralCode(code: string) {
  if (!isValidJitterReferralCode(code)) {
    throw new Error("Referral code must contain 3-32 lowercase letters or digits.");
  }
}
