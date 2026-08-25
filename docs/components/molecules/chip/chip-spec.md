# Chip Component Spec

## Overview

Chip is a segmented pill with three modes - `filter`, `property`, `scope` - sharing one label
segment, one border treatment, and one size scale. `filter`'s operator and value segments render
through `DropdownMenu`; everything else is Chip's own.

**Tier exception.** Chip is a molecule, but `mode="filter"` composes Dropdown Menu (and transitively
Menu), which are organisms - the same deliberate, documented exception Tag Group, Avatar Group, and
Split Button already established (see their own `tierNote`s; not re-derived here).

## Anatomy

```txt
Chip (root: inline-flex row, align-items stretch, no gap)
├─ label segment            span (filter/property) | button (scope)
│  ├─ elemBefore            optional, fixed 16px, aria-hidden
│  └─ label
├─ operator segment         filter only, optional - button inside DropdownMenu
├─ value segment            filter only, required - button inside DropdownMenu
│  ├─ valuePreview          optional, aria-hidden
│  └─ value label
└─ remove button            filter + property - button with CloseIcon
```

## Public API

```ts
type ChipMode = 'filter' | 'property' | 'scope';
type ChipSize = 'sm' | 'md';

interface ChipSegment {
  label: React.ReactNode;
  sections: MenuSection[];
  menuAriaLabel?: string;
}

// shared by all modes
interface ChipCommonProps {
  label: React.ReactNode;
  elemBefore?: React.ReactNode;
  size?: ChipSize;
  disabled?: boolean;
  id?: string;
  className?: string;
}

interface ChipScopeProps extends ChipCommonProps {
  mode: 'scope';
  isSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  'data-force-state'?: 'focus'; // only focus - the label segment has no hover/press treatment
}

interface ChipPropertyProps extends ChipCommonProps {
  mode: 'property';
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  removeAriaLabel?: string;
}

interface ChipFilterProps extends ChipCommonProps {
  mode: 'filter';
  value: ChipSegment;
  operator?: ChipSegment;
  valuePreview?: React.ReactNode;
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  removeAriaLabel?: string;
}

type ChipProps = ChipScopeProps | ChipPropertyProps | ChipFilterProps;
```

A **discriminated union on `mode`**, not one interface with everything optional. The three modes
differ structurally, so this makes illegal states unrepresentable: `sections` cannot reach a scope
chip, `onSelectedChange` cannot reach a property chip, and `value` is required exactly where it is
meaningful. This is the first component in the system to use a discriminated union for its props -
justified because the alternative (all-optional props, silently ignored when irrelevant) would let
`<Chip mode="scope" sections={...} />` compile and do nothing.

## Defaults

```txt
size: md
disabled: false
isSelected: false      (scope)
removeAriaLabel: `Remove ${label}` when label is a string, otherwise `Remove`
```

`size` resolves as `size ?? groupSize ?? 'md'`. An explicit prop wins; otherwise Chip inherits the
enclosing [Chip Group](../chip-group/chip-group.md)'s size through `ChipSizeContext`; with neither, it
falls back to `md` - matching every other interactive control's default in this system (Button, Tag,
IconButton, Toggle Button). Figma marks no default variant and represents both sizes equally, so the
system convention decides that fallback rather than an invented reading of the variant order.

The context is provided by Chip Group but *lives with Chip* (`chip/chip-size-context.ts`), so Chip can
consume it without importing its own group - which would be a cycle. Chip Group shares size by context
rather than by cloning children specifically because cloning only reaches direct children: a Chip
behind a Tooltip, out of a `.map`, or behind a conditional would silently miss it.

## Modes

| mode | segments | interactive | isSelected | onRemove |
|---|---|---|---|---|
| `filter` | label + [operator] + value + remove | operator, value, remove | — | required |
| `property` | label + remove | remove | — | required |
| `scope` | label | the label segment | supported | — |

**`scope` is an independent on/off toggle per chip, not a radio group.** Several scope chips can be
on at once, and turning one on does not turn another off - Chip never coordinates siblings. Any
one-of-N behaviour belongs to the consumer holding the state, exactly as with Toggle Button.

**The remove button carries a "Remove" Tooltip** on hover/focus, and Tooltip is **not mounted at all**
while `disabled`. The button's own `aria-label` remains its accessible name, so the tooltip is
supplementary rather than the sole one. `disabled` also disables the remove button itself, so removal
is impossible both by pointer and by keyboard.

Two independent reasons point the same way for skipping it when disabled:

1. "Remove" on a chip that cannot be removed is misleading rather than explanatory - unlike
   IconButton's disabled tooltips, which explain *why* an action is unavailable.
