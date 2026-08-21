# Generate Dropdown Menu Organism

Use `dropdown-menu-spec.md` as the source of truth.

## Goal

Generate a production-ready Dropdown Menu organism for our internal React component library.
Dropdown Menu pairs any trigger element with a floating Menu panel, positioned and dismissed via
Popup - a thin composition, not a third independent implementation of either concern.

---

## Inputs

Use these inputs:
- `dropdown-menu-checklist.md` for design/product context
- `dropdown-menu-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `dropdown-menu` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `4580:56762`), verified live via the Desktop Bridge plugin
- The existing Popup primitive (`packages/ui/src/components/primitives/popup/`) - render through it
  directly, do not re-derive positioning/dismissal
- The existing Menu organism (`packages/ui/src/components/organisms/menu/`) - render it as Popup's
  `content`, forwarding every Menu prop through DropdownMenu's own props of the same name

If anything conflicts, follow `dropdown-menu-spec.md`.

---

## Framework

- React
- TypeScript
- No CSS Modules file - DropdownMenu has no visual styling of its own

---

## Implementation

Create:

```txt
packages/ui/src/components/organisms/dropdown-menu/
├─ dropdown-menu.tsx
├─ dropdown-menu.types.ts
├─ DropdownMenu.test.tsx
├─ DropdownMenu.stories.tsx
├─ dropdown-menu.mdx
└─ index.ts
```

Do not create a `dropdown-menu.module.css` - there is nothing for it to style.

---

## Component API

```ts
export type DropdownMenuAlignment = 'left' | 'center' | 'right';

export interface DropdownMenuProps extends Omit<MenuProps, 'id' | 'className'> {
  children: React.ReactElement;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: DropdownMenuAlignment;
  id?: string;
  className?: string;
}
```

Defaults:

```ts
alignment = 'left'
```

(Every other default is `MenuProps`'s own, applied by Menu itself - do not re-declare them on
DropdownMenu.)

---

## Behavioral Requirements

- Render `<Popup>` with `open`, `onOpenChange`, `padding="none"`, `id`, `className`, and
  `alignment` mapped via `{ left: 'bottomLeft', center: 'bottomCenter', right: 'bottomRight' }`;
  render `<Menu>` as its `content`, forwarding every other DropdownMenu prop
  (`sections`/`size`/`showSearch`/`searchValue`/`onSearchChange`/`searchPlaceholder`/
  `showScrollbar`/`maxHeight`/`loading`/`loadingLabel`/`emptyMessage`/`aria-label`/
  `aria-labelledby`) to it unchanged; render `children` as Popup's trigger.
- Hold no state of its own - no `useState`, no `useEffect`. DropdownMenu only destructures and
  redistributes props between Popup and Menu.
- Never call `onOpenChange` from anywhere except what Popup already does (Escape/outside click) -
  do not add logic that closes the panel when a Menu item is selected. That's the consumer's job,
  wired from inside each item's own `onSelect`.

---

## Accessibility Rules

- Do not set a `role` on Popup's panel from DropdownMenu - Menu's own `role="menu"` (one level
  deeper, on its sections container) is sufficient; role="menu" has no required ancestor role.
- Forward `aria-label`/`aria-labelledby` to Menu, not to Popup.

---

## Storybook Requirements

Create stories for:
- Playground (interactive - open/close, select an item, watch it close itself via the item's own
  `onSelect`)
- Alignment (all three `alignment` values, each independently open)
- Content (at least two different trigger types - e.g. an icon-button and an avatar - to show any
  focusable element works)
- EdgeCases (multiple sections in one panel, selection closing the dropdown)

---

## Test Requirements

Create tests for:
- Renders only the trigger when closed; renders the trigger plus a `role="menu"` panel when open
- Opens on trigger interaction
- `aria-expanded`/`aria-controls` set on the trigger, reflecting `open` (inherited from Popup)
- `onOpenChange(false)` called on Escape and on an outside click by default; NOT called for a click
  on a menu item itself
- Clicking a menu item whose own `onSelect` calls `setOpen(false)` actually closes the panel
- `alignment` left/center/right map to Popup's `data-alignment` values `bottomLeft`/`bottomCenter`/
  `bottomRight`; defaults to `left`
- The panel has Popup's `panelSurface` class and its `padding_none` class (no padding class other
  than none)
- `searchValue`/`onSearchChange` and other Menu props pass through and actually affect rendering
  (e.g. filtering)
- Supports a custom `id`/`className` on the panel

---

## Rules

1. Follow `dropdown-menu-spec.md` exactly.
2. Do not duplicate any Popup or Menu behavior - render through both, don't re-implement either.
3. No MUI. No Tailwind. No CSS file for this component.
4. Export the component and its types.

---

## Validation

Before finishing:
- Verify all files exist (and that no `.module.css` was created).
- Verify TypeScript compiles.
- Verify ESLint passes.
- Verify Storybook compiles.
- Verify tests pass.
- Verify the implementation matches the Figma component set (the `trigger`/`alignment`/`isOpen`
  variant grid, and the zero-padding nested `menu` instance in every variant).
