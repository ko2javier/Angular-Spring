import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { Products } from '@models/products.model';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { ToastService } from '@services/toast';
import { environment } from 'src/app/enviroment/environment';
import { ChangeDetectorRef } from '@angular/core';

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
/**Variables del ngIf */
  flag_insert: boolean = false; // Inicialmente false
  newProduct = { name: '', price: 0, stock: 0 }; // Modelo del producto a insertar
  

 
  

  
  constructor(private auth: AuthService, private productsService: ProductsService,  
    private cartService: CartService, private toastService: ToastService, private cdr: ChangeDetectorRef ) {
    this.cart_from_bench= this.productsService.getStoredcart_bench();
}

ngOnInit(): void {
  this.loadUserData();
  this.cartItems = this.cartService.getCartItems();
  this.loadCart();
  this.loadApiData();
  this.flag_insert=false;

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
    environment.isCartActive = 0;
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

/* Actualizamos todos los items de golpe*/

updateAllStocks(): void {
  let hasInvalidEntries = false; // Bandera para detectar entradas inválidas

  // Crear la lista de productos válidos mientras validamos
  const updatedProducts: Products[] = this.products.reduce((acc, product) => {

    // Verificar directamente si product.id existe y usarlo si es válido
  const newStock = product.id ? this.updatedStock[product.id] : undefined;

    // Validar que no sea null, undefined o letra
    if (newStock !== null && newStock !== undefined && !isNaN(newStock)) {
      
      // Validar que sea mayor a 0
      if (newStock >= 0) {
        acc.push({ ...product, stock: Number(newStock) }); // Agregar producto válido
      } else {
        hasInvalidEntries = true; // Detectar entrada inválida
      }
    }
    return acc;
  }, [] as Products[]);

  // Mostrar mensaje de error si hay valores inválidos
  if (hasInvalidEntries) {
    this.toastService.showToast(
      'Error',
      'Some stock entries are invalid. Only positive numbers are allowed.',
      true,
      'Invalid Entries'
    );
    return;
  }

  // Validar que hay productos para actualizar
  if (updatedProducts.length === 0) {
    this.toastService.showToast(
      'Error',
      'No valid changes to save.',
      true,
      'No Updates'
    );
    return;
  }

  // Llamar al servicio para actualizar los productos
  this.productsService.updateAllProducts(updatedProducts).subscribe({
    next: () => {
      // Actualización exitosa
      this.toastService.showToast(
        'Success',
        'All products updated successfully.',
        false,
        'Update Complete'
      );
      this.updatedStock = {}; // Limpiar los valores actualizados
      this.loadApiData(); // Recargar los datos de la API
    },
    error: (error) => {
      console.error('Error updating all stocks:', error);
      this.toastService.showToast(
        'Error',
        'An error occurred while updating stocks.',
        true,
        'Update Failed'
      );
    }
  });
}

/** 
 * Realizamos la logica para insertar un producto y lo relacionado con el ngIf del html
*/
/*
insertProduct(): void {
  if (this.validateProduct(this.newProduct)) {
    this.productsService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.toastService.showToast('Success', 'Product inserted successfully.', false, 'Insert Complete');
        this.flag_insert = false; // Ocultar el formulario
        this.resetForm(); // Limpiar el formulario
      },
      error: (err) => {
        console.error('Error inserting product:', err);
        this.toastService.showToast('Error', 'Failed to insert product.', true, 'Insert Failed');
      }
    });
  } else {
    console.log(" datos: "+ this.newProduct.name + " "+ this.newProduct.price 
      + " "+ this.newProduct.stock
    );
    this.toastService.showToast('Error', 'Invalid input data.', true, 'Validation Error');
  }
}*/
insertProduct(): void {
  if (this.validateProduct(this.newProduct)) {
    this.productsService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.toastService.showToast('Success', 'Product inserted successfully.', false, 'Insert Complete');
        
        // Recargar todos los datos después de la inserción
        this.loadApiData();

        // Ocultar el formulario y limpiar los campos
        this.flag_insert = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('Error inserting product:', err);
        this.toastService.showToast('Error', 'Failed to insert product.', true, 'Insert Failed');
      }
    });
  } else {
    this.toastService.showToast('Error', 'Invalid input data.', true, 'Validation Error');
  }
}


/**Modificamos la paginacion  */
updatePagination(): void {
  // Recalcular el número total de páginas
  this.totalPages = Math.ceil(this.products.length / this.rowsPerPage);

  // Actualizar los productos visibles según la página actual
  const start = (this.currentPage - 1) * this.rowsPerPage;
  const end = start + this.rowsPerPage;

  // Asignar los productos visibles
  this.paginatedProducts = this.products.slice(start, end);

  // Forzar detección de cambios si Angular no actualiza la vista automáticamente
  this.cdr.detectChanges();
}


forceChangeDetection(): void {
  this.cdr.detectChanges();
}




  // Método para activar el formulario
  activateInsert(): void {
    this.flag_insert = true;
  }

  // Validar datos del producto
  validateProduct(product: { name: string; price: number; stock: number }): boolean {
    return product.name.trim() !== '' && product.price > 0 && product.stock > 0;
  }

  // Limpiar el formulario
  
  resetForm(): void {
    this.newProduct = { name: '', price: 0, stock: 0 };
  }

  
/** 
 *  Final del  insert Item
*/

  // Borrar un producto
  deleteItem(productId: number): void {
   
      // Elimina el producto del backend
      this.productsService.deleteProduct(productId).subscribe({
        next: () => {
          // Muestra el mensaje de éxito
          this.toastService.showToast(
            'Success',
            `Product ID: ${productId} deleted successfully.`,
            false,
            'Delete Complete'
          );
  
          // Elimina el producto de la lista local
          this.products = this.products.filter(product => product.id !== productId);
  
          // Actualiza la paginación
          this.updatePagination();
  
          console.log(`Producto con ID ${productId} eliminado correctamente.`);
        },
        error: (err) => {
          console.error('Error eliminando el producto:', err);
          this.toastService.showToast(
            'Error',
            'Failed to delete product.',
            true,
            'Delete Failed'
          );
        }
      });
    }
  
  
  
  

  /** Para el toast */
closeToast(){
  this.isDuplicateEntry = false;
}

}
