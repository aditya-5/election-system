import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { AuthenticateService } from "./common/authenticate.service"
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'elections';

  constructor(private authenticateservice : AuthenticateService, private router: Router){
    // this.authenticateservice.setUser().subscribe((resp)=>{})
    this.authenticateservice.autoLogin()
  }



}
