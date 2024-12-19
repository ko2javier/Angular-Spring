import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CartProduct } from '@models/CartProduct';
import { CartService } from '@services/CartService';
import { ProductsService } from '@services/products.service';
import { ToastService } from '@services/toast';

import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from 'src/app/enviroment/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

   userRoles: string[] = [];
    userName: string = ''; // Nombre del usuario
    cartCount: number = 0; // Conteo del carrito
    cartItems: CartProduct[] = []; // Productos en el carrito
    cart_from_bench: CartProduct[] = []; // Productos seleccionados para el carrito que vienen del bench
    private pendingSales: any[] = []; // Variable temporal para almacenar las ventas

    /**todo lo referente a stripe */
  stripe: Stripe | null = null; // Almacena la instancia de Stripe
  elements: StripeElements | null = null; // Elementos de Stripe
  cardElement: StripeCardElement | null = null; // Elemento de tarjeta

  isProcessing: boolean = false; // Controla el estado del pago
  errorMessage: string | undefined = "";

  
    
    constructor(private auth: AuthService, private productsService: ProductsService,  
      private http: HttpClient,private cartService: CartService,  private toastService: ToastService) {

        this.cart_from_bench= this.productsService.getStoredcart_bench();
    }

   

    async ngOnInit() {

      /** Lo referente a datos del usuario */
      this.loadUserData();
      this.cartItems = this.cartService.getCartItems();
      this.updateCartCount();
      this.calculateTotal();

       /** Lo referente a stripe y su inicializacion !! */
    
      // Inicializa Stripe con tu clave pública
      this.stripe = await loadStripe('pk_test_51QXJFaFSJlNz9yxYQFRy1lQAfyBhmg9OHqzLqX6r6ur6QCUDfdcrPlfpC4a866VbaYzLr7CbW8NgrpYJkoF3jOB5009rNGk6E0');
  
      if (this.stripe) {
        // Inicializa los elementos de Stripe
        this.elements = this.stripe.elements();
  
        // Crea el input para la tarjeta de crédito
        this.cardElement = this.elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#fa755a' },
          },
        });
  
        // Monta el input de la tarjeta en el div con id="card-element"
        this.cardElement.mount('#card-element');
      }
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
  console.log(this.cartItems.reduce((total, product) => total + product.quantity * product.price, 0) +":total a pagar");
  return this.cartItems.reduce((total, product) => total + product.quantity * product.price, 0);

}
    
  logout(): void {
    this.auth.logout({
      logoutParams: { federated: true },
    });
  }

  // Procesar el pago
  
 
    async processPayment() {

      //(click)="updateProductsAndSales()"
      this.isProcessing = true; // Indica que el pago está en proceso
      this.errorMessage = "";
      const amountInCents = Math.round(this.calculateTotal() * 100);
    
      if (this.stripe && this.cardElement) {
        // Crear el PaymentMethod
        const { error, paymentMethod } = await this.stripe.createPaymentMethod({
          type: 'card',
          card: this.cardElement,
        });
    
        if (error) {
          console.error('Error al crear el método de pago:', error.message);
          this.errorMessage = error.message || "Error al crear el método de pago";
          this.isProcessing = false;
        } else {
          console.log('PaymentMethod creado:', paymentMethod);
    
          // Enviar el PaymentMethod ID y el monto al backend
          this.http.post<any>( environment.apiUrl+'/payments/create-payment-intent', {
            paymentMethodId: paymentMethod.id,
            amount: amountInCents
          }).subscribe({
            next: (response) => {
              console.log('Respuesta del backend:', response);
              if (response.status === 'succeeded') {
                /** Aviso que el pago se hizo bien */
                this.toastService.showToast(
                  'Success', 
                  'Payment completed',
                  false,
                  'Success'
                );
                // si todo va bien hago el update en los productos!!
                this.updateProductsAndSales();

              } else {
                this.toastService.showToast(
                  'Error',
                  'Paymend not completed',
                  true,
                  'Error'
                );
              }
              this.isProcessing = false;
            },
            error: (err) => {
              console.error('Error en el servidor:', err);
              this.errorMessage = 'Error procesando el pago.';
              this.isProcessing = false;
            }
          });
        }
      }
    }
// Logica para registrar todo en las API. 
    updateProductsAndSales(): void {
      console.log('Iniciando el proceso de actualización de productos.');
    
      // Transformar `CartProduct` a `Products`
      const updatedProducts = this.cartItems.map(cartItem => ({
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        stock: cartItem.stock, // Reducimos el stock
      }));
    
      // Preparar los datos de ventas y almacenarlos temporalmente
      this.pendingSales = this.cartItems.map(cartItem => ({
        name: cartItem.name,
        price: cartItem.price,
        cantidad: cartItem.quantity,
        user: this.userName, // Obtenemos el usuario
        date: new Date().toISOString().split('T')[0] // Fecha actual (yyyy-MM-dd)
      }));


    
      // Actualizar productos
      this.cartService.updateProducts(updatedProducts).subscribe({
        next: () => {
          console.log('Productos actualizados exitosamente.');
    
          // Limpia el carrito y dispara el registro de ventas
          this.resetCart();
        
        },
        error: error => {
          console.error('Error al actualizar los productos:', error);
          
        },
      });

      this.registerPendingSales(); // Registro de ventas
    }

    registerPendingSales(): void {
      if (this.pendingSales.length === 0) {
        console.log('No hay ventas pendientes para registrar.');
        return;
      }
    
      console.log('Registrando ventas pendientes:', this.pendingSales);
    
      this.cartService.registerSalesOnly(this.pendingSales).subscribe({
        next: () => {
          console.log('Ventas registradas exitosamente.');
          
          this.pendingSales = []; // Limpiar las ventas pendientes
        },
        error: error => {
          console.error('Error al registrar las ventas:', error);
         
        },
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

}
