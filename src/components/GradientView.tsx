import { useId } from "react";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import type { StyleProp, ViewStyle } from "react-native";

import type { Gradient } from "@/lib/types";

/**
 * The one renderer used for both the live preview and the PNG export
 * (PRD section 5.1) — so what you see is exactly what you get.
 */
export interface GradientViewProps {
  gradient: Gradient;
  style?: StyleProp<ViewStyle>;
  /** Only needed for export, where captureRef wants explicit pixels. */
  width?: number | string;
  height?: number | string;
}

/**
 * CSS angle -> SVG objectBoundingBox coordinates.
 * CSS: 0deg points to the top, angles increase clockwise.
 * SVG y grows downward, hence the negated cosine.
 */
function angleToVector(angle: number) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  return {
    x1: 0.5 - dx / 2,
    y1: 0.5 - dy / 2,
    x2: 0.5 + dx / 2,
    y2: 0.5 + dy / 2,
  };
}

export function GradientView({
  gradient,
  style,
  width = "100%",
  height = "100%",
}: GradientViewProps) {
  // Every instance needs its own def id. A shared id makes all `url(#id)`
  // references resolve to whichever definition registered first, so a grid of
  // 63 presets would paint 63 copies of the same gradient. useId's output
  // contains colons, which are not safe inside an SVG id reference.
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const stops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const v = angleToVector(gradient.angle);

  return (
    <Svg width={width} height={height} style={style}>
      <Defs>
        {gradient.type === "linear" ? (
          <LinearGradient id={id} x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}>
            {stops.map((s, i) => (
              <Stop key={i} offset={`${s.position}%`} stopColor={s.color} />
            ))}
          </LinearGradient>
        ) : (
          <RadialGradient id={id} cx="50%" cy="50%" r="75%">
            {stops.map((s, i) => (
              <Stop key={i} offset={`${s.position}%`} stopColor={s.color} />
            ))}
          </RadialGradient>
        )}
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
