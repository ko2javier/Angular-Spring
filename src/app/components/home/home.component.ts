import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  isAuthenticated$ = this.auth.isAuthenticated$; // Observable que verifica si el usuario está autenticado

  constructor(private auth: AuthService) {}

  login() {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout(); // Redirige a la página principal al cerrar sesión
  }

}
