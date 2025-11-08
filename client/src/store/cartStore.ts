import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
}

export const getTotalItems = (items: CartItem[]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

export const getTotalPrice = (items: CartItem[]) => {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (product, quantity) => {
    const items = get().items;
    const existingItem = items.find(item => item.product.sku === product.sku);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ items: [...items, { product, quantity }] });
    }
  },
  
  removeItem: (sku) => {
    set({ items: get().items.filter(item => item.product.sku !== sku) });
  },
  
  updateQuantity: (sku, quantity) => {
    if (quantity <= 0) {
      get().removeItem(sku);
      return;
    }
    
    set({
      items: get().items.map(item =>
        item.product.sku === sku ? { ...item, quantity } : item
      ),
    });
  },
  
  clearCart: () => {
    set({ items: [] });
  },
}));