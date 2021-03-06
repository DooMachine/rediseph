import { Action } from '@ngrx/store';
import { SelectedKeyInfo } from 'src/app/models/redis';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum SelectedKeyActionTypes {
    ADD_SELECTED_KEY_HOST= '[SelectedKey] ADD_SELECTED_KEY_HOST',

    ADD_SELECTED_KEY = '[SelectedKey] ADD_SELECTED_KEY',
    ADD_SELECTED_KEY_SUCCESS = '[SelectedKey] ADD_SELECTED_KEY_SUCCESS',

    REMOEVE_SELECTED_KEY = '[SelectedKey] REMOEVE_SELECTED_KEY',
    REMOEVE_SELECTED_KEY_SUCCESS = '[SelectedKey] REMOEVE_SELECTED_KEY_SUCCESS',

    EXECUTE_QUERY_ON_SELECTED_KEY = '[SelectedKey] EXECUTE_QUERY_ON_SELECTED_KEY',

    ENTITY_PAGINATION_CHANGED = '[SelectedKey] ENTITY_PAGINATION_CHANGED',

    SELECTED_NODE_KEY_UPDATED = '[SelectedKey] SELECTED_NODE_KEY_UPDATED',
    SELECTED_KEYS_UPDATED = '[SelectedKey] SELECTED_KEYS_UPDATED',

    CHANGE_TAB_INDEX_KEY = '[SelectedKe] CHANGE_TAB_INDEX_KEY',

    SET_SELECTED_ENTITY_INDEX = '[SelectedKe] SET_SELECTED_ENTITY_INDEX',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 */
export class AddSelectedKeyHost implements Action {
    readonly type = SelectedKeyActionTypes.ADD_SELECTED_KEY_HOST;

    constructor(public payload: {redisId: string, selectedKeys: Array<SelectedKeyInfo>}) { }
}

export class AddSelectedKey implements Action {
    readonly type = SelectedKeyActionTypes.ADD_SELECTED_KEY;

    constructor(public payload: {selectedKeyInfo: SelectedKeyInfo, redisId: string}) { }
}

export class AddSelectedKeySuccess implements Action {
    readonly type = SelectedKeyActionTypes.ADD_SELECTED_KEY_SUCCESS;

    constructor(public payload: {selectedKeyInfo: SelectedKeyInfo, redisId: string}) { }
}

export class RemoveSelectedKey implements Action {
    readonly type = SelectedKeyActionTypes.REMOEVE_SELECTED_KEY;

    constructor(public payload: {selectedKeyInfo: SelectedKeyInfo, redisId: string}) { }
}


export class RemoveSelectedKeySuccess implements Action {
    readonly type = SelectedKeyActionTypes.REMOEVE_SELECTED_KEY_SUCCESS;

    constructor(public payload: {key: string, redisId: string}) { }
}

export class ExecuteQueryOnSelectedKey implements Action {
    readonly type = SelectedKeyActionTypes.EXECUTE_QUERY_ON_SELECTED_KEY;

    constructor(public payload: {command: any, redisId: string}) { }
}
export class EntityPaginationChanged implements Action {
    readonly type = SelectedKeyActionTypes.ENTITY_PAGINATION_CHANGED;

    constructor(public payload: {pageIndex: number | null, pageSize: number | null, pattern: null | string, redisId: string}) { }
}

export class SelectedNodeKeyUpdated implements Action {
    readonly type = SelectedKeyActionTypes.SELECTED_NODE_KEY_UPDATED;

    constructor(public payload: {keyInfo: SelectedKeyInfo, redisId: string}) { }
}
export class SelectedKeysUpdated implements Action {
    readonly type = SelectedKeyActionTypes.SELECTED_KEYS_UPDATED;

    constructor(public payload: {selectedKeyInfo: Array<SelectedKeyInfo>, redisId: string}) { }
}

export class ChangeTabIndexKey implements Action {
    readonly type = SelectedKeyActionTypes.CHANGE_TAB_INDEX_KEY;

    constructor(public payload: {redisId: string, index: number | string}) { }
}
export class SetSelectedEntityIndex implements Action {
    readonly type = SelectedKeyActionTypes.SET_SELECTED_ENTITY_INDEX;

    constructor(public payload: {redisId: string, key: string, index: number}) { }
}
/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type SelectedKeyActions
                        = AddSelectedKeyHost
                        | AddSelectedKey
                        | AddSelectedKeySuccess
                        | RemoveSelectedKey
                        | SelectedNodeKeyUpdated
                        | SelectedKeysUpdated
                        | RemoveSelectedKeySuccess
                        | ChangeTabIndexKey
                        | SetSelectedEntityIndex
                        | EntityPaginationChanged
                        | ExecuteQueryOnSelectedKey;
