import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from "../../common/authenticate.service"

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  userData : any;

  constructor(private authenticateservice : AuthenticateService) { }

  ngOnInit(): void {
    this.authenticateservice.User.subscribe(newUserData => {
      this.userData = newUserData;
    })
  }

}
