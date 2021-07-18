import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { VoterComponent } from './voter/voter.component';
import { Routes, RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SocietyComponent } from './society/society.component';
import { HttpClientModule } from "@angular/common/http";
import { AngularFireModule } from "@angular/fire";
import {environment} from "../environments/environment"
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AuthGuard } from './guards/auth-guard.service';
import { PortalComponent } from './portal/portal.component';
import { AuthGuardLoggedIn } from './guards/auth-guard-logged-in.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';



 const appRoutes: Routes = [
   { path: "portal" , component: PortalComponent, canActivate:[AuthGuard]},
   { path: "society" , component: SocietyComponent, canActivate:[AuthGuardLoggedIn]},
   { path: "voter" , component: VoterComponent, canActivate:[AuthGuardLoggedIn]},
   { path: "" , component: HomeComponent},
   { path: "**" , redirectTo: "/"},
]

@NgModule({
  declarations: [
    AppComponent,
    VoterComponent,
    HeaderComponent,
    HomeComponent,
    SocietyComponent,
    PortalComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    ReactiveFormsModule,

  ],
  providers: [AuthGuard, AuthGuardLoggedIn],
  bootstrap: [AppComponent]
})
export class AppModule { }
