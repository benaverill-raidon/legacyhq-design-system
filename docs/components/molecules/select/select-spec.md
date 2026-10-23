# Select Component Spec

## Overview

Select is a searchable combobox: a TextField-styled trigger, a Dropdown Menu panel of option rows,
and (multi-select) removable Chips in the trigger. Single-select yields a scalar value from radio
rows; multi-select yields an array from checkbox rows.

**Tier exception.** Select is a molecule, but its panel composes Dropdown Menu (and transitively
Menu), which are organisms — the same deliberate, documented exception Tag Group, Avatar Group,
Split Button, and Chip already established (see their own `tierNote`s; not re-derived here). It also
composes two molecules — TextField and Chip — which is ordinary molecule-on-molecule composition.

## Anatomy

```txt
Select
└─ DropdownMenu (Popup + Menu)
   ├─ trigger: TextField (role=combobox)
   │  ├─ iconBefore: the chosen option's icon (single only, aria-hidden; Figma's elemBeforeInput)
   │  ├─ leadingContent: chips (multi only) — removable Chip per value
   │  ├─ input — the typeahead search field / selected-label display
   │  └─ iconAfter: caret (rotates when open)
   └─ panel: Menu — menuitemradio (single) / menuitemcheckbox (multi) rows, or the empty message
```

## Public API

```ts
type SelectSize = 'sm' | 'md' | 'lg';
type SelectContext = 'default' | 'inline';
/** @deprecated Use SelectContext: subtle and inline are both inline. */
type SelectTone = 'default' | 'subtle' | 'inline';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

interface SelectCommonProps {
  options: SelectOption[];
  size?: SelectSize;
  context?: SelectContext;
  /** @deprecated Use context. */
  tone?: SelectTone;
  /** @deprecated Use context. */
  appearance?: SelectTone;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: React.ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;   // passed to the input and the Menu
  'aria-describedby'?: string;  // Field's message
  'aria-invalid'?: boolean | 'true' | 'false';
  required?: boolean;
  id?: string;
  className?: string;
}

interface SelectSingleProps extends SelectCommonProps {
  inputType?: 'single';
  value: string | null;
  onChange: (value: string | null) => void;
}

interface SelectMultiProps extends SelectCommonProps {
  inputType: 'multi';
  value: string[];
  onChange: (value: string[]) => void;
  /** Each chip's remove-button name, passed to Chip's removeLabel. Default `Remove ${label}`. */
  getRemoveLabel?: (label: string) => string;
  /** Each chip's remove-button tooltip, passed to Chip's removeTooltipLabel. Default `Remove`. */
  removeTooltipLabel?: string;
}

type SelectProps = SelectSingleProps | SelectMultiProps;
```

A **discriminated union on `inputType`** (default `'single'`), so single's scalar value and multi's
array can't be crossed — the same pattern Chip uses for `mode`. The common case (`single`) needs no
discriminant.

`tone` and `appearance` are deprecated aliases for `context`, still accepted: `subtle` and `inline`
both map to `context="inline"`, `default` to `default`. An explicit `context` wins.

## Defaults

```txt
inputType: single
size: md
context: default
emptyMessage: "No matches"
```

## Composition

- **Trigger** — the existing `TextField`. Its frame, fill, border, and per-size geometry match
  Figma's `select-trigger` token-for-token (verified), so Select reuses it rather than restating the
  state CSS. `context` passes straight through to TextField's `context` — the same prop, values,
  and Figma axis.
- **Panel** — `DropdownMenu` with `showSearch={false}` (the trigger *is* the search field), the
  option rows built by Select, and `emptyMessage` for no-results.
