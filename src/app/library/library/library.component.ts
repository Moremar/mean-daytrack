import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LibraryService } from '../library.service';
import { Piece } from '../model/piece.model';
import { saveAs } from 'file-saver';


// TODO Add a spinner on loading

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, OnDestroy {

  pieces: Piece[];
  piecesSub: Subscription = null;

  private _firstFetch = true;

  // TODO add a pager to set these
  pageIndex = null;
  pageSize = null;


  constructor(private libraryService: LibraryService) {
  }


  ngOnInit(): void {
    // listen to any change on the posts
    this.piecesSub = this.libraryService.getFilteredPiecesObservable().subscribe(
      (pieces: Piece[]) => {
        this.pieces = pieces;
        // intial fetch of the pieces from the backend
        if (pieces.length === 0 && this._firstFetch) {
          this.libraryService.fetchPieces(this.pageIndex, this.pageSize);
        }
        this._firstFetch = false;
      }
    );
  }

  downloadAsJson(): void {
    console.log('DEBUG - Exporting pieces as JSON');
    const fileContent = this.libraryService.getPiecesAsJson();
    const blob = new Blob([fileContent], { type: 'application/json' });
    const time = new Date();
    const timestamp = `${time.getFullYear()}`
                    + `${time.getMonth() + 1}`.padStart(2, '0')
                    + `${time.getDate()}`.padStart(2, '0')
                    + '-'
                    + `${time.getHours()}`.padStart(2, '0')
                    + `${time.getMinutes()}`.padStart(2, '0')
                    + `${time.getSeconds()}`.padStart(2, '0');
    saveAs(blob, `daytrack_backup_${timestamp}.json`);
  }

  ngOnDestroy(): void {
    this.piecesSub.unsubscribe();
  }
}
