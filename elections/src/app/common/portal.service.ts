import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: 'root'
})
export class PortalService {

  constructor(private http : HttpClient,
              private router: Router) { }


  addElection(electionData: any){
    return this.http.post(environment.baseURL+"auth/addElection",electionData, {
      observe: 'body',
      withCredentials: true,
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    } )
  }



}
