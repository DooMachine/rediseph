import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as keyActions from '../actions/selectedkey';
import { SelectedKeyInfoHost } from '../../models/redis';

/**
 * State to keep SelectedKeyInfoHosts
 */
export interface State extends EntityState<SelectedKeyInfoHost> {
    selectedInstanceIndex: number;
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
    selectedInstanceIndex: null
});
/**
 * Reducer for SelectedKeyInfoHost Store
 * @param state state
 * @param action action
 */
export function reducer(state = initialState, action: keyActions.SelectedKeyActions): State {
    switch (action.type) {
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY_HOST: {
            const newhost: SelectedKeyInfoHost = {redisId : action.payload.redisId, keyInfos: []};
            return adapter.addOne(newhost, state);
        }
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY: {
            return {...state, isLoading: true};
        }
        case keyActions.SelectedKeyActionTypes.ADD_SELECTED_KEY_SUCCESS: {
            const prev = state.entities[action.payload.redisId];
            const newKeyInfo = Object.assign({}, prev);
            newKeyInfo.keyInfos.push(action.payload.selectedKeyInfo);
            return adapter.upsertOne(newKeyInfo, state);
        }
        default:
            return state;
    }
}


