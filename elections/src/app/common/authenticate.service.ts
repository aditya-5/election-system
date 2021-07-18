import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment"
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthenticateService {
  // User= new BehaviorSubject( {email:"sadass@sas.com", name:"sadsa", isVerified:true,id:"aadadad", type:"voter"});
  User = new BehaviorSubject(null);
  private autoLogoutTimer: any;
  sessionTime: number = 60 * 60 * 1000


  constructor(private http: HttpClient,
    private router: Router) { }


  setUser() {

    return this.http.get(environment.baseURL + "auth/user", {
      observe: 'body',
      withCredentials: true,
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    }).pipe(map((response) => {
      this.User.next(response)
      console.log(response)
      localStorage.setItem("userData", JSON.stringify({ ...response, expirationDate: new Date(new Date().getTime() + this.sessionTime) }))
      this.autoLogout(this.sessionTime)
      this.router.navigate(['portal'])
      return response
    }))
  }

  removeUser(auto: boolean = false) {
    this.User.next(null)
    localStorage.removeItem("userData");
    if(auto) this.router.navigate(['home'], {state:{message:"Session timeout. Please re-login to continue.", type:"error"}})
    else this.router.navigate(['home'])
  }


  SignIn(email: string, password: string, type:string) {
    if(type=="voter"){
      return this.http.post(environment.baseURL + "auth/login/voter", { email, password }, {
        observe: 'body',
        withCredentials: true,
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      })
    }else if(type=="society"){
      return this.http.post(environment.baseURL + "auth/login/society", { email, password }, {
        observe: 'body',
        withCredentials: true,
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      })
    }else{
      alert("Illegal Login Method.")
    }
  }

  SignOut(auto: boolean = false) {
    return this.http.get(environment.baseURL + "auth/logout", {
      observe: 'body',
      withCredentials: true,
      headers: new HttpHeaders().append('Content-Type', 'application/json')})
      .subscribe(res => {
        if(auto) this.removeUser(true)
        else this.removeUser()

      if(this.autoLogoutTimer){
        clearTimeout(this.autoLogoutTimer)
      }
      this.autoLogoutTimer = null
    }, err => {})
  }



  verifyAccount(token: string, type: string) {
    return this.http.post(environment.baseURL + "auth/verify", { token, type })
  }

  resendEmail(email: string, type:string = "voter"){
    return this.http.post(environment.baseURL + "auth/resend", {email, type: type})
  }


  autoLogin() {
    const userData = JSON.parse(localStorage.getItem("userData"))
    if (!userData) {
      return;
    } else {
      if (new Date(userData.expirationDate) > new Date()) {
        this.autoLogout(new Date(userData.expirationDate).getTime()-new Date().getTime())
        delete userData['expirationDate']
        this.User.next(userData)

      } else {
        localStorage.removeItem("userData")
        return;
      }
    }

  }

  autoLogout(time:number) {
    this.autoLogoutTimer = setTimeout(() => {
      this.SignOut(true)

    }, time)
  }




}




// import { CookieService } from 'ngx-cookie-service';
// import { catchError } from 'rxjs/operators';
// import {  throwError } from 'rxjs';
// import firebase from 'firebase/app';
// import { AngularFireAuth } from "@angular/fire/auth";

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
