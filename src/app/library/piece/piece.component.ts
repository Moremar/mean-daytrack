import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog } from '@angular/material/dialog';

import { LibraryService } from '../library.service';
import { PieceType } from '../model/piece-type.enum';
import { Piece } from '../model/piece.model';
import { PieceDeletionDialogComponent } from './piece-deletion-dialog/piece-deletion-dialog.component';

// TODO add in the template the completion date (maybe in header and move year + author inside the card)

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit {

  @Input() piece: Piece;
  panelOpenState: boolean;

  constructor(private libraryService: LibraryService,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit(): void {
  }


  getIcon(): string {
    switch (this.piece.type) {
      case PieceType.BOOK: return '../../../assets/images/book.svg';
      case PieceType.COMIC: return '../../../assets/images/comic.svg';
      case PieceType.MOVIE: return '../../../assets/images/movie.svg';
      case PieceType.SERIES: return '../../../assets/images/series.svg';
      case PieceType.GAME: return '../../../assets/images/game.svg';
      default:
        throw Error('ERROR - No icon found for piece type ' + this.piece.type);
    }
  }


  isType(type: string): boolean {
    return PieceType.toString(this.piece.type) === type;
  }

  hasCast(): boolean {
    return (this.isType('Series') || this.isType('Movie')) && this.piece.actors.length > 0;
  }

  hasVolume(): boolean {
    return this.isType('Comic') && this.piece.volume != null;
  }

  hasSeason(): boolean {
    return this.isType('Series') && this.piece.season != null;
  }


  onEdit(event: Event): void {
    // prevent the card to open when the Delete button is clicked
    event.stopPropagation();
    this.router.navigate(['edit', this.piece.id]);
  }


  onDelete(event: Event): void {
    // prevent the card to open when the Delete button is clicked
    event.stopPropagation();

    // Confirmation popup with Angular Material : https://material.angular.io/components/dialog/overview
    const dialogRef = this.dialog.open(PieceDeletionDialogComponent, {
      width: '500px',
      data: {pieceTitle: this.piece.title}
    });
    dialogRef.afterClosed().subscribe(confirmDeletion => {
      if (confirmDeletion) {
        this.libraryService.deletePiece(this.piece.id).subscribe(
          (_) => {
            this.libraryService.fetchPieces(null, null);
            this.router.navigate(['library']);
          }
        );
      }
    });
  }
}
