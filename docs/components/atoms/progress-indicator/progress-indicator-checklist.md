# Progress Indicator Component Checklist

## Purpose

- [ ] Shows current position in a finite journey.
- [ ] Is used for onboarding, guided setup, forms, or similar sequences.
- [ ] Is not used for percentage-based system progress.
- [ ] Is not used as a clickable stepper or tab control.

## API

- [ ] Exports `ProgressIndicator`.
- [ ] Supports `currentStep` and `totalSteps`.
- [ ] Supports `appearance`, `size`, `label`, `getValueText`, and optional `onStepChange`.
- [ ] Defaults to `default` appearance and `sm` size.
- [ ] Forwards the root ref.
- [ ] Preserves native `aria-*` and `data-*` attributes.

## Value behavior

- [ ] `currentStep` is one-based.
- [ ] Current step clamps to the valid range.
- [ ] `totalSteps` below 1 normalizes to 1.
- [ ] Exactly `totalSteps` dots render.
- [ ] Exactly one dot is selected.

## Appearance

- [ ] `default` matches the neutral Figma treatment.
- [ ] `primary` uses the brand semantic color.
- [ ] `discovery` maps to the discovery/help appearance.
- [ ] `inverted` works on dark or bold surfaces.
- [ ] Unselected dots use `color-border-bold` across all appearances.
- [ ] No primitive colors are used directly.

## Sizes

- [ ] `sm` uses a 16px container and 8px visible dot.
- [ ] `md` uses a 20px container and 12px visible dot.
- [ ] Spacing matches Figma.
- [ ] Containers align consistently.

## Interaction

- [ ] Passive mode is non-interactive.
- [ ] Dots are buttons only when `onStepChange` is provided.
- [ ] Interactive mode uses native hover, pressed, and focus-visible behavior.
- [ ] Shared Focus Ring is used for interactive dots.
- [ ] No `tabIndex` is added manually.

## Tokens

- [ ] Semantic tokens are used for colors, borders, radius, spacing, and interactive surfaces.
- [ ] Component tokens are limited to dot/container dimensions.
- [ ] No unnecessary component aliases are added.
- [ ] Generated token names are verified.

## Accessibility

- [ ] Root uses `role="progressbar"`.
- [ ] Root exposes one-based min/max/current values.
- [ ] Component has an accessible journey name.
- [ ] Default `aria-valuetext` is `Step X of Y`.
- [ ] Custom `getValueText` is supported.
- [ ] Passive dots are hidden from assistive technology.
- [ ] Interactive dots use accessible button labels and `aria-current="step"`.
- [ ] Root remains non-focusable.

## Storybook

- [ ] Playground, Variants, and Examples exist.
- [ ] All appearances and both sizes are shown.
- [ ] Passive and interactive examples are shown.
- [ ] First, middle, and final steps are shown.
- [ ] Different totals are demonstrated.
- [ ] Inverted appearance is shown on a dark surface.
- [ ] External previous/next composition is shown only in Storybook examples.
- [ ] Realistic LegacyHQ journey examples are included.

## Testing

- [ ] Defaults, appearances, sizes, dynamic totals, selected count, clamping, total normalization, ARIA, naming, value text, ref forwarding, passive decorative dots, interactive buttons, `aria-current`, and controlled updates are tested.
- [ ] No brittle pixel assertions.

## Validation

- [ ] `npm test -- progress-indicator`
- [ ] `npm run typecheck`
- [ ] `npm run build-storybook`
- [ ] Manual comparison to Figma completed.
