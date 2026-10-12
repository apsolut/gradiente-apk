import { Tabs } from "expo-router";

import { Icon, type IconName } from "@/components/Icon";
import { usePalette } from "@/hooks/use-palette";
import { useT, type StringKey } from "@/i18n";

const TABS: { name: string; icon: IconName; titleKey: StringKey }[] = [
  { name: "index", icon: "create", titleKey: "tab.create" },
  { name: "presets", icon: "presets", titleKey: "tab.presets" },
  { name: "favorites", icon: "favorites", titleKey: "tab.favorites" },
  { name: "settings", icon: "settings", titleKey: "tab.settings" },
];

export default function TabsLayout() {
  const t = useT();
  const palette = usePalette();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textDim,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        sceneStyle: { backgroundColor: palette.bg },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey),
            tabBarIcon: ({ color, size }) => (
              <Icon name={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
