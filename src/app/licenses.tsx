import { ScrollView, StyleSheet, Text, View } from "react-native";

import { usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";

/**
 * PRD F6 / section 7.5 — open-source licenses screen.
 * Keep this in step with `package.json` dependencies at every release.
 */
const LIBRARIES: { name: string; license: string }[] = [
  { name: "expo and the Expo SDK modules", license: "MIT" },
  { name: "expo-router", license: "MIT" },
  { name: "react, react-dom", license: "MIT" },
  { name: "react-native", license: "MIT" },
  { name: "react-native-svg", license: "MIT" },
  { name: "react-native-view-shot", license: "MIT" },
  { name: "react-native-reanimated", license: "MIT" },
  { name: "react-native-gesture-handler", license: "MIT" },
  { name: "react-native-worklets", license: "MIT" },
  { name: "react-native-safe-area-context", license: "MIT" },
  { name: "react-native-screens", license: "MIT" },
  { name: "@react-native-async-storage/async-storage", license: "MIT" },
  { name: "@react-native-community/slider", license: "MIT" },
  { name: "reanimated-color-picker", license: "MIT" },
  { name: "zustand", license: "MIT" },
];

export default function LicensesScreen() {
  const t = useT();
  const palette = usePalette();

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={styles.root}
    >
      <Text style={[styles.intro, { color: palette.textDim }]}>
        {t("licenses.intro")}
      </Text>

      {LIBRARIES.map((library) => (
        <View
          key={library.name}
          style={[styles.row, { backgroundColor: palette.surface }]}
        >
          <Text style={[styles.name, { color: palette.text }]}>
            {library.name}
          </Text>
          <Text style={[styles.license, { color: palette.textDim }]}>
            {library.license}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  name: { flex: 1, fontSize: 14 },
  license: { fontSize: 13, fontWeight: "600" },
});
