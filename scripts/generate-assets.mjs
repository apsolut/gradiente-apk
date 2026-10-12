#!/usr/bin/env node
/**
 * Generates Gradiente's launcher icon, adaptive icon layers, splash mark,
 * Play Console icon and feature graphic.
 *
 * Everything is drawn from maths and encoded with Node's own zlib, so there is
 * no image dependency and the output is byte-for-byte reproducible. Re-run
 * with `npm run assets` after changing BRAND below.
 *
 * The mark: a rounded square carrying a three-stop diagonal gradient, cut by
 * the gradient axis line with a stop handle at each end — the app's own
 * subject matter as its logo.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const BRAND = {
  stops: [
    { at: 0.0, color: [0x6a, 0x4d, 0xff] },
    { at: 0.55, color: [0xff, 0x4d, 0x9d] },
    { at: 1.0, color: [0xff, 0xb4, 0x5c] },
  ],
  /** Matches app.json splash + adaptiveIcon backgroundColor. */
  background: [0x1b, 0x1b, 0x2f],
};

// ---------------------------------------------------------------- PNG encoder

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

/**
 * @param {string} file
 * @param {number} width
 * @param {number} height
 * @param {(x: number, y: number) => [number, number, number, number]} shade
 * @param {{ alpha?: boolean }} [options]
 */
function writePng(file, width, height, shade, options = {}) {
  const alpha = options.alpha ?? true;
  const channels = alpha ? 4 : 3;
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = shade(x, y);
      const p = rowStart + 1 + x * channels;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
      if (alpha) raw[p + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = alpha ? 6 : 2; // colour type: RGBA / RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  const target = resolve(ROOT, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, png);
  return png.length;
}

// -------------------------------------------------------------------- drawing

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function gradientAt(t) {
  const stops = BRAND.stops;
  const x = clamp01(t);
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (x >= a.at && x <= b.at) {
      const local = (x - a.at) / (b.at - a.at);
      return [
        Math.round(a.color[0] + (b.color[0] - a.color[0]) * local),
        Math.round(a.color[1] + (b.color[1] - a.color[1]) * local),
        Math.round(a.color[2] + (b.color[2] - a.color[2]) * local),
      ];
    }
  }
  return stops[stops.length - 1].color;
}

/** Signed distance to a rounded rectangle; negative inside. */
function roundedRectDistance(px, py, cx, cy, halfW, halfH, radius) {
  const qx = Math.abs(px - cx) - (halfW - radius);
  const qy = Math.abs(py - cy) - (halfH - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - radius;
}

/** Signed distance to a line segment. */
function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy || 1;
  const tRaw = ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  const t = clamp01(tRaw);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

/** Anti-aliased coverage from a signed distance, in pixels. */
const coverage = (distance) => clamp01(0.5 - distance);

/**
 * The mark, drawn into a square of `size` at `scale` of that square.
 * Returns RGBA. `cut` controls whether the axis line is a light overlay
 * (normal) or punched out of the alpha (monochrome).
 */
function markShader(size, { scale = 1, radiusRatio = 0.22, monochrome = false }) {
  const side = size * scale;
  const half = side / 2;
  const center = size / 2;
  const radius = side * radiusRatio;

  // Gradient axis: bottom-left to top-right inside the mark.
  const inset = side * 0.26;
  const ax = center - half + inset;
  const ay = center + half - inset;
  const bx = center + half - inset;
  const by = center - half + inset;

  const lineHalf = Math.max(1, side * 0.022);
  const handle = Math.max(2, side * 0.075);
  const handleRing = handle * 0.62;

  // Stop the axis at the ring edges, so the line never crosses a handle's hole.
  const axisLength = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / axisLength;
  const uy = (by - ay) / axisLength;
  const lineAx = ax + ux * handle;
  const lineAy = ay + uy * handle;
  const lineBx = bx - ux * handle;
  const lineBy = by - uy * handle;

  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;

    const shapeAlpha = coverage(
      roundedRectDistance(px, py, center, center, half, half, radius),
    );
    if (shapeAlpha <= 0) return [0, 0, 0, 0];

    // Diagonal position across the mark, 0 at bottom-left to 1 at top-right.
    const t = clamp01(
      (px - (center - half) + (center + half - py)) / (side * 2),
    );
    const base = gradientAt(t);

    const lineDistance = segmentDistance(
      px,
      py,
      lineAx,
      lineAy,
      lineBx,
      lineBy,
    );
    const onLine = coverage(lineDistance - lineHalf);

    const handleA = coverage(Math.hypot(px - ax, py - ay) - handle);
    const handleB = coverage(Math.hypot(px - bx, py - by) - handle);
    const holeA = coverage(Math.hypot(px - ax, py - ay) - handleRing);
    const holeB = coverage(Math.hypot(px - bx, py - by) - handleRing);

    // Handles are rings: filled disc minus a smaller disc.
    const ringA = clamp01(handleA - holeA);
    const ringB = clamp01(handleB - holeB);
    const motif = clamp01(Math.max(onLine, ringA, ringB));

    if (monochrome) {
      // Alpha-only silhouette: the motif is cut out so it reads when tinted.
      return [0xff, 0xff, 0xff, Math.round(shapeAlpha * (1 - motif) * 255)];
    }

    const white = 0xff;
    const mix = motif * 0.92;
    return [
      Math.round(base[0] + (white - base[0]) * mix),
      Math.round(base[1] + (white - base[1]) * mix),
      Math.round(base[2] + (white - base[2]) * mix),
      Math.round(shapeAlpha * 255),
    ];
  };
}

