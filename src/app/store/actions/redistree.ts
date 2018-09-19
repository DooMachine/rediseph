import { Action } from '@ngrx/store';
import { RedisNodeHost } from '../../models/redis-node';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum RedisTreeActionTypes {
    ADD_REDIS_TREE = '[Redis Tree] ADD_REDIS_TREE',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 */
/**
 * Action for adding new redis instance to store
 */
export class AddRedisTree implements Action {
    readonly type = RedisTreeActionTypes.ADD_REDIS_TREE;

    constructor(public payload: RedisNodeHost) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type RedisTreeActions
                        = AddRedisTree;
