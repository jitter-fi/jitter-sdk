import { describe, expect, test } from "bun:test";
import type { ClientWithCoreApi } from "@mysten/sui/client";

import {
  normalizeSuiGrpcPageSize,
  withSafeSuiGrpcPagination,
} from "../infrastructure/sui-grpc-pagination.js";

describe("Sui gRPC pagination", () => {
  test("preserves ledger services, network identity and bound client methods", () => {
    class Client {
      #network = "mainnet";
      core = {};
      ledgerService = { batchGetTransactions() {} };
      get network() {
        return this.#network;
      }
      identify() {
        return this.#network;
      }
    }
    const client = new Client(),
      safe = withSafeSuiGrpcPagination(client as Client & ClientWithCoreApi);
    expect(safe.ledgerService).toBe(client.ledgerService);
    expect(safe.network).toBe("mainnet");
    expect(safe.identify()).toBe("mainnet");
  });
  test("normalizes every request to the public gRPC page boundary", () => {
    expect(normalizeSuiGrpcPageSize()).toBe(50);
    expect(normalizeSuiGrpcPageSize(100)).toBe(50);
    expect(normalizeSuiGrpcPageSize(17.9)).toBe(17);
    expect(normalizeSuiGrpcPageSize(0)).toBe(1);
  });

  test("adds a safe default to transaction resolver list calls", async () => {
    const calls: Array<Record<string, unknown>> = [];
    const client = {
      core: {
        async listCoins(options: Record<string, unknown>) {
          calls.push(options);
          return { objects: [], cursor: null, hasNextPage: false };
        },
      },
    };

    const safe = withSafeSuiGrpcPagination(
      client as unknown as ClientWithCoreApi,
    );
    await safe.core.listCoins({ owner: "0x1", limit: 100 });
    await safe.core.listCoins({ owner: "0x1" });

    expect(calls.map((call) => call.limit)).toEqual([50, 50]);
  });
});
