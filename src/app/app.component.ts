import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { State } from './store/reducers/redis';
import { Store, select } from '@ngrx/store';
import * as redisActions from './store/actions/redis';
import * as keyActions from './store/actions/selectedkey';
import { SelectedKeyInfoHost } from './models/redis';
import { Observable } from 'rxjs';
import { getSelectedRedisIndex, selectAllSelectedKeyHosts, getSelectedRedisId } from './store/reducers';
import { buildSETQuery, buildNewEntityQuery } from './utils/commandutils';

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
  constructor(private readonly store: Store<State>) {
  }

  ngOnInit(): void {

    this.selectedRedisIndex$ = this.store.pipe(select(getSelectedRedisIndex));
    this.selectedKeyInfoHosts$ = this.store.pipe(select(selectAllSelectedKeyHosts));
    this.selectedInstanceId$ = this.store.pipe(select(getSelectedRedisId));
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
    // So we should track only selected keys.
    this.store.dispatch(new keyActions.ExecuteQueryOnSelectedKey({redisId: $event.redisId, command: args}));
  }
}
