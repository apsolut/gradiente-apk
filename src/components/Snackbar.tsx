import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ON_SCRIM, SCRIM, TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";
import { useUi } from "@/store/ui";

/**
 * One toast host, mounted once in the root layout. Used for "Copied",
 * "Saved to favorites" and the delete-with-undo flow (PRD F3, F5).
 */
export function Snackbar() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const toast = useUi((s) => s.toast);
  const hideToast = useUi((s) => s.hideToast);

  if (!toast) return null;

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom + 72 }]}
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.bar}>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.action ? (
          <Pressable
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
            onPress={() => {
              toast.action?.run();
              hideToast();
            }}
          >
            <Text style={[styles.actionText, { color: palette.accent }]}>
              {toast.action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 520,
    width: "100%",
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: SCRIM,
  },
  message: { flex: 1, color: ON_SCRIM, fontSize: 14 },
  action: {
    minHeight: TOUCH_TARGET - 8,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionText: { fontSize: 14, fontWeight: "700" },
});
