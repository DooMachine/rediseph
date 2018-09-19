import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { State } from './store/reducers/redis';
import { Store, select } from '@ngrx/store';
import * as redisActions from './store/actions/redis';
import { RedisInstance } from './models/redis';
import { Observable } from 'rxjs';
import { selectAllRedisInstances, getSelectedRedisIndex } from './store/reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'rediSeph';
  redisInstances$: Observable<RedisInstance[]>;
  selectedRedisIndex$: Observable<number>;
  constructor(private readonly store: Store<State>) {
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
}
