"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/commerce/types";

type Toast = {
  id: number;
  message: string;
  type: "success" | "info" | "error";
};
type CartContextValue = {
  items: CartLine[];
  cartCount: number;
  subtotal: number;
  drawerOpen: boolean;
  discoverySessionToken: string | null;
  toast: Toast | null;
  addToCart: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  setDiscoverySessionToken: (token: string | null) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_KEY = "bwa_cart_items_v3";
const DISCOVERY_KEY = "bwa_discovery_session";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [discoverySessionToken, setDiscoverySessionToken] = useState<
    string | null
  >(null);
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
      setDiscoverySessionToken(sessionStorage.getItem(DISCOVERY_KEY));
    } catch {
      localStorage.removeItem(CART_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, loaded]);
  const saveDiscoverySession = (token: string | null) => {
    setDiscoverySessionToken(token);
    if (token) sessionStorage.setItem(DISCOVERY_KEY, token);
    else sessionStorage.removeItem(DISCOVERY_KEY);
  };
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);
  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    window.setTimeout(
      () => setToast((current) => (current?.id === id ? null : current)),
      3600,
    );
  };
  const addToCart: CartContextValue["addToCart"] = (newLine) => {
    const quantity = newLine.quantity ?? 1;
    setItems((current) => {
      const existing = current.find(
        (line) =>
          line.productId === newLine.productId &&
          line.variantId === newLine.variantId,
      );
      if (!existing) return [...current, { ...newLine, quantity }];
      return current.map((line) =>
        line === existing
          ? { ...line, quantity: line.quantity + quantity }
          : line,
      );
    });
    setDrawerOpen(true);
    showToast(newLine.title + " added to your bag.");
  };
  const updateQuantity = (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    if (quantity <= 0)
      return setItems((current) =>
        current.filter(
          (line) =>
            !(line.productId === productId && line.variantId === variantId),
        ),
      );
    setItems((current) =>
      current.map((line) =>
        line.productId === productId && line.variantId === variantId
          ? { ...line, quantity }
          : line,
      ),
    );
  };
  const removeFromCart = (productId: string, variantId: string) => {
    setItems((current) =>
      current.filter(
        (line) =>
          !(line.productId === productId && line.variantId === variantId),
      ),
    );
    showToast("Removed from your bag.", "info");
  };
  const value = useMemo(
    () => ({
      items,
      cartCount: items.reduce((count, line) => count + line.quantity, 0),
      subtotal: items.reduce(
        (total, line) => total + line.unitPrice * line.quantity,
        0,
      ),
      drawerOpen,
      discoverySessionToken,
      toast,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart: () => setItems([]),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      showToast,
      setDiscoverySessionToken: saveDiscoverySession,
    }),
    [items, drawerOpen, toast, discoverySessionToken],
  );
  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={"commerce-toast commerce-toast--" + toast.type}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
