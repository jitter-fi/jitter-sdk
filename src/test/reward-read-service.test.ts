import { describe, expect, test } from "bun:test";
import { getDefaultJitterMarketConfig } from "../config.js";
import { readJitterRewardLeaderboard, readJitterRewardSummary } from "../services/reward-read-service.js";
import type { JitterAnalyticsReader, RewardLeaderboardResult, RewardSummaryResult } from "../ports/analytics-reader.js";
import type { LiquidlinkScoreInfo } from "../queries.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const config = { ...getDefaultJitterMarketConfig("testnet")!, liquidlink: { enabled: true, scoreboardObjectId: id(1) } };
const input = { network: "testnet" as const, config, owner: id(2) };
const score: LiquidlinkScoreInfo = { exists: true, totalScore: 100n, unconvertedScore: 80n,
  convertedScore: 20n, storedScore: 100n, scorePerDuration: 0n, durationMs: 1n,
  updatedAtMs: 12n, linearPausedMsAtUpdate: 0n };
const summary = (): RewardSummaryResult => ({ projectId: id(1), userAddress: id(2), source: "indexer",
  onChainPoints: "9007199254740993000", offChainXp: "2", rank: 1, updatedAtMs: "12" });
const leaderboard = (): RewardLeaderboardResult => ({ projectId: id(1), source: "redis",
  rows: [{ rank: 1, userAddress: id(2), onChainPoints: "9007199254740993000", offChainXp: null, updatedAtMs: "12" }], updatedAtMs: "12" });
function reader(s: unknown = summary(), l: unknown = leaderboard()): Pick<JitterAnalyticsReader, "getRewardSummary" | "getRewardLeaderboard"> {
  return { getRewardSummary: async () => s as RewardSummaryResult, getRewardLeaderboard: async () => l as RewardLeaderboardResult };
}
const deps = { getLiquidlinkScoreInfo: async () => score,
  getLiquidlinkLeaderboard: async () => [{ ...score, owner: id(2), rank: 1 }] };

