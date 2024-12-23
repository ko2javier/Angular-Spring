
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

   /** Variables de paginación */
   rowsPerPage: number = 8; // Número de filas por página
   currentPage: number = 1; // Página actual
   totalPages: number = 0; // Total de páginas calculadas
   paginatedProducts: Sales[] = []; // Ventas visibles en la página actual

  
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
        this.currentPage = 1; // Página inicial
        const start = 0;
        const end = this.rowsPerPage;
  
        this.paginatedProducts = this.sales.slice(start, end);
  
        // Calcula el número total de páginas
        this.totalPages = Math.ceil(this.sales.length / this.rowsPerPage);
        
      });
  }
/* Lo relacionado con la paginacion !!!*/
  // Actualizar la paginación
 // Mostrar la tabla para la página actual
 displayTable(page: number): void {
  const start = (page - 1) * this.rowsPerPage;
  const end = start + this.rowsPerPage;
  this.paginatedProducts = this.sales.slice(start, end);
}

// Cambiar página
changePage(page: number): void {
  this.currentPage = page;

  const start = (this.currentPage - 1) * this.rowsPerPage;
  const end = start + this.rowsPerPage;

  // Actualiza la lista de productos visibles
  this.paginatedProducts = this.sales.slice(start, end);
}


  /* FIN de Lo relacionado con la paginacion !!!*/

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
