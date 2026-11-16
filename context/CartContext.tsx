"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/commerce/types";
import { useCurrency } from "@/context/CurrencyContext";
import { trackMetaEvent } from "@/lib/marketing/meta-pixel";
import { cartLineToGa4Item, trackGa4Event } from "@/lib/marketing/ga4";

type Toast = {
  id: number;
  message: string;
  type: "success" | "info" | "error";
};
type CartContextValue = {
  items: CartLine[];
  cartCount: number;
  subtotal: number;
  hasUnavailableCurrencyPrice: boolean;
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

function restoreCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const line = entry as Partial<CartLine> & { unitPrice?: unknown };
    if (
      !line.productId ||
      !line.variantId ||
      !line.slug ||
      !line.title ||
      !line.subtitle ||
      !line.image ||
      !line.variantName
    )
      return [];
    const storedPrices = line.unitPrices;
    const kesPrice = storedPrices?.KES ?? line.unitPrice;
    if (typeof kesPrice !== "number" || !Number.isFinite(kesPrice)) return [];
    return [
      {
        productId: line.productId,
        variantId: line.variantId,
        slug: line.slug,
        title: line.title,
        subtitle: line.subtitle,
        image: line.image,
        variantName: line.variantName,
        ...(typeof line.wristCm === "number" && line.wristCm > 0
          ? { wristCm: line.wristCm }
          : {}),
        quantity:
          typeof line.quantity === "number" && line.quantity > 0
            ? line.quantity
            : 1,
        // KES-only carts saved before dual pricing remain valid. USD is
        // intentionally unavailable until the product is priced in USD.
        unitPrices: {
          KES: kesPrice,
          USD: typeof storedPrices?.USD === "number" ? storedPrices.USD : null,
        },
      },
    ];
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { currency } = useCurrency();
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
      if (stored) setItems(restoreCart(JSON.parse(stored)));
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
          ? {
              ...line,
              // One fit per bracelet in the bag: the latest choice wins.
              variantName: newLine.variantName,
              wristCm: newLine.wristCm,
              quantity: line.quantity + quantity,
            }
          : line,
      );
    });
    setDrawerOpen(true);
    showToast(newLine.title + " added to your bag.");
    const price = newLine.unitPrices[currency];
    trackQuantityChange({ ...newLine, quantity }, quantity);
    if (price !== null)
      trackMetaEvent("AddToCart", {
        value: price * quantity,
        currency,
        content_ids: [newLine.variantId],
        contents: [{ id: newLine.variantId, quantity, item_price: price }],
      });
  };
  const trackQuantityChange = (line: CartLine, change: number) => {
    if (!change) return;
    const price = line.unitPrices[currency];
    trackGa4Event(change > 0 ? "add_to_cart" : "remove_from_cart", {
      currency,
      value: price === null ? undefined : price * Math.abs(change),
      items: [
        { ...cartLineToGa4Item(line, currency), quantity: Math.abs(change) },
      ],
    });
  };
  const findLine = (productId: string, variantId: string) =>
    items.find(
      (line) => line.productId === productId && line.variantId === variantId,
    );
  const updateQuantity = (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    const line = findLine(productId, variantId);
    if (line) trackQuantityChange(line, Math.max(quantity, 0) - line.quantity);
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
    const line = findLine(productId, variantId);
    if (line) trackQuantityChange(line, -line.quantity);
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
        (total, line) =>
          total + (line.unitPrices[currency] ?? 0) * line.quantity,
        0,
      ),
      hasUnavailableCurrencyPrice: items.some(
        (line) => line.unitPrices[currency] === null,
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
    [items, drawerOpen, toast, discoverySessionToken, currency],
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
