import type { JitterMarketConfig } from "../types.js";
import type { GrpcNetworkKind } from "../rpc.js";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { createGeneratedRewardChainReader } from "../infrastructure/generated-reward-chain-reader.js";

export type GeneratedRewardInput = {
  network: GrpcNetworkKind;
  scoreboardId: string;
  configs: readonly JitterMarketConfig[];
  limit?: number;
  owner?: string;
  /** Canonical Registry selection, not a wallet-supplied tokenized-point config. */
  trustedPointMarket?: { pointTokenMarketId: string };
};
export type GeneratedRewardValue = {
  owner: string;
  settledPoints: string;
  pendingPoints: string;
  updatedAtMs: string;
  tokenizedPoints?: string;
};
export type RegisteredPointPosition = {
  config: JitterMarketConfig;
  positionId: string;
  pointConfigId: string;
  yt: boolean;
  lp: boolean;
};
export type GeneratedRewardDependencies = {
  settled: () => Promise<GeneratedRewardValue[]>;
  /** Null means no canonical market is configured; [] is a verified empty table. */
  holders?: () => Promise<string[] | null>;
  registered: () => Promise<Map<string, RegisteredPointPosition[]>>;
  simulate: (
    owner: string,
    positions: RegisteredPointPosition[],
  ) => Promise<GeneratedRewardValue>;
};

/** Read one wallet without simulating the entire leaderboard population. */
export async function readGeneratedRewardOwner(input: GeneratedRewardInput & { owner: string },
  deps: GeneratedRewardDependencies = createGeneratedRewardChainReader(input)) {
  const owner = normalizeSuiAddress(input.owner);
  const registered = await deps.registered();
  const positions = [...registered].filter(([key]) => normalizeSuiAddress(key) === owner).flatMap(([,rows])=>rows);
  const value = await deps.simulate(owner, positions);
  if (input.trustedPointMarket && value.tokenizedPoints === undefined)
    throw Error("Owner simulation omitted tokenized points.");
  if (normalizeSuiAddress(value.owner) !== owner) throw Error("Reward simulation owner mismatch.");
  for (const raw of [value.settledPoints,value.pendingPoints,value.tokenizedPoints??"0",value.updatedAtMs])
    if (!/^\d+$/.test(raw)) throw Error("Invalid generated reward amount.");
  const tokenizedPoints = value.tokenizedPoints ?? "0";
  const settledPoints = (BigInt(value.settledPoints)+BigInt(tokenizedPoints)).toString();
  return {projectId:normalizeSuiAddress(input.scoreboardId),userAddress:owner,source:"contract" as const,
    scoreBasis:"generated-v1" as const,ownershipBasis:"scoreboard-plus-holdings-v1" as const,
    availableScoreboard:value.settledPoints,tokenizedPoints,settledPoints,pendingPoints:value.pendingPoints,
    onChainPoints:(BigInt(settledPoints)+BigInt(value.pendingPoints)).toString(),rank:null,offChainXp:null,updatedAtMs:value.updatedAtMs};
}
type GeneratedRewardBoard = {
  projectId: string;
  source: "contract";
  scoreBasis: "generated-v1";
  ownershipBasis: "scoreboard-plus-holdings-v1";
  rows: {
    rank: number; userAddress: string; onChainPoints: string;
    settledPoints: string; pendingPoints: string; offChainXp: null; updatedAtMs: string;
    /** Present on ownership-aware reads; never includes tokenized holdings. */
    availableScoreboard?: string;
    tokenizedPoints?: string;
  }[];
  updatedAtMs: string;
  totalUsers: number;
};

/** Generated = available Scoreboard + tokenized holdings + unmaterialized rewards.
 * The holding mirror already includes ask escrow; never add order balances.
 * Simulation replaces the baseline; it is never added on top of a second read. */
