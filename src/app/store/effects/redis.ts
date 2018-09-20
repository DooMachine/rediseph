import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { switchMap, mergeMap, tap } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RedisSocketService } from '../services/redissocket.service';
import * as redisActions from '../actions/redis';

@Injectable()
export class RedisEffects {
    constructor(
        private actions$: Actions,
        private redisService: RedisSocketService
    ) {}

    @Effect({dispatch: false})
    connectRedis$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.CONNECT_REDIS_INSTANCE),
            mergeMap((action) => {
                this.redisService.connectRedisInstance(action);
                return of();
            }),
        );
    @Effect({dispatch: false})
    executeCommand$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.EXECUTE_COMMAND),
            mergeMap((action: redisActions.ExecuteCommand) => {
                this.redisService.executeRedisInstance(action.payload.redisId, action.payload.command);
                return of();
            }),
        );
    @Effect()
    connectRedisSuccess$: Observable<Action> =
        this.redisService.redisConnected$.pipe( // listen to the socket for CLIENT CONNECTED event
            switchMap((resp) =>  {
                    return of(new redisActions.ConnectRedisInstanceSuccess(resp));
                }
            )
        );
    @Effect({dispatch: false})
    watchChanges$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.WATCH_CHANGES),
            mergeMap((action: redisActions.WatchChanges) => {
                this.redisService.watchChanges(action.payload.id);
                return of();
            }),
        );
    @Effect()
    watchingChanges$: Observable<Action> =
        this.redisService.startedWatchChanges$.pipe( // listen to the socket for REDIS UPDATES
            mergeMap((resp) =>  {
                    return of(new redisActions.WatchingChanges(resp));
                }
            )
        );
    @Effect({dispatch: false})
    stopWatchChanges$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.STOP_WATCH_CHANGES),
            mergeMap((action: redisActions.StopWatchChanges) => {
                this.redisService.stopWatchChanges(action.payload.id);
                return of();
            }),
        );
    @Effect()
    stoppedWatchChanges$: Observable<Action> =
        this.redisService.stoppedWatchChanges$.pipe( // listen to the socket for REDIS UPDATES
            mergeMap((resp) =>  {
                    return of(new redisActions.StoppedWatchChanges(resp));
                }
            )
        );
    @Effect({dispatch: false})
    searchQueryChanged$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.SET_SEARCH_QUERY),
            switchMap((action: redisActions.SetSearchQuery) => {
                this.redisService.changeKeyPattern(action.payload.redis.id, action.payload.query);
                return of();
            }),
        );
    @Effect()
    redisEvent$: Observable<Action> =
        this.redisService.redisUpdated$.pipe( // listen to the socket for REDIS UPDATES
            switchMap((resp) =>  {
                    return of(new redisActions.RedisInstanceUpdated(resp));
                }
            )
        );
    @Effect()
    connectRedisFail$: Observable<Action> =
        this.redisService.redisConnectFail$.pipe( // listen to the socket for CLIENT CONNECTED FAIL event
            switchMap(resp =>
                of(new redisActions.ConnectRedisInstanceFail(resp))
            )
        );

}
