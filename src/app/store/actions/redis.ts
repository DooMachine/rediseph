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

    REFRESH_LOADED_KEYS = '[Redis] REFRESH_LOADED_KEYS',

    WATCH_CHANGES = '[Redis] WATCH_CHANGES',
    WATCHING_CHANGES= '[Redis] WATCHING_CHANGES',
    STOP_WATCH_CHANGES = '[Redis] STOP_WATCH_CHANGES',
    STOPPED_WATCH_CHANGES= '[Redis] STOPPED_WATCH_CHANGES',

    DISCONNECT_REDIS_INSTANCE = '[Redis] DISCONNECT_REDIS_INSTANCE',
    DISCONNECT_REDIS_INSTANCE_SUCCESS = '[Redis] DISCONNECT_REDIS_INSTANCE_SUCCESS',

    REDIS_INSTANCE_UPDATED = '[Redis] REDIS_INSTANCE_UPDATED',
    LOAD_NEXT_PAGE= '[Redis] LOAD_NEXT_PAGE',

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

export class RefreshLoadedKeys implements Action  {
    readonly type = RedisActionTypes.REFRESH_LOADED_KEYS;

    constructor(public payload: RedisInstance) { }
}
export class WatchChanges implements Action {
    readonly type = RedisActionTypes.WATCH_CHANGES;

    constructor(public payload: RedisInstance) { }
}
export class WatchingChanges implements Action {
    readonly type = RedisActionTypes.WATCHING_CHANGES;

    constructor(public payload: number) { }
}
export class StopWatchChanges implements Action {
    readonly type = RedisActionTypes.STOP_WATCH_CHANGES;

    constructor(public payload: RedisInstance) { }
}

export class StoppedWatchChanges implements Action {
    readonly type = RedisActionTypes.STOPPED_WATCH_CHANGES;

    constructor(public payload: number) { }
}
export class DisconnectRedisInstance implements Action {
    readonly type = RedisActionTypes.DISCONNECT_REDIS_INSTANCE;

    constructor(public payload: ConnectServerModel) { }
}
export class DisconnectRedisInstanceSuccess implements Action {
    readonly type = RedisActionTypes.DISCONNECT_REDIS_INSTANCE_SUCCESS;

    constructor(public payload: string) { }
}
export class RedisInstanceUpdated implements Action {
    readonly type = RedisActionTypes.REDIS_INSTANCE_UPDATED;

    constructor(public payload: any) { }
}

export class LoadNextPage implements Action {
    readonly type = RedisActionTypes.LOAD_NEXT_PAGE;

    constructor(public payload: RedisInstance) { }
}
export class ExecuteCommand implements Action {
    readonly type = RedisActionTypes.EXECUTE_COMMAND;

    constructor(public payload: {command: Array<string>, redisId: string}) { }
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
                        | ExecuteCommand
                        | ShowRootInfo
                        | SetSearchQuery
                        | SetSelectedRedisIndex
                        | ExpandToggleNode
                        | DisconnectRedisInstance
                        | DisconnectRedisInstanceSuccess
                        | WatchChanges
                        | WatchingChanges
                        | StopWatchChanges
                        | StoppedWatchChanges
                        | LoadNextPage;
