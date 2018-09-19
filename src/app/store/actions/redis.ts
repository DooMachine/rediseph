import { Action } from '@ngrx/store';
import { RedisInstance, ConnectServerModel } from '../../models/redis';
import { RedisNode } from '../../models/redis-node';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum RedisActionTypes {
    CONNECT_REDIS_INSTANCE = '[Redis] CONNECT_REDIS_INSTANCE',
    CONNECT_REDIS_INSTANCE_SUCCESS = '[Redis] CONNECT_REDIS_INSTANCE_SUCCESS',
    CONNECT_REDIS_INSTANCE_FAIL = '[Redis] CONNECT_REDIS_INSTANCE_FAIL',

    REDIS_INSTANCE_UPDATED = '[Redis] REDIS_INSTANCE_UPDATED',

    EXECUTE_COMMAND = '[Redis] EXECUTE_COMMAND',
    SET_SEARCH_QUERY = '[Redis] SET_SEARCH_QUERY',


    SHOW_ROOT_INFO = '[Redis] SHOW_ROOT_INFO',
    SET_SELECTED_NODE = '[Redis] SET_SELECTED_NODE',
    SET_SELECTED_REDIS_INDEX = '[Redis] SET_SELECTED_REDIS_INDEX',
    EXPAND_TOGGLE_NODE = '[Redis] EXPAND_TOGGLE_NODE',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 */
/**
 * Action for adding new redis instance to store
 */
export class ConnectRedisInstance implements Action {
    readonly type = RedisActionTypes.CONNECT_REDIS_INSTANCE;

    constructor(public payload: ConnectServerModel) { }
}

export class ConnectRedisInstanceSuccess implements Action {
    readonly type = RedisActionTypes.CONNECT_REDIS_INSTANCE_SUCCESS;

    constructor(public payload: any) { }
}
export class ConnectRedisInstanceFail implements Action {
    readonly type = RedisActionTypes.CONNECT_REDIS_INSTANCE_FAIL;

    constructor(public payload: RedisInstance) { }
}

export class RedisInstanceUpdated implements Action {
    readonly type = RedisActionTypes.REDIS_INSTANCE_UPDATED;

    constructor(public payload: any) { }
}
export class SetSearchQuery implements Action {
    readonly type = RedisActionTypes.SET_SEARCH_QUERY;

    constructor(public payload: {query: string, redis: RedisInstance}) { }
}
export class SetSelectedNode implements Action {
    readonly type = RedisActionTypes.SET_SELECTED_NODE;

    constructor(public payload: {redis: RedisInstance, node: RedisNode}) { }
}

export class ShowRootInfo implements Action {
    readonly type = RedisActionTypes.SHOW_ROOT_INFO;

    constructor(public payload: RedisInstance) { }
}
export class SetSelectedRedisIndex implements Action {
    readonly type = RedisActionTypes.SET_SELECTED_REDIS_INDEX;

    constructor(public payload: number) { }
}
export class ExpandToggleNode implements Action {
    readonly type = RedisActionTypes.EXPAND_TOGGLE_NODE;

    constructor(public payload: {redis: RedisInstance, node: RedisNode}) { }
}
/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type RedisActions
                        = ConnectRedisInstance
                        | ConnectRedisInstanceSuccess
                        | ConnectRedisInstanceFail
                        | RedisInstanceUpdated
                        | SetSelectedNode
                        | ShowRootInfo
                        | SetSearchQuery
                        | SetSelectedRedisIndex
                        | ExpandToggleNode;
