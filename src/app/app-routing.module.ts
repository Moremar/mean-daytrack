import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { CreatePieceComponent } from './library/create-piece/create-piece.component';
import { ImportPiecesComponent } from './library/import-pieces/import-pieces.component';
import { LibraryComponent } from './library/library/library.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: LoginComponent },
  { path: 'library', component: LibraryComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreatePieceComponent, canActivate: [AuthGuard] },
  // use same component for edit and create, will distinguish from the :id path parameter
  { path: 'edit/:id', component: CreatePieceComponent, canActivate: [AuthGuard] },
  { path: 'import', component: ImportPiecesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'library', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
