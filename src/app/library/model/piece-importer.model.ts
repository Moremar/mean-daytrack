import { Piece } from './piece.model';

export class PieceImporter {

  constructor() {}

  import(jsonPieces: string): Piece[] {
    const pieces: Piece[] = [];
    const parsed = JSON.parse(jsonPieces);
    for (const parsedPiece of parsed) {
      pieces.push(Piece.fromJson(parsedPiece));
    }
    return pieces;
  }
}
