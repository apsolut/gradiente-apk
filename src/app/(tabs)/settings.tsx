import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as StoreReview from "expo-store-review";
import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TOUCH_TARGET } from "@/constants/theme";
import { PRIVACY_URL, SUPPORT_EMAIL } from "@/constants/links";
import { usePalette } from "@/hooks/use-palette";
import { useT, type StringKey } from "@/i18n";
import {
  useSettings,
  type Language,
  type ThemeChoice,
} from "@/store/settings";
import { useUi } from "@/store/ui";

const THEMES: { value: ThemeChoice; labelKey: StringKey }[] = [
  { value: "system", labelKey: "settings.theme.system" },
  { value: "light", labelKey: "settings.theme.light" },
  { value: "dark", labelKey: "settings.theme.dark" },
];

const LANGUAGES: { value: Language; labelKey: StringKey }[] = [
  { value: "en", labelKey: "settings.language.en" },
  { value: "de", labelKey: "settings.language.de" },
];

/** PRD F6 — theme, language, privacy, licenses, feedback, rate, version. */
export default function SettingsScreen() {
  const t = useT();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const showToast = useUi((s) => s.showToast);

  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const build = Constants.nativeBuildVersion ?? "-";

  const openPrivacy = async () => {
    try {
      await WebBrowser.openBrowserAsync(PRIVACY_URL);
    } catch {
      showToast(t("settings.openFailed"));
    }
  };

  const sendFeedback = async () => {
    const subject = encodeURIComponent(t("settings.feedbackSubject"));
    const body = encodeURIComponent(
      `\n\n---\nGradiente ${version} (build ${build})`,
    );
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      // No mail app installed, or the intent was refused.
      showToast(t("settings.openFailed"));
    }
  };

  const rate = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
      } else {
        showToast(t("settings.openFailed"));
      }
    } catch {
      showToast(t("settings.openFailed"));
    }
  };

  const segmented = <T extends string>(
    options: { value: T; labelKey: StringKey }[],
    current: T,
    onChange: (value: T) => void,
  ) => (
    <View style={[styles.segmented, { backgroundColor: palette.surfaceAlt }]}>
      {options.map((option) => {
        const selected = option.value === current;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.segment,
              selected && { backgroundColor: palette.accent },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(option.labelKey)}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.segmentText,
                { color: selected ? "#FFFFFF" : palette.text },
              ]}
            >
              {t(option.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const row = (labelKey: StringKey, onPress: () => void) => (
    <Pressable
      style={[styles.row, { backgroundColor: palette.surface }]}
      accessibilityRole="button"
      accessibilityLabel={t(labelKey)}
      onPress={onPress}
    >
      <Text style={[styles.rowText, { color: palette.text }]}>
        {t(labelKey)}
      </Text>
      <Text style={[styles.chevron, { color: palette.textDim }]}>›</Text>
    </Pressable>
  );

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={[
        styles.root,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={[styles.section, { color: palette.textDim }]}>
        {t("settings.appearance")}
      </Text>
      <Text style={[styles.subLabel, { color: palette.text }]}>
        {t("settings.theme")}
      </Text>
      {segmented(THEMES, theme, setTheme)}
      <Text style={[styles.subLabel, { color: palette.text }]}>
        {t("settings.language")}
      </Text>
      {segmented(LANGUAGES, language, setLanguage)}

      <Text style={[styles.section, { color: palette.textDim }]}>
        {t("settings.about")}
      </Text>
      {row("settings.privacy", () => void openPrivacy())}
      {row("settings.licenses", () => router.push("/licenses"))}
      {row("settings.feedback", () => void sendFeedback())}
      {row("settings.rate", () => void rate())}

      <View style={[styles.row, { backgroundColor: palette.surface }]}>
        <Text style={[styles.rowText, { color: palette.text }]}>
          {t("settings.version")}
        </Text>
        <Text style={[styles.rowValue, { color: palette.textDim }]}>
          {version} ({t("settings.build")} {build})
        </Text>
      </View>

      <Text style={[styles.note, { color: palette.textDim }]}>
        {t("settings.note")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 16, gap: 8 },
  section: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 2,
  },
  subLabel: { fontSize: 15, fontWeight: "600", marginTop: 6 },
  segmented: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segment: {
    flex: 1,
    minHeight: TOUCH_TARGET - 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  segmentText: { fontSize: 14, fontWeight: "600" },
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  rowText: { fontSize: 16 },
  rowValue: { fontSize: 14 },
  chevron: { fontSize: 22 },
  note: { fontSize: 13, marginTop: 20 },
});
