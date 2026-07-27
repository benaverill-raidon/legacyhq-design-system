# Progress Indicator Component Spec

## Purpose

Progress Indicator shows a user's current position within a finite sequence of steps.

Use it for onboarding, setup, multi-step forms, guided workflows, carousels, and other journeys where users benefit from knowing their relative position.

Do not use it for system process completion, percentage-based progress, free navigation, tab selection, or a stepper that requires labels and actions. Use Progress Bar for determinate system progress and a future Stepper pattern for labeled, navigable steps.

## Category

```txt
atom
```

## Public API

```ts
export type ProgressIndicatorAppearance =
  | 'default'
  | 'primary'
  | 'discovery'
  | 'inverted';

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
- `discovery`: discovery selected dot.
- `inverted`: inverse selected dot for dark surfaces.

Do not expose Figma's internal `inverse` name publicly.

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

Only one dot is selected. Hover, pressed, and focus-visible states are derived from native button behavior when `onStepChange` is provided.

## Token mapping

Use semantic tokens for selected colors, unselected borders, full-round radius, spacing, border width, and interactive surface states. Use component tokens only for anatomy-specific dimensions.

Suggested semantic intent:

```txt
default selected: color-content-default
primary selected: color-content-brand
discovery selected: color-content-discovery
inverted selected: color-content-inverse
unselected border: color-border-bold
interactive hover: color-background-neutral-subtle-hovered
interactive pressed: color-background-neutral-subtle-pressed
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
- Do not animate unless explicitly requested later.

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

Use:

```txt
Playground
Variants
Examples
```

Playground controls: `currentStep`, `totalSteps`, `appearance`, `size`, and `label`.

Variants should show all appearances, both sizes, passive and interactive dots, first/middle/final positions, and different totals.

## Testing

Test defaults, appearance classes, size classes, dynamic totals, exactly one selected dot, clamping, ARIA values, value text, accessible labeling, ref forwarding, passive decorative dots, interactive buttons, `aria-current`, and controlled updates. Avoid brittle pixel assertions.
