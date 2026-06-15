# Toggle Component Codex Instructions

## Task

Implement the `Toggle` atom component for the design system.

## Source Priority

1. `toggle-component-spec.md`
2. `toggle-component-prompt.md`
3. Figma screenshots / Figma plugin inspection
4. `toggle-component-checklist.md`

If anything conflicts, follow the higher-priority source.

## Folder

Create:

```txt
packages/ui/src/components/atoms/toggle/
├── toggle.tsx
├── toggle.types.ts
├── toggle.module.css
├── toggle.test.tsx
├── toggle.stories.tsx
└── index.ts
```

## Implementation Direction

Build Toggle as a native checkbox input with switch semantics:

```tsx
<input type="checkbox" role="switch" />
```

Do not use div-only switch behavior.

Do not use MUI.

Do not use Tailwind.

Do not use full-control SVG icons.

Draw the track, thumb, and visual states with CSS and design tokens.

Internal check/X marks may be CSS pseudo-elements or private inline SVG, but they must not be added to the shared icon library.

## API

Use this API unless the spec says otherwise:

```ts
export interface ToggleProps
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

## Accessibility

- Native input remains present and accessible.
- Use `role="switch"`.
- Visible label is optional.
- If no visible label is provided, consumer must provide `aria-label`.
- Disabled uses native `disabled`.
- Required uses native `required` where valid and a visible asterisk after the label.
- Use shared Focus Ring utilities.
- Do not create custom ARIA roles beyond switch semantics.
- Do not recreate native keyboard behavior.

## Visual + Token Requirements

Use semantic color tokens:

- unchecked track default: `--color-background-neutral-bold-default`
- unchecked track hovered: `--color-background-neutral-bold-hovered`
- checked track default: `--color-background-success-bold-default`
- checked track hovered: `--color-background-success-bold-hovered`
- disabled: `--color-background-disabled`
- inverse content/marks: `--color-content-inverse`
- default content: `--color-content-default`
- disabled content: `--color-content-disabled`

Use component-scoped geometry tokens where needed:

- `--component-toggle-track-width`
- `--component-toggle-track-height`
- `--component-toggle-thumb-size`
- `--component-toggle-thumb-offset`
- `--component-toggle-thumb-translate-x`

Codex should inspect the Figma component via plugin access to determine the exact geometry values.

Do not use semantic spacing tokens directly for width/height of the track or thumb unless the component token maps to them.

## Animation

Implement a smooth state transition.

The thumb should move between unchecked and checked positions.

Add a subtle Material-inspired pressed interaction, such as thumb expansion or slight compression.

Respect `prefers-reduced-motion`.

## Storybook

Use:

```txt
Toggle
├─ Playground
├─ Variants
└─ Examples
```

Include:

- Playground
- unchecked
- checked
- disabled
- disabled checked
- required
- no visible label with aria-label
- form example
- settings row example
- dark theme example
- reduced motion note

## Tests

Use Vitest and React Testing Library.

Test:

- renders
- renders label
- checked state
- defaultChecked state
- controlled usage
- uncontrolled usage
- disabled state
- required state
- `role="switch"`
- `onCheckedChange`
- custom className
- forwards native input props
- no visible label with aria-label
- keyboard/native interaction

## Final Output

After implementation, summarize:

1. Architecture decisions
2. Accessibility decisions
3. Animation decisions
4. Assumptions made
5. Missing tokens
6. Files changed
7. Spec compliance confirmation