export async function readGeneratedRewardLeaderboard(
  input: GeneratedRewardInput,
  deps: GeneratedRewardDependencies = createGeneratedRewardChainReader(input),
): Promise<GeneratedRewardBoard> {
  const limit = input.limit ?? 1000;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000)
    throw Error("Generated leaderboard limit must be 1..1000.");
  if (input.trustedPointMarket && !deps.holders)
    throw Error("Trusted point market requires a holdings reader.");
  const [settled, registered, holders] = await Promise.all([
    deps.settled(),
    deps.registered(),
    deps.holders?.() ?? null,
  ]);
  if (input.trustedPointMarket && holders === null)
    throw Error("Trusted point market holdings are unavailable.");
  const values = new Map<string, GeneratedRewardValue>();
  for (const value of settled) {
    const owner = normalizeSuiAddress(value.owner);
    if (values.has(owner)) throw Error("Duplicate reward owner.");
    values.set(owner, { ...value, owner });
  }
  // Bound concurrent chain reads without dropping candidates before ranking.
  const candidates = new Map<string, RegisteredPointPosition[]>();
  for (const [owner, positions] of registered) {
    const normalized = normalizeSuiAddress(owner);
    if (candidates.has(normalized)) throw Error("Duplicate registered reward owner.");
    candidates.set(normalized, positions);
  }
  const holdingOwners = new Set<string>();
  for (const owner of holders ?? []) {
    const normalized = normalizeSuiAddress(owner);
    if (holdingOwners.has(normalized)) throw Error("Duplicate holding owner.");
    holdingOwners.add(normalized);
    if (!candidates.has(normalized)) candidates.set(normalized, []);
  }
  // A first tokenization may race roster discovery. Re-read every known owner
  // with score and holdings together instead of combining different snapshots.
  if (holders !== null) {
    for (const owner of values.keys()) {
      if (!candidates.has(owner)) candidates.set(owner, []);
    }
  }
  const pending = [...candidates];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, pending.length) }, async () => {
      while (next < pending.length) {
        const [owner, positions] = pending[next++]!;
        const value = await deps.simulate(owner, positions);
        if (holdingOwners.has(owner) && value.tokenizedPoints === undefined)
          throw Error("Holding owner simulation omitted tokenized points.");
        if (normalizeSuiAddress(value.owner) !== normalizeSuiAddress(owner))
          throw Error("Reward simulation owner mismatch.");
        values.set(normalizeSuiAddress(owner), {
          ...value,
          owner: normalizeSuiAddress(owner),
        });
      }
    }),
  );
  const rows = [...values.values()]
    .map((value) => {
      for (const raw of [
        value.settledPoints,
        value.pendingPoints,
        value.updatedAtMs,
        value.tokenizedPoints ?? "0",
      ])
        if (!/^\d+$/.test(raw)) throw Error("Invalid generated reward amount.");
      const tokenizedPoints = value.tokenizedPoints ?? "0";
      const settledPoints = (BigInt(value.settledPoints) + BigInt(tokenizedPoints)).toString();
      return {
        rank: 0,
        userAddress: value.owner,
        onChainPoints: (
          BigInt(settledPoints) + BigInt(value.pendingPoints)
        ).toString(),
        settledPoints,
        availableScoreboard: value.settledPoints,
        tokenizedPoints,
        pendingPoints: value.pendingPoints,
        offChainXp: null,
        updatedAtMs: value.updatedAtMs,
      };
    })
    .sort((a, b) =>
      BigInt(a.onChainPoints) === BigInt(b.onChainPoints)
        ? a.userAddress.localeCompare(b.userAddress)
        : BigInt(a.onChainPoints) > BigInt(b.onChainPoints)
          ? -1
          : 1,
    );
  if (rows.length > 1000)
    throw Error(
      "Generated leaderboard population exceeds supported bound; refusing partial ranks.",
    );
  const updatedAtMs = rows.reduce(
    (max, r) => (BigInt(r.updatedAtMs) > BigInt(max) ? r.updatedAtMs : max),
    rows.length ? "0" : String(Date.now()),
  );
  return {
    projectId: normalizeSuiAddress(input.scoreboardId),
    source: "contract" as const,
    scoreBasis: "generated-v1" as const,
    ownershipBasis: "scoreboard-plus-holdings-v1" as const,
    rows: rows.slice(0, limit).map((r, i) => ({ ...r, rank: i + 1 })),
    updatedAtMs,
    totalUsers: rows.length,
  };
}
