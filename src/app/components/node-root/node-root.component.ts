import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SelectedKeyInfo } from '../../models/redis';

@Component({
  selector: 'app-node-root',
  templateUrl: './node-root.component.html',
  styleUrls: ['./node-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeRootComponent implements OnInit {
  @Input() selectedKeyInfos: Array<SelectedKeyInfo>;
  @Input() selectedTabIndex: number;
  @Input() redisId: string;
  constructor() { }

  ngOnInit() {
  }

}
