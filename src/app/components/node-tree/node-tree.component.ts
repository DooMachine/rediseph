import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';
import { RedisNode } from '../../models/redis-node';
import { MatTreeNestedDataSource } from '@angular/material';
import { KeyInfo } from '../../models/redis';

@Component({
  selector: 'app-node-tree',
  templateUrl: './node-tree.component.html',
  styleUrls: ['./node-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeTreeComponent {

  @Output() searchInputChanged = new EventEmitter();
  searchInputControl: FormControl = new FormControl();


  flatTreeControl: FlatTreeControl<any>;
  nestedDataSource: MatTreeNestedDataSource<any>;


  pattern: string;
  hasMoreKeys: boolean;
  @Output() entityClick = new EventEmitter();
  @Output() deleteClick = new EventEmitter();
  @Output() loadMore = new EventEmitter();

  @Input('selectedKeyInfo')
  set selectedKeyInfo(selectedKeyInfo: KeyInfo) {
    console.log(selectedKeyInfo);
  }

  constructor() { }

  clickSearch() {
    this.searchInputChanged.emit(this.searchInputControl.value);
  }

}
