# Section Message - Generation Prompt

This is the prompt used to originally generate the Section Message organism. Kept as a historical
record of the intent; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for
behavioral changes rather than this file.

## Task

Build a `SectionMessage` organism for the LegacyHQ design system, matching the Figma `section-message`
component set (`Components v1.0.0`, node `2286:17082`).

## What it is

A bordered, rounded, in-context status panel: a status icon, an optional title, a description,
optional inline Link actions, and an optional dismiss button, on an appearance-tinted background with
a colored border.

## Requirements

- Tier: organism. Files follow the repo convention: `section-message.tsx`, `SectionMessage.stories.tsx`,
  `SectionMessage.test.tsx`, `section-message.module.css`, `section-message.types.ts`,
  `section-message.mdx`, `index.ts`.
- Styling: CSS Modules + semantic design tokens only. No MUI, no Tailwind, no hardcoded
  colors/typography/spacing. Passes `npm run lint:css`.
- Use `React.forwardRef` (to the root `div`) and `React.memo`.
- Compose the shared StatusIcon set, the Link atom (actions), and the Icon Button atom (dismiss).

### Props

```ts
type SectionMessageAppearance = 'information' | 'success' | 'warning' | 'error';

interface SectionMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  appearance?: SectionMessageAppearance; // default 'information'
  title?: React.ReactNode;               // omit to hide
  children: React.ReactNode;             // description; wraps
  actions?: React.ReactNode;             // Links; middots inserted
  isDismissible?: boolean;               // default false
  onDismiss?: () => void;
}
```

### Appearance mapping (from Figma bound variables)

Each appearance sets `background/{appearance}/subtle/default`, `border/{appearance}`, and the status
icon colored with `content/{appearance}`. The Figma `discovery` appearance was removed by the
designer and is not shipped.

### Layout tokens (from Figma bound variables)

padding `--spacing-lg`, root gap `--spacing-lg`, content gap `--spacing-sm`, actions gap
`--spacing-xs`, border `--border-width-sm`, radius `--border-radius-xl`, title `heading-sm`,
description `body-md`, separator `--color-content-subtle`.

### Behavior

- Background + border + status icon from `appearance`; the icon keeps its own status color.
- Title rendered only when provided; description wraps (no truncation).
- Actions are Links with an inserted middot between each; a single top-level fragment is unwrapped.
- Dismiss button only when `isDismissible`; on dismiss, hide the message and call `onDismiss`.
- `role="status"` by default, overridable; status icon `aria-hidden`; dismiss labelled "Dismiss".

## Deliverables

Component files + the full doc set (`section-message.md`, `-spec.md`, `-checklist.md`,
`.contract.json`, `.examples.json`), a Storybook `section-message.mdx`, an entry under the Organisms
heading of `llms.txt`, and regenerated `registry.json` / `exemplars.json`.