describe("reward indexer-first reads", () => {
  test('generated mode uses the same total and rank for a pending-only user',async()=>{
    const board={projectId:id(1),source:'indexer' as const,scoreBasis:'generated-v1' as const,ownershipBasis:'scoreboard-plus-holdings-v1' as const,totalUsers:1,updatedAtMs:'1000',
      rows:[{rank:1,userAddress:id(2),onChainPoints:'150',settledPoints:'0',availableScoreboard:'0',tokenizedPoints:'0',pendingPoints:'150',offChainXp:null,updatedAtMs:'1000'}]};
    const analyticsReader=reader({...board,...board.rows[0]},board);
    const generated={...input,generatedMarketConfigs:[],analyticsReader};
    expect((await readJitterRewardLeaderboard(generated)).fallback).toBe(false);
    expect(await readJitterRewardSummary(generated)).toMatchObject({onChainPoints:'150',settledPoints:'0',pendingPoints:'150',rank:1,fallback:false});
  });
  test('generated mode rejects a settled-only primary and uses the generated SDK fallback',async()=>{
    const board={projectId:id(1),source:'contract' as const,scoreBasis:'generated-v1' as const,ownershipBasis:'scoreboard-plus-holdings-v1' as const,totalUsers:1,updatedAtMs:'1000',
      rows:[{rank:1,userAddress:id(2),onChainPoints:'150',settledPoints:'100',availableScoreboard:'100',tokenizedPoints:'0',pendingPoints:'50',offChainXp:null,updatedAtMs:'1000'}]};
    let reads=0;
    const result=await readJitterRewardLeaderboard({...input,generatedMarketConfigs:[],analyticsReader:reader()},
      {getGeneratedRewardLeaderboard:async()=>{reads++;return board;}});
    expect(reads).toBe(1);expect(result).toMatchObject({fallback:true,scoreBasis:'generated-v1',rows:[{onChainPoints:'150'}]});
  });
  test('generated mode refuses arithmetically inconsistent primary totals',async()=>{
    const invalid={...leaderboard(),scoreBasis:'generated-v1',totalUsers:1,rows:[{...leaderboard().rows[0],settledPoints:'1',pendingPoints:'2'}]};
    await expect(readJitterRewardLeaderboard({...input,generatedMarketConfigs:[],analyticsReader:reader(null,invalid)},
      {getGeneratedRewardLeaderboard:async()=>{throw Error('pending unavailable')}})).rejects.toThrow('pending unavailable');
  });
  test('rejects legacy generated responses and invalid holding components before trusting primary ranks', async()=>{
    const valid={projectId:id(1),source:'indexer' as const,scoreBasis:'generated-v1' as const,ownershipBasis:'scoreboard-plus-holdings-v1' as const,totalUsers:1,updatedAtMs:'1000',
      rows:[{rank:1,userAddress:id(2),onChainPoints:'150',settledPoints:'100',availableScoreboard:'60',tokenizedPoints:'40',pendingPoints:'50',offChainXp:null,updatedAtMs:'1000'}]};
    for (const invalid of [{...valid,ownershipBasis:undefined}, {...valid,rows:[{...valid.rows[0]!,tokenizedPoints:'41'}]}, {...valid,rows:[{...valid.rows[0]!,availableScoreboard:undefined}]}]) {
      await expect(readJitterRewardLeaderboard({...input,generatedMarketConfigs:[],analyticsReader:reader(null,invalid)},
        {getGeneratedRewardLeaderboard:async()=>{throw Error('ownership fallback')}})).rejects.toThrow('ownership fallback');
    }
    const result=await readJitterRewardSummary({...input,generatedMarketConfigs:[],analyticsReader:reader({...valid,...valid.rows[0]},valid)});
    expect(result).toMatchObject({fallback:false,onChainPoints:'150',availableScoreboard:'60',tokenizedPoints:'40',ownershipBasis:'scoreboard-plus-holdings-v1'});
  });
  test("keeps valid primary sources and precision without chain reads", async () => {
    const fail = async (): Promise<never> => { throw new Error("unexpected chain read"); };
    const analyticsReader = reader();
    expect(await readJitterRewardSummary({ ...input, analyticsReader }, { getLiquidlinkScoreInfo: fail }))
      .toEqual({ ...summary(), fallback: false });
    expect(await readJitterRewardLeaderboard({ ...input, analyticsReader }, { getLiquidlinkLeaderboard: fail }))
      .toEqual({ ...leaderboard(), fallback: false });
  });

  test("uses scoreboard identity and requests at least 100 primary candidates", async () => {
    const analyticsReader = reader();
    const queries: unknown[] = [];
    analyticsReader.getRewardLeaderboard = async (query) => {
      queries.push(query);
      return leaderboard();
    };
    analyticsReader.getRewardSummary = async (query) => {
      expect(query).toEqual({ network: "testnet", projectId: id(1), userAddress: id(2) });
      return summary();
    };
    expect((await readJitterRewardLeaderboard({ ...input, analyticsReader, limit: 7 }, deps)).fallback).toBe(false);
    expect((await readJitterRewardSummary({ ...input, analyticsReader }, deps)).fallback).toBe(false);
    expect(queries).toEqual(Array(2).fill({ network: "testnet", projectId: id(1), limit: 100 }));
  });

  test("empty primary leaderboard confirms chain, including a genuinely empty table", async () => {
    const analyticsReader = reader(summary(), { ...leaderboard(), rows: [] });
    expect(await readJitterRewardLeaderboard({ ...input, analyticsReader }, deps))
      .toMatchObject({ source: "contract", fallback: true, rows: [{ onChainPoints: "80" }] });
    let reads = 0;
    expect(await readJitterRewardLeaderboard({ ...input, analyticsReader }, {
      getLiquidlinkLeaderboard: async () => { reads++; return []; },
    })).toMatchObject({ source: "contract", fallback: true, rows: [] });
    expect(reads).toBe(1);
  });

  test("zero unranked primary summary confirms absent or nonzero chain state", async () => {
    const analyticsReader = reader({ ...summary(), onChainPoints: "0", rank: null });
    expect(await readJitterRewardSummary({ ...input, analyticsReader }, deps))
      .toMatchObject({ source: "contract", fallback: true, onChainPoints: "80", rank: null });
    let reads = 0;
    expect(await readJitterRewardSummary({ ...input, analyticsReader }, {
      getLiquidlinkScoreInfo: async () => {
        reads++;
        return { ...score, exists: false, unconvertedScore: 0n, updatedAtMs: 0n };
      },
    })).toMatchObject({ source: "contract", fallback: true, onChainPoints: "0", rank: null, updatedAtMs: null });
    expect(reads).toBe(1);
  });

  test("101-user population capped at 100 falls back even for a top-10 request", async () => {
    const population = Array.from({ length: 101 }, (_, i) => ({ ...score, owner: id(i + 20), rank: i + 1,
      unconvertedScore: i === 100 ? 10_000n : BigInt(1000 - i) }));
    const capped = { ...leaderboard(), rows: population.slice(0, 100).map((entry) => ({
      rank: entry.rank, userAddress: entry.owner, onChainPoints: entry.unconvertedScore.toString(), offChainXp: null, updatedAtMs: "12",
    })) };
    const analyticsReader = reader(summary(), capped);
    const requestedLimits: Array<number | undefined> = [];
    analyticsReader.getRewardLeaderboard = async ({ limit }) => {
      requestedLimits.push(limit);
      return capped;
    };
    const result = await readJitterRewardLeaderboard({ ...input, analyticsReader, limit: 10 }, {
      getLiquidlinkLeaderboard: async (_network, _config, limit) => {
        expect(limit).toBe(10);
        return population;
      },
    });
    expect(result).toMatchObject({ source: "contract", fallback: true });
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0]).toMatchObject({ rank: 1, userAddress: id(120), onChainPoints: "10000" });
    expect(await readJitterRewardSummary({ ...input, analyticsReader }, deps))
      .toMatchObject({ source: "contract", fallback: true, onChainPoints: "80", rank: null });
    expect(requestedLimits).toEqual([100, 100]);
  });

  test("healthy 99-row primary is validated before slicing and stays primary", async () => {
    const full = { ...leaderboard(), rows: Array.from({ length: 99 }, (_, i) => ({
      rank: i + 1, userAddress: id(i + 2), onChainPoints: String(1000 - i), offChainXp: null, updatedAtMs: "1",
    })) };
    const analyticsReader = reader({ ...summary(), onChainPoints: "1000", updatedAtMs: "1" }, full);
    const fail = async (): Promise<never> => { throw new Error("unexpected chain read"); };
    const result = await readJitterRewardLeaderboard({ ...input, analyticsReader, limit: 10 }, { getLiquidlinkLeaderboard: fail });
    expect(result).toMatchObject({ source: "redis", fallback: false });
    expect(result.rows).toEqual(full.rows.slice(0, 10));
    expect((await readJitterRewardSummary({ ...input, analyticsReader }, { getLiquidlinkScoreInfo: fail })).fallback).toBe(false);
    full.rows[98]!.rank = 1;
    expect((await readJitterRewardLeaderboard({ ...input, analyticsReader, limit: 10 }, deps)).fallback).toBe(true);
  });

  for (const badCount of [null, { ...leaderboard(), rows: [] }, { ...leaderboard(), source: "unavailable" },
    { ...leaderboard(), projectId: id(9) }, { ...leaderboard(), rows: [{ ...leaderboard().rows[0], rank: 2 }] }]) {
    test(`summary rejects unavailable or invalid population probe: ${JSON.stringify(badCount)}`, async () => {
      expect(await readJitterRewardSummary({ ...input, analyticsReader: reader(summary(), badCount) }, deps))
        .toMatchObject({ source: "contract", fallback: true, rank: null });
    });
  }

  test("summary and population probe run concurrently under one primary deadline", async () => {
    let resolveSummary!: (value: RewardSummaryResult) => void;
    let resolveLeaderboard!: (value: RewardLeaderboardResult) => void;
    const summaryPromise = new Promise<RewardSummaryResult>((resolve) => { resolveSummary = resolve; });
    const leaderboardPromise = new Promise<RewardLeaderboardResult>((resolve) => { resolveLeaderboard = resolve; });
    let summaryStarted = false;
    let leaderboardStarted = false;
    const finish = () => {
      if (summaryStarted && leaderboardStarted) { resolveSummary(summary()); resolveLeaderboard(leaderboard()); }
    };
    const analyticsReader = {
      getRewardSummary: () => { summaryStarted = true; finish(); return summaryPromise; },
      getRewardLeaderboard: ({ limit }: { limit?: number }) => {
        expect(limit).toBe(100); leaderboardStarted = true; finish(); return leaderboardPromise;
      },
    };
    const fail = async (): Promise<never> => { throw new Error("sequential primary lookups"); };
    expect((await readJitterRewardSummary({ ...input, analyticsReader }, { timeoutMs: 50, getLiquidlinkScoreInfo: fail })).fallback).toBe(false);
  });

  test("throwing or hung population probe cannot preserve an unverified primary rank", async () => {
    for (const getRewardLeaderboard of [async (): Promise<never> => { throw new Error("offline"); }, () => new Promise<never>(() => {})]) {
      expect(await readJitterRewardSummary({ ...input, analyticsReader: { ...reader(), getRewardLeaderboard } }, { ...deps, timeoutMs: 5 }))
        .toMatchObject({ source: "contract", fallback: true, rank: null });
    }
  });

  test("requests above 100 retain the caller limit on the primary", async () => {
    const analyticsReader = reader();
    analyticsReader.getRewardLeaderboard = async ({ limit }) => { expect(limit).toBe(1000); return leaderboard(); };
    expect((await readJitterRewardLeaderboard({ ...input, analyticsReader, limit: 1000 }, deps)).fallback).toBe(false);
  });

  for (const patch of [{ projectId: id(9) }, { userAddress: id(9) }, { source: "unavailable" },
    { source: "contract" }, { onChainPoints: "-1" }, { onChainPoints: 12 }, { onChainPoints: "1.1" },
    { offChainXp: "-3" }, { rank: 0 }, { rank: 1.5 }, { updatedAtMs: "bad" }]) {
    test(`invalid summary falls back: ${JSON.stringify(patch)}`, async () => {
      const result = await readJitterRewardSummary({ ...input, analyticsReader: reader({ ...summary(), ...patch }) }, deps);
      expect(result).toEqual({ projectId: id(1), userAddress: id(2), source: "contract", fallback: true,
        onChainPoints: "80", offChainXp: null, rank: null, updatedAtMs: "12" });
    });
  }

  for (const bad of [null, {}, { ...leaderboard(), projectId: id(9) }, { ...leaderboard(), source: "unavailable" },
    { ...leaderboard(), rows: [{ ...leaderboard().rows[0], rank: 2 }] },
    { ...leaderboard(), rows: [{ ...leaderboard().rows[0], userAddress: "bad" }] },
    { ...leaderboard(), rows: [{ ...leaderboard().rows[0], onChainPoints: "-1" }] },
    { ...leaderboard(), rows: [...leaderboard().rows, { ...leaderboard().rows[0], rank: 2 }] }]) {
    test(`invalid leaderboard falls back: ${JSON.stringify(bad)}`, async () => {
      expect(await readJitterRewardLeaderboard({ ...input, analyticsReader: reader(summary(), bad) }, deps))
        .toMatchObject({ source: "contract", fallback: true, rows: [{ onChainPoints: "80", rank: 1 }] });
    });
  }

  test("absent, throwing and hung primaries all use chain; hung chain rejects", async () => {
    const hang = () => new Promise<never>(() => {});
    const fail = async (): Promise<never> => { throw new Error("offline"); };
    for (const analyticsReader of [undefined, { getRewardSummary: fail, getRewardLeaderboard: fail },
      { getRewardSummary: hang, getRewardLeaderboard: hang }]) {
      expect((await readJitterRewardSummary({ ...input, analyticsReader }, { ...deps, timeoutMs: 5 })).fallback).toBe(true);
      expect((await readJitterRewardLeaderboard({ ...input, analyticsReader }, { ...deps, timeoutMs: 5 })).fallback).toBe(true);
    }
    await expect(readJitterRewardSummary(input, { getLiquidlinkScoreInfo: fail })).rejects.toThrow("offline");
    await expect(readJitterRewardSummary(input, { getLiquidlinkScoreInfo: hang, chainTimeoutMs: 5 })).rejects.toThrow("timed out");
    await expect(readJitterRewardLeaderboard(input, { getLiquidlinkLeaderboard: hang, chainTimeoutMs: 5 })).rejects.toThrow("timed out");
  });

  test("primary and chain have independent deadlines", async () => {
    const hang = () => new Promise<never>(() => {});
    const delayed = async () => { await new Promise((resolve) => setTimeout(resolve, 20)); return score; };
    const result = await readJitterRewardSummary({ ...input, analyticsReader: { getRewardSummary: hang, getRewardLeaderboard: hang } },
      { getLiquidlinkScoreInfo: delayed, timeoutMs: 5, chainTimeoutMs: 100 });
    expect(result.fallback).toBe(true);
  });

  test("confirmed missing score is zero, not a fabricated rank or XP", async () => {
    const result = await readJitterRewardSummary(input, { getLiquidlinkScoreInfo: async () => ({ ...score, exists: false, unconvertedScore: 0n, updatedAtMs: 0n }) });
    expect(result).toMatchObject({ source: "contract", fallback: true, onChainPoints: "0", offChainXp: null, rank: null, updatedAtMs: null });
  });

  test("legacy scoreboard config works and disabled or missing scoreboard rejects", async () => {
    expect((await readJitterRewardSummary({ ...input, config: { ...config, liquidlink: undefined, liquidlinkScoreboardObjectId: id(1) } }, deps)).projectId).toBe(id(1));
    await expect(readJitterRewardSummary({ ...input, config: { ...config, liquidlink: { enabled: false } } }, deps)).rejects.toThrow("Scoreboard");
    await expect(readJitterRewardLeaderboard({ ...input, limit: NaN }, deps)).rejects.toThrow("limit");
  });
});
