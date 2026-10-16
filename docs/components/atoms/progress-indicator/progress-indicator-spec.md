# Progress Indicator Component Spec

## Purpose

Progress Indicator shows a user's current position within a finite sequence of steps.

Use it for onboarding, setup, multi-step forms, guided workflows, carousels, and other journeys where users benefit from knowing their relative position.

Do not use it for system process completion, percentage-based progress, free navigation, tab selection, or a stepper that requires labels and actions. Use Progress Bar for determinate system progress and a future Stepper pattern for labeled, navigable steps.

## Tier

```txt
atom
```

## Public API

```ts
export type ProgressIndicatorAppearance =
  | 'default'
  | 'primary'
  | 'inverse';

/** @deprecated Use `inverse`, the name every other component uses for light-on-dark. Still accepted. */
export type DeprecatedProgressIndicatorAppearance = 'inverted';

export type ProgressIndicatorSize = 'sm' | 'md';

export interface ProgressIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  currentStep: number;
  totalSteps: number;
  appearance?: ProgressIndicatorAppearance;
  size?: ProgressIndicatorSize;
  label?: string;
  getValueText?: (currentStep: number, totalSteps: number) => string;
  onStepChange?: (step: number) => void;
}
```

Defaults:

```ts
appearance = 'default'
size = 'sm'
```

`currentStep` is one-based and clamped to `1-totalSteps`. `totalSteps` normalizes to at least `1`.

## Anatomy

### Passive

```txt
root
+- dot list
   +- span dot
   +- span dot
```

### Interactive

```txt
root
+- dot list
   +- button dot
   +- button dot
```

The Figma-only `indicator-dot` remains private anatomy.

## Appearances

- `default`: neutral selected dot.
- `primary`: brand selected dot.
- `inverse`: inverse selected dot for bold surfaces (`color-background-neutral-subtle-default`:
  light in the light theme, dark in the dark theme).

`inverted`, the earlier public name for `inverse`, is still accepted as a deprecated alias and maps
to `inverse` inside the component.

## Sizes

| Size | Dot container | Visible selected dot | Visible unselected dot |
|---|---:|---:|---:|
| `sm` | 16px | 8px | 8px |
| `md` | 20px | 12px | 12px |

## State model

### Passive

```txt
selected
unselected
```

### Interactive

```txt
selected
default
hovered
pressed
focused
```

Only one dot is selected. Hover, press, and focus-visible states are derived from native button behavior when `onStepChange` is provided.

## Token mapping

Use semantic tokens for selected colors, unselected borders, full-round radius, spacing, border width, and interactive surface states. Use component tokens only for anatomy-specific dimensions.

Suggested semantic intent:

```txt
default selected: color-background-neutral-bold-default
primary selected: color-background-brand-primary-bold-default
inverse selected: color-background-neutral-subtle-default
unselected border: color-border-bold
interactive hover: color-background-neutral-overlay-bold-hover
interactive pressed: color-background-neutral-overlay-bold-press
```

Verify the actual generated CSS variable names before implementation.

## Accessibility

Progress Indicator remains controlled by `currentStep` and `totalSteps`. External previous and next buttons belong to surrounding composition, not to the component itself.

Apply to the root:

```txt
role="progressbar"
aria-valuemin="1"
aria-valuemax={normalizedTotalSteps}
aria-valuenow={normalizedCurrentStep}
```

Accessible naming priority:

1. `aria-label`
2. `aria-labelledby`
3. `label`

Default `aria-valuetext` is `Step X of Y`.

Passive dots are decorative and hidden from assistive technology.

When `onStepChange` is provided:

- each dot is a native `button`
- each button uses the accessible label `Go to step X`
- the selected dot uses `aria-current="step"`
- focus uses the shared Focus Ring implementation

## Behavior rules

- Render exactly `totalSteps` dots.
- Select exactly one dot.
- Clamp `currentStep` to the valid range.
- Normalize `totalSteps` to at least `1`.
- Dots are buttons only when `onStepChange` is provided.
- Do not add completed-step styling.
- The interactive dot's hover/press fill and the selected/unselected color swap both transition
  with the `fade-quick` motion recipe, switched off under `prefers-reduced-motion: reduce`.

## Implementation constraints

- React + TypeScript.
- CSS Modules.
- No MUI.
- No Tailwind.
- No Figma image assets.
- Render dots with CSS.
- Forward the root ref.
- Preserve native `data-*` and `aria-*` attributes.
- Do not expose `IndicatorDot` publicly.
- Do not add internal previous/next buttons.

## Storybook

Use atom documentation structure:

```txt
Progress Indicator
├─ Docs
├─ Playground
├─ Variants
├─ Sizes
├─ States
├─ Content
└─ Edge Cases
```

### Playground

Controls for `currentStep`, `totalSteps`, `appearance`, `size`, and `label`.

### Variants

Show the appearance axis alone (`default`, `primary`), then `inverse` separately on a bold
surface (`color-background-neutral-bold-default`, not `data-theme="dark"`) - it isn't grouped with
the other two because its selected dot (`color-background-neutral-subtle-default`) disappears on the
page's own surface. In the dark theme that token is dark, so inverse inside `data-theme="dark"`
shows no selected dot.

### Sizes

Show `sm` and `md`, plus a callout that the interactive hit target (dot container) scales with size
too, not just the visible dot.

### States

Progress Indicator has no root-level interactive state to pin with `data-force-state` - hover,
focus, and pressed apply per dot. Show dot position instead (first, middle, final), passive versus
interactive rendering, and a live interactive example to verify hover/focus/press by hand.

### Content

Show different totals (dynamic dot count), custom `getValueText`, and realistic LegacyHQ
compositions - including an externally-controlled Previous/Next pagination example.

### Edge Cases

Show a single-step journey, out-of-range `currentStep`/`totalSteps` values clamping safely, many
steps in a narrow container (dots do not wrap), and default/primary/inverse together in the dark
theme, where default and primary stay legible and inverse's selected dot is dark.

Do not create one story per variant permutation unless necessary.

## Testing

Test defaults, appearance classes, size classes, dynamic totals, exactly one selected dot, clamping, ARIA values, value text, accessible labeling, ref forwarding, passive decorative dots, interactive buttons, `aria-current`, and controlled updates. Avoid brittle pixel assertions.
