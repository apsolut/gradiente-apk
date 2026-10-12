import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PresetCard } from "@/components/PresetCard";
import { TOUCH_TARGET } from "@/constants/theme";
import presetData from "@/data/presets.json";
import { useIsWide, usePalette } from "@/hooks/use-palette";
import { useT, type StringKey } from "@/i18n";
import type { Preset, PresetCategory } from "@/lib/types";
import { useEditor } from "@/store/editor";

const presets = presetData as Preset[];

const CATEGORIES: PresetCategory[] = [
  "Sunset",
  "Ocean",
  "Pastel",
  "Neon",
  "Dark",
  "Mono",
  "Nature",
];

/** PRD F2 — 63 curated presets bundled as JSON, so the library works offline. */
export default function PresetsScreen() {
  const t = useT();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  const load = useEditor((s) => s.load);
  const [category, setCategory] = useState<PresetCategory | null>(null);

  const visible = useMemo(
    () =>
      category ? presets.filter((preset) => preset.category === category) : presets,
    [category],
  );

  const open = (preset: Preset) => {
    const { type, angle, stops } = preset;
    load({ type, angle, stops });
    router.navigate("/");
  };

  const chip = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? palette.accent : palette.surfaceAlt,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? "#FFFFFF" : palette.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chips, { paddingTop: insets.top + 12 }]}
      >
        {chip(t("presets.all"), category === null, () => setCategory(null))}
        {CATEGORIES.map((name) =>
          chip(t(`category.${name}` as StringKey), category === name, () =>
            setCategory(name),
          ),
        )}
      </ScrollView>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        numColumns={isWide ? 3 : 2}
        key={isWide ? "wide" : "narrow"}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 16 },
        ]}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <Text style={[styles.header, { color: palette.textDim }]}>
            {t("presets.header")}
          </Text>
        }
        renderItem={({ item }) => <PresetCard preset={item} onPress={open} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chips: { gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip: {
    minHeight: TOUCH_TARGET - 10,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipText: { fontSize: 14, fontWeight: "600" },
  list: { paddingHorizontal: 16, gap: 12 },
  row: { gap: 12 },
  header: { fontSize: 13, marginBottom: 12 },
});
