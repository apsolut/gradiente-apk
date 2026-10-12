---
id: 02-ideas/001
date: 2026-10-12
tags: [prd, android, expo, play-store, v1.0]
status: exploring
seeds:
---
# Gradiente: Product Requirements Document

> Working source of record — we act on this. Promote the build sequence to [[03-plan/]] and
> lock the concept/scope calls into [[05-decisions/]] as they firm up.

**Platform:** Android (Google Play) | **Stack:** Expo (React Native, TypeScript) | **Version:** 1.0.0
**Status:** Ready to build | **Last updated:** 2026-10-12

> **Concept assumption.** This PRD builds a gradient maker app called *Gradiente* (named after this repo).
> Sections 7 to 11 (compliance, Play Console, release, risks) work for any simple offline Expo app, so you can
> swap the concept and keep the publishing plan.

---

## 0. What "publish today" really means

| Account type | What you can do today | Earliest public release |
|---|---|---|
| **Personal** developer account created after 13 Nov 2023 | Build, create the app in Play Console, fill every form, upload to **Internal** and **Closed** testing | After a **closed test with at least 12 opted-in testers for 14 days in a row**, then "Apply for production" (review usually takes a few days). Realistically **day 16 to 22**. |
| **Organization** account (needs a D-U-N-S number) | Everything above, plus a production release | After the first review, usually **1 to 7 days** |
| Older personal account (before 13 Nov 2023) | Same as organization | 1 to 7 days |

New personal accounts also need identity verification (can take 1 to 3 days) and verification on a **physical Android
device** through the Play Console mobile app. Start the account setup first, before you write code.

**Plan for today:** ship a complete, compliant v1.0 to Internal testing, start the Closed test, and recruit testers.

---

## 1. Product summary

**One-liner:** Design smooth color gradients in seconds and export them as phone wallpapers or ready-to-paste code.

**Problem:** Designers, developers and people who customize their phones want good-looking gradients. Web tools are awkward
on a phone, and wallpaper apps are full of ads, logins and tracking.

**Solution:** A fast, offline, ad-free gradient editor with curated presets, favorites, PNG export at any phone resolution,
and one-tap copy of CSS / Tailwind / hex codes.

**Target users**
1. Phone customizers who want a unique wallpaper (largest group).
2. Web and app developers who need a gradient's CSS quickly.
3. Designers looking for color inspiration.

**Positioning:** "No ads, no account, no tracking." This is also what makes Play review easy.

---

## 2. Goals, non-goals, success metrics

**Goals (v1.0)**
- G1. Create and export a gradient wallpaper in under 30 seconds from app launch.
- G2. Pass Play review on the first submission.
- G3. Collect zero user data (Data safety: "No data collected").

**Non-goals (v1.0)**
- Accounts, cloud sync, ads, in-app purchases, push notifications, analytics SDKs, "set as wallpaper" (v1.1).

