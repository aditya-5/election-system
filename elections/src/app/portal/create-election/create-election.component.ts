import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from "../../common/authenticate.service"
import { PortalService } from "../../common/portal.service"
import {FormGroup, FormControl} from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-election',
  templateUrl: './create-election.component.html',
  styleUrls: ['./create-election.component.css']
})
export class CreateElectionComponent implements OnInit {

    userData : any;
    categoryNames: string[] = []
    candidateInfo = []
    submitted:boolean = false;
    minDate = new Date();
    unSaved: boolean = false;

    @ViewChild('Messages', { static: false }) Messages: ElementRef
    range = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });



    constructor(private authenticateservice : AuthenticateService,
                private renderer: Renderer2,
                private router: Router,
                private portalservice : PortalService) {


    }

    ngOnInit(): void {
      this.authenticateservice.User.subscribe(userData=>{
        if(userData) this.userData = userData
      })
    }

    returnName(i){
      return "name"+i
    }


    addCategory(){
      this.unSaved = true
      this.categoryNames.push("")
    }

    addCandidate(){
      this.unSaved = true
      this.candidateInfo.push({name:"", manifesto:"", course:"", category:""})
    }


    customTrackBy(index: number, item: any): any {
  	return index;
  }

  removeCandidate(i: number){
    this.candidateInfo.splice(i, 1);
    let tmpCandidateInfo = this.candidateInfo
    this.candidateInfo = tmpCandidateInfo
  }

    removeCategory(i: number){
      this.categoryNames.splice(i, 1);
      let tmpCategoryNames = this.categoryNames
      this.categoryNames = tmpCategoryNames
    }

    appendErrorMessages(message) {
      var div = document.createElement('div')
      div.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><strong>Error : </strong> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
      this.submitted = false
      setTimeout(()=>{
        this.renderer.appendChild(this.Messages.nativeElement, div)
      }, 2000)
    }


    appendSuccessMessages(message) {
      var div = document.createElement('div')
      div.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert"><strong>Success : </strong> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
      this.renderer.appendChild(this.Messages.nativeElement, div)

    }

    canDeactivate(): Observable<boolean> | boolean {
         if (this.unSaved) {
           return confirm('There are unsaved changes! Are you sure you want to discard them?');
         }
         return true;
     }

    createElection(electionF: NgForm){

      this.submitted = true


      console.log(this.categoryNames)
      console.log(this.candidateInfo)

      // Check input dates
      if(this.range.value.start==null || this.range.value.end==null){
        setTimeout(()=>{
          this.submitted = false
          this.appendErrorMessages("Please select the polling period.")
        }, 1000)
        return
      }

      // Check if categories have been populated
      if(this.categoryNames.length<1){
        setTimeout(()=>{
          this.submitted = false
          this.appendErrorMessages("You need to have atleast 1 category.")
        }, 1000)
        return
      }
      for (let i =0;i<this.categoryNames.length ; i++){
        if(this.categoryNames[i].length>0){
          break;
        }else{
          if(i == this.categoryNames.length -1 ){
            setTimeout(()=>{
              this.submitted = false
              this.appendErrorMessages("You need to have atleast 1 category.")
            }, 1000)
            return
          }
        }
      }


      if(this.candidateInfo.length<1){
        setTimeout(()=>{
          this.submitted = false
          this.appendErrorMessages("You need to have atleast 1 candidate.")
        }, 1000)
        return
      }
      // Check if candidate names have been populated
      for(let i = 0; i< this.candidateInfo.length; i++){
        if(this.candidateInfo[i].name.length>0){
          break;
        }else{
          if(i == this.candidateInfo.length -1 ){
            setTimeout(()=>{
              this.submitted = false
              this.appendErrorMessages("You need to have atleast 1 candidate with mandatory fields filled in.")
            }, 1000)
            return
          }
        }
      }

      // Check if candidate categories have been populated
      for(let i = 0; i< this.candidateInfo.length; i++){
        if(this.candidateInfo[i].category.length>0){
          break;
        }else{
          if(i == this.candidateInfo.length -1 ){
            setTimeout(()=>{
              this.submitted = false
              this.appendErrorMessages("You need to have atleast 1 candidate with mandatory fields filled in.")
            }, 1000)
            return
          }
        }
      }

      const electionData = {categories: this.categoryNames, candidates: this.candidateInfo, start:this.range.value.start,  end: this.range.value.end }

      this.portalservice.addElection(electionData).subscribe(response=>{
        this.candidateInfo = []
        this.categoryNames = []
        this.submitted = false
        setTimeout(()=>{
          this.appendSuccessMessages(response['message'])
        }, 2000)

      }, err=>{
        this.submitted = false
        setTimeout(()=>{
          this.appendErrorMessages(err.error.message)
        }, 2000)
        console.log(err)
      })




    }

}
