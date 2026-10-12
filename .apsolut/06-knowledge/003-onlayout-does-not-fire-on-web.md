---
id: 06-knowledge/003
date: 2026-10-12
tags: [react-native-web, layout, gotcha, expo-web]
kind: learned
---
# `onLayout` never fires under react-native-web in this project

## summary

Any layout code that waits on `onLayout` silently produces zeros when the app
runs on web (`npx expo start` in a browser). The views are laid out correctly —
the DOM reports real dimensions — but the callback never arrives, so state
initialised to `0` stays `0` and anything derived from it collapses.

## details

Found while building the stop rail. Handles were positioned at
`(position / 100) * trackWidth`, with `trackWidth` coming from
`onLayout`. Every handle rendered at `left: 0px`, stacked on top of each other.

Confirmed deliberately rather than guessed:

1. The rail element measured **250px** in the DOM.
2. A debug `accessibilityLabel` rendering the state read `railWidth=0`.
3. Changing the handler to `setRailWidth(width || -1)` still produced `0`, not
   `-1` — proving the callback never ran, as opposed to running with a zero.
4. Reproduced after a full page reload, so it was not Fast Refresh staleness,
   and the live DOM confirmed the newest bundle was running.
5. Moving `onLayout` to the flex parent changed nothing.

`measureInWindow` on a ref was equally silent. The likely culprit is the
React Compiler (`experiments.reactCompiler: true` in app.json) interfering with
react-native-web's `useElementLayout` ref callback, but that was not chased down
— the fix does not depend on the cause.

## what to do instead

Position with **percentages**, which Yoga and the browser both resolve without
any measurement:

```tsx
track:  { position: "absolute", left: HANDLE / 2, right: HANDLE / 2 },
handle: { position: "absolute", left: `${position}%`, marginLeft: -HANDLE / 2 },
```

Where a pixel width is genuinely unavoidable — converting a drag delta into a
percentage, for instance — keep `onLayout` as the preferred source but fall back
to width derived from `useWindowDimensions()` and the known container geometry.
`useWindowDimensions` is reliable on both platforms.

## rule of thumb

On this project, treat `onLayout` as native-only. If a layout cannot render
correctly without it, the layout needs rethinking — a measurement that silently
returns zero produces a broken screen with no error to trace.

## see also

- `src/components/StopRail.tsx`
- [[06-knowledge/002-flex-space-between-with-one-child]]
