---
id: 05-decisions/003
date: 2026-10-14
tags: [export, play-store, permissions, expo-file-system]
status: locked
supersedes:
---
# "Save to device" goes through the Storage Access Framework, not expo-media-library

## context

F4 shipped with one way out: `expo-sharing`. That covers "send this PNG to an
editor" — Snapseed, Canva, Files and Drive all appear as `ACTION_SEND` targets —
but it offers no button that says *save*, and no predictable file path. Users
asked for an explicit "Save to Gallery".

The constraint it collides with: the Data safety form declares "No data
collected", `app.json` carries `permissions: []`, and `blockedPermissions`
includes both media and external-storage permissions. PRD section 11 lists the
Photo and Video Permissions policy as a top rejection cause.

## options considered

- **`expo-media-library` + `saveToLibraryAsync()`** — rejected. Its Android config
  plugin writes `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` and
  `WRITE_EXTERNAL_STORAGE` into the manifest. `READ_MEDIA_IMAGES` pulls the app
  into the Photo and Video Permissions policy: a declaration form plus a written
  justification that a wallpaper designer needs to *read* the user's photo
  library, which it does not. Keeping the permissions in `blockedPermissions`
  does not rescue it — the library's own permission gate then returns denied
  permanently and the save throws. There is no half-measure.
- **`requestPermissionsAsync(writeOnly: true)`** — rejected. It narrows the
  runtime ask to `WRITE_EXTERNAL_STORAGE` (API <=28 only), but the plugin still
  stamps the read permissions into the manifest, and the manifest is what
  reviewers scan.
- **share sheet only, fix the wording** — rejected as insufficient once the user
  confirmed they wanted a real save. It was the right first answer, and the
  `export.note` copy still explains both routes.
- **Storage Access Framework folder picker** — chosen. No manifest permission at
  all, no Play policy surface, and Android itself renders the picker so the user
  sees exactly which folder they granted.

## decision

`Directory.pickDirectoryAsync()` from `expo-file-system` opens Android's folder
picker. Expo's `FilePickerContract` calls `takePersistableUriPermission` on the
result, so the tree URI survives a restart and is asked for exactly once. It is
persisted as `saveFolderUri` in the settings store — a local path, not user data.

`expo-file-system`'s *library* manifest declares `READ_EXTERNAL_STORAGE` and
`WRITE_EXTERNAL_STORAGE` at `maxSdkVersion=32`. Both are already in
`blockedPermissions`, and `npx expo config --type introspect` confirms they are
emitted with `tools:node="remove"`, which strips them at merge time. The app
manifest still carries only `INTERNET` (Expo's base template) and `VIBRATE`
(expo-haptics).

## consequences

- what this enables: an explicit "Save to device" button, and a known folder the
  user can point another editor at. Permission posture and the Data safety
  declaration are untouched.
- what this forecloses: the label "Save to Gallery". A SAF write is not
  guaranteed to be indexed by MediaStore immediately, so the file may not appear
  in Photos right away. The copy says "Save to device" and names the folder,
  which is what actually happens.
- what to watch for:
  - **Two native traps, both load-bearing in `src/lib/export.ts`.**
    `react-native-view-shot` routes its `fileName` through
    `File.createTempFile`, which splices a random number into it — so the
    capture is staged under a clean name in cache first, because copying *into* a
    SAF directory takes the child name from the source file. And copying onto a
    specific existing SAF file with `overwrite: true` deletes the document and
    then writes to the dead URI (`CopyMoveStrategy.SAF` plus
    `DestinationSink.SAF`); copying into the *directory* is the correct call.
  - Saved names carry a timestamp (`gradiente-1080x1920-20261014-153012.png`) so
    repeat saves accumulate instead of colliding or clobbering.
  - The grant can vanish — revoked in Settings, SD card pulled, folder deleted.
    `directory.exists` degrades to `false` rather than throwing, which clears the
    stored URI and re-prompts on the next tap.
  - Re-check this whole file before anyone reaches for `expo-media-library`
    again, for any reason.

## sources

- [[02-ideas/001-gradiente-prd]] sections F4, 5.1, 11
- `expo-file-system@57.0.7` Android sources: `FilePickerContract.kt`,
  `CopyMoveStrategy.kt`, `DestinationSink.kt`, `SAFDocumentFile.kt`
- [[05-decisions/002-generated-icons-and-trimmed-modules]] — same underlying rule:
  every added dependency is re-checked against the "No data collected" claim
