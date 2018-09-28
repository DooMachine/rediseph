import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RedisNode } from '../../models/redis-node';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent implements AfterViewInit {

  constructor(private elem: ElementRef) { }
  @ViewChild('listTree') treeRef: ElementRef;
  @Output() searchInputChanged = new EventEmitter();
  searchInputControl: FormControl = new FormControl();
  searchInputControlSub: Subscription;

  private typeIconMap = {
      list: 'subject',
      set: 'settings_ethernet',
      zset: 'format_list_numbered',
      hash: 'list',
      string: 'text_fields'
  };
  private typeTooltipMap = {
    list: 'List',
    set: 'Set',
    zset: 'Ordered Set',
    hash: 'Hash Map',
    string: 'String'
  };

  nestedTreeControl: NestedTreeControl<RedisNode>;
  nestedDataSource: MatTreeNestedDataSource<RedisNode>;


  @Input() selectedNodeKey: string;
  @Input() expandedNodeKeys: Array<string>;
  @Input('searchText')
  set value(sText: string) {
    this.searchInputControl.setValue(sText);
  }
  @Input() hasMoreKeys: boolean;
  @Output() nodeClick = new EventEmitter();
  @Output() expandClick = new EventEmitter();
  @Output() deleteClick = new EventEmitter();
  @Output() renameClick = new EventEmitter();
  @Output() loadMore = new EventEmitter();
  @Output() addFolderKey = new EventEmitter();
  @Input('redisTree')
  set redisTree(tree: any) {
    this.nestedTreeControl = new NestedTreeControl<RedisNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.nestedDataSource.data = tree;
    this.nestedTreeControl.isExpanded = this.isExpanded;
    // Scroll into previous selected entity

  }
  hasNestedChild = (_: number, nodeData: RedisNode) => nodeData.type === 'folder';
  isSelected = (nodeData: RedisNode) => nodeData.key === this.selectedNodeKey;
  isExpanded = (nodeData: RedisNode) => this.expandedNodeKeys.indexOf(nodeData.key) !== -1;
  private _getChildren = (node: RedisNode) => node.children;

  clickSearch() {
    this.searchInputChanged.emit(this.searchInputControl.value);
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      const selectedRef = this.elem.nativeElement.querySelectorAll('.selectedNode')[0];
      if (selectedRef) {
        selectedRef.scrollIntoView({block: 'center', inline: 'center'});
      }
    });
  }
}
