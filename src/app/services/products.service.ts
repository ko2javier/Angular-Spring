import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Products } from '@models/products.model';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:5000/api/prod'; // URL del backend para productos

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProducts(): Observable<Products[]> {
    return this.http.get<Products[]>(this.apiUrl);
  }

  // Crear un nuevo producto
  createProduct(product: Products): Observable<Products> {
    return this.http.post<Products>(this.apiUrl, product);
  }

  // Actualizar un producto
  updateProduct(product: Products): Observable<Products> {
    return this.http.put<Products>(`${this.apiUrl}/${product.id}`, product);
  }

  // Eliminar un producto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
