import { Action } from '@ngrx/store';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum UIActionTypes {
    TOGGLE_LOADING_BAR = '[UI] TOGGLE_LOADING_BAR',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 */
export class ToggleLoadingBar implements Action {
    readonly type = UIActionTypes.TOGGLE_LOADING_BAR;

    constructor(public payload: boolean | null ) { }
}



/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type UIActions
                = ToggleLoadingBar;
