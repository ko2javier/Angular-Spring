import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@auth0/auth0-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Obtener el token de Auth0 de forma segura
    return from(this.auth.getAccessTokenSilently()).pipe(
      switchMap((token) => {
        if (token) {
          // Clonar la solicitud y agregar el encabezado de autorización
          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(clonedRequest);
        }
        // Si no hay token, enviar la solicitud original
        return next.handle(request);
      })
    );
  }
}
