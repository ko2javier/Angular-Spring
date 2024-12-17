import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
    /*
  private lastRoute: string = '/';
  private lastRouteSubject = new BehaviorSubject<string>(this.lastRoute);

  constructor(private router: Router) {
    // Escucha eventos de navegación para registrar la última ruta visitada
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.lastRoute = event.urlAfterRedirects;
        this.lastRouteSubject.next(this.lastRoute);
      }
    });
  }

  // Guardar la última ruta visitada
  setLastRoute(route: string): void {
    this.lastRoute = route;
    this.lastRouteSubject.next(this.lastRoute);
  }

  // Obtener la última ruta visitada
  getLastRoute(): string {
    return this.lastRoute;
  }

  // Navegar a la última ruta visitada
  navigateToLastRoute(): void {
    this.router.navigateByUrl(this.lastRoute);
  }*/
}
