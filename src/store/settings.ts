import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** PRD F6 / F7. */
export type ThemeChoice = "system" | "light" | "dark";
export type Language = "en" | "de";

interface SettingsState {
  theme: ThemeChoice;
  language: Language;
  setTheme: (theme: ThemeChoice) => void;
  setLanguage: (language: Language) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "gradiente-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
