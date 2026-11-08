import type {
  JitterMarketConfig,
  PoolFields,
  PyStateFields,
} from "../types.js";

export type OwnedObjectQuery = {
  owner: string;
  structType: string;
  cursor?: string | null;
  limit?: number;
};

export type DynamicFieldObjectQuery = {
  parentId: string;
  cursor?: string | null;
  limit?: number;
};

export type ChainObjectInfo<TFields = Record<string, unknown>> = {
  objectId: string;
  type: string;
  version: string;
  owner: unknown;
  fields: TFields;
};

export type DynamicFieldPage<TFields = Record<string, unknown>> = {
  data: ChainObjectInfo<TFields>[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type CoinBalanceQuery = {
  owner: string;
  coinTypeTag: string;
};

export type PoolVolumeStatsSnapshot = {
  volume24hSy: bigint;
  volume7dSy: bigint;
  totalFeesSy: bigint;
  swapCount24h: number;
  swapCount7d: number;
};

export interface JitterChainReader {
  getObjectInfo?<TFields>(objectId: string): Promise<ChainObjectInfo<TFields>>;
  getDynamicFieldPage?<TFields>(
    query: DynamicFieldObjectQuery,
  ): Promise<DynamicFieldPage<TFields>>;
  getObject<TFields>(objectId: string): Promise<TFields>;
  getPoolState(config: JitterMarketConfig): Promise<PoolFields>;
  getPyState(config: JitterMarketConfig): Promise<PyStateFields>;
  getPoolVolumeStats?(
    config: JitterMarketConfig,
  ): Promise<PoolVolumeStatsSnapshot>;
  getOwnedObjects<TFields>(query: OwnedObjectQuery): Promise<TFields[]>;
  getCoinBalance?(query: CoinBalanceQuery): Promise<bigint>;
  getDynamicFieldObjects<TFields>(
    query: DynamicFieldObjectQuery,
  ): Promise<TFields[]>;
}
