import { forwardRef } from "react";
import { StyleSheet, View } from "react-native";

import { GradientView } from "@/components/GradientView";
import { pixelsToDp, type Pixels } from "@/lib/export";
import type { Gradient } from "@/lib/types";

/**
 * PRD F4 — the offscreen capture target.
 *
 * Laid out at `pixels / pixelRatio` dp so its natural rasterisation already
 * matches the requested pixel size; view-shot's forced resize then has nothing
 * to upscale. Parked far off to the left rather than hidden with opacity,
 * because a zero-opacity view captures blank on Android.
 */
export interface ExportCanvasProps {
  gradient: Gradient;
  pixels: Pixels;
}

export const ExportCanvas = forwardRef<View, ExportCanvasProps>(
  function ExportCanvas({ gradient, pixels }, ref) {
    const dp = pixelsToDp(pixels);

    return (
      <View style={styles.offscreen} pointerEvents="none" accessibilityElementsHidden>
        <View
          ref={ref}
          collapsable={false}
          style={{ width: dp.width, height: dp.height }}
        >
          {/* The wrapper above already carries the exact dp size, so fill it by
              insets rather than percentages. */}
          <GradientView gradient={gradient} style={StyleSheet.absoluteFill} />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  offscreen: { position: "absolute", left: -100000, top: 0 },
});
