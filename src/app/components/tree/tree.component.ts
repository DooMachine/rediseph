import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RedisNode, RedisNodeHost } from '../../models/redis-node';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent implements OnInit {

  @Output() searchInputChanged = new EventEmitter();
  searchInputControl: FormControl = new FormControl();
  searchInputControlSub: Subscription;

  private typeIconMap = {
      list: 'list',
      set: 'settings_ethernet',
      zset: 'format_list_numbered',
      hash: 'subject',
      string: 'text_fields'
  };

  nestedTreeControl: NestedTreeControl<RedisNode>;
  nestedDataSource: MatTreeNestedDataSource<RedisNode>;


  @Input() selectedNodeKey: string;
  @Input() searchText: string;
  @Output() nodeClick = new EventEmitter();
  @Output() expandClick = new EventEmitter();
  @Input() expandedNodeKeys: Array<string>;

  @Input('redisTree')
  set redisTree(tree: any) {
    console.log(this.expandedNodeKeys);
    this.nestedTreeControl = new NestedTreeControl<RedisNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.nestedDataSource.data = tree;
    this.nestedTreeControl.isExpanded = this.isExpanded;
  }
  hasNestedChild = (_: number, nodeData: RedisNode) => nodeData.type === 'folder';
  isSelected = (nodeData: RedisNode) => nodeData.key === this.selectedNodeKey;
  isExpanded = (nodeData: RedisNode) => this.expandedNodeKeys.indexOf(nodeData.key) !== -1;
  private _getChildren = (node: RedisNode) => node.children;
  constructor() { }

  ngOnInit() {
    this.searchInputControlSub = this.searchInputControl.valueChanges
    .pipe(
      debounceTime(700)
    ).subscribe(newValue => this.searchInputChanged.emit(newValue));
  }
}
