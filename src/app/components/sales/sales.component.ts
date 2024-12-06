
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { Sales } from '@models/SalesModel';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { SalesService } from '@services/SalesService';

import { environment } from 'src/app/enviroment/environment';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit{

  isAuthenticated$ = this.auth.isAuthenticated$; // Observable para verificar si el usuario está autenticado
  userRoles: string[] = []; // Guardar roles del usuario
  userName: string = ''; // Variable para el nombre del usuario
  cartCount: number = 0; // Variable para el conteo del carrito
  displayCartProducts: boolean = false; // Por defecto, se muestran 'products'
  sales: Sales[]= [];
  cartItems: CartProduct[] = []; // Productos en el carrito 

  
  constructor(private auth: AuthService, private productsService: ProductsService, 
     private cartService: CartService, private salesService: SalesService) {}

     ngOnInit(): void {
      // Obtener el `idTokenClaims` para extraer el email
      this.auth.idTokenClaims$.subscribe(
        (claims) => {
          if (claims && claims.email) {
            this.userName = claims.email.split('@')[0]; // Extraer el nombre del email
            console.log('User Email:', claims.email);
          }
        },
        (error) => {
          console.error('Error obteniendo el ID Token Claims:', error);
        }
      );
  
      // Obtener el `accessToken` para extraer roles
      this.auth.getAccessTokenSilently().subscribe(
        (token) => {
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1])); // Decodificar el payload del JWT
  
          // Extraer roles desde el namespace configurado
          const rolesNamespace = 'https://ko2.com/roles/roles'; // Cambia esto según tu configuración
          this.userRoles = payload[rolesNamespace] || [];
          console.log('User Roles:', this.userRoles);
        },
        (error) => {
          console.error('Error obteniendo el Access Token:', error);
        }
      );
      this.load_sales();
      this.loadCart();
    }


// Metodo cargar todas las ventas
  load_sales() {
  
    this.salesService.getSales().subscribe(
      (data) => {
        // Almacenar productos originales
        this.sales = data;
      });
  }
  
    // Métodos para verificar roles
    isAdmin(): boolean {
      return this.userRoles.includes('admin');
    }
  
    isSeller(): boolean {
      return this.userRoles.includes('vendedor');
    }
  
    isSellerOrAdmin(): boolean {
      return this.userRoles.includes('admin') || this.userRoles.includes('vendedor');
    }
  
    // Método para logout
    logout(): void {
      environment.isCartActive = 0; // Reiniciar el estado del carrito
      localStorage.removeItem('cart_bench');
      localStorage.removeItem('cartItems');
      
      this.auth.logout({
        logoutParams: { federated: true },
      });
    }
/* Metodos para cargar el conteo de lo que esta en el carrito*/
    loadCart(): void {
      this.cartItems = this.cartService.getCartItems();
      this.cartCount = this.cartItems.reduce((total, product) => total + product.quantity, 0);
      console.log (" esto es lo que tiene el cartService:" +this.cartItems);

   
    }
   

}
