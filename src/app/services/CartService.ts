import { Injectable } from '@angular/core';
import { CartProduct } from '@models/CartProduct';


@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartProduct[] = [];

  // Obtener productos del carrito
  getCartItems(): CartProduct[] {
    console.log('Cart items en el servicio:', JSON.stringify(this.cartItems, null, 2));
    return this.cartItems;
  }
  

  // Actualizar productos del carrito
  updateCartItems(cartProducts: CartProduct[]): void {
    this.cartItems = cartProducts
      .filter((product) => product.quantity > 0)
      .map((product) => ({ ...product })); // Crear una copia nueva de cada objeto
  }
  

  // Resetear el carrito
  resetCart(): void {
    this.cartItems = [];
  }
}
