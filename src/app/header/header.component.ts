import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { User } from '../shared/model/user.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  loggedIn = false;
  private _loggedUserSub: Subscription = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this._loggedUserSub = this.authService.getLoggedUserObservable().subscribe(
      (user: User) => {
        this.loggedIn = (user !== null);
      }
    );
  }

  onLogout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this._loggedUserSub != null) {
      this._loggedUserSub.unsubscribe();
    }
  }
}
