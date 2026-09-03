# Menu Component Spec

## Overview

Menu is a searchable, sectioned list of interactive rows, data-driven from a `sections` prop. It has
no visual skin of its own (no background/border/shadow), matching Figma's `menu` component exactly
(empty `fills`/`strokes` on the root) - it's meant to be embedded in a surface the consumer supplies.

## Anatomy

```txt
Menu
+- search (optional, showSearch default true)
|  +- TextField (size="md", no leading icon, trailing clear button once there's a value)
+- sections container (role="menu", tabIndex={-1} fallback focus target)
   +- section (one per `sections` entry)
      +- divider (renders above every section, except the first when showSearch is false)
      +- heading (optional, with an optional leading icon)
      +- items (one native <button role="menuitem|menuitemcheckbox|menuitemradio"> per MenuItem)
         +- leadingElement (decorative only)
         +- titleLeadingElement (decorative only, rare)
         +- label
         +- description (optional)
         +- trailingElement (decorative only)
```

Figma's `<section>/list` component carries its own leading divider unconditionally on every
section instance, including the first. Code deviates from that literal structure in one specific
case: when `showSearch` is `false`, the first section's divider is omitted, since with no search
field above it, that divider would render right at the top edge of the panel with nothing to
divide from - a design-review correction, not an oversight. Every section after the first still
gets its divider regardless of `showSearch`, since those are dividing one section's content from
the previous one's, which is always meaningful.

## Public API

```ts
type MenuSize = 'sm' | 'md' | 'lg';
type MenuItemSelectionType = 'checkbox' | 'radio';

interface MenuItem {
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

interface MenuSection {
  id: string;
  heading?: React.ReactNode;
  headingLeadingElement?: React.ReactNode;
  items: MenuItem[];
}

interface MenuProps {
  sections: MenuSection[];
  size?: MenuSize;
  fullWidth?: boolean;
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

## Defaults

```txt
size: sm
fullWidth: false
showSearch: true
showScrollbar: true
loading: false
loadingLabel: 'Loading…'
emptyMessage: 'No results'
```

`fullWidth` overrides the `size` width and stretches the menu to fill its container (`width: 100%`),
for a panel sized to its trigger rather than to one of the fixed 192/240/288px widths — Dropdown
Menu passes it through as `matchTriggerWidth` so a field's dropdown (e.g. Select) matches the field.

`showSearch`/`showScrollbar` default to `true`, matching Figma's own declared component-property
defaults exactly - there was no product signal to override either.

## Search and filtering

`searchValue`/`onSearchChange` are fully controlled - Menu computes the filtered view from
`searchValue` on every render but never owns search state itself. An item is filtered out only when
its `label` (and `description`, if present) are plain strings that fail a case-insensitive substring
match; an item with non-string content for both is always kept visible, since Menu has no way to
evaluate it. A section with zero visible items after filtering is omitted entirely - heading and
divider included, not rendered empty.

## Selection model

There is no menu-level selection mode. Each `MenuItem` independently carries `selected` and,
optionally, `selectionType`:

- Neither set: a plain action row, `role="menuitem"`, no `aria-checked`.
- `selected` with `selectionType`: role becomes `menuitemcheckbox`/`menuitemradio`, `aria-checked`
  reflects `selected`. Enforcing single-selection across a radio-style group is the consumer's
  responsibility - Menu renders exactly what it's given.
- `selected` alone (no `selectionType`): applies the selected visual treatment with no
  `aria-checked` implication - useful for highlighting a plain action row (e.g. the currently active
  item in a non-toggleable list) without claiming checkbox/radio semantics.

Figma's own `checkboxes`/`radios` demo compositions render the check/radio state via
`leadingElement` icons, not a real form control: `CheckboxFillIcon`/`CheckboxEmptyIcon` for a
checkbox-style row, `RadioCheckedIcon`/`RadioUncheckedIcon` for a radio-style row - colored
`color="selected"` when selected and `color="subtle"` when not (verified on the actual vector fill
of both icon families). This is the canonical pattern to follow, not a generic checkmark or a real
`Checkbox`/`Radio`.

This isn't specific to checkbox/radio rows: a **plain**, non-checkbox `elemBefore` icon on a
selected row binds to the exact same `color/content/selected` variable as the row's own text
(verified directly - same variable id, not just the same resolved value), while an unselected
plain icon uses `color/content/default`. Any `leadingElement` icon that should visually track
`selected` - not just a checkbox/radio glyph - should set `color="selected"`/`color="default"`
accordingly.

## Keyboard navigation

- `ArrowDown`/`ArrowUp` move a roving `tabIndex` (and DOM focus, imperatively) between enabled,
  visible items, wrapping at either end.
- `Home`/`End` jump to the first/last enabled, visible item.
- `Enter`/`Space` activate the focused item for free, since it's a real `<button>`.
- A disabled item is excluded entirely from the roving-tabindex cycle - never focusable via arrow
  navigation, Tab, or click-then-arrow.
- The active id is derived on every render (`enabledIds.includes(activeId) ? activeId :
  enabledIds[0]`), not synced via a `useEffect` - so a search that filters out the currently-active
  item, or a disabled item that gets removed, falls back to the first remaining enabled item without
  an extra render pass.

## Composition rules

- `leadingElement`/`trailingElement`/`titleLeadingElement`/`headingLeadingElement` must be
  decorative only (icons, or a plain glyph) - never a real interactive control. Each row is a native
  `<button>`; nesting a focusable `<input>` (a real `Checkbox`/`Radio`) or another `<button>` inside
  it is invalid HTML and creates two conflicting activation paths for the same row.
- Pass `spacing="spacious"` on every `leadingElement`/`trailingElement` icon (size stays at Icon's
  own `md` default). Menu's `elemBefore`/`elemAfter` wrapper is a fixed 24px (`--size-300`) box
  regardless of content, matching Figma's own elemBefore/elemAfter component exactly - an icon
  without `spacing="spacious"` renders undersized and off-center inside it rather than filling it
  the way Figma's own `Size: md` + `spacing: spacious (24px)` icon does.
- Menu never closes anything on `onSelect` - a consumer wanting a selection to close a containing
  Dropdown Menu wires `onOpenChange(false)` from the item's own `onSelect`.

## Accessibility

- The sections container carries `role="menu"` and `tabIndex={-1}` (a non-tab-reachable fallback
  focus target, not part of the roving cycle itself).
- Each row is `role="menuitem"` by default, or `menuitemcheckbox`/`menuitemradio` when
  `selectionType` is set, with `aria-checked` reflecting `selected` only in that case.
- Exactly one enabled, visible row has `tabIndex={0}`; every other row (enabled or not) is `-1`.
- `disabled` is the native `<button disabled>` attribute - `:disabled` styling and
  `toBeDisabled()`-style assertions work without any extra ARIA.
- No default accessible name for the `menu` role - pass `aria-label` or `aria-labelledby`.

## Styling and tokens

Menu itself carries no background/border/shadow - verified directly against Figma's `menu` component
(empty `fills`/`strokes`). Row and selection colors reuse existing semantic tokens rather than
introducing new ones:

- Default row text: `--color-content-default` (label), `--color-content-subtle` (description).
- Hover/press row background: `--color-background-neutral-overlay-bold-hover` /
  `-overlay-press`.
- Selected row background: `--color-background-brand-primary-subtle-default` (and the
  `-hover`/`-press` variants on interaction) - Figma's `isSelected` fills
  (`#e5f6ff`/`#ccecff`/`#b3e3ff`) resolved exactly to these already-existing tokens
  (`brand.prussian.solid.100/200/300`), so no new color token was needed for the background.
