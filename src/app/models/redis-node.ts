import { NodeSetTableInfo } from './table-helpers';

/**
 * Redis nodes host model
 */
export interface RedisNodeHost {
    redisInstanceId: string;
    selectedNodeKey: string | null;
    expandedNodeKeys: string[] | null;
    children: Array<any> | null;
}
/**
 * Tree node model of children
 */
export interface RedisNode {
    type: string;
    key: string;
    depth: number;
    len: number;
    value: any | NodeSetTableInfo | null;
    children: Array<RedisNode> | null;
}
/**
 * the backend type to frontend type map
 */
export const TYPE_MAP = {
    string: 'String',
    list: 'List',
    set: 'Set',
    zset: 'Ordered Set',
    hash: 'Hash Map',
  };
