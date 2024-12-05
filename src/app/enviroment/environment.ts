export const environment = {
  production: false,
  get isCartActive(): number {
    return parseInt(localStorage.getItem('isCartActive') || '0', 10);
  },
  set isCartActive(value: number) {
    console.log(`Seteando isCartActive a: ${value}`); // Confirmar la operación
    localStorage.setItem('isCartActive', value.toString());
  },
};
