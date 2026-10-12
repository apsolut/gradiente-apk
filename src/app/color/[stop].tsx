import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
  Swatches,
} from "reanimated-color-picker";
import type { ColorFormatsObject } from "reanimated-color-picker";

import { TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import { isValidHex, normalizeHex } from "@/lib/palette";
import { useEditor } from "@/store/editor";

/**
 * PRD F1 — per-stop colour: HSV panel, hue slider, recent swatches, and a hex
 * field whose invalid input shows an inline error and never crashes.
 */
export default function ColorPickerModal() {
  const t = useT();
  const palette = usePalette();
  const { stop } = useLocalSearchParams<{ stop: string }>();
  const index = Number(stop);

  const colorStop = useEditor((s) => s.gradient.stops[index]);
  const otherColors = useEditor((s) =>
    s.gradient.stops.filter((_, i) => i !== index).map((item) => item.color),
  );
  const setStopColor = useEditor((s) => s.setStopColor);
  const beginDrag = useEditor((s) => s.beginDrag);
  const endDrag = useEditor((s) => s.endDrag);
  const dragStopPosition = useEditor((s) => s.dragStopPosition);

  const [draft, setDraft] = useState(colorStop?.color ?? "#000000");
  const [error, setError] = useState(false);

  if (!colorStop) {
    return (
      <View style={[styles.root, { backgroundColor: palette.bg }]}>
        <Text style={[styles.body, { color: palette.textDim }]}>
          {t("color.missingStop")}
        </Text>
      </View>
    );
  }

  /** Non-worklet callbacks must use the *JS variants of these props. */
  const onPick = ({ hex }: ColorFormatsObject) => {
    const normalized = normalizeHex(hex.slice(0, 7));
    setDraft(normalized);
    setError(false);
    setStopColor(index, normalized);
  };

  const onHexChange = (text: string) => {
    setDraft(text);
    if (isValidHex(text)) {
      setError(false);
      setStopColor(index, text);
    } else {
      setError(true);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ColorPicker
        style={styles.picker}
        value={colorStop.color}
        onCompleteJS={onPick}
      >
        <Preview hideInitialColor style={styles.previewRow} />
        <Panel1 style={styles.panel} />
        <HueSlider style={styles.hue} />
        <Swatches
          style={styles.swatches}
          colors={otherColors.length > 0 ? otherColors : undefined}
        />
      </ColorPicker>

      <View style={styles.field}>
        <Text style={[styles.label, { color: palette.textDim }]}>
          {t("color.hex")}
        </Text>
        <TextInput
          value={draft}
          onChangeText={onHexChange}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          placeholder="#4F8CFF"
          placeholderTextColor={palette.textDim}
          accessibilityLabel={t("color.hex")}
          style={[
            styles.input,
            {
              backgroundColor: palette.surface,
              color: palette.text,
              borderColor: error ? palette.danger : palette.border,
            },
          ]}
        />
        {error ? (
          <Text
            style={[styles.error, { color: palette.danger }]}
            accessibilityLiveRegion="polite"
          >
            {t("color.invalidHex")}
          </Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: palette.textDim }]}>
            {t("color.position")}
          </Text>
          <Text style={[styles.label, { color: palette.text }]}>
            {colorStop.position}%
          </Text>
        </View>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={colorStop.position}
          onSlidingStart={beginDrag}
          onValueChange={(value) => dragStopPosition(index, value)}
          // Only end the drag. The live updates already applied the value, so
          // also calling setStopPosition would push a second history entry and
          // make one drag take two undos.
          onSlidingComplete={endDrag}
          minimumTrackTintColor={palette.accent}
          maximumTrackTintColor={palette.border}
          thumbTintColor={palette.accent}
          accessibilityLabel={`${t("color.position")}, ${colorStop.position} percent`}
        />
      </View>

      <Pressable
        style={[styles.done, { backgroundColor: palette.accent }]}
        accessibilityRole="button"
        accessibilityLabel={t("common.done")}
        onPress={() => router.back()}
      >
        <Text style={styles.doneText}>{t("common.done")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 10 },
  picker: { gap: 12 },
  previewRow: { height: 44, borderRadius: 12 },
  panel: { height: 180, borderRadius: 12 },
  hue: { borderRadius: 12 },
  swatches: { marginTop: 4 },
  field: { gap: 4 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "monospace",
  },
  error: { fontSize: 13 },
  body: { fontSize: 14 },
  done: {
    minHeight: TOUCH_TARGET + 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginTop: 4,
  },
  doneText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
