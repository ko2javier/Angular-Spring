import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthHandlerService {
  private userRoles: string[] = [];
  private namespace = 'https://ko2.com/roles'; // Cambia esto a tu namespace configurado en Auth0

  constructor(private auth: AuthService) {
    this.loadUserRoles();
  }

  private loadUserRoles(): void {
    this.auth.idTokenClaims$.subscribe((claims: any) => {
      this.userRoles = claims ? claims[this.namespace] || [] : [];
    });
  }

  isAdmin(): boolean {
    return this.userRoles.includes('admin');
  }

  isSeller(): boolean {
    return this.userRoles.includes('seller');
  }

  getRoles(): string[] {
    return this.userRoles;
  }
}