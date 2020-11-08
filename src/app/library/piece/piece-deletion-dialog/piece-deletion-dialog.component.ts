import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


/**
 * Dialog modal for the confirmation of the deletion of a piece
 */

@Component({
  selector: 'app-piece-deletion-dialog',
  templateUrl: './piece-deletion-dialog.component.html',
  styleUrls: ['./piece-deletion-dialog.component.css']
})
export class PieceDeletionDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PieceDeletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {pieceTitle: string}) {}

  ngOnInit(): void {}
}
