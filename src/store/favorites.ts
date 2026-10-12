import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Favorite, Gradient } from "@/lib/types";

/** PRD F3 — local only, hard cap of 500 items. */
export const FAVORITES_LIMIT = 500;

interface FavoritesState {
  items: Favorite[];
  /** Returns false when the 500-item cap is already reached. */
  save: (gradient: Gradient, name?: string) => boolean;
  rename: (id: string, name: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  /** Puts a removed item back where it was, for the undo snackbar. */
  restore: (favorite: Favorite, index: number) => void;
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      save: (gradient, name) => {
        if (get().items.length >= FAVORITES_LIMIT) return false;
        const favorite: Favorite = {
          ...gradient,
          id: makeId(),
          name: name?.trim() ? name.trim() : undefined,
          createdAt: Date.now(),
        };
        set((s) => ({ items: [favorite, ...s.items] }));
        return true;
      },

      rename: (id, name) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id
              ? { ...item, name: name.trim() ? name.trim() : undefined }
              : item,
          ),
        })),

      duplicate: (id) => {
        const source = get().items.find((item) => item.id === id);
        if (!source || get().items.length >= FAVORITES_LIMIT) return;
        const copy: Favorite = {
          ...source,
          id: makeId(),
          createdAt: Date.now(),
        };
        set((s) => {
          const index = s.items.findIndex((item) => item.id === id);
          const next = [...s.items];
          next.splice(index + 1, 0, copy);
          return { items: next };
        });
      },

      remove: (id) =>
        set((s) => ({ items: s.items.filter((item) => item.id !== id) })),

      restore: (favorite, index) =>
        set((s) => {
          const next = [...s.items];
          next.splice(Math.min(index, next.length), 0, favorite);
          return { items: next };
        }),
    }),
    {
      name: "gradiente-favorites",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
