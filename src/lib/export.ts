import * as Sharing from "expo-sharing";
import { PixelRatio, type View } from "react-native";
import { captureRef } from "react-native-view-shot";

import type { ExportSize } from "./types";

/**
 * PRD F4 — PNG export at an exact pixel size, handed to the Android share
 * sheet via expo-sharing. No storage or media permission is ever requested,
 * which keeps the app out of Play's Photo and Video Permissions policy.
 */
export const EXPORT_SIZES: ExportSize[] = [
  { kind: "device" },
  { kind: "fixed", label: "1080 x 1920", width: 1080, height: 1920 },
  { kind: "fixed", label: "1440 x 3200", width: 1440, height: 3200 },
  { kind: "fixed", label: "2160 x 3840 (4K)", width: 2160, height: 3840 },
  { kind: "fixed", label: "2048 x 2048 (square)", width: 2048, height: 2048 },
];

export interface Pixels {
  width: number;
  height: number;
}

/** Resolves "This device" against the real screen, in physical pixels. */
export function resolveSize(
  size: ExportSize,
  screen: { width: number; height: number },
): Pixels {
  if (size.kind === "fixed") {
    return { width: size.width, height: size.height };
  }
  const scale = PixelRatio.get();
  return {
    width: Math.round(screen.width * scale),
    height: Math.round(screen.height * scale),
  };
}

/**
 * The capture target is laid out in dp, but the output is requested in pixels.
 * Rendering at `pixels / pixelRatio` dp means the natural rasterisation is
 * already the requested size, so view-shot's forced resize is a no-op rather
 * than an upscale — which is what would otherwise cost us quality at 4K.
 */
export function pixelsToDp(pixels: Pixels): Pixels {
  const scale = PixelRatio.get();
  return { width: pixels.width / scale, height: pixels.height / scale };
}

export function sizeLabel(size: ExportSize): string {
  return size.kind === "device" ? "device" : size.label;
}

export function fileNameFor(pixels: Pixels): string {
  return `gradiente-${pixels.width}x${pixels.height}`;
}

export class SharingUnavailableError extends Error {
  constructor() {
    super("Sharing is not available on this device");
    this.name = "SharingUnavailableError";
  }
}

/**
 * Captures the offscreen gradient and opens the Android share sheet.
 * The user picks the destination (Photos, Files, Gmail, anything) — the app
 * never writes to shared storage itself.
 */
export async function captureAndShare(
  target: View | null,
  pixels: Pixels,
): Promise<void> {
  if (!target) throw new Error("Export canvas is not mounted");

  if (!(await Sharing.isAvailableAsync())) {
    throw new SharingUnavailableError();
  }

  const uri = await captureRef(target, {
    format: "png",
    result: "tmpfile",
    width: pixels.width,
    height: pixels.height,
    fileName: fileNameFor(pixels),
  });

  // captureRef can return a bare path on Android; shareAsync wants a URI.
  const fileUri = uri.startsWith("file://") ? uri : `file://${uri}`;

  await Sharing.shareAsync(fileUri, {
    mimeType: "image/png",
    UTI: "public.png",
    dialogTitle: "Share gradient",
  });
}
