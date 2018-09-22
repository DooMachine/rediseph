import { Action } from '@ngrx/store';
import { SelectedKeyInfo } from 'src/app/models/redis';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum SelectedKeyActionTypes {
    ADD_SELECTED_KEY_HOST= '[SelectedKey] ADD_SELECTED_KEY_HOST',
    ADD_SELECTED_KEY = '[SelectedKey] ADD_SELECTED_KEY',
    ADD_SELECTED_KEY_SUCCESS = '[SelectedKey] ADD_SELECTED_KEY_SUCCESS'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 */
export class AddSelectedKeyHost implements Action {
    readonly type = SelectedKeyActionTypes.ADD_SELECTED_KEY_HOST;

    constructor(public payload: {redisId: string}) { }
}

export class AddSelectedKey implements Action {
    readonly type = SelectedKeyActionTypes.ADD_SELECTED_KEY;

    constructor(public payload: {selectedKeyInfo: SelectedKeyInfo, redisId: string}) { }
}

export class AddSelectedKeySuccess implements Action {
    readonly type = SelectedKeyActionTypes.ADD_SELECTED_KEY_SUCCESS;

    constructor(public payload: {selectedKeyInfo: SelectedKeyInfo, redisId: string}) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type SelectedKeyActions
                        = AddSelectedKeyHost
                        | AddSelectedKey
                        | AddSelectedKeySuccess;
