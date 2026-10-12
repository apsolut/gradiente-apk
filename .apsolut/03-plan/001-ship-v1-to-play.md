---
id: 03-plan/001
date: 2026-10-12
tags: [v1.0, play-store, build]
status: active
from: [[02-ideas/001-gradiente-prd]]
---
# Finish v1.0 and get Gradiente ship-ready for Google Play

## goal

Every P0 and P1 feature in PRD section 3 implemented, all release artifacts authored, and the
repo passing typecheck + lint + expo-doctor + an Android bundle. Done means: nothing is left
that a machine in this environment could have done — only the steps that require the user's
Google account, their identity, a physical device, or a paid EAS build.

## steps

- [x] Project scaffold, deps, app.json, eas.json, routing skeleton
- [x] Theme system: light / dark / system (F6)
- [x] Editor: undo/redo 30 steps, stop add/remove/position, type, angle (F1)
- [x] Randomize with analogous / complementary / triadic harmonies (F1)
- [x] Colour picker: HSV wheel + validated hex input (F1)
- [x] Preset library: 63 curated presets, 7 categories, category chips (F2)
- [x] Favorites: save with name, grid, rename, duplicate, delete + undo (F3)
- [x] Export: PNG at 5 exact pixel sizes via share sheet, no permissions (F4)
- [x] Copy as code: CSS / Tailwind / hex / JSON + clipboard + haptics (F5)
- [x] Settings: theme, language, privacy, licenses, feedback, rate, version (F6)
- [x] Localization: en + de, type-enforced key parity (F7)
- [x] Large-screen two-pane layout above 600dp, edge-to-edge, a11y labels
- [x] App icon, adaptive icon, monochrome icon, splash, feature graphic (generated)
- [x] Privacy policy page, store listing copy, release checklist
- [x] Trim unused native modules to protect the 25 MB download budget
- [ ] **User-only:** package name confirmed, Play account + identity verification
- [ ] **User-only:** privacy policy hosted at a public HTTPS URL
- [ ] **User-only:** `eas login` + preview APK QA on a real device
- [ ] **User-only:** 4+ real screenshots from the device
- [ ] **User-only:** production AAB, first manual upload, closed test with 12+ testers

## constraints

- No network calls at runtime. No analytics, ads, crash SDK, login (PRD section 6).
- No storage or media permissions — export goes through the share sheet only (PRD F4).
- Data safety form must stay "No data collected", so no dependency may phone home.
- Must build for API 36 target, API 24 min.

## references

- [[02-ideas/001-gradiente-prd]]
- [[05-decisions/001-routes-live-in-src-app]]
- [[05-decisions/002-generated-icons-and-trimmed-modules]]

## done when

- `npm run typecheck`, `npm run lint`, `npm run doctor`, `npx expo export -p android` all pass
- Every PRD section 3 P0/P1 acceptance criterion is either implemented or explicitly listed
  above as user-only
- `store/` contains a deployable privacy policy and paste-ready listing copy
