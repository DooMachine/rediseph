import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as keyActions from '../actions/selectedkey';
import { SelectedKeyInfoHost } from '../../models/redis';
import { buildEntityModel } from '../../utils/redisutils';

/**
 * State to keep SelectedKeyInfoHosts
 */
export interface State extends EntityState<SelectedKeyInfoHost> {
    isLoading: boolean;
}
/**
 * Entity adapter for SelectedKeyInfoHost State
 */
export const adapter: EntityAdapter<SelectedKeyInfoHost> = createEntityAdapter<SelectedKeyInfoHost>({
  selectId: (keyInfo: SelectedKeyInfoHost) => keyInfo.redisId,
  sortComparer: false
});
/**
 * Initial state factory for SelectedKeyInfoHost
 */
export const initialState: State = adapter.getInitialState({
    isLoading: false,
});
/**
 * Reducer for SelectedKeyInfoHost Store
 * @param state state
 * @param action action
 */
export function reducer(state = initialState, action: keyActions.SelectedKeyActions): State {
    switch (action.type) {
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY_HOST: {
            const newhost: SelectedKeyInfoHost = {redisId : action.payload.redisId,
                 keyInfos: action.payload.selectedKeys, selectedTabIndex: 0 };
            return adapter.addOne(newhost, state);
        }
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY: {
            return {...state, isLoading: true};
        }
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY_SUCCESS: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            if (action.payload.selectedKeyInfo.type !== 'string') {
                action.payload.selectedKeyInfo.keyScanInfo.entities = buildEntityModel(action.payload.selectedKeyInfo);
            }
            newKeyInfo.keyInfos.push(action.payload.selectedKeyInfo);
            return adapter.updateOne({id: action.payload.redisId,
                 changes: {keyInfos: newKeyInfo.keyInfos, selectedTabIndex: newKeyInfo.keyInfos.length - 1 }}, state);
        }
        case keyActions.SelectedKeyActionTypes.REMOEVE_SELECTED_KEY_SUCCESS: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            newKeyInfo.keyInfos = action.payload.updatedKeys;
            newKeyInfo.selectedTabIndex = prev.selectedTabIndex;
            return adapter.updateOne({id: action.payload.redisId,
                changes: {keyInfos: newKeyInfo.keyInfos, selectedTabIndex: newKeyInfo.selectedTabIndex - 1 }}, state);
        }
        case keyActions.SelectedKeyActionTypes.CHANGE_TAB_INDEX: {
            return adapter.updateOne({id: action.payload.redisId,
                changes: {selectedTabIndex: action.payload.index}}, state);
        }
        default:
            return state;
    }
}


