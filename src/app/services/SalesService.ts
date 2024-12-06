import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sales } from '@models/SalesModel';

@Injectable()
export class SalesService {
  private apiUrl = 'http://localhost:5000/api/sales'; // URL del backend para ventas

  constructor(private http: HttpClient) {}

  // Obtener todas las ventas
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(this.apiUrl);
  }
}
