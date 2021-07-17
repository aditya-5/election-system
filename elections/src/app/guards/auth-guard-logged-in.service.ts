import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {environment} from "../../environments/environment"
import {AuthenticateService} from "../common/authenticate.service"

@Injectable()
export class AuthGuardLoggedIn implements CanActivate {

   constructor(private router:Router,
              private http: HttpClient,
              private authenticateservice : AuthenticateService) {
   }

   canActivate(route: ActivatedRouteSnapshot,
               state: RouterStateSnapshot): boolean | Promise<boolean>| Observable<boolean> {
          return this.authenticateservice.User.pipe(take(1),map(userData=>{

            if(userData){
                this.router.navigate(['portal'])
              }
            else{
              return true;
            }
          }
          ))


   }

}
