import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AngleControl } from "@/components/AngleControl";
import { ControlButton } from "@/components/ControlButton";
import { GradientView } from "@/components/GradientView";
import { StopRail } from "@/components/StopRail";
import { SCRIM } from "@/constants/theme";
import { useIsWide } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import { useEditor } from "@/store/editor";
import { useUi } from "@/store/ui";

/**
 * PRD F1 — the Create screen. The gradient is the content, so the chrome stays
 * out of its way: one scrim surface carries the controls, and Export is the
 * only saturated element on screen because exporting is the app's whole point
 * (PRD G1 — wallpaper out in under 30 seconds).
 *
 * Above 600dp the controls move into a side pane: API 36 forbids locking
 * orientation or resizability on large screens.
 */
export default function CreateScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  const showToast = useUi((s) => s.showToast);

  const gradient = useEditor((s) => s.gradient);
  const setType = useEditor((s) => s.setType);
  const randomize = useEditor((s) => s.randomize);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);

  const typeLabel =
    gradient.type === "linear" ? t("create.linear") : t("create.radial");

  const controls = (
    <>
      <StopRail />
      {gradient.type === "linear" ? <AngleControl /> : null}

      <View style={styles.actionRow}>
        <ControlButton
          label={t("create.randomize")}
          icon="shuffle"
          grow
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            randomize();
          }}
        />
        <ControlButton
          label={t("create.save")}
          onPress={() => router.push("/save")}
        />
      </View>

      <View style={styles.actionRow}>
        <ControlButton
          label={t("create.code")}
          onPress={() => router.push("/code")}
        />
        <ControlButton
          label={t("create.export")}
          variant="primary"
          grow
          onPress={() => router.push("/export")}
        />
      </View>
    </>
  );

  return (
    // No justifyContent: in the phone layout the controls are the only in-flow
    // child, and `space-between` with one item collapses to flex-start — which
    // once put the controls on top of the row below. They push themselves down.
    <View style={[styles.root, isWide && styles.rootWide]}>
      <GradientView
        gradient={gradient}
        style={isWide ? styles.previewWide : StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.topRow,
          { paddingTop: insets.top + 12 },
          isWide && styles.topRowWide,
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.topScrim}>
          <ControlButton
            label={typeLabel}
            accessibilityLabel={`${t("create.switchType")}. ${typeLabel}`}
            onPress={() =>
              setType(gradient.type === "linear" ? "radial" : "linear")
            }
          />
        </View>

        <View style={styles.spacer} />

        <View style={styles.topScrim}>
          <ControlButton
            variant="icon"
            icon="undo"
            accessibilityLabel={t("create.undo")}
            disabled={!canUndo}
            onPress={() => {
              if (!canUndo) {
                showToast(t("create.nothingToUndo"));
                return;
              }
              undo();
            }}
          />
          <ControlButton
            variant="icon"
            icon="redo"
            accessibilityLabel={t("create.redo")}
            disabled={!canRedo}
            onPress={() => {
              if (!canRedo) {
                showToast(t("create.nothingToRedo"));
                return;
              }
              redo();
            }}
          />
        </View>
      </View>

      {isWide ? (
        <View
          style={[
            styles.pane,
            { paddingTop: insets.top + 76, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {controls}
        </View>
      ) : (
        <View
          style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}
          pointerEvents="box-none"
        >
          <View style={styles.scrimPanel}>{controls}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootWide: { flexDirection: "row" },
  previewWide: { flex: 1 },
  topRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRowWide: { right: 340 },
  // Each cluster gets its own scrim so the controls stay legible, rather than
  // laying one dark band across the top of the gradient.
  topScrim: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 28,
    backgroundColor: SCRIM,
  },
  spacer: { flex: 1 },
  bottom: { marginTop: "auto", paddingHorizontal: 16, paddingTop: 12 },
  scrimPanel: {
    gap: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: SCRIM,
  },
  pane: {
    width: 340,
    gap: 16,
    paddingHorizontal: 16,
    backgroundColor: SCRIM,
  },
  actionRow: { flexDirection: "row", gap: 10 },
});
