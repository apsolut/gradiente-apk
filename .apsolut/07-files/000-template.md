---
id: 07-files/000
date:
tags:
---
# 07-files — cold-binary manifest + storage

This folder holds **binaries you want to keep but rarely open**: PDFs, audio (wav/mp3), exports, datasets, design files — anything that isn't markdown. Drop the file, then add a row to the manifest so it's findable without loading the folder.

## how to use

- Organize with subfolders **on demand** — `pdfs/`, `audio/`, `exports/`, `data/`. None exist until you create them.
- Don't dump live codebases here. For comparing/borrowing code, use a git branch or a sibling folder, not `07-files/`.
- Reference a file from anywhere in the notebook with a link, e.g. from [[04-library/]] or [[05-decisions/]]:
  `see [the spec](07-files/pdfs/api-spec.pdf)`.

## manifest

| file | what it is | supports | keep? |
|------|-----------|----------|-------|
| `pdfs/api-spec.pdf` | vendor API spec v2 | [[03-plan/002]] | keep |
| `audio/interview-01.mp3` | user interview raw | [[01-thinking/005]] | keep |

## git

Contents are gitignored — this `000-template.md` manifest is the only tracked file by default. If a specific binary matters long-term (a signed contract, evidence for a decision), force-add it: `git add -f 07-files/pdfs/contract.pdf`.

<!--
07-files is davinci's cold-storage drop zone — the numbered equivalent of the bare→full `.apsolut/files/`. davinci keeps it numbered so the vault stays an all-numbered notebook. Hot UI/bug images go in 08-screenshots/ instead. Pasted markdown excerpts go in 04-library/, not here.

The manifest is the injection map: Claude reads THIS table to locate a binary, then opens only the one file a task needs — it never bulk-loads the folder. User drops the file; Claude adds the row when it's mentioned.
-->
