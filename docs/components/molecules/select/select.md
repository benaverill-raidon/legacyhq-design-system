# Select

## Purpose
Select lets someone pick one option — or several — from a searchable list, shown in a field-styled
trigger. It's a combobox: type to filter, then choose from a dropdown of options.

## When to use
Use Select for choosing from a medium-to-long list of values where type-to-filter helps: a status, a
matter type, an assignee. Use `inputType="multi"` when several values apply at once — they render as
removable chips in the trigger.

## When not to use
Do not use Select for a short, always-visible set of mutually exclusive choices — that's
[Radio](../../atoms/radio/radio.md). Do not use it for a binary on/off
([Switch](../../atoms/switch/switch.md) or [Checkbox](../../atoms/checkbox/checkbox.md)), for free
text with no fixed options ([TextField](../text-field/text-field.md)), or for a menu of *actions*
rather than values ([Dropdown Menu](../../organisms/dropdown-menu/dropdown-menu.md) directly).

## Design intent
Select is a thin composition, the same philosophy as Chip and Split Button: the trigger is a real
[TextField](../text-field/text-field.md), the panel is a
[Dropdown Menu](../../organisms/dropdown-menu/dropdown-menu.md), and multi-select values are
[Chips](../chip/chip.md). Figma's own `select` set (on the "✅⏲️ Select" page) is built exactly that
way — a `dropdown-menu` wrapping a `select-trigger`, which is itself a `text-field` with a trailing
caret — and its tokens and geometry match TextField's token-for-token, so Select reuses TextField
rather than restating a field frame.

The trigger needed one small addition to TextField: an in-frame `leadingContent` slot, so
multi-select chips render *inside* the field (ahead of the input) without a second bordered frame.
That's the same "extend the atom to fill a composition gap" move as Tag's `isInteractive` — additive
and opt-in, existing TextField usage unchanged.

**Options are a flat list, not Menu sections.** You pass `SelectOption[]` — `{ value, label, icon?,
description?, disabled?, group? }` — and Select maps it into the Menu itself, owning each row's
selected state, its radio (single) / checkbox (multi) semantics, and the typeahead filter. Grouping
is automatic from each option's `group` field.

**It's the menu accessibility pattern, not a strict listbox.** This matches Figma's own composition
(a text input opening a dropdown-menu). The input is `role="combobox"` with `aria-haspopup="menu"`;
the panel is a `role="menu"` with `menuitemradio`/`menuitemcheckbox` rows. Opening keeps focus in the
input; ArrowDown moves into the menu; Escape returns focus to the input. A strict
combobox/listbox with `aria-activedescendant` would not reuse Menu at all — see the spec for the full
reasoning.

## Accessibility
The trigger is a `role="combobox"` input with `aria-haspopup="menu"`, `aria-autocomplete="list"`, and
`aria-expanded`/`aria-controls` managed by Popup. Rows carry `aria-checked`. `invalid` sets
`aria-invalid`. Give the combobox an accessible name — a wired `<label>`, or `aria-label`.

## Related
TextField (the trigger frame), Chip (multi-select values), Dropdown Menu and Menu (the option panel),
Radio (the right choice for a short fixed set), Popup (positioning).
