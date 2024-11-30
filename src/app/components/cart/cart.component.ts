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
 

  constructor(private auth: AuthService, private productsService: ProductsService,  private cartService: CartService) {}
/*
  ngOnInit(): void {
    this.loadUserData();
    this.loadCart();

  }*/

  ngOnInit(): void {
    this.loadUserData();
    this.cartItems = this.cartService.getCartItems();
    this.updateCartCount();
    console.log('Cart items cargados en CartComponent:', JSON.stringify(this.cartItems, null, 2));
    console.log(environment.isCartActive+ " este es el valor ahora");

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
}
