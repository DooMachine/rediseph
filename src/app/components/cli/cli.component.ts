import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { RedisCli } from '../../models/cli';

@Component({
  selector: 'app-cli',
  templateUrl: './cli.component.html',
  styleUrls: ['./cli.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CliComponent implements OnInit {
  @Input() cli: RedisCli;
  constructor() { }

  ngOnInit() {
  }

}
