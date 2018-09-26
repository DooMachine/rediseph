import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { SelectedKeyInfoHost } from '../../models/redis';

@Component({
  selector: 'app-node-root',
  templateUrl: './node-root.component.html',
  styleUrls: ['./node-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeRootComponent implements OnInit {
  selectedTabIndex: number;
  @Input() redisId: string;
  @Output() newValueAdd = new EventEmitter();
  @Output() keyTabChanged = new EventEmitter();
  @Output() closeKeyInfo = new EventEmitter();
  @Output() updateStringValue = new EventEmitter();
  @Output() selectEntityIndex = new EventEmitter();
  @Output() updateEntiyValue = new EventEmitter();
  @Output() paginationChanged = new EventEmitter();
  @Output() deleteEntity = new EventEmitter();
  keyInfoHost: SelectedKeyInfoHost;

  @Input('selectedKeyInfoHosts')
   set selectedKeyInfoHosts(keyInfoHosts: Array<SelectedKeyInfoHost>) {
    this.keyInfoHost = keyInfoHosts.find(p => p.redisId === this.redisId);
    if (!this.keyInfoHost ) {
      return;
    }
    const sIndex = this.keyInfoHost.keyInfos
      .findIndex(p => p.key === this.keyInfoHost.selectedKeyQueue[this.keyInfoHost.selectedKeyQueue.length - 1]);

    this.selectedTabIndex = sIndex === -1 ? 0 : sIndex;
  }
  private typeIconMap = {
    list: 'list',
    set: 'settings_ethernet',
    zset: 'format_list_numbered',
    hash: 'subject',
    string: 'text_fields'
  };
  constructor() { }

  ngOnInit() {
  }

}
