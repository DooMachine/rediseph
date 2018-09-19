import { RedisNode } from './redis-node';

/**
 * Used in State for storing Node Data
 */
export class NodeSetTableInfo {
    constructor(entities: Array<any>, node: RedisNode, pageSize: number = 20,  pageIndex: number= 0) {
        this.entities = entities;
        this.totalCount = node.len;
        this.displayedColumns = this.setDisplayedColumns(node.type);
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
    }
    nodeId: string;
    redisInstanceId: string;
    entities: Array<any> = null;
    pageSize: number;
    pageIndex: number;
    displayedColumns: Array<string> = null;
    displayedActions: Array<any> = [ { name: 'Delete', color: 'warn' }];
    totalCount: number | null;
    /**
     * Set the column names taht should displayed
     * @param type Type of Node
     */
    private setDisplayedColumns(type) {
        let cols;
        if (type === 'list' || type === 'set') {
            cols = ['index', 'value'];
        } else if (type === 'zset') {
            cols = ['index', 'value', 'score'];
        } else {
            cols = ['key', 'value'];
        }
        return [...cols, 'actions'];
    }
}
/**
 * Used in State for storing Redis Instance Info
 */
export interface TableInfo<T> {
    entities: Array<T>;
    pageSize: number;
    pageIndex: number;
    totalCount: number | null;
    displayedColumns: Array<string>;
    orderableColumns: Array<string>;
    displayedActions: Array<any>;
    searchQuery: string;
    order: string;
    orderType: OrderType;
}
/**
 * Enum for determining order for table
 */
export enum OrderType {
    Ascending, Descending, None
}
