import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LibraryService } from '../library.service';
import { Piece } from '../model/piece.model';


@Component({
  selector: 'app-import-pieces',
  templateUrl: './import-pieces.component.html',
  styleUrls: ['./import-pieces.component.css']
})
export class ImportPiecesComponent implements OnInit {

  private _selectedFile: File = null;
  fileName = '(no file selected)';

  // reactive form (required for file upload)
  importForm: FormGroup;

  // set to true on validate to display error message for missing image
  // (not used for Material inputs since already handled)
  mustValidate = false;

  // feedback in the GUI of the result of the import
  successMessage: string = null;
  errorMessage: string = null;

  // TODO always false for now, make a spinner while loading
  loading = false;


  constructor(private libraryService: LibraryService) { }

  ngOnInit(): void {
    // create the form
    this.importForm = new FormGroup({
      // we validate the selected file, but no control in the HTML actually binds to it
      // it is set from the code when a file is selected
      jsonFile: new FormControl(null, {validators: Validators.required })
    });
  }

  onFileSelected(event: Event): void {
    this._selectedFile = (event.target as HTMLInputElement).files[0];
    console.log('DEBUG - Selected file ' + this._selectedFile.name);
    this.fileName = this._selectedFile.name;
    this.importForm.patchValue({jsonFile: this._selectedFile});
  }

  onImport(): void {
    if (this.importForm.invalid) {
      // the validation in the HTML will show the error
      this.mustValidate = true;
      return;
    }

    this.successMessage = null;
    this.errorMessage = null;

    // process the JSON file
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.libraryService.importPiecesFromJson(fileReader.result as string).subscribe(
        (_pieces: Piece[]) => {
          this.successMessage = 'The JSON backup file was imported successfully.';
        },
        (err: HttpErrorResponse) => {
          // the error will show in the login screen
          if (err.error && err.error.errorType && err.error.errorMessage) {
            this.errorMessage = err.error.errorType + ' : ' + err.error.errorMessage;
          } else {
            // not an error from the backend, most likely the backend could not be reached
            this.errorMessage = 'An error occured while login.';
            console.log(err);
          }

        }
      );
    };
    fileReader.readAsText(this._selectedFile);
  }
}
