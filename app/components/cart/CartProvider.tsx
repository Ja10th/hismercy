"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  inStock: boolean;
  qty: number;
};

type AddToCartInput = Omit<CartItem, "qty">;

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (item: AddToCartInput, quantity?: number) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "shop_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved) as CartItem[]);
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: AddToCartInput, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((x) => x.id === item.id);

      if (existing) {
        return current.map((x) =>
          x.id === item.id ? { ...x, qty: x.qty + quantity } : x
        );
      }

      return [...current, { ...item, qty: quantity }];
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    setItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}