import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Snackbar } from "@/components/Snackbar";
import { usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";

export default function RootLayout() {
  const t = useT();
  const palette = usePalette();

  return (
    // Explicit gesture root: the colour picker depends on it, and relying on the
    // Stack's internal wrapper would make that an implicit dependency.
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={palette.mode === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.bg },
            headerTintColor: palette.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: palette.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="save"
            options={{ presentation: "modal", title: t("save.title") }}
          />
          <Stack.Screen
            name="export"
            options={{ presentation: "modal", title: t("export.title") }}
          />
          <Stack.Screen
            name="code"
            options={{ presentation: "modal", title: t("code.title") }}
          />
          <Stack.Screen
            name="color/[stop]"
            options={{ presentation: "modal", title: t("color.title") }}
          />
          <Stack.Screen
            name="licenses"
            options={{ title: t("settings.licenses") }}
          />
        </Stack>
        <Snackbar />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
