import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** PRD F6 / F7. */
export type ThemeChoice = "system" | "light" | "dark";
export type Language = "en" | "de";

interface SettingsState {
  theme: ThemeChoice;
  language: Language;
  /**
   * SAF tree URI of the folder "Save to device" writes into, or null until the
   * user picks one. Persisting it is safe: Android holds the grant across
   * restarts, and it is a local path, not user data.
   */
  saveFolderUri: string | null;
  setTheme: (theme: ThemeChoice) => void;
  setLanguage: (language: Language) => void;
  setSaveFolderUri: (uri: string | null) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      saveFolderUri: null,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSaveFolderUri: (saveFolderUri) => set({ saveFolderUri }),
    }),
    {
      name: "gradiente-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
