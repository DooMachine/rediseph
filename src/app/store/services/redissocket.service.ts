import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
    providedIn: 'root'
})
export class RedisSocketService {

    redisConnected$: Observable<any>;
    redisConnectFail$: Observable<any>;
    redisUpdated$: Observable<any>;

    constructor(private socket: SocketService) {
        // Every socket REDIS event has it's own observable, will be used by ngrx effects
        this.redisConnected$ = this.socket.listen('[Redis] CONNECT_REDIS_INSTANCE_SUCCESS');
        this.redisConnectFail$ = this.socket.listen('[Redis] CONNECT_REDIS_INSTANCE_FAIL');
        this.redisUpdated$ = this.socket.listen('[Redis] REDIS_INSTANCE_UPDATED');
    }

    // These methods will be called by ngrx effects (do not use directly in the components)
    connectRedisInstance(redisInstance) {
        this.socket.emit('[Redis] CONNECT_REDIS_INSTANCE', redisInstance.payload);
    }
    executeRedisInstance(redisId, args) {
        this.socket.emit('[Redis] EXECUTE_COMMAND', {redisId: redisId, args: args});
    }
}
