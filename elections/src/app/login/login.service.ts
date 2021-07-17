import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {AuthenticateService} from "../common/authenticate.service"
// import { CookieService } from 'ngx-cookie-service';
// import { catchError } from 'rxjs/operators';
// import {  throwError } from 'rxjs';
// import firebase from 'firebase/app';
// import { AngularFireAuth } from "@angular/fire/auth";


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient,
    private router: Router,
      private authenticateservice : AuthenticateService
) {}


  // private angularFireAuth: AngularFireAuth
  // private cookieService: CookieService
  // angularFireAuth.authState.subscribe(user => {
  //   console.log(user)
  //   if (user) {
  //     user.getIdToken().then(id => console.log(id))
  //   }
  // })
  // Legacy signin
  // SignIn(email: string, password: string) {
  //   return this.angularFireAuth
  //     .signInWithEmailAndPassword(email, password)
  //     .then(async res => {
  //       // console.log(this.cookieService.get("XSRF-TOKEN"))
  //       const idToken = await res.user.getIdToken()
  //       this.SignOut()
  //       this.http.post(environment.baseURL + "auth/sessionLogin", { idToken: idToken })
  //       .subscribe((response) => {
  //         this.router.navigate(["/signup"]);
  //       }
  //       // , (err) => {
  //       //   throw new Error("Failed Login")
  //       // }
  //     )
  //       return { loggedIn: false, message: "Failed Login" }
  //
  //     }).catch(err => {
  //       return { loggedIn: false, message: err.message }
  //
  //     });
  // }





  // SignIn(email: string, password: string) {
  //   return this.angularFireAuth.setPersistence('none').then(() => {
  //     return this.angularFireAuth
  //       .signInWithEmailAndPassword(email, password)
  //       .then(async res => {
  //         const idToken = await res.user.getIdToken()
  //         this.SignOut()
  //         return idToken;
  //
  //       }).catch(err => {
  //         throw new Error(err.message)
  //       });
  //   }
  // )
  //
  //
  // }

  // SignInBackend(idToken) {
  //   return this.http.post(environment.baseURL + "auth/sessionLogin", { idToken: idToken },
  //   {headers:new HttpHeaders({"credentials": "include", "useCredentials": "true"})})
  // }

  // SignOut() {
  //   this.angularFireAuth
  //     .signOut();
  // }

  SignOut() {
    this.http.get(environment.baseURL + "auth/logout", {
      observe:'body',
      withCredentials:true,
      headers:new HttpHeaders().append('Content-Type','application/json')
    }).subscribe(res=>{
      console.log("Logged out")
      this.authenticateservice.removeUser();
    }
    ,err=>{
    })
  }


  SignIn(email: string, password: string) {
    return this.http.post(environment.baseURL+"auth/login", {email, password},  {
      observe:'body',
      withCredentials:true,
      headers:new HttpHeaders().append('Content-Type','application/json')
    })
  }


  verifyAccount(token: string, type: string){
    return this.http.post(environment.baseURL+"auth/verify", {token, type})
  }



}
