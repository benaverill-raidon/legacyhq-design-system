# LegacyHQ Design System

Context for working in this repo. Read this before making changes so you don't
have to rediscover conventions from scratch each session.

## What this is

A React component library / design system for LegacyHQ, built with design
tokens (Style Dictionary), CSS Modules, Storybook, and Vitest.

## Repo layout

```
packages/ui/src/components/
  primitives/   # logo, focus-ring, icon, popup — lowest-level building blocks
  atoms/        # button, badge, checkbox, switch, slider, avatar, link,
                # tag, tooltip, radio, progress-bar, spinner, label, ...
  molecules/    # composed from atoms/primitives (documented exceptions:
                # tag-group, avatar-group, split-button, chip, and select also
                # compose the dropdown-menu organism — see each one's own "Tier
                # exception" note; inline-edit composes the button-group molecule
                # for its confirm/cancel action row)
  organisms/    # composed from molecules/atoms/primitives — larger, more
                # complete UI sections (menu, dropdown-menu, ...)

packages/ui/src/storybook/   # Storybook-only docs; never exported as components
  pages/        # docs pages that aren't one component's docs (Introduction/
                # Overview, ...): MDX with <Meta title="..." />, page-local
                # components and CSS Modules beside it
  blocks/       # docs building blocks shared across pages: DocLink (internal
                # links by sidebar title, checked by doc-link.test.ts),
                # doc-page (page rhythm + type scale as `doc` classes, header,
                # numbered sections, subsections, token-name anatomy,
                # "used by" lists, definition rows, token tables, footer
                # note, Code),
                # doc-helpers (pure copy + "which components use X" helpers,
                # testable), css-usage (pure: which token each component
                # uses for which property, following custom properties to
                # where they're consumed) and component-css (Vite-only raw component CSS for
                # those lookups), and component-page (the component Docs page
                # standard; see "Component Docs pages" below). Extract here only
                # once a second page needs it.

docs/
  foundations/token-governance.json   # token architecture rules (see below)
  foundations/component-registry-governance.json  # registry.json normalization rules
  foundations/component-registry.schema.json       # shape of registry.json
  foundations/component-exemplars-governance.json  # exemplars.json normalization rules
  foundations/component-exemplars.schema.json      # shape of exemplars.json
  foundations/design-code-mapping-governance.json  # figmaSource shapes + verification method
  components/registry.json    # generated, normalized cross-component index (see below)
  components/exemplars.json   # generated, normalized cross-component exemplar index
  components/{primitives,atoms,molecules,organisms}/<component>/
    <component>.md             # usage doc: when to use, design intent,
                                # a11y expectations, implementation constraints;
                                # a pointer to the MDX Docs page once the
                                # component is on the page standard
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

## Tier vs. category (two separate dimensions)

Every component is classified twice, and the two must not be conflated:

- **`tier`** = compositional complexity (`primitive`, `atom`, `molecule`,
  `organism`). Derived from the folder; drives file layout, composition
  rules, and the `llms.txt` headings.
- **`category`** = functional/documentation grouping (`actions`, `forms`,
  `feedback`, `navigation`, `data-display`, `overlays`, `foundations`).
  Authored as `category` in `.contract.json`; required — registry
  generation fails if it's missing or invalid. The authoritative list of
  values is the `category` enum in
  `docs/foundations/component-registry.schema.json`; the list above is for
  orientation only.

Classify by the job the component does, not its looks or tier — e.g.
progress toward completion → `feedback` (Progress Bar); position within a
sequence → `navigation` (Progress Indicator, Progress Tracker). The full
rules, category definitions, and recorded edge cases live in the
`classification` block of
`docs/foundations/component-registry-governance.json`; there is
deliberately no `layout` category yet (Card stays in `data-display`).

The Storybook sidebar groups by category, not tier: a component's story
title is `Components/<Group label>/<Display name>` (e.g.
`Components/Data Display/Key Value Pair`), or `Foundations/<Display name>`
for `foundations` components. Group labels and order, and display-name
exceptions (`displayNameOverrides`, e.g. Icon → Icons), live in
`classification.storybook` in the governance file.
`packages/ui/src/components/component-taxonomy.test.ts` (part of
`npm test`) fails if a contract's category is missing or invalid, a story
title disagrees with it, an unknown group or old `UI/` title appears, or
the governance labels / `storySort` order drift from the schema.

`foundations` is a category for component-like system assets (Icon, Focus
Ring, Logo). The Foundations *documentation* is broader — it also covers
Color, Typography, Spacing, Radius, Elevation, and Motion, which aren't
components and aren't in the registry — so filtering `registry.json` by
`category: foundations` is not an index of the foundations docs.

## Context routing

Don't read all 6 doc files for every component task — Button's full set alone
is ~1360 lines. Match the file(s) to your task shape:

| Task shape | Read | Skip (for now) |
|---|---|---|
| Orienting on an untouched component | `.md` (or the `.mdx` Docs page it points to) | everything else |
| Adding/changing a prop | `.contract.json`, relevant section of `-spec.md` | `-prompt.md`, `-checklist.md` |
| Styling/token-only change | `.md`, `token-governance.json` | `-prompt.md`, `-checklist.md` |
| New variant / new anatomy part | `.md`, `-spec.md`, `.contract.json`, `.examples.json` | `-prompt.md` |
| Final QA / before `npm run validate` | `-checklist.md` | — |
| Regenerating a component from scratch | `-prompt.md` | — |
| Structural query across many components (e.g. "which components support a `tone` prop") | `docs/components/registry.json` | individual `.contract.json` files |
| Trace a component back to its Figma source | `figmaSource` in the component's `.contract.json` or `registry.json` | — |
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
of 34 components are `thin` (no anti-pattern examples, no per-example props
map yet). See `docs/foundations/component-exemplars-governance.json` for the
completeness backlog and the quality bar for filling one in.

Every component's `.contract.json` carries a `figmaSource` block linking it
to its real Figma component (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components
v1.0.0") — verified live against Figma, not invented. `registry.json` passes
this through unchanged. See
`docs/foundations/design-code-mapping-governance.json` for the four
`figmaSource` shapes (simple/multi-variant/sub-component/no-node-exception),
why Figma verification can't be enforced in CI, and the depth backlog (new
entries are pointer-level; the 7 original molecule entries have deeper
design-deviation notes).

## Token architecture (three tiers — this is load-bearing)

Token source uses standard DTCG types; CSS compatibility recipes live separately
from the token data. See [`docs/foundations/token-format.md`](docs/foundations/token-format.md)
for types, reference handling, migration evidence, and the manual Figma-export
conversion step. `npm run tokens:check` and `npm run test:tokens` run in `validate`.

From `docs/foundations/token-governance.json`. Two of the rules below are
enforced mechanically, not just by convention or review: "no raw values" by
`npm run lint:css` (stylelint), and "components must never consume primitives
directly" — for color only — by
`packages/ui/src/components/component-color-tokens.test.ts` (part of
`npm test`). Stylelint can't distinguish primitive from semantic `var()`s, and
other primitive types aren't checked (no component CSS uses a primitive
dimension token today, but nothing enforces it). See the `enforcement`
block in that file and the Commands section below.

1. **Primitive** — raw values only, no intent. `color.blue.500`,
   `spacing.4`. **Components must never consume these directly.**
2. **Semantic** — the primary layer components should consume. Represents
   intent/meaning. `color.background.brand`, `color.text.primary`. Maps to
   primitives.
3. **Component** — exceptions only, not defaults. `button.primary.background`.
   Should alias semantic tokens. Only create one when a component needs
   independent theming/control that the semantic layer can't express.
   Exception: a dimension token for geometry unique to one component (Switch
   thumb travel, Slider handle) may alias the `measurement-*` primitives;
   component CSS still never does.

**Dimensions: choose by job, not by number.** Spacing (`spacing-*`, negative
`overlap-*`) is distance between, inside, or relative to elements when it
expresses layout relationship: padding, gap, margin, layout inset. Sizing
(`size-*` families) is the dimensions of elements. Focus-ring offsets, motion
travel, strokes, shadows, and type metrics aren't spacing, even though they're
lengths. 16px of padding is `--spacing-lg`; a 16px-tall element is `--size-200`.
Not every raw length needs a token. The rules are in the `dimensions` block of
token-governance.json, with open findings; Storybook's Foundations / Spacing
page documents them for people.

**Strokes: border-width tokens set thickness whatever draws the stroke** —
border, outline, inset/outset shadow, divider, indicator, or SVG stroke. An
unblurred shadow is a stroke; a blurred one is elevation. A stroke that
thickens with state without moving content (field focus/invalid) is an inset
shadow of `calc(var(--border-width-md) - var(--border-width-sm))` inside the
resting border. Radius tokens are for corners only. See Foundations / Radius
and the `shape` family in token-governance.json.

**Elevation: surface color for depth, one shadow for floating.** Surface color
(`color-elevation-surface-*`) expresses depth within the page; raised surfaces
keep their border and cast no shadow. Anything that floats above the interface
uses `--elevation-shadow-overlay` (a DTCG shadow composite, themed) — never a
shadow rebuilt from `color-elevation-shadow-*`. z-index is separate and not
tokenized. See Foundations / Elevation and the `elevation` block in
token-governance.json.

**Motion: recipes, never primitives.** Components use the recipe tokens:
`fade-*` (standard curve, no overshoot) for visual state changes, including
indicators that turn or grow and progress; `move-*` (spring) for physical
movement; `spin-loop`/`pulse-loop` for loops. `quick` is 150ms, `long` 300ms.
Never use `duration-*`/`ease-*` directly, and never put a timing function after
a recipe (the declaration becomes invalid and is dropped). Dense, direct hover
feedback (menu/table rows, links) may be instant. Overlays enter with
`fade-quick`; extra choreography is local keyframes, and travel distance is
component geometry. Every moving selector is switched off in a
`prefers-reduced-motion: reduce` block (list the exact selectors: a media query
adds no specificity) or added only under `no-preference`. Motion is code-only:
Figma has no motion variables. See Foundations / Motion and the `motion` block
in token-governance.json.

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
  neutral/warning/error) are independent props. This avoids a
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
  medium icon size regardless of button size) — no `iconSize` prop. `md` is
  the default; `sm` is for dense contexts only. Icons inherit `currentColor`
  by default, so they follow their text and its states; pass a named `color`
  only when the icon means something its text doesn't. Icons are decorative
  unless labelled: a status icon needs hidden text (Banner, Section Message,
  Toast), and an icon-only control names the control. Rules and the open
  Figma/code differences are in the `icons` block of token-governance.json;
  Storybook's Foundations / Icons page documents them for people.
- **Loading/busy states hold the control's size.** The spinner sits centered
  over the content; the label and icons keep their space (hidden with
  opacity, so the label stays the accessible name), and `aria-busy` marks it.
  Never swap the label for a different-width message. Button and Link Button
  do this, and Split Button inherits it.

## Component API conventions

Cross-cutting prop-naming rules live in
`docs/foundations/component-api-governance.json` (same style as
token-governance.json). Current rules:

- Use native `disabled`, not a custom `isDisabled` boolean. Checkbox, Switch,
  Radio, Button, and IconButton all follow this.
- Reserve the `is*` prefix (`isLoading`, `isFullWidth`, `isExpanded`) for
  state with no native HTML equivalent — not for anything a native attribute
  already covers.
- `tone` is meaning, `appearance` is visual style, and `context` is where a
  component is shown (`default` | `inline`). Never give one axis two names.
- One name per value everywhere (code, tokens, Figma): `information`, not
  `info`; `sm`/`md`/`lg`, not `small`/`medium`; `inverse`, not `inverted`;
  `round`, not `circle`; `taupe`, not `gray`.
- Text a component writes itself is a prop with an English default, for
  translation: `<thing>Label` for a string, `get<Thing>Label` for text built
  from values.
- A renamed prop or value stays accepted as a `@deprecated` alias, mapped
  inside the component, because the LegacyHQ app can't be searched from here.

Check that file before introducing a new prop name pattern.

## Component Docs pages

Each component's Storybook Docs page is `<component>.mdx` beside it, written
to one standard with the blocks in `storybook/blocks/component-page.tsx`, in
the Foundations look. Button is the reference page. Sections, in order: When
to use, Anatomy, Variants (optional), Behavior (optional), Do and don't,
Accessibility, API, Design tokens, Related components.

- **Prose is written in the MDX; facts are generated.** The API table reads
  the TypeScript props and their JSDoc through Storybook's docgen, so every
  member of `<Name>Props` needs a description comment (`@deprecated` ones are
  listed separately). The tokens table reads the component's CSS module. The
  header's facts (category, tier, Figma source) come from registry.json.
  Status isn't shown yet.
- **Live examples are stories** (`<Example of={...}>`); Do/Don't pairs render
  real components with the code beneath. Anatomy numbers parts found by their
  CSS-module classes, named as in the contract.
- `component-pages.test.ts` (part of `npm test`) checks every converted page:
  section order, required sections, its own component id, the anatomy part
  names against the contract, and JSDoc on every prop. Once a page is
  converted, its `.md` becomes a pointer to the MDX.

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
   heading in `llms.txt`, set its `category` in `.contract.json`, and give
   its story the matching `Components/<Group label>/<Name>` title (see
   "Tier vs. category" above — the taxonomy test enforces it).

## Commands

- `npm run validate` — the one command to run after touching a component;
  checks token data/CSS compatibility, then runs `typecheck`, `lint`, `lint:css`, and `test`. Run this before
  considering a change done. Also runs in CI (`.github/workflows/validate.yml`)
  on every pull request and push to master.
- `npm run lint:css` — stylelint over `packages/ui/src/{components,storybook}/**/*.module.css`
  (Storybook docs pages follow the same token rules as components).
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
