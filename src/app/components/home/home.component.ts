import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  isAuthenticated$ = this.auth.isAuthenticated$; // Observable que verifica si el usuario está autenticado

  constructor(private auth: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Redirigir a WorkBench si el usuario está autenticado
        this.router.navigate(['/workbench']);
      }
    });
  }

  login() {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout(); // Redirige a la página principal al cerrar sesión
  }

}
