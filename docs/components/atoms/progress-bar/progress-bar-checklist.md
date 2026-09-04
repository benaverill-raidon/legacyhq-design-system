# Progress Bar Component Checklist

## Purpose

- [ ] Communicates determinate process completion from 0 to 100.
- [ ] Supports linear and circular presentations.
- [ ] Is not used as a slider, chart, stepper, or indeterminate loader.

## API

- [ ] Exports `ProgressBar`.
- [ ] Supports `value: number`.
- [ ] Supports `variant: 'linear' | 'circular'`.
- [ ] Supports `size: 'md' | 'lg'`.
- [ ] Defaults to linear/md.
- [ ] Supports `label`.
- [ ] Supports `getValueText`.
- [ ] Forwards the root ref.
- [ ] Preserves native `aria-*` and `data-*` attributes.

## Value behavior

- [ ] Values below 0 clamp to 0.
- [ ] Values above 100 clamp to 100.
- [ ] Arbitrary values render correctly.
- [ ] 0% renders without visual overflow.
- [ ] 100% renders without visual gaps.

## Linear

- [ ] Width is fluid.
- [ ] No fixed Figma canvas width is copied.
- [ ] `md`: 20px root / 12px track / 4px inset.
- [ ] `lg`: 32px root / 24px track / 4px inset.
- [ ] Progress fill and remaining track are both fully-rounded pills at every value.
- [ ] Progress fill floats inset within the track (block axis + inline-start), sized to the fill fraction of the padded inner width.
- [ ] Only the remaining track carries the bold border; the progress fill has none.

## Circular

- [ ] Uses inline SVG.
- [ ] Does not use Figma-exported donut images.
- [ ] Diameter is 72px.
- [ ] `md` track thickness is 12px.
- [ ] `lg` track thickness is 24px.
- [ ] Progress begins at 12 o'clock.
- [ ] Progress advances clockwise.
- [ ] Progress arc is inset within the track ring by the pad (4px), matching the linear inset.
- [ ] Progress arc is capped with rounded ends and has no border of its own.
- [ ] At value 0, nothing renders (track ring and border hidden).
- [ ] Circular geometry scales without raster artifacts.

## Tokens

- [ ] Progress fill uses `color-background-brand-primary-bold-default`.
- [ ] Remaining track uses `color-elevation-surface-deep-default`.
- [ ] Borders use `color-border-bold`; radius uses `border-radius-full-round`.
- [ ] Does not use the old `data-viz/sequence/prussian` tokens.
- [ ] Does not reference primitive colors directly.
- [ ] Uses component tokens only for anatomy-specific dimensions.
- [ ] No unnecessary component aliases were added.
- [ ] No hardcoded design values where a token exists.

## Accessibility

- [ ] Root uses `role="progressbar"`.
- [ ] Root exposes `aria-valuemin="0"`.
- [ ] Root exposes `aria-valuemax="100"`.
- [ ] Root exposes clamped `aria-valuenow`.
- [ ] Accessible label can come from `aria-label`, `aria-labelledby`, or `label`.
- [ ] `getValueText` maps to `aria-valuetext`.
- [ ] Component is not focusable.
- [ ] No keyboard interaction is added.
- [ ] Decorative SVG is hidden from assistive technology.

## Storybook

- [ ] Playground exists.
- [ ] Variants exists.
- [ ] Examples exists.
- [ ] Both variants are shown.
- [ ] Both sizes are shown.
- [ ] Values 0, 10, 20, 50, 80, and 100 are demonstrated.
- [ ] Realistic process examples are included.

## Testing

- [ ] Default variant/size.
- [ ] Linear rendering.
- [ ] Circular rendering.
- [ ] Value clamping.
- [ ] Arbitrary values.
- [ ] ARIA attributes.
- [ ] Accessible naming.
- [ ] Value text.
- [ ] Variant and size classes.
- [ ] Ref forwarding.
- [ ] Decorative SVG behavior.
- [ ] Avoids brittle pixel assertions.

## Validation

- [ ] `npm test -- progress-bar`
- [ ] `npm run typecheck`
- [ ] `npm run build-storybook`
- [ ] Manual comparison to Figma completed.
