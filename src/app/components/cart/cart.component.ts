import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { environment } from 'src/app/enviroment/environment';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  userRoles: string[] = [];
  userName: string = ''; // Nombre del usuario
  cartCount: number = 0; // Conteo del carrito
  cartItems: CartProduct[] = []; // Productos en el carrito
  cart_from_bench: CartProduct[] = []; // Productos seleccionados para el carrito que vienen del bench
  private pendingSales: any[] = []; // Variable temporal para almacenar las ventas

 

  constructor(private auth: AuthService, private productsService: ProductsService,  private cartService: CartService) {
      this.cart_from_bench= this.productsService.getStoredcart_bench();
  }


  
  ngOnInit(): void {
    this.loadUserData();
    this.cartItems = this.cartService.getCartItems();
    this.updateCartCount();

    /*
    console.log('Cart items cargados en CartComponent:', JSON.stringify(this.cartItems, null, 2));
    console.log(environment.isCartActive+ " este es el valor ahora");*/

  }
  

  // Obtener datos del usuario
  loadUserData(): void {
    this.auth.idTokenClaims$.subscribe(
      (claims) => {
        if (claims) {
          this.userRoles = claims['https://ko2.com/roles/roles'] || [];
          this.userName = claims.email ? claims.email.split('@')[0] : '';
        }
      },
      (error) => {
        console.error('Error obteniendo el ID Token Claims:', error);
      }
    );
  }

    // Verificar si es admin
    isAdmin(): boolean {
      return this.userRoles.includes('admin');
    }
    loadCart(): void {
      this.cartItems = this.cartService.getCartItems();
      console.log (" esto es lo que tiene el cartService:" +this.cartItems);
      this.updateCartCount();
    }
    updateCartCount(): void {
      this.cartCount = this.cartItems.reduce((total, product) => total + product.quantity, 0);
    }
      
    // Calcular el total dinámico
  calculateTotal(): number {
    return this.cartItems.reduce((total, product) => total + product.quantity * product.price, 0);
  }

// Actualizar el número del carrito


  logout(): void {
    this.auth.logout({
      logoutParams: { federated: true },
    });
  }

  resetCart(): void {

    localStorage.removeItem('cartItems');
    localStorage.removeItem('cart_bench');
    localStorage.removeItem('products');
    environment.isCartActive=0;
     // Actualizar contador del carrito
    this.cartCount=0;
    this.cartService.resetCart();
    this.loadCart();
    
  }
// metodo para incrementar productos
  incrementQuantity(productId: number): void {
    const product = this.cartItems.find((item) => item.id === productId);
    if (product) {
      //console.log('Producto antes de actualizar:', JSON.stringify(product));
      if (product.stock > 0) {
        product.stock -= 1;
        product.quantity += 1;
        
  
        this.cartService.updateCartItems(this.cartItems);
        this.productsService.updateCartBenchProduct(product);
        this.updateCartCount();
  
        //console.log('Producto después de actualizar:', JSON.stringify(product));
      } else {
        console.warn('No hay stock disponible para este producto.');
      }
    } else {
      console.error('Producto no encontrado en el carrito.');
    }
    
  }

  // metodo para incrementar productos
  decrementQuantity(productId: number): void {
    const product = this.cartItems.find((item) => item.id === productId);
    if (product) {
     
      if (product.quantity> 0) {
        product.stock += 1;
        
        product.quantity -= 1;
        
  
        this.productsService.updateCartBenchProduct(product);
        this.cartService.updateCartItems(this.cartItems);
        this.updateCartCount();
  
        
      } else {
        console.warn('No hay stock disponible para este producto.');
      }
    } else {
      console.error('Producto no encontrado en el carrito.');
    }
   
  }

    // Confirmar la compra y enviar los productos al backend


      
  
  
}
