/*
import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(public auth: AuthService) {}

  loginWithApple() {
    this.auth.loginWithRedirect({
      appState: { target: '/' }, // Redirige a la raíz después de loguearse
      ...( { connection: 'con_1rAV2CQaGt5rKKJo' } as any ), // Conexión para Apple
    });
  }

  loginWithFacebook() {
    this.auth.loginWithRedirect({
      appState: { target: '/' },
      ...( { connection: 'con_8D3gMocQ8zHmmiAK' } as any ), // Conexión para Facebook
    });
  }

  loginWithGoogle() {
    this.auth.loginWithRedirect({
      appState: { target: '/' },
      ...( { connection: 'con_KRdHeFwLegCJdya2' } as any ), // Conexión para Gmail
    });
  }

  login() {
    this.auth.loginWithRedirect(); // Login genérico si no se especifica proveedor
  }
}
*/
