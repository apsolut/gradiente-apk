import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";
import { useT, type StringKey } from "@/i18n";
import { toCode } from "@/lib/codegen";
import type { CodeFormat } from "@/lib/types";
import { useEditor } from "@/store/editor";
import { useUi } from "@/store/ui";

const FORMATS: { format: CodeFormat; labelKey: StringKey }[] = [
  { format: "css", labelKey: "code.css" },
  { format: "tailwind", labelKey: "code.tailwind" },
  { format: "hex", labelKey: "code.hex" },
  { format: "json", labelKey: "code.json" },
];

/** PRD F5 — one tap copies to the clipboard, with a toast and haptics. */
export default function CodeModal() {
  const t = useT();
  const palette = usePalette();
  const gradient = useEditor((s) => s.gradient);
  const showToast = useUi((s) => s.showToast);
  const [active, setActive] = useState<CodeFormat>("css");

  const code = toCode(gradient, active);

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(t("code.copied"));
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <View style={styles.tabs}>
        {FORMATS.map(({ format, labelKey }) => {
          const selected = format === active;
          return (
            <Pressable
              key={format}
              style={[
                styles.tab,
                {
                  backgroundColor: selected
                    ? palette.accent
                    : palette.surfaceAlt,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={t(labelKey)}
              onPress={() => setActive(format)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selected ? "#FFFFFF" : palette.text },
                ]}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={[
          styles.codeBox,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
        contentContainerStyle={styles.codeInner}
      >
        <Text style={[styles.code, { color: palette.text }]} selectable>
          {code}
        </Text>
      </ScrollView>

      <Pressable
        style={[styles.copy, { backgroundColor: palette.accent }]}
        accessibilityRole="button"
        accessibilityLabel={t("code.copy")}
        onPress={() => void copy()}
      >
        <Text style={styles.copyText}>{t("code.copy")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  tabs: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tab: {
    minHeight: TOUCH_TARGET - 8,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  codeBox: { flex: 1, borderWidth: 1, borderRadius: 12 },
  codeInner: { padding: 14 },
  code: { fontFamily: "monospace", fontSize: 13, lineHeight: 20 },
  copy: {
    minHeight: TOUCH_TARGET + 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  copyText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
