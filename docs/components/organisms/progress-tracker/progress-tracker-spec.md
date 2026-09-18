# Progress Tracker - Specification

## Overview

Progress Tracker is a segmented, labelled progress bar for a linear multi-step journey. It belongs to
the organism tier and composes the `Link` atom (which brings the shared Focus Ring) for navigable
step labels.

## Anatomy

1. **Root** - a `nav` (`aria-label`/`aria-labelledby`, `data-size`, `data-disabled`) laid out as a
   column: the track, then the step list.
2. **Track** - a `div[aria-hidden]` full-round pill (a `sunken` surface with a `border/bold`
   outline). `data-fill` carries the fill percentage.
3. **Fill** - a `div`, `currentStep / totalSteps` wide, `background/brand/primary/bold`, with
   full-round caps. Width comes from the `--progress-tracker-fill` custom property.
4. **Steps** - an `ol` of `li`; one label per step, centred under its portion of the bar.
5. **Label** - the current step is a `span` (`aria-current="step"`, `content/selected`); a visited
   step with an `href` is a `Link` (subtle); otherwise a `span` (`content/subtle`, or
   `content/disabled` when disabled). The visited-step `Link` is restyled to the `<items>` states: no
   `:visited` (purple) colour, and hover changes colour only (`content/subtle` -> `content/default`)
   with no underline.

## Public API

```ts
export type ProgressTrackerSize = 'md' | 'lg';

export interface ProgressTrackerStep {
  label: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
}

export interface ProgressTrackerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  steps: ProgressTrackerStep[];
  currentStep: number;
  size?: ProgressTrackerSize;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
```

## Default Props

```txt
size = 'md'
disabled = false
aria-label = 'Progress'
```

## Variants

`size` sets the bar thickness only; the label typography stays `heading-xs`.

- **md** - a `--size-marker-md` (12px) fill inset by `--spacing-xxs` (2px).
- **lg** - a `--size-300` (24px) fill inset by `--spacing-xs` (4px).

## Step states

- **visited** (before current): `content/subtle` label; a `Link` when it has an `href`. On hover the
  colour changes to `content/default` (no underline); there is no `:visited` colour.
- **current**: `content/selected` label, `aria-current="step"`, never a link; the last filled step.
- **upcoming** (after current): `content/subtle` label, non-interactive.
- **disabled** (whole tracker or a single step): `content/disabled` label, never a link. A disabled
  tracker also greys the fill to `background/disabled` and switches the track border to
  `border/disabled` so the state stands out.

## Layout and tokens

- root gap (bar to labels): `--spacing-sm`
- track: background `--color-elevation-surface-sunken-default`, border `--border-width-sm`
  `--color-border-bold` (disabled: `--color-border-disabled`), radius `--border-radius-full-round`,
  padding = the size inset
- fill: background `--color-background-brand-primary-bold-default` (disabled:
  `--color-background-disabled`), radius `--border-radius-full-round`, width
  `var(--progress-tracker-fill)`, transition `--fade-quick`
- label: `heading-xs`; colors `content/subtle` (default), `content/default` (visited hover),
  `content/selected` (current), `content/disabled` (disabled)

## Behavior

- Render one step per `steps[]` entry inside an ordered list.
- Clamp `currentStep` to `1..steps.length`; fill the track to `currentStep / totalSteps`.
- Mark the current step `aria-current="step"`.
- Render a step as a `Link` only when it is visited, has an `href`, and is not disabled; restyle it to
  the `<items>` states (no `:visited` colour; hover changes colour only, no underline).
- `disabled` greys the fill, switches the track border to `border/disabled`, mutes every label, and
  removes all links.

## Accessibility

- The root is a `<nav>`; label it (`aria-label`, default `"Progress"`, or `aria-labelledby`).
- Steps are an `<ol>`/`<li>`; the current step carries `aria-current="step"`.
- The bar is decorative (`aria-hidden`); navigable steps use the shared Focus Ring via `Link`.

## Storybook

- Playground
- Sizes (md vs lg)
- Progress (first / in progress / complete)
- Disabled (whole tracker, single step)

## Tests

```txt
renders a labelled nav with an ordered list of steps
defaults the accessible name to "Progress"
marks the current step with aria-current="step"
renders visited steps with an href as links; current + upcoming are not links
fires a navigable step onClick
clamps currentStep into range
sets the fill to currentStep / totalSteps
applies the size on the root
disabled: no links + data-disabled on the root
does not render a disabled step as a link even when visited with an href
CSS contract: track (sunken + border-bold + full-round) and fill (brand token, width var); disabled fill + disabled track border; heading-xs labels + selected current; Link restyle (no :visited, hover colour-only + no underline)
```
