import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import { LibraryService } from '../library.service';
import { PieceType } from '../model/piece-type.enum';
import { Piece } from '../model/piece.model';


// TODO currently the actors are given as a comma-separated list, we could have a nicer GUI
//      with one control per actor, and a button to add a new one
//      That would require to switch to the ReactiveForm approach

@Component({
  selector: 'app-create-piece',
  templateUrl: './create-piece.component.html',
  styleUrls: ['./create-piece.component.css']
})
export class CreatePieceComponent implements OnInit {

  itemType: string = null;
  itemTypes = ['Book', 'Comic', 'Movie', 'Series', 'Game'];
  today: moment.Moment;
  loading = false;
  editionMode = false;
  editedPiece: Piece = null;

  @ViewChild('pieceForm') pieceForm: NgForm;

  constructor(private libraryService: LibraryService,
              private router: Router,
              private activeRoute: ActivatedRoute) {}


  ngOnInit(): void {
    this.loading = true;
    this.activeRoute.paramMap.subscribe(
      (paramMap) => {
        this.editionMode = paramMap.has('id');
        if (this.editionMode) {
          // load the piece to edit
          this.libraryService.getPieceObservable(paramMap.get('id')).subscribe((piece: Piece) => {
            this.editedPiece = piece;

            // set the piece type to update the form, and include set setValue() in a setTimeout()
            // so the NgForm controls gets refreshed with the actual piece type
            this.itemType = PieceType.toString(this.editedPiece.type);

            setTimeout(() => {
            // pre-populate the form with the edited piece
            let initialValue: any = {
              // common fields
              type: PieceType.toString(this.editedPiece.type),
              title: this.editedPiece.title,
              genre: this.editedPiece.genre,
              summary: this.editedPiece.summary,
              createdIn: this.editedPiece.year,
              imageUrl: this.editedPiece.imageUrl,
              completionDate: this.editedPiece.completionDate
            };
            // piece-type specific fields
            if (this.editedPiece.type === PieceType.BOOK || this.editedPiece.type === PieceType.COMIC) {
              initialValue = { ...initialValue, author: this.editedPiece.author };
            }
            if (this.editedPiece.type === PieceType.MOVIE || this.editedPiece.type === PieceType.SERIES) {
              initialValue = { ...initialValue, director: this.editedPiece.director, actors: this.editedPiece.actors.join(', ') };
            }
            if (this.editedPiece.type === PieceType.GAME) {
              initialValue = { ...initialValue, console: this.editedPiece.console };
            }
            if (this.editedPiece.type === PieceType.COMIC) {
              initialValue = { ...initialValue, volume: this.editedPiece.volume };
            }
            if (this.editedPiece.type === PieceType.SERIES) {
              initialValue = { ...initialValue, season: this.editedPiece.season };
            }
            this.pieceForm.setValue(initialValue);
            });
          });
        } else {
          // creation mode
          this.itemType = PieceType.toString(PieceType.BOOK);
          this.today = moment();
        }
        this.loading = false;
      }
    );
  }


  onSubmit(newPieceForm: NgForm): void {
    if (newPieceForm.invalid) {
      // the error will be shown by the validation
      return;
    }

    const props = newPieceForm.form.value;
    let newPiece: Piece;

    // completionDate is either a Moment (if selected in the date picker) or a Date (if populated from the backend)
    const completionDate = props.completionDate instanceof Date ? props.completionDate : props.completionDate.toDate();

    // trim and filter actors list
    let actors = [];
    if (props.actors) {
      actors = props.actors.split(',').map(x => x.trim()).filter(x => x.length > 0);
    }

    switch (props.type) {
      case 'Book':
        newPiece = Piece.createBook(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, completionDate, props.author);
        break;
      case 'Comic':
        newPiece = Piece.createComic(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, completionDate, props.author, props.volume);
        break;
      case 'Movie':
        newPiece = Piece.createMovie(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, completionDate, props.director, actors);
        break;
      case 'Series':
        newPiece = Piece.createSeries(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, completionDate, props.director, actors, props.season);
        break;
      case 'Game':
        newPiece = Piece.createGame(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, completionDate, props.console);
        break;
      default:
        throw Error('Unknown piece type : ' + props.type);
    }

    if (this.editionMode) {
      newPiece.id = this.editedPiece.id;
      this.libraryService.updatePiece(newPiece).subscribe(
        (_) => {
          // now that the piece is updated in the backend, refetch pieces and move back to library
          this.libraryService.fetchPieces(null, null);
          this.router.navigate(['library']);
        }
      );
    } else {
      this.libraryService.createPiece(newPiece).subscribe(
        (_) => {
          // now that the new piece is created in the backend, refetch pieces and move back to library
          this.libraryService.fetchPieces(null, null);
          this.router.navigate(['library']);
        }
      );
    }
    this.router.navigate(['library']);
  }
}
