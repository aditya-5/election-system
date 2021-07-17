import { Component, OnInit } from '@angular/core';
import { LoginService} from "../login/login.service";
import { AuthenticateService } from "../common/authenticate.service";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  loggedIn : boolean = false;

  constructor(private loginservice: LoginService,
  private authenticateservice : AuthenticateService) {
    this.authenticateservice.User.subscribe(userData=>{
      if(userData){
        this.loggedIn = true;
      }else{
        this.loggedIn = false;
      }
    })
  }

  ngOnInit(): void {
  }

  logout(){
    this.loginservice.SignOut()
  }

}
