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
  @Input('selectedKeyInfo')
  set selectedKeyInfo(v: SelectedKeyInfo) {
    this._selectedKeyInfo = v;
    console.log(v.keyScanInfo.entities);
    this.isSelectible = v.type === 'set' || v.type === 'zset' || v.type === 'hset';
    if (this.isSelectible) {
      this.multipleActions.push({name: 'Delete', color: 'warn'});
    }
    switch (v.type) {
      case 'set':
      {
        break;
      }
      case 'zset':
      {
        this.displayedColumns.push('score');
        break;
      }
      case 'hset':
      {
        this.displayedColumns.push('hash');
        break;
      }
      case 'list':
      {
        break;
      }
      default:
        break;
    }
    this.displayedColumns.push('value');
  }

  constructor() { }

  ngOnInit() {
  }

  selectEntity(entity) {
    console.log(entity);
  }
}
