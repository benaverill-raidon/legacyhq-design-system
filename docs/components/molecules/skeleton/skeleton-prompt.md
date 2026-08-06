# Generate Skeleton Component

Use `skeleton-spec.md` as the source of truth.

## Goal

Generate a production-ready Skeleton component.

Skeleton is a non-interactive molecule that renders a pulsing placeholder shape in place of content
that hasn't finished loading yet.

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
skeleton/
├─ skeleton.tsx
├─ skeleton.types.ts
├─ skeleton.module.css
├─ Skeleton.test.tsx
├─ Skeleton.stories.tsx
├─ skeleton.mdx
└─ index.ts
```

---

## Props

```ts
export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: 'default' | 'subtle';
  shape?: 'rectangle' | 'circle';
  label?: string;
}
```

Defaults:

```ts
appearance = 'subtle'
shape = 'rectangle'
```

---

## Accessibility Rules

- Skeleton is not interactive and not focusable.
- `label` unset (default): `aria-hidden="true"`, no role.
- `label` set: `role="status"`, `aria-live="polite"`, and a visually-hidden span rendering the
  label text - matching Spinner's existing `label` pattern exactly.
- The pulse animation must be disabled under `prefers-reduced-motion: reduce`.

---

## Storybook Stories

Create:
- Playground
- Variants (appearance x shape matrix)
- Composition (text lines, a list row with an avatar circle, a card sketch, a labelled instance)

---

## Test Requirements

Create tests for:
- default render
- default appearance/shape
- each prop overriding its default
- className support
- ref forwarding to the root element
- arbitrary sizing via `style`
- decorative default (aria-hidden, no role)
- label (role="status", aria-live="polite", visually-hidden text)
- native div attributes forward through `...rest`
- color tokens present in the CSS module for both appearances
- full-round radius token present for the circle shape
- pulse animation + reduced-motion override present in the CSS module

---

## Rules

1. Follow skeleton-spec.md exactly.
2. Use semantic and component CSS variables - never primitives - for color, radius, and sizing.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. No dedicated `width`/`height` props - forward `style`/`...rest` to the root `div` instead,
   following ProgressBar's existing convention, since usages need fully arbitrary per-instance
   sizing that a fixed prop or enum can't cover.
8. The pulse is a self-contained CSS animation on the root element - it must run regardless of
   which `appearance` is selected, not require switching appearance to animate.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders every story.
- Verify CSS uses variables.
- Verify implementation matches the spec.
