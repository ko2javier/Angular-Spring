import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { Products } from '@models/products.model';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { environment } from 'src/app/enviroment/environment';

@Component({
  selector: 'app-work-bench',
  templateUrl: './work-bench.component.html',
  styleUrls: ['./work-bench.component.css'],
})
export class WorkBenchComponent implements OnInit {
  
  isAuthenticated$ = this.auth.isAuthenticated$; // Observable para verificar si el usuario está autenticado
  userRoles: string[] = []; // Guardar roles del usuario
  userName: string = ''; // Variable para el nombre del usuario
  cartCount: number = 0; // Variable para el conteo del carrito
  displayCartProducts: boolean = false; // Por defecto, se muestran 'products'
  products: Products[] = []; // Aquí almacenaremos los productos
  quantities: { [key: number]: [number, number] } = {}; // Mapa de stock actual y cantidad seleccionada
  cartProducts: CartProduct[] = []; // Productos seleccionados para el carrito

  
  
  constructor(private auth: AuthService, private productsService: ProductsService,  private cartService: CartService) {}

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
        console.log(token)
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1])); // Decodificar el payload del JWT

        // Extraer roles desde el namespace configurado
        const rolesNamespace = 'https://ko2.com/roles/roles'; // Cambia esto según tu configuración
        this.userRoles = payload[rolesNamespace] || [];
        //console.log('User Roles:', this.userRoles);
      },
      (error) => {
        console.error('Error obteniendo el Access Token:', error);
      }
    );
    
      this.loadProducts(); // Cargar productos al iniciar
  
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
/*
LoadCart_Items(): void{
 
    this.productsService.getProducts().subscribe(
      (data) => {
        // Almacenar productos originales
        this.products = data;
       
        // Inicializar cantidades y carrito
        this.quantities = {}; // Reiniciar cantidades
        this.cartProducts = data.map((product) => {
          // Inicializar stockActual y cantidadSeleccionada en `this.quantities`
          this.quantities[product.id] = [product.stock, 0];

          // Crear y devolver el CartProduct
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity: 0, // Cantidad inicial
          } as CartProduct;
        });// end of this.products.map
        this.productsService.set_cart_bench(this.cartProducts); // mando los valores al service pra recuperarlos en la 2da llamada
       
       
        
      },
      (error) => {
        console.error('Error al cargar los productos:', error);
      }
    );
    environment.isCartActive=1;
  

}*/

loadProducts(): void {
  //console.log(" valor de enviroment:"+  environment.isCartActive) ;
  if (environment.isCartActive===0){
    this.productsService.getProducts().subscribe(
      (data) => {
        // Almacenar productos originales
        this.products = data;
       
        // Inicializar cantidades y carrito
        this.quantities = {}; // Reiniciar cantidades
        this.cartProducts = data.map((product) => {
          // Inicializar stockActual y cantidadSeleccionada en `this.quantities`
          this.quantities[product.id] = [product.stock, 0];

          // Crear y devolver el CartProduct
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity: 0, // Cantidad inicial
          } as CartProduct;
        });// end of this.products.map
        this.productsService.set_cart_bench(this.cartProducts); // mando los valores al service pra recuperarlos en la 2da llamada
        console.log(" load desde el  environment.isCartActive===0")
       
        
      },
      (error) => {
        console.error('Error al cargar los productos:', error);
      }
    );
    environment.isCartActive=1;
  }
  else if(environment.isCartActive===1 ) {
    this.cartProducts= this.productsService.getStoredcart_bench();
    console.log(" load desde el  environment.isCartActive===1")
    this.displayCartProducts = true; // Por defecto, se muestran 'products'
    this.updateCartCount();

    this.quantities = {}; // Reiniciar cantidades

    this.cartProducts.forEach((product) => {
      // Sincronizar cantidades y stock directamente desde cartProducts
      this.quantities[product.id] = [product.stock, product.quantity];
    });

        
  }
}

 
// Incrementar cantidad de un producto
incrementQuantity(productId: number): void {
  const cartProduct = this.cartProducts.find((product) => product.id === productId);
  if (cartProduct && cartProduct.stock > 0) {
    // Actualizar stock y cantidad
    cartProduct.quantity += 1;
    cartProduct.stock -= 1;
    //console.log("cartProduct.quantity:"+ cartProduct.quantity);
    //console.log("cartProduct.stock:"+ cartProduct.stock);

    // Sincronizar las cantidades en el carrito
    this.quantities[productId] = [cartProduct.stock, cartProduct.quantity];

    // Actualizar servicios y contador
    this.productsService.set_cart_bench(this.cartProducts);
    this.updateCartCount();
    this.updateCartService();
  }
}



// Decrementar cantidad de un producto
decrementQuantity(productId: number): void {
 // console.log(" valor de enviroment:"+  environment.isCartActive) ;
  const [stockActual, quantity] = this.quantities[productId];
  if (quantity > 0) {
    // Actualizar stock y cantidad
    this.quantities[productId] = [stockActual + 1, quantity - 1];

    // Sincronizar con `cartProducts`
    const cartProduct = this.cartProducts.find((product) => product.id === productId);
    if (cartProduct) {
      cartProduct.quantity -= 1;
      cartProduct.stock+= 1;

    }
    this.productsService.set_cart_bench(this.cartProducts);
    this.updateCartCount(); // Actualizar contador del carrito
    this.updateCartService(); //Actualizar El servicio del cart
  
  }
}

// Actualizar el número del carrito
updateCartCount(): void {
  if (!this.cartProducts || this.cartProducts.length === 0) {
    this.cartCount = 0;
    
    return;
  }

   
  this.cartCount = this.cartProducts.reduce(
    (total, product) => total + (product.quantity || 0),
    0
  );

 
}


// Calcular el total dinámico
calculateTotal(): number {
  return this.cartProducts.reduce((total, product) => total + product.quantity * product.price, 0);
}


// Actualizar CartService 
updateCartService(): void {
  const filteredProducts = this.cartProducts.filter((product) => product.quantity > 0);
  this.cartService.updateCartItems(filteredProducts); // Esto debería actualizar el servicio.

}

/*
resetCart(): void {
  // Reset local quantities and cartProducts
  this.cartProducts.forEach((cartProduct) => {
    const [originalStock, quantity] = this.quantities[cartProduct.id];
    this.quantities[cartProduct.id] = [originalStock + quantity, 0];
    cartProduct.quantity = 0;
  });

  // Clear localStorage and reset environment variable
  environment.isCartActive = 0;
  localStorage.removeItem('cartItems');
  localStorage.removeItem('cart_bench');

  this.cartCount=0;
  this.cartService.resetCart(); 

  // Reload products from API to ensure correct stock values
  this.loadProducts();
}*/


// Resetear el carrito
resetCart(): void {
  this.cartProducts.forEach((cartProduct) => {
    // Restaurar stock en `products` y `quantities`
    const [originalStock, quantity] = this.quantities[cartProduct.id];
    this.quantities[cartProduct.id] = [originalStock + quantity, 0];

    // Sincronizar con `products`
    const product = this.products.find((p) => p.id === cartProduct.id);
    if (product) {
      product.stock = originalStock + quantity;
    }
    cartProduct.quantity = 0;  // Reiniciar cantidad en `cartProducts`
  });
  environment.isCartActive=0;
  localStorage.removeItem('cartItems');
  localStorage.removeItem('cart_bench');
 
  

  // Actualizar contador del carrito
  this.cartCount=0;
  this.cartService.resetCart(); 
  this.loadProducts();
}
 

}
