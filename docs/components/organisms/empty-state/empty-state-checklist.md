# Empty State - Completion Checklist

## Component name

Empty State

## Description

A centered content block - optional illustration, heading, required description, optional actions -
shown when a view has no content yet. `inherited` (transparent) or `informative` (sunken surface).

## Status

Stable.

## Component tier

Organism.

## Design decisions

- [ ] `appearance` (`inherited` | `informative`) sets the background: transparent vs a sunken
      surface panel. `type` (Figma's name) stays accepted as a deprecated alias.
- [ ] The Figma `inherited` variant had no content built (WIP); code renders the same centered
      content for both appearances.
- [ ] Only the description (`children`) is required; illustration, heading, and actions are optional
      slots (mapping the Figma showIllustration/showHeading/showActions booleans).
- [ ] All content is centered; long headings/descriptions wrap symmetrically.
- [ ] Heading `heading-md`, description `body-md`, both default content color.
- [ ] No default `role` - it is plain content, not a live region.

## Figma properties

```txt
type: inherited | informative   (code: appearance; `type` is a deprecated alias)
showIllustration: true | false   (code: illustration slot)
showHeading: true | false        (code: heading slot)
showActions: true | false        (code: actions slot)
headingText / descriptionText    (code: heading / children)
```

## Code props

```ts
type EmptyStateAppearance = 'inherited' | 'informative';
type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: EmptyStateAppearance;
  /** @deprecated Renamed to `appearance`. */
  type?: EmptyStateAppearance;
  illustration?: React.ReactNode;
  heading?: React.ReactNode;
  headingLevel?: EmptyStateHeadingLevel;
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

## Defaults

```txt
appearance: inherited
headingLevel: 2
```

## Tokens

- [ ] padding `--spacing-xl`, root gap `--spacing-2xl`, message gap `--spacing-lg`, actions gap `--spacing-sm`.
- [ ] heading `heading-md`, description `body-md`, content color `--color-content-default`.
- [ ] informative background `--color-elevation-surface-sunken-default` (no primitives, no raw values).

## Visual and structural requirements

- [ ] Centered vertical stack; content wraps.
- [ ] Illustration / heading / actions rendered only when provided.
- [ ] Sunken background only for `informative`; `inherited` stays transparent.

## Accessibility

- [ ] No default role; document that a dynamic swap-in region should announce the change.
- [ ] The heading is a real `h1`-`h6` at `headingLevel` (default `h2`), margins reset, same look at
      every level.

## Examples to document

- [ ] Caught up (inherited)
- [ ] No results (informative, two actions)
- [ ] Description only
- [ ] First run with a primary action

## Tests

- [ ] Renders description; renders/omits heading, illustration, actions.
- [ ] Defaults to inherited; applies informative; the deprecated `type` still works.
- [ ] Heading is a real heading at level 2 by default and at `headingLevel`.
- [ ] Sunken background only for informative.
- [ ] Centered stack + spacing tokens; heading-md / body-md.
- [ ] Forwards the ref.
- [ ] Uses MUI: no. Uses Tailwind: no.