- Selected row text and icon: `--color-content-selected` - a genuinely distinct Figma variable
  (`color/content/selected`, verified via `figma.variables.getVariableByIdAsync`, own light/dark
  mode values) that happens to equal `--color-content-brand-primary-default`'s value in both themes
  currently. Code mirrors the real distinction rather than reusing brand-primary-default for it -
  see "New tokens" below.
- Disabled row text: `--color-content-disabled`.
- Divider: `--color-border-default`.
- Row layout: `--spacing-sm` gap (between elemBefore/Content/elemAfter), `--spacing-md` inline
  padding, `--spacing-xs` block padding, matching Figma's `itemSpacing`/padding on `menu-item`'s
  `Container` exactly. The title row (titleLeadingElement + label) uses its own `--spacing-sm` gap,
  matching Figma's `title-container` `itemSpacing` - not `--spacing-xs`, which was an early
  transcription error caught in review.
- `elemBefore`/`elemAfter`: a fixed `--size-300` (24px) box on both axes, independent of whatever
  icon or glyph is inside, matching Figma's fixed-size slot exactly.
- Section body padding: `--spacing-xs` (4px) top, `--spacing-sm` (8px) bottom - asymmetric, not a
  uniform `padding-block`, matching the exact values on Figma's `<section>/list` → `Container`.
