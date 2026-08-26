# Generate Breadcrumbs Component

Use `breadcrumbs-spec.md` as the source of truth.

## Goal

Generate a production-ready Breadcrumbs component.

Breadcrumbs is a navigation molecule that renders an ordered trail of `Link` items ending in a
non-interactive current-page item.

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
breadcrumbs/
├─ breadcrumbs.tsx
├─ breadcrumbs.types.ts
├─ breadcrumbs.module.css
├─ Breadcrumbs.test.tsx
├─ Breadcrumbs.stories.tsx
├─ breadcrumbs.mdx
└─ index.ts
```

---

## Props

```ts
export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  className?: string;
}
```

Defaults:

```ts
ariaLabel = 'Breadcrumb'
```

---

## Accessibility Rules

- Root is a `nav` with an accessible name (`aria-label`, default `'Breadcrumb'`).
- Every item with `href` renders as the real `Link` atom.
- The item without `href` (always treat it as the current page) renders as non-interactive text
  with `aria-current="page"`.
- The `/` separator is `aria-hidden="true"` and does not appear before the first item.

---

## Storybook Stories

Create:
- Playground
- Composition (short trail, deep trail, with icons, single item)

---

## Test Requirements

Create tests for:
- renders one item per entry, in order
- no separator before the first item
- separator before every subsequent item
- items with href render as a link
- the item without href renders as non-interactive text with aria-current="page"
- iconBefore/iconAfter render when provided
- default and custom ariaLabel
- className support
- spacing token present in the CSS module

---

## Rules

1. Follow breadcrumbs-spec.md exactly.
2. Use semantic CSS variables - never primitives.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. Reuse the existing `Link` atom for ancestor items - do not reimplement its hover/focus/press
   styling locally.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders every story.
- Verify CSS uses variables.
- Verify implementation matches the spec.
