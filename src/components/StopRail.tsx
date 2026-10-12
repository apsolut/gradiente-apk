import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { ControlButton } from "@/components/ControlButton";
import { GradientView } from "@/components/GradientView";
import { ON_SCRIM, TOUCH_TARGET } from "@/constants/theme";
import { useIsWide } from "@/hooks/use-palette";
import { useT } from "@/i18n";
import { readableTextOn } from "@/lib/palette";
import type { ColorStop, Gradient } from "@/lib/types";
import { MAX_STOPS, MIN_STOPS, useEditor } from "@/store/editor";

const RAIL_HEIGHT = 44;
const HANDLE = 28;
const LABEL_WIDTH = 56;
const RAIL_GAP = 10;

/** Chrome around the rail, kept in step with CreateScreen's styles. */
const WIDE_PANE_INNER = 308; // pane width 340 - paddingHorizontal 16 * 2
const NARROW_PANEL_CHROME = 60; // bottom padding 16 * 2 + panel padding 14 * 2

/**
 * PRD F1 — the colour stops, shown as handles on a rail painted with the live
 * ramp. The control and the thing it controls are the same object: you drag a
 * handle along the gradient you are editing, so position needs no explanation.
 *
 * The rail always renders the ramp left to right regardless of the gradient's
 * angle — angle is a separate control, and a rotating rail would be unusable.
 *
 * Handles are positioned in percentages rather than measured pixels. react-
 * native-web never fires `onLayout` for these views, and percentages are laid
 * out by Yoga and the browser alike, so the rail cannot land in the broken
 * state where every handle stacks at zero.
 */
export function StopRail() {
  const t = useT();
  const isWide = useIsWide();
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const stops = useEditor((s) => s.gradient.stops);
  const addStop = useEditor((s) => s.addStop);

  const railGradient: Gradient = useMemo(
    () => ({ type: "linear", angle: 90, stops }),
    [stops],
  );

  /**
   * Only the drag needs a pixel width, to turn finger movement into a
   * percentage. Prefer a real measurement where the platform provides one, and
   * fall back to the known panel geometry where it does not.
   */
  const derivedWidth =
    (isWide ? WIDE_PANE_INNER : windowWidth - NARROW_PANEL_CHROME) -
    RAIL_GAP -
    TOUCH_TARGET;
  const trackWidth = Math.max(0, (measuredWidth || derivedWidth) - HANDLE);

  const ordered = stops
    .map((stop, index) => ({ stop, index }))
    .sort((a, b) => a.stop.position - b.stop.position);

  return (
    <View style={styles.row}>
      <View
        style={styles.railWrap}
        onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.rail}>
          <GradientView gradient={railGradient} style={StyleSheet.absoluteFill} />
        </View>

        {/* Inset by half a handle so the first and last never overhang. */}
        <View style={styles.track} pointerEvents="box-none">
          {ordered.map(({ stop, index }) => (
            <StopHandle
              key={index}
              index={index}
              stop={stop}
              trackWidth={trackWidth}
              canRemove={stops.length > MIN_STOPS}
            />
          ))}

          {ordered.map(({ stop, index }) => (
            <Text
              key={`label-${index}`}
              style={[styles.hex, { left: `${stop.position}%` }]}
              numberOfLines={1}
            >
              {stop.color.replace("#", "")}
            </Text>
          ))}
        </View>
      </View>

      <ControlButton
        variant="icon"
        icon="plus"
        accessibilityLabel={t("create.addStop")}
        disabled={stops.length >= MAX_STOPS}
        onPress={() => {
          void Haptics.selectionAsync();
          addStop();
        }}
      />
    </View>
  );
}

interface StopHandleProps {
  index: number;
  stop: ColorStop;
  trackWidth: number;
  canRemove: boolean;
}

function StopHandle({ index, stop, trackWidth, canRemove }: StopHandleProps) {
  const t = useT();
  const beginDrag = useEditor((s) => s.beginDrag);
  const endDrag = useEditor((s) => s.endDrag);
  const dragStopPositionBy = useEditor((s) => s.dragStopPositionBy);
  const setStopPosition = useEditor((s) => s.setStopPosition);
  const removeStop = useEditor((s) => s.removeStop);

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Let taps and long presses reach the Pressable underneath; only claim
        // the gesture once it is unambiguously a horizontal drag.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 3,
        onPanResponderGrant: beginDrag,
        onPanResponderMove: (_event, gesture) => {
          if (trackWidth <= 0) return;
          // A pure function of the gesture: the store resolves this delta
          // against the snapshot it already took at beginDrag, so nothing here
          // has to remember where the handle started.
          dragStopPositionBy(index, (gesture.dx / trackWidth) * 100);
        },
        onPanResponderRelease: endDrag,
        onPanResponderTerminate: endDrag,
      }),
    [index, trackWidth, beginDrag, endDrag, dragStopPositionBy],
  );

  return (
    <View
      style={[styles.handleHit, { left: `${stop.position}%` }]}
      {...responder.panHandlers}
      collapsable={false}
    >
      <Pressable
        style={({ pressed }) => [
          styles.handlePress,
          pressed && styles.handlePressed,
        ]}
        accessibilityRole="adjustable"
        accessibilityLabel={`${t("create.editStop")}. ${stop.color}`}
        accessibilityHint={canRemove ? t("create.removeStop") : undefined}
        accessibilityValue={{ min: 0, max: 100, now: stop.position }}
        // Dragging is unusable with a screen reader, so TalkBack gets the same
        // control through increment/decrement.
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") {
            setStopPosition(index, stop.position + 5);
          } else if (event.nativeEvent.actionName === "decrement") {
            setStopPosition(index, stop.position - 5);
          }
        }}
        onPress={() => router.push(`/color/${index}`)}
        onLongPress={() => {
          if (!canRemove) return;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeStop(index);
        }}
      >
        <View style={[styles.handle, { backgroundColor: stop.color }]}>
          <Text
            style={[styles.handlePct, { color: readableTextOn(stop.color) }]}
          >
            {stop.position}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: RAIL_GAP },
  railWrap: { flex: 1, height: RAIL_HEIGHT + 18 },
  rail: {
    height: RAIL_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  track: {
    position: "absolute",
    left: HANDLE / 2,
    right: HANDLE / 2,
    top: 0,
    bottom: 0,
  },
  handleHit: {
    position: "absolute",
    top: (RAIL_HEIGHT - TOUCH_TARGET) / 2,
    marginLeft: -HANDLE / 2,
    width: HANDLE,
    height: TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
  },
  handlePress: {
    width: HANDLE,
    height: TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
  },
  handlePressed: { transform: [{ scale: 1.12 }] },
  handle: {
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  handlePct: { fontSize: 9, fontWeight: "700" },
  hex: {
    position: "absolute",
    top: RAIL_HEIGHT + 2,
    marginLeft: -LABEL_WIDTH / 2,
    width: LABEL_WIDTH,
    textAlign: "center",
    color: ON_SCRIM,
    fontSize: 9,
    opacity: 0.8,
  },
});
