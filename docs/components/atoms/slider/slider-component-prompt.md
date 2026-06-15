# Slider Component Codex Instructions

## Task

Implement the Slider atom family for the React component library.

This replaces the previous Range component naming.

## Source Files

Use this documentation together with:

- slider-component-checklist.md
- slider-component-spec.md
- Figma screenshots
- tokens.css
- light.css
- dark.css

Priority order:

1. slider-component-spec.md
2. slider-component-prompt.md
3. Figma screenshots
4. slider-component-checklist.md

If anything conflicts, follow the highest-priority source.

## Folder Structure

Create:

```txt
packages/ui/src/components/atoms/slider/
├── slider.tsx
├── slider-centered.tsx
├── slider-range.tsx
├── slider.types.ts
├── slider.module.css
├── slider.test.tsx
├── slider.stories.tsx
└── index.ts
```

## Rename / Migration Requirements

Rename Range to Slider.

Remove or migrate old Range files and exports:

```txt
packages/ui/src/components/atoms/range/
range.tsx
range.types.ts
range.module.css
range.test.tsx
range.stories.tsx
index.ts
```

Also update central exports and Storybook imports.

Do not leave stale Range exports unless temporary backwards compatibility is explicitly required.

## Implementation Requirements

Build production-ready:

- `Slider`
- `SliderCentered`
- `SliderRange`

Use:

- React
- TypeScript
- CSS Modules
- native `<input type="range">`
- CSS variables
- design tokens

Do not use:

- MUI
- Tailwind
- hardcoded colors
- div-only slider behavior
- custom ARIA slider roles

## Architecture Requirements

`Slider` and `SliderCentered` should use one native range input.

`SliderRange` should use two native range inputs internally.

Do not build custom pointer/keyboard behavior from divs.

All variants should share the same base slider anatomy and styling approach.

`SliderCentered` should only differ in fill calculation.

## Public API

```tsx
<Slider aria-label="Volume" />
```

```tsx
<Slider value={50} onValueChange={setValue} />
```

```tsx
<SliderCentered min={-100} max={100} defaultValue={0} />
```

```tsx
<SliderRange defaultValue={[25, 75]} />
```

## API Types

Implement types from `slider-component-spec.md`.

Support:

```txt
orientation: horizontal | vertical
size: xs | sm | md
showStops: boolean
showValue: boolean
```

## Defaults

Slider:

```ts
min = 0
max = 100
step = 1
defaultValue = 0
```

SliderCentered:

```ts
min = -100
max = 100
step = 1
defaultValue = 0
```

SliderRange:

```ts
min = 0
max = 100
step = 1
defaultValue = [25, 75]
```

Shared:

```ts
orientation = 'horizontal'
size = 'md'
showStops = false
showValue = false
```

## Value Fill Requirements

Use CSS custom properties for calculated percentages.

Do not create unnecessary DOM for every visual segment if CSS variables can handle the rendering.

Slider:

```ts
const percent = ((value - min) / (max - min)) * 100;
```

SliderCentered:

```ts
const valuePercent = ((value - min) / (max - min)) * 100;
const centerPercent = ((0 - min) / (max - min)) * 100;
const startPercent = Math.min(centerPercent, valuePercent);
const endPercent = Math.max(centerPercent, valuePercent);
```

SliderRange:

```ts
const minPercent = ((lowerValue - min) / (max - min)) * 100;
const maxPercent = ((upperValue - min) / (max - min)) * 100;
```

Expose percentages as CSS custom properties such as:

```css
--slider-percent
--slider-center-percent
--slider-fill-start
--slider-fill-end
--slider-range-min-percent
--slider-range-max-percent
```

## SliderRange Behavior

Use two native range inputs.

Rules:

- lower handle cannot exceed upper handle
- upper handle cannot go below lower handle
- callback returns `[lowerValue, upperValue]`
- active fill displays between both handles
- both handles remain keyboard accessible

## Stops

Support:

```tsx
showStops
stops?: number[]
```

If `stops` is provided, render those stops.

If `showStops` is true and `stops` is omitted, derive stops from `min`, `max`, and `step` only when the count is reasonable.

Do not render excessive stop counts.

## Value Indicator

Support:

```tsx
showValue
```

Default is false.

When true, show value indicator only while:

- hovered
- focused
- dragging / active

For `SliderRange`, show the value indicator for the active handle.

## Token Requirements

Use semantic tokens for colors.

Use component-scoped modifier tokens for geometry.

Add component tokens if needed:

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

Do not use semantic spacing tokens directly for handle or track dimensions.

Reason: slider track and handle dimensions are component anatomy decisions, not general layout spacing decisions.

## Color Mapping

Use existing semantic tokens where available.

Preferred mapping:

```txt
active track -> color/content/selected or closest current selected/dark token
inactive track -> color/background/selected/default
handle -> color/content/selected or closest current selected/dark token
stops -> selected/subtle/disabled tokens depending on state
value indicator background -> color/background/neutral/bold/default
value indicator text -> color/content/inverse
disabled -> disabled semantic tokens
focus -> shared Focus Ring primitive/pattern
```

If a token is missing, document it in the final output.

## Focus Ring

Use the existing Focus Ring primitive or shared focus-ring utility pattern.

Do not create unrelated focus styling.

Focus-visible should match the rest of the design system.

## Accessibility

Use native input behavior.

If `label` is provided:

- render a visible label
- associate it with the input using `htmlFor` and `id`

If `label` is not provided:

- require/expect `aria-label` or `aria-labelledby`

For `SliderRange`:

- each input must have an accessible label
- default handle labels may be `Minimum value` and `Maximum value`
- allow overrides with `minLabel` and `maxLabel`

Do not recreate keyboard behavior manually.

## Visual Requirements

Match the Figma screenshots as closely as possible.

Render:

- track
- active track
- inactive track
- handle
- stops when enabled
- value indicator when enabled and active
- focus state
- disabled state

Support:

- horizontal orientation
- vertical orientation
- xs / sm / md sizes

## Storybook

Create stories:

```txt
Slider
├─ Playground
├─ Variants
└─ Examples
```

Include:

- Slider default
- SliderCentered default
- SliderRange default
- Horizontal orientation
- Vertical orientation
- xs / sm / md sizes
- Disabled
- showStops
- showValue
- Custom min/max/step
- Dark surface example

## Tests

Create tests with Vitest and React Testing Library.

Test:

- renders native range input
- renders label
- accessible label support
- default min/max/step
- controlled usage
- uncontrolled usage
- onValueChange callback
- disabled state
- custom min/max/step
- orientation variants
- size variants
- SliderCentered fill calculation variables
- SliderRange renders two inputs
- SliderRange prevents crossing
- SliderRange callback returns tuple
- showStops
- showValue
- native prop forwarding
- custom className

## Validation

Before finishing:

- verify TypeScript compiles
- verify tests compile/pass
- verify Storybook compiles
- verify token usage
- verify no MUI imports
- verify no Tailwind usage
- verify no hardcoded colors
- verify no div-only slider implementation
- verify old Range naming is removed or intentionally migrated

## Final Output

After implementation, summarize:

1. Files created
2. Files modified
3. Range files removed or migrated
4. Tokens added
5. Accessibility decisions
6. Assumptions made
7. Missing tokens
8. Future improvements
9. Spec compliance confirmation
