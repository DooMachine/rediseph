import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddKeyModel, DataType } from '../../models/redis';

@Component({
  selector: 'app-add-key-modal',
  templateUrl: './add-key-modal.component.html',
  styleUrls: ['./add-key-modal.component.scss']
})
export class AddKeyModalComponent implements OnInit {
  errors: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<AddKeyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddKeyModel
    ) {
    }
  selectOptions = [DataType.string, DataType.set, DataType.list, DataType.hashmap, DataType.sortedset];
  ngOnInit() {
  }

  onSubmit() {
    this.errors = [];
    console.log(this.data);
    if (!this.data.key) {
      this.errors.push('Key required');
    }
    if (!this.data.redisId) {
      this.errors.push('Redis instance not exist!');
    }
    if (this.errors.length === 0) {
      this.dialogRef.close(this.data);
    }
  }
  onNoClick() {
    this.dialogRef.close();
  }
}
