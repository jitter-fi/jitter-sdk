import type { GrpcNetworkKind } from "../rpc.js";
import {readGeneratedRewardLeaderboard,readGeneratedRewardOwner} from './generated-reward-leaderboard.js';
import type { JitterMarketConfig } from "../types.js";
import {
  getLiquidlinkLeaderboard,
  getLiquidlinkScoreInfo,
  resolveLiquidlinkScoreboardObjectId,
} from "../queries.js";
import type {
  JitterAnalyticsReader,
  RewardLeaderboardResult,
  RewardLeaderboardRow,
  RewardSummaryResult,
} from "../ports/analytics-reader.js";

export type ReadJitterRewardLeaderboardInput = {
  /** All discovered point-bearing markets; never pass only the selected market. */
  generatedMarketConfigs?: readonly JitterMarketConfig[];
  network: GrpcNetworkKind;
  config: JitterMarketConfig;
  analyticsReader?: Pick<JitterAnalyticsReader, "getRewardLeaderboard" | "getRewardSummary">;
  limit?: number;
};
export type ReadJitterRewardSummaryInput = ReadJitterRewardLeaderboardInput & { owner: string };
export type JitterRewardLeaderboardResult = RewardLeaderboardResult & { fallback: boolean };
export type JitterRewardSummaryResult = RewardSummaryResult & { fallback: boolean };
export type JitterRewardReadDependencies = {
  getGeneratedRewardLeaderboard?: typeof readGeneratedRewardLeaderboard;
  getGeneratedRewardOwner?: typeof readGeneratedRewardOwner;
  getLiquidlinkLeaderboard?: typeof getLiquidlinkLeaderboard;
  getLiquidlinkScoreInfo?: typeof getLiquidlinkScoreInfo;
  /** Per-read deadline; capped at 4s for stored scores or 15s for generated simulations. */
  timeoutMs?: number;
  /** Separate chain budget for a complete paginated scan, capped at 30 seconds. */
  chainTimeoutMs?: number;
};

const generatedCache=new Map<string,{expires:number;promise:ReturnType<typeof readGeneratedRewardLeaderboard>}>();
function generatedFallback(input:Parameters<typeof readGeneratedRewardLeaderboard>[0]){
  const key=JSON.stringify(input),old=generatedCache.get(key);
  if(old&&old.expires>Date.now())return old.promise;
  if(generatedCache.size>20)generatedCache.clear();
  const promise=readGeneratedRewardLeaderboard(input).then(value=>{const entry=generatedCache.get(key);if(entry?.promise===promise)entry.expires=Date.now()+15000;return value;}).catch(error=>{if(generatedCache.get(key)?.promise===promise)generatedCache.delete(key);throw error;});
  generatedCache.set(key,{expires:Infinity,promise});return promise;
}

