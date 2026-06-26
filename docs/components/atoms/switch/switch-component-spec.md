# Switch Component Spec

## Component Overview

`Switch` is an atom component used to switch between enabled and disabled states. It is visually similar to a switch and functionally implemented with a native checkbox input using `role="switch"`.

The component must be accessible, token-driven, theme-aware, and consistent with Checkbox and Radio architecture.

## Folder Location

```txt
packages/ui/src/components/atoms/switch/
```

## Required Files

```txt
switch.tsx
switch.types.ts
switch.module.css
switch.test.tsx
switch.stories.tsx
index.ts
```

## Anatomy

```txt
Switch
├─ root
├─ input[type="checkbox"][role="switch"]
├─ indicator
│  ├─ track
│  ├─ thumb
│  └─ optional internal check/X marks
└─ label
   └─ required indicator
```

## Public API

```ts
export interface SwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'checked' | 'defaultChecked' | 'size'
  > {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  onCheckedChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
```

## Default Props

```ts
checked = undefined
defaultChecked = undefined
disabled = false
required = false
invalid = false
```

## Behavior

- Supports controlled usage with `checked`.
- Supports uncontrolled usage with `defaultChecked`.
- Calls `onCheckedChange(checked, event)` when changed.
- Uses native checkbox behavior.
- Uses `role="switch"` to communicate switch semantics to assistive technology.
- Visible label is optional.
- If no visible label is provided, an accessible label such as `aria-label` must be provided by the consumer.

## States

Supported states:

- unchecked
- checked
- hover
- checked hover
- pressed
- checked pressed
- focus
- checked focus
- disabled
- disabled checked
- required
- invalid, if needed for form validation consistency

## Visual Requirements

- Track and thumb are drawn with CSS, not full-control SVG icons.
- The track uses tokenized background colors.
- The thumb uses tokenized surface/content colors.
- Internal check/X marks are private component visuals only.
- Do not add check/X marks to the shared icon library.
- The control should visually match Figma as closely as possible.
- Codex should inspect Figma using the plugin for exact dimensions.

## Token Mapping

Use semantic tokens for colors.

### Track Color

Unchecked default:

```css
--color-background-neutral-bold-default
```

Unchecked hover:

```css
--color-background-neutral-bold-hovered
```

Checked default:

```css
--color-background-success-bold-default
```

Checked hover:

```css
--color-background-success-bold-hovered
```

Disabled:

```css
--color-background-disabled
```

### Content / Mark Color

```css
--color-content-inverse
--color-content-default
--color-content-disabled
```

### Focus

Use shared Focus Ring utility classes and tokens.

### Geometry Tokens

Do not use semantic spacing tokens directly for component anatomy if exact values are needed.

Preferred approach:

```css
--component-switch-track-width
--component-switch-track-height
--component-switch-thumb-size
--component-switch-thumb-offset
--component-switch-thumb-translate-x
```

These may map to primitive values or existing spacing tokens after Figma dimensions are confirmed.

## Accessibility

- Native input must remain present.
- Input must be focusable.
- Input must support keyboard interaction.
- Input must support form submission.
- Use `role="switch"`.
- Use `aria-checked` only if needed; native checked state should usually be sufficient with `role="switch"`.
- Do not add custom keyboard handlers unless native behavior is insufficient.
- Do not use `div role="switch"`.
- Required indicator appears after visible label.
- Disabled state uses native `disabled` attribute.

## Animation Requirements

- Animate thumb position between off and on states.
- Support a subtle Material-inspired pressed interaction, such as temporary thumb expansion or compression.
- Use CSS transitions.
- Respect `prefers-reduced-motion` by reducing or removing movement.
- Animation should feel smooth but not decorative enough to delay interaction feedback.

## Storybook Structure

```txt
Switch
├─ Playground
├─ Variants
└─ Examples
```

## Storybook Stories

### Playground

Controls:

- checked
- disabled
- required
- invalid
- label

### Variants

Show:

- unchecked
- checked
- hover, if practical to document visually
- focus
- disabled
- disabled checked
- required

### Examples

Show:

- labeled switch
- switch without visible label
- setting row usage
- form usage
- disabled setting
- dark theme example
- reduced motion note

## Engineering Requirements

- Use React and TypeScript.
- Use CSS Modules.
- Use CSS variables and design tokens.
- No MUI.
- No Tailwind.
- No hardcoded design values where tokens exist.
- Preserve public API consistency with Checkbox.
- Export from `index.ts`.

## Testing Requirements

Use Vitest and React Testing Library.

Test:

- renders successfully
- renders label
- supports checked state
- supports uncontrolled defaultChecked
- supports controlled checked
- calls `onCheckedChange`
- supports disabled
- supports required
- supports invalid class/state if implemented
- supports custom className
- forwards native input props
- renders with `role="switch"`
- supports no visible label with `aria-label`
- native keyboard interaction works

## QA Checklist

- TypeScript compiles.
- Tests compile and pass.
- Storybook compiles.
- Component uses native input.
- Component uses `role="switch"`.
- Component uses Focus Ring utilities.
- Component uses semantic color tokens.
- Component uses component-scoped geometry tokens where needed.
- No shared icon-library switch assets are introduced.
- Motion respects `prefers-reduced-motion`.


