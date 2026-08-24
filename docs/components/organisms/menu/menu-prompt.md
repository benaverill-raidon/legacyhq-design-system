# Generate Menu Organism

Use `menu-spec.md` as the source of truth.

## Goal

Generate a production-ready Menu organism for our internal React component library. Menu is a
searchable, sectioned list of interactive rows - the panel content Dropdown Menu renders through
Popup, but also usable standalone anywhere a floating or embedded action/option list is needed.

---

## Inputs

Use these inputs:
- `menu-checklist.md` for design/product context
- `menu-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `menu` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `1700:35137`), verified live via the Desktop Bridge plugin, plus its
  `menu-item` (`1700:34589`), `menu-search` (`3628:17489`), and `heading-item` (`1700:34323`)
  sub-parts
- Generated token CSS files:
  - `packages/ui/src/tokens/generated/tokens.css`
  - `packages/ui/src/tokens/generated/light.css`
  - `packages/ui/src/tokens/generated/dark.css`
- The existing Popup primitive (`packages/ui/src/components/primitives/popup/`) - Menu is meant to
  be rendered through it (via Dropdown Menu) and shares its "consumer owns triggering/closing, we
  only report back" philosophy
- The existing TextField molecule (`packages/ui/src/components/molecules/text-field/`) - compose it
  directly for the search field (`iconBefore`/`iconAfter`) rather than building a bespoke input

If anything conflicts, follow `menu-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules
- CSS Variables

---

## Implementation

Create:

```txt
packages/ui/src/components/organisms/menu/
├─ menu.tsx
├─ menu.types.ts
├─ menu.module.css
├─ Menu.test.tsx
├─ Menu.stories.tsx
├─ menu.mdx
└─ index.ts
```

---

## Component API

```ts
export type MenuSize = 'sm' | 'md' | 'lg';
export type MenuItemSelectionType = 'checkbox' | 'radio';

export interface MenuItem {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  leadingElement?: React.ReactNode;
  titleLeadingElement?: React.ReactNode;
  trailingElement?: React.ReactNode;
  selected?: boolean;
  selectionType?: MenuItemSelectionType;
  disabled?: boolean;
  onSelect?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
}

export interface MenuSection {
  id: string;
  heading?: React.ReactNode;
  headingLeadingElement?: React.ReactNode;
  items: MenuItem[];
}

export interface MenuProps {
  sections: MenuSection[];
  size?: MenuSize;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showScrollbar?: boolean;
  maxHeight?: number | string;
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
```

Defaults:

```ts
size = 'sm'
showSearch = true
showScrollbar = true
loading = false
loadingLabel = 'Loading…'
emptyMessage = 'No results'
```

---

## Styling Requirements

Use CSS Modules. Use CSS variables only - no raw color, spacing, radius, or typography values.

Required token mapping:

```txt
width (per size)        → --component-menu-width-sm / -md / -lg (new component-tier tokens - add
                           packages/ui/src/tokens/src/component/menu.json with 192px/240px/288px,
                           then run `npm run build` before writing styles that reference them)
label text               → --color-content-default
description text         → --color-content-subtle
disabled text             → --color-content-disabled
row hover background     → --color-background-neutral-overlay-hover
row press background     → --color-background-neutral-overlay-press
selected background      → --color-background-brand-primary-subtle-default (+ -hover/-press)
selected text             → --color-content-brand-primary-default
divider                  → --color-border-default
row gap                  → --spacing-sm
row padding-inline       → --spacing-md
row padding-block        → --spacing-xs
label typography         → --typography-body-md-* (14px)
description typography   → --typography-body-sm-* (12px)
```

Important:
- Menu itself has no background/border/shadow (matching Figma's `menu` component's empty
  `fills`/`strokes`) - do not add a card-like skin to `.menu`.
- Selected-row colors already exist as semantic tokens (verified: Figma's `isSelected` fills
  resolve to exactly `brand.prussian.solid.100/200/300`, already aliased by
  `color-background-brand-primary-subtle-default/-hover/-press` and
  `color-content-brand-primary-default`) - do not invent new "selected" tokens.
- Do not hardcode colors, spacing, radius, or the per-size widths.
- Do not import MUI or Tailwind.

---

## Behavioral Requirements

- `sections` is required; render a structurally valid, empty menu for an empty array rather than
  refusing to render.
