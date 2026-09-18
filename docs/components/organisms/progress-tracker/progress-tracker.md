# Progress Tracker

## Purpose

Progress Tracker is an organism that shows where someone is in a linear, multi-step journey with
**named** steps. `ProgressTracker` renders a segmented, labelled progress bar from a `steps` array:
the bar fills to the current step and a label sits centred under each step, with the current step
highlighted.

## When to use

Use Progress Tracker for a guided, multi-step flow where both the relative position and each step's
name matter - matter setup, client onboarding, a checkout wizard.

## When not to use

Do not use it for relative position without labels; use the Progress Indicator (dots) atom. Do not
use it for determinate task or system percentage; use the Progress Bar atom. Do not use it to switch
between peer views; use Tabs. Do not use it for page or route navigation; use links or a navigation
component.

## Design intent

A full-round pill track (a `sunken` surface with a `border/bold` outline) is filled with the
`background/brand/primary/bold` colour up to and including the current step; the fill width is
`currentStep / totalSteps`. Each step has a label centred beneath the bar. The current step is
`content/selected` and is not a link (it reads as the active position); visited (past) steps default
to `content/subtle` and, when given an `href`, render as the `Link` atom so people can jump back;
upcoming steps are `content/subtle` and non-interactive. The visited-step links reuse `Link` but
follow the tracker's `<items>` states rather than Link's defaults: there is no `:visited` (purple)
colour, and hover changes colour only (`content/subtle` -> `content/default`) with no underline.

A `disabled` tracker greys the fill (`background/disabled`) and every label (`content/disabled`).
Because that grey is low-contrast on the sunken track, the track outline also switches to
`border/disabled` so the disabled state stands out.

Two `size`s change only the **bar thickness** (`md`: a `size-marker-md` fill; `lg`: a `size-300`
fill). The label typography stays `heading-xs` in both, matching the Figma component (its `link` part
is `size=md` in both sizes).

## Accessibility expectations

The tracker is a `<nav>` and must be labelled (`aria-label` or `aria-labelledby`); it defaults to
`"Progress"`. Steps are an ordered list (`<ol>`/`<li>`), and the current step is marked
`aria-current="step"`. Visited, navigable steps render as the `Link` atom and use the shared Focus
Ring. The bar itself is decorative (`aria-hidden`).

## Related components

- Progress Indicator
- Progress Bar
- Tabs
- Link
- Focus Ring
