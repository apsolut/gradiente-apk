# Gradiente

Design smooth color gradients in seconds and export them as phone wallpapers or ready-to-paste code.
No ads, no account, no tracking.

**Stack:** Expo (React Native, TypeScript), Android / Google Play

## Project layout

- `src/app/` — expo-router routes (tabs: Create, Presets, Favorites, Settings; modals: save, export, code, colour picker)
- `src/components/` · `src/store/` · `src/lib/` · `src/data/` · `src/i18n/` — app code
- `scripts/generate-assets.mjs` — draws every icon, the splash mark and the feature graphic (`npm run assets`)
- `store/` — privacy policy page, listing copy, release runbook, Play graphics
- `app.json` · `eas.json` — Expo + EAS Build/Submit config
- `AGENTS.md` — Expo's agent guidance (read before touching Expo/EAS APIs)
- [`.apsolut/02-ideas/001-gradiente-prd.md`](.apsolut/02-ideas/001-gradiente-prd.md) — the PRD and working source of record: scope, Play compliance, release plan
- [`.apsolut/`](.apsolut/) — project notebook (davinci profile)
  - `01-thinking/` — raw capture, stream of consciousness
  - `02-ideas/` — exploration, options, comparisons (holds the PRD)
  - `03-plan/` — committed plans, broken into steps
  - `04-library/` — markdown reading-room: excerpts, transcripts, snippets
  - `05-decisions/` — locked-in decisions and rationale
  - `06-knowledge/` — reference: concepts, glossary, learned material
  - `07-files/` — cold binaries: PDFs, audio, exports (folder tracked, contents gitignored)
  - `08-screenshots/` — hot images: `inspiration/` (keep) + `bugs/` (ephemeral), created on demand (folder tracked, contents gitignored)
- `.claude/` — Claude Code config

Flow: `01-thinking` → promote → `02-ideas` → commit → `03-plan`, or lock → `05-decisions`.
`04-library`, `06-knowledge`, `07-files`, `08-screenshots` are referenced from anywhere.

Each folder's `000-template.md` is the entry format; new entries are `001-kebab-case.md`.
In `07-files/` and `08-screenshots/`, `000-template.md` is a **manifest** — one row per kept binary, so files are findable without loading the folder.

## Getting started

```bash
npm install
npx expo start      # then open in Expo Go on your Android phone
```

Every dependency runs in Expo Go, so no custom dev client is needed.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm run doctor      # expo-doctor
```

## Before the first Play upload

See [`store/RELEASE.md`](store/RELEASE.md) for the full runbook. The blocking items:

- **Confirm the Android package name.** `app.json` currently has `dev.apsolut.gradiente`.
  It is permanent after the first upload and cannot be changed.
- Fill the `[REPLACE]` markers in [`store/privacy-policy.html`](store/privacy-policy.html),
  host it at a public HTTPS URL, and put that URL in `src/constants/links.ts`.
- Capture at least 4 real device screenshots into `store/screenshots/`.
