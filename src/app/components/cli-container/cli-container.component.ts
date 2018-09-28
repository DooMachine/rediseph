import { Component, OnInit, ChangeDetectionStrategy,
   Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { RedisCli } from '../../models/cli';

@Component({
  selector: 'app-cli-container',
  templateUrl: './cli-container.component.html',
  styleUrls: ['./cli-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CliContainerComponent implements OnInit, OnChanges {
  @ViewChild('lineArea') lineRef: ElementRef;

  @Output() submitLine = new EventEmitter();
  @Output() toggleCli = new EventEmitter();
  @Input() redisId: string;
  cliInput = '';

  currentRedisCli: RedisCli;
  redisClis: Array<RedisCli>;
  @Input('allRedisClis')
  set value(clis: Array<RedisCli>) {
    this.redisClis = clis;
    this.currentRedisCli = this.redisClis.find(p => p.redisId === this.redisId);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.currentRedisCli = this.redisClis.find(p => p.redisId === this.redisId);
  }
  constructor() { }

  ngOnInit() {
  }
  onSubmit() {
    console.log(this.cliInput);
    if (this.cliInput.length > 0) {
      this.submitLine.emit({redisId: this.redisId, line: this.cliInput});
    }
  }
  scrollToBottom() {
    try {
      this.lineRef.nativeElement.scrollTop = this.lineRef.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
