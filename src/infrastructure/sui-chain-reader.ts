import {
  getPoolState as queryPoolState,
  getPoolVolumeStats as queryPoolVolumeStats,
  getPyState as queryPyState,
} from "../queries.js";
import { getSuiGrpcClient, grpcRequest, type GrpcNetworkKind } from "../rpc.js";
import type {
  CoinBalanceQuery,
  DynamicFieldObjectQuery,
  JitterChainReader,
  OwnedObjectQuery,
  PoolVolumeStatsSnapshot,
  ChainObjectInfo,
  DynamicFieldPage,
} from "../ports/chain-reader.js";
import type {
  JitterMarketConfig,
  PoolFields,
  PyStateFields,
} from "../types.js";

export type SuiJitterChainReaderDelegates = {
  getObjectInfo?: <T>(
    network: GrpcNetworkKind,
    objectId: string,
  ) => Promise<ChainObjectInfo<T>>;
  getDynamicFieldPage?: <T>(
    network: GrpcNetworkKind,
    query: DynamicFieldObjectQuery,
  ) => Promise<DynamicFieldPage<T>>;
  getObject?: <TFields>(
    network: GrpcNetworkKind,
    objectId: string,
  ) => Promise<TFields>;
  getPoolState?: (
    network: GrpcNetworkKind,
    config: JitterMarketConfig,
  ) => Promise<PoolFields>;
  getPyState?: (
    network: GrpcNetworkKind,
    config: JitterMarketConfig,
  ) => Promise<PyStateFields>;
  getPoolVolumeStats?: (
    network: GrpcNetworkKind,
    config: JitterMarketConfig,
  ) => Promise<PoolVolumeStatsSnapshot>;
  getOwnedObjects?: <TFields>(
    network: GrpcNetworkKind,
    query: OwnedObjectQuery,
  ) => Promise<TFields[]>;
  getCoinBalance?: (
    network: GrpcNetworkKind,
    query: CoinBalanceQuery,
  ) => Promise<bigint>;
  getDynamicFieldObjects?: <TFields>(
    network: GrpcNetworkKind,
    query: DynamicFieldObjectQuery,
  ) => Promise<TFields[]>;
};

export class SuiJitterChainReader implements JitterChainReader {
  constructor(
    private readonly network: GrpcNetworkKind,
    private readonly delegates: SuiJitterChainReaderDelegates = {},
  ) {}

  getObjectInfo<T>(objectId: string): Promise<ChainObjectInfo<T>> {
    return (this.delegates.getObjectInfo ?? defaultGetObjectInfo)<T>(
      this.network,
      objectId,
    );
  }

  getDynamicFieldPage<T>(
    query: DynamicFieldObjectQuery,
  ): Promise<DynamicFieldPage<T>> {
    return (
      this.delegates.getDynamicFieldPage ?? defaultGetDynamicFieldPage
    )<T>(this.network, query);
  }

  getObject<TFields>(objectId: string): Promise<TFields> {
    const getObject = this.delegates.getObject ?? defaultGetObject;
    return getObject<TFields>(this.network, objectId);
  }

  getPoolState(config: JitterMarketConfig): Promise<PoolFields> {
    const getPoolState = this.delegates.getPoolState ?? queryPoolState;
    return getPoolState(this.network, config);
  }

  getPyState(config: JitterMarketConfig): Promise<PyStateFields> {
    const getPyState = this.delegates.getPyState ?? queryPyState;
    return getPyState(this.network, config);
  }

  getPoolVolumeStats(
    config: JitterMarketConfig,
  ): Promise<PoolVolumeStatsSnapshot> {
    const getPoolVolumeStats =
      this.delegates.getPoolVolumeStats ?? queryPoolVolumeStats;
    return getPoolVolumeStats(this.network, config);
  }

  getOwnedObjects<TFields>(query: OwnedObjectQuery): Promise<TFields[]> {
    const getOwnedObjects =
      this.delegates.getOwnedObjects ?? defaultGetOwnedObjects;
    return getOwnedObjects<TFields>(this.network, query);
  }

  getCoinBalance(query: CoinBalanceQuery): Promise<bigint> {
    const getCoinBalance =
      this.delegates.getCoinBalance ?? defaultGetCoinBalance;
    return getCoinBalance(this.network, query);
  }

  getDynamicFieldObjects<TFields>(
    query: DynamicFieldObjectQuery,
  ): Promise<TFields[]> {
    const getDynamicFieldObjects =
      this.delegates.getDynamicFieldObjects ?? defaultGetDynamicFieldObjects;
    return getDynamicFieldObjects<TFields>(this.network, query);
  }
}

async function defaultGetObjectInfo<T>(
  network: GrpcNetworkKind,
  objectId: string,
): Promise<ChainObjectInfo<T>> {
  const { object } = await getSuiGrpcClient(network).getObject({
    objectId,
    include: { json: true },
  });
  return typedObjectInfo<T>(object);
}