- **Chips** — multi-select values render as `Chip mode="select"` in the trigger's `leadingContent`
  slot; `sm` chips in sm/md triggers, `md` in lg, matching Figma. Each chip's remove button is
  named `getRemoveLabel(option.label)` (Chip's `removeLabel`), `Remove <label>` by default; its
  tooltip is `removeTooltipLabel` (Chip's `removeTooltipLabel`), `Remove` by default.
- **Chosen icon** — a single-select field passes the chosen option's `icon` to TextField's
  `iconBefore`, the slot Figma's `select-trigger` has as the text-field's `elemBeforeInput` (an
  icon slot, hidden in the static variants). It's decorative and stays while the menu is open,
  since the value doesn't change until a new pick. It keeps its own color, as in its menu row:
  TextField's leading slot leaves an icon's named color alone, and an `inherit` icon takes the
  slot's subtle color. Select wraps it in `.optionIcon` only so a disabled field (the prop or a
  disabled fieldset) greys it with `content/disabled`, like the caret
  (`.trigger:where(:has(input:disabled)) .optionIcon [data-color]`). The trigger's other icons are
  untouched.

### The TextField extension

Multi-select needs chips *inside* the field. TextField renders `[iconBefore] input [iconAfter]` with
a fixed, decorative, `aria-hidden` leading slot — unsuitable for interactive chips. So TextField
gained one additive prop, `leadingContent`: an in-frame slot before the input, **not** aria-hidden,
that shrinks and clips (keeping the field single-line, matching Figma's NO_WRAP trigger). Single-
select passes nothing; multi passes the chips. Existing TextField usage is unchanged. This is the
same "extend the atom to fill a composition gap" move as Tag's `isInteractive` and Avatar's
`entityType` — chosen over duplicating TextField's whole state/size CSS inside Select.

## Options and grouping

`options` is a flat `SelectOption[]`, not `MenuSection[]`. Select maps it into Menu sections,
grouping consecutive options by their `group` field (ungrouped options fall in one leading section),
and owns each row's:

- `selected` — `value === selected` (single) / `value.includes(...)` (multi)
- `selectionType` — `radio` (single) / `checkbox` (multi), which drives the row's ARIA role
- `onSelect` — the pick handler
- `leadingElement` — the option's `icon`

The caller never hand-wires a Menu row. A controlled `searchValue` + `onSearchChange` hands filtering
to the caller (async loading); otherwise Select filters internally (case-insensitive substring on
`label`).

## Interaction & accessibility (menu pattern)

This is deliberately the **menu** pattern, matching Figma's text-input + dropdown-menu composition,
not the strict W3C combobox/listbox pattern. Reusing Menu means reusing its rows, selection ARIA,
and roving-tabindex keyboard model — a strict listbox (`role=listbox`/`option` +
`aria-activedescendant`, focus staying in the input) would reuse none of it and diverge from the
design.

- The input is `role="combobox"`, `aria-haspopup="menu"`, `aria-autocomplete="list"`. Popup sets
  `aria-expanded`/`aria-controls` on it.
- **Open** on click, typing, or ArrowDown. Focus stays in the input.
- **ArrowDown** (when open) moves focus into the Menu; its roving tabindex takes over.
- **Type** filters; **Escape** / outside-click closes. Escape from inside the Menu first returns
  focus to the input (a keydown listener on the panel, since Dropdown Menu leaves combobox triggers
  to manage their own focus); a click outside leaves focus where the click put it.
- **Tab / Shift+Tab** inside the Menu closes it and returns focus to the input, as Dropdown Menu does
  for its own triggers (the portalled panel would otherwise tab to the end of the page).
- **Focus leaving** the field frame and the panel for another element closes the menu (a `focusout`
  listener on both; moving between the input and a chip's remove button keeps it open). A blur with
  no new target (a click on nothing focusable, the window losing focus) is left to Popup's outside
  click.
- **Menu name**: `aria-label` / `aria-labelledby` are passed to the menu. Without either, the menu is
  named from the input's native `<label>`s when it opens: `aria-labelledby` their ids when every one
  has an id and none wraps the field, otherwise `aria-label` with their text (leaving out the field's
  own text when a label wraps it).
- **Enter** opens a closed field; **Space** does too when the query is empty.
- **single**: choosing a row calls `onChange(value)`, returns focus to the input, and closes; the
  trigger shows the label. Select
  never calls `onChange(null)`; clearing a single value is up to the consumer.
- **While open**, the single trigger's input is the query field: it's emptied, and the current label
  is shown as its placeholder.
- **multi**: choosing toggles the value, keeps the panel open, clears the query; values are removable
  chips. **Backspace** on an empty query removes the last chip.

### Known a11y trade-offs

- Screen readers announce a *menu*, and focus moves into the panel on ArrowDown rather than staying
  in the input with `aria-activedescendant`.

### Panel width & alignment

The panel always matches the field frame's width and left edge — the dropdown lines up flush with the
visible control, not the ~9px-inset input. The merged ref and `aria-expanded`/`aria-controls` stay on
the input (where that wiring belongs), but Select also hands Dropdown Menu the field **frame** as
`anchorRef` (the input's `parentElement`, captured through a callback ref) and sets
`matchTriggerWidth`. Popup then measures, positions, width-matches, and scopes its outside-click
boundary to the frame, and the inner Menu fills that width via `fullWidth`. This keeps the input's
single-child trigger + a11y contract intact while the dropdown matches the field exactly (verified
live on single and multi: panel width and left both equal the frame's).

## Geometry & tokens

Measured per size, matching Figma and TextField:

| size | height | radius | chip size |
|---|---|---|---|
| sm | 32 | 8 | sm |
| md | 40 | 8 | sm |
| lg | 48 | 12 | md |

Frame fill `elevation/surface/raised/default` (→ `/hover`), border `border/input` (→ `border/focused`
on focus/typing), disabled `background/disabled` + `border/disabled`. `select.module.css` owns the
caret rotation (`--fade-quick`) and the caret colour — `content/subtle` at rest, `content/disabled`
when the field is disabled (Figma-verified on the trigger's `caret_down` vector; the icon inherits it
via TextField's own `.action` slot). Every other pixel is TextField's, Chip's, or Menu's.

## Storybook

```txt
Select
├─ Docs (.mdx)
├─ Playground
├─ InputTypes
├─ Typeahead
├─ Grouped
├─ Variants
├─ States
├─ Content
└─ EdgeCases
```

## Tests

```txt
single: renders a combobox trigger with the placeholder when empty
single: opens on interaction and lists options as radio items
single: onChange + close on choose
single: shows the selected label when closed
single: shows the chosen option's icon before the value (aria-hidden), and none without one
single: keeps the chosen option's icon in its own color (Text Field leaves named colors alone; disabled greys it)
single: marks the selected option aria-checked
typeahead: filters by case-insensitive substring
typeahead: empty message when nothing matches
typeahead: does not filter internally when search is controlled
multi: removable chip per value, not labels in the input
multi: checkbox rows, toggle without closing
multi: re-pick deselects
multi: chip remove button removes the value
multi: getRemoveLabel names the chips' remove buttons
multi: removeTooltipLabel sets the chips' remove tooltips ('Remove' by default)
multi: Backspace removes the last chip on an empty query
multi: no Backspace-remove while the query is non-empty
grouping: a section heading per group
states: does not open when disabled
states: never opens by pointer or keyboard when disabled by the prop or a disabled fieldset, in a form or a table cell
states: aria-invalid when invalid
states: opens on ArrowDown
states: size and context map to the TextField trigger
a11y: combobox with menu popup + list autocomplete
a11y: aria-expanded reflects open state
a11y: custom id/className on the trigger
focus: Escape from inside the menu returns focus to the field
focus: a single-select pick returns focus to the field
focus: Tab / Shift+Tab inside the menu closes it and returns focus to the field
focus: focus moving out of the field closes the menu
focus: focus moving within the field (to a chip) keeps the menu open
focus: a blur with no new target keeps the menu open
naming: menu named from a native label pointing at the field
naming: menu named by reference when the native label has an id
naming: menu named from a wrapping label
naming: aria-label / aria-labelledby win over a native label
caret rotates only while open, via a class
deprecated tone and appearance values map to a context
```

Plus TextField's own suite gains three cases for the new `leadingContent` slot.

## Future considerations

- A clear-all affordance for multi-select.
- Option virtualization for very large lists.
- A strict listbox a11y mode, if a consumer needs `aria-activedescendant` semantics.

Do not implement these unless requested.
