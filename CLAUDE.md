# LegacyHQ Design System

Context for working in this repo. Read this before making changes so you don't
have to rediscover conventions from scratch each session.

## What this is

A React component library / design system for LegacyHQ, built with design
tokens (Style Dictionary), CSS Modules, Storybook, and Vitest.

## Repo layout

```
packages/ui/src/components/
  primitives/   # logo, focus-ring, icon — lowest-level building blocks
  atoms/        # button, badge, checkbox, switch, slider, avatar, link,
                # tag, tooltip, radio, progress-bar, spinner, label, ...
  molecules/    # composed from atoms/primitives

docs/
  foundations/token-governance.json   # token architecture rules (see below)
  foundations/component-registry-governance.json  # registry.json normalization rules
  foundations/component-registry.schema.json       # shape of registry.json
  foundations/component-exemplars-governance.json  # exemplars.json normalization rules
  foundations/component-exemplars.schema.json      # shape of exemplars.json
  components/registry.json    # generated, normalized cross-component index (see below)
  components/exemplars.json   # generated, normalized cross-component exemplar index
  components/{primitives,atoms,molecules}/<component>/
    <component>.md             # usage doc: when to use, design intent,
                                # a11y expectations, implementation constraints
    <component>-spec.md        # detailed spec
    <component>-prompt.md      # prompt used to originally generate the component
    <component>-checklist.md   # QA / completion checklist
    <component>.contract.json  # machine-readable prop/anatomy contract
    <component>.examples.json  # usage examples

llms.txt   # per-component index + task→file routing pointer
```

Component source files follow: `component-name.tsx`,
`ComponentName.stories.tsx`, `ComponentName.test.tsx` (lowercase-hyphen for
the implementation file, PascalCase for stories/tests).

## Context routing

Don't read all 6 doc files for every component task — Button's full set alone
is ~1360 lines. Match the file(s) to your task shape:

| Task shape | Read | Skip (for now) |
|---|---|---|
| Orienting on an untouched component | `.md` | everything else |
| Adding/changing a prop | `.contract.json`, relevant section of `-spec.md` | `-prompt.md`, `-checklist.md` |
| Styling/token-only change | `.md`, `token-governance.json` | `-prompt.md`, `-checklist.md` |
| New variant / new anatomy part | `.md`, `-spec.md`, `.contract.json`, `.examples.json` | `-prompt.md` |
| Final QA / before `npm run validate` | `-checklist.md` | — |
| Regenerating a component from scratch | `-prompt.md` | — |
| Structural query across many components (e.g. "which components support a `tone` prop") | `docs/components/registry.json` | individual `.contract.json` files |
| Need a runnable usage example for a component | `docs/components/exemplars.json` | individual `.examples.json` (unless you need the full antiExample/props detail it may not carry) |

Full component index: [`llms.txt`](llms.txt). Load
`docs/foundations/token-governance.json` and
`docs/foundations/component-api-governance.json` once per session, not per
component — they're cross-cutting, not component-specific.

`docs/components/registry.json` is generated from every component's
`.contract.json` (`npm run generate:registry`) and normalizes their
inconsistent raw shapes into one consistent, machine-readable structure — it
trades per-component nuance (exact per-size/per-variant token detail) for
reliable cross-component structure. See
`docs/foundations/component-registry-governance.json` for the normalization
rules and known content gaps (Avatar, Tooltip, IconButton have real missing
content, not just reshaped data).

`docs/components/exemplars.json` is generated from every component's
`.examples.json` (`npm run generate:exemplars`) and normalizes presence
(fills in missing `antiExamples`/`props` defaults, never fabricates values).
Each entry has an `exemplarCompleteness` (`full`/`partial`/`thin`) flag — 16
of 28 components are `thin` (no anti-pattern examples, no per-example props
map yet). See `docs/foundations/component-exemplars-governance.json` for the
completeness backlog and the quality bar for filling one in.

## Token architecture (three tiers — this is load-bearing)

From `docs/foundations/token-governance.json`. The "components must never
consume primitives directly" / "no raw values" rules below are enforced
mechanically by `npm run lint:css` (stylelint), not just by convention or
review — see the `enforcement` block in that file and the Commands section
below.

1. **Primitive** — raw values only, no intent. `color.blue.500`,
   `spacing.4`. **Components must never consume these directly.**
2. **Semantic** — the primary layer components should consume. Represents
   intent/meaning. `color.background.brand`, `color.text.primary`. Maps to
   primitives.
3. **Component** — exceptions only, not defaults. `button.primary.background`.
   Should alias semantic tokens. Only create one when a component needs
   independent theming/control that the semantic layer can't express.

