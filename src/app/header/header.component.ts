import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  loggedIn = false;

  constructor() { }

// TODO add a logout button when the user is logged in
// TODO hide the Library and Create buttons when not logged in

  ngOnInit(): void {
  }
}
