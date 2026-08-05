# Generate Pagination Component

Use `pagination-spec.md` as the source of truth.

## Goal

Generate a production-ready Pagination component.

Pagination is a fully-controlled navigation molecule that renders a previous control, a computed
range of page numbers (with ellipses for gaps), and a next control.

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
pagination/
├─ pagination.tsx
├─ pagination.types.ts
├─ pagination.module.css
├─ Pagination.test.tsx
├─ Pagination.stories.tsx
├─ pagination.mdx
└─ index.ts
```

---

## Props

```ts
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  getPageLabel?: (page: number) => string;
  ariaLabel?: string;
  className?: string;
}
```

Defaults:

```ts
siblingCount = 1
boundaryCount = 1
previousLabel = 'Previous page'
nextLabel = 'Next page'
getPageLabel = (page) => `Page ${page}`
ariaLabel = 'Pagination'
```

---

## Range Algorithm

Implement a pure `getPaginationRange(currentPage, totalPages, siblingCount, boundaryCount)` helper
that returns `Array<number | 'ellipsis'>`:

1. Always include `1..boundaryCount` (clamped to totalPages).
2. Always include the last `boundaryCount` pages (clamped to 1).
3. Include `currentPage - siblingCount` through `currentPage + siblingCount` (clamped).
4. De-duplicate and sort.
5. Walking the sorted list: if two consecutive kept pages are exactly 2 apart, show the single
   hidden page directly instead of an ellipsis (collapsing exactly one page wastes space rather
   than saving it). If they are more than 2 apart, insert a single `'ellipsis'`.

Export this function so it can be unit-tested independently of rendering.

---

## Accessibility Rules

- Root is a `nav` with an accessible name (`ariaLabel`, default `'Pagination'`).
- The current page's `ToggleButton` gets `aria-current="page"` in addition to `isSelected`.
- Previous/next `IconButton`s get `aria-label` (`previousLabel`/`nextLabel`) and are `disabled` at
  the first/last page.
- The ellipsis renders as `aria-hidden="true"` plain text, not a button.

---

## Storybook Stories

Create:
- Playground (controlled via a small wrapper component holding currentPage in state)
- Composition (few pages/no ellipsis, many pages/both ellipses, at the start, at the end,
  custom sibling/boundary counts)

---

## Test Requirements

Create tests for the range algorithm (`getPaginationRange`) directly:
- no ellipsis when totalPages is small
- ellipsis on both sides when currentPage is in the middle of a large range
- ellipsis only at the end when currentPage is near the start
- ellipsis only at the start when currentPage is near the end
- respects custom siblingCount/boundaryCount

Create tests for the rendered component:
- renders the correct number of page buttons for a small page count
- clicking a page button calls onPageChange with that page
- clicking previous/next calls onPageChange with currentPage -1/+1
- previous is disabled on page 1
- next is disabled on the last page
- the current page has aria-current="page"
- default and custom ariaLabel/previousLabel/nextLabel

---

## Rules

1. Follow pagination-spec.md exactly.
2. Use semantic CSS variables - never primitives.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component, types, and the range-algorithm helper.
7. Reuse ToggleButton and IconButton directly - do not reimplement their visual states locally.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders every story.
- Verify CSS uses variables.
- Verify implementation matches the spec.
