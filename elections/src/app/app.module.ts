import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { HttpClientModule } from "@angular/common/http";
import { AngularFireModule } from "@angular/fire";
import {environment} from "../environments/environment"
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AuthGuard } from './guards/auth-guard.service';
import { PortalComponent } from './portal/portal.component';
import { AuthGuardLoggedIn } from './guards/auth-guard-logged-in.service';

 const appRoutes: Routes = [
   { path: "portal" , component: PortalComponent, canActivate:[AuthGuard]},
   { path: "signup" , component: SignupComponent, canActivate:[AuthGuardLoggedIn]},
   { path: "login" , component: LoginComponent, canActivate:[AuthGuardLoggedIn]},
   { path: "" , component: HomeComponent},
   { path: "**" , redirectTo: "/"},
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    HomeComponent,
    SignupComponent,
    PortalComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule
  ],
  providers: [AuthGuard, AuthGuardLoggedIn],
  bootstrap: [AppComponent]
})
export class AppModule { }
