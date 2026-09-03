# Empty State - Generation Prompt

This is the prompt used to originally generate the Empty State organism. Kept as a historical record
of the intent; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral
changes rather than this file.

## Task

Build an `EmptyState` organism for the LegacyHQ design system, matching the Figma `empty-state`
component set (`Components v1.0.0`, node `3546:56720`).

## What it is

A centered content block shown when a view has no content yet: an optional illustration, an optional
heading, a required description, and optional actions, on either a transparent (`inherited`) or a
sunken-surface (`informative`) background.

## Requirements

- Tier: organism. Files follow the repo convention: `empty-state.tsx`, `EmptyState.stories.tsx`,
  `EmptyState.test.tsx`, `empty-state.module.css`, `empty-state.types.ts`, `empty-state.mdx`,
  `index.ts`.
- Styling: CSS Modules + semantic design tokens only. No MUI, no Tailwind, no hardcoded
  colors/typography/spacing. Passes `npm run lint:css`.
- Use `React.forwardRef` (to the root `div`) and `React.memo`.

### Props

```ts
type EmptyStateType = 'inherited' | 'informative';

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  type?: EmptyStateType;          // default 'inherited'
  illustration?: React.ReactNode; // optional ~80x80 slot
  heading?: React.ReactNode;      // optional, heading-md
  children: React.ReactNode;      // description; body-md; required
  actions?: React.ReactNode;      // optional Buttons / Link
}
```

### Type mapping (from Figma)

- inherited (default): transparent, blends into the surface beneath.
- informative: fills `color-elevation-surface-sunken-default`.

The Figma `inherited` variant had no content built (WIP); render the same centered content for both
types.

### Layout tokens (from Figma bound variables)

padding `--spacing-xl`, root gap `--spacing-2xl` (illustration ↔ message), message gap `--spacing-lg`
(heading ↔ description ↔ actions), actions gap `--spacing-sm`, heading `heading-md`, description
`body-md`, content color `--color-content-default`. All content centered.

### Behavior

- Centered vertical stack; render illustration/heading/actions only when provided; always render the
  description.
- Sunken background only for `type=informative`.
- No default `role` (plain content, not a live region).

## Deliverables

Component files + the full doc set (`empty-state.md`, `-spec.md`, `-checklist.md`, `.contract.json`,
`.examples.json`), a Storybook `empty-state.mdx`, an entry under the Organisms heading of `llms.txt`,
and regenerated `registry.json` / `exemplars.json`.
