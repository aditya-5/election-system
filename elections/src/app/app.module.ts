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


 const appRoutes: Routes = [
   { path: "signup" , component: SignupComponent},
   { path: "login" , component: LoginComponent},
   { path: "" , component: HomeComponent},
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    HomeComponent,
    SignupComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
