# Dropdown Menu Component Spec

## Overview

Dropdown Menu is a thin composition: Popup for positioning/dismissal, Menu for content. It adds
exactly one thing neither already provides - a fixed, always-opens-below alignment vocabulary
matching Figma's `dropdown-menu` component exactly - and pairs Popup's `padding="none"` with Menu as
its content, since Menu already carries all of its own edge padding.

**Design reference.** Figma's `dropdown-menu` crosses a `trigger` axis (nine example trigger types:
button, icon-button, avatar, link-button, several chips, tag, a page selector) with `alignment` and
`isOpen`. None of the trigger types became a variant prop: `children` stays a generic
`React.ReactElement`, matching Popup's own `children` model. Every Figma instance nests a `menu`,
never arbitrary content, so `DropdownMenuProps` extends `MenuProps` instead of taking an opaque
`content` prop as Popup does.

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
  anchorRef?: React.RefObject<HTMLElement | null>;
  matchTriggerWidth?: boolean;
  id?: string;
  className?: string;
}
```

## Defaults

```txt
alignment: left
matchTriggerWidth: false
```

Every `MenuProps` default (`size: sm`, `showSearch: true`, `showScrollbar: true`, `loading: false`,
`loadingLabel: 'Loading…'`, `emptyMessage: 'No results'`) applies unchanged, since those props pass
straight through to the rendered Menu.

DropdownMenu forwards an explicit list of Menu props (`sections`, `size`, `showSearch`,
`searchValue`, `onSearchChange`, `searchPlaceholder`, `showScrollbar`, `maxHeight`, `loading`,
`loadingLabel`, `emptyMessage`, `aria-label`, `aria-labelledby`), not a rest spread. Two inherited
`MenuProps` members are accepted by the type but dropped: `clearSearchLabel` (added to Menu later and
never forwarded, so a Dropdown Menu's clear button is always "Clear search" and can't be translated)
and `fullWidth` (set from `matchTriggerWidth` instead, below).

`anchorRef` and `matchTriggerWidth` forward to Popup (see popup-spec). `matchTriggerWidth` also drives
the inner Menu's `fullWidth` — a trigger-matched panel needs its Menu to stretch to the panel width
rather than stay at one of the fixed `size` widths. Because `fullWidth` is technically inherited from
`MenuProps`, DropdownMenu sets it internally from `matchTriggerWidth`; consumers use
`matchTriggerWidth`, not `fullWidth`, to opt in (Select is the first consumer, matching its field).

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
- Popup sets `aria-expanded`/`aria-controls` on the trigger, reflecting `open`, by cloning it. That
  only reaches the DOM when the trigger passes `aria-expanded` through. The system's own triggers
  don't, unless `isExpanded` is set: Button renders `aria-expanded={isExpanded != null ? isExpanded :
  undefined}` after its rest spread, which drops the cloned value, and IconButton defaults
  `isExpanded` to `false` and renders `isExpanded != null ? isExpanded : ariaExpanded`, which
  replaces it with `false`. Consumers set `isExpanded={open}` on Button/IconButton triggers (the
  stories and the Docs page do); the tests use a plain `<button>`, so they don't catch this.
- No `aria-haspopup` is set on the trigger.
- No focus management: opening doesn't move focus (Menu's search field `autoFocus`es when shown),
  the panel is portaled to the end of `document.body`, so with `showSearch={false}` Tab from the
  trigger reaches the panel's rows only after every other focusable element on the page, and
  Escape (a document-level listener while open) doesn't return focus to the trigger.
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

Every story's Button/IconButton trigger sets `isExpanded={open}` (see Accessibility).

### Alignment story

All three `alignment` values, each independently open, to show the below-trigger positioning and
horizontal edge alignment. The triggers are spread across the width so the open panels don't
overlap. On the Docs page it renders in an iframe (`parameters.docs.story.inline: false`), since
open panels are portaled and would otherwise float over the page.

### Content story

Different trigger types (icon-button, avatar) to demonstrate that any focusable element works,
matching Figma's own range without a `trigger` variant prop in code.

### EdgeCases story

Multiple sections in one panel, with selection closing the dropdown from each item's own `onSelect`.
Open on load, so it also renders in an iframe on the Docs page.
