# Progress Bar Component Prompt

Please implement the LegacyHQ `ProgressBar` atom.

Recommended model: GPT-5.4 Thinking.

Use the current LegacyHQ component architecture and documentation conventions. Do not copy the Figma-generated Tailwind code directly.

# References

Use:

- Progress Bar Figma component context:
  - linear node `3978:81552`
  - circular node `4217:98931`
- Progress Bar Figma parts:
  - track segment `4214:98002`
  - progress segment `4214:97999`
  - track stop `4214:98160`
- current token files
- current atom patterns
- shared Storybook conventions
- `progress-bar-spec.md`
- `progress-bar-checklist.md`
- `progress-bar.contract.json`
- `progress-bar.examples.json`

Priority:

1. This prompt
2. Progress Bar contract/spec
3. Current LegacyHQ implementation patterns
4. Figma visuals
5. Figma-generated reference code

# Goal

Create one `ProgressBar` component supporting:

```ts
variant: 'linear' | 'circular'
size: 'md' | 'lg'
value: number
```

The component is determinate, read-only, and accessible.

# Required files

Create:

```txt
progress-bar.tsx
progress-bar.types.ts
progress-bar.module.css
progress-bar.stories.tsx
progress-bar.test.tsx
index.ts
```

Update package exports where required.

# API

Use:

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

Clamp `value` to `0–100` for rendering and ARIA.

# Linear implementation

Use CSS layout, not Figma part components.

Anatomy:

```txt
root
└─ track
   ├─ progress segment
   ├─ remaining track
   ├─ start stop
   └─ end stop
```

Requirements:

- width is fluid and controlled by parent
- fill boundary matches the value exactly
- start/end stops remain anchored to the track edges
- md root 24px, track 12px
- lg root 40px, track 24px
- stop shape 4px
- full-round track geometry
- no fixed 404px width
- no flex gap between progress and remaining track; they must meet continuously

# Circular implementation

Use inline SVG.

Do not use the Figma-exported donut image assets.

Requirements:

- 72px diameter for current md/lg variants
- md stroke/track thickness 12px
- lg stroke/track thickness 24px
- starts at 12 o'clock
- advances clockwise
- use SVG circle geometry with `stroke-dasharray` / `stroke-dashoffset`
- round geometry consistent with Figma
- add the 4px start stop at 12 o'clock
- hide SVG from assistive technology

If a round progress cap conflicts with the Figma stop geometry, preserve the visible Figma result and document the chosen SVG line-cap behavior.

# Tokens

Verify actual generated token names before implementation.

Use semantic tokens for:

- progress color
- remaining track color
- track border
- stop border
- radius
- border width

Use component tokens only for Progress Bar anatomy-specific dimensions.

Do not hardcode colors.

Do not introduce component tokens that merely alias semantic color, spacing, or radius values.

# Accessibility

Root:

```tsx
role="progressbar"
aria-valuemin={0}
aria-valuemax={100}
aria-valuenow={clampedValue}
```

Accessible naming priority:

- existing `aria-label`
- existing `aria-labelledby`
- `label`

If `getValueText` exists:

```tsx
aria-valuetext={getValueText(clampedValue)}
```

Do not add `tabIndex`. The component has no keyboard interaction.

# Storybook

Create:

```txt
Playground
Variants
Examples
```

Playground controls:

- value
- variant
- size
- label

Variants must compare both visual variants, both sizes, and values:

```txt
0, 10, 20, 50, 80, 100
```

Examples should use realistic LegacyHQ process language.

# Tests

Test:

- role and ARIA values
- clamping below 0 and above 100
- arbitrary value such as 37
- variant classes
- size classes
- accessible label
- `getValueText`
- ref forwarding
- SVG hidden from assistive technology
- zero and complete states

Avoid visual pixel tests.

# Preserve

Do not:

- install Tailwind
- install MUI
- create public TrackSegment, ProgressSegment, or TrackStop components
- create slider behavior
- add animation
- add indeterminate behavior
- use Figma image assets
- hardcode tokenized values
- modify unrelated components

# Validation

Run:

```bash
npm test -- progress-bar
npm run typecheck
npm run build-storybook
```

Run full tests if practical:

```bash
npm test
```

# Final output

Summarize:

1. Files created
2. API implemented
3. Linear rendering strategy
4. Circular SVG strategy
5. Tokens used/added
6. Accessibility behavior
7. Storybook coverage
8. Tests and validation
9. Remaining manual QA
