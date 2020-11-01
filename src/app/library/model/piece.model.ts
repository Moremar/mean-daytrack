import { PieceType } from './piece-type.enum';


export class Piece {

  private constructor(
    public type: PieceType,
    public title: string,
    public author: string,
    public director: string,
    public actors: string[],
    public year: string,
    public genre: string,
    public console: string,
    public imageUrl: string,
    public summary: string,
    public completionDate: Date) {}

  static createBook(title: string, author: string, year: string, genre: string,
                    imageUrl: string, summary: string, completionDate: Date): Piece {
    return new Piece(PieceType.BOOK, title, author, null, null, year, genre, null, imageUrl, summary, completionDate);
  }

  static createMovie(title: string, director: string, actors: string[], year: string, genre: string,
                     imageUrl: string, summary: string, completionDate: Date): Piece {
    return new Piece(PieceType.MOVIE, title, null, director, actors, year, genre, null, imageUrl, summary, completionDate);
  }

  static createGame(title: string, year: string, genre: string, console: string,
                    imageUrl: string, summary: string, completionDate: Date): Piece {
    return new Piece(PieceType.GAME, title, null, null, null, year, genre, console, imageUrl, summary, completionDate);
  }

  pretty(): string {
    return `${PieceType.toString(this.type)}(${this.title}, ${this.author}, ${this.director}, ${this.actors}, `
         + `${this.year}, ${this.genre}, ${this.console}, ${this.imageUrl}, ${this.summary}, ${this.completionDate})`;
  }
}
