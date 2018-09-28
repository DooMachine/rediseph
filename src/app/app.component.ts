import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { State } from './store/reducers/redis';
import { Store, select } from '@ngrx/store';
import * as redisActions from './store/actions/redis';
import * as keyActions from './store/actions/selectedkey';
import * as cliActions from './store/actions/cli';
import { SelectedKeyInfoHost } from './models/redis';
import { Observable } from 'rxjs';
import { getSelectedRedisIndex, selectAllSelectedKeyHosts, getSelectedRedisId, selectAllCli } from './store/reducers';
import { buildSETQuery, buildNewEntityQuery, buildDeleteFromNodeQuery, buildLREMQuery, buildUpdateEntityQuery } from './utils/commandutils';
import { LremDialogComponent } from './components/lrem-dialog/lrem-dialog.component';
import { MatDialog } from '@angular/material';
import { RedisCli } from './models/cli';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'rediSeph';
  selectedInstanceId$: Observable<string | number>;
  selectedKeyInfoHosts$: Observable<SelectedKeyInfoHost[]>;
  selectedRedisIndex$: Observable<number>;
  allRedisClis$: Observable<Array<RedisCli>>;
  constructor(private readonly store: Store<State>, private dialog: MatDialog) {
  }

  ngOnInit(): void {

    this.selectedRedisIndex$ = this.store.pipe(select(getSelectedRedisIndex));
    this.selectedKeyInfoHosts$ = this.store.pipe(select(selectAllSelectedKeyHosts));
    this.selectedInstanceId$ = this.store.pipe(select(getSelectedRedisId));
    this.allRedisClis$ = this.store.pipe(select(selectAllCli));
  }

  changeKeyTabIndex($event) {
    this.store.dispatch(new keyActions.ChangeTabIndexKey($event));
  }
  closeKeyInfo($event) {
    this.store.dispatch(new keyActions.RemoveSelectedKey($event));
  }
  updateStringKeyValue($event) {
    const args = buildSETQuery($event.info);
    this.store.dispatch(new redisActions.ExecuteCommand({redisId: $event.redisId, command: args}));
  }
  selectEntityIndex($event) {
    console.log($event);
    this.store.dispatch(new keyActions.SetSelectedEntityIndex({redisId: $event.redisId,
      key: $event.info.keyInfo.key, index: $event.info.index}));
  }
  addNewEntity($event) {
    console.log($event);
    const args = buildNewEntityQuery($event.model);
    this.store.dispatch(new redisActions.ExecuteCommand({redisId: $event.redisId, command: args}));
  }
  paginationChanged($event) {
    this.store.dispatch(new keyActions.EntityPaginationChanged($event));
  }
  updateEntityValue($event) {
    const args = buildUpdateEntityQuery($event.info);
    this.store.dispatch(new redisActions.ExecuteCommand({redisId: $event.redisId, command: args}));
  }
  deleteEntity($event) {
    if ($event.info.keyInfo.type === 'list') {
      this.openLREMModal($event);
    } else { // remove from set hset zset
      const args = buildDeleteFromNodeQuery($event.info);
      this.store.dispatch(new redisActions.ExecuteCommand({redisId: $event.redisId, command: args}));
    }
  }
  openLREMModal($event) {
    const lremModel = {
      value: $event.info.entity.value,
      key: $event.info.keyInfo.key,
      count: 0,
    };
    const ref = this.dialog.open(LremDialogComponent, {
      width: '650px',
      data: lremModel,
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const args = buildLREMQuery(result);
        this.store.dispatch(new redisActions.ExecuteCommand({redisId: $event.redisId, command: args}));
      }
    });
  }

  toggleCli($event) {
    this.store.dispatch(new cliActions.ToggleCli($event));
  }
}
