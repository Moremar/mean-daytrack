import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.getAuthToken() === null) {
      // login required
      console.log('Login is required to access the requested URL');
      this.router.navigate(['login']);
      return false; // technically not needed but clearer
    }

    // TODO if a piece ID is in the URL, ensure it is a piece ID of a piece that belongs to this user

    return true;
  }
}
