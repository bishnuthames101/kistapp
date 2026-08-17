'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Medicine, CartItem } from '../types/medicine';

const STORAGE_KEY = 'kist.cart.v1';

/**
 * The stored cart is user-editable — anyone can open devtools and change a
 * price. That is fine: it is a convenience cache for the UI only, and the
 * server re-reads every price from the Medicine table when an order is placed.
 * Never treat anything read back from here as authoritative.
 */
function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that does not still look like a cart line, so one bad
    // entry from an older shape cannot break the whole epharmacy.
    return parsed.filter(
      (item): item is CartItem =>
        item && typeof item.id === 'string' && typeof item.quantity === 'number'
    );
  } catch {
    return [];
  }
}

interface CartContextType {
  items: CartItem[];
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  // Read on mount rather than in useState's initialiser: localStorage does not
  // exist during the server render, and seeding state from it would make the
  // first client render disagree with the server's HTML.
  useEffect(() => {
    const stored = readStoredCart();
    // The rule below guards against cascading renders. Rehydrating from a
    // browser-only store is the documented exception: it cannot be done during
    // render because localStorage does not exist on the server, and it runs
    // exactly once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored.length > 0) setItems(stored);
    hydrated.current = true;
  }, []);

  // Guarded on hydration so the empty initial state cannot overwrite a real
  // stored cart in the tick before the effect above runs.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private mode or a full quota. A cart that does not survive a refresh is
      // worth strictly less than one that throws on every change.
    }
  }, [items]);

  const addToCart = (medicine: Medicine) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === medicine.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === medicineId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
