export enum PieceType {
  BOOK   = 0,
  COMIC  = 1,
  MOVIE  = 2,
  SERIES = 3,
  GAME   = 4
}

// Javascript hack to allow an enum class to have a toString(enum) method
// It is used just like if the enum class had the method, but in reality
// we create a namespace with the same name as the enum

// tslint:disable-next-line:no-namespace
export namespace PieceType {

  export function toString(pieceType: PieceType): string {
    switch (pieceType) {
      case PieceType.BOOK:   return 'Book';
      case PieceType.COMIC:  return 'Comic';
      case PieceType.MOVIE:  return 'Movie';
      case PieceType.SERIES: return 'Series';
      case PieceType.GAME:   return 'Game';
      default: throw new Error('Unexpected PieceType argument : ' + pieceType);
    }
  }

  export function fromString(pieceTypeStr: string): PieceType {
    switch (pieceTypeStr) {
      case 'Book':   return PieceType.BOOK;
      case 'Comic':  return PieceType.COMIC;
      case 'Movie':  return PieceType.MOVIE;
      case 'Series': return PieceType.SERIES;
      case 'Game':   return PieceType.GAME;
      default: throw new Error('Unexpected string argument : ' + pieceTypeStr);
    }
  }
}
