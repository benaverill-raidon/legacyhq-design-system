# Generate Select Molecule

Use `select-spec.md` as the source of truth.

## Goal

Generate a production-ready Select molecule — a searchable combobox — for our internal React
component library. Select composes a TextField trigger, a Dropdown Menu option panel, and (multi-
select) removable Chips, preconfigured for the choose-from-a-list use case rather than reimplementing
a field, a floating panel, or a token input.

Select is a molecule despite composing Dropdown Menu (an organism) — the same documented tier
exception Tag Group, Avatar Group, Split Button, and Chip established (see CLAUDE.md and
`select-spec.md`; not re-derived here).

---

## Inputs

- `select-checklist.md` for design/product context
- `select-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `select` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `4662:42012`, page "✅⏲️ Select") — 84 variants, verified live via the Desktop
  Bridge plugin
- Figma part `select-trigger` (`4658:67775`) — a `text-field` instance + trailing `caret_down`
- The existing TextField molecule (the trigger frame), Chip molecule (multi-select values), Dropdown
  Menu organism (the panel), and CaretDownIcon

If anything conflicts, follow `select-spec.md`.

---

## Framework

- React + TypeScript
- CSS Modules (`select.module.css`) — Select owns only the caret rotation; one token reference
  (`--fade-quick`). No frame/panel/chip CSS (those belong to the composed components).

---

## Implementation

```txt
packages/ui/src/components/molecules/select/
├─ select.tsx
├─ select.types.ts
├─ select.module.css
├─ Select.test.tsx
├─ Select.stories.tsx
├─ select.mdx
└─ index.ts
```

One change to TextField is required (see below). No changes to Chip, Dropdown Menu, Menu, or Popup.

### Extend TextField

Add one additive, optional prop to TextField: `leadingContent?: React.ReactNode`, rendered inside the
frame between `iconBefore` and the input, **not** aria-hidden (it holds interactive chips, unlike the
decorative `iconBefore`). Its CSS (`.leadingContent`) must `flex: 0 1 auto` and `overflow: hidden` so
it shrinks and clips, keeping the field single-line (Figma's trigger is NO_WRAP). Existing TextField
usage must be unchanged when the prop is omitted. Add TextField tests for the slot.

Do **not** duplicate TextField's frame/state/size CSS inside Select — reuse TextField; its tokens
match Figma's `select-trigger` token-for-token.

---

## Component API

A **discriminated union on `inputType`** (default `'single'`) — see `select-spec.md` for the full
types. single: `value: string | null`, radio rows; multi: `value: string[]`, checkbox rows.

Options are a **flat `SelectOption[]`** (`{ value, label, icon?, description?, disabled?, group? }`),
NOT `MenuSection[]`. Select maps them into Menu sections itself, grouping consecutive options by
`group`, and owns each row's `selected`, `selectionType` (radio/checkbox), `onSelect`, and
`leadingElement`.

---

## Behavioral Requirements

- The trigger is a `TextField` — `role="combobox"`, `aria-haspopup="menu"`,
  `aria-autocomplete="list"`, `appearance={tone}`, the caret in `iconAfter` (rotates when open via a
  class), and (multi) the chips in `leadingContent`.
- Hold `open` and (uncontrolled) `query` state internally; `value` is always controlled.
- **Open** on click/mousedown, typing, or ArrowDown. Keep focus in the input.
- **Type** filters options (case-insensitive substring on `label`) — unless `searchValue` +
  `onSearchChange` are provided, in which case Select stops filtering internally and reports the query.
- Pass the filtered options to the panel as pre-built sections with `showSearch={false}` — the
  trigger is the search field, not Menu's own box.
- **single**: choosing a row calls `onChange(value)` and closes; the trigger shows the chosen label
  when closed and the live query while open. Rows are `menuitemradio`.
- **multi**: choosing toggles the value in the array, keeps the panel open, clears the query, and
  refocuses the input. Values render as removable `Chip mode="select"` (sm chip in sm/md triggers,
  md in lg). Rows are `menuitemcheckbox`. Backspace on an empty query removes the last chip.
- **ArrowDown** when open moves focus into the Menu (find the panel by its id, focus the first
  `[role^="menuitem"]`); Menu's roving tabindex takes over.
- **Escape** / outside-click close and return focus to the input (Popup handles the close; refocus
  the input).
- `disabled` blocks opening and disables chip removal; `invalid` sets `aria-invalid`.
- `size` sets the trigger height, the panel width (Menu `size`), and the chip size together.
- Give the DropdownMenu a stable `id` so ArrowDown can find the panel.

---

## Accessibility — menu pattern, deliberately

Build the **menu** pattern, not the strict combobox/listbox pattern. The input is `role="combobox"`
opening a `role="menu"` panel (Menu's own rows/ARIA). This matches Figma's text-input + dropdown-menu
composition and reuses Menu wholesale. Do NOT build `role="listbox"`/`option` +
`aria-activedescendant` — that reuses none of Menu and diverges from the design. Record the trade-offs
(screen readers say "menu"; focus enters the panel on ArrowDown) as known limitations.

---

## Storybook Requirements

Playground, InputTypes (single vs multi), Typeahead (filter + empty message), Grouped, Variants (all
sizes x both tones), States (invalid, disabled single + multi), Content (a realistic form row with
option icons), EdgeCases (many chips on one line, a disabled option, dark surface).

---

## Test Requirements

See the list in `select-spec.md`. The ones that must not be dropped: multi-select renders a removable
chip per value (not labels in the input), re-picking a checkbox row deselects, Backspace removes the
last chip only on an empty query, typeahead filters and shows the empty message, and single-select
closes + shows the label on choose. Plus TextField's own new `leadingContent` tests.

---

## Rules

1. Follow `select-spec.md` exactly.
2. Reuse TextField, Chip, Dropdown Menu, Menu — do not reimplement any of them.
3. No MUI, no Tailwind, no hardcoded values.
4. Export the component and its types.

---

## Validation

- Verify all files exist.
- `npm run typecheck`, `npm run lint`, `npm run lint:css`, `npm test` all pass.
- Verify live in Storybook: trigger heights 32/40/48, typeahead filters, single closes on choose,
  multi renders single-line chips that clip, chip ✕ and menu re-pick both remove, and the panel opens
  below the trigger.
