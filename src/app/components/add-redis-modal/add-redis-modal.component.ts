import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConnectServerModel } from '../../models/redis';

@Component({
  selector: 'app-add-redis-modal',
  templateUrl: './add-redis-modal.component.html',
  styleUrls: ['./add-redis-modal.component.scss']
})
export class AddRedisModalComponent implements OnInit {
  errors: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<AddRedisModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConnectServerModel
    ) {
    }

  ngOnInit() {

  }
  onSubmit() {
    this.errors = [];
    if (!this.data.db) {
      this.data.db = 0;
    }
    if (!this.data.name) {
      this.data.name = this.data.ip;
    }
    if (!this.data.ip) {
      this.errors.push('Ip/host required');
    }
    if (!this.data.port) {
      this.errors.push('Port required');
    }
    if (this.errors.length === 0) {
      this.dialogRef.close(this.data);
    }
  }
  onNoClick() {
    this.dialogRef.close();
  }
}
