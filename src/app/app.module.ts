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

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CartComponent } from './components/cart/cart.component';
import { SalesComponent } from './components/sales/sales.component';
import { SalesService } from '@services/SalesService';
import { StockComponent } from './components/stock/stock.component';
import { FormsModule } from '@angular/forms';
import { CheckoutComponent } from './components/checkout/checkout.component'; // Importa FormsModule aquí


const routes: Routes = [
  { path: '', component: HomeComponent },
  //{ path: '', redirectTo: '/home', pathMatch: 'full' }, // Cambia la ruta predeterminada
  { path: 'home', component: HomeComponent },
  { path: 'workbench', component: WorkBenchComponent, canActivate: [AuthGuard] }, 
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'sales_history', component: SalesComponent, canActivate: [AuthGuard] }, 
  { path: 'stock', component: StockComponent, canActivate: [AuthGuard] },
  { path: 'check', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' } // Ruta para 404
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WorkBenchComponent,
    CartComponent,
    SalesComponent,
    StockComponent,
    CheckoutComponent, 
    
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
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
      multi: true, 
    },
    SalesService // Agregas el servicio aquí
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