function address(value: unknown): string | null {
  return typeof value === "string" && /^0x[0-9a-fA-F]{1,64}$/.test(value)
    ? `0x${value.slice(2).toLowerCase().padStart(64, "0")}` : null;
}
function uint(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}
function nullableUint(value: unknown): boolean {
  return value === null || uint(value);
}
function rank(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function primary(value: { source: string; projectId: string; updatedAtMs: string | null }, projectId: string): boolean {
  return (value.source === "indexer" || value.source === "redis")
    && address(value.projectId) === address(projectId) && nullableUint(value.updatedAtMs);
}
function validRow(row: RewardLeaderboardRow): boolean {
  return Boolean(row && address(row.userAddress) && rank(row.rank) && uint(row.onChainPoints)
    && nullableUint(row.offChainXp) && nullableUint(row.updatedAtMs));
}
function validLeaderboard(value: RewardLeaderboardResult, projectId: string): boolean {
  if (!value || !primary(value, projectId) || !Array.isArray(value.rows)) return false;
  // The backend caps candidates before ranking; 100 rows may hide a better user.
  if(value.scoreBasis==='generated-v1'){
    if(value.ownershipBasis!=='scoreboard-plus-holdings-v1'||value.totalUsers!==value.rows.length||value.rows.length>1000)return false;
  }else if (value.rows.length === 0 || value.rows.length >= 100) return false;
  const owners = new Set<string>();
  return value.rows.every((row, index, rows) => {
    if (!validRow(row) || row.rank !== index + 1 || owners.has(address(row.userAddress)!)) return false;
    if(value.scoreBasis==='generated-v1'&&(!uint(row.settledPoints)||!uint(row.pendingPoints)||BigInt(row.onChainPoints)!==BigInt(row.settledPoints)+BigInt(row.pendingPoints)))return false;
    if(value.scoreBasis==='generated-v1'&&(!uint(row.availableScoreboard)||!uint(row.tokenizedPoints)||BigInt(row.settledPoints!)!==BigInt(row.availableScoreboard)+BigInt(row.tokenizedPoints)))return false;
    owners.add(address(row.userAddress)!);
    return index === 0 || BigInt(rows[index - 1]!.onChainPoints) >= BigInt(row.onChainPoints);
  });
}
function validSummary(value: RewardSummaryResult, projectId: string, owner: string): boolean {
  return Boolean(value && primary(value, projectId) && address(value.userAddress) === address(owner)
    && uint(value.onChainPoints) && nullableUint(value.offChainXp) && (value.rank === null || rank(value.rank))
    && (value.scoreBasis !== 'generated-v1' || value.ownershipBasis === 'scoreboard-plus-holdings-v1'
      && uint(value.availableScoreboard) && uint(value.tokenizedPoints) && uint(value.settledPoints) && uint(value.pendingPoints)
      && BigInt(value.settledPoints) === BigInt(value.availableScoreboard) + BigInt(value.tokenizedPoints)
      && BigInt(value.onChainPoints) === BigInt(value.settledPoints) + BigInt(value.pendingPoints)));
}
function settings(input: ReadJitterRewardLeaderboardInput, deps: JitterRewardReadDependencies) {
  const projectId = resolveLiquidlinkScoreboardObjectId(input.config);
  if (!projectId || !address(projectId)) throw new Error("Reward Scoreboard is not configured.");
  const limit = input.limit ?? 50;
  if (!Number.isSafeInteger(limit) || limit <= 0) throw new Error("Reward leaderboard limit must be a positive integer.");
  // A complete generated board simulates every owner; its cold read legitimately exceeds 4s.
  const primaryBudgetMs = input.generatedMarketConfigs ? 15000 : 4000;
  const timeoutMs = deps.timeoutMs ?? primaryBudgetMs;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("Reward read timeout must be positive.");
  const chainTimeoutMs = deps.chainTimeoutMs ?? 30000;
  if (!Number.isFinite(chainTimeoutMs) || chainTimeoutMs <= 0) throw new Error("Reward chain read timeout must be positive.");
  return { projectId, limit, timeoutMs: Math.min(timeoutMs, primaryBudgetMs), chainTimeoutMs: Math.min(chainTimeoutMs, 30000) };
}
async function bounded<T>(read: () => Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(read),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Reward data read timed out. Please try again.")), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function readJitterRewardLeaderboard(
  input: ReadJitterRewardLeaderboardInput,
  deps: JitterRewardReadDependencies = {},
): Promise<JitterRewardLeaderboardResult> {
  const { projectId, limit, timeoutMs, chainTimeoutMs } = settings(input, deps);
  if (input.analyticsReader) {
    try {
      const result = await bounded(() => input.analyticsReader!.getRewardLeaderboard({ network: input.network, projectId, limit: input.generatedMarketConfigs?1000:Math.max(100, limit) }), timeoutMs);
      if (validLeaderboard(result, projectId)&&(!input.generatedMarketConfigs||result.scoreBasis==='generated-v1')) return { ...result, rows: result.rows.slice(0, limit), fallback: false };
    } catch { /* Invalid or unavailable primary data must use the chain. */ }
  }
  if(input.generatedMarketConfigs){
    const result=await bounded(()=>(deps.getGeneratedRewardLeaderboard??generatedFallback)({network:input.network,scoreboardId:projectId,configs:input.generatedMarketConfigs!,limit}),chainTimeoutMs);
    return {...result,fallback:true};
  }
  const entries = await bounded(() => (deps.getLiquidlinkLeaderboard ?? getLiquidlinkLeaderboard)(input.network, input.config, limit), chainTimeoutMs);
  const owners = new Set<string>();
  for (const entry of entries) {
    const owner = address(entry.owner);
    if (!owner || owners.has(owner) || typeof entry.unconvertedScore !== "bigint" || entry.unconvertedScore < 0n
      || typeof entry.updatedAtMs !== "bigint" || entry.updatedAtMs < 0n) throw new Error("Invalid on-chain reward leaderboard.");
    owners.add(owner);
  }
  const rows = [...entries].sort((a, b) => a.unconvertedScore === b.unconvertedScore
    ? address(a.owner)!.localeCompare(address(b.owner)!) : a.unconvertedScore > b.unconvertedScore ? -1 : 1)
    .slice(0, limit).map((entry, index) => ({ rank: index + 1, userAddress: entry.owner,
      onChainPoints: entry.unconvertedScore.toString(), offChainXp: null, updatedAtMs: entry.updatedAtMs.toString() }));
  return { projectId, source: "contract", fallback: true, rows, updatedAtMs: null };
}

export async function readJitterRewardSummary(
  input: ReadJitterRewardSummaryInput,
  deps: JitterRewardReadDependencies = {},
): Promise<JitterRewardSummaryResult> {
  const { projectId, timeoutMs, chainTimeoutMs } = settings(input, deps);
  if (!address(input.owner)) throw new Error("Invalid reward owner address.");
  if(input.generatedMarketConfigs){
    if (input.analyticsReader) {
      try {
        const result = await bounded(()=>input.analyticsReader!.getRewardSummary({network:input.network,projectId,userAddress:input.owner}),timeoutMs);
        if (validSummary(result,projectId,input.owner) && result.scoreBasis === 'generated-v1') return {...result,fallback:false};
      } catch { /* Keep owner reads independent from a slow global board. */ }
    }
    const result = await bounded(()=>(deps.getGeneratedRewardOwner??readGeneratedRewardOwner)({network:input.network,scoreboardId:projectId,configs:input.generatedMarketConfigs!,owner:input.owner}),chainTimeoutMs);
    return {...result,fallback:true};
  }
  if (input.analyticsReader) {
    try {
      const [result, population] = await bounded(() => Promise.all([
        input.analyticsReader!.getRewardSummary({ network: input.network, projectId, userAddress: input.owner }),
        input.analyticsReader!.getRewardLeaderboard({ network: input.network, projectId, limit: 100 }),
      ]), timeoutMs);
      if (validSummary(result, projectId, input.owner) && validLeaderboard(population, projectId)
        && !(BigInt(result.onChainPoints) === 0n && result.rank === null)) {
        return { ...result, fallback: false };
      }
    } catch { /* Invalid or unavailable primary data must use the chain. */ }
  }
  const score = await bounded(() => (deps.getLiquidlinkScoreInfo ?? getLiquidlinkScoreInfo)(input.network, input.config, input.owner), chainTimeoutMs);
  if (typeof score.unconvertedScore !== "bigint" || score.unconvertedScore < 0n
    || typeof score.updatedAtMs !== "bigint" || score.updatedAtMs < 0n) throw new Error("Invalid on-chain reward summary.");
  return { projectId, userAddress: input.owner, source: "contract", fallback: true,
    onChainPoints: score.unconvertedScore.toString(), offChainXp: null, rank: null,
    updatedAtMs: score.exists ? score.updatedAtMs.toString() : null };
}
