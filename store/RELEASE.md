# Release runbook

The PRD (`.apsolut/02-ideas/001-gradiente-prd.md`, sections 8 to 10) is the full
answer sheet for every Play Console form. This file is only the part you tick off.

## Before the very first upload

- [ ] **Confirm the Android package name.** `app.json` says `dev.apsolut.gradiente`.
      It is permanent once uploaded and can never be changed.
- [ ] Fill the four `[REPLACE]` markers in `store/privacy-policy.html`
      (date, your name/company, address, email).
- [ ] Host that page at a public HTTPS URL. Not a PDF, not an editable doc.
      Deployed copy lives at `docs/privacy.html` (GitHub Pages, `main` branch
      `/docs`) and is served at
      `https://apsolut.github.io/gradiente-apk/privacy.html`. Edit
      `store/privacy-policy.html`, then re-copy it over `docs/privacy.html`.
- [ ] Put the live URL in `PRIVACY_URL` (`src/constants/links.ts`) and confirm
      `SUPPORT_EMAIL` is an address you actually read.
- [ ] Decide EU trader status. A free app with no monetisation can usually declare
      non-trader; a trader's address, phone and email appear publicly on the listing.
- [ ] Capture at least 4 real phone screenshots into `store/screenshots/`.

## Every build

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run doctor`
- [ ] `npx expo export -p android` bundles cleanly
- [ ] Tested as a **release build** (preview APK or internal track), not only Expo Go
- [ ] All P0 acceptance criteria pass
- [ ] Light, dark, landscape, split screen, font scale 200%, TalkBack
- [ ] Kill the app mid-edit, reopen: the draft is restored
- [ ] Export every size; share to Photos, Files and Gmail
- [ ] Merged manifest has no unexpected permissions:
      `bundletool dump manifest --bundle app.aab`
- [ ] `versionCode` increased (EAS `autoIncrement` handles this), release notes written
- [ ] Data safety form still matches the SDKs in the build
- [ ] Pre-launch report: 0 crashes, accessibility warnings reviewed

## Commands

```bash
npm install -g eas-cli
eas login
eas init
eas build:configure

eas build -p android --profile preview      # installable APK for device QA
eas build -p android --profile production   # AAB for Play
```

Upload the **first** `.aab` by hand in Play Console — Google's API refuses the very
first upload. After that, create a Google Cloud service account with access to the
app, save its JSON key as `play-service-account.json` in the project root (it is
already gitignored), then:

```bash
eas submit -p android --profile production --latest
```

## Closed testing (new personal accounts)

A personal developer account created after 13 Nov 2023 needs **at least 12 testers
opted in for 14 continuous days** before you can apply for production. Recruit 15 to
20 — if the count drops below 12 the clock can reset. Ship 1 or 2 updates during the
test and keep notes on what changed; the production application asks how testers
engaged and what you did with their feedback.

## Known gaps

- **Export dithering** (PRD F4, P1): the optional 1-2% noise overlay to hide banding
  at 4K is not implemented. It needs an SVG filter whose behaviour has to be judged
  on a real screen, which is a device test rather than a code change.
- **Reorder by drag** (PRD F1): stop order follows stop position, so dragging the
  position slider reorders the ramp. There is no separate drag-to-reorder gesture.