**Before creating a new token**, check whether an existing semantic token
already expresses the same meaning — reuse it. Don't create component tokens
that just duplicate a semantic token under a different name (e.g. don't make
`badge.primary.background` and `toast.primary.background` if
`color.background.brand` already covers it).

## Component conventions (from the Button doc set — treat as the reference pattern)

- **Native elements first.** e.g. Button renders a real `<button>`, defaults
  to `type="button"`, uses the native `disabled` attribute — don't
  reinvent behavior with ARIA that HTML already gives you for free.
- **Separate emphasis from meaning.** Visual weight (e.g. `appearance`:
  default/primary/subtle) and semantic intent (e.g. `tone`:
  neutral/warning/error/discovery) are independent props. This avoids a
  combinatorial variant explosion — don't add `variant="destructive-subtle"`
  style props; compose the two axes instead.
- **Each component has a clear "when not to use."** e.g. Button is not for
  navigation (use Link/Link Button), not for icon-only actions (use Icon
  Button), not for persistent selected state (use Toggle Button). Check the
  sibling components' docs before reaching for the nearest one.
- **Styling:** CSS Modules + design tokens only. No MUI, no Tailwind, no
  hardcoded colors/typography. Component tokens are used sparingly (e.g.
  only for min-height on Button) — semantic tokens handle color, spacing,
  radius, typography, border width, focus treatment.
- **Focus:** use the shared Focus Ring pattern (`primitives/focus-ring`)
  rather than a one-off focus style per component.
- **Icons:** consistent size per component (e.g. Button always uses the
  medium icon size regardless of button size) — no `iconSize` prop.
- **Loading/busy states** preserve the visible label and use `aria-busy`
  rather than swapping the label or shifting layout.

## Component API conventions

Cross-cutting prop-naming rules live in
`docs/foundations/component-api-governance.json` (same style as
token-governance.json). Current rules:

- Use native `disabled`, not a custom `isDisabled` boolean. Checkbox, Switch,
  Radio, Button, and IconButton all follow this.
- Reserve the `is*` prefix (`isLoading`, `isFullWidth`, `isExpanded`) for
  state with no native HTML equivalent — not for anything a native attribute
  already covers.

Check that file before introducing a new prop name pattern.

## When building/editing a component

(See "Context routing" above for which files to *read* for your specific
task — the steps below cover what must stay *in sync* once you've made a
change.)

1. Check if `docs/components/<tier>/<name>/` already exists — the `.md`,
   `-spec.md`, and `.contract.json` are the source of truth for intended
   behavior, not just documentation to update after the fact.
2. Cross-check `token-governance.json` before adding any new token.
3. Update all four docs (`*.md`, `*-spec.md`, `*-checklist.md`,
   `*.contract.json`/`*.examples.json` as applicable) alongside code changes
   — they're expected to stay in sync, not just describe v1.
4. Add/update `.stories.tsx` and `.test.tsx` alongside the component.
5. If this is a new component, add one line for it under the correct tier
   heading in `llms.txt`.

## Commands

- `npm run validate` — the one command to run after touching a component;
  runs `typecheck`, then `lint`, then `lint:css`, then `test`. Run this before
  considering a change done. Also runs in CI (`.github/workflows/validate.yml`)
  on every push/PR.
- `npm run lint:css` — stylelint over `packages/ui/src/components/**/*.module.css`.
  Enforces the token architecture mechanically: raw values for color,
  typography, radius, and spacing properties fail the build instead of relying
  on review to catch them. Config lives in `.stylelintrc.json`; the policy
  (what's gated, what's intentionally excluded, and how to use the escape
  hatch) is documented in `docs/foundations/token-governance.json`'s
  `enforcement` block.
- `npm run storybook` — dev Storybook on port 6006
- `npm test` — Vitest (filter to one component with `npm test -- <name>`,
  e.g. `npm test -- button`)
- `npm run typecheck` — tsc --noEmit (repo-wide; no per-component variant)
- `npm run lint` — ESLint (`eslint.config.mjs`); TypeScript, React Hooks
  rules, and `jsx-a11y` accessibility rules. Repo-wide; no per-component
  variant.
- `npm run build` — Style Dictionary token build
- `npm run generate:icons` — icon generation script
- `npm run generate:registry` — regenerates `docs/components/registry.json`
  from every component's `.contract.json`; re-run when a contract.json
  changes. Not wired into `npm run validate`/CI, same as `generate:icons`.
- `npm run generate:exemplars` — regenerates `docs/components/exemplars.json`
  from every component's `.examples.json`; re-run when an examples.json
  changes. Not wired into `npm run validate`/CI, same as `generate:icons`.

## Notes

- This file should be updated as new architectural decisions get made (new
  component tiers, new shared patterns like Focus Ring, changes to token
  rules) — treat it as living documentation, not a one-time snapshot.
