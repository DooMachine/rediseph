import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { State } from './store/reducers/redis';
import { Store, select } from '@ngrx/store';
import * as redisActions from './store/actions/redis';
import { RedisInstance, ConnectServerModel, SelectedKeyInfo, SelectedKeyInfoHost } from './models/redis';
import { Observable } from 'rxjs';
import { selectAllRedisInstances, getSelectedRedisIndex, selectAllSelectedKeyHosts } from './store/reducers';
import { MatDialogRef, MatDialog } from '@angular/material';
import { AddRedisModalComponent } from './components/add-redis-modal/add-redis-modal.component';
import { RedisNode } from './models/redis-node';
import { buildDELQuery } from './utils/commandutils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'rediSeph';
  redisInstances$: Observable<RedisInstance[]>;
  selectedKeyInfoHosts$: Observable<SelectedKeyInfoHost[]>;
  selectedRedisIndex$: Observable<number>;
  constructor(private readonly store: Store<State>, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    const redisInstance = new RedisInstance();
    redisInstance.serverModel = {
      name: 'redis-lab-fre',
      ip: 'redis-16990.c55.eu-central-1-1.ec2.cloud.redislabs.com',
      port: 16990,
      db: 0,
      password: 'H9q9Nvq52lc8gTqpDz6t38YDhUbjidRn'
    };
    this.store.dispatch(new redisActions.ConnectRedisInstance(redisInstance.serverModel));

    this.redisInstances$ = this.store.pipe(select(selectAllRedisInstances));
    this.selectedRedisIndex$ = this.store.pipe(select(getSelectedRedisIndex));
    this.selectedKeyInfoHosts$ = this.store.pipe(select(selectAllSelectedKeyHosts));
  }

  nodeClicked($event) {
    this.store.dispatch(new redisActions.SetSelectedNode($event));
  }
  expandClicked($event) {
    this.store.dispatch(new redisActions.ExpandToggleNode($event));
  }
  redisSelected($event) {
    this.store.dispatch(new redisActions.SetSelectedRedisIndex($event));
  }
  setNodeSearchQuert($event) {
    this.store.dispatch(new redisActions.SetSearchQuery($event));
  }
  clickNew() {
    const newData: ConnectServerModel = {
      ip: 'localhost',
      name: '',
      port: 6379,
      password: '',
      db: 0
    };
    const dialogRef = this.dialog.open(AddRedisModalComponent, {
      data: newData,
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.store.dispatch(new redisActions.ConnectRedisInstance(res));
      }
    });
  }
  disconnectRedis($event) {
    this.store.dispatch(new redisActions.DisconnectRedisInstance($event));
  }
  showRootInfo($event) {
    this.store.dispatch(new redisActions.ShowRootInfo($event));
  }
  deleteNode($event) {
    const args = buildDELQuery($event.node);
    this.store.dispatch(new redisActions.ExecuteCommand({redisId: $event.redis.id, command: args}));
  }
  loadMore($event) {
    this.store.dispatch(new redisActions.LoadNextPage($event));
  }
  refreshKeys($event) {
    this.store.dispatch(new redisActions.RefreshLoadedKeys($event));
  }
  watchChange($event) {
    if ($event.checked) {
      this.store.dispatch(new redisActions.WatchChanges($event.instance));
    } else {
      this.store.dispatch(new redisActions.StopWatchChanges($event.instance));
    }
  }
}
