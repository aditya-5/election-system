import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SignupService } from "../common/signup.service";
import { AuthenticateService } from "../common/authenticate.service";
import { Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-society',
  templateUrl: './society.component.html',
  styleUrls: ['./society.component.css']
})
export class SocietyComponent implements OnInit {

  loginMode: boolean = true;
  positionOther: boolean = false;   // Society role : Other (Text)
  submitted: boolean = false;
  resendLinkBool: boolean = false;
  @ViewChild('Messages', { static: false }) Messages: ElementRef
  @ViewChild('societyF', { static: false }) societyForm: NgForm;
  @ViewChild('loginF', { static: false }) loginForm: NgForm
  @ViewChild('linkResendF', { static: false }) linkresendF: NgForm;



  constructor(private signupservice: SignupService,
              private renderer: Renderer2,
              private authenticateservice: AuthenticateService,
              private router: Router,
              private activatedRoute:ActivatedRoute,) {


      activatedRoute.queryParams.subscribe(queryParams=>{

        if(queryParams.token && queryParams.type){
          authenticateservice.verifyAccount(queryParams.token, queryParams.type)
          .subscribe(response=>{
              this.appendSuccessMessages(response["message"])
          }, err=>{
            this.appendErrorMessages(err.error.message)

          })
        }

        if(queryParams.message && queryParams.type){
          setTimeout(()=>{
            if(queryParams.type=="error"){
              this.appendErrorMessages(queryParams.message)
            }else if(queryParams.type=="success"){
              this.appendSuccessMessages(queryParams.message)
            }
          }, 2000)

        }


      })

      if(router.getCurrentNavigation().extras.state){
        const messageState = router.getCurrentNavigation().extras.state.message
        const typeState = router.getCurrentNavigation().extras.state.type
        if(messageState && typeState){
          setTimeout(()=>{
          if(typeState=="error"){
            this.appendErrorMessages(messageState)
          }else if(typeState=="success"){
            this.appendSuccessMessages(messageState)
          }
          }, 2000)
        }
      }
   }

  ngOnInit(): void {
  }

  toggleLoginSignupMode() {
    this.loginMode = !this.loginMode
    this.positionOther = false
  }

  togglePosition(positionOtherArg: boolean) {
    this.positionOther = positionOtherArg
  }

  resendVerificationEmail(linkResendF){
    this.submitted = true;
    const email = linkResendF.value.email
    this.authenticateservice.resendEmail(email, "society").subscribe(response=>{
      this.submitted = false;
      this.resendLinkBool = false;
      setTimeout(() => {
        this.appendSuccessMessages(response['message'] )
      }, 1000)
      linkResendF.reset()
    }, err=>{
      this.submitted = false;
      setTimeout(() => {
        this.appendErrorMessages(err.error.message || "Some error occurred at the backend. Please try again later.")
        this.linkresendF.form.patchValue({
          email: email
        })
      }, 1000)
    });
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


  signIn(loginF: NgForm) {
    this.submitted = true;
    const email = loginF.value.email
    const password = loginF.value.password

    this.authenticateservice.SignIn(email, password, "society").subscribe(response=>{
      this.authenticateservice.setUser().subscribe(response=>{
        this.submitted = false;
      })


    }, err=>{
      setTimeout(()=>{
        this.appendErrorMessages(err.error.message || "An error occurred at the backend. Please try again later.")
        this.loginForm.form.patchValue({email: email})
      },1000)
      this.submitted = false;
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
