# Generate Button Group Component

Use `button-group-spec.md` as the source of truth.

## Goal

Generate a production-ready Button Group component.

Button Group is a non-interactive layout molecule that arranges `Button`/`IconButton` children with
consistent spacing and direction. It owns no button styling of its own.

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
button-group/
├─ button-group.tsx
├─ button-group.types.ts
├─ button-group.module.css
├─ ButtonGroup.test.tsx
├─ ButtonGroup.stories.tsx
├─ button-group.mdx
└─ index.ts
```

---

## Props

```ts
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}
```

Defaults:

```ts
orientation = 'horizontal'
```

---

## Accessibility Rules

- Button Group adds no keyboard behavior - children keep native Tab order
- No `aria-label`/`aria-labelledby`: plain `div`, no role
- `aria-label` or `aria-labelledby` present: add `role="group"`

---

## Storybook Stories

Create:
- Playground
- Variants (orientation)
- Composition (toolbar, dialog action row, mixed Button/IconButton)

---

## Test Requirements

Create tests for:
- children rendering in order
- default orientation
- orientation override
- no role when unlabeled
- role="group" when aria-label is present
- forwards native div attributes (className, data-*)
- gap token present in the CSS module

---

## Rules

1. Follow button-group-spec.md exactly.
2. Use semantic CSS variables - never primitives.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. Do not restyle child buttons - Button Group only contributes spacing/direction via its own root.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders both orientations.
- Verify CSS uses variables.
- Verify implementation matches the spec.
