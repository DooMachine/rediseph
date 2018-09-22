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
                 keyInfos: action.payload.selectedKeys, selectedTabIndexKey: '' };
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
            console.log(newKeyInfo.keyInfos.length);
            return adapter.updateOne({id: action.payload.redisId,
                 changes: {keyInfos: newKeyInfo.keyInfos, selectedTabIndexKey: action.payload.selectedKeyInfo.key }}, state);
        }
        case keyActions.SelectedKeyActionTypes.REMOEVE_SELECTED_KEY_SUCCESS:
        {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            newKeyInfo.keyInfos = newKeyInfo.keyInfos.filter(p => p.key !== action.payload.key);
            // if selected tab closes change index to previous key.
            if (prev.selectedTabIndexKey === action.payload.key) {
                const keyIndex = prev.keyInfos.findIndex(p => p.key === action.payload.key);
                if (keyIndex !== 0) {
                    newKeyInfo.selectedTabIndexKey = newKeyInfo.keyInfos[keyIndex - 1].key;
                } else {
                    newKeyInfo.selectedTabIndexKey = '';
                }
            } else {
                newKeyInfo.selectedTabIndexKey = prev.selectedTabIndexKey;
            }
            return adapter.updateOne({id: action.payload.redisId,
                changes: {keyInfos: newKeyInfo.keyInfos, selectedTabIndexKey: newKeyInfo.selectedTabIndexKey }}, state);
        }
        case keyActions.SelectedKeyActionTypes.SELECTED_NODE_KEY_UPDATED: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            const keyInfo = action.payload.keyInfo;
            if (keyInfo.type !== 'string') {
                keyInfo.keyScanInfo.entities = buildEntityModel(keyInfo);
            }
            // If exist update if not add.
            if (newKeyInfo.keyInfos.findIndex(p => p.key === keyInfo.key) !== -1) {
                newKeyInfo.keyInfos = newKeyInfo.keyInfos.map((p) => {
                    if (p.key === action.payload.keyInfo.key) {
                        return keyInfo;
                    }
                    return p;
                });
            } else {
                newKeyInfo.keyInfos.push(keyInfo);
            }
            newKeyInfo.selectedTabIndexKey = prev.selectedTabIndexKey;
            return adapter.updateOne({id: action.payload.redisId,
                changes: {keyInfos: newKeyInfo.keyInfos, selectedTabIndexKey: prev.selectedTabIndexKey }}, state);
        }
        case keyActions.SelectedKeyActionTypes.CHANGE_TAB_INDEX_KEY: {
            const key = state.entities[action.payload.redisId].keyInfos[action.payload.index].key;
            return adapter.updateOne({id: action.payload.redisId,
                changes: {selectedTabIndexKey: key}}, state);
        }
        default:
            return state;
    }
}


