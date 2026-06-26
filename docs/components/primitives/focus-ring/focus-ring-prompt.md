# Generate Focus Ring Primitive

Use `focus-ring-spec.md` as the source of truth.

## Goal

Generate a production-ready Focus Ring primitive for our internal React component library.

Focus Ring is used to visually indicate the currently focused interactive element.

---

## Inputs

Use these inputs:
- `focus-ring-checklist.md` for design/product context
- `focus-ring-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma screenshot as visual reference
- Generated token CSS files:
  - `packages/ui/src/tokens/generated/tokens.css`
  - `packages/ui/src/tokens/generated/light.css`
  - `packages/ui/src/tokens/generated/dark.css`

If anything conflicts, follow `focus-ring-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules
- CSS Variables

---

## Implementation

Create both:
1. CSS utility classes for internal component usage
2. A thin React wrapper component

Create:

```txt
packages/ui/src/components/primitives/FocusRing/
├─ FocusRing.module.css
├─ FocusRing.types.ts
├─ FocusRing.tsx
├─ FocusRing.test.tsx
├─ FocusRing.stories.tsx
└─ index.ts
```

---

## Component API

```ts
export type FocusRingBorderWidth = 'default' | 'compact';

export interface FocusRingProps {
  children: React.ReactElement;
  borderWidth?: FocusRingBorderWidth;
  className?: string;
  disabled?: boolean;
}
```

Default:

```ts
borderWidth = 'default'
disabled = false
```

---

## Styling Requirements

Use CSS Modules.

Use CSS variables only.

Required token mapping:

```txt
default → --border-width-bold
compact → --border-width-default
both → --color-border-focused
```

Preferred CSS behavior:

```css
.focusRing:focus-visible {
  outline-style: solid;
  outline-color: var(--color-border-focused);
  outline-offset: 2px;
}

.focusRingDefault:focus-visible {
  outline-width: var(--border-width-bold);
}

.focusRingCompact:focus-visible {
  outline-width: var(--border-width-default);
}
```

Important:
- Use `:focus-visible`.
- Use outset ring only.
- Use 2px outline offset.
- Do not hardcode colors.
- Do not import MUI.
- Do not import Tailwind.
- Do not make non-interactive elements focusable.
- Do not create layout shift.
- Radius should inherit from the focused element where possible.

---

## Visual Requirements

Match the Figma screenshot:
- visible outline around focused controls
- supports light and dark surfaces
- `default` variant appears as 2px
- `compact` variant appears as 1px
- works on buttons, checkboxes, text fields, and range/slider controls

---

## Accessibility Rules

- Focus Ring itself is visual only.
- Do not add ARIA roles.
- Do not add labels.
- Do not change keyboard behavior.
- The focused child element remains responsible for accessibility semantics.
- Ensure focus is visibly indicated for keyboard users.

---

## Storybook Requirements

Create stories for:
- Basic
- Default border width
- Compact border width
- Button example
- Checkbox example
- Text field example
- Dark surface example

---

## Test Requirements

Create tests for:
- Renders child
- Applies default border width
- Applies compact border width
- Applies custom className
- Does not apply focus ring styling when disabled

---

## Rules

1. Follow `focus-ring-spec.md` exactly.
2. Use `--color-border-focused` for color.
3. Use `--border-width-bold` for default.
4. Use `--border-width-default` for compact.
5. Use `:focus-visible`.
6. No MUI.
7. No Tailwind.
8. Do not hardcode design values when a token exists.
9. Keep implementation small.
10. Export component and types.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify Storybook compiles.
- Verify tests compile.
- Verify CSS uses variables for color and width.
- Verify implementation matches the Figma screenshot and spec.
