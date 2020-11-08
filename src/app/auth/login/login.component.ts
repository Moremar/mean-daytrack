import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading = false;
  errorMessage: string = null;

  constructor(private router: Router) { }


  ngOnInit(): void {
  }


  onLogin(loginForm: NgForm): void {
    if (loginForm.invalid) {
      // the error will be displayed by the HTML
      return;
    }
    this.loading = true;

    // TODO call the auth service to login, subcribe to the result and
    // show the error if any or navigate to the library page
    console.log('Logged In with ' + loginForm.value.email + '/' + loginForm.value.password);

    this.loading = false;
    this.router.navigate(['library']);
  }
}
