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
- [ ] Progress and remaining segments meet at the exact value boundary.
- [ ] Start and end stops remain aligned to the track edges.
- [ ] `md`: 24px root / 12px track.
- [ ] `lg`: 40px root / 24px track.
- [ ] Stop shape is 4px.
- [ ] Track uses full-round geometry.

## Circular

- [ ] Uses inline SVG.
- [ ] Does not use Figma-exported donut images.
- [ ] Diameter is 72px.
- [ ] `md` track thickness is 12px.
- [ ] `lg` track thickness is 24px.
- [ ] Progress begins at 12 o'clock.
- [ ] Progress advances clockwise.
- [ ] Start stop is aligned at 12 o'clock.
- [ ] Circular geometry scales without raster artifacts.

## Tokens

- [ ] Uses semantic progress and track colors.
- [ ] Uses semantic border and radius tokens.
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
