import { Component, OnInit, Input } from '@angular/core';
import { SelectedKeyInfo } from '../../models/redis';

@Component({
  selector: 'app-string-viewer',
  templateUrl: './string-viewer.component.html',
  styleUrls: ['./string-viewer.component.scss'],
})
export class StringViewerComponent implements OnInit {
  constructor() { }
  stringValue = '';
  @Input('selectedKeyInfo')
  set value(v: SelectedKeyInfo) {
    console.log(v);
    this.stringValue = v.value || '';
  }

  ngOnInit() {
  }

}
