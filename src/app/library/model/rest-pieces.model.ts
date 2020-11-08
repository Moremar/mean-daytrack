// REST reprensetation of a piece fetched from the the backend
export class RestPiece {
  constructor(
    public _id: string,
    public type: string,
    public title: string,
    public year: number,
    public genre: string,
    public imageUrl: string,
    public summary: string,
    public completionDate: Date,
    public author: string,
    public director: string,
    public actors: string[],
    public console: string,
    public season: number,
    public volume: number
) {}
}

// REST response from the backend on GET /api/pieces
export interface RestGetPiecesResponse {
  message: string;
  pieces: RestPiece[];
  total: number;
}

// REST response from the backend on POST /api/pieces
export interface RestPostPieceResponse {
  message: string;
  piece: RestPiece;
}

// REST response from the backend on DELETE /api/pieces/:id
export interface RestDeletePieceResponse {
  message: string;
  piece: RestPiece;
}
