import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { RedisInstance } from '../../models/redis';

@Component({
  selector: 'app-redis-instance',
  templateUrl: './redis-instance.component.html',
  styleUrls: ['./redis-instance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedisInstanceComponent implements OnInit {

  @Input() instance: RedisInstance;
  constructor() { }

  ngOnInit() {
  }

}
