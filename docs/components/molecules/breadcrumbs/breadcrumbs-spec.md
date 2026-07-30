# Breadcrumbs

## Overview

### Purpose
Breadcrumbs are a navigation system used to show a user's location in a site or app.

### Description
Use Breadcrumbs to render an ordered trail of ancestor links ending in the current page.

### Category
Molecule

### Design Reference
- Figma Component: `breadcrumbs` (single component, not a variant set - node `2026:746`, file
  `Components v1.0.0`)
- Composed from `code-parts / <breadcrumb-item>` (node `2022:861`), a dev-reference part exposing
  `text` (TEXT), `iconBefore` (BOOLEAN), `iconAfter` (BOOLEAN) component properties
- Each item wraps the existing `link` component instance (`appearance=subtle`, `size=md`)
- The leading `/` separator is hidden (`visible=false`) on the first item only, and otherwise
  precedes every subsequent item

---

## Usage Guidelines

### Use When
- Showing location within a nested/hierarchical section (settings, nested folders, categories)
- Letting users jump back to any ancestor level in one step

### Do Not Use When
- The app/section has no real hierarchy to show
- Showing progress through a linear flow with unvisited future steps - use Progress Indicator
- More than one trail is needed on the same page

---

## Anatomy

```text
Breadcrumbs
└─ nav[aria-label="Breadcrumb"]
   └─ ol
      ├─ li
      │  └─ Link | current-page text  (no separator - first item)
      ├─ li
      │  ├─ "/" separator
      │  └─ Link | current-page text
      └─ li (last item)
         ├─ "/" separator
         └─ current-page text (aria-current="page")
```

### Structure Notes
- Single root `nav` landmark
- One `ol` > `li` per item, in the order given
- A `/` separator precedes every item except the first
- Every item except the last renders as a `Link`; the last always renders as non-interactive text
- Each item may include an optional icon before and/or after its label

---

## Design Decisions Beyond the Literal Figma Sample

The Figma `breadcrumbs` component is a single 8-item demo where every crumb - including the last -
uses an identical `Link` instance (`state=default`, `appearance=subtle`). It does not, on its own,
demonstrate a distinct "current page" treatment. Per the WAI-ARIA Breadcrumb Pattern (the
established a11y convention for this exact component, not a Figma-specific choice), the component
makes the last item in `items` render as non-interactive text with `aria-current="page"` rather than
a link - this is a deliberate adaptation, not a literal reproduction of the flat demo, and is called
out here rather than silently diverging from the visual sample.

Whether an item is "current" is driven entirely by the presence of `href` - there is no separate
`isCurrent` flag. An item without an `href` is the current page; every other item must have one.

---

## Variants

Breadcrumbs has no Figma-level variant axis (`size`, `tone`, etc.) - the single component only
demonstrates repeating one item pattern. The only two rendered states are:

| Item state | Rendered as | Separator |
|--------------|--------------------------------|------------------------|
| Ancestor (has `href`) | `Link` (`appearance="subtle"`, `size="md"`) | `/` unless first item |
| Current (no `href`, last item) | Non-interactive text, `aria-current="page"` | `/` unless first item |

---

## Content Rules

### Supported Content
- `label`: short text or a short inline element identifying the level
- Optional `iconBefore` / `iconAfter`: a small icon adjacent to the label

### Content Length
No fixed limit - keep labels short enough that a multi-level trail doesn't wrap or overflow
awkwardly. Breadcrumbs does not truncate or wrap on narrow containers today (see Known
Limitations).

---

## Properties (API)

### `BreadcrumbItem`

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| label | ReactNode | Yes | - |
| href | string | No | - |
| target | `React.HTMLAttributeAnchorTarget` | No | `'_self'` (Link's own default) |
| iconBefore | ReactNode | No | - |
| iconAfter | ReactNode | No | - |
| onClick | `React.MouseEventHandler<HTMLAnchorElement>` | No | - |

### `BreadcrumbsProps`

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| items | BreadcrumbItem[] | Yes | - |
| ariaLabel | string | No | `'Breadcrumb'` |
| className | string | No | undefined |

---

## Accessibility

### Keyboard Support
Native `Link` (anchor) keyboard behavior for every ancestor item - Tab moves through them in order.
The current-page item is plain text and is not part of the Tab order.

### ARIA

- Root: `nav` landmark with `aria-label` (default `"Breadcrumb"`).
- Every non-current item: a real `<a>` via `Link` - no extra ARIA needed.
- The last item: `aria-current="page"` on its wrapping element, per the WAI-ARIA Breadcrumb
  Pattern.
- Separators: `aria-hidden="true"` - they're presentational, not part of the announced content.

Example:

```tsx
<Breadcrumbs
  items={[
    { label: 'Settings', href: '/settings' },
    { label: 'Account', href: '/settings/account' },
    { label: 'Security' },
  ]}
/>
```

---

## Design Tokens

### Typography
- Link items: inherited from the `Link` atom at `size="md"` (`--typography-heading-xs-*`).
- Current-page item: `--typography-heading-xs-*` (matches Link's metrics so the trail reads as one
  line) with `--color-content-default` instead of Link's subtle color.
- Separator: `--typography-body-md-*` (confirmed from Figma's bound variables - a deliberately
  lighter weight than the heading-xs crumb labels).

### Colors
- Link items: `Link`'s own `appearance="subtle"` tokens (`--color-content-subtle`, etc.)
- Current-page item: `--color-content-default`
- Separator: `--color-content-subtle`

### Spacing
- Gap between the separator and the item content, and between each `li`: `--spacing-sm` (8px,
  confirmed as `space/100` in Figma's bound variables on both the root and each item).
- Gap between an icon and the label within one item: `--spacing-xs` (4px).

---

## Behaviors

### Default
Renders the ordered trail. No animation, no interactive state beyond each `Link`'s own hover/focus/
pressed behavior (owned entirely by the `Link` atom, not reimplemented here).

---

## Dependencies

### Uses
- Link (atom) - every non-current item

### Used By
- Page headers in nested/hierarchical sections

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded colors, spacing, or typography
- No MUI dependency
- No Tailwind dependency
- Do not reimplement Link's hover/focus/pressed treatment locally - render the actual `Link` atom

---

## QA Checklist

### Visual
- [ ] Matches Figma spacing (8px between items, 4px icon-to-label)
- [ ] Separator uses body-md weight, distinct from the heading-xs crumb labels
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] Renders one `li` per item, in order
- [ ] No separator before the first item
- [ ] Separator before every subsequent item
- [ ] Items with `href` render as `Link`
- [ ] The item without `href` renders as non-interactive text
- [ ] iconBefore/iconAfter render when provided

### Accessibility
- [ ] `nav` has an accessible name (`aria-label`, default `"Breadcrumb"`)
- [ ] The current item has `aria-current="page"`
- [ ] Separators are `aria-hidden`
- [ ] Each `Link` item remains independently focusable via Tab

---

## Known Limitations
- No built-in truncation, wrapping, or "collapse middle items" behavior for long/narrow trails -
  Figma's source is a single fixed-width row and does not specify this.

## Future Enhancements
- A collapsed/overflow variant (e.g. "Home / ... / Security") for long trails or narrow viewports
