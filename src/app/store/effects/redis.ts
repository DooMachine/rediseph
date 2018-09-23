import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { switchMap, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RedisSocketService } from '../services/redissocket.service';
import * as redisActions from '../actions/redis';
import * as keyActions from '../actions/selectedkey';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class RedisEffects {
    constructor(
        private actions$: Actions,
        private redisService: RedisSocketService,
        public snackBar: MatSnackBar
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

    @Effect()
    connectRedisSuccess$: Observable<Action> =
        this.redisService.redisConnected$.pipe( // listen to the socket for CLIENT CONNECTED event
            switchMap((resp) =>  {
                    return from([
                        new redisActions.ConnectRedisInstanceSuccess(resp),
                        new keyActions.AddSelectedKeyHost({redisId: resp.redisInfo.id, selectedKeys: resp.selectedKeyInfo})
                    ]);
                }
            )
        );

    @Effect({dispatch: false})
    disconnectRedis$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.DISCONNECT_REDIS_INSTANCE),
            mergeMap((action) => {
                this.redisService.disconnectRedisInstance(action);
                return of();
            }),
        );
    @Effect()
    disconnectRedisSuccess$: Observable<Action> =
        this.redisService.redisDisconnected$.pipe( // listen to the socket for CLIENT CONNECTED event
            switchMap((resp) =>  {
                    return of(new redisActions.DisconnectRedisInstanceSuccess(resp.redisId));
                }
            )
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
    @Effect({dispatch: false})
    loadNextPage$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.LOAD_NEXT_PAGE),
            mergeMap((action: redisActions.LoadNextPage) => {
                this.redisService.LoadNextPage(action.payload.id);
                return of();
            }),
        );
    @Effect({dispatch: false})
    refreshLoadedKeys$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.REFRESH_LOADED_KEYS),
            mergeMap((action) => {
                this.redisService.refreshLoadedKeys(action);
                return of();
            }),
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
    @Effect({dispatch: false})
    setSelectedKey$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.SET_SELECTED_NODE),
            switchMap((action: redisActions.SetSelectedNode) => {
                if (action.payload.node.type !== 'folder') {
                    this.redisService.setSelectedNode(action.payload.redis.id, action.payload.node.key);
                }
                return of();
            }),
        );
    @Effect()
    keySelectSuccess$: Observable<Action> =
        this.redisService.nodeKeySelected$.pipe( // listen to the socket for REDIS UPDATES
            switchMap((resp) =>  {
                    console.log(resp);
                    return of(new redisActions.SetSelectedNodeSuccess(resp));
                }
            )
        );
    @Effect({dispatch: false})
    deselectKey$ = this.actions$
        .pipe(
            ofType(keyActions.SelectedKeyActionTypes.REMOEVE_SELECTED_KEY),
            switchMap((action: keyActions.RemoveSelectedKey) => {
                this.redisService.deselectNode(action.payload.redisId, action.payload.selectedKeyInfo.key);
                return of();
            }),
        );
    @Effect()
    deselectNodeSuccess$: Observable<Action> =
        this.redisService.deselectNodeSuccess$.pipe( // listen to the socket for SELECTED KEY UPDATES
            switchMap((resp) =>  {
                    return of(new keyActions.RemoveSelectedKeySuccess(resp));
                }
            )
        );
    @Effect()
    selectedNodeUpdated$: Observable<Action> =
        this.redisService.selectedNodeKeyUpdated$.pipe( // listen to the socket for SELECTED KEY UPDATES
            switchMap((resp) =>  {
                    return of(new keyActions.SelectedNodeKeyUpdated(resp));
                }
            )
        );
    @Effect()
    redisEvent$: Observable<Action> =
        this.redisService.redisUpdated$.pipe( // listen to the socket for REDIS UPDATES
            switchMap((resp) =>  {
                    this.snackBar.open('Redis instance: <b>' + resp.redisInfo.ip + '</b> Updated', null, {
                        duration: 1400,
                        verticalPosition: 'bottom',
                        horizontalPosition: 'left',
                    });
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
