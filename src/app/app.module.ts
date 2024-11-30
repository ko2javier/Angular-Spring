import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { authConfig } from './services/auth.config';
import { AuthModule } from '@auth0/auth0-angular';
import { WorkBenchComponent } from './components/work-bench/work-bench.component';
import { AuthGuard } from './services/auth.guard';
import { VentasComponent } from './components/ventas/ventas.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CartComponent } from './components/cart/cart.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'workbench', component: WorkBenchComponent, canActivate: [AuthGuard] }, // Protege esta ruta con el guard
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] }, // Protege esta ruta con el guard
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WorkBenchComponent,
    VentasComponent,
    CartComponent
    
  
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
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
