# Switch Component Codex Instructions

## Task

Implement the `Switch` atom component for the design system.

## Source Priority

1. `switch-spec.md`
2. `switch-prompt.md`
3. Figma screenshots / Figma plugin inspection
4. `switch-checklist.md`

If anything conflicts, follow the higher-priority source.

## Folder

Create:

```txt
packages/ui/src/components/atoms/switch/
├── switch.tsx
├── switch.types.ts
├── switch.module.css
├── switch.test.tsx
├── switch.stories.tsx
└── index.ts
```

## Implementation Direction

Build Switch as a native checkbox input with switch semantics:

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
  isLoading?: boolean;
  showIcons?: boolean;
  onCheckedChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
```

There is no `invalid` prop - Figma's `switch` component set has no such variant (only `size`,
`state`, `isChecked`, `isDisabled`, `isLoading`).

## Accessibility

- Native input remains present and accessible.
- Use `role="switch"`.
- Visible label is optional.
- If no visible label is provided, consumer must provide `aria-label`.
- Disabled uses native `disabled`.
- Required uses native `required` where valid and a visible asterisk after the label.
- `isLoading` sets `aria-busy="true"` and blocks toggling via `preventDefault` on click (a native
  checkbox toggles before `onChange` fires) - it does NOT set native `disabled`, so the control
  stays focusable, unlike `disabled`. Figma's `isLoading=true` artwork is pixel-identical to the
  resting state; replace the visible on/off mark with a small `Spinner` (in the same `.icon` slot,
  inheriting that slot's own color - no color override needed) as a usability improvement beyond
  the literal mockup, and suppress hover/press CSS while loading, the same way disabled already
  does.
- `showIcons` (default `true`) toggles only the decorative check/X marks - `false` renders a bare
  track/thumb. Does not affect the `isLoading` Spinner, which is a functional signal, not decoration.
- Use shared Focus Ring utilities.
- Do not create custom ARIA roles beyond switch semantics.
- Do not recreate native keyboard behavior.

## Visual + Token Requirements

Use semantic color tokens:

- unchecked track default: `--color-background-neutral-bold-default`
- unchecked track hovered: `--color-background-neutral-bold-hover`
- checked track default: `--color-background-success-bold-default`
- checked track hovered: `--color-background-success-bold-hover`
- disabled: `--color-background-disabled`
- inverse content/marks: `--color-content-inverse`
- default content: `--color-content-default`
- disabled content: `--color-content-disabled`

Use the current shared dimension, spacing, and radius tokens directly for geometry.
Do not introduce component-scoped Switch token aliases.

- `md`: 40px by 20px track, 16px thumb, 2px inset, 16px radius, 6px on/off mark inset
- `sm`: 32px by 16px track, 12px thumb, 2px inset, 8px radius, 4px on/off mark inset
- internal marks: 12px

## Animation

Implement a smooth state transition.

The thumb should move between unchecked and checked positions.

Add a subtle Material-inspired thumb expansion, triggered on both hover and pressed (not pressed
alone) so the cue starts as soon as the pointer arrives rather than only on click.

Respect `prefers-reduced-motion`.

## Storybook

Use the library's unified structure:

```txt
Switch
├─ Docs (.mdx)
├─ Playground
├─ Sizes
├─ States
├─ Content
└─ EdgeCases
```

Omit a separate Variants page - `size` is the only variant-like axis and Sizes covers it.

Include:

- Playground
- Sizes: `md` and `sm` side by side
- States: unchecked/checked crossed with hover/focus/disabled/loading, required, and a live example
- Content: no visible label with aria-label, form example, settings row example, dark theme example
- EdgeCases: reduced motion note, long label wrapping in a narrow container

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
- loading state: blocks toggling, sets `aria-busy`, stays focusable (not native `disabled`),
  replaces the on/off mark with a Spinner in the same slot, suppresses hover/press CSS
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
