import { Pressable, StyleSheet, Text, View } from "react-native";

import { GradientView } from "@/components/GradientView";
import { usePalette } from "@/hooks/use-palette";
import { useT, type StringKey } from "@/i18n";
import type { Preset } from "@/lib/types";

/** PRD F2 — one cell of the preset grid. */
export interface PresetCardProps {
  preset: Preset;
  onPress: (preset: Preset) => void;
}

export function PresetCard({ preset, onPress }: PresetCardProps) {
  const t = useT();
  const palette = usePalette();
  const category = t(`category.${preset.category}` as StringKey);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.surface },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${preset.name}, ${category}`}
      onPress={() => onPress(preset)}
    >
      <GradientView gradient={preset} style={styles.swatch} />
      <View style={styles.caption}>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
          {preset.name}
        </Text>
        <Text style={[styles.category, { color: palette.textDim }]}>
          {category}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, overflow: "hidden" },
  pressed: { opacity: 0.8 },
  swatch: { height: 120, width: "100%" },
  caption: { padding: 10, gap: 2 },
  name: { fontSize: 14, fontWeight: "600" },
  category: { fontSize: 12 },
});