- Selected-row indicator: a 2px inset left `box-shadow` (`--border-width-md`
  `--color-border-brand-primary-default`), not `border-left` - Figma's own stroke on this state is
  `strokeAlign: INSIDE` with `paddingLeft` completely unchanged (still `spacing/md`, identical to
  every other row), meaning the indicator paints inside the row's existing bounds. A real
  `border-left` would add to the box size in CSS and visibly shift selected rows 2px right relative
  to unselected ones - a regression caught by comparing rendered output against Figma directly.
  `--color-border-brand-primary-default` resolves to the exact same primitive
  (`brand.prussian.solid.900`/`#003655`) Figma's own stroke variable does.
- Label typography: `--typography-body-md-*` (14px, matching Figma's measured `menu-item` title).
  Description/heading typography: `--typography-body-sm-*` (12px).
- Search field: rendered as `size="md"` with TextField's `appearance="subtle"`
  (`data-appearance="subtle"`, `data-size="md"`), matching Figma's own `menu-search` → nested
  `text-field`'s `size: md`, `tone: subtle` component properties exactly - confirmed directly from
  the actual Figma instance, not assumed. No leading icon (the instance has no `elemBeforeInput`
  at all - only a trailing `elemAfterInput` clear button). `appearance="subtle"` alone still
  leaves a colored focus underline and a hover background tint (correct for TextField generally)
  - but the wrapper's own `code-parts / <menu-search>` component has no hover variant at all, and
  its `text-field` instance's `fills`/`strokes` are empty in every one of its default/focus/typing
  states, so Menu additionally neutralizes both via
  `.search :global([data-appearance='subtle'][data-size='md']:not([data-disabled='true']):not([data-invalid='true']))`
  `:hover`/`:focus-within`. The extra `[data-size='md']` and two `:not()` clauses aren't padding -
  TextField's own hover rule stacks three `:not()` clauses of its own
  (`:not([data-disabled]):not(:focus-within):not([data-force-state='focus']):is(:hover, ...)`),
  landing at specificity `(0,5,0)`; a plain `.search [data-appearance='subtle']:hover` only reaches
  `(0,3,0)` and silently loses regardless of CSS source order - `(0,6,0)` is what actually wins,
  without `!important` (see "New tokens" below). The field is also `autoFocus`ed whenever it's
  rendered.

### New tokens

- `--color-content-selected` (light: `brand.prussian.solid.900`/`#003655`; dark:
  `brand.prussian.solid.500`/`#6aadd4`) - added to
  `packages/ui/src/tokens/src/semantic/semantic-color-light.json` and `-dark.json`. Mirrors
  Figma's real `color/content/selected` variable rather than reusing
  `--color-content-brand-primary-default`, even though the two happen to resolve to the same value
  in both themes today - they're different Figma variables, and code should reflect that instead
  of quietly conflating them.
- `IconColor` value `selected` (`--color-content-selected`) on the shared Icon primitive
  (`packages/ui/src/components/primitives/icon/`) - added for Menu's selected-row icon: a real,
  verified need, not a speculative addition.
- `.search`'s hover/focus neutralization stays local to Menu's own CSS rather than changing
  TextField's `appearance="subtle"` implementation - `subtle`'s existing hover/focus styling is
  correct for TextField's other consumers; menu-search is simply a stripped-down instance of it,
  verified directly against Figma rather than assumed.

### Width

`size` (`'sm' | 'md' | 'lg'`, default `'sm'`) sets the panel's fixed width via
`--component-menu-width-sm/md/lg` (192px/240px/288px, measured directly off the three Figma `size`
variants of `menus=1`) - a new component-tier token
(`packages/ui/src/tokens/src/component/menu.json`), since none of these values land on the semantic
spacing scale (`--spacing-4xl` tops out at 40px), the same category of exception Tooltip's
`max-width` tokens (`420px`/`240px`) already established. Row height is never affected by `size` - it
always follows content.

## Storybook

```txt
Menu
├─ Docs (.mdx)
├─ Playground
├─ Sizes
├─ Content
└─ EdgeCases
```

No a dedicated States page - `menu-item`'s hover/press/focus states are pointer/keyboard-driven
native button states already exercised live by every other story, not a separate set of pinned
`data-force-state` references (unlike Checkbox/Button, Menu has no non-native "force this visual
state" need since disabled/selected are the only states with independent visual meaning, and both
are directly demonstrated in Content/EdgeCases).

### Sizes story

All three `size` values side by side, with identical content, to show the width-only effect.

### Content story

Realistic compositions: row descriptions, a checkbox-style multi-select section, a radio-style
single-select section, and multiple sections in one Menu.

### EdgeCases story

Loading, a search with zero matches, a disabled row alongside enabled ones (arrow-key navigation
skipping it), and a dark-surface check.
