import {  Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthHandlerService } from '@services/AuthHandlerService';
import { RouteService } from '@services/route.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private authHandler: AuthHandlerService,
    private routeService: RouteService ) {}

  title = 'Auth_V3';



  ngOnInit(): void {

   /* this.authHandler.loadFromCookies(); // Si usas cookies
    /*
    if (this.authHandler.getRoles().length > 0) {
      this.routeService.navigateToLastRoute(); // Navegar a la última ruta
    }*/
  }
  
  
}