**Success metrics (first 30 days after production)**
| Metric | Target | Source |
|---|---|---|
| Crash-free users | at least 99.5% | Play Console, Android vitals |
| ANR rate | below 0.47% (Play's bad-behavior threshold) | Android vitals |
| User-perceived crash rate | below 1.09% (Play's threshold) | Android vitals |
| Store listing conversion | at least 25% | Play Console, Store performance |
| Average rating | at least 4.4 | Play Console |

No in-app analytics are used. Play Console metrics are enough for v1 and require no Data safety declaration.

---

## 3. Scope: v1.0 features

Priority: **P0** = must ship, **P1** = ship if time allows today, otherwise v1.0.1.

### F1. Gradient editor (P0)
- Linear and radial gradient types.
- 2 to 5 color stops. Add, remove, reorder, change position (0 to 100%).
- Angle control for linear (0 to 359 degrees, slider plus 45 degree snap buttons).
- Color picker per stop (HSV wheel plus hex input field with validation).
- "Randomize" button that generates a harmonious palette (analogous / complementary / triadic).
- Undo / redo (at least 20 steps).
- Live full-screen preview.

**Acceptance criteria**
- Slider changes render at 60 fps on a mid-range device (e.g. Pixel 6a / Galaxy A54).
- Invalid hex input shows an inline error and never crashes.
- The editor state survives app backgrounding and process death (persisted draft).

### F2. Preset library (P0)
- At least 60 curated presets bundled as JSON (works offline).
- Categories: Sunset, Ocean, Pastel, Neon, Dark, Mono, Nature.
- Tap a preset to open it in the editor.
- Preset names must be generic (no brand names like "Instagram" or "Spotify" to avoid impersonation flags).

### F3. Favorites (P0)
- Save the current gradient with an optional name.
- List with thumbnails, rename, delete (with undo snackbar).
- Stored locally only (AsyncStorage). Limit 500 items.

### F4. Export image (P0)
- Export PNG at: "This device" (actual screen pixels), 1080x1920, 1440x3200, 2160x3840 (4K), 2048x2048 (square).
- Export through the **Android share sheet** (`expo-sharing`). The user can save to Photos / Files or send it to any app.
- **No storage or media permissions are requested.** This avoids Google Play's Photo and Video Permissions policy entirely.

**Acceptance criteria**
- Exported image has exactly the selected pixel size, no banding visible at 4K (add 1 to 2% noise dithering option, P1).
- Works on Android 7 (API 24) through Android 16 (API 36).

### F5. Copy as code (P0)
- Formats: CSS `linear-gradient(...)` / `radial-gradient(...)`, Tailwind arbitrary value, hex list, JSON.
- One tap copies to clipboard (`expo-clipboard`) with a toast and haptic feedback.

### F6. Settings and info (P0)
- Theme: System / Light / Dark.
- Privacy policy (opens public URL).
- Open-source licenses screen.
- App version and build number.
- "Send feedback" (opens `mailto:` with version info prefilled).
- "Rate the app" (`expo-store-review`, P1).

### F7. Localization (P1)
- English (default) and German. All strings in a single `i18n` dictionary from day one.

### Out of scope, planned
| Version | Feature | Notes |
|---|---|---|
| 1.1 | Set as wallpaper (home / lock) | Needs a small custom Expo native module using `WallpaperManager` and the normal `SET_WALLPAPER` permission. No policy risk. |
| 1.1 | Mesh / multi-point gradients | Skia (`@shopify/react-native-skia`) |
| 1.2 | Home screen widget | Native module |
| 1.3 | "Pro" one-time purchase | Google Play Billing. Changes Data safety (purchase history) and EU trader status. |

---

## 4. UX and screens

Navigation: `expo-router` bottom tabs plus modal sheets.

| Route | Screen | Key elements |
|---|---|---|
| `/(tabs)/index` | **Create** | Full-bleed preview, stop bar, type toggle, angle slider, Randomize, Undo/Redo, Save, Export, Copy |
| `/(tabs)/presets` | **Presets** | Category chips, 2-column grid |
| `/(tabs)/favorites` | **Favorites** | Grid, long-press menu (rename, delete, duplicate), empty state |
| `/(tabs)/settings` | **Settings** | Theme, language, privacy, licenses, feedback, version |
| `/export` (modal) | **Export sheet** | Size options, format: PNG, "Share" button |
| `/code` (modal) | **Copy code sheet** | Format tabs, code preview, Copy |
| `/color/[stop]` (modal) | **Color picker** | Wheel, hex field, recent colors |

**UX requirements**
- **Edge-to-edge** is enforced on Android 15+ and is the default in current Expo SDKs. Use `react-native-safe-area-context`
  insets on every screen, and make sure the preview really fills the screen behind the system bars.
- **Large screens:** apps targeting API 36 can no longer lock orientation or resizability on screens 600dp wide or wider
  (tablets, foldables). Layouts must work in landscape and in split screen. Use a 2-pane layout above 600dp (editor
  left, controls right).
- **Predictive back** gesture must not lose unsaved edits: autosave the draft on every change.
- **Accessibility:** every icon button has an `accessibilityLabel`; touch targets at least 48x48dp; text scales to 200%
  without clipping; color stops also show their hex value (not color-only information); passes TalkBack walkthrough.
- **First launch:** no onboarding wall. Open straight into the editor with a random preset.

---

## 5. Technical architecture

### 5.1 Stack
| Area | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 57** (React Native 0.86, React 19.2), TypeScript | Latest stable. New Architecture and Hermes by default. Targets Android 16 (API 36), which Play requires since 31 Aug 2026. |
| Routing | `expo-router` | File-based, comes with the default template |
| Rendering | `react-native-svg` (`LinearGradient`, `RadialGradient`) | One renderer for preview and export |
| Export | `react-native-view-shot` (`captureRef` with explicit width/height) + `expo-sharing` | No permissions needed |
| Color picker | `reanimated-color-picker` | Pure JS on top of Reanimated / Gesture Handler (already in the template) |
| Slider | `@react-native-community/slider` | Expo-supported |
| State | `zustand` with `persist` middleware | Tiny, simple |
| Storage | `@react-native-async-storage/async-storage` | Local only |
| Clipboard / haptics / review | `expo-clipboard`, `expo-haptics`, `expo-store-review` | |
| Build and submit | **EAS Build** and **EAS Submit** (cloud) | No Android Studio needed, works from Windows 11 |

Every library above runs in **Expo Go**, so you can develop on your phone without a custom dev client.

### 5.2 Project structure
```
app/
  _layout.tsx
  (tabs)/_layout.tsx  index.tsx  presets.tsx  favorites.tsx  settings.tsx
  export.tsx  code.tsx  color/[stop].tsx  licenses.tsx
src/
  components/   GradientView.tsx  StopBar.tsx  AngleControl.tsx  PresetCard.tsx
  store/        editor.ts  favorites.ts  settings.ts
  lib/          codegen.ts  palette.ts  export.ts
  data/         presets.json
  i18n/         en.ts  de.ts  index.ts
assets/         icon.png  adaptive-icon.png  adaptive-icon-mono.png  splash-icon.png
```

### 5.3 Android build requirements (checked before every upload)
| Requirement | How it is met |
|---|---|
| Android App Bundle (`.aab`) | EAS production builds produce AAB by default |
| Target API 36 | Default in Expo SDK 57. Verify with `npx expo config --type prebuild` or in Play Console > App bundle explorer. |
| 16 KB memory page support (required for apps targeting Android 15+) | Supported by Expo SDK 53 and newer. Check the App bundle explorer for warnings; avoid old native libraries. |
| Play App Signing | Mandatory for new apps. EAS creates the upload key; Google holds the app signing key. |
| Unique, permanent package name | `com.<yourname>.gradiente` (cannot be changed after the first upload) |
| `versionCode` increases with every upload | `autoIncrement` with `appVersionSource: remote` in `eas.json` |
| Minimal permissions | `permissions: []` plus `blockedPermissions` (see Appendix A) |

### 5.4 Non-functional requirements
- Cold start under 2 s on a mid-range device; export of a 4K PNG under 3 s.
- Download size under 25 MB.
- 100% offline. No network calls at all (the privacy policy opens in the browser).
- `minSdkVersion`: Expo SDK default (API 24, Android 7.0).
- No crash or ANR in Play's pre-launch report.

---

## 6. Data and privacy design

- **No data leaves the device.** No analytics, crash reporting SDK, ads SDK, Firebase or login.
- Favorites, settings and the draft live in AsyncStorage and are deleted when the app is uninstalled or its data cleared.
- Crashes and ANRs are visible in **Play Console > Android vitals** without any SDK.
- If you later add Sentry, Firebase, ads or billing, **update the Data safety form before releasing that build**.
  A mismatch between the form and the SDKs in your app is one of the most common reasons for rejection.

---

## 7. Legal and compliance (Germany / EU)

> Not legal advice. Check with a professional if you plan to earn money from the app.

1. **Privacy policy:** required by Play Console. Must be a public HTTPS page (not a PDF, not an editable Google Doc),
   name the app and the developer, and stay online. Template in Appendix D. Free hosting: GitHub Pages, Netlify, or
   a page on your own website.
2. **EU trader status (Digital Services Act):** Play Console asks whether you are a trader. If you earn money from the
   app (now or later) you are most likely a trader, and your **address, phone and email are shown publicly** on the
   listing. A free app with no monetization can usually declare "non-trader". Decide before you publish.
3. **Impressum:** if the app or its website is commercial, German law (DDG section 5) requires an Impressum on the
   website that hosts your privacy policy.
4. **Developer name** on Play must match your verified identity (personal) or organization.
5. **Licenses:** keep the open-source licenses screen (all libraries used are MIT / Apache 2.0).

---

## 8. Google Play Console setup (answer sheet)

### 8.1 Developer account (do this first)
1. Go to `play.google.com/console/signup`, choose **Personal** or **Organization**, pay the one-time **US$25** fee.
2. Complete identity verification (government ID; organizations also need a D-U-N-S number).
3. Verify your email and phone, and verify access to a physical Android device with the **Play Console app**.
4. Set up a payments profile only if you plan to sell something later.

### 8.2 Create app
| Field | Value |
|---|---|
| App name | Gradiente: Gradient Maker |
| Default language | English (United States) - en-US |
| App or game | App |
| Free or paid | **Free** (a free app can never become paid later) |
| Declarations | Accept Developer Program Policies and US export laws |

### 8.3 App content (Policy > App content)
| Section | Answer |
|---|---|
| Privacy policy | Your public URL |
| App access | All functionality is available without special access |
| Ads | No, my app does not contain ads |
| Content rating (IARC questionnaire) | Category: *All other app types*. Answer **No** to violence, sexuality, language, controlled substances, gambling, user interaction / user-generated content, sharing location, digital purchases. Expected result: Everyone / PEGI 3 / USK 0. |
| Target audience and content | **18 and over** for v1 (keeps you out of the Families policy). Widen later if you want. "Could your store listing unintentionally appeal to children?" No. |
| News app | No |
| Data safety | "Does your app collect or share any of the required user data types?" **No**. Result on the listing: "No data collected / No data shared". |
| Government app | No |
| Financial features | My app does not provide any financial features |
| Health apps | No health features |
| Advertising ID | **No** (the `AD_ID` permission is blocked in `app.json`) |
| Photo and video permissions, foreground services, exact alarms, accessibility services | Not applicable (no such permissions in the manifest). If Play Console shows one of these forms, your manifest has an unexpected permission: fix the build, do not fill in the form. |

### 8.4 Store settings
| Field | Value |
|---|---|
| Category | **Personalization** (alternative: Art & Design) |
| Tags | Wallpapers, Design, Color |
| Contact email | A public support email (required) |
| Website | Optional (your privacy policy site works) |

### 8.5 Main store listing (copy in Appendix C)
| Asset | Requirement |
|---|---|
| App name | max 30 characters |
| Short description | max 80 characters |
| Full description | max 4000 characters |
| App icon | 512x512 PNG, 32-bit with alpha, max 1 MB. Must match the launcher icon. |
| Feature graphic | 1024x500 JPG or 24-bit PNG (no alpha) |
| Phone screenshots | 2 to 8, PNG/JPG, 9:16, at least 1080x1920 recommended. **Provide at least 4** to be eligible for featuring. |
| Tablet screenshots (7" and 10") | Optional, but recommended because the app must support large screens anyway |
| Promo video | Optional YouTube link |

**Metadata rules that cause rejections:** no "best", "#1", "top", "free", prices or promotions in the name, icon or
developer name; no emoji or ALL CAPS in the name; no keyword lists; no third-party brand names; screenshots must
show the real app.

---

## 9. Build and release runbook

### 9.1 Today: from zero to Closed testing
```bash
# 1. Create the project (works on Windows 11 in PowerShell)
npx create-expo-app@latest gradiente
cd gradiente
npm run reset-project            # clears the demo screens

# 2. Dependencies
npx expo install react-native-svg react-native-view-shot expo-sharing expo-clipboard \
  expo-haptics expo-store-review @react-native-async-storage/async-storage \
  @react-native-community/slider
npm install zustand reanimated-color-picker

# 3. Develop with Expo Go on your phone
npx expo start

# 4. EAS setup (once)
npm install -g eas-cli
eas login
eas init
eas build:configure

# 5. Test a release build on real devices (installable APK)
eas build -p android --profile preview

# 6. Production build (AAB for Play)
eas build -p android --profile production
```

7. **Play Console > Test and release > Testing > Internal testing > Create new release.** Accept Play App Signing.
   **Upload the first `.aab` manually** (Google's API does not allow the very first upload through EAS Submit).
8. Add yourself as an internal tester, install from the Play link, smoke-test the Play-signed build.
9. **Closed testing:** create a track (e.g. "Alpha"), add testers by email list or Google Group, select countries,
   promote the same release. Share the opt-in link.
10. Create a **Google Cloud service account** with access to your Play Console app, download its JSON key as
    `play-service-account.json` (add it to `.gitignore`). From now on: `eas submit -p android --profile production --latest`.

### 9.2 Days 1 to 14: closed test (personal accounts)
- Keep **at least 12 testers opted in for 14 continuous days**. If the count drops below 12, the clock can reset, so
  recruit 15 to 20 (friends, colleagues, Reddit r/AndroidClosedTesting, tester-exchange communities).
- Ask testers to actually use the app and send feedback. Google's production application asks how testers engaged.
- Ship at least 1 or 2 updates during the test based on feedback, and keep notes of what changed.
- Watch the **Pre-launch report** after every upload (crashes, accessibility, screenshots on many devices).

### 9.3 Day 15+: production
1. **Dashboard > Apply for production.** Answer the questionnaire honestly (who tested, how you recruited them, what
   feedback you got, what you changed, why the app is ready).
2. After approval: **Production > Create new release**, select countries (start with all, or EU + US),
   use a **staged rollout** (20% then 50% then 100% over a few days while watching Android vitals).
3. Release notes ("What's new"), max 500 characters per language.

### 9.4 Ongoing obligations
- Every year Google raises the target API level (expect API 37 by 31 Aug 2027). Upgrade the Expo SDK before then.
- Keep the account active (log in, ship updates) and keep contact details correct.
- Answer policy emails within their deadline.

---

## 10. QA plan

**Device matrix (Pre-launch report covers many more)**
| Device / emulator | Why |
|---|---|
| Android 7 (API 24) emulator | Minimum SDK |
| Android 11 (API 30) phone | Common mid-range |
| Android 14 / 15 phone | Edge-to-edge on 15 |
| Android 16 (API 36) phone | Target SDK behavior |
| Tablet or foldable emulator (Android 16) | Orientation and resizability can't be locked |

**Release checklist (every build)**
- [ ] Release build tested (preview APK or internal track), not only Expo Go
- [ ] All P0 acceptance criteria pass
- [ ] Light, dark, landscape, split screen, font scale 200%, TalkBack
- [ ] Kill app during editing, reopen: draft restored
- [ ] Export all sizes; share to Photos, Files, Gmail
- [ ] Merged manifest has no unexpected permissions (`bundletool dump manifest --bundle app.aab`)
- [ ] `versionCode` increased, `version` updated, release notes written
- [ ] Data safety form still matches the SDKs in the build
- [ ] Pre-launch report: 0 crashes, accessibility warnings reviewed

---

## 11. Rejection risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Minimum functionality / spam** (simple or template-like app) | Medium | Real editor, export, codes, presets, favorites; original screenshots and description; no copied template text |
| **Metadata policy** (keywords, "best", brand names) | Medium | Use the copy in Appendix C as is |
| **Data safety mismatch** | Low | No third-party SDKs that collect data; re-check before adding any |
| **Undeclared / sensitive permissions** (Photo and Video policy) | Low | Share-sheet export, `permissions: []`, `blockedPermissions` |
| **Broken functionality during review** | Low | Test the Play-signed build from the internal track |
| **Invalid privacy policy** (404, PDF, generic) | Low | Public HTTPS page naming the app and developer |
| **Impersonation / IP** | Low | Original icon and name, generic preset names |
| **Production access denied** (weak closed test) | Medium | 15 to 20 real testers, feedback, at least one update during the test |
| **Target API too low** | Low | Expo SDK 57 targets API 36 |
| **Account verification delays** | Medium | Start account setup before coding |

---

## 12. Timeline

| When | Task | Output |
|---|---|---|
| Today, hour 0 to 1 | Developer account signup and verification; pick package name; register privacy policy domain / GitHub Pages | Account pending or active |
| Hour 1 to 2 | Create project, install deps, set up `app.json` / `eas.json`, routing skeleton | Running in Expo Go |
| Hour 2 to 5 | F1 editor, F2 presets, F3 favorites | Core app |
| Hour 5 to 6 | F4 export, F5 copy code, F6 settings | Feature complete |
| Hour 6 to 7 | Icon, adaptive icon, splash, screenshots, feature graphic | Store assets |
| Hour 7 to 8 | Preview APK QA on real device, fix bugs | QA pass |
| Hour 8 to 9 | Production AAB, Play Console forms (section 8), internal track upload, closed track | **v1.0.0 in closed testing** |
| Days 1 to 14 | Closed test with 12+ testers, 1 to 2 updates (v1.0.1, v1.0.2) | Feedback log |
| Day 15 | Apply for production | Application submitted |
| Day 16 to 22 | Approval, staged production rollout | **Live on Google Play** |

---

## Appendix A: `app.json`

```json
{
  "expo": {
    "name": "Gradiente",
    "slug": "gradiente",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/icon.png",
    "scheme": "gradiente",
    "userInterfaceStyle": "automatic",
    "android": {
      "package": "com.yourname.gradiente",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "monochromeImage": "./assets/adaptive-icon-mono.png",
        "backgroundColor": "#1B1B2F"
      },
      "permissions": [],
      "blockedPermissions": [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "com.google.android.gms.permission.AD_ID"
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#1B1B2F"
        }
      ]
    ],
    "experiments": { "typedRoutes": true }
  }
}
```

Notes: `orientation: "default"` because Android 16 ignores orientation locks on large screens anyway. Replace
`yourname` before the first upload; the package name is permanent.

## Appendix B: `eas.json`

```json
{
  "cli": { "version": ">= 16.0.0", "appVersionSource": "remote" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./play-service-account.json",
        "track": "internal",
        "releaseStatus": "completed"
      }
    }
  }
}
```

## Appendix C: store listing copy (en-US)

**App name (25/30):**
`Gradiente: Gradient Maker`

**Short description (75/80):**
`Create beautiful color gradients and export them as wallpapers or CSS code.`

**Full description:**
```
Gradiente is a simple, fast gradient maker for your phone.

Pick a few colors, adjust the angle, and get a smooth gradient in seconds. Use it as a wallpaper, share it with friends, or copy the code straight into your website or app.

CREATE
- Linear and radial gradients
- Up to 5 color stops with precise positions
- Color wheel and hex input
- Randomize for instant inspiration
- Undo and redo

EXPLORE
- 60+ handpicked presets: sunset, ocean, pastel, neon, dark and more
- Save your favorites and come back to them anytime

EXPORT
- High-resolution PNG up to 4K
- Sizes for your exact screen, common phones, or square posts
- Share to your gallery, files, or any app

FOR DEVELOPERS AND DESIGNERS
- Copy as CSS, Tailwind, hex list or JSON with one tap

PRIVATE BY DESIGN
- No ads
- No account
- No tracking: Gradiente collects no data at all
- Works fully offline

Questions or ideas? Write to us from the Settings screen. We read every message.
```

**Release notes v1.0.0:**
`First release of Gradiente. Create, save and export beautiful gradients.`

**German listing (de-DE), optional:**
- Name: `Gradiente: Farbverlauf-Editor`
- Short: `Erstelle schöne Farbverläufe und exportiere sie als Hintergrund oder CSS-Code.`

## Appendix D: privacy policy template

Host this as a public HTML page. Replace the bracketed values.

```
Privacy Policy for Gradiente
Last updated: [DATE]

Gradiente ("the app") is developed by [YOUR NAME / COMPANY], [ADDRESS], [EMAIL] ("we").

1. Data we collect
The app does not collect, store on our servers, share or sell any personal data. The app does not use analytics,
advertising, crash reporting or tracking services and does not require an account.

2. Data stored on your device
Your favorite gradients and settings are stored only on your device. They are deleted when you clear the app's data
or uninstall the app. We have no access to them.

3. Permissions
The app does not request access to your photos, files, camera, microphone, contacts or location. When you export an
image, it is passed to the Android share sheet and you choose where it goes.

4. Contacting us
If you email us, we use your email address and message only to reply to you and delete them when they are no
longer needed. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in answering your request).

5. Google Play
The app is distributed through Google Play. Google may process data when you download or update apps; see Google's
privacy policy at https://policies.google.com/privacy.

6. Children
The app is not directed at children under 13 and does not knowingly collect data from anyone.

7. Your rights
Under the GDPR you have the right to access, rectification, erasure, restriction, objection and data portability,
and the right to lodge a complaint with a supervisory authority. Since we do not process personal data through the
app, most of these rights apply only to emails you send us.

8. Changes
We will update this page if the app's data practices change. The date above shows the latest version.

Contact: [EMAIL]
```

## Appendix E: references
- Target API requirements: https://developer.android.com/google/play/requirements/target-sdk
- Play Console Help, testing requirements for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Expo SDK 57 changelog: https://expo.dev/changelog/sdk-57
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit (Android): https://docs.expo.dev/submit/android/
- Developer Program Policy: https://play.google.com/about/developer-content-policy/
