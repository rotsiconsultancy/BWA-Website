"use client";

import { useEffect, useState } from "react";

// Details a customer typed at checkout, kept only in this browser so the next
// order fills itself in. It is not an account: nothing is stored on our side
// beyond the order itself, and "Forget me" clears it from the phone.
export type SavedOrder = {
  orderNumber: string;
  placedAt: string;
  total: string;
};

export type SavedCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  deliveryMethod: "standard" | "pickup";
  orders: SavedOrder[];
};

const STORAGE_KEY = "bwa_saved_customer";
const CHANGE_EVENT = "bwa-saved-customer";
const MAX_ORDERS = 10;

export function readSavedCustomer(): SavedCustomer | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as SavedCustomer;
    if (!parsed.firstName || !parsed.phone) return null;
    return { ...parsed, orders: parsed.orders ?? [] };
  } catch {
    return null;
  }
}

function write(value: SavedCustomer | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the site still works, it just forgets.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveCustomerOrder(
  details: Omit<SavedCustomer, "orders">,
  order: SavedOrder,
) {
  const previous = readSavedCustomer()?.orders ?? [];
  write({
    ...details,
    orders: [
      order,
      ...previous.filter((item) => item.orderNumber !== order.orderNumber),
    ].slice(0, MAX_ORDERS),
  });
}

export function forgetSavedCustomer() {
  write(null);
}

export function useSavedCustomer() {
  const [customer, setCustomer] = useState<SavedCustomer | null>(null);
  useEffect(() => {
    const sync = () => setCustomer(readSavedCustomer());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return customer;
}
