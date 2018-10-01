import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RedisInstance, SelectedKeyInfoHost, ConnectServerModel, AddKeyModel, DataType } from '../../models/redis';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { State, getUiLoading } from '../../store/reducers';
import * as redisActions from '../../store/actions/redis';
import * as keyActions from '../../store/actions/selectedkey';
import { MatDialog } from '@angular/material';
import { selectAllRedisInstances, getSelectedRedisIndex, selectAllSelectedKeyHosts, getSelectedRedisId } from '../../store/reducers';
import { AddRedisModalComponent } from '../add-redis-modal/add-redis-modal.component';
import { AddKeyModalComponent } from '../add-key-modal/add-key-modal.component';
import { buildDELQuery, buildSETQuery, buildRENAMEQuery } from '../../utils/commandutils';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';

@Component({
  selector: 'app-root-container',
  templateUrl: './root-container.component.html',
  styleUrls: ['./root-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootContainerComponent implements OnInit {

  title = 'rediSeph';
  redisInstances$: Observable<RedisInstance[]>;
  selectedInstanceId$: Observable<string | number>;
  selectedKeyInfoHosts$: Observable<SelectedKeyInfoHost[]>;
  UILoading$: Observable<boolean>;
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
    this.selectedInstanceId$ = this.store.pipe(select(getSelectedRedisId));
    this.UILoading$ = this.store.pipe(select(getUiLoading));
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
    // TODO: Add Demo
    const newData: ConnectServerModel = {
      ip: '',
      name: '',
      port: 13131,
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
  addNewKey(parentFolderKey: string, redisId: string) {
    const model: AddKeyModel = {
      redisId: redisId,
      key : parentFolderKey || '',
      isSubKey : parentFolderKey === null,
      parentKey: '',
      type: DataType.string,
    };
    const dialogRef = this.dialog.open(AddKeyModalComponent, {
      data: model,
      width: '290px'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.store.dispatch(new redisActions.AddNewKey(res));
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

  renameNode($event) {
    const dialogData = {
      newKey: $event.node.key,
      node: $event.node
    };
    const dialogRef = this.dialog.open(RenameDialogComponent, {
      data: dialogData,
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        const args = buildRENAMEQuery($event.node, dialogData.newKey);
        this.store.dispatch(new redisActions.ExecuteCommand({command: args, redisId: $event.redisId}));
      }
    });
  }

}
