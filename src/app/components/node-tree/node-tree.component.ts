import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NestedTreeControl } from '@angular/cdk/tree';
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


  nestedTreeControl: NestedTreeControl<any>;
  nestedDataSource: MatTreeNestedDataSource<any>;


  @Input() searchText: string;
  @Input() hasMoreKeys: boolean;
  @Output() nodeClick = new EventEmitter();
  @Output() deleteClick = new EventEmitter();
  @Output() loadMore = new EventEmitter();

  @Input('selectedKeyInfo')
  set selectedKeyInfo(selectedKeyInfo: KeyInfo) {
    this.nestedTreeControl = new NestedTreeControl<RedisNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.nestedDataSource.data = selectedKeyInfo.entities.map(m => m[0]);
  }
  hasNestedChild = (_: number, nodeData: RedisNode) => nodeData.type === 'folder';
  private _getChildren = (node: RedisNode) => node.children;
  constructor() { }

  clickSearch() {
    this.searchInputChanged.emit(this.searchInputControl.value);
  }

}
