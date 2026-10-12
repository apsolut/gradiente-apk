import type { CodeFormat, Gradient } from "./types";

/** PRD F5 — one gradient, four copyable representations. */

function sortedStops(gradient: Gradient) {
  return [...gradient.stops].sort((a, b) => a.position - b.position);
}

function stopList(gradient: Gradient) {
  return sortedStops(gradient)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
}

export function toCss(gradient: Gradient): string {
  if (gradient.type === "radial") {
    return `radial-gradient(circle at 50% 50%, ${stopList(gradient)})`;
  }
  return `linear-gradient(${gradient.angle}deg, ${stopList(gradient)})`;
}

export function toTailwind(gradient: Gradient): string {
  return `bg-[${toCss(gradient).replace(/\s+/g, "_")}]`;
}

export function toHexList(gradient: Gradient): string {
  return sortedStops(gradient)
    .map((s) => s.color.toUpperCase())
    .join(", ");
}

export function toJson(gradient: Gradient): string {
  return JSON.stringify(gradient, null, 2);
}

export function toCode(gradient: Gradient, format: CodeFormat): string {
  switch (format) {
    case "css":
      return toCss(gradient);
    case "tailwind":
      return toTailwind(gradient);
    case "hex":
      return toHexList(gradient);
    case "json":
      return toJson(gradient);
  }
}
