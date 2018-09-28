import { Action } from '@ngrx/store';
import { RedisCli } from '../../models/cli';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum CliActionTypes {
    ADD_NEW_CLI = '[Cli] ADD_NEW_CLI',
    TOGGLE_CLI = '[Cli] TOGGLE_CLI'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 */
export class AddNewCli implements Action {
    readonly type = CliActionTypes.ADD_NEW_CLI;

    constructor(public payload: RedisCli) { }
}

export class ToggleCli implements Action {
    readonly type = CliActionTypes.TOGGLE_CLI;

    constructor(public payload: {redisId: string, show: boolean | null}) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type CliActions
                        = AddNewCli
                        | ToggleCli;
