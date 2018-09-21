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

    constructor(private socket: SocketService) {
        // Every socket REDIS event has it's own observable, will be used by ngrx effects
        this.redisConnected$ = this.socket.listen('[Redis] CONNECT_REDIS_INSTANCE_SUCCESS');
        this.redisDisconnected$ = this.socket.listen('[Redis] DISCONNECT_REDIS_INSTANCE_SUCCESS');
        this.redisConnectFail$ = this.socket.listen('[Redis] CONNECT_REDIS_INSTANCE_FAIL');
        this.redisUpdated$ = this.socket.listen('[Redis] REDIS_INSTANCE_UPDATED');
        this.startedWatchChanges$ = this.socket.listen('[Redis] WATCHING_CHANGES');
        this.stoppedWatchChanges$ = this.socket.listen('[Redis] STOPPED_WATCH_CHANGES');
        this.nodeKeySelected$ = this.socket.listen('[Redis] SET_SELECTED_NODE_SUCCESS');
    }

    // These methods will be called by ngrx effects (do not use directly in the components)
    connectRedisInstance(action) {
        this.socket.emit('[Redis] CONNECT_REDIS_INSTANCE', action.payload);
    }
    disconnectRedisInstance(action) {
        this.socket.emit('[Redis] DISCONNECT_REDIS_INSTANCE', action.payload.id);
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
}
