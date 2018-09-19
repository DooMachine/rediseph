import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as redisTreeActions from '../actions/redistree';
import { RedisNodeHost } from '../../models/redis-node';

export interface State extends EntityState<RedisNodeHost> {
    expandedNodeKeys: Array<string>;
}

export const adapter: EntityAdapter<RedisNodeHost> = createEntityAdapter<RedisNodeHost>({
  selectId: (redisInstance: RedisNodeHost) => redisInstance.redisInstanceId,
  sortComparer: false
});

export const initialState: State = adapter.getInitialState({
    expandedNodeKeys: []
});
/**
 * Reducer for RedisNodeHost Store
 * @param state state
 * @param action action
 */
export function reducer(state = initialState, action: redisTreeActions.RedisTreeActions): State {
    switch (action.type) {
        case redisTreeActions.RedisTreeActionTypes.ADD_REDIS_TREE:
        {
            return adapter.addOne(action.payload, state);
        }
        default:
            return state;
    }
}


