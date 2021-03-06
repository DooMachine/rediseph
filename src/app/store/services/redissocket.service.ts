import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
    providedIn: 'root'
})
export class RedisSocketService {

    redisConnected$: Observable<any>;
    redisConnectFail$: Observable<any>;
    redisDisconnected$: Observable<any>;
    redisUpdated$: Observable<any>;
    startedWatchChanges$: Observable<any>;
    stoppedWatchChanges$: Observable<any>;
    nodeKeySelected$: Observable<any>;
    selectedNodeKeyUpdated$: Observable<any>;
    selectedNodeKeysUpdated$: Observable<any>;
    deselectNodeSuccess$: Observable<any>;
    newKeyAdded$: Observable<any>;
    errorExecutingCommand$: Observable<any>;
    terminalResponse$: Observable<any>;

    constructor(private socket: SocketService) {
        // Every socket REDIS event has it's own observable, will be used by ngrx effects
        this.redisConnected$ = this.socket.listen('[Redis] CONNECT_REDIS_INSTANCE_SUCCESS');
        this.redisDisconnected$ = this.socket.listen('[Redis] DISCONNECT_REDIS_INSTANCE_SUCCESS');
        this.redisConnectFail$ = this.socket.listen('[Redis] CONNECT_REDIS_INSTANCE_FAIL');
        this.redisUpdated$ = this.socket.listen('[Redis] REDIS_INSTANCE_UPDATED');
        this.startedWatchChanges$ = this.socket.listen('[Redis] WATCHING_CHANGES');
        this.stoppedWatchChanges$ = this.socket.listen('[Redis] STOPPED_WATCH_CHANGES');
        this.nodeKeySelected$ = this.socket.listen('[Redis] NODE_SELECT_SUCCESS');
        this.selectedNodeKeyUpdated$ = this.socket.listen('[Redis] SELECTED_NODE_UPDATED');
        this.selectedNodeKeysUpdated$ = this.socket.listen('[Redis] SELECTED_NODES_UPDATED');
        this.deselectNodeSuccess$ = this.socket.listen('[Redis] DESELECTED_NODE_SUCCESS');
        this.newKeyAdded$ = this.socket.listen('[Redis] NEW_KEY_ADDED');
        this.errorExecutingCommand$ = this.socket.listen('[Redis] ERROR_EXECUTING_COMMAND');
        this.terminalResponse$ = this.socket.listen('[Redis] EXECUTE_TERMINAL_LINE_RESPONSE');
    }

    // These methods will be called by ngrx effects (do not use directly in the components)
    connectRedisInstance(action) {
        this.socket.emit('[Redis] CONNECT_REDIS_INSTANCE', action.payload);
    }
    disconnectRedisInstance(action) {
        this.socket.emit('[Redis] DISCONNECT_REDIS_INSTANCE', action.payload.id);
    }
    addNewKey(action) {
        this.socket.emit('[Redis] ADD_NEW_KEY', action);
    }
    changeKeyPattern(redisInstanceId, pattern) {
        this.socket.emit('[Redis] SET_SEARCH_QUERY', {redisInstanceId: redisInstanceId, pattern: pattern });
    }
    refreshLoadedKeys(action) {
        this.socket.emit('[Redis] REFRESH_LOADED_KEYS', {redisId: action.payload.id });
    }
    watchChanges(redisId) {
        this.socket.emit('[Redis] WATCH_CHANGES', {redisId: redisId });
    }
    stopWatchChanges(redisId) {
        this.socket.emit('[Redis] STOP_WATCH_CHANGES', {redisId: redisId});
    }
    executeRedisInstance(redisId, args) {
        this.socket.emit('[Redis] EXECUTE_COMMAND', {redisId: redisId, args: args});
    }
    LoadNextPage(redisId) {
        this.socket.emit('[Redis] ITER_NEXT_PAGE_SCAN', {redisId: redisId});
    }
    setSelectedNode(redisId, key) {
        this.socket.emit('[Redis] SET_SELECTED_NODE', {redisId: redisId, key: key});
    }
    deselectNode(redisId, key) {
        this.socket.emit('[Redis] DESELECT_NODE_KEY', {redisId: redisId, key: key});
    }
    updateEntityPagination(action) {
        this.socket.emit('[Redis] UPDATE_ENTITY_PAGINATION', action);
    }
    executeTerminalLine(action) {
        this.socket.emit('[Redis] EXECUTE_TERMINAL_LINE', action);
    }
}
