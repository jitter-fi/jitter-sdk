import { describe, expect, test } from "bun:test";
import { readGeneratedRewardLeaderboard, readGeneratedRewardOwner } from "../services/generated-reward-leaderboard.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const input = {
  network: "mainnet" as const,
  scoreboardId: id(1),
  configs: [],
  limit: 1000,
};
const row = (owner: string, settledPoints: string, pendingPoints: string) => ({
  owner,
  settledPoints,
  pendingPoints,
  updatedAtMs: "1000",
});
describe("generated rewards ranking", () => {
  test("owner reads simulate only that wallet and do not scan global scores or holdings", async () => {
    const result = await readGeneratedRewardOwner({...input,owner:id(2)}, {
      settled: async () => { throw Error("global scores must not be read"); },
      holders: async () => { throw Error("global holders must not be read"); },
      registered: async () => new Map([[id(2),[]],[id(3),[]]]),
      simulate: async owner => {
        expect(owner).toBe(id(2));
        return {...row(owner,"60","50"),tokenizedPoints:"40"};
      },
    });
    expect(result).toMatchObject({onChainPoints:"150",availableScoreboard:"60",settledPoints:"100",pendingPoints:"50",tokenizedPoints:"40",rank:null});
  });
  test("owner reads refuse incomplete holdings, mismatched owners and invalid amounts", async () => {
    for (const value of [row(id(3),"1","2"),row(id(2),"-1","2"),row(id(2),"1","2")]) {
      await expect(readGeneratedRewardOwner({...input,owner:id(2),trustedPointMarket:{pointTokenMarketId:id(9)}}, {
        settled: async () => [], registered: async () => new Map(), simulate: async () => value,
      })).rejects.toThrow();
    }
  });
  test("counts the holding mirror once, including asks, without making it spendable score", async () => {
    const deps = {
      settled: async () => [row(id(2), "100", "0")],
      registered: async () => new Map([[id(2), []]]),
      holders: async () => [id(2), id(3)],
      simulate: async (owner: string) => ({
        ...row(owner, owner === id(2) ? "60" : "0", "5"),
        tokenizedPoints: owner === id(2) ? "40" : "150",
      }),
    };
    const result = await readGeneratedRewardLeaderboard(input, deps);
    expect(result.rows.map(r => [r.userAddress, r.onChainPoints])).toEqual([
      [id(3), "155"], [id(2), "105"],
    ]);
    expect(result.rows[1]).toMatchObject({ settledPoints: "100", availableScoreboard: "60", tokenizedPoints: "40" });
    const restored = await readGeneratedRewardLeaderboard(input, {
      ...deps, simulate: async (owner: string) => ({ ...row(owner, owner === id(2) ? "100" : "150", "5"), tokenizedPoints: "0" }),
    });
    expect(restored.rows.map(r => r.onChainPoints)).toEqual(result.rows.map(r => r.onChainPoints));
  });
  test("fails closed when holding discovery fails", async () => {
    await expect(readGeneratedRewardLeaderboard(input, {
      settled: async () => [], registered: async () => new Map(),
      holders: async () => { throw Error("incomplete holdings"); },
      simulate: async () => row(id(2), "0", "0"),
    })).rejects.toThrow("incomplete holdings");
  });
  test("refreshes score owners even when their first tokenization races the holder roster", async () => {
    const board = await readGeneratedRewardLeaderboard(input, {
      settled: async () => [row(id(2), "60", "0")], registered: async () => new Map(), holders: async () => [],
      simulate: async owner => ({...row(owner, "60", "0"), tokenizedPoints: "40"}),
    });
    expect(board.rows[0]).toMatchObject({onChainPoints: "100", availableScoreboard: "60", tokenizedPoints: "40"});
  });
  test("a sale moves rank ownership, while mint, ask escrow, cancel and restore do not create points", async () => {
    for (const state of [
      {score: "100", seller: "0", buyer: "0"},
      {score: "60", seller: "40", buyer: "0"},
      {score: "60", seller: "0", buyer: "40"},
    ]) {
      const board = await readGeneratedRewardLeaderboard(input, {
        settled: async () => [], registered: async () => new Map(), holders: async () => [id(2), id(3)],
        simulate: async owner => ({...row(owner, owner === id(2) ? state.score : "0", "0"),
          tokenizedPoints: owner === id(2) ? state.seller : state.buyer}),
      });
      expect(board.rows.reduce((sum, r) => sum + BigInt(r.onChainPoints), 0n)).toBe(100n);
      expect(board.rows.find(r => r.userAddress === id(3))?.onChainPoints).toBe(state.buyer);
    }
  });
  test("includes registered holders without a Scoreboard row and ranks before slicing", async () => {
    const result = await readGeneratedRewardLeaderboard(
      { ...input, limit: 1 },
      {
        settled: async () => [row(id(2), "100", "0")],
        registered: async () => new Map([[id(3), []]]),
        simulate: async () => row(id(3), "0", "150"),
      },
    );
    expect(result.rows).toEqual([
      {
        rank: 1,
        userAddress: id(3),
        onChainPoints: "150",
        settledPoints: "0",
        pendingPoints: "150",
        availableScoreboard: "0",
        tokenizedPoints: "0",
        offChainXp: null,
        updatedAtMs: "1000",
      },
    ]);
    expect(result.scoreBasis).toBe("generated-v1");
  });
  test("replaces the settled baseline with the same-simulation total instead of double counting", async () => {
    const deps = {
      settled: async () => [row(id(2), "100", "0")],
      registered: async () => new Map([[id(2), []]]),
      simulate: async () => row(id(2), "110", "20"),
    };
    expect(
      (await readGeneratedRewardLeaderboard(input, deps)).rows[0]
        ?.onChainPoints,
    ).toBe("130");
    expect(
      (
        await readGeneratedRewardLeaderboard(input, {
          ...deps,
          simulate: async () => row(id(2), "130", "0"),
        })
      ).rows[0]?.onChainPoints,
    ).toBe("130");
  });
  test("has no 100-owner candidate cutoff and resolves ties deterministically", async () => {
    const settled = Array.from({ length: 120 }, (_, i) =>
      row(id(i + 2), "1", "0"),
    );
    const result = await readGeneratedRewardLeaderboard(input, {
      settled: async () => settled,
      registered: async () => new Map(),
      simulate: async () => {
        throw Error("unused");
      },
    });
    expect(result.rows).toHaveLength(120);
    expect(result.rows[119]?.rank).toBe(120);
  });
  test("does not turn an incomplete pending read into a healthy settled-only board", async () => {
    await expect(
      readGeneratedRewardLeaderboard(input, {
        settled: async () => [],
        registered: async () => new Map([[id(2), []]]),
        simulate: async () => {
          throw Error("paused or unavailable");
        },
      }),
    ).rejects.toThrow("paused or unavailable");
  });
  test("rejects negative or malformed raw points", async () => {
    await expect(
      readGeneratedRewardLeaderboard(input, {
        settled: async () => [row(id(2), "-1", "0")],
        registered: async () => new Map(),
        simulate: async () => row(id(2), "0", "0"),
      }),
    ).rejects.toThrow();
  });
});
