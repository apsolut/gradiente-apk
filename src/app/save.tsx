import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { GradientView } from "@/components/GradientView";
import { TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import { useEditor } from "@/store/editor";
import { useFavorites } from "@/store/favorites";
import { useUi } from "@/store/ui";

/** PRD F3 — save the current gradient with an optional name. */
export default function SaveModal() {
  const t = useT();
  const palette = usePalette();
  const gradient = useEditor((s) => s.gradient);
  const save = useFavorites((s) => s.save);
  const showToast = useUi((s) => s.showToast);
  const [name, setName] = useState("");

  const onSave = () => {
    const ok = save(gradient, name);
    showToast(ok ? t("favorites.saved") : t("favorites.full"));
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <GradientView gradient={gradient} style={styles.preview} />

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t("save.placeholder")}
        placeholderTextColor={palette.textDim}
        maxLength={60}
        returnKeyType="done"
        onSubmitEditing={onSave}
        accessibilityLabel={t("save.placeholder")}
        style={[
          styles.input,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            color: palette.text,
          },
        ]}
      />

      <Text style={[styles.hint, { color: palette.textDim }]}>
        {t("save.hint")}
      </Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.button, { backgroundColor: palette.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: palette.text }]}>
            {t("common.cancel")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: palette.accent }]}
          accessibilityRole="button"
          accessibilityLabel={t("common.save")}
          onPress={onSave}
        >
          <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
            {t("common.save")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  preview: { height: 140, borderRadius: 16, overflow: "hidden" },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  hint: { fontSize: 13 },
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  button: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
