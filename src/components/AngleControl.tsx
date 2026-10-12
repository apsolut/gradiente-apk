import Slider from "@react-native-community/slider";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ON_SCRIM, TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import { useEditor } from "@/store/editor";

/** PRD F1 — 0 to 359 degrees, slider plus 45 degree snap buttons. */
const SNAPS = [0, 45, 90, 135, 180, 225, 270, 315];

export function AngleControl() {
  const t = useT();
  const palette = usePalette();
  const angle = useEditor((s) => s.gradient.angle);
  const setAngle = useEditor((s) => s.setAngle);
  const beginDrag = useEditor((s) => s.beginDrag);
  const endDrag = useEditor((s) => s.endDrag);
  const dragAngle = useEditor((s) => s.dragAngle);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.label}>{t("create.angle")}</Text>
        <Text style={styles.value}>{angle}&#176;</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={359}
        step={1}
        value={angle}
        onSlidingStart={beginDrag}
        onValueChange={dragAngle}
        onSlidingComplete={endDrag}
        minimumTrackTintColor={palette.accent}
        maximumTrackTintColor="rgba(255,255,255,0.35)"
        thumbTintColor={ON_SCRIM}
        accessibilityLabel={`${t("create.angle")}, ${angle} degrees`}
      />

      <View style={styles.snaps}>
        {SNAPS.map((snap) => {
          const active = angle === snap;
          return (
            <Pressable
              key={snap}
              style={[
                styles.snap,
                active && {
                  backgroundColor: palette.accent,
                  borderColor: palette.accent,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${t("create.angle")} ${snap} degrees`}
              onPress={() => setAngle(snap)}
            >
              <Text style={styles.snapText}>{snap}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 2 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: ON_SCRIM, fontSize: 13, fontWeight: "600" },
  value: { color: ON_SCRIM, fontSize: 13, fontVariant: ["tabular-nums"] },
  slider: { width: "100%", height: 36 },
  snaps: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  // Hairline edges rather than filled chips, matching ControlButton's ghost
  // weight so the whole panel reads as one system.
  snap: {
    minWidth: 42,
    minHeight: TOUCH_TARGET - 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  snapText: {
    color: ON_SCRIM,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
});
