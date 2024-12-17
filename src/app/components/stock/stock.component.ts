import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { Products } from '@models/products.model';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { ToastService } from '@services/toast';
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
  updatedStock: { [id: number]: number |null } = {}; // Almacena valores de los cuadros de texto

  rowsPerPage: number = 7; // Número de filas por página
 currentPage: number = 1; // Página actual
 totalPages: number = 0; // Total de páginas
 paginatedProducts: Products[] = []; // Productos visibles en la tabla

 /**Variables del toast */
 public isDuplicateEntry: boolean = false; // Tracks if the entry is a duplicate
  public errorAcction: boolean = false;
  public titleTiast: string = '';
  public subTitleTiast: string = '';
  public commentToast: string = '';
  

  
  constructor(private auth: AuthService, private productsService: ProductsService,  
    private cartService: CartService, private toastService: ToastService) {
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

 // Actualizar stock
 /*
 updateStock(productId: number): void {
  const productToUpdate = this.products.find(p => p.id === productId);

  if (productToUpdate && this.updatedStock[productId]) {

    productToUpdate.stock = this.updatedStock[productId]; // Actualizar el stock localmente

    this.productsService.updateProduct(productToUpdate).subscribe(() => {
      environment.isCartActive=0;
      this.updatedStock[productId] = null;
      alert(`Stock actualizado para el producto con ID: ${productId}`);
      this.loadApiData() // Refrescar la lista después de actualizar
    }, (error) => {
      console.error('Error actualizando el stock:', error);
    });
  }
}*/
// Actualizar stock
updateStock(productId: number): void {


  const productToUpdate = this.products.find(p => p.id === productId);

  // Validar que el producto existe y el stock ingresado es válido (positivo y no null)
  const newStock = this.updatedStock[productId];
  if (productToUpdate && newStock !== null && newStock > 0) {

    productToUpdate.stock = newStock; // Actualizar el stock localmente

    this.productsService.updateProduct(productToUpdate).subscribe(() => {
      environment.isCartActive = 0;

      // Restablecer el input a null después de la actualización
      this.updatedStock[productId] = null;

      this.loadApiData(); // Refrescar la lista después de actualizar
      this.toastService.showToast(
        'Success', 
        'Stock updated successfully',
        false,
        'Update Complete'
      );
    }, (error) => {
      
      console.error('Error actualizando el stock:', error);
    });

  } else {
    this.toastService.showToast(
      'Error',
      'Only positive numbers are allowed',
      true,
      'Bad Input'
    );

    // Si el valor no es válido, mostrar una alerta
    /*
    this.isDuplicateEntry = true; // Set the variable to true if it's a duplicate entry
        this.titleTiast = 'Error'
        this.subTitleTiast = 'Bad Input'
        this.commentToast = 'Only positive numbers are allowed'
        this.errorAcction = true;
        setTimeout(()=>{
          this.isDuplicateEntry = false;
        }, 4000)*/
  }
}

  // Borrar un producto
  deleteItem(productId: number): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID: ${productId}?`)) {
      this.productsService.deleteProduct(productId).subscribe(() => {
        alert(`Producto con ID ${productId} eliminado`);
        environment.isCartActive=0;
        this.loadApiData() // Refrescar la lista después de eliminar
      }, (error) => {
        console.error('Error eliminando el producto:', error);
      });
    }
  }


  /** Para el toast */
closeToast(){
  this.isDuplicateEntry = false;
}

}
