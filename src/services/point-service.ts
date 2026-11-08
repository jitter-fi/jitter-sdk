import { Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { addCheckpointClosedPoints, addClaimArchivedReferral, addClaimClosedPoints, type ClosedPointClaimPolicies } from "../liquidlink-points.js";
import {
  createPointConfigReader, getOwnedClosedPointClaims, getOwnedDeferredReferralClaims,
  getPointPositionIds, isClosedPointPositionArchived, liquidlinkPointPrograms,
  resolveLiquidlinkPointConfig, type PointConfigReader,
} from "../infrastructure/point-claims-reader.js";
import { SuiJitterEventReader } from "../infrastructure/sui-event-reader.js";
import { resolveLpReferralRecordObjectIds, resolveYtReferralRecordObjectIds } from "../referral.js";
import type { ClosedPointClaim, DeferredReferralClaim } from "../point-claims.js";
import type { GrpcNetworkKind } from "../rpc.js";
import type { JitterMarketConfig } from "../types.js";

export type ClosedPointArchiveTarget = { pointConfigObjectId: string; positionObjectId: string; scope: "yt" | "lp"; referralRecordObjectId?: string };
export type JitterPointSnapshot = {
  config: JitterMarketConfig;
  closedClaims: ClosedPointClaim[];
  referralClaims: DeferredReferralClaim[];
  archiveTargets: ClosedPointArchiveTarget[];
};
export type CreateJitterPointServiceOptions = {
  network: GrpcNetworkKind;
  config: JitterMarketConfig;
  delegates?: {
    pointConfigReader?: PointConfigReader;
    getPositionIds?: (owner: string) => Promise<string[]>;
    isArchived?: (parentId: string, positionId: string) => Promise<boolean>;
    getClosedClaims?: (owner: string, config: JitterMarketConfig) => Promise<ClosedPointClaim[]>;
    getReferralClaims?: (owner: string, config: JitterMarketConfig) => Promise<DeferredReferralClaim[]>;
    getReferralRecords?: (owner: string, positionId: string, scope: "yt" | "lp", config: JitterMarketConfig) => Promise<Record<string, string>>;
  };
};
export type PrepareClosedPointsParams = {
  owner: string;
  /** Must await successful execution and visibility before resolving. No signing occurs inside the SDK. */
  submitAndWait: (tx: Transaction) => Promise<void>;
  liquidlinkAvailable: boolean;
  /** Apply every original Project policy in registration order. */
  applyPolicies?: (tx: Transaction, claim: ClosedPointClaim, ...args: Parameters<ClosedPointClaimPolicies>) => void;
};
export type JitterPointService = {
  getSnapshot(owner: string): Promise<JitterPointSnapshot>;
  buildArchiveTx(owner: string, snapshot: JitterPointSnapshot): Transaction | null;
  buildClaimTx(owner: string, snapshot: JitterPointSnapshot, applyPolicies: NonNullable<PrepareClosedPointsParams["applyPolicies"]>): Transaction | null;
  prepare(params: PrepareClosedPointsParams): Promise<JitterPointSnapshot>;
};

/** Compose into the existing point-market prepare flow, retaining its normal signing boundaries. */
export function createJitterPointService(options: CreateJitterPointServiceOptions): JitterPointService {
  const { network, config: initialConfig } = options;
  const delegates = options.delegates ?? {};
  const reader = delegates.pointConfigReader ?? createPointConfigReader(network);
  const records = delegates.getReferralRecords ?? (async (owner, positionId, scope, config) => {
    if (!config.liquidlink?.referralPackageId) return {};
    return (scope === "lp" ? resolveLpReferralRecordObjectIds : resolveYtReferralRecordObjectIds)({
      eventReader: new SuiJitterEventReader(), network, owner, positionId,
      referralPackageId: config.liquidlink.referralPackageId,
      extensionsPackageId: config.liquidlink.extensionsOriginalPackageId ?? config.jitterExtensionsPackageId,
      pointPrograms: liquidlinkPointPrograms(config),
    });
  });
  return {
    async getSnapshot(owner) {
      const config = await resolveLiquidlinkPointConfig(initialConfig, reader);
      const closedClaims = await (delegates.getClosedClaims?.(owner, config) ?? getOwnedClosedPointClaims(network, config, owner));
      const referralClaims = await (delegates.getReferralClaims?.(owner, config) ?? getOwnedDeferredReferralClaims(network, config, owner));
      const programs = liquidlinkPointPrograms(config).filter(p => p.closed);
      const archiveTargets: ClosedPointArchiveTarget[] = [];
      if (programs.length > 0) {
        const positionIds = await (delegates.getPositionIds?.(owner) ?? getPointPositionIds(network, config, owner));
        for (const positionObjectId of new Set(positionIds)) {
          for (const scope of ["yt", "lp"] as const) {
            const referralRecords = programs.some(p => p.referral) ? await records(owner, positionObjectId, scope, config) : {};
            for (const program of programs) {
              const scopes = program.scopes ?? (program.lpPointStateObjectId ? ["yt", "lp", "pool"] : ["yt"]);
              if (!scopes.includes(scope)) continue;
              const parentId = scope === "yt" ? program.pointConfigObjectId : program.lpPointStateObjectId;
              if (!parentId) throw new Error(`Missing LP state for PointConfig ${program.pointConfigObjectId}.`);
              const archived = await (delegates.isArchived?.(parentId, positionObjectId) ?? isClosedPointPositionArchived(network, config, parentId, positionObjectId));
              if (!archived) archiveTargets.push({ pointConfigObjectId: program.pointConfigObjectId, positionObjectId, scope,
                referralRecordObjectId: referralRecords[program.pointConfigObjectId] ?? referralRecords[program.pointConfigObjectId.toLowerCase()] });
            }
          }
        }
      }
      return { config, closedClaims, referralClaims, archiveTargets };
    },
    buildArchiveTx(owner, snapshot) {
      if (!snapshot.archiveTargets.length) return null;
      const tx = new Transaction();
      tx.setSender(owner);
      const seen = new Set<string>();
      for (const target of snapshot.archiveTargets) {
        const key = `${normalizeSuiAddress(target.pointConfigObjectId)}:${normalizeSuiAddress(target.positionObjectId)}:${target.scope}`;
        if (seen.has(key)) continue;
        seen.add(key);
        addCheckpointClosedPoints(tx, snapshot.config, target.pointConfigObjectId, target.scope, target.positionObjectId, target.referralRecordObjectId);
      }
      return tx;
    },
    buildClaimTx(owner, snapshot, applyPolicies) {
      const tx = new Transaction();
      tx.setSender(owner);
      for (const claim of snapshot.closedClaims) addClaimClosedPoints(tx, snapshot.config, claim, (stamp, confirm) => applyPolicies(tx, claim, stamp, confirm));
      for (const claim of snapshot.referralClaims) addClaimArchivedReferral(tx, snapshot.config, claim);
      return tx.getData().commands.length ? tx : null;
    },
    async prepare(params) {
      let snapshot = await this.getSnapshot(params.owner);
      const archive = this.buildArchiveTx(params.owner, snapshot);
      if (archive) {
        await params.submitAndWait(archive);
        snapshot = await this.getSnapshot(params.owner);
        if (snapshot.archiveTargets.length) throw new Error("Closed point archival is not visible yet; retry preparation after confirmation.");
      }
      if (params.liquidlinkAvailable) {
        if (snapshot.closedClaims.some(c => BigInt(c.points) > 0n) && !params.applyPolicies) {
          throw new Error("Claiming closed points requires the original ordered Project policies.");
        }
        const claim = this.buildClaimTx(params.owner, snapshot, params.applyPolicies ?? (() => {}));
        if (claim) {
          await params.submitAndWait(claim);
          snapshot = await this.getSnapshot(params.owner);
        }
      }
      return snapshot;
    },
  };
}
