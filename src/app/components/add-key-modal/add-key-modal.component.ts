import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddKeyModel } from '../../models/redis';

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

  ngOnInit() {
  }

}
