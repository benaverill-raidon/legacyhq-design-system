# Progress Bar Component Spec

## Purpose

Progress Bar communicates the completion state of a determinate system process. It supports linear and circular presentations while preserving one shared value model.

Use it for uploads, document generation, processing, onboarding completion, and other operations where progress can be expressed from 0 to 100.

Do not use it for indeterminate loading, decorative charts, sliders, or step-by-step workflow navigation.

## Tier

```txt
atom
```

## Public API

```ts
export type ProgressBarVariant = 'linear' | 'circular';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

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
   └─ remaining track segment
      └─ progress segment
```

### Circular

```txt
root
└─ svg
   ├─ track circle
   └─ progress circle
```

In the DOM the linear remaining track spans the whole track and holds the progress segment, which
it clips to its inner (padding-box) edge, inside its 1px border. The circular track circle is drawn
as two circles: a bold-border circle (`.circularTrackBorder`) and the surface track circle
(`.circularTrack`) 2px narrower on top of it. A `div` (`.circularViewport`) wraps the SVG. Both the linear track and the circular viewport
are `aria-hidden`.

The Figma-only `progress-segment` and `track-segment` parts should not become public React components. Implement them as private anatomy inside Progress Bar.

The linear remaining track is a fully-rounded pill (`border-radius-full-round`); the progress
segment is rounded at its start and square at its end while partial, and rounded at both ends at
100. The circular progress arc is a wedge with straight (butt) ends - see Token mapping and Value
behavior. The earlier `track-stop` marks were removed in the Figma revision and are no longer part
of the anatomy.

## Variants

### `linear`

Use when horizontal space is available and the relationship between completed and remaining progress should be easy to scan.

- Fluid width; do not reproduce Figma's fixed 404px width.
- Progress fills from inline-start to inline-end.
- The bar is exactly the track size tall (16/24/32px), with no outer spacing.
- The remaining track is a fully-rounded pill with a 1px bold border, filled with the deep surface.
- The progress fill sits inside that border (`border-width-sm`) on the block axis and inline-start and runs the full inner height. Its inline size is the fill fraction of the inner width (inside the borders), so at 100% it meets the border on the inline-end edge.
- While partial the fill is rounded at its start and square at its end, where the remaining track continues; at 100% it is rounded at both ends. The remaining track clips the fill to its inner edge, so a very small or nearly full fill never covers the border at the rounded ends.
- Only the remaining track carries the bold border; the progress fill has none.
- Use logical properties so direction can be adapted later without restructuring.

### `circular`

Use when horizontal space is constrained or the indicator is paired with a compact summary.

- Render with inline SVG, not exported raster assets.
- Diameter is 80px (`component-progress-bar-circular-size`) at every size.
- Progress begins at 12 o'clock.
- Progress advances clockwise.
- Use `stroke-dasharray` and `stroke-dashoffset`, or an equivalent SVG implementation.
- The ring's outer edge is radius 38 from the center, with a 1px bold border outside both the outer edge and the hole edge.
- The progress arc is a filled wedge across the ring's full thickness (no inset), with straight ends (`stroke-linecap: butt`) and no border of its own; the ring's border frames the filled part too.
- At value 0, draw the empty track ring and its border, and hide only the progress arc, so no sliver of it shows at the 12 o'clock seam. This matches the linear variant, which shows its empty bordered track at 0.
- Do not use images generated from Figma.

## Sizes

The `size` prop controls the linear bar's height and the circular ring's thickness. There is no
outer spacing: the linear bar is exactly the track size tall.

### Linear

| Size | Bar block size (track thickness) | Progress fill height |
|---|---:|---:|
| `sm` | 16px | 14px (inside the 1px border) |
| `md` | 24px | 22px |
| `lg` | 32px | 30px |

The bar's block size is the `component-progress-bar-track-size-*` token. The bordered remaining
track fills it, and the progress fill runs the full height inside the 1px border.

### Circular

| Size | Diameter | Hole radius | Ring thickness | In Figma |
|---|---:|---:|---:|---|
| `sm` | 80px | 30 | 8px | No (code-only) |
| `md` | 80px | 22 | 16px | Yes |
| `lg` | 80px | 10 | 28px | Yes |

The circular geometry is set in `progress-bar.tsx`, not tokens: an 80-unit viewBox centered at
(40, 40), the ring's outer edge at radius 38, and the hole radius per size. Every circle is drawn at
the ring's mid radius: a bold border stroke 2 wider than the ring (so a 1px border shows outside the
outer edge, out to radius 39, and inside the hole edge), the surface track stroke of the ring's
thickness on top, and the progress arc, also the ring's full thickness, on top of that.

### Figma notes

- **2026-10-23:** the owner removed the outer spacing from both components in Figma
  (`progress-bar-linear` 3978:81552, `progress-bar-circular` 4217:98931). Linear: the bar is now
  one bordered pill exactly the track size tall (it was track + 2 x 4px pad: 24/32/40px), and the
  fill runs the full inner height, square at its end while partial (it was a fully-rounded pill 4px
  in from the track). Circular: the box is 80px (was 72), the ring's outer edge is radius 38 with
  a 1px border outside, the hole radius is 22 (md) or 10 (lg), and the progress is a wedge across
  the full ring with straight edges (it was an arc 4px in from each edge, with rounded caps).
- Figma has no circular `sm`. The code keeps `size="sm"` working with an 8px ring (hole radius
  30); this is recorded as an open decision in the contract's `knownIssues`.
- Figma draws the linear progress segment with its own border on three sides beside a separate
  track segment, clipped by a rounded frame; code draws one bordered track holding the fill, which
  looks the same.
- The linear fill widths in Figma's demonstration variants are approximate (for example the
  `progress=20` fill is 25% of the track). Code uses the exact fraction.

## Value behavior

```txt
value < 0   → render as 0
value > 100 → render as 100
```

Support any numeric value, not only the Figma demonstration values `0`, `10`, `20`, `50`, `80`, and `100`.

At `0`:

- linear renders only the remaining track
- circular renders only the track ring and its border (the progress arc is hidden)

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
--component-progress-bar-track-size-sm   (linear bar height)
--component-progress-bar-track-size-md
--component-progress-bar-track-size-lg
--component-progress-bar-circular-size   (80px)
```

`--component-progress-bar-linear-root-size-*` and `--component-progress-bar-linear-pad-*` are still
in the token data but no longer used by the component, since Figma removed the outer spacing. They
are to be removed Figma-first.

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

The role is fixed: `ProgressBarProps` omits `role`, and the component sets it after spreading the
rest, so a role passed from plain JavaScript can't replace it. The `aria-value*` attributes need a
range role, and another role would hide that this is progress.

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
- Value changes ease with `--fade-quick` (the linear fill's inline size; the circular arc's dash offset and dash array), matching Progress Tracker. Never a spring or movement recipe: progress is a state change, not physical movement. No transition under `prefers-reduced-motion: reduce`. At value 0 the circular progress arc is hidden, so reaching or leaving 0 shows or hides the arc at once; the track ring stays.
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
