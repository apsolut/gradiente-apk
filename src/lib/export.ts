import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { PixelRatio, type View } from "react-native";
import { captureRef } from "react-native-view-shot";

import type { ExportSize } from "./types";

/**
 * PRD F4 — PNG export at an exact pixel size, either handed to the Android
 * share sheet via expo-sharing or written into a folder the user picks through
 * the Storage Access Framework. Neither route requests a storage or media
 * permission, which keeps the app out of Play's Photo and Video Permissions
 * policy.
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

/**
 * A shared file is a throwaway the receiving app renames anyway, but a saved
 * one sits in the user's folder next to the last ten, so it needs a name that
 * cannot collide — SAF would otherwise refuse the write.
 */
export function savedFileNameFor(pixels: Pixels, at: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp =
    `${at.getFullYear()}${pad(at.getMonth() + 1)}${pad(at.getDate())}` +
    `-${pad(at.getHours())}${pad(at.getMinutes())}${pad(at.getSeconds())}`;
  return `${fileNameFor(pixels)}-${stamp}`;
}

/**
 * A SAF tree URI carries a readable tail: `.../tree/primary%3APictures%2FArt`
 * decodes to `primary:Pictures/Art`. Take the last segment so the UI can name
 * the folder without a native call, and fall back to whatever the last
 * segment is for providers that hand out opaque ids.
 */
export function folderLabel(uri: string): string {
  const segments = decodeURIComponent(uri).split(/[:/]/).filter(Boolean);
  return segments[segments.length - 1] ?? uri;
}

export class SharingUnavailableError extends Error {
  constructor() {
    super("Sharing is not available on this device");
    this.name = "SharingUnavailableError";
  }
}

export class PickerCancelledError extends Error {
  constructor() {
    super("The folder picker was dismissed");
    this.name = "PickerCancelledError";
  }
}

export class FolderUnavailableError extends Error {
  constructor() {
    super("The chosen folder is no longer available");
    this.name = "FolderUnavailableError";
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

/** `pickDirectoryAsync` rejects with this code when the user backs out. */
const PICKER_CANCELLED = "ERR_PICKER_CANCELLED";

function isPickerCancelled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === PICKER_CANCELLED
  );
}

/**
 * Opens Android's own folder picker. Expo takes a *persistable* URI grant on
 * the result, so the returned URI keeps working after a restart — that is what
 * lets "save to device" exist without a single manifest permission.
 *
 * @returns the SAF tree URI, safe to persist.
 * @throws PickerCancelledError if the user dismissed the picker.
 */
export async function pickSaveFolder(): Promise<string> {
  try {
    const directory = await Directory.pickDirectoryAsync();
    return directory.uri;
  } catch (error) {
    if (isPickerCancelled(error)) throw new PickerCancelledError();
    throw error;
  }
}

/**
 * Captures the offscreen gradient and writes it into a previously picked
 * folder. view-shot names its temp file through `File.createTempFile`, which
 * splices a random number into whatever we ask for, so the capture is staged
 * under a clean name first: copying into a SAF directory takes the destination
 * name from the source file.
 *
 * @returns the file name as written.
 */
export async function captureAndSave(
  target: View | null,
  pixels: Pixels,
  folderUri: string,
): Promise<string> {
  if (!target) throw new Error("Export canvas is not mounted");

  const directory = new Directory(folderUri);
  // The grant can vanish under us — revoked in Settings, SD card pulled,
  // folder deleted. That is "pick again", not a failed export.
  if (!directory.exists) throw new FolderUnavailableError();

  const captured = await captureRef(target, {
    format: "png",
    result: "tmpfile",
    width: pixels.width,
    height: pixels.height,
  });

  const name = `${savedFileNameFor(pixels)}.png`;
  const staged = new File(Paths.cache, name);
  if (staged.exists) staged.delete();

  const source = new File(
    captured.startsWith("file://") ? captured : `file://${captured}`,
  );
  await source.move(staged);

  try {
    await staged.copy(directory);
  } finally {
    if (staged.exists) staged.delete();
  }

  return name;
}
