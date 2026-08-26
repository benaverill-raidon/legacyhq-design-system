# Generate Chip Molecule

Use `chip-spec.md` as the source of truth.

## Goal

Generate a production-ready Chip molecule for our internal React component library. Chip is a
compact segmented pill covering three closely-related jobs - showing/editing an active **filter**,
showing an applied **property**, and selecting a search **scope** - built from its own label segment
and remove button plus Dropdown Menu for every dropdown-backed segment.

Chip is classified as a molecule despite composing Dropdown Menu, an organism - the same documented
tier exception Tag Group, Avatar Group, and Split Button already established (see CLAUDE.md and
`chip-spec.md`; this prompt does not re-derive it).

---

## Inputs

- `chip-checklist.md` for design/product context
- `chip-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `chip` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `4631:83388`, page "✅⏲️ Chip") - 14 variants across 4 axes, verified live via
  the Desktop Bridge plugin
- Figma parts: `chip-base` (`3662:7444`), `value` (`3662:25295`), `operator` (`3662:25209`),
  `remove-button` (`3662:25128`), `property-value` (`3661:41493`), `elemBefore` (`1978:50905`)
- The existing Dropdown Menu organism - render every dropdown segment through it directly
- The existing Focus Ring primitive and the generated `CloseIcon`

If anything conflicts, follow `chip-spec.md`.

---

## Framework

- React + TypeScript
- CSS Modules (`chip.module.css`) - tokens only; the sole literal is the `0` used for squared
  interior corners and suppressed interior borders

---

## Implementation

```txt
packages/ui/src/components/molecules/chip/
├─ chip.tsx
├─ chip.types.ts
├─ chip.module.css
├─ Chip.test.tsx
├─ Chip.stories.tsx
├─ chip.mdx
└─ index.ts
```

No changes to Dropdown Menu, Menu, or Focus Ring are needed.

---

## Component API

Props are a **discriminated union on `mode`** - not one interface with everything optional. The three
modes differ structurally, so the union makes illegal states unrepresentable (`sections` cannot reach
a scope chip; `onSelectedChange` cannot reach a property chip; `value` is required exactly where it
means something). See `chip-spec.md` for the full type definitions.

Defaults:

```ts
size = 'md'        // system convention (Button/Tag/IconButton/ToggleButton) - Figma marks no default
disabled = false
isSelected = false // scope only
```

---

## Behavioral Requirements

- Render the root as an `inline-flex` row with `align-items: stretch` and **no gap**, carrying
  `data-mode`, `data-size`, and `data-disabled`.
- `mode="scope"`: the label segment is the control - a native `<button>` with
  `aria-pressed={isSelected}`, calling `onSelectedChange(!isSelected)`. No remove button, no dropdown.
- `mode="property"`: a plain non-interactive `<span>` label segment plus a remove button.
- `mode="filter"`: a plain non-interactive `<span>` label segment, an optional operator segment, a
  required value segment, and a remove button.
- **Each dropdown segment must own its own `open` state internally.** Figma models the operator and
  value as two independent `dropdown-menu` instances with their own `isOpen`; a single flag on Chip
  would make them fight. Implement the segment as its own small component so the state is naturally
  scoped.
- Hardcode `showSearch={false}` on every internal Dropdown Menu, matching Figma's own chip instances.
- Default each panel's accessible name to `` `${label} operator` `` / `` `${label} value` `` when
  `label` is a string, letting `ChipSegment.menuAriaLabel` override it. Do **not** default it to the
  segment's own label - that is the current value ("on", "March 2") and names a panel poorly.
- Default the remove button's accessible name to `` `Remove ${label}` `` when `label` is a string,
  otherwise `Remove`.
- `size` and `disabled` apply to every segment together - no per-segment mixing exists in Figma.
- Never interpret a selection: a panel row's own `onSelect` fires, and scope selection calls
  `onSelectedChange`. Same "never assume" rule Menu and Dropdown Menu follow.
- Do not expose `tone` - chip-base supports five tones but all 14 chip variants use `tone=default`.
- Keep `elemBefore` and `valuePreview` decorative (`aria-hidden`), in fixed 16px boxes.
- Give the label segment (chip-base) **no hover or press treatment in any mode** - a deliberate
  product decision, even though Figma models a state axis there. Interaction fills belong to the
  operator, value, and remove segments. Narrow `ChipScopeProps['data-force-state']` to `'focus'`
  accordingly, so a hover/press value cannot silently no-op.
- Wrap the remove button in `<Tooltip content="Remove">` **only when the chip is enabled** - render the
  bare button when disabled. Do not just pass `disabled` to Tooltip: that suppresses the popup but
  Tooltip still wraps a *disabled* child in an extra `<span>` (so pointer events fire), and since every
  segment rule is structural (`:first-child` / `:last-child` / `:not(:last-child)`) that wrapper
  detaches the button from the pill as its own fully-rounded island. Keep the button's own
  `aria-label` as the accessible name, and keep the button itself `disabled` so removal is impossible
  by pointer and keyboard.
- **No segment may be wrapped.** Every segment must be a direct child of the root - any wrapper
  (Tooltip, a positioning div, anything rendering DOM) breaks the seam and corner rules.
- Each scope chip is an independent on/off toggle - never coordinate siblings. One-of-N behaviour
  belongs to the consumer holding the state, exactly as with Toggle Button.

---

## CSS Requirements

- `.root`: `display: inline-flex; align-items: stretch;` - no gap, matching Figma's `itemSpacing: 0`.
- `.segment`: 1px `--color-border-input` border, `--color-background-neutral-subtle-default` fill,
  `body-md` typography, `gap: var(--spacing-xs)`, `white-space: nowrap`, and the `fade-quick`
  transition (zeroed under `prefers-reduced-motion: reduce`).
- **The seam:** `.segment:not(:last-child) { border-inline-end-width: 0; }` so each following
  segment's own leading border draws the junction - a uniform 1px everywhere. Apply it to every
  segment, not just the leading one: that is what keeps the line 1px where two middle segments meet
  (an operator and a value side by side, as on a due-date filter).
- **Corners:** round only the outer ones, via `.segment:first-child` (leading) and
  `.segment:last-child` (trailing), using CSS logical properties. A one-segment scope chip then takes
  the full round on both ends with no special case.
- Sizes: `block-size` `--size-control-xs` / `--size-control-sm`; `padding-inline` `--measurement-6` /
  `--spacing-sm`. The remove button's padding-inline is asymmetric - `4 / 6` at sm and `6 / 8` at md
  (Figma pulls the close icon 2px toward the seam); reproduce it, do not round it off.
- `.labelSegment` is `--color-content-subtle`; `.operatorSegment`/`.valueSegment` are
  `--color-content-default`.
- Scope-mode rule must set **only `cursor`**. An earlier revision also set `color` there, which at
  (0,2,0) outweighed `.selected`'s (0,1,0) and silently kept selected scope chips on
  `content/subtle`. Let `.labelSegment` supply the unselected color and `.selected` override it.
- Selected: `--color-border-selected` / `--color-background-selected-default-default` /
  `--color-content-selected`. No hover/press ramp - selection is a selection state, not an
  interaction state, so nothing in Chip consumes `--color-background-selected-default-hover` or
  `-press`.
- Hover/press fills go on `.operatorSegment`, `.valueSegment`, and `.removeButton` only - never on a
  bare `.segment` selector, which would catch the label too.
- Give every segment `position: relative` and the focused one `z-index: 1` - the focus ring is an
  outline drawn outside the box and segments sit flush, so the next segment would otherwise paint over
  its trailing edge and clip it.
- Force the label icon to `color: inherit` via `.elemBefore :global([data-color])`, the same override
  Button uses for its own icon slots, so it tracks the label through subtle/selected/disabled. Do NOT
  do this for `.preview` - a value preview carries real per-item meaning (status colours, avatar
  images) that inheriting would destroy.
- Disabled must **fully override** selected, including resetting `border-color` to
  `--color-border-input` - Figma models no selected+disabled variant, so follow Toggle Button's
  precedent rather than blending the two.
- No raw values except the `0` for squared corners and suppressed borders.

---

## Storybook Requirements

- Playground (prop exploration on a `filter` chip)
- Modes (all three, realistic content, plus a live selectable scope row)
- WithOperator (the operator segment)
- Sizes (both sizes across all three modes)
- States (scope unselected/selected x focus/disabled via `data-force-state="focus"` - there is no
  hover/press on the label by design - plus a filter showing the interactive segments keep their fills)
- Content (a realistic, removable filter bar)
- EdgeCases (long label/value truncation, no `elemBefore`, dark surface)

---

## Test Requirements

See the list in `chip-spec.md`. Beyond behavior, include CSS regression guards for: one 1px line per
junction, outer-corners-only rounding, the selected token family with focus sharing the hover fill,
the neutral-subtle resting family, the scope-rule-must-not-set-color specificity trap, and
disabled-fully-overrides-selected.

---

## Rules

1. Follow `chip-spec.md` exactly.
2. Do not duplicate Dropdown Menu, Menu, Popup, or Focus Ring behavior - render through them.
3. No MUI. No Tailwind. No hardcoded colors/spacing/typography.
4. Export the component and its types.

---

## Validation

- Verify all files exist.
- `npm run typecheck`, `npm run lint`, `npm run lint:css`, `npm test` all pass.
- Verify live in Storybook: measured heights 24/32, padding 6/8, remove-button 4/6 and 6/8, exactly
  one 1px border per junction, correct per-segment radii, the full selected fill ramp, and that the
  operator and value menus open independently.
