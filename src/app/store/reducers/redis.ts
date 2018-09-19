import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as redisActions from '../actions/redis';
import { RedisInstance } from 'src/app/models/redis';
import { TableInfo, OrderType} from '../../models/table-helpers';

/**
 * State to keep RedisInstances
 */
export interface State extends EntityState<RedisInstance> {
    selectedInstanceIndex: number;
    isLoading: boolean;
}
/**
 * Entity adapter for RedisInstance State
 */
export const adapter: EntityAdapter<RedisInstance> = createEntityAdapter<RedisInstance>({
  selectId: (redisInstance: RedisInstance) => redisInstance.id,
  sortComparer: (a: RedisInstance, b: RedisInstance) => b.serverModel.name.localeCompare(a.serverModel.name),
});
/**
 * Initial state factory for RedisInstance
 */
export const initialState: State = adapter.getInitialState({
    isLoading: false,
    selectedInstanceIndex: null
});
/**
 * Reducer for RedisInstance Store
 * @param state state
 * @param action action
 */
export function reducer(state = initialState, action: redisActions.RedisActions): State {
    switch (action.type) {
        case redisActions.RedisActionTypes.CONNECT_REDIS_INSTANCE:
        {
            return state;
        }
        case redisActions.RedisActionTypes.CONNECT_REDIS_INSTANCE_SUCCESS:
        {
            const infoAsKey = [];
            Object.keys(action.payload.serverInfo).forEach(function(key) {
                infoAsKey.push({index: key, value: action.payload.serverInfo[key]});
            });
            const tableInfo: TableInfo<any> = {
                entities: infoAsKey,
                pageIndex: 0,
                pageSize: 20,
                totalCount: infoAsKey.length,
                orderableColumns: [],
                displayedColumns: ['key', 'value'],
                displayedActions: [],
                searchQuery: null,
                order: null,
                orderType: OrderType.None,
            };
            action.payload.redisInfo.info = tableInfo;
            action.payload.redisInfo.tree = action.payload.redisTree;
            action.payload.redisInfo.expandedNodeKeys = [];
            action.payload.redisInfo.selectedNodeKey = '';

            return {
                ...adapter.addOne(action.payload.redisInfo, state),
                 selectedInstanceIndex: state.ids.length
                };
        }
        case redisActions.RedisActionTypes.SET_SELECTED_NODE:
        {
            return adapter.updateOne({id: action.payload.redis.id,
                 changes: {selectedNodeKey: action.payload.node.key}}, state);
        }
        case redisActions.RedisActionTypes.EXPAND_TOGGLE_NODE:
        {
            let newToggled;
            const prevToggled = state.entities[action.payload.redis.id].expandedNodeKeys;
            if (prevToggled.indexOf(action.payload.node.key) !== -1) {
                newToggled = prevToggled.filter(p => p !== action.payload.node.key);
            } else {
                newToggled = [...prevToggled, action.payload.node.key];
            }
            return adapter.updateOne({id: action.payload.redis.id, changes: {expandedNodeKeys: newToggled}}, state);
        }
        case redisActions.RedisActionTypes.SET_SEARCH_QUERY:
        {
            return adapter.updateOne({id: action.payload.redis.id, changes: {searchQuery: action.payload.query}} , state);
        }
        default:
            return state;
    }
}


