# Progress Indicator Component Prompt

Please implement the LegacyHQ `ProgressIndicator` atom.

Recommended model: GPT-5.4 Thinking.

Use the current LegacyHQ architecture and documentation conventions. Do not copy Figma-generated Tailwind code directly.

# References

Use:

- Progress Indicator Figma component node `1612:1592`
- Indicator Dot Figma part node `1612:1248`
- current token files
- existing atom patterns
- `progress-indicator-spec.md`
- `progress-indicator-checklist.md`
- `progress-indicator.contract.json`
- `progress-indicator.examples.json`

Priority:

1. This prompt
2. Contract/spec
3. Existing LegacyHQ patterns
4. Figma visuals
5. Figma-generated reference code

# Goal

Create a read-only Progress Indicator that renders a dynamic sequence of dots and identifies the current step.

# Required files

```txt
progress-indicator.tsx
progress-indicator.types.ts
progress-indicator.module.css
progress-indicator.stories.tsx
progress-indicator.test.tsx
index.ts
```

Update package exports where required.

# API

```ts
export type ProgressIndicatorAppearance =
  | 'default'
  | 'primary'
  | 'help'
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
}
```

Defaults:

```ts
appearance = 'default'
size = 'sm'
```

`currentStep` is one-based. Clamp current step to the valid range and normalize totals below one to one.

# Anatomy

```txt
root
+- dots
   +- selected dot
   +- unselected dots
```

Render dots dynamically from `totalSteps`. Keep the Figma `indicator-dot` private.

# Visual requirements

Appearances:

```txt
default
primary
help
inverted
```

Public-to-Figma intent mapping:

```txt
help -> discovery
inverted -> inverse
```

Sizes:

```txt
sm: 16px container, 8px visible dot
md: 20px container, 12px visible dot
```

Selected dots are filled. Unselected dots are transparent with semantic borders. Use full-round radius and CSS only.

Do not reproduce Figma hover, pressed, or focus states because this component is non-interactive.

# Tokens

Inspect actual generated token names.

Use semantic tokens for colors, borders, full-round radius, spacing, and border width. Use component tokens only for dot/container dimensions.

Do not create component color aliases or reference primitive colors directly.

# Accessibility

Root:

```tsx
role="progressbar"
aria-valuemin={1}
aria-valuemax={normalizedTotalSteps}
aria-valuenow={normalizedCurrentStep}
```

Accessible naming priority: existing `aria-label`, existing `aria-labelledby`, then `label`.

Default value text: `Step X of Y`. Use `getValueText` when supplied.

Dots must be decorative and `aria-hidden="true"`. Do not add `tabIndex` or keyboard handling.

# Storybook

Create:

```txt
Playground
Variants
Examples
```

Show all appearances, both sizes, first/middle/final steps, totals of 3/5/8, realistic journey examples, and inverted usage on a dark surface.

# Tests

Test role and ARIA values, default/custom value text, clamping, minimum total normalization, dynamic dot count, exactly one selected dot, appearance classes, size classes, accessible label, ref forwarding, and decorative dots.

# Preserve

Do not install Tailwind or MUI, create public dot parts, make dots clickable, add completed states, add animation, add labels inside the component, add focus styles, or modify unrelated components.

# Validation

```bash
npm test -- progress-indicator
npm run typecheck
npm run build-storybook
```

Run the full test suite if practical.

# Final output

Summarize files created, API, dot rendering strategy, token mappings, accessibility, Storybook coverage, tests, validation, and manual QA.
