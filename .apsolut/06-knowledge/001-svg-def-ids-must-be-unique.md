---
id: 06-knowledge/001
date: 2026-10-12
tags: [react-native-svg, gotcha, rendering]
kind: learned
---
# A shared `<Defs>` id makes every gradient render as the same gradient

## summary

In `react-native-svg`, a gradient defined in `<Defs>` is referenced by
`fill="url(#id)"`. If several components use the **same** id, all of those
references resolve to whichever definition registered first. The symptom is
visually confusing: a grid of items that should each be different all paint
identically, and the one they paint is whichever rendered first.

## details

`GradientView` originally hardcoded `id = "gradiente-fill"`. One instance on
screen worked fine, which is why it survived the first build. The bug only
appeared once the preset grid rendered 63 instances at once — every swatch
showed the same colours.

The quieter danger was the export path: `export.tsx` renders a preview
`GradientView` and an offscreen `ExportCanvas` at the same time. With a shared
id, the captured PNG could take its colours from the preview's definition
instead of its own — a wrong-output bug with no crash and no error message.

The fix is one id per instance:

```tsx
// useId is stable across re-renders and unique per instance.
// Its output contains colons, which are not safe in an SVG id reference.
const id = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
```

## rule of thumb

Any `<Defs>` child — gradients, clip paths, masks, filters, markers — needs an
id derived from `useId()`, never a literal. A literal id is only safe in a
component you can guarantee is a singleton, and that guarantee tends not to
survive contact with a list.

## see also

- `src/components/GradientView.tsx`
- [[05-decisions/002-generated-icons-and-trimmed-modules]]
