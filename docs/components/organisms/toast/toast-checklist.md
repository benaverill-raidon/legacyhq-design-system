# Toast - Completion Checklist

## Component name

Toast

## Description

A raised, transient notification card: a leading status tile (or spinner), a title, an optional
description and actions, and a dismiss button. Shown and stacked by Toast Group.

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] `appearance` (`default` | `success` | `info` | `warning` | `error` | `loading`) selects the
      leading Icon Tile tone, or a Spinner for `loading`.
- [ ] `expanded` controls whether the description and actions show (Figma `open`).
- [ ] Renders on a raised surface with a 1px border, radius-xl, and the overlay elevation shadow.
- [ ] Dismiss button shown by default; hidden with `isDismissible={false}`.
- [ ] Toasts are shown/stacked by Toast Group via `toast()`.

## Figma properties

```txt
appearance: default | success | error | warning | info | loading
open: false | true   (code: expanded)
title / description  (code: title / description)
```

## Code props

```ts
type ToastAppearance = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  appearance?: ToastAppearance;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  expanded?: boolean;
  isDismissible?: boolean;
  onDismiss?: () => void;
}
```

## Defaults

```txt
appearance: default
expanded: true
isDismissible: true
role: status
```

## Tokens

- [ ] inline-size 368px; padding/root-gap `--spacing-lg`; content/actions gap `--spacing-sm`.
- [ ] border `--border-width-sm` / `--color-border-default`; radius `--border-radius-xl`.
- [ ] surface `--color-elevation-surface-raised-default`; overlay elevation shadow tokens.
- [ ] title `heading-xs` / `--color-content-default`; description `body-md` / `--color-content-subtle`.
- [ ] per-appearance Icon Tile tones; spinner slot `--size-300`; dot `--size-marker-sm`.

## Accessibility

- [ ] `role="status"` by default; leading icon decorative; dismiss labelled.

## Examples to document

- [ ] Success with description
- [ ] Error with a retry action
- [ ] Loading (non-dismissible)
- [ ] Collapsed (title only)

## Tests

- [ ] Renders title; sets data-appearance.
- [ ] Icon Tile for non-loading, Spinner for loading.
- [ ] Description/actions only when expanded.
- [ ] Dismiss default + onDismiss; hidden when isDismissible false.
- [ ] Raised surface + radius-xl + 1px border + overlay shadow.
- [ ] Forwards the ref.
- [ ] Uses MUI: no. Uses Tailwind: no.
