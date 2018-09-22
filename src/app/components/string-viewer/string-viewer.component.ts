import { Component, OnInit, Input } from '@angular/core';
import { SelectedKeyInfo } from '../../models/redis';

@Component({
  selector: 'app-string-viewer',
  templateUrl: './string-viewer.component.html',
  styleUrls: ['./string-viewer.component.scss'],
})
export class StringViewerComponent implements OnInit {
  constructor() { }
  isRealtime = false;
  editorOptions = {theme: 'vs-dark', language: 'text/plain' };
  stringValue = '';
  @Input('selectedKeyInfo')
  set value(v: SelectedKeyInfo) {
    this.stringValue = v.value || '';
    this.isRealtime = v.isMonitoring;
    if (v.value.startsWith('{')) {
      this.editorOptions.language = 'json';
    } else if (v.value.startsWith('<')) {
      this.editorOptions.language = 'html';
    }
  }

  ngOnInit() {
  }

}