2. **Structural.** Tooltip wraps a *disabled* child in an extra `<span>` so pointer events still fire
   (disabled buttons emit none). Every segment rule here is structural - `:first-child`,
   `:last-child`, `:not(:last-child)` - so that wrapper stops the button being a direct child of the
   root, and it detaches from the pill as its own fully-rounded, fully-bordered island. Passing
   `disabled` to Tooltip only suppresses the popup; it does not prevent the wrapper. Not mounting
   Tooltip avoids it entirely rather than styling around it.

**This generalizes: nothing may wrap a segment.** Any future wrapper around any segment - a Tooltip,
a positioning div, a context provider that renders DOM - breaks the seam and corner rules the same
way. Segments must stay direct children of the root.

`onRemove` is **required** for `filter` and `property`: every verified Figma variant of both carries a
remove button. chip-base's own `isRemovable=false` variants exist at the part level but no chip-level
variant uses them, and a non-removable label is Tag's job.

## Geometry

Measured directly, per size:

| | sm | md |
|---|---|---|
| segment block-size | `--size-control-xs` (24) | `--size-control-sm` (32) |
| segment padding-inline | `--measurement-6` (6) | `--spacing-sm` (8) |
| remove button padding-inline | `--spacing-xs` / `--measurement-6` (4 / 6) | `--measurement-6` / `--spacing-sm` (6 / 8) |
| segment gap | `--spacing-xs` (4) | `--spacing-xs` (4) |

The remove button's asymmetric padding is real, not a simplification - Figma pulls the close icon 2px
toward the seam at both sizes.

## Corners and the seam

Outer corners are `--border-radius-full-round`; interior corners are squared. Measured per side:
leading segment `[999, 0, 0, 999]`, middle segments `[0, 0, 0, 0]`, trailing segment
`[0, 999, 999, 0]`. Implemented with `:first-child` / `:last-child` and CSS logical properties, so a
scope chip (one segment) takes the full round on both ends with no special case.

**One 1px line per junction.** Figma gives every segment its own 1px inside stroke and suppresses only
the *leading* segment's trailing stroke (measured `[1, 0, 1, 1]` on chip-base, all-1 on every
following segment). That works for the first junction but leaves a doubled 2px line wherever two
*middle* segments meet - visible on Figma's own `due date` filter, where an operator segment and a
value segment sit side by side. Code generalizes the rule instead: every segment drops its trailing
border (`.segment:not(:last-child)`), so each following segment's own leading border draws the seam
and every junction reads a uniform 1px.

## Token mapping

| target | token |
|---|---|
| segment fill (rest) | `color-background-neutral-subtle-default` |
| segment fill (hover / press) — **interactive segments only** | `color-background-neutral-subtle-hover` / `-press` |
| segment border | `color-border-input` |
| label text | `color-content-subtle` |
| label icon | inherits the label segment's colour |
| operator + value text | `color-content-default`, typography `body-md` |
| selected fill / border / text | `color-background-selected-default-default` / `color-border-selected` / `color-content-selected` |
| disabled fill / text / border | `color-background-disabled` / `color-content-disabled` / `color-border-input` |

## No interaction states on the label segment

Figma models a `state` axis (default/hover/press/focus) on `chip-base`, but the label segment
deliberately implements **no hover or press treatment in any mode**. This is a product decision, not
an oversight:

- In `filter`/`property` the label is a passive `<span>` that names the property. Giving it a hover
  fill would suggest it does something.
- In `scope` the label *is* the control, but the selected/unselected distinction is the feedback, and
  the focus ring covers keyboard affordance.

Interaction fills belong to the segments that actually act - the operator, the value, and remove.
Two consequences worth knowing:

1. Nothing in Chip consumes `--color-background-selected-default-hover` or `-press`.
2. `ChipScopeProps['data-force-state']` accepts only `'focus'`. A `'hover'`/`'press'` value would
   render identically to the default and quietly mislead, so the type rules it out.

`selected` survives this decision because it is a *selection* state, not an interaction state: a
scope chip reads as selected or not, with no ramp on top of either.

## The label icon tracks the label colour

`elemBefore`'s icon is forced to `color: inherit` (the same `:global([data-color])` override Button
uses for its own icon slots), so it moves through `content/subtle` → `content/selected` →
`content/disabled` with the text rather than keeping whatever Icon default it was constructed with.

