import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Piece } from './model/piece.model';
import { RestGetPiecesResponse, RestPostPieceResponse } from './model/rest-pieces.model';


const PIECES_URL = environment.backendUrl + '/pieces';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private _piecesSubject = new BehaviorSubject<Piece[]>([]);


  constructor(private http: HttpClient) {
  }


  // expose the pieces as a read-only observable (so the pieces list is modified only by the service)
  getPiecesObservable(): Observable<Piece[]> {
    return this._piecesSubject.asObservable();
  }


  fetchPieces(pageIndex: number, pageSize: number): void {
    console.log('DEBUG - Fetching pieces from the backend ' + pageIndex + '/' + pageSize);
    const url = PIECES_URL + '?pageIndex=' + pageIndex + '&pageSize=' + pageSize;
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
      this._piecesSubject.next(pieces);
    });
  }


  createPiece(newPiece: Piece): Observable<Piece> {
    console.log(`Adding new piece ${newPiece.pretty()}`);

    if (newPiece.id != null) {
      throw Error('A new piece must have a null ID, found ' + newPiece.id);
    }

    return this.http.post(PIECES_URL, newPiece.toRestPiece()).pipe(
      map( (httpResponse: RestPostPieceResponse) => {
        console.log('Received response from POST ' + PIECES_URL);
        console.log(httpResponse);
        // this.totalPostsObs.next(httpResponse.total);
        newPiece.id = httpResponse.piece._id;
        return newPiece;
      })
    );
  }
}
