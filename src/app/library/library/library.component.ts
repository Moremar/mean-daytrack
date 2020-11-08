import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LibraryService } from '../library.service';
import { Piece } from '../model/piece.model';


// TODO Add a spinner on loading

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, OnDestroy {

  pieces: Piece[];
  piecesSub: Subscription = null;

  // TODO add a pager to set these
  pageIndex = null;
  pageSize = null;


  constructor(private libraryService: LibraryService) {
  }


  ngOnInit(): void {
    // fetch the posts from the backend
    this.libraryService.fetchPieces(this.pageIndex, this.pageSize);
    // listen to any change on the posts
    this.piecesSub = this.libraryService.getPiecesObservable().subscribe(
      (pieces: Piece[]) => {
        this.pieces = pieces;
      }
    );
  }


  ngOnDestroy(): void {
    this.piecesSub.unsubscribe();
  }
}
