import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { Products } from '@models/products.model';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { environment } from 'src/app/enviroment/environment';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent {

  userRoles: string[] = [];
  userName: string = ''; // Nombre del usuario
  cartCount: number = 0; // Conteo del carrito
  products: Products[] = []; // Aquí almacenaremos los productos
  cartItems: CartProduct[] = []; // Productos en el carrito
  cart_from_bench: CartProduct[] = []; // Productos seleccionados para el carrito que vienen del bench

  rowsPerPage: number = 7; // Número de filas por página
currentPage: number = 1; // Página actual
totalPages: number = 0; // Total de páginas
paginatedProducts: Products[] = []; // Productos visibles en la tabla

  

  
  constructor(private auth: AuthService, private productsService: ProductsService,  private cartService: CartService) {
    this.cart_from_bench= this.productsService.getStoredcart_bench();
}

ngOnInit(): void {
  this.loadUserData();
  this.cartItems = this.cartService.getCartItems();
  this.loadCart();
  this.loadApiData();

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
/*
loadApiData(): void {

  this.productsService.getProducts().subscribe(
    (data) => {
      // Almacenar productos originales
      this.products = data;
     
      // Inicializar cantidades y carrito
      
    },
    (error) => {
      console.error('Error al cargar los productos:', error);
    }
  );
  //environment.isCartActive=; 
}*/

  // Verificar si es admin
  isAdmin(): boolean {
    return this.userRoles.includes('admin');
  }
  loadCart(): void {
       
    this.cartCount = this.cartItems.reduce((total, product) => total + product.quantity, 0);

  }


  // Cargar datos desde la API
  loadApiData(): void {
    this.productsService.getProducts().subscribe(
      (data) => {
        // Almacena todos los productos
        this.products = data;
  
        // Inicializa los productos de la primera página
        this.currentPage = 1; // Página inicial
        const start = 0;
        const end = this.rowsPerPage;
  
        this.paginatedProducts = this.products.slice(start, end);
  
        // Calcula el número total de páginas
        this.totalPages = Math.ceil(this.products.length / this.rowsPerPage);
      },
      (error) => {
        console.error('Error al cargar los productos:', error);
      }
    );
  }
  

  // Mostrar la tabla para la página actual
  displayTable(page: number): void {
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedProducts = this.products.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    this.currentPage = page;
  
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
  
    // Actualiza la lista de productos visibles
    this.paginatedProducts = this.products.slice(start, end);
  }
  

      
  // Calcular el total dinámico
calculateTotal(): number {
  return this.cartItems.reduce((total, product) => total + product.quantity * product.price, 0);
}

logout(): void {
  this.auth.logout({
    logoutParams: { federated: true },
  });
}



}
