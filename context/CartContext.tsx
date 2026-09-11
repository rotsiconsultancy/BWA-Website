"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

interface ToastNotification {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  toast: ToastNotification | null;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "bwa_cart_items_v2";

const INITIAL_CART_ITEM: CartItem = {
  id: "bwa-001",
  slug: "the-grounded",
  title: "THE GROUNDED",
  subtitle: "Black Onyx + Lava Stone",
  price: 3800,
  image: "/images/hero-find-your-vibe.png",
  quantity: 1,
  size: "M / 18cm",
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Default with initial sample item for rich demo experience
        setItems([INITIAL_CART_ITEM]);
      }
    } catch {
      setItems([INITIAL_CART_ITEM]);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [items, isLoaded]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    const targetSize = newItem.size || "M / 18cm";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === newItem.id && i.size === targetSize
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            ...newItem,
            size: targetSize,
            quantity: qty,
          },
        ];
      }
    });

    showToast(`Added "${newItem.title}" to your bag.`, "success");
  };

  const removeFromCart = (id: string, size: string) => {
    setItems((prevItems) => prevItems.filter((i) => !(i.id === id && i.size === size)));
    showToast("Item removed from your bag.", "info");
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((i) => (i.id === id && i.size === size ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        toast,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: toast.type === "error" ? "var(--error)" : "var(--charcoal)",
            color: "var(--ivory)",
            padding: "14px 24px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.28)",
            border: "1px solid rgba(245, 241, 232, 0.18)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideInUp 250ms ease-out",
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
