import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { ON_SCRIM, TOUCH_TARGET } from "@/constants/theme";
import { usePalette } from "@/hooks/use-palette";

/**
 * Controls that sit on the gradient. The surface underneath them already
 * carries the scrim, so these paint no background of their own — stacking a
 * scrim on a scrim is what made the old buttons look muddy.
 *
 * Three weights, and only one `primary` should be visible at a time:
 *   primary — the screen's goal (Export). The single saturated element.
 *   ghost   — everything else. Hairline border, transparent fill.
 *   icon    — utility (undo, redo, add). No border, just the glyph.
 */
export type ControlVariant = "primary" | "ghost" | "icon";

export interface ControlButtonProps {
  label?: string;
  icon?: IconName;
  variant?: ControlVariant;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Share the row's width equally with its siblings. */
  grow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ControlButton({
  label,
  icon,
  variant = "ghost",
  accessibilityLabel,
  accessibilityHint,
  onPress,
  onLongPress,
  disabled = false,
  grow = false,
  style,
}: ControlButtonProps) {
  const palette = usePalette();

  const tint = disabled ? DISABLED_TINT : ON_SCRIM;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === "icon" ? styles.iconBase : styles.labelled,
        variant === "ghost" && styles.ghost,
        variant === "ghost" && pressed && styles.ghostPressed,
        variant === "ghost" && disabled && styles.ghostDisabled,
        variant === "primary" && { backgroundColor: palette.accent },
        variant === "primary" && pressed && styles.primaryPressed,
        variant === "primary" && disabled && styles.primaryDisabled,
        variant === "icon" && pressed && styles.iconPressed,
        grow && styles.grow,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {icon ? <Icon name={icon} color={tint} size={22} /> : null}
      {label ? (
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.primaryLabel,
            { color: variant === "primary" ? "#FFFFFF" : tint },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const DISABLED_TINT = "rgba(255,255,255,0.34)";

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_TARGET,
    minWidth: TOUCH_TARGET,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 24,
  },
  labelled: { paddingHorizontal: 18 },
  iconBase: { width: TOUCH_TARGET, borderRadius: TOUCH_TARGET / 2 },
  grow: { flex: 1 },

  ghost: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "transparent",
  },
  // Pressed brightens the edge rather than darkening the fill, so the gradient
  // underneath stays visible through the control.
  ghostPressed: {
    borderColor: "rgba(255,255,255,0.75)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  ghostDisabled: { borderColor: "rgba(255,255,255,0.14)" },

  primaryPressed: { opacity: 0.82 },
  primaryDisabled: { opacity: 0.45 },

  iconPressed: { backgroundColor: "rgba(255,255,255,0.16)" },

  label: { fontSize: 15, fontWeight: "600" },
  primaryLabel: { fontWeight: "700" },
});
