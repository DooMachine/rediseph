import * as fromRedis from './redis';
import * as fromKeys from './selectedkey';
import * as fromCli from './cli';
import * as fromUi from './ui';

import { ActionReducerMap,
    ActionReducer, Action,
    MetaReducer,
    createSelector,
    createFeatureSelector
    } from '@ngrx/store';
import { environment } from 'src/environments/environment';
/**
 * Root State
 */
export interface State {
    redis: fromRedis.State;
    selectedKey: fromKeys.State;
    cli: fromCli.State;
    ui: fromUi.State;
}
/**
 * Root reducer
 */
export const reducers: ActionReducerMap<State> = {
    redis: fromRedis.reducer,
    selectedKey: fromKeys.reducer,
    cli: fromCli.reducer,
    ui: fromUi.reducer,
};

/**
 * middleware for resetting state
 * @param reducer reducer
 */
  export function clearState(reducer: ActionReducer<State>): ActionReducer<State> {
    return function(state: State, action: Action): State {
      if (action.type === 'CLEAR_STATE') {
        state = undefined;
      }
      return reducer(state, action);
    };
  }
  /**
   * Logger middleware for ngrx
   * @param reducer reducer
   */
  export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
    return function(state: State, action: Action): State {
        console.log('state', state);
        console.log('action', action);

        return reducer(state, action);
    };
  }
/**
 * Middleware reducers for Redis store
 */
export const metaReducers: MetaReducer<State>[] = environment.production ? [clearState] : [clearState, logger];

/**
 * Select root state for RedisStoreModule
 */
export const getFeatureState = createFeatureSelector<State>('redis');

export const getRedisState = createSelector(getFeatureState, state => state.redis);
export const getSelectedKeyState = createSelector(getFeatureState, state => state.selectedKey);
export const getCliState = createSelector(getFeatureState, state => state.cli);
export const getUiState = createSelector(getFeatureState, state => state.ui);

/**
 * Select All Redis
 */
export const {
    selectAll: selectAllRedisInstances,
} = fromRedis.adapter.getSelectors(getRedisState);

/**
 * Select All Selected Keys
 */
export const {
    selectAll: selectAllSelectedKeyHosts,
} = fromKeys.adapter.getSelectors(getSelectedKeyState);
/**
 * Select All Selected Keys
 */
export const {
    selectAll: selectAllCli,
} = fromCli.adapter.getSelectors(getCliState);

export const getSelectedRedisIndex = createSelector(getRedisState, state => state.selectedInstanceIndex);
export const getSelectedRedisId = createSelector(getRedisState, state => state.selectedInstanceId);
export const getUiLoading = createSelector(getUiState, state => state.isLoading);
