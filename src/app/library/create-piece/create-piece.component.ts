import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LibraryService } from '../library.service';
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

  constructor(private libraryService: LibraryService,
              private router: Router) {}


  ngOnInit(): void {
    this.itemType = this.itemTypes[0];
    this.today = moment();
  }


  onSubmit(newPieceForm: NgForm): void {
    if (newPieceForm.invalid) {
      // the error will be shown by the validation
      return;
    }

    console.log('Submitting new item:');
    console.log(newPieceForm.form.value);

    const props = newPieceForm.form.value;
    let newPiece: Piece;
    switch (props.type) {
      case 'Book':
        newPiece = Piece.createBook(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, props.completionDate.toDate(), props.author);
        break;
      case 'Comic':
        newPiece = Piece.createComic(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, props.completionDate.toDate(), props.author, props.volume);
        break;
      case 'Movie':
        newPiece = Piece.createMovie(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, props.completionDate.toDate(), props.director, props.actors);
        break;
      case 'Series':
        newPiece = Piece.createSeries(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, props.completionDate.toDate(), props.director, props.actors, props.season);
        break;
      case 'Game':
        newPiece = Piece.createGame(
          null, props.title, props.createdIn, props.genre, props.imageUrl,
          props.summary, props.completionDate.toDate(), props.console);
        break;
      default:
        alert('ERROR : Unknown piece type : ' + props.type);
        return;
    }
    this.libraryService.createPiece(newPiece).subscribe(
      (_) => {
        // navigate back to the pieces list will reload all pieces and pick up the new one
        this.router.navigate(['library']);
      }
    );
    this.router.navigate(['library']);
  }
}
