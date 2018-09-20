
import { TableInfo, OrderType } from './table-helpers';
import { RedisNode } from './redis-node';

export enum DataType {
  string = 'string', list = 'list', set = 'set', hashmap = 'hashmap', sortedset = 'sortedset'
}
export interface AddKeyModel {
  key: string;
  isSubKey: boolean;
  type: DataType;
  values: {
    string: string,
    list: Array<string>,
    hashmap: Map<string, string>,
    sortedset: Map<string, number>,
  };
}
/**
 * add server model
 */
export interface ConnectServerModel {
    name: string;
    ip: string;
    port: number;
    password: string;
    db: number;
  }

/**
 * redis instance model
 */
export class RedisInstance {
  status = 'new';
  searchQuery = '';
  working = false;
  serverModel: ConnectServerModel;
  tree: RedisNode[];
  selectedNodeKey: string;
  expandedNodeKeys: string[] = [];
  rootSelected = true;
  id = '';
  expanded = false;
  info: TableInfo<RedisInfo> = {
    entities: [],
    pageIndex: 0,
    pageSize: 20,
    totalCount: 0,
    orderableColumns: ['key', 'value'],
    displayedColumns: ['key', 'value', 'actions'],
    displayedActions: [],
    searchQuery: null,
    order: null,
    orderType: OrderType.None,
  };
}
/**
 * Key value model for Redis Information
 */
export interface RedisInfo {
  key: string;
  value: string;
}
