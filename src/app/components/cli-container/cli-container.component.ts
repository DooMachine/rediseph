import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RedisCli } from '../../models/cli';

@Component({
  selector: 'app-cli-container',
  templateUrl: './cli-container.component.html',
  styleUrls: ['./cli-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CliContainerComponent implements OnInit {
  @ViewChild('lineArea') lineRef: ElementRef;

  @Output() submitLine = new EventEmitter();
  @Input() redisId: string;
  cliInput: string;

  currentRedisCli: RedisCli;
  redisClis: Array<RedisCli>;
  @Input('allRedisClis')
  set value(clis: Array<RedisCli>) {
    this.redisClis = clis;
    this.currentRedisCli = this.redisClis.find(p => p.redisId === this.redisId);
  }

  @Output() toggleCli = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  onSubmit() {
    if (this.cliInput.length > 0) {
      this.submitLine.emit(this.cliInput);
    }
  }
  scrollToBottom() {
    try {
      this.lineRef.nativeElement.scrollTop = this.lineRef.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
