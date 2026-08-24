# Generate Text Field Component

Use `text-field-spec.md` as the source of truth.

## Goal

Generate a production-ready Text Field component.

Text Field wraps a real native `<input>` in a bordered frame with consistent sizing, borders, and
interaction states. It is a molecule - the trailing slot composes a real Icon Button/Button, not
just decoration around a bare input.

---

## Framework

- React
- TypeScript

---

## Styling

- CSS Modules
- CSS Variables only
- Use generated token CSS
- No hardcoded values

---

## Expected Files

```txt
text-field/
├─ text-field.tsx
├─ text-field.types.ts
├─ text-field.module.css
├─ TextField.test.tsx
├─ TextField.stories.tsx
├─ text-field.mdx
└─ index.ts
```

---

## Props

```ts
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'default' | 'subtle';
  invalid?: boolean;
  /** Icon or short text prefix only. Always decorative (aria-hidden). */
  iconBefore?: React.ReactNode;
  /** Icon, or an interactive control (IconButton/Button). Never forced aria-hidden. */
  iconAfter?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}
```

Defaults:

```ts
size = 'md'
appearance = 'default'
invalid = false
```

---

## Accessibility Rules

- Render a real `<input>` - never a styled non-form element standing in for one.
- `invalid` sets `aria-invalid="true"` on the input.
- `iconBefore` is always `aria-hidden` - it is icon-or-text only, never interactive.
- `iconAfter` is never forced `aria-hidden` - it may hold a real interactive `IconButton`/`Button`
  (most commonly a clear action) and must remain focusable with its own accessible name.
- Do not manage labelling internally - the consumer supplies a `<label htmlFor>` or
  `aria-label`/`aria-labelledby`.

---

## Storybook Stories

Create:
- Playground
- Variants (size x appearance)
- States (hover, focus, invalid, disabled - use `data-force-state` the way Button/Checkbox do for
  hover/focus so they're visible as a static reference)
- Content (iconBefore as icon and as text prefix, iconAfter as a real clearable IconButton action,
  placeholder vs. value)
- Edge Cases (long value, narrow container, dark surface)

---

## Test Requirements

Create tests for:
- renders a native input
- size renders correctly
- appearance renders correctly
- invalid sets aria-invalid
- disabled prevents interaction
- iconBefore/iconAfter render when provided
- iconBefore's wrapper is aria-hidden; iconAfter's wrapper is not, even when it holds a plain element
- className and inputClassName both apply
- forwards native input props (value, onChange, placeholder, type, etc.)
- radius/spacing tokens present in the CSS module

---

## Rules

1. Follow text-field-spec.md exactly.
2. Use semantic CSS variables - never primitives, except the documented `--measurement-6` gap
   (matches Toggle Button's own precedent for the same missing token).
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. Do not add a `state` prop - hover/focus/typing/filled all derive from native pseudo-classes and
   the input's own value, not a controlled prop.
8. Implement the focus-frame indicator via `:focus-within` using Focus Ring's own token values
   (`--color-border-focus`, `--border-width-md`, `2px` offset) rather than a literal
   border-width change, to avoid a layout shift on focus/blur.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders every story.
- Verify CSS uses variables.
- Verify implementation matches the spec.