This is deliberately **not** applied to `valuePreview`: a value preview carries real per-item meaning
(task-status colours, an avatar's own image), so forcing it to inherit would destroy information.

## Focus ring stacking

Every segment is `position: relative`, and the focused one gets `z-index: 1`. The focus ring is an
outline drawn *outside* the segment box and segments sit flush against each other, so without this the
next segment paints over the ring's trailing edge and clips it. Putting all segments in one paint tier
and lifting the focused one resolves it on both sides at once - the same paint-tier reasoning as Avatar
Group's overlapping stack, applied to an outline rather than a fill.

Figma models **no** selected+disabled chip-base variant, so disabled fully overrides selected
(including resetting the border to `color-border-input`) rather than blending them - the precedent
Toggle Button and Toggle Icon Button already set for that same gap.

`chip-base`'s `tone` axis (default/error/warning/success/information) is deliberately unexposed: all
14 chip variants use `tone=default`, so any chip-level tone mapping would be extrapolated from the
part rather than verified.

## Dropdown segments

Each dropdown-backed segment owns its **own** `open` state internally, matching Figma exactly - the
operator and value are two independent `dropdown-menu` instances, each with its own `isOpen`. A single
shared flag on Chip would make them fight.

`showSearch` is hardcoded `false`, matching Figma's own chip dropdown instances. Panel accessible
names default to `${label} operator` / `${label} value` (composed from the property name and the
segment's role) because the segment's own label is the current *value* - naming a panel "on" or
"March 2" says nothing about what choosing from it does. `ChipSegment.menuAriaLabel` overrides it.

## Accessibility

- `scope` is a native `<button>` with `aria-pressed` - Toggle Button's semantics, not `role="switch"`,
  `aria-selected`, or a checkbox.
- `filter`/`property` label segments are plain `<span>`s. Only the dropdown segments and remove button
  are controls.
- Dropdown segments receive `aria-expanded`/`aria-controls` from Popup via Dropdown Menu.
- The remove button always has an accessible name (`Remove ${label}` by default).
- `elemBefore` and `valuePreview` are `aria-hidden` and must stay decorative - in scope mode the
  segment is already a button, so a nested focusable element would be invalid HTML.
- Every control uses the shared Focus Ring primitive.

## Storybook

```txt
Chip
├─ Docs (.mdx)
├─ Playground
├─ Modes
├─ WithOperator
├─ Sizes
├─ States
├─ Content
└─ EdgeCases
```

- **Modes** - all three, with realistic content and a live selectable scope row.
- **WithOperator** - the operator segment, and the junction Figma leaves at 2px.
- **Sizes** - both sizes across all three modes.
- **States** - scope unselected/selected crossed with focus/disabled (no hover/press by design), plus
  a filter showing that the interactive segments do keep their fills. Uses `data-force-state="focus"`
  (documentation-only, scope only).
- **Content** - a realistic filter bar whose chips can be removed.
- **EdgeCases** - long label/value truncation, no `elemBefore`, dark surface.

## Tests

```txt
scope: renders a toggle button with aria-pressed
scope: reflects isSelected through aria-pressed
scope: calls onSelectedChange with the next value
scope: renders no remove button and no dropdown
scope: disables the toggle when disabled
property: renders a non-interactive label plus a remove button
property: calls onRemove when the remove button is activated
property: supports an explicit removeAriaLabel
filter: renders the label, the value segment, and a remove button
filter: opens the value menu when the value segment is activated
filter: calls a value menu item's own onSelect
filter: renders no operator segment unless an operator is given
filter: names each menu panel after the property and segment role
filter: lets menuAriaLabel override the composed panel name
filter: gives the operator and value segments independent menus
filter: disables every segment when disabled
filter: renders a value preview before the value text
applies size and mode to the root for every mode
defaults to size md
supports a custom id/className on the root
draws exactly one 1px line per junction
rounds only the outer corners
maps selected to the selected token family
maps resting/hover/press fills to the neutral-subtle family
does not let the scope-mode rule outweigh .selected on color
lets disabled fully override selected, including the border
gives the label segment no hover or press fill in any mode
keeps hover and press fills on the segments that do act
lifts a focused segment above its neighbours so the focus ring is not clipped
makes the label icon track the label colour, without touching the value preview
scope: toggles independently per chip rather than behaving as a radio group
property: disables the remove button when the chip is disabled, and suppresses its click
tooltip: shows a Remove tooltip on hover
tooltip: does not show the tooltip while disabled
tooltip: keeps aria-label as the accessible name
```

## Future considerations

- Expose `tone` once a real Figma chip variant uses a non-default tone.
- An `isRemovable={false}` escape hatch, if a real non-removable filter/property appears.
- A `ChipGroup`, if filter bars need Tag Group's truncation behavior.

Do not implement these unless requested.
