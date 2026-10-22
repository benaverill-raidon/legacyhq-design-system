# Slider Component Spec

## Overview

Slider is an atom family that lets users select numeric values from bounded ranges. It replaces the previous `Range` component naming.

The family includes:

- `Slider`: standard single-value slider.
- `SliderCentered`: single-value slider where the active fill starts from the center origin.
- `SliderRange`: two-handle slider for selecting a minimum and maximum value.

## Component Type

Atom family.

## Folder Location

```txt
packages/ui/src/components/atoms/slider/
```

## Required Files

```txt
slider.tsx
slider-centered.tsx
slider-range.tsx
slider.types.ts
slider.module.css
slider.test.tsx
slider.stories.tsx
index.ts
```

## Migration Requirement

Replace the previous `Range` component/docs with `Slider` naming.

Remove or update:

```txt
packages/ui/src/components/atoms/range/
range-checklist.md
range-spec.md
range-prompt.md
range exports
range stories
range tests
```

Do not keep a `Range` public export unless explicitly required by the project for temporary backwards compatibility.

## Anatomy

```txt
Slider
├─ root
├─ label optional
├─ control
├─ native input[type="range"]
├─ track
├─ active track
├─ inactive track
├─ handle
├─ stops optional
└─ value indicator optional
```

Figma parts are internal anatomy only:

```txt
handle
track-stop
inactive-track-left
inactive-track-right
active-track
value-indicator
```

Do not export these as public components.

## Shared Architecture

All slider variants must share the same base anatomy, token mapping, sizing model, orientation behavior, and state model.

`SliderCentered` should not be a separate visual system. Its only meaningful difference is fill calculation from the center origin.

`SliderRange` should share the same handle, track, stops, value indicator, and orientation styling.

## Public API

### Slider

```tsx
<Slider aria-label="Volume" />
```

```tsx
<Slider label="Volume" defaultValue={50} />
```

```tsx
<Slider value={value} onValueChange={setValue} />
```

### SliderCentered

```tsx
<SliderCentered min={-100} max={100} defaultValue={0} />
```

### SliderRange

```tsx
<SliderRange defaultValue={[25, 75]} />
```

```tsx
<SliderRange value={[minValue, maxValue]} onValueChange={setRangeValue} />
```

## Types

```ts
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderSize = 'xs' | 'sm' | 'md';

export interface SliderBaseProps {
  label?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  size?: SliderSize;
  disabled?: boolean;
  showSteps?: boolean;
  steps?: number[];
  showValue?: boolean;
  className?: string;
}

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'disabled'
  >,
    SliderBaseProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (
    value: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export interface SliderCenteredProps extends SliderProps {}

export interface SliderRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
    SliderBaseProps {
  value?: [number, number];
  defaultValue?: [number, number];
  minDistance?: number;
  disableSwap?: boolean;
  minLabel?: string;
  maxLabel?: string;
  name?: string;
  onValueChange?: (
    value: [number, number],
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
```

## Defaults

### Slider

```ts
min = 0
max = 100
step = 1
defaultValue = 0
orientation = 'horizontal'
size = 'md'
showSteps = false
showValue = false
```

### SliderCentered

```ts
min = -100
max = 100
step = 1
defaultValue = 0
orientation = 'horizontal'
size = 'md'
showSteps = false
showValue = false
```

### SliderRange

```ts
min = 0
max = 100
step = 1
defaultValue = [25, 75]
minDistance = 1
disableSwap = false
orientation = 'horizontal'
size = 'md'
showSteps = false
showValue = false
minLabel = 'Minimum value'
maxLabel = 'Maximum value'
```

## Variants

### Orientation

- `horizontal`
- `vertical`

### Size

- `xs`
- `sm`
- `md`

### States

- default / enabled
- hover
- press
- focus
- disabled

## Steps

Dots always mark `min` and `max`. `showSteps` adds a dot at each step between them.

If `steps` is provided, render those numeric step positions (they place dots only; `step` still
decides where the handle snaps).

If `steps` is omitted, derive dots from `min`, `max`, and `step` only when that gives 25 values or fewer.

