import { Transaction } from "@mysten/sui/transactions";
import {MAINNET_POINT_DEPENDENCIES,MAINNET_POINT_V2_DEPENDENCIES} from './liquidlink-deployment.js';
import { isValidSuiObjectId, normalizeSuiAddress } from "@mysten/sui/utils";
import type { JitterEventReader } from "./ports/event-reader.js";
import { getSuiClient } from "./rpc.js";
import type { JitterLiquidlinkPointProgramConfig } from "./types.js";

export type CloseReferralCampaignArgs = {
  extensionsPackageId: string;
  globalConfigObjectId: string;
  adminCapObjectId: string;
  liquidlinkGlobalConfigObjectId: string;
  projectCapObjectId: string;
  projectObjectId: string;
  scoreboardObjectId: string;
  referralStateObjectId: string;
  pointConfigObjectIds: readonly string[];
};

/**
 * End a campaign without unregistering its historical settlement authority.
 * Supply every associated PointConfig: there is no on-chain enumerable binding
 * that lets this builder certify completeness. All supplied configs are closed
 * atomically and individually checked against the Project and Scoreboard.
 */
export function addCloseReferralCampaign(tx: Transaction, args: CloseReferralCampaignArgs): void {
  const objectId = (value: string, label: string) => {
    const trimmed = value.trim();
    if (!/^0x[0-9a-fA-F]{1,64}$/.test(trimmed)) throw new Error(`Invalid ${label}.`);
    const normalized = normalizeSuiAddress(trimmed);
    if (!isValidSuiObjectId(normalized)) throw new Error(`Invalid ${label}.`);
    return normalized;
  };
  // Validate everything before mutating the caller's transaction.
  const packageId = objectId(args.extensionsPackageId, "extensions package ID");
  const shared = [
    args.globalConfigObjectId, args.adminCapObjectId, args.liquidlinkGlobalConfigObjectId,
    args.projectCapObjectId, args.projectObjectId, args.scoreboardObjectId, args.referralStateObjectId,
  ].map((id) => objectId(id, "campaign object ID"));
  const configs = [...new Set(args.pointConfigObjectIds.map((id) => objectId(id, "PointConfig ID")))];
  if (!configs.length) throw new Error("At least one PointConfig is required to close a referral campaign.");
  for (const config of configs) {
    tx.moveCall({
      target: `${packageId}::liquidlink_points::close_referral_campaign_by_admin`,
      arguments: [tx.object(config), ...shared.map((id) => tx.object(id)), tx.object.clock()],
    });
  }
}

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

export type ReferralMarkerReader = (input: {
  parentId: string;
  keyType: string;
  positionId: string;
}) => Promise<string | null>;

export async function resolveLpReferralRecordObjectIds(options: {
  eventReader: JitterEventReader;
  network: "mainnet" | "testnet" | "devnet";
  referralPackageId: string;
  owner: string;
  positionId: string;
  pointPrograms: readonly JitterLiquidlinkPointProgramConfig[];
  extensionsPackageId?: string;
  markerReader?: ReferralMarkerReader;
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
  extensionsPackageId?: string;
  markerReader?: ReferralMarkerReader;
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
  extensionsPackageId?: string;
  markerReader?: ReferralMarkerReader;
}): Promise<Record<string, string>> {
  const release=MAINNET_POINT_DEPENDENCIES;
  const extensionOrigin=options.network==='mainnet'&&[release.extensions.packageId,MAINNET_POINT_V2_DEPENDENCIES.extensions.packageId].includes(options.extensionsPackageId??'')?release.extensions.originalId:options.extensionsPackageId;
  const referralOrigin=options.network==='mainnet'&&[release.referral.packageId,MAINNET_POINT_V2_DEPENDENCIES.referral.packageId].includes(options.referralPackageId)?release.referral.originalId:options.referralPackageId;
  if (options.extensionsPackageId) {
    const markerReader = options.markerReader ?? ((input) => readReferralMarker({
      ...input,
      network: options.network,
    }));
    const result: Record<string, string> = {};
    await Promise.all(options.pointPrograms.map(async (program) => {
      if (!program.referral) return;
      const parentId = options.recordKind === "Lp"
        ? program.lpPointStateObjectId
        : program.pointConfigObjectId;
      if (!parentId) return;
      const recordId = await markerReader({
        parentId,
        keyType: `${extensionOrigin}::liquidlink_points::${options.recordKind}ReferralRecordKey`,
        positionId: options.positionId,
      });
      if (recordId) result[program.pointConfigObjectId] = recordId;
    }));
    return result;
  }

  const eventType = `${referralOrigin}::referral_policy::${options.recordKind}ReferralRecordCreated`;
  const closeEventType = `${referralOrigin}::referral_policy::${options.recordKind}ReferralRecordClosed`;
  const [created, closed] = await Promise.all([
    options.eventReader.queryEvents<ReferralRecordEvent>({
      network: options.network,
      eventType,
      limit: 50,
      order: "descending",
    }),
    options.eventReader.queryEvents<ReferralRecordEvent>({
      network: options.network,
      eventType: closeEventType,
      limit: 50,
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

async function readReferralMarker(options: {
  network: "mainnet" | "testnet" | "devnet";
  parentId: string;
  keyType: string;
  positionId: string;
}): Promise<string | null> {
  const response = await getSuiClient(options.network).getDynamicFieldObject({
    parentId: options.parentId,
    name: { type: options.keyType, value: options.positionId },
  });
  if ("error" in response && response.error) {
    if (/not.?found|does not exist|dynamic field.*missing|code\s*[:=]\s*5/i.test(response.error.message)) {
      return null;
    }
    throw response.error;
  }
  const fields = response.data?.content?.fields;
  const value = fields?.value;
  if (!value || typeof value !== "object") return null;
  return readObjectId((value as Record<string, unknown>).record_id);
}

function readObjectId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return readObjectId(record.id ?? record.bytes);
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
