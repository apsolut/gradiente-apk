# CLAUDE.md — Gradiente

Design smooth color gradients in seconds and export them as phone wallpapers or ready-to-paste code.

**Stack:** Expo (React Native, TypeScript), Android / Google Play

**Current goal:** ship a compliant, offline, ad-free v1.0 to Play Internal testing and start the 14-day closed test.

## Pointers

- Spec: `.apsolut/02-ideas/001-gradiente-prd.md` — the PRD and working source of record (scope, Play compliance, release plan). Read this before building.
- Raw capture: `.apsolut/01-thinking/` — stream of consciousness, don't read unless asked
- Ideas: `.apsolut/02-ideas/` — options and tradeoffs, still exploring (holds the PRD above)
- Plans: `.apsolut/03-plan/` — committed work broken into steps; read before building
- Library: `.apsolut/04-library/` — markdown reading-room: excerpts, transcripts, snippets
- Decisions: `.apsolut/05-decisions/` — locked-in choices and the why; read before reversing anything
- Knowledge: `.apsolut/06-knowledge/` — durable reference: concepts, glossary, how-it-works
- Files: `.apsolut/07-files/` — cold storage for PDFs, audio, exports, datasets. Folder tracked, contents gitignored. `000-template.md` is a **manifest** — read it to find the one file a task needs instead of scanning the folder.
- Screenshots: `.apsolut/08-screenshots/` — hot image drop zone, split by intent into `inspiration/` (keep) and `bugs/` (ephemeral), created on demand. `000-template.md` is a **manifest** — read it to locate an image, never load the folder. Pull inspiration shots only for related design work, bug shots only when debugging that issue.

## Expo rules

`AGENTS.md` at the project root is Expo's own agent guidance — **read it before touching any
Expo, EAS or React Native API.** Short version: Expo ships breaking changes every SDK release,
so fetch the versioned docs for the `expo` major in `package.json` instead of answering from
memory, and always install with `npx expo install <pkg>` (never `npm add`) so versions stay
SDK-compatible.

Routes live in `src/app/`, not top-level `app/` — see `.apsolut/05-decisions/001-routes-live-in-src-app.md`.
PRD section 5.2 is stale on that path.

## Commands

```bash
npx expo start          # dev server (Expo Go on a phone, no custom dev client needed)
npm run typecheck       # tsc --noEmit
npm run lint            # expo lint
npm run doctor          # expo-doctor, 21 project checks
npm run assets          # regenerate icons/splash/feature graphic from code
npx expo export -p android   # verify the whole app bundles

eas build -p android --profile preview      # installable APK for device QA
eas build -p android --profile production   # AAB for Play
```

Run lint and typecheck before declaring any task done.

Linter handles code style — don't enforce style in prompts.

## Ship constraints — do not break these

These are not preferences. Each one is load-bearing for Play review:

- **No data may leave the device.** No analytics, ads, crash SDK, login, or any
  network call. The Data safety form declares "No data collected"; a mismatch
  between that form and the SDKs in the build is a top rejection cause.
- **No storage or media permissions.** Export goes through the Android share sheet
  only. `app.json` keeps `permissions: []` plus `blockedPermissions` including
  `AD_ID`. Adding a permission drags the app into Play's Photo and Video policy.
- **Preset names stay generic.** No brand names, to avoid impersonation flags.
- **Icons are generated**, not hand-edited — run `npm run assets`. See
  `.apsolut/05-decisions/002-generated-icons-and-trimmed-modules.md`.
- Release steps and the per-build checklist live in `store/RELEASE.md`.

## Don'ts

- Don't read `.apsolut/01-thinking/` unprompted — raw capture, not for CC. `02-ideas/` is unresolved exploration, with one exception: `001-gradiente-prd.md` is the spec we act on.
- Don't preload files — fetch only what the current task needs
- Don't sprinkle binaries across the markdown folders — they belong in `.apsolut/08-screenshots/` (hot path) or `.apsolut/07-files/` (cold storage)
- Don't bulk-load a binary folder. Read its `000-template.md` manifest to find the one file you need, then open only that file
- Don't put automated/Playwright/test screenshots in the vault — that's regenerated test output, it belongs in the repo's gitignored test-artifacts directory
- Don't hoard dead alternatives. Once a decision in `05-decisions/` records its "options considered" (the why-not), the rejected option files in `02-ideas/` and any decision it supersedes are dead weight — propose deleting them and remove on the user's OK. The vault holds what's true now; git is the archive
