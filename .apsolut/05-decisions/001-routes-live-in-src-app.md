---
id: 05-decisions/001
date: 2026-10-12
tags: [expo, project-structure, prd-divergence]
status: locked
supersedes:
---
# Routes live in `src/app/`, not top-level `app/` — diverging from PRD section 5.2

## context

PRD section 5.2 specifies a top-level `app/` directory for expo-router routes with `src/`
as a sibling. The Expo SDK 57 `default` template that `create-expo-app` actually produces
puts routes in `src/app/`, with `tsconfig.json` mapping `@/*` to `./src/*`. The PRD was
written against the older layout.

Decided while scaffolding the project (PRD timeline hour 1 to 2).

## options considered

- **keep PRD's top-level `app/`** — rejected: expo-router would need an explicit root
  override, the `@/*` alias would have to be re-pointed, and every future `create-expo-app`
  or template upgrade would fight the layout. Cost with no benefit.
- **follow the template's `src/app/`** — chosen: zero config churn, matches current Expo
  docs and the `AGENTS.md` guidance the template ships ("only screens and layout files
  should be in /src/app"). Everything else in PRD 5.2 (`components/`, `store/`, `lib/`,
  `data/`, `i18n/`) sits under `src/` exactly as written.

## decision

Routes live in `src/app/`. Assets live in `assets/images/` (also where the template puts
them, versus PRD's flat `assets/`). PRD section 5.2 is stale on these two paths and should
be read as describing the `src/` contents, not the routing root.

## consequences

- what this enables: template and SDK upgrades stay mechanical; `@/` imports work untouched.
- what this forecloses: nothing — the route tree is identical, only its parent directory moved.
- what to watch for: PRD section 5.2 now disagrees with the repo. Update the PRD when it is
  next touched, or future readers will trust the wrong paths.

## sources

- [[02-ideas/001-gradiente-prd]] section 5.2
- `AGENTS.md` at the project root (shipped by the Expo template)
