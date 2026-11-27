import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  remove: (id: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((cartItem) => cartItem.id === item.id);
        if (existing) {
          return { items: state.items.map((cartItem) => cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem) };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      increase: (id) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item),
      })),
      decrease: (id) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
          .filter((item) => item.quantity > 0),
      })),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    }),
    { name: "dummyjson-cart", storage: createJSONStorage(() => localStorage) },
  ),
);
