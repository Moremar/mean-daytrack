import { PieceType } from './piece-type.enum';
import { Piece } from './piece.model';

// TODO add piece types to the filter (for ex filter on books and movies)


export class PieceFilter {
    private _textFilter: string = null;
    private _pieceTypeFilter: PieceType = null;

    constructor() {}

    setTextFilter(textFilter: string): void {
      if (textFilter) {
        this._textFilter = textFilter.toLowerCase();
      } else {
          this._textFilter = null;
      }
    }

    setPieceTypeFilter(pieceType: PieceType): void {
      this._pieceTypeFilter = pieceType;
    }

    accept(piece: Piece): boolean {
        // filter on the piece type
        if (this._pieceTypeFilter !== null && piece.type !== this._pieceTypeFilter) {
          return false;
        }

        if (!this._textFilter) {
          // no text filter applied
          return true;
        }

        // concatenate all fields that should be checked by the filter
        const toMatch = [piece.title];
        if (piece.genre)          { toMatch.push(piece.genre);           }
        if (piece.year)           { toMatch.push(piece.year.toString()); }
        if (piece.summary)        { toMatch.push(piece.summary);         }
        if (piece.author)         { toMatch.push(piece.author);          }
        if (piece.director)       { toMatch.push(piece.director);        }
        if (piece.actors)         { toMatch.push(...piece.actors);       } // spread syntax
        if (piece.console)        { toMatch.push(piece.console);         }
        if (piece.completionDate) {
            const date = `${piece.completionDate.getDate()}`.padStart(2, '0') + '/'
                       + `${piece.completionDate.getMonth() + 1}`.padStart(2, '0') + '/'
                       + `${piece.completionDate.getFullYear()}`;
            toMatch.push(date);
        }

        return toMatch.join(' ').toLowerCase().includes(this._textFilter);
    }
}
