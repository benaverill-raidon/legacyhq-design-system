# Progress Tracker - Completion Checklist

## Component name

ProgressTracker

## Description

A segmented, labelled progress bar for a linear multi-step journey: the bar fills to the current step
(`currentStep / totalSteps`) and a label sits under each step, with the current step highlighted and
visited steps optionally navigable.

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] Single full-round track (`sunken` surface, `border/bold` outline) + single fill
      (`background/brand/primary/bold`), width `currentStep / totalSteps`, full-round caps.
- [ ] Data-driven `steps` array; `currentStep` is 1-based and clamped to `1..steps.length`.
- [ ] Current step is `content/selected` + `aria-current="step"`, never a link (the active position).
- [ ] Visited (past) steps with an `href` render as the `Link` atom - jump back; current + upcoming
      are never links (mirrors Figma, where only visited items have hover/focus states).
- [ ] Visited-step `Link` is restyled to the `<items>` states: no `:visited` (purple) colour; hover
      changes colour only (`content/subtle` -> `content/default`) with no underline.
- [ ] Two `size`s change bar thickness only (md `size-marker-md` fill / `spacing-xxs` inset; lg
      `size-300` fill / `spacing-xs` inset); labels stay `heading-xs`.
- [ ] `disabled` greys the fill (`background/disabled`), switches the track border to
      `border/disabled` so it stands out, and mutes every label (`content/disabled`); a single step
      can be disabled on its own.

## Figma properties

```txt
progress-tracker container: size (md | lg)
<items> part: size (md | lg), isActive, hasVisited, isDisabled, state (default | hover | focus),
  section (start | middle | end)
```

## Code props

```ts
type ProgressTrackerSize = 'md' | 'lg';

interface ProgressTrackerStep {
  label: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
}

interface ProgressTrackerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  steps: ProgressTrackerStep[];
  currentStep: number;
  size?: ProgressTrackerSize;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
```

## Defaults

```txt
size: md
disabled: false
aria-label: Progress
```

## Tokens

- [ ] root gap `--spacing-sm`.
- [ ] track background `--color-elevation-surface-sunken-default`; border `--border-width-sm`
      `--color-border-bold`; radius `--border-radius-full-round`; padding = size inset (`--spacing-xxs`
      md / `--spacing-xs` lg).
- [ ] track border disabled `--color-border-disabled`.
- [ ] fill `--color-background-brand-primary-bold-default` (disabled `--color-background-disabled`);
      radius `--border-radius-full-round`; height `--size-marker-md` (md) / `--size-300` (lg);
      transition `--fade-quick`.
- [ ] label `heading-xs`; colors `content/subtle` (default), `content/default` (visited hover),
      `content/selected` (current), `content/disabled` (disabled).

## Accessibility

- [ ] `<nav>` labelled (aria-label default "Progress" / aria-labelledby).
- [ ] `<ol>`/`<li>` steps; current step `aria-current="step"`.
- [ ] bar `aria-hidden`; navigable steps use the shared Focus Ring via `Link`.

## Examples to document

- [ ] Named steps with a current position
- [ ] Visited steps as links
- [ ] Large (lg)
- [ ] Disabled

## Tests

- [ ] Labelled nav + ordered list; default name "Progress".
- [ ] Current step aria-current; visited+href are links, current/upcoming are not; onClick fires.
- [ ] currentStep clamped; fill = currentStep / totalSteps.
- [ ] Size on root; disabled removes links + data-disabled; per-step disabled not a link.
- [ ] CSS contract (track, fill token + width var, disabled fill + disabled track border, heading-xs
      + selected current, Link restyle: no :visited, hover colour-only + no underline).
- [ ] Uses MUI: no. Uses Tailwind: no.
