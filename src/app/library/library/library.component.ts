import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LibraryService } from '../library.service';
import { Piece } from '../model/piece.model';


@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, OnDestroy {

  pieces: Piece[];
  piecesSub: Subscription = null;

  constructor(private libraryService: LibraryService) {
  }


  ngOnInit(): void {
    this.piecesSub = this.libraryService.piecesSubject.subscribe(
      (pieces: Piece[]) => {
        this.pieces = pieces;
      }
    );
  }


  ngOnDestroy(): void {
    this.piecesSub.unsubscribe();
  }
}
