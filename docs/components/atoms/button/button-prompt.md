# Button Component Codex Prompt

Please generate the Button atom using the attached documentation and assets.

## Inputs

You have access to:

- button-checklist.md
- button-spec.md
- button-prompt.md
- Figma screenshots
- tokens.css
- light.css
- dark.css

Priority order:

1. button-spec.md
2. button-prompt.md
3. Figma screenshots
4. button-checklist.md

If anything conflicts, follow the highest-priority source.

## Goal

Create a production-ready Button atom for the internal React component library.

The component must be:

- accessible
- token-driven
- theme-aware
- fully typed
- reusable
- compatible with forms
- consistent with the existing Focus Ring, Spinner, Icon, and token architecture

## Folder Structure

Create:

```txt
packages/ui/src/components/atoms/button/
├── button.tsx
├── button.types.ts
├── button.module.css
├── button.test.tsx
├── button.stories.tsx
└── index.ts
```

## API Requirements

Implement:

```ts
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonAppearance = 'default' | 'primary' | 'subtle';

export type ButtonTone = 'neutral' | 'warning' | 'error' | 'discovery';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  tone?: ButtonTone;
  isDisabled?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
```

Default values:

```ts
size = 'md'
appearance = 'default'
tone = 'neutral'
type = 'button'
isDisabled = false
isLoading = false
isFullWidth = false
```

Use `children` for content. Do not create a `buttonText` prop.

## Architecture Requirements

Render a native `<button>`.

Button anatomy:

```txt
Button
├─ leading icon or loading spinner
├─ content
└─ trailing icon
```

Do not support icon-only buttons in this component. Icon-only actions should be handled by a future IconButton component.

Do not support selected/toggled behavior in this component. Selected behavior should be handled by a future ToggleButton component.

## Loading Behavior

When `isLoading` is true:

- render Spinner in the leading content area
- preserve the original label/content width
- keep the label visible when possible
- prevent duplicate activation
- prevent layout shift

Use this visual model:

```txt
[ spinner  Save changes ]
```

Do not collapse to spinner-only for text buttons.

Use the existing Spinner component.

## Icon Requirements

Support:

- `iconBefore`
- `iconAfter`

All button icons should use the medium icon size.

The gap between icon and content should be `spacing-075` across all button sizes.

Do not expose an icon-size prop.

## Size Requirements

Implement sizes:

| Size | Min height | Padding inline |
|---|---:|---|
| xs | 24px | spacing-100 |
| sm | 32px | spacing-100 |
| md | 40px | spacing-150 |
| lg | 48px | spacing-200 |

All sizes use:

- `border-radius-sm`
- `border-width-default`

## Token Requirements

Create component-scoped min-height tokens:

```txt
component.button.min-height.xs = 24px
component.button.min-height.sm = 32px
component.button.min-height.md = 40px
component.button.min-height.lg = 48px
```

Generated CSS variables should include:

```css
--component-button-min-height-xs
--component-button-min-height-sm
--component-button-min-height-md
--component-button-min-height-lg
```

Use existing semantic spacing tokens for padding and gap.

Use existing semantic border tokens for radius and width.

Use existing semantic color tokens for appearance/tone/state mapping.

Do not hardcode colors, spacing, typography, border radius, or border width in the component CSS.

If a needed token is missing, document it in the final output.

## Appearance and Tone Requirements

Support:

```txt
appearance: default | primary | subtle
tone: neutral | warning | error | discovery
```

Use appearance for emphasis and tone for semantic meaning.

Do not collapse these into a single `variant` prop.

Do not use the Figma `tone` property directly as the only code-level variant model.

## Focus Requirements

Consume the shared Focus Ring primitive/utilities.

Do not create custom Button-only focus ring styles.

Use `:focus-visible` behavior through the existing focus ring classes.

## Accessibility Requirements

Button must:

- render native `<button>`
- default to `type="button"`
- support submit/reset types
- support native disabled behavior
- support keyboard activation
- use visible focus styling
- communicate loading state accessibly

When loading:

- apply `aria-busy="true"`
- suppress duplicate click actions
- keep the action label visible when possible

Do not use ARIA roles to recreate native button behavior.

## Storybook Requirements

Use atom documentation structure:

```txt
Button
├─ Playground
├─ Variants
└─ Examples
```

Stories should demonstrate:

- all sizes
- all appearances
- all tones
- disabled state
- loading state
- iconBefore
- iconAfter
- full width
- realistic action examples

Do not create one story per variant permutation unless necessary.

## Testing Requirements

Use Vitest and React Testing Library.

Test:

- renders children
- default type is button
- custom type works
- size variants
- appearance variants
- tone variants
- disabled behavior
- loading behavior
- loading renders Spinner
- loading keeps visible label/content
- click suppressed while loading
- full-width behavior
- iconBefore
- iconAfter
- custom className
- native button props
- focus ring class usage

## Quality Requirements

Before finishing:

- verify TypeScript compiles
- verify tests compile
- verify Storybook compiles
- verify exports compile
- verify token usage
- verify no MUI imports
- verify no Tailwind utilities
- verify no hardcoded colors
- verify no hardcoded typography
- verify no hardcoded spacing when tokens exist

## Final Output

After implementation provide:

1. Architecture decisions
2. Accessibility decisions
3. Component tokens added
4. Missing tokens, if any
5. Assumptions made
6. Future improvements
7. Spec compliance confirmation

