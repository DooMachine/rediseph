import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { switchMap, mergeMap, tap } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RedisSocketService } from '../services/redissocket.service';
import * as redisActions from '../actions/redis';
import * as redisTreeActions from '../actions/redistree';


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
                    return from(
                        [
                            new redisActions.ConnectRedisInstanceSuccess(resp),
                            new redisActions.WatchChanges(resp.redisInfo.id)
                        ]
                    );
                }
            )
        );
    @Effect({dispatch: false})
    watchChanges$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.WATCH_CHANGES),
            switchMap((action: redisActions.WatchChanges) => {
                this.redisService.watchChanges(action.payload);
                return of();
            }),
        );
    @Effect({dispatch: false})
    searchQueryChanged$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.SET_SEARCH_QUERY),
            switchMap((action: redisActions.SetSearchQuery) => {
                this.redisService.changeKeyPattern(action.payload.redis, action.payload.query);
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
