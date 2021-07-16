import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute} from '@angular/router';
import { SignupService } from "../signup/signup.service";
import { LoginService } from "./login.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  resendLinkBool: boolean = false;
  submitted: boolean = false;
  @ViewChild('Messages', { static: false }) Messages: ElementRef
  @ViewChild('loginF', { static: false }) loginForm: NgForm


  constructor(private signupservice: SignupService,
    private renderer: Renderer2,
    private authenticationService: LoginService,
    private router: Router,
    private activatedRoute:ActivatedRoute,
  ) {
    activatedRoute.queryParams.subscribe(queryParams=>{
      if(queryParams.token && queryParams.type){
        authenticationService.verifyAccount(queryParams.token, queryParams.type)
        .subscribe(response=>{
            this.appendSuccessMessages(response["message"])
        }, err=>{
          this.appendErrorMessages(err.error.message)

        })
      }
    })
  }

  ngOnInit(): void {
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


  sendVerificationEmail(linkResendF: NgForm) {
    this.submitted = true;
    this.signupservice.sendVerificationEmail(linkResendF.value.email).subscribe(response => {
      this.submitted = false;
      setTimeout(() => { this.appendSuccessMessages("New confirmation email sent. Please confirm and login to continue.") }, 1000)
      linkResendF.reset()
      this.resendLinkBool = false
    },
      err => {
        setTimeout(() => {
          this.submitted = false;
          this.appendErrorMessages(err.error.message)
          linkResendF.form.patchValue({ email: linkResendF.value.email })
        }, 1000)
      })
  }

  // Legacy signin

  // async signIn(loginF: NgForm) {
  //   this.submitted = true;
  //   const email = loginF.value.email
  //   const password = loginF.value.password
  //   const response = await this.authenticationService.SignIn(email, password)
  //   if(!response.loggedIn){
  //     setTimeout(() => {
  //       this.appendErrorMessages(response.message)
  //       this.loginForm.form.patchValue({
  //         email: email,
  //       })
  //     }, 2000)
  //   }
  //   this.submitted = false;
  //
  // }

  async signIn(loginF: NgForm) {
    this.submitted = true;
    const email = loginF.value.email
    const password = loginF.value.password
    let idToken
    try{
      idToken = await this.authenticationService.SignIn(email, password)
    }catch(err){
      idToken = null;
      this.submitted = false;
      setTimeout(() => {
        this.appendErrorMessages(err.message)
        this.loginForm.form.patchValue({
          email: email,
        })
      }, 2000)
    }


    if(idToken!= null){
      this.authenticationService.SignInBackend(idToken).subscribe((response) => {
        return this.router.navigate(["/signup"]);

      }
      , (err) => {
        this.submitted = false;
        setTimeout(() => {
          this.appendErrorMessages("Backend failed to sign you in. Please try again later.")
          this.loginForm.form.patchValue({
            email: email,
          })
        }, 2000)
      }
    )
    }


  }

  signOut() {
    this.authenticationService.SignOut();
  }

  checkLogIn() {
    this.authenticationService.checkLogIn();
  }







}
