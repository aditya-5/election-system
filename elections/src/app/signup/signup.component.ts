import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  submitted: boolean = false;
  @ViewChild('Messages', { static: false }) Messages: ElementRef
  @ViewChild('voterF', { static: false }) voterForm: NgForm;
  @ViewChild('societyF', { static: false }) societyForm: NgForm;


  constructor(private signupservice: SignupService, private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  toggleSignupMode() {
    this.signupMode = !this.signupMode
    this.positionOther = false
  }

  togglePosition(positionOtherArg: boolean) {
    this.positionOther = positionOtherArg
  }


  onSubmitSociety(societyF: NgForm) {
    this.submitted = true;

    const societyUser = {
      societyName: societyF.value.societyName,
      email: societyF.value.email,
      password: societyF.value.password,
      fullname: societyF.value.fullname,
      confirmPassword: societyF.value.confirmpassword,
      position: societyF.value.position,
      positionText: societyF.value.positionText,
    }
    this.signupservice.signupSociety(societyUser).subscribe(response => {
      this.submitted = false;
      console.log(response)
      setTimeout(() => { this.appendSuccessMessages("Society Account successfully created. Please confirm your email and sign-in to continue.") }, 1000)
      societyF.reset()
    },
      err => {
        this.submitted = false;
        setTimeout(() => {
          this.appendErrorMessages(err.error.message || "Some error occurred at the backend. Please try again later.")
          this.societyForm.form.patchValue({
            email: societyUser.email,
            societyName: societyUser.societyName,
            fullname: societyUser.fullname,
            position: societyUser.position,
            positionText: societyUser.positionText,
          })
        }, 1000)
      })

  }

  onSubmitVoter(voterF: NgForm) {

    this.submitted = true;

    const voterUser = {
      email: voterF.value.email,
      fullname: voterF.value.fullname,
      password: voterF.value.password,
      confirmpassword: voterF.value.confirmpassword,
    }
    this.signupservice.signupVoter(voterUser).subscribe(response => {
      this.submitted = false;
      console.log(response)
      setTimeout(() => { this.appendSuccessMessages("Voter Account successfully created. Please confirm your email and sign-in to continue.") }, 1000)
      voterF.reset()
    },
      err => {
        this.submitted = false;
        setTimeout(() => {
          this.appendErrorMessages(err.error.message|| "Some error occurred at the backend. Please try again later.")
          this.voterForm.form.patchValue({ email: voterUser.email })
        }, 1000)
      })

  }


  appendErrorMessages(message) {
    var div = document.createElement('div')
    div.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><strong>Error : </strong> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.renderer.appendChild(this.Messages.nativeElement, div)
  }


  appendSuccessMessages(message) {
    var div = document.createElement('div')
    div.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert"><strong>Success : </strong> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.renderer.appendChild(this.Messages.nativeElement, div)
  }





}
