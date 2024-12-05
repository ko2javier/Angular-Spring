import { Injectable } from '@angular/core';
import { CartProduct } from '@models/CartProduct';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartProduct[] = []; // Productos seleccionados (quantity > 0)
 

  constructor() {
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
  

}