/** Flattens an RGBA shader onto an opaque background. */
function overBackground(shader, background) {
  return (x, y) => {
    const [r, g, b, a] = shader(x, y);
    const alpha = a / 255;
    return [
      Math.round(background[0] * (1 - alpha) + r * alpha),
      Math.round(background[1] * (1 - alpha) + g * alpha),
      Math.round(background[2] * (1 - alpha) + b * alpha),
      255,
    ];
  };
}

// --------------------------------------------------------------------- output

const outputs = [];

function emit(label, file, width, height, shader, options) {
  const bytes = writePng(file, width, height, shader, options);
  outputs.push({ label, file, size: `${width}x${height}`, bytes });
}

// Launcher / store icon: full-bleed, no transparency, mark edge to edge.
emit(
  "launcher icon",
  "assets/images/icon.png",
  1024,
  1024,
  overBackground(markShader(1024, { scale: 1, radiusRatio: 0.2 }), BRAND.background),
  { alpha: false },
);

// Play Console listing icon: 512x512, 32-bit with alpha, must match the launcher.
emit(
  "Play listing icon",
  "store/icon-512.png",
  512,
  512,
  overBackground(markShader(512, { scale: 1, radiusRatio: 0.2 }), BRAND.background),
);

/**
 * Adaptive icon foreground: Android crops to a mask and only the centre ~66%
 * is guaranteed visible, so the mark is scaled into that safe zone.
 */
emit(
  "adaptive foreground",
  "assets/images/android-icon-foreground.png",
  1024,
  1024,
  markShader(1024, { scale: 0.6, radiusRatio: 0.24 }),
);

// Monochrome layer for themed icons: alpha silhouette, white pixels.
emit(
  "adaptive monochrome",
  "assets/images/android-icon-monochrome.png",
  1024,
  1024,
  markShader(1024, { scale: 0.6, radiusRatio: 0.24, monochrome: true }),
);

// Splash mark, shown on the app.json splash backgroundColor.
emit(
  "splash mark",
  "assets/images/splash-icon.png",
  512,
  512,
  markShader(512, { scale: 0.74, radiusRatio: 0.24 }),
);

// Web favicon (the project keeps the web target enabled for quick previews).
emit(
  "favicon",
  "assets/images/favicon.png",
  48,
  48,
  overBackground(markShader(48, { scale: 1, radiusRatio: 0.2 }), BRAND.background),
);

/**
 * Feature graphic: 1024x500, 24-bit PNG with no alpha (Play rejects alpha here).
 * Brand gradient wash with the mark on the left third.
 */
const featureMark = markShader(500, { scale: 0.52, radiusRatio: 0.24 });
emit(
  "feature graphic",
  "store/feature-graphic.png",
  1024,
  500,
  (x, y) => {
    const t = clamp01((x / 1024) * 0.75 + (y / 500) * 0.25);
    const wash = gradientAt(t);
    // Darken towards the brand background so the mark stays legible.
    const bg = [
      Math.round(wash[0] * 0.42 + BRAND.background[0] * 0.58),
      Math.round(wash[1] * 0.42 + BRAND.background[1] * 0.58),
      Math.round(wash[2] * 0.42 + BRAND.background[2] * 0.58),
    ];
    const markX = x - 142;
    if (markX < 0 || markX >= 500) return [...bg, 255];
    const [r, g, b, a] = featureMark(markX, y);
    const alpha = a / 255;
    return [
      Math.round(bg[0] * (1 - alpha) + r * alpha),
      Math.round(bg[1] * (1 - alpha) + g * alpha),
      Math.round(bg[2] * (1 - alpha) + b * alpha),
      255,
    ];
  },
  { alpha: false },
);

const pad = (s, n) => String(s).padEnd(n);
console.log("Generated:");
for (const out of outputs) {
  console.log(
    `  ${pad(out.label, 22)} ${pad(out.size, 10)} ${pad(out.file, 46)} ${(out.bytes / 1024).toFixed(1)} KB`,
  );
}
