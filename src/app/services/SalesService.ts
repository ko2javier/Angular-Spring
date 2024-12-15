import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sales } from '@models/SalesModel';
import { environment } from '../enviroment/environment';

@Injectable()
export class SalesService {
  private apiUrl = 'http://localhost:5000/api/sales'; // URL del backend para ventas

  constructor(private http: HttpClient) {}

  // Obtener todas las ventas
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(this.apiUrl);
  }

  // Añadir ventas al backend
  addSales(sales: any[]) {
    
    //return this.http.post(`${environment.apiUrl}/sales/sales`, salesWithDate);
    return this.http.post('http://localhost:5000/api/sales_post', sales);
  }
}
