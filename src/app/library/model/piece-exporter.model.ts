import { Piece } from './piece.model';

export class PieceExporter {

  constructor() {}

  export(pieces: Piece[]): string {
    const lines: string[] = [];
    for (const piece of pieces) {
      if (pieces.indexOf(piece) === pieces.length - 1) {
        // last piece does not have a trailing comma
        lines.push(piece.toJsonString());
      } else {
        lines.push(piece.toJsonString() + ',');

      }
    }
    return '[\n' + lines.join('\n') + '\n]';
  }
}
