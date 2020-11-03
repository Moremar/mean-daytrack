import { Component, Input, OnInit } from '@angular/core';
import { PieceType } from '../model/piece-type.enum';
import { Piece } from '../model/piece.model';


@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit {

  @Input() piece: Piece;
  panelOpenState: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log('YEAR = ');
    console.log(this.piece.year);
  }


  getIcon(): string {
    switch (this.piece.type) {
      case PieceType.BOOK: return '../../../assets/images/book.svg';
      case PieceType.COMIC: return '../../../assets/images/comic.svg';
      case PieceType.MOVIE: return '../../../assets/images/movie.svg';
      case PieceType.SERIES: return '../../../assets/images/series.svg';
      case PieceType.GAME: return '../../../assets/images/game.svg';
      default: return 'NOT FOUND';
    }
  }


  isType(type: string): boolean {
    return PieceType.toString(this.piece.type) === type;
  }

  hasCast(): boolean {
    return (this.isType('Series') || this.isType('Movie')) && this.piece.actors.length > 0;
  }
}