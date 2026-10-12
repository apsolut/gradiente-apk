import { create } from "zustand";

/**
 * Transient UI messages. Deliberately not persisted — a toast that survives
 * a restart is a bug, not a feature.
 */
export interface ToastAction {
  label: string;
  run: () => void;
}

interface UiState {
  toast: { message: string; action?: ToastAction; id: number } | null;
  showToast: (message: string, action?: ToastAction) => void;
  hideToast: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;
let nextId = 1;

export const useUi = create<UiState>()((set) => ({
  toast: null,

  showToast: (message, action) => {
    if (timer) clearTimeout(timer);
    set({ toast: { message, action, id: nextId++ } });
    timer = setTimeout(() => set({ toast: null }), action ? 5000 : 2200);
  },

  hideToast: () => {
    if (timer) clearTimeout(timer);
    set({ toast: null });
  },
}));
