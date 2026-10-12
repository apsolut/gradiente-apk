/** Core gradient model shared by the editor, the preview and the exporter. */

export type GradientType = "linear" | "radial";

export interface ColorStop {
  /** Hex, including leading '#'. Validated on input (PRD F1). */
  color: string;
  /** 0-100, position along the gradient line. */
  position: number;
}

export interface Gradient {
  type: GradientType;
  /** Degrees, 0-359, CSS convention: 0 = to top, 90 = to right. Linear only. */
  angle: number;
  /** 2 to 5 stops (PRD F1). */
  stops: ColorStop[];
}

export interface Preset extends Gradient {
  id: string;
  name: string;
  category: PresetCategory;
}

/** PRD F2. Generic names only — no brand names, to avoid impersonation flags. */
export type PresetCategory =
  | "Sunset"
  | "Ocean"
  | "Pastel"
  | "Neon"
  | "Dark"
  | "Mono"
  | "Nature";

export interface Favorite extends Gradient {
  id: string;
  name?: string;
  /** Epoch ms. */
  createdAt: number;
}

/** PRD F4 export sizes. `device` resolves to the actual screen pixel size. */
export type ExportSize =
  | { kind: "device" }
  | { kind: "fixed"; label: string; width: number; height: number };

/** PRD F5 code output formats. */
export type CodeFormat = "css" | "tailwind" | "hex" | "json";
