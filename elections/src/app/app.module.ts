import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { VoterComponent } from './voter/voter.component';
import { Routes, RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SocietyComponent } from './society/society.component';
import { HttpClientModule } from "@angular/common/http";
import { AngularFireModule } from "@angular/fire";
import {environment} from "../environments/environment"
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AuthGuard } from './guards/auth-guard.service';
import { PortalComponent } from './portal/portal.component';
import { AuthGuardLoggedIn } from './guards/auth-guard-logged-in.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { CanDeactivateGuard } from "./guards/deactivate.service"
import { MatListModule } from "@angular/material/list"
import { MatDividerModule } from "@angular/material/divider"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatSidenavModule } from "@angular/material/sidenav";
import { SidenavComponent } from './portal/sidenav/sidenav.component';
import { DashboardComponent } from './portal/dashboard/dashboard.component';
import { CreateElectionComponent } from './portal/create-election/create-election.component';
import { MyElectionComponent } from './portal/my-election/my-election.component';
import { SettingsComponent } from './portal/settings/settings.component'
import { AuthGuardSociety } from './guards/auth-guard-society.service';


 const appRoutes: Routes = [
   { path: "portal" , component: PortalComponent,
   canActivate:[AuthGuard],
   children:[
     {path: "create" , component: CreateElectionComponent,canDeactivate: [CanDeactivateGuard], canActivate:[AuthGuardSociety]},
     {path: "home" , component: DashboardComponent},
     {path: "myelections" , component: MyElectionComponent, canActivate:[AuthGuardSociety]},
     {path: "settings" , component: SettingsComponent,canDeactivate: [CanDeactivateGuard]},
     {path: "" , redirectTo: 'home', pathMatch: 'full'},
   ]},
   { path: "society" , component: SocietyComponent, canActivate:[AuthGuardLoggedIn]},
   { path: "voter" , component: VoterComponent, canActivate:[AuthGuardLoggedIn]},
   { path: "" , component: HomeComponent, pathMatch: 'full', canActivate:[AuthGuardLoggedIn]},
   { path: "**" , redirectTo: "/"},
]


@NgModule({
  declarations: [
    AppComponent,
    VoterComponent,
    HeaderComponent,
    HomeComponent,
    SocietyComponent,
    PortalComponent,
    SidenavComponent,
    DashboardComponent,
    CreateElectionComponent,
    MyElectionComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule
  ],
  providers: [AuthGuard, AuthGuardLoggedIn, CanDeactivateGuard, AuthGuardSociety],
  bootstrap: [AppComponent]
})
export class AppModule { }
