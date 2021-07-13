import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SignupService } from "./signup.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupMode: boolean = true;
  positionOther: boolean = false;

  constructor(private signupservice: SignupService) { }

  ngOnInit(): void {
  }

  toggleSignupMode(){
    this.signupMode = !this.signupMode
    this.positionOther = false
  }

  togglePosition(positionOtherArg : boolean){
    this.positionOther = positionOtherArg
  }


  onSubmitSociety(societyF: NgForm){

    const societyUser = {
      societyName: societyF.value.societyName,
      email: societyF.value.email,
      password: societyF.value.password,
      confirmPassword: societyF.value.confirmpassword,
      position: societyF.value.position,
      positionText: societyF.value.positionText,
    }
    console.log(societyUser)
    societyF.reset()

  }

  onSubmitVoter(voterF: NgForm){

    const voterUser = {
      email: voterF.value.societyName,
      password: voterF.value.password,
      confirmpassword: voterF.value.confirmpassword,
    }
    console.log(voterUser)
    voterF.reset()
    this.signupservice.validateEmail()

  }




}
