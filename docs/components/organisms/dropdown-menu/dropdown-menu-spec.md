# Dropdown Menu Component Spec

## Overview

Dropdown Menu is a thin composition: Popup for positioning/dismissal, Menu for content. It adds
exactly one thing neither already provides - a fixed, always-opens-below alignment vocabulary
matching Figma's `dropdown-menu` component exactly - and pairs Popup's `padding="none"` with Menu as
its content, since Menu already carries all of its own edge padding.

## Anatomy

```txt
DropdownMenu
+- Popup
   +- trigger child (children - any focusable element, cloned by Popup for measurement/ARIA)
   +- floating panel (Popup's default skin, padding="none")
      +- Menu (every DropdownMenu prop besides children/open/onOpenChange/alignment/id/className)
```

## Public API

```ts
type DropdownMenuAlignment = 'left' | 'center' | 'right';

interface DropdownMenuProps extends Omit<MenuProps, 'id' | 'className'> {
  children: React.ReactElement;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: DropdownMenuAlignment;
  id?: string;
  className?: string;
}
```

## Defaults

```txt
alignment: left
```

Every `MenuProps` default (`size: sm`, `showSearch: true`, `showScrollbar: true`, `loading: false`,
`loadingLabel: 'Loading…'`, `emptyMessage: 'No results'`) applies unchanged, since those props pass
straight through to the rendered Menu.

## Composition

```tsx
<Popup
  open={open}
  onOpenChange={onOpenChange}
  alignment={ALIGNMENT_MAP[alignment]} // left -> bottomLeft, center -> bottomCenter, right -> bottomRight
  padding="none"
  id={id}
  className={className}
  content={<Menu sections={sections} size={size} /* ...every other MenuProps... */ />}
>
  {children}
</Popup>
```

DropdownMenu holds no state of its own beyond what it destructures from props to redistribute
between Popup and Menu - no `useState`, no `useEffect`.

## Alignment mapping

`alignment` only ever supplies Popup's *preferred* alignment as one of the three `bottom*` values -
it does not disable Popup's own viewport-fit fallback. If the preferred `bottom*` alignment would
overflow the viewport, Popup still measures its `top*` counterpart first (per its own tied-overflow
preference), then the remaining four, exactly as it would for any other consumer. This is a
capability Figma's `dropdown-menu` component doesn't model (it has no top/bottom axis at all) -
inherited for free from Popup rather than re-implemented.

## Selection does not close the panel

Neither Menu nor Dropdown Menu ever calls `onOpenChange`. A consumer wanting a selection to close
the dropdown wires it explicitly:

```tsx
sections={[{ id: 's', items: [{ id: 'delete', label: 'Delete', onSelect: () => { handleDelete(); setOpen(false); } }] }]}
```

## Accessibility

Entirely inherited:
- Popup sets `aria-expanded`/`aria-controls` on the trigger, reflecting `open`.
- Menu's own sections container carries `role="menu"`, `aria-label`/`aria-labelledby` (forwarded
  from DropdownMenu's own props of the same name), and owns all per-item roles and roving-tabindex
  keyboard navigation.
- DropdownMenu sets no `role` on Popup's panel directly - Menu's `role="menu"` lives one level
  deeper, on its own sections container, which is valid (role="menu" has no required ancestor role).

## Styling and tokens

DropdownMenu introduces no tokens or styles of its own - there is no `dropdown-menu.module.css`.
Every visible pixel comes from Popup's panel skin (background/border/radius/shadow, rendered with
`padding="none"`) and Menu's own row/section/selection styles. This was verified directly against
Figma: every `dropdown-menu` variant's nested `panelSurface`/`content`/`menu` node chain measures
zero padding on every axis, which is exactly what motivated adding `'none'` to Popup's `padding` prop
(see `popup.contract.json`) rather than having DropdownMenu reach for `unstyled` and re-declare
background/border/radius/shadow itself.

## Storybook

```txt
DropdownMenu
├─ Docs (.mdx)
├─ Playground
├─ Alignment
├─ Content
└─ EdgeCases
```

### Alignment story

All three `alignment` values, each independently open, to show the below-trigger positioning and
horizontal edge alignment.

### Content story

Different trigger types (icon-button, avatar) to demonstrate that any focusable element works,
matching Figma's own range without a `trigger` variant prop in code.

### EdgeCases story

Multiple sections in one panel, with selection closing the dropdown from each item's own `onSelect`.