function typedObjectInfo<T>(object: {
  objectId: string;
  type: string;
  version: string;
  owner: unknown;
  json: unknown;
}): ChainObjectInfo<T> {
  if (!object.type || !object.json || object.version == null)
    throw new Error(`Missing typed object data: ${object.objectId}.`);
  return {
    objectId: object.objectId,
    type: object.type,
    version: object.version,
    owner: object.owner,
    fields: object.json as T,
  };
}

async function defaultGetDynamicFieldPage<T>(
  network: GrpcNetworkKind,
  query: DynamicFieldObjectQuery,
): Promise<DynamicFieldPage<T>> {
  const limit = query.limit ?? 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50)
    throw new Error("Dynamic field page size must be 1-50.");
  const client = getSuiGrpcClient(network);
  const page = await client.listDynamicFields({
    parentId: query.parentId,
    cursor: query.cursor,
    limit,
  });
  if (page.dynamicFields.length > limit)
    throw new Error("Dynamic field provider exceeded requested page size.");
  const requested = page.dynamicFields.map((field) => field.fieldId);
  if (new Set(requested).size !== requested.length)
    throw new Error("Duplicate dynamic field ID in page.");
  if (!requested.length)
    return {
      data: [],
      hasNextPage: page.hasNextPage,
      nextCursor: page.cursor ?? null,
    };
  const batch = await client.getObjects({
    objectIds: requested,
    include: { json: true },
  });
  if (batch.objects.length !== requested.length)
    throw new Error("Incomplete dynamic field object batch.");
  const byId = new Map<string, ChainObjectInfo<T>>();
  for (const item of batch.objects) {
    if (item instanceof Error) throw item;
    if (!requested.includes(item.objectId) || byId.has(item.objectId))
      throw new Error("Unexpected or duplicate object in dynamic field batch.");
    byId.set(item.objectId, typedObjectInfo<T>(item));
  }
  const data = requested.map((objectId) => {
    const item = byId.get(objectId);
    if (!item) throw new Error("Missing dynamic field object.");
    return item;
  });
  return {
    data,
    hasNextPage: page.hasNextPage,
    nextCursor: page.cursor ?? null,
  };
}

async function defaultGetObject<TFields>(
  network: GrpcNetworkKind,
  objectId: string,
): Promise<TFields> {
  const response = await grpcRequest<{
    data: { content: { fields: TFields } };
  }>(network, "getObject", [objectId, { showContent: true }]);
  return response.data.content.fields;
}

async function defaultGetOwnedObjects<TFields>(
  network: GrpcNetworkKind,
  query: OwnedObjectQuery,
): Promise<TFields[]> {
  const rows = new Map<string, TFields>();
  const cursors = new Set<string>();
  let cursor = query.cursor ?? null;
  if (cursor) cursors.add(cursor);
  do {
    const response = await grpcRequest<{
      data: Array<{ data: { objectId: string; content: { fields: TFields } } }>;
      hasNextPage: boolean;
      nextCursor?: string | null;
    }>(network, "listOwnedObjects", [query.owner, {
      filter: { StructType: query.structType }, options: { showContent: true },
    }, cursor, query.limit ?? 50]);
    for (const item of response.data) rows.set(item.data.objectId, item.data.content.fields);
    if (!response.hasNextPage) break;
    if (!response.nextCursor || cursors.has(response.nextCursor)) {
      throw new Error("Incomplete owned object pagination.");
    }
    cursor = response.nextCursor;
    cursors.add(cursor);
  } while (true);
  return [...rows.values()];
}

async function defaultGetCoinBalance(
  network: GrpcNetworkKind,
  query: CoinBalanceQuery,
): Promise<bigint> {
  const response = await grpcRequest<{
    balance?: {
      balance?: string;
      coinBalance?: string;
      addressBalance?: string;
    };
  }>(network, "getBalance", [query.owner, query.coinTypeTag]);
  const raw =
    response.balance?.balance ??
    response.balance?.coinBalance ??
    response.balance?.addressBalance ??
    "0";
  return BigInt(raw);
}

async function defaultGetDynamicFieldObjects<TFields>(
  network: GrpcNetworkKind,
  query: DynamicFieldObjectQuery,
): Promise<TFields[]> {
  const objectIds: string[] = [];
  let cursor = query.cursor ?? null;
  const limit = query.limit ?? 50;

  do {
    const response = await grpcRequest<{
      data: Array<{ objectId: string }>;
      nextCursor?: string | null;
      hasNextPage?: boolean;
    }>(network, "listDynamicFields", [query.parentId, cursor, limit]);

    objectIds.push(...response.data.map((field) => field.objectId));
    cursor = response.hasNextPage ? (response.nextCursor ?? null) : null;
  } while (cursor);

  return Promise.all(
    objectIds.map((objectId) => defaultGetObject<TFields>(network, objectId)),
  );
}
