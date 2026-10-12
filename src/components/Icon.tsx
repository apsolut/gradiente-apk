import type { ColorValue } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

/**
 * All line-art in the app, drawn with react-native-svg (already a dependency).
 * An icon font would ship a few hundred KB of glyphs to deliver eight shapes,
 * against the 25 MB download budget in PRD section 5.4.
 *
 * Every icon is built on a 24x24 grid with a 1.9 stroke, so they sit together
 * without one looking heavier than the rest.
 */
export type IconName =
  | "create"
  | "presets"
  | "favorites"
  | "settings"
  | "undo"
  | "redo"
  | "plus"
  | "shuffle";

export interface IconProps {
  name: IconName;
  /** React Navigation hands this through as a ColorValue, not a plain string. */
  color: ColorValue;
  size?: number;
}

export function Icon({ name, color, size = 24 }: IconProps) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* The app mark in miniature: a square cut by its own gradient axis. */}
      {name === "create" ? (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={5} {...stroke} />
          <Line x1={8.4} y1={15.6} x2={15.6} y2={8.4} {...stroke} />
          <Circle cx={8.4} cy={15.6} r={1.6} fill={color} stroke="none" />
          <Circle cx={15.6} cy={8.4} r={1.6} fill={color} stroke="none" />
        </>
      ) : null}

      {name === "presets" ? (
        <>
          <Rect x={3} y={3} width={8} height={8} rx={2.2} {...stroke} />
          <Rect x={13} y={3} width={8} height={8} rx={2.2} {...stroke} />
          <Rect x={3} y={13} width={8} height={8} rx={2.2} {...stroke} />
          <Rect x={13} y={13} width={8} height={8} rx={2.2} {...stroke} />
        </>
      ) : null}

      {name === "favorites" ? (
        <Path
          d="M12 20.2 4.9 13.1a4.4 4.4 0 1 1 6.2-6.2l.9.9.9-.9a4.4 4.4 0 1 1 6.2 6.2z"
          {...stroke}
        />
      ) : null}

      {name === "settings" ? (
        <>
          <Line x1={3} y1={7} x2={21} y2={7} {...stroke} />
          <Circle cx={15} cy={7} r={2.4} fill={color} stroke="none" />
          <Line x1={3} y1={12} x2={21} y2={12} {...stroke} />
          <Circle cx={9} cy={12} r={2.4} fill={color} stroke="none" />
          <Line x1={3} y1={17} x2={21} y2={17} {...stroke} />
          <Circle cx={16} cy={17} r={2.4} fill={color} stroke="none" />
        </>
      ) : null}

      {name === "undo" ? (
        <>
          <Path d="M4 10h9a5 5 0 1 1 0 10H8" {...stroke} />
          <Path d="M8 6 4 10l4 4" {...stroke} />
        </>
      ) : null}

      {name === "redo" ? (
        <>
          <Path d="M20 10h-9a5 5 0 1 0 0 10h5" {...stroke} />
          <Path d="m16 6 4 4-4 4" {...stroke} />
        </>
      ) : null}

      {name === "plus" ? (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...stroke} />
          <Line x1={5} y1={12} x2={19} y2={12} {...stroke} />
        </>
      ) : null}

      {name === "shuffle" ? (
        <>
          <Path d="M3 7h4l10 10h4" {...stroke} />
          <Path d="M3 17h4L17 7h4" {...stroke} />
          <Path d="m18 4 3 3-3 3" {...stroke} />
          <Path d="m18 14 3 3-3 3" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}
