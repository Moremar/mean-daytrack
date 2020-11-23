import { Component, OnInit } from '@angular/core';

import { LibraryService } from '../library.service';
import { PieceType } from '../model/piece-type.enum';


@Component({
  selector: 'app-pieces-filter',
  templateUrl: './pieces-filter.component.html',
  styleUrls: ['./pieces-filter.component.css']
})
export class PiecesFilterComponent implements OnInit {

  // booleans to decide the state of the piece type icons in the HTML
  bookSelected = false;
  comicSelected = false;
  movieSelected = false;
  seriesSelected = false;
  gameSelected = false;

  constructor(private libraryService: LibraryService) { }

  ngOnInit(): void {
  }

  onKeyUp(event: KeyboardEvent): void {
    const searchFilter = (event.target as HTMLInputElement).value;
    this.libraryService.updateTextFilter(searchFilter);
  }

  isSelected(pieceType: PieceType): boolean {
    switch (pieceType) {
      case PieceType.BOOK: return this.bookSelected;
      case PieceType.COMIC: return this.comicSelected;
      case PieceType.MOVIE: return this.movieSelected;
      case PieceType.SERIES: return this.seriesSelected;
      case PieceType.GAME: return this.gameSelected;
      default: throw Error(`Unknown piece type: ${pieceType}`);
    }
  }

  getSelectedType(): PieceType {
    for (const pieceType of [PieceType.BOOK, PieceType.COMIC, PieceType.MOVIE, PieceType.SERIES, PieceType.GAME]) {
      if (this.isSelected(pieceType)) {
        return pieceType;
      }
    }
    return null;
  }

  clearTypeFilterBooleans(): void {
    this.bookSelected = false;
    this.comicSelected = false;
    this.movieSelected = false;
    this.seriesSelected = false;
    this.gameSelected = false;
  }

  setTypeFilterBoolean(pieceType: PieceType): void {
    if (pieceType === PieceType.BOOK)        { this.bookSelected = true;   }
    else if (pieceType === PieceType.COMIC)  { this.comicSelected = true;  }
    else if (pieceType === PieceType.MOVIE)  { this.movieSelected = true;  }
    else if (pieceType === PieceType.SERIES) { this.seriesSelected = true; }
    else if (pieceType === PieceType.GAME)   { this.gameSelected = true;   }
  }


  togglePieceType(pieceType: PieceType): void {
    if (this.isSelected(pieceType)) {
      // clear type filter
      this.clearTypeFilterBooleans();
    } else {
      // set new type filter
      this.clearTypeFilterBooleans();
      this.setTypeFilterBoolean(pieceType);
    }
    this.libraryService.updateTypeFilter(this.getSelectedType());
  }

  onTypeClick(pieceTypeStr: string): void {
    this.togglePieceType(PieceType.fromString(pieceTypeStr));
  }
}
