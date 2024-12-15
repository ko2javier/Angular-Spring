import { Injectable } from '@angular/core';
import { CartProduct } from '@models/CartProduct';
import { Observable } from 'rxjs';
import { environment } from '../enviroment/environment';
import { HttpClient } from '@angular/common/http';
import { SalesService } from './SalesService';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartProduct[] = []; // Productos seleccionados (quantity > 0)
  //private baseUrl = `${environment.apiUrl}/cart`;
  private baseUrl = "http://localhost:5000/api/cart";
 // http://localhost:5000/api/cart
 //http://localhost:4200/localhost:5000/api/cart
 
  constructor(private http: HttpClient, private salesService:SalesService) {
    // Cargar datos desde localStorage al inicializar
    this.restoreFromLocalStorage();
  }

  // Obtener productos seleccionados para el carrito (quantity > 0)
  getCartItems(): CartProduct[] {
    return [...this.cartItems]; // Retornar una copia
  }

  
  // Inicializar carrito (cart_bench) desde una lista de productos
  

  // Actualizar productos seleccionados para el carrito
  updateCartItems(cartProducts: CartProduct[]): void {
    this.cartItems = cartProducts.filter((product) => product.quantity > 0);
    this.saveToLocalStorage();
  }

  // Actualizar todos los productos del bench (cart_bench)


  // Guardar datos en localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    //localStorage.setItem('cartBench', JSON.stringify(this.cart_bench));
  }

  // Restaurar datos desde localStorage
  private restoreFromLocalStorage(): void {
    const storedCartItems = localStorage.getItem('cartItems');
    const storedCartBench = localStorage.getItem('cartBench');
    if (storedCartItems) {
      this.cartItems = JSON.parse(storedCartItems);
    }
    
  }

  // Resetear el carrito (vaciar cartItems )
  resetCart(): void {
    
    this.cartItems = [];
    this.saveToLocalStorage();
  }

  // Sincronizar cambios de cantidad y stock para un producto específico
  updateQuantityAndStock(productId: number, quantity: number, stock: number): void {
   
    const cartProduct = this.cartItems.find((item) => item.id === productId);


    if (cartProduct) {
      cartProduct.quantity = quantity;
      cartProduct.stock = stock;
    }

    this.saveToLocalStorage();
  }

   // Actualizar productos en el backend
   updateProducts(updatedProducts: any[]) {
    return this.http.put(this.baseUrl, updatedProducts);
  }
  
  // Coordinar la actualización de productos y el registro de ventas
  /*
  updateProductsAndRegisterSales(updatedProducts: any[], salesData: any[]) {
    return new Observable(observer => {
      // Actualizar productos
      this.updateProducts(updatedProducts).subscribe(
        () => {
          console.log('Productos actualizados exitosamente');
          // Registrar las ventas en el backend
          this.salesService.addSales(salesData).subscribe(
            () => {
              console.log('Ventas registradas exitosamente');
              observer.next(); // Notificar éxito
              observer.complete();
            },
            error => {
              console.error('Error al registrar las ventas:', error);
              observer.error(error);
            }
          );
        },
        error => {
          console.error('Error al actualizar los productos:', error);
          observer.error(error);
        }
      );
    });
  }*/

    updateProductsAndRegisterSales(updatedProducts: any[], salesData: any[]): Observable<any> {
      return new Observable(observer => {
        console.log('Datos enviados para actualizar productos:', updatedProducts);
        console.log('Datos enviados para registrar ventas:', salesData);
    
        this.updateProducts(updatedProducts).subscribe({
          next: () => {
            console.log('Productos actualizados exitosamente');
            this.salesService.addSales(salesData).subscribe({
              next: () => {
                console.log('Ventas registradas exitosamente');
                observer.next('Operación completada con éxito');
                observer.complete();
              },
              error: error => {
                console.error('Error al registrar las ventas:', error);
                observer.error('Error al registrar las ventas');
              }
            });
          },
          error: error => {
            console.error('Error al actualizar los productos:', error);
            observer.error('Error al actualizar los productos');
          }
        });
      });
    }

    registerSalesOnly(salesData: any[]): Observable<any> {
      console.log('Datos enviados para registrar ventas:', salesData);
      return this.salesService.addSales(salesData);
    }
      
    
    

}
