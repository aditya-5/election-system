import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, throwError } from 'rxjs';
import firebase from 'firebase/app';
import { environment } from "../../environments/environment"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private angularFireAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService) {
    angularFireAuth.authState.subscribe(user => {
      console.log(user)
      if (user) {
        user.getIdToken().then(id => console.log(id))
      }
    })
  }

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

  SignIn(email: string, password: string) {
    return this.angularFireAuth.setPersistence('none').then(() => {
      return this.angularFireAuth
        .signInWithEmailAndPassword(email, password)
        .then(async res => {
          const idToken = await res.user.getIdToken()
          this.SignOut()
          return idToken;

        }).catch(err => {
          throw new Error(err.message)
        });
    }
  )


  }

  SignInBackend(idToken) {
    return this.http.post(environment.baseURL + "auth/sessionLogin", { idToken: idToken },
    {headers:new HttpHeaders({"credentials": "include", "useCredentials": "true"})})
  }

  SignOut() {
    this.angularFireAuth
      .signOut();
  }

  checkLogIn() {
       this.http.post(environment.baseURL + "auth/checkLogIn", {}).subscribe(res=>{
         console.log(res)
       }
       ,err=>{
         console.log(err)
       })
  }



}
