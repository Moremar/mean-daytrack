import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { LibraryService } from 'src/app/library/library.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading = false;
  errorMessage: string = null;
  signupMode = false;

  constructor(private router: Router,
              private authService: AuthService,
              private libraryService: LibraryService) { }


  ngOnInit(): void {
    this.signupMode = this.router.url.includes('signup');
  }

  private _signup(email: string, password: string): void {
    this.authService.signup(email, password).subscribe(
      (_: boolean) => {
        // successful signup, now we can login
        this._login(email, password);
      },
      (e: HttpErrorResponse) => {
        // the error will show in the login screen
        this.loading = false;
        this.errorMessage = e.error.errorType + ' : ' + e.error.errorMessage;
      }
    );
  }

  private _login(email: string, password: string): void {
    this.authService.login(email, password).subscribe(
      (_: boolean) => {
        // the login was successful, an auth token should have been fetched
        this.loading = false;
        console.log('DEBUG - I will navigate to library !!');   // TODO remove
        // must fetch to update the list of pieces in case a user logged out and logged in with another user
        this.libraryService.fetchPieces(null, null);
        this.router.navigate(['library']);
      },
      (e: HttpErrorResponse) => {
        // the error will show in the login screen
        if (e.error && e.error.errorType && e.error.errorMessage) {
          this.errorMessage = e.error.errorType + ' : ' + e.error.errorMessage;
        } else {
          // not an error from the backend, most likely the backend could not be reached
          this.errorMessage = 'An error occured while login.';
        }
        this.loading = false;
      }
    );
  }

  onSubmit(loginForm: NgForm): void {
    if (loginForm.invalid) {
      // the error will be displayed by the HTML
      return;
    }
    this.loading = true;
    if (this.signupMode) {
      this._signup(loginForm.value.email, loginForm.value.password);
    } else {
      this._login(loginForm.value.email, loginForm.value.password);
    }
  }
}
