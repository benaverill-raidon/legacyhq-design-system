# Progress Bar Component Spec

## Purpose

Progress Bar communicates the completion state of a determinate system process. It supports linear and circular presentations while preserving one shared value model.

Use it for uploads, document generation, processing, onboarding completion, and other operations where progress can be expressed from 0 to 100.

Do not use it for indeterminate loading, decorative charts, sliders, or step-by-step workflow navigation.

## Category

```txt
atom
```

## Public API

```ts
export type ProgressBarVariant = 'linear' | 'circular';
export type ProgressBarSize = 'md' | 'lg';

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  label?: string;
  getValueText?: (value: number) => string;
}
```

Defaults:

```ts
variant = 'linear'
size = 'md'
```

`value` is clamped to the inclusive range `0–100`.

## Anatomy

### Linear

```txt
root
└─ track
   ├─ progress segment
   └─ remaining track segment
```

### Circular

```txt
root
└─ svg
   ├─ track circle
   └─ progress circle
```

The Figma-only `progress-segment` and `track-segment` parts should not become public React components. Implement them as private anatomy inside Progress Bar.

Both linear segments are fully-rounded pills (`border-radius-full-round`) at every value, and the
circular progress arc is capped with rounded ends - see Token mapping and Value behavior. The
earlier `track-stop` marks were removed in the Figma revision and are no longer part of the anatomy.

## Variants

### `linear`

Use when horizontal space is available and the relationship between completed and remaining progress should be easy to scan.

- Fluid width; do not reproduce Figma's fixed 404px width.
- Progress fills from inline-start to inline-end.
- The progress fill and the remaining track are both fully-rounded pills at every value.
- The progress fill is inset within the bordered remaining track by the pad (4px, both sizes) on the block axis and both inline edges, so it floats inside the track. Its inline size is the fill fraction of the track's inner (padded) width, so at 100% it leaves an equal pad on the inline-end edge.
- Only the remaining track carries the bold border; the progress fill has none.
- Use logical properties so direction can be adapted later without restructuring.

### `circular`

Use when horizontal space is constrained or the indicator is paired with a compact summary.

- Render with inline SVG, not exported raster assets.
- Diameter remains 72px for the current component.
- Progress begins at 12 o'clock.
- Progress advances clockwise.
- Use `stroke-dasharray` and `stroke-dashoffset`, or an equivalent SVG implementation.
- The progress arc is inset within the track ring by the pad (4px, both sizes) on both radial edges, matching the linear inset, so a light gap of track shows around the fill.
- The progress arc is capped with rounded ends (`stroke-linecap: round`) and carries no border.
- At value 0, render nothing: hide the track ring and its border.
- Do not use images generated from Figma.

## Sizes

The `size` prop controls track thickness and the progress inset (pad). The linear root block size is derived as `track thickness + 2 × pad`.

### Linear

| Size | Root block size | Track thickness | Progress inset (pad) |
|---|---:|---:|---:|
| `md` | 20px | 12px | 4px |
| `lg` | 32px | 24px | 4px |

### Circular

| Size | Diameter | Track thickness | Progress inset (pad) |
|---|---:|---:|---:|
| `md` | 72px | 12px | 4px |
| `lg` | 72px | 24px | 4px |

## Value behavior

```txt
value < 0   → render as 0
value > 100 → render as 100
```

Support any numeric value, not only the Figma demonstration values `0`, `10`, `20`, `50`, `80`, and `100`.

At `0`:

- linear renders only the remaining track
- circular renders nothing (the track ring and its border are hidden)

At `100`:

- linear renders only the progress track
- circular renders a complete progress ring
- endpoint geometry must not show a gap or overflow

## Token mapping

Use existing project token names after verifying them in generated CSS.

### Semantic tokens

```txt
progress fill:
  color-background-brand-primary-bold-default

remaining track fill:
  color-elevation-surface-deep-default

track border:
  color-border-bold

radius:
  border-radius-full-round

border width:
  border-width-sm
```

These are theme-aware and resolve to different primitives in light and dark. Do not map component
CSS directly to primitive color values, and do not use the old `data-viz/sequence/prussian` tokens.

### Component tokens

Keep component tokens only for anatomy-specific dimensions:

```txt
--component-progress-bar-linear-root-size-md   (calc: track-size + 2 × pad)
--component-progress-bar-linear-root-size-lg   (calc: track-size + 2 × pad)
--component-progress-bar-linear-pad-md
--component-progress-bar-linear-pad-lg
--component-progress-bar-track-size-md
--component-progress-bar-track-size-lg
--component-progress-bar-circular-size
```

If existing semantic dimension tokens already express one of these values without losing component intent, prefer the semantic token and omit the component alias.

## Accessibility

Progress Bar is read-only and non-interactive.

Apply to the root:

```txt
role="progressbar"
aria-valuemin="0"
aria-valuemax="100"
aria-valuenow={clampedValue}
```

Accessible naming priority:

1. `aria-label`
2. `aria-labelledby`
3. `label`

When `getValueText` is provided, map its return value to `aria-valuetext`.

Do not make the component focusable. Do not add keyboard interaction. Decorative SVG content must be hidden from assistive technology.

## Implementation constraints

- React + TypeScript.
- CSS Modules.
- No MUI.
- No Tailwind.
- No Figma-exported bitmap or SVG assets.
- No hardcoded colors.
- No interactive thumb or drag behavior.
- No animation unless requested in a later revision.
- Forward the root ref.
- Preserve native `data-*` and `aria-*` attributes.
- Circular progress must scale cleanly without raster artifacts.
- Linear progress width must be controlled by its parent.

## Storybook

Use the standard simplified structure:

```txt
Playground
Variants
Examples
```

### Playground

Controls:

- `value`
- `variant`
- `size`
- `label`

### Variants

Show:

- linear md
- linear lg
- circular md
- circular lg
- values: 0, 10, 20, 50, 80, 100

### Examples

Show realistic use:

- document generation progress
- upload progress
- compact circular progress beside a summary

## Testing

Test:

- default variant and size
- linear and circular rendering
- value clamping
- `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`
- `aria-label` / `aria-labelledby`
- `aria-valuetext`
- size and variant class application
- ref forwarding
- arbitrary values such as 37
- zero and complete values
- decorative SVG is hidden

Avoid brittle pixel assertions.
