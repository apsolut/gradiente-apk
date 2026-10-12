import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientView } from "@/components/GradientView";
import { TOUCH_TARGET } from "@/constants/theme";
import { useIsWide, usePalette } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import type { Favorite } from "@/lib/types";
import { useEditor } from "@/store/editor";
import { useFavorites } from "@/store/favorites";
import { useUi } from "@/store/ui";

/**
 * PRD F3 — favorites grid with a long-press menu (rename, duplicate, delete)
 * and an undo snackbar after delete. Stored locally only.
 */
export default function FavoritesScreen() {
  const t = useT();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();

  const items = useFavorites((s) => s.items);
  const rename = useFavorites((s) => s.rename);
  const duplicate = useFavorites((s) => s.duplicate);
  const remove = useFavorites((s) => s.remove);
  const restore = useFavorites((s) => s.restore);
  const load = useEditor((s) => s.load);
  const showToast = useUi((s) => s.showToast);

  const [menuFor, setMenuFor] = useState<Favorite | null>(null);
  const [renaming, setRenaming] = useState<Favorite | null>(null);
  const [draftName, setDraftName] = useState("");

  const open = (favorite: Favorite) => {
    load({
      type: favorite.type,
      angle: favorite.angle,
      stops: favorite.stops,
    });
    router.navigate("/");
  };

  const onDelete = (favorite: Favorite) => {
    const index = items.findIndex((item) => item.id === favorite.id);
    remove(favorite.id);
    setMenuFor(null);
    showToast(t("favorites.deleted"), {
      label: t("common.undo"),
      run: () => restore(favorite, index),
    });
  };

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: palette.bg }]}>
        <Text style={[styles.emptyTitle, { color: palette.text }]}>
          {t("favorites.emptyTitle")}
        </Text>
        <Text style={[styles.emptyBody, { color: palette.textDim }]}>
          {t("favorites.emptyBody")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={isWide ? 3 : 2}
        key={isWide ? "wide" : "narrow"}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: palette.surface },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item.name ?? t("favorites.untitled")}. ${t("favorites.openInEditor")}`}
            accessibilityHint={t("favorites.actions")}
            onPress={() => open(item)}
            onLongPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setMenuFor(item);
            }}
          >
            <GradientView gradient={item} style={styles.swatch} />
            <Text
              style={[styles.name, { color: palette.text }]}
              numberOfLines={1}
            >
              {item.name ?? t("favorites.untitled")}
            </Text>
          </Pressable>
        )}
      />

      {menuFor ? (
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          onPress={() => setMenuFor(null)}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: palette.surface,
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: palette.textDim }]}>
              {menuFor.name ?? t("favorites.untitled")}
            </Text>

            <Pressable
              style={styles.sheetRow}
              accessibilityRole="button"
              accessibilityLabel={t("common.rename")}
              onPress={() => {
                setDraftName(menuFor.name ?? "");
                setRenaming(menuFor);
                setMenuFor(null);
              }}
            >
              <Text style={[styles.sheetText, { color: palette.text }]}>
                {t("common.rename")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.sheetRow}
              accessibilityRole="button"
              accessibilityLabel={t("common.duplicate")}
              onPress={() => {
                duplicate(menuFor.id);
                setMenuFor(null);
                showToast(t("favorites.duplicated"));
              }}
            >
              <Text style={[styles.sheetText, { color: palette.text }]}>
                {t("common.duplicate")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.sheetRow}
              accessibilityRole="button"
              accessibilityLabel={t("common.delete")}
              onPress={() => onDelete(menuFor)}
            >
              <Text style={[styles.sheetText, { color: palette.danger }]}>
                {t("common.delete")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      ) : null}

      {renaming ? (
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
          onPress={() => setRenaming(null)}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: palette.surface,
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
              maxLength={60}
              placeholder={t("save.placeholder")}
              placeholderTextColor={palette.textDim}
              accessibilityLabel={t("common.rename")}
              style={[
                styles.input,
                {
                  backgroundColor: palette.surfaceAlt,
                  borderColor: palette.border,
                  color: palette.text,
                },
              ]}
            />
            <Pressable
              style={[styles.confirm, { backgroundColor: palette.accent }]}
              accessibilityRole="button"
              accessibilityLabel={t("common.save")}
              onPress={() => {
                rename(renaming.id, draftName);
                setRenaming(null);
                showToast(t("favorites.renamed"));
              }}
            >
              <Text style={styles.confirmText}>{t("common.save")}</Text>
            </Pressable>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 16, gap: 12 },
  row: { gap: 12 },
  card: { flex: 1, borderRadius: 16, overflow: "hidden" },
  pressed: { opacity: 0.8 },
  swatch: { height: 120, width: "100%" },
  name: { fontSize: 14, fontWeight: "600", padding: 10 },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyBody: { fontSize: 14, textAlign: "center" },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    padding: 12,
    gap: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetTitle: { fontSize: 13, paddingHorizontal: 8, paddingBottom: 4 },
  sheetRow: {
    minHeight: TOUCH_TARGET,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  sheetText: { fontSize: 16 },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  confirm: {
    minHeight: TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  confirmText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
