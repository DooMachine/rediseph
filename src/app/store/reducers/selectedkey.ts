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
            for (let i = 0; i < action.payload.selectedKeys.length; i++) {
                const sKey = action.payload.selectedKeys[i];
                if (sKey.type !== 'string') {
                    sKey.keyScanInfo.entities = buildEntityModel(sKey);
                }
            }
            action.payload.selectedKeys.map((kh) => {
                if (kh.keyScanInfo) {
                    kh.keyScanInfo.selectedEntityIndex = 0;
                }
            });
            const newhost: SelectedKeyInfoHost = {redisId : action.payload.redisId,
                 keyInfos: action.payload.selectedKeys, selectedKeyQueue: [], };
            return adapter.addOne(newhost, state);
        }
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY: {
            return {...state, isLoading: true};
        }
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY_SUCCESS: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            if (action.payload.selectedKeyInfo.type !== 'string') {
                action.payload.selectedKeyInfo.keyScanInfo.selectedEntityIndex = 0;
                action.payload.selectedKeyInfo.keyScanInfo.entities = buildEntityModel(action.payload.selectedKeyInfo);
                action.payload.selectedKeyInfo.keyScanInfo.hasMoreEntities =  action.payload.selectedKeyInfo.keyScanInfo.hasMoreEntities;
            }
            newKeyInfo.keyInfos.push(action.payload.selectedKeyInfo);
            newKeyInfo.selectedKeyQueue.push(action.payload.selectedKeyInfo.key);
            return adapter.updateOne({id: action.payload.redisId,
                 changes: {keyInfos: newKeyInfo.keyInfos,
                     selectedKeyQueue: newKeyInfo.selectedKeyQueue }}, state);
        }
        case keyActions.SelectedKeyActionTypes.REMOEVE_SELECTED_KEY_SUCCESS:
        {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            newKeyInfo.keyInfos = newKeyInfo.keyInfos.filter(p => p.key !== action.payload.key);
            // if selected tab closes change index to previous key.
            newKeyInfo.selectedKeyQueue = prev.selectedKeyQueue.filter(p => p !== action.payload.key);

            return adapter.updateOne({id: action.payload.redisId,
                changes: {keyInfos: newKeyInfo.keyInfos, selectedKeyQueue: newKeyInfo.selectedKeyQueue }}, state);
        }
        case keyActions.SelectedKeyActionTypes.SELECTED_NODE_KEY_UPDATED: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            const keyInfo = action.payload.keyInfo;
            if (keyInfo.type !== 'string') {
                keyInfo.keyScanInfo.entities = buildEntityModel(keyInfo);
                keyInfo.keyScanInfo.hasMoreEntities = action.payload.keyInfo.keyScanInfo.hasMoreEntities;
                if (keyInfo.keyScanInfo.entities) {
                    keyInfo.keyScanInfo.selectedEntityIndex = 0;
                }
            }
            // If exist update
            if (newKeyInfo.keyInfos.findIndex(p => p.key === keyInfo.key) !== -1) {
                newKeyInfo.keyInfos = newKeyInfo.keyInfos.map((p) => {
                    if (p.key === action.payload.keyInfo.key) {
                        // set previously selected entity
                        if (keyInfo.type !== 'string') {
                            keyInfo.keyScanInfo.selectedEntityIndex = p.keyScanInfo.selectedEntityIndex;
                        }
                        return keyInfo;
                    }
                    return p;
                });
                newKeyInfo.selectedKeyQueue = prev.selectedKeyQueue;
            } else { // if not add.
                keyInfo.keyScanInfo.selectedEntityIndex = 0;
                newKeyInfo.keyInfos.push(keyInfo);
                newKeyInfo.selectedKeyQueue.push(keyInfo.key);
            }
            return adapter.updateOne({id: action.payload.redisId,
                changes: {keyInfos: newKeyInfo.keyInfos, selectedKeyQueue: newKeyInfo.selectedKeyQueue }}, state);
        }
        case keyActions.SelectedKeyActionTypes.SELECTED_KEYS_UPDATED: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            const newkeyInfos = action.payload.selectedKeyInfo.map((keyInfo) => {
                if (keyInfo.type !== 'string') {
                    keyInfo.keyScanInfo.entities = buildEntityModel(keyInfo);
                    if (keyInfo.keyScanInfo.entities) {
                        keyInfo.keyScanInfo.selectedEntityIndex = 0;
                    }
                }
                if (newKeyInfo.keyInfos.findIndex(p => p.key === keyInfo.key) !== -1) {
                    newKeyInfo.keyInfos = newKeyInfo.keyInfos.map((p) => {
                        if (p.key === keyInfo.key) {
                            // set previously selected entity
                            if (keyInfo.type !== 'string') {
                                keyInfo.keyScanInfo.selectedEntityIndex = p.keyScanInfo.selectedEntityIndex;
                            }
                            return keyInfo;
                        }
                        return p;
                    });
                    newKeyInfo.selectedKeyQueue = prev.selectedKeyQueue;
                } else { // if not add.
                    keyInfo.keyScanInfo.selectedEntityIndex = 0;
                    newKeyInfo.keyInfos.push(keyInfo);
                    newKeyInfo.selectedKeyQueue.push(keyInfo.key);
                }
                return keyInfo;
            });
            return adapter.updateOne({id: action.payload.redisId,
                changes: {keyInfos: newkeyInfos, selectedKeyQueue: prev.selectedKeyQueue }}, state);
        }
        case keyActions.SelectedKeyActionTypes.CHANGE_TAB_INDEX_KEY: {
            const prevQueue = state.entities[action.payload.redisId].selectedKeyQueue;
            const newQueue = [...prevQueue];
            if (typeof(action.payload.index) === 'string') {
                newQueue.push(action.payload.index);
                return adapter.updateOne({id: action.payload.redisId,
                    changes: {selectedKeyQueue: newQueue}}, state);
            }
            const keyInfo = state.entities[action.payload.redisId].keyInfos[action.payload.index];
            const key = keyInfo ? keyInfo.key : '';
            newQueue.push(key);
            return adapter.updateOne({id: action.payload.redisId,
                changes: {selectedKeyQueue: newQueue}}, state);
        }
        case keyActions.SelectedKeyActionTypes.SET_SELECTED_ENTITY_INDEX:
        {
            const prev = state.entities[action.payload.redisId];
            const newInf = Object.assign({}, prev);
            newInf.keyInfos.map((p) => {
                if (p.key === action.payload.key) {
                    p.keyScanInfo.selectedEntityIndex = action.payload.index;
                }
            });
            return adapter.updateOne({id: action.payload.redisId, changes: {keyInfos: newInf.keyInfos}}, state);
        }
        default:
            return state;
    }
}


