import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment } from "../../environments/environment"
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {

  constructor(private http: HttpClient,
              private router: Router) { }
  User= new BehaviorSubject( null);

  setUser() {
       return this.http.get(environment.baseURL + "auth/user", {
         observe:'body',
         withCredentials:true,
         headers:new HttpHeaders().append('Content-Type','application/json')
       }).pipe(map((response)=>{
         this.User.next(response)
         this.router.navigate(['portal'])
         return response
       }))
  }

  removeUser(){
    this.User.next(null)
    this.router.navigate(['login'])

  }



}
