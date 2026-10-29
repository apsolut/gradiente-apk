import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExportCanvas } from "@/components/ExportCanvas";
import { GradientView } from "@/components/GradientView";
import { TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import {
  captureAndSave,
  captureAndShare,
  EXPORT_SIZES,
  folderLabel,
  FolderUnavailableError,
  PickerCancelledError,
  pickSaveFolder,
  resolveSize,
  SharingUnavailableError,
  sizeLabel,
} from "@/lib/export";
import { useEditor } from "@/store/editor";
import { useSettings } from "@/store/settings";
import { useUi } from "@/store/ui";

/**
 * PRD F4 — export sheet. The PNG leaves either through the Android share sheet
 * or into a folder the user picks via the Storage Access Framework, so
 * Gradiente never requests storage or media permissions and stays outside
 * Play's Photo and Video Permissions policy entirely.
 */
export default function ExportModal() {
  const t = useT();
  const palette = usePalette();
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gradient = useEditor((s) => s.gradient);
  const showToast = useUi((s) => s.showToast);
  const saveFolderUri = useSettings((s) => s.saveFolderUri);
  const setSaveFolderUri = useSettings((s) => s.setSaveFolderUri);

  const canvasRef = useRef<View>(null);
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState<"share" | "save" | null>(null);

  const pixels = resolveSize(EXPORT_SIZES[selected], screen);

  const onShare = async () => {
    if (busy) return;
    setBusy("share");
    try {
      await captureAndShare(canvasRef.current, pixels);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      showToast(
        error instanceof SharingUnavailableError
          ? t("export.sharingUnavailable")
          : t("export.failed"),
      );
    } finally {
      setBusy(null);
    }
  };

  /**
   * First tap picks a folder and saves in one go; later taps reuse the folder.
   * A dismissed picker is a decision, not an error, so it stays silent.
   */
  const onSave = async () => {
    if (busy) return;
    setBusy("save");
    try {
      const folderUri = saveFolderUri ?? (await pickSaveFolder());
      if (folderUri !== saveFolderUri) setSaveFolderUri(folderUri);

      await captureAndSave(canvasRef.current, pixels, folderUri);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(t("export.saved"));
    } catch (error) {
      if (error instanceof PickerCancelledError) return;
      if (error instanceof FolderUnavailableError) {
        setSaveFolderUri(null);
        showToast(t("export.folderUnavailable"));
        return;
      }
      showToast(t("export.saveFailed"));
    } finally {
      setBusy(null);
    }
  };

  const onChangeFolder = async () => {
    if (busy) return;
    try {
      setSaveFolderUri(await pickSaveFolder());
    } catch (error) {
      if (!(error instanceof PickerCancelledError)) {
        showToast(t("export.saveFailed"));
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      {/* The ScrollView needs its own bounded height. With only a
          contentContainerStyle it sizes to its content inside the flex parent,
          overflows the screen and never scrolls, which puts Share out of reach
          on shorter devices and at large font scales. */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <GradientView gradient={gradient} style={styles.preview} />

        <Text style={[styles.section, { color: palette.textDim }]}>
          {t("export.size")}
        </Text>

        {EXPORT_SIZES.map((size, index) => {
          const active = index === selected;
          const resolved = resolveSize(size, screen);
          return (
            <Pressable
              key={sizeLabel(size)}
              style={[
                styles.row,
                {
                  backgroundColor: active ? palette.accent : palette.surface,
                  borderColor: palette.border,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                size.kind === "device"
                  ? `${t("export.device")}, ${resolved.width} by ${resolved.height} pixels`
                  : `${resolved.width} by ${resolved.height} pixels`
              }
              onPress={() => setSelected(index)}
            >
              <Text
                style={[
                  styles.rowText,
                  { color: active ? "#FFFFFF" : palette.text },
                ]}
              >
                {size.kind === "device" ? t("export.device") : size.label}
              </Text>
              <Text
                style={[
                  styles.rowValue,
                  { color: active ? "#FFFFFF" : palette.textDim },
                ]}
              >
                {resolved.width} x {resolved.height}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            styles.action,
            { backgroundColor: palette.accent },
            busy !== null && styles.actionBusy,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("export.share")}
          accessibilityState={{ disabled: busy !== null, busy: busy === "share" }}
          disabled={busy !== null}
          onPress={() => void onShare()}
        >
          {busy === "share" ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.actionText}>{t("export.share")}</Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.action,
            styles.actionSecondary,
            { borderColor: palette.accent },
            busy !== null && styles.actionBusy,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("export.save")}
          accessibilityState={{ disabled: busy !== null, busy: busy === "save" }}
          disabled={busy !== null}
          onPress={() => void onSave()}
        >
          {busy === "save" ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <Text style={[styles.actionText, { color: palette.accent }]}>
              {t("export.save")}
            </Text>
          )}
        </Pressable>

        {saveFolderUri !== null && (
          <View style={styles.folderRow}>
            <Text
              style={[styles.folder, { color: palette.textDim }]}
              numberOfLines={1}
            >
              {t("export.folder")}: {folderLabel(saveFolderUri)}
            </Text>
            <Pressable
              style={styles.folderButton}
              accessibilityRole="button"
              accessibilityLabel={t("export.changeFolder")}
              disabled={busy !== null}
              onPress={() => void onChangeFolder()}
            >
              <Text style={[styles.folderChange, { color: palette.accent }]}>
                {t("export.changeFolder")}
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.note, { color: palette.textDim }]}>
          {t("export.note")}
        </Text>
      </ScrollView>

      <ExportCanvas ref={canvasRef} gradient={gradient} pixels={pixels} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { padding: 16, gap: 8 },
  preview: { height: 150, borderRadius: 16, overflow: "hidden" },
  section: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 12,
  },
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  rowText: { fontSize: 16 },
  rowValue: { fontSize: 13, fontVariant: ["tabular-nums"] },
  action: {
    minHeight: TOUCH_TARGET + 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginTop: 14,
  },
  actionSecondary: { backgroundColor: "transparent", borderWidth: 1.5, marginTop: 0 },
  actionBusy: { opacity: 0.8 },
  actionText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  folder: { flexShrink: 1, fontSize: 13 },
  folderButton: {
    minHeight: TOUCH_TARGET,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  folderChange: { fontSize: 13, fontWeight: "600" },
  note: { fontSize: 13, marginTop: 12 },
});
