import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { authConfig } from './services/auth.config';
import { AuthModule } from '@auth0/auth0-angular';
import { WorkBenchComponent } from './components/work-bench/work-bench.component';
//import { WorkBenchComponent } from './components/work-bench/work-bench.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  //{ path: 'workbench', component: WorkBenchComponent }, // Ruta para WorkBench
  //{path:'login', component:LoginComponent},
  
];
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WorkBenchComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    AuthModule.forRoot({
      domain: authConfig.domain,
      clientId: authConfig.clientId,
      authorizationParams: {
        redirect_uri: authConfig.redirectUri,
        scope: authConfig.scope,
        audience: authConfig.audience,
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
