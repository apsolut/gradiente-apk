/**
 * Gradiente's own chrome (not the gradients it makes).
 * PRD F6: System / Light / Dark.
 */
export interface Palette {
  mode: "light" | "dark";
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  danger: string;
}

export const dark: Palette = {
  mode: "dark",
  bg: "#1B1B2F",
  surface: "#252540",
  surfaceAlt: "#2F2F4F",
  border: "#3A3A5C",
  text: "#F2F2F7",
  textDim: "#A0A0B8",
  accent: "#9B8CFF",
  danger: "#FF6B81",
};

export const light: Palette = {
  mode: "light",
  bg: "#F7F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEFF6",
  border: "#DCDCE8",
  text: "#1B1B2F",
  textDim: "#5E5E7A",
  accent: "#6A4DFF",
  danger: "#D4294A",
};

/**
 * Controls that sit on top of a user-chosen gradient can't follow the theme —
 * the gradient could be any colour. They always use this dark scrim so the
 * contrast ratio holds whatever is behind them.
 */
export const SCRIM = "rgba(20,20,34,0.74)";
export const ON_SCRIM = "#FFFFFF";

/** PRD section 4: touch targets at least 48x48dp. */
export const TOUCH_TARGET = 48;

/** PRD section 4: two-pane layout above this width. */
export const WIDE_BREAKPOINT = 600;

/** Splash + adaptive icon background, kept in sync with app.json. */
export const BRAND_BG = "#1B1B2F";
