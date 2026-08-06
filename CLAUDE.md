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
  components/{primitives,atoms,molecules}/<component>/
    <component>.md             # usage doc: when to use, design intent,
                                # a11y expectations, implementation constraints
    <component>-spec.md        # detailed spec
    <component>-prompt.md      # prompt used to originally generate the component
    <component>-checklist.md   # QA / completion checklist
    <component>.contract.json  # machine-readable prop/anatomy contract
    <component>.examples.json  # usage examples
```

Component source files follow: `component-name.tsx`,
`ComponentName.stories.tsx`, `ComponentName.test.tsx` (lowercase-hyphen for
the implementation file, PascalCase for stories/tests).

## Token architecture (three tiers — this is load-bearing)

From `docs/foundations/token-governance.json`:

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
  and Radio already follow this. Button and IconButton currently use
  `isDisabled` — documented as known drift, to be migrated when next touched.
- Reserve the `is*` prefix (`isLoading`, `isFullWidth`, `isExpanded`) for
  state with no native HTML equivalent — not for anything a native attribute
  already covers.

Check that file before introducing a new prop name pattern.

## When building/editing a component

1. Check if `docs/components/<tier>/<name>/` already exists — the `.md`,
   `-spec.md`, and `.contract.json` are the source of truth for intended
   behavior, not just documentation to update after the fact.
2. Cross-check `token-governance.json` before adding any new token.
3. Update all four docs (`*.md`, `*-spec.md`, `*-checklist.md`,
   `*.contract.json`/`*.examples.json` as applicable) alongside code changes
   — they're expected to stay in sync, not just describe v1.
4. Add/update `.stories.tsx` and `.test.tsx` alongside the component.

## Commands

- `npm run validate` — the one command to run after touching a component;
  runs `typecheck`, then `lint`, then `test`. Run this before considering a
  change done. Also runs in CI (`.github/workflows/validate.yml`) on every
  push/PR.
- `npm run storybook` — dev Storybook on port 6006
- `npm test` — Vitest (filter to one component with `npm test -- <name>`,
  e.g. `npm test -- button`)
- `npm run typecheck` — tsc --noEmit (repo-wide; no per-component variant)
- `npm run lint` — ESLint (`eslint.config.mjs`); TypeScript, React Hooks
  rules, and `jsx-a11y` accessibility rules. Repo-wide; no per-component
  variant.
- `npm run build` — Style Dictionary token build
- `npm run generate:icons` — icon generation script

## Notes

- This file should be updated as new architectural decisions get made (new
  component tiers, new shared patterns like Focus Ring, changes to token
  rules) — treat it as living documentation, not a one-time snapshot.
