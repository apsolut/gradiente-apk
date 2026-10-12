import { useColorScheme, useWindowDimensions } from "react-native";

import { dark, light, WIDE_BREAKPOINT, type Palette } from "@/constants/theme";
import { useSettings } from "@/store/settings";

/** PRD F6 — the user's explicit choice wins, otherwise follow the system. */
export function usePalette(): Palette {
  const choice = useSettings((s) => s.theme);
  const system = useColorScheme();
  const mode = choice === "system" ? (system ?? "dark") : choice;
  return mode === "light" ? light : dark;
}

/**
 * PRD section 4 — apps targeting API 36 can't lock orientation or resizability
 * on screens 600dp and wider, so the layout has to earn the extra space.
 */
export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}
