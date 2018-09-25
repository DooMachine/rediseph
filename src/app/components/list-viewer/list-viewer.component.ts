import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { SelectedKeyInfo, NewEntityModel } from '../../models/redis';
import { MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-list-viewer',
  templateUrl: './list-viewer.component.html',
  styleUrls: ['./list-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewerComponent implements OnInit {
  @Output() searchInputChanged = new EventEmitter();
  searchPattern = '';

  @Output() selectEntityIndex = new EventEmitter();
  @Output() newValueAdd = new EventEmitter();
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
    }
    this.newValueAdd.emit(this.formModel);
  }
  clickSearch() {
    this.searchInputChanged.emit(this.searchPattern);
  }
}
