import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from "../../common/authenticate.service"
import { PortalService } from "../../common/portal.service"
import {FormGroup, FormControl} from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {


  userData : any;
  submitted:boolean = false;
  untilNextSet : any
  newpass: string;
  confirmpass:string;
  positionOther: boolean = false
  @ViewChild('Messages', { static: false }) Messages: ElementRef
  @ViewChild('settingsF', { static: false }) settingsForm: NgForm;

  constructor(private authenticateservice : AuthenticateService,
              private renderer: Renderer2,
              private router: Router,
              private portalservice : PortalService) {


  }

  checkPassword(){
    if((this.newpass != this.confirmpass) || this.newpass.length<6 || this.confirmpass.length<6) return true
    else return false
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

  ngOnInit(): void {
    this.authenticateservice.User.subscribe(userData=>{
      if(userData) {
                    this.userData = userData
                    this.untilNextSet = userData.untilNextSet
                    if(userData.position=="Other") this.positionOther = true
                    setTimeout(()=>{
                      this.settingsForm.form.patchValue({fname: userData.name, societyName: userData.societyName, position: userData.position, positionText:userData.positionText })

                    }, 10)
      }
    })
  }


  saveSettings(settingsF: NgForm){
    this.submitted = true

    const name = settingsF.value.fname
    const societyName = settingsF.value.societyName
    const position = settingsF.value.position
    const positionText = settingsF.value.positionText
    const positionArray = ['President', "General Secretary","Other"]

    if(name.length<1 || societyName.length< 1 || position.length< 1 ){
      this.submitted = false
      setTimeout(()=>{
        this.appendErrorMessages("The fields cannot be empty.")
      }, 2000)
      return
    }

    if(!positionArray.includes(position)){
      this.submitted = false
      setTimeout(()=>{
        this.appendErrorMessages("The value of radio buttons cannot be modified.")
      }, 2000)
      return
    }

    if(position == "Other"){
      if(positionText.length<1){
        this.submitted = false
        setTimeout(()=>{
          this.appendErrorMessages("Other Role cannot be empty.")
        }, 2000)
        return
      }
    }

    const updateData = {
      name,
      societyName,
      position,
      positionText,
      type:"society"
    }

    this.portalservice.updateSettings(updateData).subscribe((response)=>{
      this.submitted = false
      setTimeout(()=>{
        this.appendSuccessMessages(response["message"])
        this.authenticateservice.setUserWithoutSubs()
      }, 2000)
      settingsF.reset()
    }, err=>{
      this.submitted = false
      setTimeout(()=>{
        this.appendErrorMessages(err.error.message)
        this.authenticateservice.setUserWithoutSubs()
      }, 2000)
      return
    })
  }

  togglePosition(positionOtherArg: boolean) {
    this.positionOther = positionOtherArg
  }


  changePassword(passwordF: NgForm){

  }


}
