import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { switchMap, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RedisSocketService } from '../services/redissocket.service';
import * as redisActions from '../actions/redis';
import * as keyActions from '../actions/selectedkey';
import * as cliActions from '../actions/cli';
import * as uiActions from '../actions/ui';
import { MatSnackBar } from '@angular/material';
import { RedisCli } from '../../models/cli';
import { State } from '../reducers';

@Injectable()
export class RedisEffects {
    constructor(
        private actions$: Actions,
        private redisService: RedisSocketService,
        public snackBar: MatSnackBar,
        private store: Store<State>,
    ) {}

    @Effect()
    connectRedis$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.CONNECT_REDIS_INSTANCE),
            mergeMap((action) => {
                this.redisService.connectRedisInstance(action);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );

    @Effect()
    connectRedisSuccess$: Observable<Action> =
        this.redisService.redisConnected$.pipe( // listen to the socket for CLIENT CONNECTED event
            switchMap((resp) =>  {
                    const newCliInstance: RedisCli = {
                        redisHostName: resp.redisInfo.ip,
                        redisId: resp.redisInfo.id,
                        lines: resp.terminalInfo.lines,
                        isLoading: false,
                        showCli: false,
                    };
                    return from([
                        new redisActions.ConnectRedisInstanceSuccess(resp),
                        new uiActions.ToggleLoadingBar(false),
                        new cliActions.AddNewCli(newCliInstance),
                        new keyActions.AddSelectedKeyHost({redisId: resp.redisInfo.id, selectedKeys: resp.selectedKeyInfo})
                    ]);
                }
            )
        );
    @Effect()
    addNewKey$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.ADD_NEW_KEY),
            mergeMap((action: redisActions.AddNewKey) => {
                this.redisService.addNewKey(action);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );
    @Effect()
    newKeyAdded$: Observable<Action> =
        this.redisService.newKeyAdded$.pipe(
            switchMap((resp) =>  {
                    return from([
                        new keyActions.ChangeTabIndexKey({redisId: resp.redisId, index: resp.keyInfo.key }),
                        new keyActions.AddSelectedKeySuccess({selectedKeyInfo: resp.keyInfo, redisId: resp.redisId}),
                        new redisActions.NewKeyAdded({redisId: resp.redisId, keyInfo: resp.keyInfo}),
                        new uiActions.ToggleLoadingBar(false)
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
    @Effect()
    executeCommand$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.EXECUTE_COMMAND),
            mergeMap((action: redisActions.ExecuteCommand) => {
                this.redisService.executeRedisInstance(action.payload.redisId, action.payload.command);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );

    @Effect()
    erroeExecutingCommand$: Observable<Action> =
        this.redisService.errorExecutingCommand$.pipe(
            switchMap((resp) => {
                this.snackBar.open(resp.error ? resp.error.message : 'Could not uptade redis!', 'Ok', { duration: 2000 });
                return of(new uiActions.ToggleLoadingBar(false));
            })
        );
    @Effect({dispatch: false})
    executeCliCommand$ = this.actions$
        .pipe(
            ofType(cliActions.CliActionTypes.EXECUTE_LINE),
            mergeMap((action: cliActions.ExecuteLine) => {
                this.redisService.executeTerminalLine(action.payload);
                return of();
            }),
        );
    @Effect()
    terminalResponse$: Observable<Action> =
        this.redisService.terminalResponse$.pipe( // listen to the socket for REDIS UPDATES
            mergeMap((resp) =>  {
                    return of(new cliActions.ExecuteLineResponse(resp));
                }
            )
        );
    @Effect()
    loadNextPage$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.LOAD_NEXT_PAGE),
            mergeMap((action: redisActions.LoadNextPage) => {
                this.redisService.LoadNextPage(action.payload.id);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );
    @Effect()
    refreshLoadedKeys$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.REFRESH_LOADED_KEYS),
            mergeMap((action) => {
                this.redisService.refreshLoadedKeys(action);
                return of(new uiActions.ToggleLoadingBar(false));
            }),
        );
    @Effect()
    watchChanges$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.WATCH_CHANGES),
            mergeMap((action: redisActions.WatchChanges) => {
                this.redisService.watchChanges(action.payload.id);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );
    @Effect()
    watchingChanges$: Observable<Action> =
        this.redisService.startedWatchChanges$.pipe( // listen to the socket for REDIS UPDATES
            mergeMap((resp) =>  {
                    return from([
                        new redisActions.WatchingChanges(resp),
                        new uiActions.ToggleLoadingBar(false)]);
                }
            )
        );
    @Effect()
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
    @Effect()
    searchQueryChanged$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.SET_SEARCH_QUERY),
            switchMap((action: redisActions.SetSearchQuery) => {
                this.redisService.changeKeyPattern(action.payload.redis.id, action.payload.query);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );
    @Effect()
    setSelectedKey$ = this.actions$
        .pipe(
            ofType(redisActions.RedisActionTypes.SET_SELECTED_NODE),
            switchMap((action: redisActions.SetSelectedNode) => {
                if (action.payload.node.type !== 'folder') {
                    this.redisService.setSelectedNode(action.payload.redis.id, action.payload.node.key);
                }
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );
    @Effect()
    keySelectSuccess$: Observable<Action> =
        this.redisService.nodeKeySelected$.pipe( // listen to the socket for REDIS UPDATES
            switchMap((resp) =>  {
                    return from([new redisActions.SetSelectedNodeSuccess(resp),
                        new uiActions.ToggleLoadingBar(false)]);
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
                    return from([new keyActions.SelectedNodeKeyUpdated(resp), new uiActions.ToggleLoadingBar(false)]);
                }
            )
        );
    @Effect()
    selectedKeysUpdated$: Observable<Action> =
        this.redisService.selectedNodeKeysUpdated$.pipe( // listen to the socket for SELECTED KEY UPDATES
            switchMap((resp) =>  {
                    return from([
                        new keyActions.SelectedKeysUpdated(resp),
                        new uiActions.ToggleLoadingBar(true)
                    ]);
                }
            )
        );
    @Effect()
    selectedKeyPaginationChange$ = this.actions$
        .pipe(
            ofType(keyActions.SelectedKeyActionTypes.ENTITY_PAGINATION_CHANGED),
            switchMap((action: keyActions.EntityPaginationChanged) => {
                this.redisService.updateEntityPagination(action.payload);
                return of(new uiActions.ToggleLoadingBar(true));
            }),
        );
    @Effect()
    redisEvent$: Observable<Action> =
        this.redisService.redisUpdated$.pipe( // listen to the socket for REDIS UPDATES
            switchMap((resp) =>  {
                    return from([new redisActions.RedisInstanceUpdated(resp),
                        new uiActions.ToggleLoadingBar(false)]);
                }
            )
        );
    @Effect()
    connectRedisFail$: Observable<Action> =
        this.redisService.redisConnectFail$.pipe( // listen to the socket for CLIENT CONNECTED FAIL event
            switchMap((resp) => {
                this.snackBar.open(resp.error, 'ok');
                return from([
                    new redisActions.ConnectRedisInstanceFail(resp),
                    new uiActions.ToggleLoadingBar(false)
                ]);
            })
        );
}
