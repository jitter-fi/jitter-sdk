import { normalizeStructTag, normalizeSuiAddress } from "@mysten/sui/utils";
import { JitterPosition } from "../generated/jitter/jitter_position.js";
import { PositionKey } from "../generated/jitter_extensions/liquidlink_points.js";
import { getSuiGrpcClient, type GrpcNetworkKind } from "../rpc.js";
import { SuiJitterEventReader } from "./sui-event-reader.js";
import {
  createPointConfigReader,
  liquidlinkPointPrograms,
  resolveLiquidlinkPointConfig,
} from "./point-claims-reader.js";
import {
  resolveLpReferralRecordObjectIds,
  resolveYtReferralRecordObjectIds,
} from "../referral.js";
import { createJitterPointService } from "../services/point-service.js";
import type {
  WalletPointPosition,
  WalletPointSettlementDependencies,
} from "../services/wallet-point-settlement.js";

export function createWalletPointSettlementDependencies(
  network: GrpcNetworkKind,
): WalletPointSettlementDependencies {
  const client = getSuiGrpcClient(network);
  const pointReader = createPointConfigReader(network);
  return {
    resolveConfig: (config) =>
      resolveLiquidlinkPointConfig(config, pointReader),
    async getPositions(owner, configs) {
      const types = new Set(
        configs.map(
          (c) =>
            `${c.jitterOriginalPackageId ?? c.jitterPackageId}::jitter_position::JitterPosition`,
        ),
      );
      const positions: WalletPointPosition[] = [];
      const ids = new Set<string>();
      for (const type of types) {
        let cursor: string | null = null;
        const cursors = new Set<string>();
        do {
          const page: Awaited<
            ReturnType<
              typeof client.listOwnedObjects<{ content: true; owner: true }>
            >
          > = await client.listOwnedObjects({
            owner,
            type,
            cursor,
            limit: 50,
            include: { content: true, owner: true },
          });
          for (const object of page.objects) {
            if (object instanceof Error) throw object;
            if (
              normalizeStructTag(object.type) !== normalizeStructTag(type) ||
              object.owner.$kind !== "AddressOwner" ||
              normalizeSuiAddress(object.owner.AddressOwner) !==
                normalizeSuiAddress(owner)
            )
              throw Error(
                "Wallet position type or owner changed during settlement scan.",
              );
            const position = JitterPosition.parse(object.content);
            const id = normalizeSuiAddress(position.id);
            if (id !== normalizeSuiAddress(object.objectId) || ids.has(id))
              throw Error("Duplicate or mismatched wallet position.");
            ids.add(id);
            if (ids.size > 500)
              throw Error(
                "Wallet position scan bound exceeded; explicit batch synchronization is required.",
              );
            positions.push({
              id,
              marketId: position.market_state_id,
              poolId: position.lp.pool_id,
              ytBalance: BigInt(position.py.yt_balance),
              lpAmount: BigInt(position.lp.lp_amount),
            });
          }
          if (!page.hasNextPage) break;
          if (!page.cursor || cursors.has(page.cursor))
            throw Error("Wallet point position pagination did not advance.");
          cursors.add(page.cursor);
          cursor = page.cursor;
        } while (cursor);
      }
      return positions;
    },
    async hasLedger(config, program, positionId, scope) {
      const packageId =
        config.liquidlink?.extensionsOriginalPackageId ??
        config.jitterExtensionsPackageId;
      const parentId =
        scope === "yt"
          ? program.pointConfigObjectId
          : program.lpPointStateObjectId;
      if (!packageId || !parentId) throw Error("Missing point ledger binding.");
      try {
        await client.getDynamicField({
          parentId,
          name: {
            type: `${packageId}::liquidlink_points::PositionKey`,
            bcs: PositionKey.serialize([positionId]).toBytes(),
          },
        });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
          /not.?found|does not exist|dynamic field.*missing|code\s*[:=]\s*5/i.test(
            message,
          )
        )
          return false;
        throw error;
      }
    },
    async getReferralRecords(config, owner, positionId, scope) {
      const referralPackageId = config.liquidlink?.referralPackageId;
      if (!referralPackageId)
        throw Error("Missing referral package for wallet point settlement.");
      return (
        scope === "yt"
          ? resolveYtReferralRecordObjectIds
          : resolveLpReferralRecordObjectIds
      )({
        eventReader: new SuiJitterEventReader(),
        network,
        owner,
        positionId,
        referralPackageId,
        extensionsPackageId:
          config.liquidlink?.extensionsOriginalPackageId ??
          config.jitterExtensionsPackageId,
        pointPrograms: liquidlinkPointPrograms(config),
      });
    },
    async assertClosedPrepared(config, owner) {
      if (!liquidlinkPointPrograms(config).some((p) => p.closed)) return;
      const snapshot = await createJitterPointService({
        network,
        config,
      }).getSnapshot(owner);
      if (
        snapshot.archiveTargets.length ||
        snapshot.closedClaims.some((c) => BigInt(c.points) > 0n) ||
        snapshot.referralClaims.some((c) => BigInt(c.points) > 0n)
      )
        throw Error(
          "Closed-season points require preparation in Incentives before wallet-wide settlement. No trade has been submitted.",
        );
    },
  };
}
