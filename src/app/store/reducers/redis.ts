import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as redisActions from '../actions/redis';
import { RedisInstance, KeyInfo } from 'src/app/models/redis';
import { TableInfo, OrderType} from '../../models/table-helpers';
import { buildRedisTree } from 'src/app/utils/redisutils';

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
  sortComparer: false
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
                infoAsKey.push({key: key, value: action.payload.serverInfo[key]});
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
            const keyInfo = new KeyInfo();
            keyInfo.selectedKey = action.payload.keyInfo.selectedKey;
            keyInfo.pattern = action.payload.keyInfo.pattern;
            keyInfo.cursor = action.payload.keyInfo.cursor;
            keyInfo.hasMoreKeys = action.payload.keyInfo.hasMoreKeys;
            action.payload.redisInfo.info = tableInfo;
            action.payload.redisInfo.rootSelected = true;
            action.payload.redisInfo.tree = buildRedisTree(action.payload.keys);
            action.payload.redisInfo.expandedNodeKeys = [];
            action.payload.redisInfo.selectedNodeKey = '';
            action.payload.redisInfo.keyInfo = keyInfo;
            return {
                ...adapter.addOne(action.payload.redisInfo, state),
                 selectedInstanceIndex: state.ids.length
                };
        }
        case redisActions.RedisActionTypes.DISCONNECT_REDIS_INSTANCE:
        {
            return state;
        }
        case redisActions.RedisActionTypes.DISCONNECT_REDIS_INSTANCE_SUCCESS:
        {
            return adapter.removeOne(action.payload, state);
        }
        case redisActions.RedisActionTypes.REDIS_INSTANCE_UPDATED:
        {
            const previous = state.entities[action.payload.redisInfo.id];
            const infoAsKey = [];
            Object.keys(action.payload.serverInfo).forEach(function(key) {
                infoAsKey.push({key: key, value: action.payload.serverInfo[key]});
            });
            const tableInfo: TableInfo<any> = {
                entities: infoAsKey,
                pageIndex: previous.info.pageIndex,
                pageSize: previous.info.pageSize,
                totalCount: infoAsKey.length,
                orderableColumns: [],
                displayedColumns: ['key', 'value'],
                displayedActions: [],
                searchQuery: previous.info.searchQuery,
                order: previous.info.order,
                orderType: previous.info.orderType,
            };
            action.payload.redisInfo.info = tableInfo;
            action.payload.redisInfo.tree = buildRedisTree(action.payload.keys);
            action.payload.redisInfo.expandedNodeKeys = previous.expandedNodeKeys;

            const keyInfo = new KeyInfo();
            keyInfo.selectedKey = action.payload.keyInfo.selectedKey,
            keyInfo.pattern = action.payload.keyInfo.pattern,
            keyInfo.cursor = action.payload.keyInfo.cursor;
            keyInfo.hasMoreKeys = action.payload.keyInfo.hasMoreKeys;
            action.payload.redisInfo.keyInfo = keyInfo;

            return adapter.upsertOne(action.payload.redisInfo, state);
        }
        case redisActions.RedisActionTypes.WATCH_CHANGES:
        {
            return {...adapter.updateOne({id: action.payload.id, changes: {working: true}}, state)};
        }
        case redisActions.RedisActionTypes.WATCHING_CHANGES:
        {
            return {...adapter.updateOne({id: action.payload, changes: {isMonitoring: true, working: false}}, state)};
        }
        case redisActions.RedisActionTypes.STOP_WATCH_CHANGES:
        {
            return {...adapter.updateOne({id: action.payload.id, changes: {working: true}}, state)};
        }
        case redisActions.RedisActionTypes.STOPPED_WATCH_CHANGES:
        {
            return {...adapter.updateOne({id: action.payload, changes: {isMonitoring: false, working: false}}, state)};
        }
        case redisActions.RedisActionTypes.SET_SELECTED_NODE:
        {
            const redisInstance = state.entities[action.payload.redis.id];
            const change = {...redisInstance.keyInfo, selectedNodeKey: action.payload.node.key };
            return adapter.updateOne({id: action.payload.redis.id,
                    changes: {keyInfo: change , rootSelected: false}}, state);
        }
        case redisActions.RedisActionTypes.SHOW_ROOT_INFO:
        {
            return adapter.updateOne({id: action.payload.id, changes: {rootSelected: true}}, state);
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
        case redisActions.RedisActionTypes.SET_SELECTED_REDIS_INDEX:
        {
            return {
                ...state,
                selectedInstanceIndex: action.payload
            };
        }
        default:
            return state;
    }
}


