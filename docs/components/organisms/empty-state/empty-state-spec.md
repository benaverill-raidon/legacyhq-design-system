# Empty State - Specification

## Overview

Empty State is a centered, vertical content block shown when a view has no content yet. It belongs to
the organism tier and, in typical usage, composes the Button / Button Group and Link atoms in its
actions slot.

## Anatomy

1. **Root** - a `div` laid out as a centered vertical column. `appearance=informative` fills a
   sunken surface panel; `appearance=inherited` is transparent.
2. **Illustration** - an optional centered spot illustration or image (~80x80 in the reference
   design), above the message.
3. **Message** - a centered vertical column:
   - **Heading** - optional bold line (`heading-md`, default content color), rendered as an `h1`-`h6`
     at `headingLevel` (default `h2`) with its margins reset.
   - **Description** - the `children` (`body-md`, default content color).
   - **Actions** - optional Buttons and/or a Link, centered.

## Public API

```ts
export type EmptyStateAppearance = 'inherited' | 'informative';
/** @deprecated Renamed to `EmptyStateAppearance`. */
export type EmptyStateType = EmptyStateAppearance;
export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: EmptyStateAppearance;
  /** @deprecated Renamed to `appearance`. Still accepted. */
  type?: EmptyStateAppearance;
  illustration?: React.ReactNode;
  heading?: React.ReactNode;
  headingLevel?: EmptyStateHeadingLevel; // default 2
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

## Default Props

```txt
appearance = 'inherited'
headingLevel = 2
```

## Variants

`appearance` sets the background treatment (Figma names the property `type`; the code's `type` prop
is a deprecated alias for `appearance`, mapped inside the component, with `appearance` winning when
both are set). The Figma `inherited` variant had no content built (WIP); code renders the same
centered content for both appearances.

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
- Fill the sunken surface background only for `appearance=informative`.
- Let long headings and descriptions wrap symmetrically.

## Accessibility

- No default `role` - Empty State is plain content, not a live region.
- When swapped in dynamically, the surrounding region should announce the change (`role="status"` or
  `aria-live`).
- The heading renders as a real heading element, `h${headingLevel}` (`h2` by default), so it's in
  the page's heading outline. The `heading-md` styles replace the user agent's heading size and
  weight and its margins are reset, so every level looks the same. Pass text or inline content as
  `heading`, not another heading element.
- The illustration is not hidden by Empty State; a decorative one must hide itself (Icon Tile does
  by default; images need `alt=""`).

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
renders the heading as a real heading, at level 2 by default
renders the heading at headingLevel
renders the heading when provided and omits it otherwise
renders the illustration when provided and omits it otherwise
renders actions when provided and omits the region otherwise
defaults to the inherited (transparent) appearance
applies the informative appearance
still accepts the deprecated type prop, with appearance taking precedence
composes a custom className and forwards props
forwards the ref to the root element
CSS contract: heading margins reset, informative sunken background (root stays transparent), centered stack + spacing tokens, heading-md / body-md
```