- Each row is a real `<button role="menuitem">` (or `menuitemcheckbox`/`menuitemradio` when the item
  sets `selectionType`, with `aria-checked` reflecting `selected`) - never a styled `<div>`.
- `leadingElement`/`trailingElement`/`titleLeadingElement`/`headingLeadingElement` render with
  `aria-hidden="true"` and must not be assumed to be interactive - document (in the .mdx and
  contract.json) that nesting a real Checkbox/Radio/Button there is invalid HTML (a focusable
  control inside the row's own `<button>`) and unsupported.
- Search (`searchValue`/`onSearchChange`) is fully controlled; filter items by a case-insensitive
  substring match against plain-string `label`/`description` only - an item with non-string content
  for both stays visible rather than being excluded.
- Omit a section entirely (heading, divider, and items) once every one of its items is filtered out.
- Implement roving-tabindex keyboard navigation on the sections container: `ArrowDown`/`ArrowUp`
  move focus between enabled, visible items (wrapping at either end); `Home`/`End` jump to the
  first/last. Derive the active id from render (`enabledIds.includes(activeId) ? activeId :
  enabledIds[0]`) rather than syncing it via a `useEffect` that calls `setState` - that pattern
  trips `react-hooks/set-state-in-effect`.
- `loading` replaces the sections area with a Spinner + `loadingLabel`; the search field (if shown)
  stays visible/interactive.
- Never call `onOpenChange` or manage any "open" concept - Menu has no idea whether it's inside a
  Dropdown Menu.

---

## Accessibility Rules

- Sections container: `role="menu"`, `tabIndex={-1}` (non-tab-reachable fallback focus target, not
  part of the roving cycle), optional `aria-label`/`aria-labelledby` passthrough.
- Each row: `role="menuitem"` by default, or `menuitemcheckbox`/`menuitemradio` with `aria-checked`
  when `selectionType` is set. Exactly one enabled, visible row has `tabIndex={0}`; every other row
  is `-1`.
- `disabled` is the native `<button disabled>` attribute.
- Decorative slots (`leadingElement`, etc.) are always `aria-hidden="true"`.

---

## Storybook Requirements

Create stories for:
- Playground (interactive - a controlled search field and a selectable action list)
- Sizes (`sm`/`md`/`lg` side by side, identical content, showing the width-only effect)
- Content (row descriptions, a checkbox-style multi-select section, a radio-style single-select
  section, multiple sections in one Menu)
- EdgeCases (loading, a search with zero matches, a disabled row alongside enabled ones, dark
  surface)

---

## Test Requirements

Create tests for:
- Every item renders as the right role (`menuitem`/`menuitemcheckbox`/`menuitemradio`) inside
  `role="menu"`
- Section heading renders; a divider renders before every section, including the first
- `onSelect` fires on click, and never for a disabled item (which also has the native `disabled`
  attribute)
- `aria-checked` is set only when `selectionType` is provided
- Search filters by label substring (case-insensitive); `emptyMessage` shows when filtering removes
  everything
- `loading` shows a status row instead of sections
- Exactly one item has `tabIndex="0"` initially (the first enabled one); the rest are `-1`
- `ArrowDown`/`ArrowUp` move the roving tab stop and DOM focus, wrapping at either end;
  `Home`/`End` jump to the first/last; a disabled item is skipped by `ArrowDown` navigation
- The search field renders by default and is omitted when `showSearch` is false
- The size-specific width class is applied
- CSS maps to the required tokens; Menu's own root has no `background`/`border`

---

## Rules

1. Follow `menu-spec.md` exactly.
2. Use CSS variables for every color, spacing, and typography value; add the new
   `component/menu.json` dimension tokens rather than hardcoding 192/240/288px.
3. No MUI. No Tailwind.
4. Compose TextField/IconButton/Spinner/Focus Ring rather than reimplementing their behavior.
5. Keep `leadingElement`/`trailingElement` documented as decorative-only - do not "fix" this by
   making the row anything other than a native `<button>`.
6. Export the component and its types.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify ESLint (including `jsx-a11y` and `react-hooks`) passes.
- Verify Storybook compiles.
- Verify tests pass.
- Verify CSS uses variables for color, spacing, radius, and typography.
- Verify the implementation matches the Figma component set (the `menus`/`size` variant grid, the
  `showSearch`/`showScrollbar` defaults, and `menu-item`'s state/isSelected/isDisabled matrix).
