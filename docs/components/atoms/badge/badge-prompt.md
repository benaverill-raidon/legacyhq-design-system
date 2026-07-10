# Generate Badge Component

Use `badge-spec.md` as the source of truth.

## Goal

Generate a production-ready Badge component.

Badge is a small, non-interactive component used to display numeric values.

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
Badge/
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ badge.tsx
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ badge.types.ts
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ badge.module.css
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Badge.test.tsx
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Badge.stories.tsx
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ index.ts
```

---

## Props

```ts
export interface BadgeProps {
  children: React.ReactNode;

  tone?:
    | 'default'
    | 'inverse'
    | 'brand'
    | 'success'
    | 'error';

  ariaLabel?: string;
  className?: string;
}
```

Default:

```ts
tone = 'default'
```

---

## Accessibility Rules

- Badge is not interactive
- Badge is not focusable
- Support aria-label
- Do not add button behavior

---

## Storybook Stories

Create:
- Default
- Inverse
- Brand
- Success
- Error

Examples:

```tsx
<Badge>1</Badge>

<Badge tone="brand">
  1
</Badge>

<Badge tone="success">
  +1
</Badge>

<Badge tone="error">
  -1
</Badge>
```

---

## Test Requirements

Create tests for:
- children rendering
- tone rendering
- aria-label support
- className support

---

## Rules

1. Follow badge-spec.md exactly.
2. Use semantic CSS variables.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. Keep the implementation simple.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles.
- Verify CSS uses variables.
- Verify implementation matches the spec.
