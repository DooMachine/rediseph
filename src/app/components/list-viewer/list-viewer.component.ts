import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { SelectedKeyInfo, NewEntityModel } from '../../models/redis';

@Component({
  selector: 'app-list-viewer',
  templateUrl: './list-viewer.component.html',
  styleUrls: ['./list-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewerComponent implements OnInit {
  // List Value Viewer
  editorOptions = {
    lineNumbers: false,
    theme: 'material',
    mode: 'markdown'
  };
  stringValue = '';
  // List Value Viewer End

  @Output() searchInputChanged = new EventEmitter();
  @Output() pageIndexChanged = new EventEmitter();
  searchPattern = '';
  selectedEntity: any;
  @ViewChild('listTable') tableRef: ElementRef;
  @Output() selectEntityIndex = new EventEmitter();
  @Output() newValueAdd = new EventEmitter();
  @Output() deleteEntity = new EventEmitter();
  @Output() updateEntiyValue = new EventEmitter();
  isSelectible = false;
  multipleActions = [];
  _selectedKeyInfo: SelectedKeyInfo;
  displayedColumns = [];
  formModel: NewEntityModel = {
    key: '',
    formType: '',
    addValue : '',
    listAddType: 'head',
    score: 0,
    formErrors : [],
  };
  @Input('selectedKeyInfo')
  set selectedKeyInfo(v: SelectedKeyInfo) {
    this._selectedKeyInfo = v;
    this.formModel.formType = v.type;
    this.formModel.key = v.key;
    this.searchPattern = v.keyScanInfo.pattern;
    this.isSelectible = v.type === 'set' || v.type === 'zset' || v.type === 'hset';
    this.selectedEntity = v.keyScanInfo.entities[v.keyScanInfo.selectedEntityIndex];
    if (this.selectedEntity) {
      this.stringValue = this.selectedEntity.value;
    }
    if (this.isSelectible) {
      this.multipleActions.push({name: 'Delete', color: 'warn'});
    }
    switch (v.type) {
      case 'set':
      {
        this.displayedColumns.push('value');
        break;
      }
      case 'zset':
      {
        this.displayedColumns.push('value');
        this.displayedColumns.push('score');
        break;
      }
      case 'hash':
      {
        this.displayedColumns.push('hash');
        break;
      }
      case 'list':
      {
        this.displayedColumns.push('value');
        break;
      }
      default:
        break;
    }
    // Scroll into previous selected entity
    setTimeout(() => {
      const selectedRef = this.tableRef.nativeElement.getElementsByClassName('selectedEntity')[0];
      if (selectedRef) {
        selectedRef.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'end'});
      }
    }, 90);
  }

  constructor() { }

  ngOnInit() {

  }
  placeholderMap(type) {
    const mapper = {
      list: 'Value',
      hash: 'Hash Key',
      set: 'Value',
      zset: 'Value',
    };
    return mapper[type];
  }
  submitNewValue() {
    this.formModel.formErrors = [];
    if (!this.formModel.addValue) {
      this.formModel.formErrors.push('Value required');
      return;
    }
    this.newValueAdd.emit(this.formModel);
  }
  clickSearch() {
    this.searchInputChanged.emit(this.searchPattern);
  }
  loadMore() {
    const newPageIndex = this._selectedKeyInfo.keyScanInfo.pageIndex + 1;
    this.pageIndexChanged.emit(newPageIndex);
  }
  saveEntityValue() {
    const selectedVal = this._selectedKeyInfo.keyScanInfo.entities[this._selectedKeyInfo.keyScanInfo.selectedEntityIndex];
    this.updateEntiyValue.emit({newValue: this.stringValue, entity: selectedVal, key: this._selectedKeyInfo});
  }
}
