import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Products } from '@models/products.model';
import { CartProduct } from '@models/CartProduct';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:5000/api/prod'; // URL del backend para productos

  private cart_bench: CartProduct[] = []; // Todos los productos en el bench

  constructor(private http: HttpClient) {
    
  }

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
  
 

  set_cart_bench(cart_bench: CartProduct[]): void {
    this.cart_bench = cart_bench; // Guardar en la variable local
   
    localStorage.setItem('cart_bench', JSON.stringify(cart_bench)); // Guardar en localStorage
    console.log('Guardando en cart_bench:', JSON.stringify(cart_bench, null, 2));
  }

  getStoredcart_bench(): CartProduct[] {
   
     const storedcart_bench = localStorage.getItem('cart_bench');
     if (storedcart_bench) {
       this.cart_bench = JSON.parse(storedcart_bench);
       return this.cart_bench; // Retornar productos desde el localStorage
     }
     
     return []; // Retornar array vacío si no hay productos
   }
 
   /*
    método updateCartBenchProduct que reciba el producto modificado y actualice 
    solo el elemento correspondiente en el cart_bench:*/ 
    
   updateCartBenchProduct(updatedProduct: CartProduct): void {
    // Encuentra el índice del producto que debe ser actualizado
    const index = this.cart_bench.findIndex(product => product.id === updatedProduct.id);
  
   
      // Actualiza solo los valores necesarios (stock y quantity)
      this.cart_bench[index].stock = updatedProduct.stock;
      this.cart_bench[index].quantity = updatedProduct.quantity;
  
      // Guarda los cambios en localStorage
      localStorage.setItem('cart_bench', JSON.stringify(this.cart_bench));
     
   
  }
  
 
}
