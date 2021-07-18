import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if(params.token && params.type){
        if(params.type=="society"){
          this.router.navigate(['society'], { queryParamsHandling: 'merge' })
        }else if(params.type=="voter"){
          this.router.navigate(['voter'], { queryParamsHandling: 'merge' })
        }

      }
    });
   }

  ngOnInit(): void {
  }

}
