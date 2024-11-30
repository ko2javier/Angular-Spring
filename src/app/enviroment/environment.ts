// environment.ts
export const environment = {
  production: false,
  get isCartActive(): number {
    return parseInt(localStorage.getItem('isCartActive') || '0', 10);
  },
  set isCartActive(value: number) {
    localStorage.setItem('isCartActive', value.toString());
  },
};
