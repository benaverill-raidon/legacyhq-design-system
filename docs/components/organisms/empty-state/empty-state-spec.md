# Empty State - Specification

## Overview

Empty State is a centered, vertical content block shown when a view has no content yet. It belongs to
the organism tier and, in typical usage, composes the Button / Button Group and Link atoms in its
actions slot.

## Anatomy

1. **Root** - a `div` laid out as a centered vertical column. `type=informative` fills a sunken
   surface panel; `type=inherited` is transparent.
2. **Illustration** - an optional centered spot illustration or image (~80x80 in the reference
   design), above the message.
3. **Message** - a centered vertical column:
   - **Heading** - optional bold line (`heading-md`, default content color).
   - **Description** - the `children` (`body-md`, default content color).
   - **Actions** - optional Buttons and/or a Link, centered.

## Public API

```ts
export type EmptyStateType = 'inherited' | 'informative';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  type?: EmptyStateType;
  illustration?: React.ReactNode;
  heading?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

## Default Props

```txt
type = 'inherited'
```

## Variants

`type` sets the background treatment. The Figma `inherited` variant had no content built (WIP); code
renders the same centered content for both types.

### Inherited (default)

- background: transparent (inherits the surface beneath).

### Informative

- background: `color-elevation-surface-sunken-default` (a sunken surface panel).

## Layout and tokens

- padding: `--spacing-xl` (20px)
- root gap (illustration ↔ message): `--spacing-2xl` (24px)
- message gap (heading ↔ description ↔ actions): `--spacing-lg` (16px)
- actions gap: `--spacing-sm`
- heading typography: `heading-md`
- description typography: `body-md`
- content color: `--color-content-default`

All content is centered (`align-items: center`, `text-align: center`).

## Behavior

- Render a centered vertical stack: optional illustration, then the message block.
- Render the illustration, heading, and actions only when provided; always render the description.
- Fill the sunken surface background only for `type=informative`.
- Let long headings and descriptions wrap symmetrically.

## Accessibility

- No default `role` - Empty State is plain content, not a live region.
- When swapped in dynamically, the surrounding region should announce the change (`role="status"` or
  `aria-live`).
- Pass a real heading element as `heading` when a document-outline heading is needed.

## Storybook

Documentation structure:

- Playground
- Types (inherited vs informative)
- Content (full, no illustration, description only, no actions)
- Edge Cases (long wrapping content, narrow container)

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders the description
renders the heading when provided and omits it otherwise
renders the illustration when provided and omits it otherwise
renders actions when provided and omits the region otherwise
defaults to the inherited (transparent) type
applies the informative type
composes a custom className and forwards props
forwards the ref to the root element
CSS contract: informative sunken background (root stays transparent), centered stack + spacing tokens, heading-md / body-md
```
