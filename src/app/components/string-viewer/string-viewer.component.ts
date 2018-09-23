import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SelectedKeyInfo } from '../../models/redis';

@Component({
  selector: 'app-string-viewer',
  templateUrl: './string-viewer.component.html',
  styleUrls: ['./string-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StringViewerComponent implements OnInit {
  constructor() { }
  @Output() saveNewValue = new EventEmitter();

  isRealtime = false;
  editorOptions = {
    lineNumbers: false,
    theme: 'material',
    mode: 'markdown'
  };
  stringValue = '';
  newValue = '';
  key = '';
  @Input('selectedKeyInfo')
  set value(v: SelectedKeyInfo) {
    this.stringValue = v.value || '';
    this.key = v.key;
    this.isRealtime = v.isMonitoring;
    if (v.value.startsWith('{')) {
      this.editorOptions.mode = 'json';
    } else if (v.value.startsWith('<')) {
      this.editorOptions.mode = 'text/html';
    }
  }
  saveStringKeyValue() {
    this.saveNewValue.emit(this.stringValue);
  }
  ngOnInit() {
  }

}
