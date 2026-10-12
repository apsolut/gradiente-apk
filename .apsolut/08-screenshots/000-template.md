---
id: 08-screenshots/000
date:
tags:
---
# 08-screenshots — image manifest + hot drop zone

Drop an image, then add a row to the manifest below so it's findable without loading the folder. Two intents, opposite lifecycles — keep them in subfolders (created on demand):

- **`inspiration/`** — **keep.** Design/mood/reference shots, sketches, mockups you'll revisit. Force-add the keepers (`git add -f`).
- **`bugs/`** — **ephemeral.** "Look at this broken thing." Stays gitignored; delete once the fix lands and prune its manifest row.

**Not here:** automated/Playwright/test screenshots. Those are regenerated test output — they belong in the repo's test-artifacts directory (gitignored there), never in the vault.

## manifest

| file | what it is | supports | keep? |
|------|-----------|----------|-------|
| `home-1.jpg` | Create screen: colour controls overlaying the Linear/Undo/Redo row | [[06-knowledge/002-flex-space-between-with-one-child]] | ephemeral — fixed 2026-10-12 |

<!--
This manifest is the injection map. Claude reads THIS table to find the right image, then views only that one file — it never bulk-loads the folder, so a vault with 40 screenshots costs nothing until one is actually needed. The user drops the file; Claude adds the row when the file is mentioned. Prune `ephemeral` rows when the shot is deleted; keep `keep` rows after force-adding. Inspiration shots are pulled only for related design work; bug shots only when debugging that issue.
-->
