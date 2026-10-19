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
   +- trigger child (children - any focusable element, cloned by DropdownMenu for a ref and
   |  aria-haspopup, then by Popup for measurement/ARIA)
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
`searchValue`, `onSearchChange`, `searchPlaceholder`, `searchLabel`, `clearSearchLabel`,
`showScrollbar`, `maxHeight`, `loading`, `loadingLabel`, `emptyMessage`, `fullWidth`, `aria-label`,
`aria-labelledby`), not a rest spread, so every inherited `MenuProps` member reaches the Menu.
`sections` is passed with each item's `onSelect` wrapped (see "Selection closes the panel").

`anchorRef` and `matchTriggerWidth` forward to Popup (see popup-spec). `matchTriggerWidth` also sets
the inner Menu's `fullWidth` — a trigger-matched panel needs its Menu to stretch to the panel width
rather than stay at one of the fixed `size` widths (Select is the first consumer, matching its
field). `fullWidth` on its own, without `matchTriggerWidth`, makes the panel (which is
`inline-size: max-content`) as wide as the Menu's widest row instead of a `size` width.

## Composition

```tsx
<Popup
  open={open}
  onOpenChange={onOpenChange}
  alignment={ALIGNMENT_MAP[alignment]} // left -> bottomLeft, center -> bottomCenter, right -> bottomRight
  padding="none"
  id={id}
  className={className}
  content={<Menu sections={sectionsWithClosingOnSelect} size={size} /* ...every other MenuProps... */ />}
>
  {cloneElement(children, { ref, 'aria-haspopup': children.props['aria-haspopup'] ?? 'menu' })}
</Popup>
```

DropdownMenu holds no `useState`. It keeps a ref to the trigger (merged with the child's own ref) and
uses two effects while open: one moves focus into the panel, one listens for Escape and Tab on the
panel (see "Focus management").

## Alignment mapping

`alignment` only ever supplies Popup's *preferred* alignment as one of the three `bottom*` values -
it does not disable Popup's own viewport-fit fallback. If the preferred `bottom*` alignment would
overflow the viewport, Popup still measures its `top*` counterpart first (per its own tied-overflow
preference), then the remaining four, exactly as it would for any other consumer. This is a
capability Figma's `dropdown-menu` component doesn't model (it has no top/bottom axis at all) -
inherited for free from Popup rather than re-implemented.

## Selection closes the panel

DropdownMenu wraps each item's `onSelect`: the item's own `onSelect` runs first, then, unless it
called `event.preventDefault()`, focus returns to the trigger and `onOpenChange(false)` is called.
`preventDefault()` keeps the panel open, such as for a checkbox row the user may toggle several times:

```tsx
sections={[{ id: 'view', items: [{ id: 'drafts', label: 'Show drafts', selectionType: 'checkbox',
  selected: showDrafts, onSelect: (event) => { event.preventDefault(); toggleDrafts(); } }] }]}
```

A trigger with `role="combobox"` (Select's field) is left out of this and of the focus management
below: its items' `onSelect` aren't wrapped, since Select closes single-select itself and keeps
multi-select open.

## Focus management

The menu-button pattern, skipped for a `role="combobox"` trigger:

- **Open:** focus moves to the search field when there is one, otherwise to the rows' tab stop (the
  first enabled row), otherwise to the `role="menu"` container. It waits one animation frame,
  because Popup keeps the panel `visibility: hidden` until it has measured a position, and a hidden
  element can't take focus (this is also why Menu's own search `autoFocus` never took effect inside
  a Dropdown Menu in a real browser). It moves focus only if focus is on the trigger or the page,
  and runs again when `loading` changes, so an async menu gets focus once its rows arrive.
- **Choose:** focus returns to the trigger, unless the item's `onSelect` moved focus out of the
  panel (into a dialog it opened, say).
- **Escape:** a `keydown` listener on the panel returns focus to the trigger; Popup's document-level
  Escape listener then calls `onOpenChange(false)`, so it's called once.
- **Tab:** Tab past the panel's last tab stop, or Shift+Tab before its first, is prevented, focus
  returns to the trigger, and `onOpenChange(false)` is called - the same model as Inline Message's
  popup. Tab between the search field, its clear button, and the rows stays inside.

## Accessibility

- Popup sets `aria-expanded`/`aria-controls` on the trigger, reflecting `open`, by cloning it.
  Button and IconButton keep that `aria-expanded` when their own `isExpanded` is unset.
- DropdownMenu sets `aria-haspopup="menu"` on the trigger, unless the trigger sets its own.
- Focus follows the menu-button pattern (see "Focus management"), so the panel's place at the end
  of `document.body` doesn't put its rows last in the tab order.
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

The stories' Button/IconButton triggers still set `isExpanded={open}`; it's no longer needed, since
Button and IconButton keep the `aria-expanded` Popup adds.

### Alignment story

All three `alignment` values, each independently open, to show the below-trigger positioning and
horizontal edge alignment. The triggers are spread across the width so the open panels don't
overlap. On the Docs page it renders in an iframe (`parameters.docs.story.inline: false`), since
open panels are portaled and would otherwise float over the page.

### Content story

Different trigger types (icon-button, avatar) to demonstrate that any focusable element works,
matching Figma's own range without a `trigger` variant prop in code.

### EdgeCases story

Multiple sections in one panel, with selection closing the dropdown.
Open on load, so it also renders in an iframe on the Docs page.
