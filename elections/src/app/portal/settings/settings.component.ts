import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from "../../common/authenticate.service"
import { PortalService } from "../../common/portal.service"
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {


  userData: any;
  submitted: boolean = false;
  untilNextSet: any
  newpass: string;
  confirmpass: string;
  positionOther: boolean = false;
  unSaved: boolean = false;
  @ViewChild('Messages', { static: false }) Messages: ElementRef
  @ViewChild('settingsF', { static: false }) settingsForm: NgForm;

  constructor(private authenticateservice: AuthenticateService,
    private renderer: Renderer2,
    private router: Router,
    private portalservice: PortalService) {


  }

  checkPassword() {
    if ((this.newpass != this.confirmpass) || this.newpass.length < 6 || this.confirmpass.length < 6) return true
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
    this.authenticateservice.User.subscribe(userData => {
      if (userData) {
        this.userData = userData
        this.untilNextSet = userData.untilNextSet
        if (userData.position == "Other") this.positionOther = true
        setTimeout(() => {
          this.settingsForm.form.patchValue({ fname: userData.name, societyName: userData.societyName, position: userData.position, positionText: userData.positionText })

        }, 10)
      }
    })
  }

  validateFields(newData) {
    if (newData.type == "society") {
      const positionArray = ['President', "General Secretary", "Other"]

      if (newData.name.length < 1 || newData.societyName.length < 1 || newData.position.length < 1) {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("The fields cannot be empty.")
        }, 2000)
        return false;
      }


      if(newData.name == this.userData.name && newData.societyName == this.userData.society.societyName &&
      newData.position == this.userData.position){
        if(newData.position == "Other"){
          if(newData.positionText == this.userData.positionText){
            this.submitted = false
            setTimeout(() => {
              this.appendErrorMessages("Please update atleast 1 field.")
            }, 2000)
            return false;
          }
        }else{
          this.submitted = false
          setTimeout(() => {
            this.appendErrorMessages("Please update atleast 1 field.")
          }, 2000)
          return false;
        }
      }

      if (newData.societyName.length > 30) {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("Society Name should be less than 30 characters")
        }, 2000)
        return false;
      }

      if (newData.name.length > 20) {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("Name should be less than 20 characters")
        }, 2000)
        return false;
      }

      if (!positionArray.includes(newData.position)) {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("The value of radio buttons cannot be modified.")
        }, 2000)
        return false;
      }

      if (newData.position == "Other") {
        if (newData.positionText.length < 1) {
          this.submitted = false
          setTimeout(() => {
            this.appendErrorMessages("Other Role cannot be empty.")
          }, 2000)
          return false;
        }
      }

      return true;

    } else if (newData.type == "voter") {

      if(newData.name == this.userData.name){
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("Please update atleast 1 field.")
        }, 2000)
        return false;
      }

      if (newData.name.length < 1) {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("Name cannot be empty.")
        }, 2000)
        return false;
      }

      if (newData.name.length > 20) {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages("Name should be less than 20 characters")
        }, 2000)
        return false;
      }
      return true;
    } else {
      this.submitted = false
      setTimeout(() => {
        this.appendErrorMessages("Invalid request.")
      }, 2000)
      return false;
    }
  }


  saveSettings(settingsF: NgForm) {
    this.submitted = true

    const name = settingsF.value.fname
    const societyName = settingsF.value.societyName
    const position = settingsF.value.position
    const positionText = settingsF.value.positionText


    let updateData;
    if (this.userData.type == "society") {
      updateData = {
        name,
        societyName,
        position,
        positionText,
        type: "society"
      }
    } else {
      updateData = {
        name,
        type: "voter"
      }
    }

    if (this.validateFields(updateData)) {

      this.portalservice.updateSettings(updateData).subscribe((response) => {
        this.submitted = false
        setTimeout(() => {
          this.appendSuccessMessages(response["message"])
          this.authenticateservice.setUserWithoutSubs()
        }, 2000)
        settingsF.reset()
      }, err => {
        this.submitted = false
        setTimeout(() => {
          this.appendErrorMessages(err.error.message)
          this.authenticateservice.setUserWithoutSubs()
        }, 2000)
        return
      })


    }
  }

  canDeactivate(): Observable<boolean> | boolean {
       if (this.unSaved) {
         return confirm('There are unsaved changes! Are you sure you want to discard them?');
       }
       return true;
   }

  togglePosition(positionOtherArg: boolean) {
    this.positionOther = positionOtherArg
  }

  unnsavedChanges(positionOtherArg: boolean) {
    this.unSaved = true;
  }




  changePassword(passwordF: NgForm) {

  }


}
