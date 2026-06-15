# Slider Component Checklist

## Purpose

Slider lets users choose numeric values from a bounded scale through direct manipulation.

Use Slider when users benefit from quickly adjusting an approximate value, threshold, range, or intensity.

## Component Type

Atom family.

## Components

- `Slider`: single-value slider with fill from min to value.
- `SliderCentered`: single-value slider with fill from a center origin to value.
- `SliderRange`: two-handle slider used to select a minimum and maximum value.

## Related Components

- TextField: use when precise numeric entry is required.
- Select: use when choosing from discrete named options.
- Toggle: use for binary on/off settings.
- Range: deprecated previous name. Replace with Slider naming.

## Recommended Usage

Use Slider for:

- Approximate values.
- Percentages.
- Volume or intensity controls.
- Thresholds.
- Numeric ranges.
- Min/max filtering.

Avoid Slider for:

- Binary choices.
- Required legal or financial values requiring exact precision.
- Small sets of named choices.
- Navigation progress.

## Design Decisions

- Rename `Range` to `Slider`.
- Remove old `range` component docs and exports unless a temporary migration alias is explicitly required.
- Keep implementation accessible and native-input based.
- Use native `<input type="range">` for `Slider` and `SliderCentered`.
- Use two native range inputs internally for `SliderRange`.
- Do not build slider interaction behavior from divs.
- Use shared slider anatomy and tokens across all three components.
- Treat Figma parts as internal anatomy only: handle, track-stop, inactive tracks, active-track, value-indicator.
- Do not export visual parts publicly.

## Default Values

Slider:

- min: `0`
- max: `100`
- step: `1`
- defaultValue: `0`

SliderCentered:

- min: `-100`
- max: `100`
- step: `1`
- defaultValue: `0`

SliderRange:

- min: `0`
- max: `100`
- step: `1`
- defaultValue: `[25, 75]`

## Variants

- orientation: `horizontal`, `vertical`
- size: `xs`, `sm`, `md`
- state: default, hovered, pressed, focused, disabled
- showStops: boolean
- showValue: boolean

## Accessibility Requirements

Slider components must:

- use native range inputs
- support keyboard interaction
- support screen readers
- support disabled state
- expose min, max, step, and current value through native inputs
- support visible label association when label is provided
- support `aria-label` or `aria-labelledby` when no visible label is rendered
- avoid custom slider roles when native input semantics are available

SliderRange must:

- provide accessible labels for both handles
- prevent min handle from passing max handle
- prevent max handle from passing min handle
- expose each handle as a native range input

## Content Rules

- Label is optional.
- If a label is shown, keep it concise.
- `showValue` is optional and false by default.
- When `showValue` is true, show the value indicator only while hovered, focused, or dragging.
- Stops are optional.

## Token Rules

Use CSS variables only.

Use semantic tokens for colors.

Use component-scoped modifier tokens for slider geometry:

- track size
- handle size
- track radius
- value indicator geometry if needed
- stop size

Do not hardcode:

- colors
- spacing
- geometry
- border radius
- typography

## Interaction Requirements

- Dragging handle updates value.
- Clicking track updates value through native range behavior.
- Keyboard arrows update value.
- Hover/pressed states affect handle and active track.
- Focus-visible uses the shared Focus Ring primitive/pattern.
- Vertical orientation works with keyboard and pointer input.

## Engineering Notes

- Use CSS custom properties for calculated percentages.
- Use transform-based positioning where needed.
- Keep shared slider calculations in small utilities if useful.
- Do not duplicate styling logic unnecessarily between Slider, SliderCentered, and SliderRange.
- Do not expose private visual parts.

## QA Checklist

- Native inputs render.
- Controlled usage works.
- Uncontrolled usage works.
- Default min/max/step are applied.
- Value updates by mouse/touch.
- Value updates by keyboard.
- Disabled state prevents interaction.
- Focus-visible state is visible.
- Accessible labels are available.
- `SliderCentered` fills from center.
- `SliderRange` handles cannot cross.
- Horizontal orientation works.
- Vertical orientation works.
- Stops render when enabled.
- Value indicator renders when enabled and active.
- No hardcoded design values are used.
- Works in light theme.
- Works in dark theme.