Do not render excessive stops that would harm performance or visual clarity.

## Value Indicator

The value indicator (a native `output` bubble above the handle) shows on hover, keyboard focus,
and while dragging, whatever `showValue` is.

`showValue` (false by default) keeps it showing. A horizontal slider with `showValue` makes room
for it: the control gets a top margin of the bubble's height (`body-sm` line height plus
`spacing-xs` padding top and bottom) plus `spacing-sm`, so the bubble sits between the label and the
track and never overlaps the label. Without `showValue`, the bubble shows over whatever is above
while the slider is in use. On vertical sliders it sits beside the handle.

For `SliderRange`, both values show.

## Pointer and Focus Implementation

- The native range input has `pointer-events: none`; the `.control` element owns pointer handling,
  with pointer capture while dragging. A press away from the handle moves the value to that point
  (on SliderRange, the nearer handle moves), then dragging continues from there.
- Because the pressed element and the focused input are never the same node, focus is moved with an
  explicit `.focus()` call. Chromium's `:focus-visible` heuristic then treats it as keyboard focus,
  so `usePointerFocusRing` marks pointer-originated focus with `data-pointer-focus="true"` and the
  CSS excludes it; any keydown while focused clears the mark, so keyboard use shows the ring again.
- The visible ring is the shared Focus Ring, drawn on the handle: the handle carries the Focus
  Ring classes, and the outline uses their `--focus-ring-width`, `--focus-ring-color`, and
  `--focus-ring-offset` (the primitive's default offset, not a spacing token). The input fills the
  whole control, so its own outline is removed.

## Behavior

### Slider

- Single native range input.
- Active fill runs from min to current value.
- Value is numeric.

### SliderCentered

- Single native range input.
- Active fill starts at the center origin and extends toward the value.
- Center origin is usually zero, but should be calculated from min/max.
- Works with negative and positive ranges.

### SliderRange

- Use two native range inputs internally.
- One input controls lower value.
- One input controls upper value.
- The values stay sorted and at least `minDistance` apart (1 by default; `0` lets the handles meet).
- A handle moved past the other trades places with it, so the lower value always comes first; with
  `disableSwap`, a handle stops at the other one instead.
- Active fill appears between both handles.
- The lower value submits under `minName`, the upper under `maxName`. They default to `name` and
  `name` with `Max` appended (`budget` and `budgetMax`), so a form that sets only `name` submits as
  before. With no name at all, neither input is submitted.

## Percentage Calculations

Standard slider:

```ts
const percent = ((value - min) / (max - min)) * 100;
```

Centered slider:

```ts
const valuePercent = ((value - min) / (max - min)) * 100;
const centerPercent = ((0 - min) / (max - min)) * 100;
const startPercent = Math.min(centerPercent, valuePercent);
const endPercent = Math.max(centerPercent, valuePercent);
```

Range slider:

```ts
const minPercent = ((lowerValue - min) / (max - min)) * 100;
const maxPercent = ((upperValue - min) / (max - min)) * 100;
```

Expose these values as CSS custom properties.

## Token Requirements

Use CSS variables only.

Use semantic color tokens for colors.

Use component-scoped modifier tokens for slider geometry.

Recommended component token names:

```txt
component/slider/track/height/xs
component/slider/track/height/sm
component/slider/track/height/md
component/slider/handle/width/xs
component/slider/handle/width/sm
component/slider/handle/width/md
component/slider/handle/height/xs
component/slider/handle/height/sm
component/slider/handle/height/md
component/slider/track/radius
component/slider/stop/size
component/slider/value-indicator/offset
```

Generated CSS variables should be equivalent to:

```css
--component-slider-track-height-xs
--component-slider-track-height-sm
--component-slider-track-height-md
--component-slider-handle-width-xs
--component-slider-handle-width-sm
--component-slider-handle-width-md
--component-slider-handle-height-xs
--component-slider-handle-height-sm
--component-slider-handle-height-md
--component-slider-track-radius
--component-slider-stop-size
--spacing-sm
```

If exact Figma values are available through the Figma plugin, use those values as component tokens rather than hardcoding them in CSS.

## Color Token Mapping

Use the closest available semantic CSS variables from the generated token files.

Preferred mapping:

```txt
active track -> color/content/selected or closest current selected/dark token
inactive track -> color/background/selected/default
handle -> color/content/selected or closest current selected/dark token
stops -> color/content/selected for active stops, content/disabled or subtle for inactive stops
value indicator background -> color/background/neutral/bold/default
value indicator text -> color/content/inverse
focus ring -> shared Focus Ring primitive/pattern

disabled active track/handle -> color/content/disabled or disabled token
disabled inactive track -> color/background/disabled
```

Use current generated token names. If the project uses `text` instead of `content`, use the generated names.

## Styling Requirements

- Use CSS Modules.
- Use CSS variables.
- Normalize native range styles.
- Style WebKit and Mozilla range pseudo-elements as needed.
- Use shared track/handle styling across all variants.
- Support horizontal and vertical orientation.
- Do not use MUI.
- Do not use Tailwind.
- Do not hardcode colors.
- Do not hardcode geometry if component tokens can be created.

## Accessibility

Slider components must:

- use native `<input type="range">`
- expose native min, max, step, and value
- support keyboard interaction
- support disabled state
- support visible label association when `label` is provided
- require `aria-label` or `aria-labelledby` when no visible label is provided
- avoid custom slider roles
- avoid recreating slider behavior with divs

For `SliderRange`:

- both range inputs need accessible labels
- recommended default labels are `Minimum value` and `Maximum value`
- allow override through `minLabel` and `maxLabel` (translatable)
- the root is a `group` named by `label`, `aria-labelledby`, or `aria-label`, and each handle's
  name starts with that name, then `minLabel` or `maxLabel`

## Storybook Structure

Use atom documentation structure:

```txt
Slider
├─ Docs
├─ Playground
├─ Variants
├─ Sizes
├─ States
├─ Content
└─ Edge Cases
```

### Variants

Show the three designed forms - `Slider`, `SliderCentered`, `SliderRange` - and orientation
(horizontal/vertical), which every form shares.

### Sizes

Show `xs`/`sm`/`md`, plus a callout that the handle and track-stop dots are a constant size at
every size - only the track thickness scales, and the handle must still land exactly on the
endpoint dot at 0 and 100 regardless of size.

### States

Show enabled/hover/press/focus/disabled matching Figma's variants, pinned with
`data-preview-state`, plus a live example to verify by hand that clicking or dragging the handle
never shows a focus ring on its own - only real keyboard focus does.

### Content

Show track-stop/step behavior (auto-derived and explicit), the value indicator (default and
`showValue`), custom min/max/step, and realistic compositions including controlled examples.

### Edge Cases

Show overlapping range handles, `minDistance`/`disableSwap`, a narrow container, vertical
orientation in a constrained space, and a dark surface example.

## Tests

Use Vitest and React Testing Library.

Test:

- renders native range input
- renders label when provided
- accessible label support without visible label
- default min/max/step
- controlled usage
- uncontrolled usage
- `onValueChange` callback
- disabled state
- custom min/max/step
- orientation classes
- size classes
- `SliderCentered` centered fill calculations
- `SliderRange` renders two inputs
- `SliderRange` keeps values sorted (handles swap unless `disableSwap`)
- `SliderRange` calls callback with tuple value
- showSteps rendering
- showValue behavior
- custom className

## Engineering Requirements

- Export `Slider`, `SliderCentered`, and `SliderRange` from `index.ts`.
- Keep API minimal.
- Use native input semantics.
- Avoid private visual part exports.
- Use component tokens for geometry.
- Use semantic tokens for colors.
- Use Focus Ring primitive/pattern for focus-visible treatment.

## QA Checklist

- TypeScript compiles.
- Tests compile and pass.
- Storybook compiles.
- No MUI imports.
- No Tailwind usage.
- No hardcoded colors.
- No hardcoded geometry if tokens are available.
- Works in light mode.
- Works in dark mode.
- Keyboard interaction works.
- Screen reader labeling works.
- Range naming removed or migrated.

