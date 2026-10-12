---
id: 06-knowledge/002
date: 2026-10-12
tags: [flexbox, layout, gotcha, react-native]
kind: learned
---
# `justifyContent: "space-between"` silently collapses to flex-start with one in-flow child

## summary

`space-between` distributes free space *between* items. With a single item there
are no gaps to fill, so it behaves exactly like `flex-start` — the item pins to
the top (or left). The declaration looks like it is doing something and does
nothing, which is what makes it hard to spot.

## details

The Create screen read as "preview, top row, controls — spread them apart":

```tsx
<View style={{ flex: 1, justifyContent: "space-between" }}>
  <GradientView style={StyleSheet.absoluteFill} />   {/* absolute → out of flow */}
  <View style={styles.topRow} />                      {/* absolute → out of flow */}
  <View style={styles.bottom}>{controls}</View>       {/* the ONLY in-flow child */}
</View>
```

Two of the three children are absolutely positioned, so only the controls are in
flow. `space-between` therefore put them at the **top**, directly over the
absolutely-positioned Linear/Undo/Redo row — and since the controls come later in
document order with no `zIndex`, they painted on top. The buttons were not just
hidden, they were unclickable.

It only reproduced on phones. Above the 600dp breakpoint, `GradientView` switches
from `absoluteFill` to `flex: 1`, which puts it back in flow — two in-flow
children, so `space-between` worked as intended and the layout looked correct.
A bug that disappears on a wide window is a strong hint that an absolute/in-flow
child count is involved.

The fix is to state the intent directly rather than let it emerge from child
count:

```tsx
root:   { flex: 1 },                    // no justifyContent
bottom: { marginTop: "auto", ... },     // this child pushes itself down
```

## rule of thumb

`space-between`, `space-around` and `space-evenly` are only meaningful with two or
more in-flow children. If siblings are absolutely positioned or conditionally
rendered, pin the element you actually care about with `marginTop: "auto"` (or
`flex-end`) instead — it survives children appearing and disappearing.

## how it was caught

Measured in the browser rather than eyeballed: `getBoundingClientRect` on both
elements plus `document.elementFromPoint` at the button's centre, which returned
the angle snap button instead of "Linear". Because the breakpoint is a single
constant, temporarily raising `WIDE_BREAKPOINT` to 5000 forced the phone layout
to render in a desktop window, making the phone-only bug reproducible without a
phone.

## see also

- `src/app/(tabs)/index.tsx`
- [[06-knowledge/001-svg-def-ids-must-be-unique]]
