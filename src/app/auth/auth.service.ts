import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { User } from '../shared/model/user.model';
import { Credentials } from './model/credentials.model';
import { RestPostAuthSignupResponse, RestPostAuthLoginResponse } from './model/rest-auth.model';
import { StoredUserData } from './model/stored-user-data.model';


const AUTH_URL = environment.backendUrl + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _authToken: string = null;
  private _loggedUserSubject = new BehaviorSubject<User>(null);

  // timer to auto-logout on authentication token expiration
  private autoLogoutTimer: any = null;


  constructor(private router: Router,
              private http: HttpClient) { }


  getAuthToken(): string {
    return this._authToken;
  }

  getLoggedUserObservable(): Observable<User> {
    return this._loggedUserSubject.asObservable();
  }


  signup(email: string, password: string): Observable<boolean> {
    const credentials = new Credentials(email, password);
    return this.http.post<RestPostAuthSignupResponse>(AUTH_URL + '/signup', credentials)
    .pipe(
      // transform the result on success to hide the HTTP details
      map(
        (_: RestPostAuthSignupResponse) => {
          console.log('Signup successful');
          return true;
        }
      ),
      // transform the error to only show the error message
      catchError(
        (errorResponse: HttpErrorResponse) => {
          console.log('Signup failed');
          console.log(errorResponse);
          return throwError(errorResponse);
        }
      )
    );
  }


  login(email: string, password: string): Observable<boolean> {
    const credentials = new Credentials(email, password);
    return this.http.post<RestPostAuthLoginResponse>(AUTH_URL + '/login', credentials)
    .pipe(map(
      (loginResponse: RestPostAuthLoginResponse) => {
        console.log('Login successful');

        // store the token in local storage and in memory
        // it is attached to all requests needing authentication by the auth-interceptor
        const user = new User(loginResponse.user._id, loginResponse.user.email);
        const userData = new StoredUserData(user, loginResponse.token, loginResponse.expiresIn);
        this._saveTokenInStorage(userData);
        this.autoLogin();
        return true;
      }
    ),
      // transform the error to only show the error message
      catchError(
        (errorResponse: HttpErrorResponse) => {
          console.log('Login failed');
          console.log(errorResponse);
          console.log('END OF ERROR');
          return throwError(errorResponse);
        }
      )
    );
  }


  // try to login from the token in local storage
  autoLogin(): boolean {
    console.log('Look for auth token in local storage.');
    const userData = this._readFromStorage();
    if (!userData || userData.expiresIn < 0) {
      // no token or expired token
      console.log('No token found, cannot auto-login.');
      this._deleteTokenFromStorage();
      return false;
    }
    // successful authentication
    console.log('Auth token found :');
    console.log(userData);

    this._authToken = userData.token;
    this._loggedUserSubject.next(new User(userData.user.id, userData.user.email));
    this._scheduleAutoLogout(userData.expiresIn);
    return true;
  }


  private _scheduleAutoLogout(expiresIn: number): void {
    console.log('Schedule auto logout in ' + expiresIn + ' ms');
    this.autoLogoutTimer = setTimeout(
      () => {
        console.log('Authentication token expired, need to login again.');
        this.logout();
      },
      expiresIn
    );
  }


  logout(): void {
    // No call to the backend, just discard the local user and token
    clearTimeout(this.autoLogoutTimer);
    this._deleteTokenFromStorage();
    this._authToken = null;
    this._loggedUserSubject.next(null);
    this.router.navigate(['login']);
  }


  private _saveTokenInStorage(userData: StoredUserData): void {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + userData.expiresIn);
    localStorage.setItem('id', userData.user.id);
    localStorage.setItem('email', userData.user.email);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }


  private _readFromStorage(): StoredUserData {
    const userId = localStorage.getItem('id');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const expirationDateStr = localStorage.getItem('expirationDate');
    if (!token || !expirationDateStr) {
      return null;
    }
    const expirationDate: Date = new Date(expirationDateStr);
    const now: Date = new Date();
    return new StoredUserData(new User(userId, email), token, expirationDate.getTime() - now.getTime());
  }


  private _deleteTokenFromStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
  }
}
