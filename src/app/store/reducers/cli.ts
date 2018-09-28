import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as cliActions from '../actions/cli';
import { RedisCli } from '../../models/cli';

/**
 * State to keep RedisClis
 */
export interface State extends EntityState<RedisCli> {
    isLoading: boolean;
}
/**
 * Entity adapter for RedisCli State
 */
export const adapter: EntityAdapter<RedisCli> = createEntityAdapter<RedisCli>({
  selectId: (keyInfo: RedisCli) => keyInfo.redisId,
  sortComparer: false
});
/**
 * Initial state factory for RedisCli
 */
export const initialState: State = adapter.getInitialState({
    isLoading: false,
});
/**
 * Reducer for RedisCli Store
 * @param state state
 * @param action action
 */
export function reducer(state = initialState, action: cliActions.CliActions): State {
    switch (action.type) {
        case cliActions.CliActionTypes.ADD_NEW_CLI:
        {
            action.payload.lines = [];
            for (let i = 0; i < 134; i++) {
                action.payload.lines.push('Line No' + i.toString());
            }
            return adapter.addOne(action.payload, state);
        }
        case cliActions.CliActionTypes.TOGGLE_CLI:
        {
            const prev = state.entities[action.payload.redisId].showCli;
            return adapter.updateOne({id: action.payload.redisId,
                changes: {showCli: action.payload.show == null ? !prev : action.payload.show}}, state);
        }
        default:
            return state;
    }
}


