import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeHex, randomGradient, type Harmony } from "@/lib/palette";
import type { ColorStop, Gradient, GradientType } from "@/lib/types";

/**
 * The working draft, persisted on every change so the editor survives
 * backgrounding, process death and the predictive back gesture
 * (PRD F1 acceptance criteria, PRD section 4).
 *
 * Only `gradient` is persisted — undo history is deliberately session-scoped.
 */
export const MIN_STOPS = 2;
export const MAX_STOPS = 5;
/** PRD F1 asks for at least 20. */
export const HISTORY_LIMIT = 30;

const DEFAULT_GRADIENT: Gradient = {
  type: "linear",
  angle: 160,
  stops: [
    { color: "#7C5CFF", position: 0 },
    { color: "#FF6BA9", position: 100 },
  ],
};

interface EditorState {
  gradient: Gradient;
  past: Gradient[];
  future: Gradient[];
  /** Set while a slider drag is in flight. Never persisted. */
  dragBase: Gradient | null;

  setType: (type: GradientType) => void;
  setAngle: (angle: number) => void;
  setStopColor: (index: number, color: string) => void;
  setStopPosition: (index: number, position: number) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
  randomize: (harmony?: Harmony) => void;
  load: (gradient: Gradient) => void;

  /**
   * Sliders fire continuously. Wrap a drag in begin/end so the whole gesture
   * becomes a single undo step instead of flooding the history.
   */
  beginDrag: () => void;
  endDrag: () => void;
  dragAngle: (angle: number) => void;
  dragStopPosition: (index: number, position: number) => void;
  /**
   * Move a stop by a delta measured from where it was when the drag started.
   * Resolving against the drag snapshot means the caller never has to remember
   * the starting value, so a drag handler can be a pure function of the gesture.
   */
  dragStopPositionBy: (index: number, deltaPercent: number) => void;

  undo: () => void;
  redo: () => void;
  reset: () => void;
}

const clampAngle = (angle: number) => ((Math.round(angle) % 360) + 360) % 360;
const clampPosition = (position: number) =>
  Math.min(100, Math.max(0, Math.round(position)));

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => {
      /** Every discrete mutation funnels through here, so undo can't drift. */
      const commit = (next: Gradient) =>
        set((s) => ({
          gradient: next,
          past: [...s.past, s.gradient].slice(-HISTORY_LIMIT),
          future: [],
        }));

      const edit = (fn: (g: Gradient) => Gradient) => commit(fn(get().gradient));

      /** Mutate without touching history — only valid inside a drag. */
      const live = (fn: (g: Gradient) => Gradient) =>
        set((s) => ({ gradient: fn(s.gradient) }));

      return {
        gradient: DEFAULT_GRADIENT,
        past: [],
        future: [],
        dragBase: null,

        setType: (type) => edit((g) => ({ ...g, type })),

        setAngle: (angle) => edit((g) => ({ ...g, angle: clampAngle(angle) })),

        setStopColor: (index, color) =>
          edit((g) => ({
            ...g,
            stops: g.stops.map((stop, i) =>
              i === index ? { ...stop, color: normalizeHex(color) } : stop,
            ),
          })),

        setStopPosition: (index, position) =>
          edit((g) => ({
            ...g,
            stops: g.stops.map((stop, i) =>
              i === index
                ? { ...stop, position: clampPosition(position) }
                : stop,
            ),
          })),

        addStop: () => {
          const { stops } = get().gradient;
          if (stops.length >= MAX_STOPS) return;

          // Drop the new stop into the widest gap so it lands somewhere useful.
          const sorted = [...stops].sort((a, b) => a.position - b.position);
          let gapStart = sorted[0];
          let gapEnd = sorted[sorted.length - 1];
          let widest = -1;
          for (let i = 0; i < sorted.length - 1; i += 1) {
            const gap = sorted[i + 1].position - sorted[i].position;
            if (gap > widest) {
              widest = gap;
              gapStart = sorted[i];
              gapEnd = sorted[i + 1];
            }
          }

          const inserted: ColorStop = {
            color: gapStart.color,
            position: clampPosition((gapStart.position + gapEnd.position) / 2),
          };
          edit((g) => ({ ...g, stops: [...g.stops, inserted] }));
        },

        removeStop: (index) => {
          const { stops } = get().gradient;
          if (stops.length <= MIN_STOPS) return;
          edit((g) => ({ ...g, stops: g.stops.filter((_, i) => i !== index) }));
        },

        randomize: (harmony) => commit(randomGradient(harmony)),

        load: (gradient) => commit(gradient),

        beginDrag: () => set((s) => ({ dragBase: s.gradient })),

        endDrag: () => {
          const { dragBase, gradient } = get();
          if (!dragBase) return;
          if (dragBase === gradient) {
            set({ dragBase: null });
            return;
          }
          set((s) => ({
            past: [...s.past, dragBase].slice(-HISTORY_LIMIT),
            future: [],
            dragBase: null,
          }));
        },

        dragAngle: (angle) =>
          live((g) => ({ ...g, angle: clampAngle(angle) })),

        dragStopPosition: (index, position) =>
          live((g) => ({
            ...g,
            stops: g.stops.map((stop, i) =>
              i === index
                ? { ...stop, position: clampPosition(position) }
                : stop,
            ),
          })),

        dragStopPositionBy: (index, deltaPercent) => {
          const base = get().dragBase;
          if (!base) return;
          const start = base.stops[index]?.position;
          if (start === undefined) return;
          live((g) => ({
            ...g,
            stops: g.stops.map((stop, i) =>
              i === index
                ? { ...stop, position: clampPosition(start + deltaPercent) }
                : stop,
            ),
          }));
        },

        undo: () => {
          const { past, future, gradient } = get();
          if (past.length === 0) return;
          set({
            gradient: past[past.length - 1],
            past: past.slice(0, -1),
            future: [gradient, ...future].slice(0, HISTORY_LIMIT),
          });
        },

        redo: () => {
          const { past, future, gradient } = get();
          if (future.length === 0) return;
          set({
            gradient: future[0],
            past: [...past, gradient].slice(-HISTORY_LIMIT),
            future: future.slice(1),
          });
        },

        reset: () => commit(DEFAULT_GRADIENT),
      };
    },
    {
      name: "gradiente-draft",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ gradient: s.gradient }),
    },
  ),
);
