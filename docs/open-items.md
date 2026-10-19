# Open items

What's still to decide or do after the Storybook docs work on `storybook-documentation`
(Oct 2026). Remove an item once it's settled, and record the decision where its rule lives.

**Issues with one component are its `knownIssues`**, in its `contract.json`: they hold it below
Stable, and show on its Docs page and on Introduction / Status, which lists them all. This file
keeps what isn't about one component. Some of that is tracked next to its rules too:

- `docs/foundations/token-governance.json`: each family's `openFindings` (dimensions, elevation,
  motion, icons), e.g. raw row heights and panel widths, the Figma icon reconciliation.
- `docs/foundations/component-api-governance.json`: each rule's `knownViolations`, e.g. the
  Button family's legacy `appearance`, Tag's color `tone`, Split Button's `tone`, mixed
  left/right vs start/end alignment, `removeAriaLabel`, labels still in English.
- `docs/foundations/component-registry-governance.json` and
  `docs/foundations/component-exemplars-governance.json`: content gaps and the exemplar backlog.

## Plan (agreed order)

1. Sidebar IA: done.
2. Introduction / Overview: done.
3. Foundations (Color, Typography, Spacing, Radius, Elevation, Motion, Icons): done.
4. Component Docs page standard: done, for all 56 components.
5. Patterns: done. Messages and Feedback (the reference page), Forms and Validation, Loading and
   Empty States, Collections.
6. Templates: drafts of Document Generation and Roadmap, built ahead of their designs. Revise
   them against the designs when those are done; each page lists its assumptions under Open
   questions.
7. Status: done. Draft, Beta, Stable, Deprecated, authored in each contract and checked against the
   evidence (componentStatus in component-registry-governance.json). 15 Stable, 43 Beta.
8. **Next: every held item at once**: the known issues on Introduction / Status, and this file.

## Figma (publish and check)

- Publish **Tokens v1.0.0**: the variable and style renames, the Heading/XXL rebind, the style
  descriptions, and `spacing/075`.
- Publish **Components v1.0.0**: the vocabulary renames (tone, context, information, inverse,
  taupe, round, Modal Dialog sm–xl).
- The Figma checks and token requests that belong to one component (Table's header fill, Field's
  status icon, the focus-ring offset and inverse ring, Toast's loading title, Progress Indicator's
  inverse dot, Skeleton's fill, the icon reconciliation, the "more" icon) are those components'
  known issues.

## Across components

- Controls inside a plain `<fieldset disabled>` don't look disabled.
- Nothing gives focus a place to go when the control someone used unmounts (a removed chip, a
  row that leaves the filtered view); Collections and Roadmap handle it locally.

## Docs tooling

- Union prop types leave the generated API table empty (Chip and Select list theirs by hand; both
  carry it as a known issue). Fix with react-docgen-typescript, or a PropsTable that merges a
  union's members.
- The Anatomy block can't outline portalled or fixed overlays (Popup, Tooltip, Modal Dialog,
  Toast Group).
- **Code samples lose their indent on 51 component Docs pages** (180 samples): MDX strips two
  spaces from every line of a multi-line string in a JSX attribute (`code={`...`}`). The pattern
  pages write them as MDX exports instead, and their test enforces it; the component pages need
  the same change (scriptable), plus the rule in component-pages.test.ts. Empty State's page
  compensates with extra spaces, which an export would double.
- Pattern blocks: "Components used" identifies components by folder, so Rich Text Area (in
  `molecules/text-area`) would show as Text Area; `ToneMatrix` reads only string values (no table
  of which controls take the boolean `invalid`) and only the first declaration of a prop, so it
  can't read Chip's `mode` from its union of prop types.
- Storybook's Dark toolbar themes only a wrapper, so portalled overlays render light in dark mode.
  With the OS in dark mode, the canvas body is transparent and takes the browser's dark color while
  the tokens stay light, so a story's own text reads dark on dark.
- Only one Toast Group can mount per docs page, so a story's toasts show only when the story that
  mounts it is on the page (Document Generation's failure story, viewed alone).
- Template screens start their headings at `h3` so they sit inside the docs outline; the product's
  own levels are stated in prose only. The blocks have no way to set a base level.

## Housekeeping

- The stale `.claude/worktrees` folder breaks `npm run validate` at lint. Until it's removed, lint
  with `npx eslint . --ignore-pattern ".claude/**"`.
- `packages/ui/src/components/atoms/button/button-case-study.stories.tsx` is a temporary, untracked
  portfolio capture. Delete it once the Button Docs page replaces it.
- 61 deprecated CSS aliases and the `@deprecated` prop aliases stay until the LegacyHQ app has
  been searched for their use.
