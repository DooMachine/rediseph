import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SelectedKeyInfo } from '../../models/redis';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-list-viewer',
  templateUrl: './list-viewer.component.html',
  styleUrls: ['./list-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewerComponent implements OnInit {

  isSelectible = false;
  multipleActions = [];
  _selectedKeyInfo: SelectedKeyInfo;
  displayedColumns = [];
  formModel: any = {
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
        this.displayedColumns.push('score');
        this.displayedColumns.push('value');
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
    console.log(this.formModel);
  }
  selectEntity(entity) {
    console.log(entity);
  }
}
