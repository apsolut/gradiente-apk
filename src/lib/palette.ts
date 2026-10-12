import type { Gradient, GradientType } from "./types";

/**
 * Colour maths for the editor: hex validation (PRD F1 — invalid input must
 * show an inline error and never crash) and harmonious Randomize.
 */

export type Harmony = "analogous" | "complementary" | "triadic";

export interface Hsl {
  h: number; // 0-359
  s: number; // 0-100
  l: number; // 0-100
}

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(input: string): boolean {
  return HEX_RE.test(input.trim());
}

/** Always returns `#RRGGBB` uppercase. Throws only on input that failed isValidHex. */
export function normalizeHex(input: string): string {
  const match = HEX_RE.exec(input.trim());
  if (!match) throw new Error(`Not a hex colour: ${input}`);
  const body = match[1];
  const full =
    body.length === 3
      ? body
          .split("")
          .map((c) => c + c)
          .join("")
      : body;
  return `#${full.toUpperCase()}`;
}

export function hexToHsl(hex: string): Hsl {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(100, Math.max(0, s)) / 100;
  const lum = Math.min(100, Math.max(0, l)) / 100;

  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lum - c / 2;

  const sector = Math.floor(hue / 60) % 6;
  const rgb: [number, number, number] =
    sector === 0
      ? [c, x, 0]
      : sector === 1
        ? [x, c, 0]
        : sector === 2
          ? [0, c, x]
          : sector === 3
            ? [0, x, c]
            : sector === 4
              ? [x, 0, c]
              : [c, 0, x];

  const toByte = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${toByte(rgb[0])}${toByte(rgb[1])}${toByte(rgb[2])}`;
}

/**
 * Relative luminance per WCAG, used to decide whether a swatch needs light or
 * dark text on top of it (PRD section 4: never rely on colour alone).
 */
export function luminance(hex: string): number {
  const normalized = normalizeHex(hex);
  const channel = (pair: string) => {
    const v = parseInt(pair, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(normalized.slice(1, 3)) +
    0.7152 * channel(normalized.slice(3, 5)) +
    0.0722 * channel(normalized.slice(5, 7))
  );
}

export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#101019" : "#FFFFFF";
}

const HARMONIES: Harmony[] = ["analogous", "complementary", "triadic"];

function hueOffsets(harmony: Harmony, count: number): number[] {
  switch (harmony) {
    case "analogous":
      // Gentle sweep: 25 degrees between neighbours.
      return Array.from({ length: count }, (_, i) => i * 25);
    case "complementary":
      // Walk from the base hue to its opposite.
      return Array.from({ length: count }, (_, i) =>
        Math.round((180 / Math.max(1, count - 1)) * i),
      );
    case "triadic":
      return Array.from({ length: count }, (_, i) => (i % 3) * 120);
  }
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** PRD F1 — Randomize produces a harmonious palette, not noise. */
export function randomGradient(harmony?: Harmony): Gradient {
  const chosen = harmony ?? HARMONIES[randomInt(0, HARMONIES.length - 1)];
  const count = randomInt(2, 3);
  const baseHue = randomInt(0, 359);
  const saturation = randomInt(58, 92);
  const offsets = hueOffsets(chosen, count);

  const stops = offsets.map((offset, i) => {
    // Step lightness across the ramp so the gradient reads as depth, not mush.
    const lightness = Math.round(
      68 - (i / Math.max(1, count - 1)) * randomInt(18, 38),
    );
    return {
      color: hslToHex({
        h: baseHue + offset,
        s: saturation,
        l: lightness,
      }),
      position: Math.round((i / (count - 1)) * 100),
    };
  });

  const type: GradientType = Math.random() < 0.22 ? "radial" : "linear";

  return {
    type,
    angle: type === "radial" ? 0 : randomInt(0, 7) * 45,
    stops,
  };
}
