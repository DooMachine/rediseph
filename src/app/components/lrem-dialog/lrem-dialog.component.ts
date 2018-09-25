import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';




/**
 * LREM dialog component
 */
@Component({
  selector: 'app-lrem-dialog',
  templateUrl: './lrem-dialog.component.html',
  styleUrls: ['./lrem-dialog.component.scss']
})
export class LremDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LremDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }
  ngOnInit() {
  }

  onConfirm() {
    this.dialogRef.close(this.data);
    }
}
