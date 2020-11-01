import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Piece } from './model/piece.model';


@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  public piecesSubject = new BehaviorSubject<Piece[]>([]);

  // TODO hardcoded in the frontend for now, will come from the backend later
  private _pieces: Piece[] = [
    Piece.createBook('Along came a spider', 'James Patterson', '2002', 'Thriller',
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1388272560l/13145.jpg',
      'When a congressman\'s daughter under Secret Service protection is kidnapped from a private '
      + 'school, detective Alex Cross investigates the case even though he is recovering from the '
      + 'loss of his partner.', new Date('2020/01/23')),
    Piece.createMovie('Harry Potter 1', 'Chris Columbus', ['Daniel Radcliff', 'Emma Watson'], '2001', 'Fantasy',
      'https://images-na.ssl-images-amazon.com/images/I/71dtmwLA3ML._AC_SY741_.jpg',
      'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, '
      + 'his family and the terrible evil that haunts the magical world.', new Date('2008/02/23')),
    Piece.createGame('The Witcher 3 : Wild Hunt', '2015', 'RPG', 'PS4',
       'https://store-images.s-microsoft.com/image/apps.28990.69531514236615003.8f0d03d6-6311-4c21-a151-834503c2901a.d629260e-2bc4-4588-950c-f278cbc22a64',
      'Geralt of Rivia, a monster hunter for hire, embarks on an epic journey to find his former '
      + 'apprentice, Ciri, before The Wild Hunt can capture her and bring about the destruction of '
      + 'the world.', new Date('2020/09/11')),
  ];


  constructor() {
    this.piecesSubject.next(this._pieces.slice());
  }


  createPiece(piece: Piece): void {
    console.log(`Adding piece ${piece.pretty()}`);
    // TODO call backend to create the new piece
    this._pieces.push(piece);
    this.piecesSubject.next(this._pieces.slice());
  }
}
