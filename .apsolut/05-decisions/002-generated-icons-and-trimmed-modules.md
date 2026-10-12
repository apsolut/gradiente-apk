---
id: 05-decisions/002
date: 2026-10-12
tags: [assets, dependencies, play-store, size-budget]
status: locked
supersedes:
---
# Icons are generated from code, and unused native modules were removed

## context

Two shipping decisions taken while finishing v1.0.

**Icons.** The project needed a launcher icon, adaptive foreground, monochrome
layer, splash mark, a 512x512 Play listing icon and a 1024x500 feature graphic.
There is no design tool in this environment and no illustrator on the project.

**Dependencies.** The SDK 57 default template ships modules its demo screens used:
`@expo/ui`, `expo-glass-effect`, `expo-symbols`, `expo-image`, `expo-device`. The
demo was deleted by `reset-project`, but the modules stayed. PRD section 5.4 caps
the download at 25 MB, and every unused native module is also surface area for the
16 KB memory page requirement.

## options considered

- **ship the Expo placeholder icons** — rejected: the Play listing icon must match
  the launcher icon, and shipping the framework's own artwork invites the
  "minimum functionality / template-like app" rejection in PRD section 11.
- **add an image library (sharp, canvas) to render artwork** — rejected: a build
  dependency, native binaries on Windows, and non-reproducible output.
- **generate the artwork from maths with Node's own zlib** — chosen. A hand-written
  PNG encoder in `scripts/generate-assets.mjs` draws the mark from signed-distance
  fields. No dependency, byte-reproducible, and `npm run assets` regenerates every
  size from one `BRAND` constant.
- **leave the unused modules installed** — rejected: dead weight against a hard
  size budget, for no benefit.

## decision

The logo is the app's own subject matter: a rounded square carrying a three-stop
diagonal gradient, cut by the gradient axis with a ring handle at each end. It is
generated at every required size by `npm run assets`.

`@expo/ui`, `expo-glass-effect`, `expo-symbols`, `expo-image` and `expo-device`
were uninstalled. `expo-doctor` still passes 21/21 and the Android bundle still
builds.

## consequences

- what this enables: changing the brand palette is a one-line edit plus a re-run;
  the launcher and listing icons can never drift apart.
- what this forecloses: anything the generator can't express — notably text. The
  feature graphic therefore carries the mark but no wordmark. If a wordmark is
  wanted, add it to `store/feature-graphic.png` in a design tool.
- what to watch for: re-adding any removed module means re-checking the Data safety
  declaration. The whole "No data collected" claim rests on no dependency phoning
  home.

## sources

- [[02-ideas/001-gradiente-prd]] sections 5.4, 8.5, 11
- [[03-plan/001-ship-v1-to-play]]
