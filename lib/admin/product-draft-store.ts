"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProductDraftStore = {
  values: Record<string, string>;
  tags: Record<string, string[]>;
  publish: boolean;
  setValue: (name: string, value: string) => void;
  setTags: (name: string, value: string[]) => void;
  setPublish: (publish: boolean) => void;
  clear: () => void;
};

export const useProductDraftStore = create<ProductDraftStore>()(
  persist(
    (set) => ({
      values: {},
      tags: {},
      publish: false,
      setValue: (name, value) =>
        set((state) => ({ values: { ...state.values, [name]: value } })),
      setTags: (name, value) =>
        set((state) => ({ tags: { ...state.tags, [name]: value } })),
      setPublish: (publish) => set({ publish }),
      clear: () => set({ values: {}, tags: {}, publish: false }),
    }),
    { name: "bwa-product-draft-v1" },
  ),
);
