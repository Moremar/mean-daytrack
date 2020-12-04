import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Piece } from './model/piece.model';
import { RestGetPiecesResponse, RestGetPieceResponse, RestPutPiecesResponse, RestPutPieceResponse,
         RestPostPieceResponse, RestDeletePieceResponse, RestPiece } from './model/rest-pieces.model';
import { PieceFilter } from './model/piece-filter.model';
import { PieceType } from './model/piece-type.enum';
import { PieceExporter } from './model/piece-exporter.model';
import { PieceImporter } from './model/piece-importer.model';


const PIECES_URL = environment.backendUrl + '/pieces';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private _allPieces: Piece[] = [];
  private _filteredPiecesSubject = new BehaviorSubject<Piece[]>([]);
  private _pieceFilter = new PieceFilter();

  constructor(private http: HttpClient) {
  }

  // called on logout to not keep the pieces in memory
  clearPieces(): void {
    this._allPieces = [];
    this._filteredPiecesSubject.next([]);
    this._pieceFilter = new PieceFilter();
  }

  // expose the pieces as a read-only observable (so the pieces list is modified only by the service)
  getFilteredPiecesObservable(): Observable<Piece[]> {
    return this._filteredPiecesSubject.asObservable();
  }

  getPieceObservable(pieceId: string): Observable<Piece> {
    console.log('DEBUG - Fetching piece ' + pieceId + ' from the backend');
    const url = `${PIECES_URL}/${pieceId}`;
    return this.http.get(url).pipe(
      map((httpResponse: RestGetPieceResponse) => {
        return Piece.fromRestPiece(httpResponse.piece);
      })
    );
  }


  // TODO the pageIndex and pageSize may need to be set in the service instead of provided with arguments,
  //      since the fetch is called from places not aware of the page settings (e.g. component deletion or creation)

  fetchPieces(pageIndex: number, pageSize: number): void {
    console.log('DEBUG - Fetching pieces from the backend ' + pageIndex + '/' + pageSize);
    const url = `${PIECES_URL}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    this.http.get(url).pipe(
      map( (httpResponse: RestGetPiecesResponse) => {
        console.log('Received response from GET ' + url);
        console.log(httpResponse);
        // this.totalPostsObs.next(httpResponse.total);
        return httpResponse.pieces.map( restPiece => {
          return Piece.fromRestPiece(restPiece);
        });
      })
    )
    .subscribe( (pieces: Piece[]) => {
      this._allPieces = pieces;
      this.updateFilteredPieces();
    });
  }


  // Piece Creation
  createPiece(newPiece: Piece): Observable<Piece> {
    console.log(`Adding new piece ${newPiece.pretty()}`);

    if (newPiece.id != null) {
      throw Error('A new piece must have a null ID, found ' + newPiece.id);
    }

    return this.http.post(PIECES_URL, newPiece.toRestPiece()).pipe(
      map( (httpResponse: RestPostPieceResponse) => {
        console.log('Received response from POST ' + PIECES_URL);
        console.log(httpResponse);
        return Piece.fromRestPiece(httpResponse.piece);
      })
    );
  }

  // Pieces import
  importPieces(pieces: Piece[]): Observable<Piece[]> {
    console.log('Importing pieces from JSON file.');

    const restPieces: RestPiece[] = pieces.map(x => x.toRestPiece());

    return this.http.put(PIECES_URL, { pieces: restPieces }).pipe(
      map( (httpResponse: RestPutPiecesResponse) => {
        console.log('Received response from PUT ' + PIECES_URL);
        console.log(httpResponse);
        return httpResponse.pieces.map(x => Piece.fromRestPiece(x));
      })
    );
  }


  // Piece edition
  updatePiece(newPiece: Piece): Observable<Piece> {
    console.log(`Editing existing piece ${newPiece.pretty()}`);

    if (newPiece.id == null) {
      throw Error('A piece ID is required to edit a piece');
    }

    const url = `${PIECES_URL}/${newPiece.id}`;
    return this.http.put(url, newPiece.toRestPiece()).pipe(
      map( (httpResponse: RestPutPieceResponse) => {
        console.log('Received response from PUT ' + url);
        console.log(httpResponse);
        return Piece.fromRestPiece(httpResponse.piece);
      })
    );
  }


  // Piece Deletion
  deletePiece(pieceId: string): Observable<Piece> {
    console.log(`Deleting piece with ID = ${pieceId}`);

    if (pieceId == null) {
      throw Error('The ID of the piece to delete is required');
    }

    const url = PIECES_URL + '/' + pieceId;
    return this.http.delete(url).pipe(
      map( (httpResponse: RestDeletePieceResponse) => {
        console.log('Received response from DELETE ' + url);
        console.log(httpResponse);
        return Piece.fromRestPiece(httpResponse.piece);
      })
    );
  }

  updateTextFilter(textFilter: string): void {
    this._pieceFilter.setTextFilter(textFilter);
    this.updateFilteredPieces();
  }

  updateTypeFilter(pieceType: PieceType): void {
    this._pieceFilter.setPieceTypeFilter(pieceType);
    this.updateFilteredPieces();
  }

  updateWishlistFilter(wishlist: boolean): void {
    this._pieceFilter.setWishlistFilter(wishlist);
    this.updateFilteredPieces();
  }

  updateFilteredPieces(): void {
    const filtered: Piece[] = this._allPieces.filter( x => this._pieceFilter.accept(x) );
    this._filteredPiecesSubject.next(filtered);
  }

  getPiecesAsJson(): string {
    const pieces = this._filteredPiecesSubject.getValue();
    const exporter = new PieceExporter();
    return exporter.export(pieces);
  }

  importPiecesFromJson(json: string): Observable<Piece[]> {
    const importer = new PieceImporter();
    const piecesToImport = importer.import(json);
    return this.importPieces(piecesToImport);
  }
}
