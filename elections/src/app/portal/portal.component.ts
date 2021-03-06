import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from "../common/authenticate.service"
import { PortalService } from "../common/portal.service"
import {FormGroup, FormControl} from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent implements OnInit {

  userData : any;
  
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

}
