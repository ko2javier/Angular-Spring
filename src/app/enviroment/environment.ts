export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api', // URL base de la API
  
  get isCartActive(): number {
    return parseInt(localStorage.getItem('isCartActive') || '0', 10);
  },
  set isCartActive(value: number) {
    console.log(`Seteando isCartActive a: ${value}`); // Confirmar la operación
    localStorage.setItem('isCartActive', value.toString());
  },
};
