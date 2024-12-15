import {  Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}
  title = 'Auth_V3';

  ngOnInit(): void {
    // Escucha cambios en la navegación
    /*
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Guarda la ruta actual en localStorage
        localStorage.setItem('lastVisitedRoute', event.urlAfterRedirects);
      }
    });*/

    // Redirige a la última ruta visitada al cargar
    const lastRoute = localStorage.getItem('lastVisitedRoute');
    /*if (lastRoute) {
      this.router.navigateByUrl(lastRoute);
    }*/
  }
  
  
}

