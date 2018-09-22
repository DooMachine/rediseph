
import { TableInfo, OrderType } from './table-helpers';
import { RedisNode } from './redis-node';
import { environment } from '../../environments/environment';

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
  watching = false;
  working = false;
  isMonitoring = false;
  serverModel: ConnectServerModel;
  tree: RedisNode[];
  selectedNodeKey =  '';
  expandedNodeKeys = [];
  rootSelected = true;
  id = '';
  keyInfo = new KeyInfo();
  selectedKeyInfo = new SelectedKeyInfo();
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

export class KeyInfo {
    selectedKey = '';
    pattern = '' ;
    hasMoreKeys = true;
    previousCursors = [];
    cursor = '0';
    pageSize = environment.SCAN_PAGE_SIZE || 40;
    pageIndex: 0;
}

export class SelectedKeyInfoHost {
  keyInfos: Array<SelectedKeyInfo> = [];
  redisId: string;
}
export class SelectedKeyInfo {
    key: string = null;
    type: string = null;
    value: '';
    isMonitoring: false;
    keyScanInfo = {
        entities: [],
        cursor: '0',
        hasMoreEntities: true,
        previousCursors: [],
        pageIndex: 0,
        pageSize: environment.SCAN_PAGE_SIZE || 20,
        pattern: ''
    };
}
/**
 * Key value model for Redis Information
 */
export interface RedisInfo {
  key: string;
  value: string;
}
