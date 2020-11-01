import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LibraryService } from '../library.service';
import { Piece } from '../model/piece.model';


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
          props.title, props.author, props.createdIn, props.genre,
          props.imageUrl, props.summary, props.completionDate.toDate());
        break;
      case 'Movie':
        newPiece = Piece.createMovie(
          props.title, props.director, props.actors, props.createdIn, props.genre,
          props.imageUrl, props.summary, props.completionDate.toDate());
        break;
        case 'Game':
          newPiece = Piece.createGame(
            props.title, props.createdIn, props.genre, props.console,
            props.imageUrl, props.summary, props.completionDate.toDate());
          break;
        default:
          alert('ERROR : Unknown piece type : ' + props.type);
          return;
    }
    this.libraryService.createPiece(newPiece);
    this.router.navigate(['library']);
  }
}
