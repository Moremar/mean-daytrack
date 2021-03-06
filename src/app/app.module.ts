import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthInterceptor } from './auth/auth-interceptor';
import { LibraryComponent } from './library/library/library.component';
import { CreatePieceComponent } from './library/create-piece/create-piece.component';
import { PieceComponent } from './library/piece/piece.component';
import { PieceDeletionDialogComponent } from './library/piece/piece-deletion-dialog/piece-deletion-dialog.component';
import { PiecesFilterComponent } from './library/pieces-filter/pieces-filter.component';
import { ImportPiecesComponent } from './library/import-pieces/import-pieces.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LibraryComponent,
    LoginComponent,
    CreatePieceComponent,
    PieceComponent,
    PieceDeletionDialogComponent,
    PiecesFilterComponent,
    ImportPiecesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    /* TODO move Material imports to a dedicated module */
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatExpansionModule,
    MatDialogModule,
  ],
  providers: [
    // register the Auth interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
