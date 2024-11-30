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
  products: Products[] = []; // Aquí almacenaremos los productos
  quantities: { [key: number]: [number, number] } = {}; // Mapa de stock actual y cantidad seleccionada
  cartProducts: CartProduct[] = []; // Productos seleccionados para el carrito
  cart_temp: CartProduct[] = []; // Productos seleccionados para el carrito
  
  
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
    if (environment.isCartActive===0){
      this.loadProducts(); // Cargar productos al iniciar
    }
    
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
    this.auth.logout({
      logoutParams: { federated: true },
    });
  }

    // Método para cargar los productos desde la API
/*
loadProducts(): void {
  this.productsService.getProducts().subscribe(
    (data) => {
     this.products = data; // Almacenar productos en el array original
      // Inicializar cantidades y carrito
      this.quantities = {}; // Reiniciar las cantidades
      this.cartProducts = []; // Reiniciar el carrito
      console.log('Productos antes del mapeo:', this.products);
      
      this.cart_temp= this.products.map((product) => ({
        ...product,
        quantity: 0,
      }));
      console.log('Card after el mapeo:', this.cart_temp);
      
      this.products.forEach((product) => {
      // Inicializar stockActual y cantidadSeleccionada
      this.quantities[product.id] = [product.stock, 0];
        // Mapear cada producto a un CartProduct inicial
        const cartProduct: CartProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: 0, // Cantidad inicial
        };
        this.cartProducts.push(cartProduct);
       
      });
    },
    (error) => {
      console.error('Error al cargar los productos:', error);
    }
  );
  
 
  console.log('this.cartProducts after el mapeo:', this.cartProducts);
}*/
loadProducts(): void {
  console.log(" valor de enviroment:"+  environment.isCartActive) ;
  this.productsService.getProducts().subscribe(
    (data) => {
      // Almacenar productos originales
      this.products = data;
      console.log('Productos antes del mapeo:', this.products);

      // Inicializar cantidades y carrito
      this.quantities = {}; // Reiniciar cantidades
      this.cartProducts = this.products.map((product) => {
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
      });

      console.log('CartProducts después del mapeo:', this.cartProducts);
      
    },
    (error) => {
      console.error('Error al cargar los productos:', error);
    }
  );
  environment.isCartActive=1;
}


 // Incrementar cantidad de un producto
incrementQuantity(productId: number): void {
  console.log(" valor de enviroment:"+  environment.isCartActive) ;
  const [stockActual, quantity] = this.quantities[productId];
  if (stockActual > 0) {
    // Actualizar stock y cantidad
    this.quantities[productId] = [stockActual - 1, quantity + 1];

    // Sincronizar con `cartProducts`
    const cartProduct = this.cartProducts.find((product) => product.id === productId);
    if (cartProduct) {
      cartProduct.quantity = quantity + 1;
      this.products[cartProduct.id-1].stock=stockActual-1;
    }

    this.updateCartCount(); // Actualizar contador del carrito
    this.updateCartService(); //Actualizar El servicio del cart
    console.log(" valores mayor que cero en el service:" + this.cartService.getCartItems().length);
  }
}

// Decrementar cantidad de un producto
decrementQuantity(productId: number): void {
  console.log(" valor de enviroment:"+  environment.isCartActive) ;
  const [stockActual, quantity] = this.quantities[productId];
  if (quantity > 0) {
    // Actualizar stock y cantidad
    this.quantities[productId] = [stockActual + 1, quantity - 1];

    // Sincronizar con `cartProducts`
    const cartProduct = this.cartProducts.find((product) => product.id === productId);
    if (cartProduct) {
      cartProduct.quantity = quantity - 1;

      this.products[cartProduct.id-1].stock=stockActual+1;
    }

    this.updateCartCount(); // Actualizar contador del carrito
    this.updateCartService(); //Actualizar El servicio del cart
    console.log(" valores mayor que cero en el service:" + this.cartService.getCartItems());
  }
}

// Actualizar el número del carrito
updateCartCount(): void {
  this.cartCount = this.cartProducts.reduce((total, product) => total + product.quantity, 0);
}

// Calcular el total dinámico
calculateTotal(): number {
  return this.cartProducts.reduce((total, product) => total + product.quantity * product.price, 0);
}

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

  // Actualizar contador del carrito
  this.updateCartCount();
  this.cartService.resetCart();
  
}

 // Actualizar CartService 
 updateCartService(): void {
  const filteredProducts = this.cartProducts.filter((product) => product.quantity > 0);
  this.cartService.updateCartItems(filteredProducts); // Esto debería actualizar el servicio.
  console.log('Items enviados al servicio:', filteredProducts);
}




}
