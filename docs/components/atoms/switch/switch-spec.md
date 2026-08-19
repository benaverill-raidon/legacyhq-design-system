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
  isLoading?: boolean;
  showIcons?: boolean;
  onCheckedChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
```

There is no `invalid` prop. Figma's `switch` component set has no such variant axis (only `size`,
`state`, `isChecked`, `isDisabled`, `isLoading`), and the implementation correctly doesn't add one -
an earlier revision of this spec incorrectly documented `invalid` as if it existed.

## Default Props

```ts
checked = undefined
defaultChecked = undefined
disabled = false
required = false
isLoading = false
showIcons = true
```

## Behavior

- Supports controlled usage with `checked`.
- Supports uncontrolled usage with `defaultChecked`.
- Calls `onCheckedChange(checked, event)` when changed.
- Uses native checkbox behavior.
- Uses `role="switch"` to communicate switch semantics to assistive technology.
- Visible label is optional.
- If no visible label is provided, an accessible label such as `aria-label` must be provided by the consumer.
- `isLoading` blocks toggling (via `preventDefault` on click, since a native checkbox toggles its
  own checked state before `onChange` fires) and sets `aria-busy="true"`, but does **not** set the
  native `disabled` attribute - the control stays focusable and reachable by Tab, unlike `disabled`.
  Figma's `isLoading=true` artwork is otherwise pixel-identical to the resting state (no visible
  differentiation); this implementation additionally replaces the visible on/off mark with a small
  `Spinner` in the same slot (inheriting that slot's own inherited color - no color override of its
  own) as a usability improvement beyond the literal mockup, and suppresses the hover/pressed track
  treatment while loading (matching how `disabled` already suppresses it).
- `showIcons` (default `true`) toggles only the decorative check/X marks drawn inside the track.
  Setting it to `false` renders a bare track/thumb with no internal icon. It does not affect the
  `isLoading` Spinner, which is a functional status signal rather than decoration and still renders
  in the same slot regardless of `showIcons`.

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
- loading (blocks toggling, `aria-busy`, no visible change from Figma beyond replacing the on/off
  mark with a Spinner in the same slot)
- icons hidden (`showIcons={false}` - a bare track/thumb, no check/X mark; independent of loading)

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

Use the shared dimension, spacing, and radius tokens directly. Do not create
component-scoped Switch aliases.

- `md`: 40px by 20px track, 16px thumb, 2px inset, 16px radius, 6px on/off mark inset
- `sm`: 32px by 16px track, 12px thumb, 2px inset, 8px radius, 4px on/off mark inset
- internal marks: 12px

The `md` on/off mark inset was previously aliased to `--spacing-sm` (8px) - verified against the
live Figma component to actually be 6px (`--measurement-6`), 2px tighter than the old value. `sm`'s
4px inset was already correct.

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
- Support a subtle Material-inspired thumb expansion (`scaleX(1.16)`), triggered on both hover and
  pressed - not pressed alone - so the cue starts as soon as the pointer arrives rather than only
  on click.
- Use CSS transitions.
- Respect `prefers-reduced-motion` by reducing or removing movement.
- Animation should feel smooth but not decorative enough to delay interaction feedback.

## Storybook Structure

Unified story structure, matching the rest of the library:

```txt
Switch
├─ Docs (.mdx)
├─ Playground
├─ Sizes
├─ States
├─ Content
└─ EdgeCases
```

There's no separate Variants page: `size` is the only variant-like axis, and it's covered by Sizes.

### Playground

Controls:

- checked
- disabled
- required
- isLoading
- showIcons
- label

### Sizes

Show `md` and `sm` side by side, unchecked and checked.

### States

Show, pinned as a static reference:

- unchecked / checked
- hover, unchecked / checked
- focus visible, unchecked / checked
- disabled, unchecked / checked
- loading, unchecked / checked
- required
- a live, click-driven example

### Content

Show:

- labeled switch
- switch without visible label (`aria-label` only)
- setting row usage
- form usage
- dark theme example

### EdgeCases

Show:

- reduced motion note
- long label wrapping in a narrow container

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
- supports loading: blocks toggling, sets `aria-busy`, stays focusable (not native `disabled`),
  replaces the on/off mark with a Spinner in the same slot (not the thumb), inherits that slot's
  color with no override, suppresses hover/pressed CSS
- supports `showIcons={false}`: hides the decorative check/X marks; the loading Spinner still
  renders even when `showIcons` is false
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
- Component uses the current shared geometry tokens without component aliases.
- No shared icon-library switch assets are introduced.
- Motion respects `prefers-reduced-motion`.
- `isLoading` doesn't remove the control from the tab order (no native `disabled`).
