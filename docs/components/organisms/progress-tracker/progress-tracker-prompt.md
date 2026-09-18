# Progress Tracker - Generation Prompt

This is the prompt used to originally generate the Progress Tracker organism. Kept as a historical
record; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes
rather than this file.

## Task

Build a `ProgressTracker` organism for the LegacyHQ design system, matching the Figma
`progress-tracker` component set (`Components v1.0.0`, node `2201:50436`) and its `<items>` part
(node `2184:38493`).

## What it is

A segmented, labelled progress bar for a linear multi-step journey: a full-round pill track that fills
to the current step, with a label under each step. The current step is highlighted; visited steps can
be links back.

## Requirements

- Tier: organism. Files: `progress-tracker.tsx`, `progress-tracker.types.ts`,
  `progress-tracker.module.css`, `ProgressTracker.stories.tsx`, `ProgressTracker.test.tsx`,
  `progress-tracker.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` on the root `nav`. Compose the `Link` atom (which brings the shared Focus Ring)
  for navigable step labels.

### Props

```ts
type ProgressTrackerSize = 'md' | 'lg';

interface ProgressTrackerStep {
  label: React.ReactNode;
  href?: string;                 // visited step -> Link
  target?: React.HTMLAttributeAnchorTarget;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
}

interface ProgressTrackerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  steps: ProgressTrackerStep[];
  currentStep: number;           // 1-based; clamped to 1..steps.length
  size?: ProgressTrackerSize;    // default 'md' (bar thickness only)
  disabled?: boolean;            // default false
  'aria-label'?: string;         // default 'Progress'
  'aria-labelledby'?: string;
}
```

### Style mapping (from Figma)

- track: `elevation/surface/sunken/default` fill, `border/bold` outline (`border/width/sm`),
  `border/radius/full-round`; inset padding `spacing/xxs` (md) / `spacing/xs` (lg).
- fill: `background/brand/primary/bold/default`, full-round caps, width `currentStep / totalSteps`;
  greyed to `background/disabled` when disabled, with the track border switched to `border/disabled`
  so the disabled state stands out.
- label: the `link` atom (appearance=subtle, size=md in both tracker sizes) -> `heading-xs`;
  `content/subtle` default, `content/selected` for the current step, `content/disabled` when disabled.
  Restyle the `link` to the `<items>` states: no `:visited` (purple) colour, and hover changes colour
  only (`content/subtle` -> `content/default`) with no underline.
- bar thickness: md fill `size-marker-md` (12px), lg fill `size-300` (24px).
- The Figma builds the bar from per-step segments with per-edge borders (start=top/bottom/left,
  middle=top/bottom, end=top/bottom/right) so they read as one continuous pill; in code this is a
  single track + single fill.

### Behavior

- Render one step per `steps[]` entry inside an `<ol>`; clamp `currentStep`; fill to
  `currentStep / totalSteps`.
- Mark the current step `aria-current="step"`; it is never a link.
- Only visited (past) steps with an `href` (and not disabled) render as links - matching Figma, where
  hover/focus states exist only for `isActive=false, hasVisited=true`.
- `disabled` greys the fill, switches the track border to `border/disabled`, mutes every label, and
  removes links.

## Deliverables

Component files + the full doc set + `progress-tracker.mdx`, an entry under Organisms in `llms.txt`,
and regenerated `registry.json` / `exemplars.json`.
