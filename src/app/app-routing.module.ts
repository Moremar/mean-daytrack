import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { CreatePieceComponent } from './library/create-piece/create-piece.component';
import { LibraryComponent } from './library/library/library.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'create', component: CreatePieceComponent },
  // use same component for edit and create, will distinguish from the :id path parameter
  { path: 'edit/:id', component: CreatePieceComponent },
  { path: '', redirectTo: 'library', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
