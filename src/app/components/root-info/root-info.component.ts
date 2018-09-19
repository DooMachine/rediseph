import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TableInfo } from 'src/app/models/table-helpers';

@Component({
  selector: 'app-root-info',
  templateUrl: './root-info.component.html',
  styleUrls: ['./root-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootInfoComponent implements OnInit {
  @Input() tableInfo: TableInfo<any>;
  constructor() { }

  ngOnInit() {
  }

}
