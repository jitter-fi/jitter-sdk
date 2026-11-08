import type { ClientWithCoreApi } from "@mysten/sui/client";

export const SUI_GRPC_MAX_PAGE_SIZE = 50;

export function normalizeSuiGrpcPageSize(limit?: number): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return SUI_GRPC_MAX_PAGE_SIZE;
  }

  return Math.min(SUI_GRPC_MAX_PAGE_SIZE, Math.max(1, Math.trunc(limit)));
}

/** Keep transaction resolver list calls within the public gRPC boundary. */
export function withSafeSuiGrpcPagination<T extends ClientWithCoreApi>(
  client: T,
): T {
  const paginatedMethods = new Set([
    "listCoins",
    "listOwnedObjects",
    "listDynamicFields",
  ]);

  const core = new Proxy(client.core, {
    get(target, property) {
      const value = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;

      if (typeof property === "string" && paginatedMethods.has(property)) {
        return (options: Record<string, unknown>) =>
          Reflect.apply(value, target, [
            {
              ...options,
              limit: normalizeSuiGrpcPageSize(
                typeof options.limit === "number" ? options.limit : undefined,
              ),
            },
          ]);
      }

      return value.bind(target);
    },
  });

  return new Proxy(client, {
    get(target, property) {
      if (property === "core") return core;
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
