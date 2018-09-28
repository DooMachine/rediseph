import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddKeyModel } from '../../models/redis';

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss']
})
export class RenameDialogComponent implements OnInit {

  errors: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

  ngOnInit() {
  }

  onSubmit() {
    this.errors = [];
    console.log(this.data);
    if (!this.data.newKey) {
      this.errors.push('Key required');
    }
    if (this.errors.length === 0) {
      this.dialogRef.close(this.data);
    }
  }
  onNoClick() {
    this.dialogRef.close();
  }
}
