import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(private http: HttpClient) { }

  signupVoter(voterUser){
    return this.http.post(environment.baseURL+"auth/signup/voter", voterUser)
  }

  signupSociety(societyUser){
    return this.http.post(environment.baseURL+"auth/signup/society", societyUser)
  }

  sendVerificationEmail(email){
    return this.http.post(environment.baseURL+"auth/signup/voter/link", {email:email})
  }





}
