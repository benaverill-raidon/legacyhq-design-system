# Split Button Checklist

## Component Information

### Name
Split Button

### Category
Molecule (see "Tier exception" below - its dropdown panel composes an organism, Dropdown Menu)

### Related Components
- Button (the primary action)
- Icon Button (the secondary, caret-only action)
- Dropdown Menu (the secondary action's floating panel)
- Menu (the panel's content)
- Tag Group, Avatar Group (the same composition pattern, applied to a different overflow shape)

---

## Purpose

### What problem does this component solve?
Gives a primary action with a small number of closely related alternatives a ready-made
composition, instead of every consumer hand-assembling a Button, a divider, an IconButton, and a
Dropdown Menu (plus getting the joined-pill corner treatment right) themselves.

### Why does it need to exist?
`button-spec.md`'s own "Future Components" list named `SplitButton` explicitly, alongside
`IconButton`, `ToggleButton`, and `ButtonGroup` - all four already built as Button-adjacent
components, not baked into Button itself. Figma's own `split-button` component set (correctly
named) demonstrates the exact real composition: a real `button` instance, a dedicated divider part,
and a real `icon-button` instance (via the `figma-parts / secondary-action` part) wrapped in a
`popup`.

### What user goal does it support?
- Perform the primary action with a single click, exactly like a plain Button
- Reach a small number of closely related alternatives via the caret segment, keyboard-accessible
  like any other Dropdown Menu

---

## Usage

### Where will this component be used?
Anywhere a primary action has a handful of close variants worth surfacing without adding a second,
unrelated button - document actions (Save/Save as/Save a copy), send actions (Send/Send as
draft/Preview), creation actions (Create/Create from template/Import existing).

### What are the most common use cases?
- A "Save" action with "Save as..." and "Save a copy" alternatives
- A "Send for signature" action with "Send as draft" and "Preview before sending" alternatives

### When should this component NOT be used?
- A single action with no alternatives - use Button directly
- An icon-only trigger with no separate primary action - compose Icon Button with Dropdown Menu
  directly
- More than a small group of similar actions, or actions unrelated to the primary one - use
  Dropdown Menu on its own, or Button Group

---

## Content

### What content can be displayed?
The primary action's own label (`children`, forwarded to Button) and a small `MenuSection[]` for
the dropdown panel - same shape Dropdown Menu itself already uses.

### Does it render children?
Yes - `children` is the primary action's own label, exactly like Button's own `children`.

---

## Variants

### Appearance
- default (default)
- primary

Narrower than Button's own `appearance` (no `subtle`) - matches every verified Figma variant
exactly; Figma never shows a subtle split button.

### Size
- xs, sm, md, lg (default: md) - matches Button's own four sizes exactly.

### Token Mapping
No new tokens - the divider (`border-width-sm`, `size-control-xs/sm/md/lg`, `color-border-input` /
`color-content-brand-primary-subtle` / `color-border-disabled`) and the squared corners (`0`, an
explicitly-ignored value in the token-governance stylelint rule) are the only styling Split Button
owns. Every other value is Button's, IconButton's, or Dropdown Menu/Menu's own.

---

## States

Required:
- Default
- Loading (primary action loading; secondary action disabled alongside it)
- Disabled (both segments together)
- Dropdown open / closed

Not required:
- A combined "disabled and open" state - Figma's own variant set never crosses `isDisabled=true`
  with `isOpen=true` (a disabled split button can't be open).

---

## Accessibility

### Does this support keyboard navigation?
Yes, entirely inherited: the primary action is a real `<button>` (Button); the secondary action is
a real `<button>` (IconButton) with Enter/Space activation native; arrow keys/Home/End/Enter
navigate the open panel (Menu).

### What ARIA is applied?
`aria-expanded`/`aria-controls` on the secondary action (Popup, via Dropdown Menu); `role="menu"`
with an accessible name (`secondaryActionLabel`) and per-item `menuitem` rows on the panel (Menu);
`aria-busy`/`aria-disabled` on the primary action while loading (Button's own existing behavior).

### Is this an interactive component?
Yes - both segments are real, independently-focusable interactive controls.

---

## Responsive Behavior

### Mobile
Same as Dropdown Menu - the panel's alignment falls back automatically near a viewport edge;
outside-dismissal uses `pointerdown`, which fires for touch.

### Tablet
Same as desktop.

### Desktop
Same as Dropdown Menu.

---

## Dependencies

### What components does this depend on?
Button, Icon Button, Dropdown Menu, Menu (transitively, via Dropdown Menu).

### What components depend on it?
None yet.

---

## Notes

### Tier exception

Split Button is classified as a molecule, but its secondary action's dropdown panel composes
Dropdown Menu directly - which is itself an organism (built from Menu + Popup). This is the same
deliberate, documented exception Tag Group and Avatar Group already established (see their own
`tierNote`s) - not re-derived or re-justified here.

Final implementation decisions:
- Figma's own reference instance for the open panel uses a raw `popup` instance, not a
  `dropdown-menu` instance - but the panel's real purpose ("choose from a small group of similar
  actions") is exactly Dropdown Menu's own established use case. Code reuses Dropdown Menu directly
  rather than hand-assembling Popup and Menu a second time, matching Tag Group/Avatar Group's own
  precedent rather than literally mirroring this one Figma instance's authoring shortcut.
- `appearance` is `'default' | 'primary'` only - Figma never shows a `'subtle'` split button, so
  code doesn't invent one. A consumer needing that visual weight uses a plain Button instead.
- `secondaryActionLabel` is a required prop, not auto-derived from the primary label - the caret
  segment has no visible text to derive a name from, and an auto-generated label (e.g.
  `${children} options`) could read oddly for non-string labels or unusual phrasing.
- No new `Divider` primitive was created - Figma's own divider part is namespaced
  `figma-parts / split-button / divider` (component-specific, not shared like `secondary-action`),
  and no existing shared `Divider` component exists in this codebase to reuse instead. Implemented
  as a single internal `<span>`, not exported.
- The secondary action's leading corners and the primary action's trailing corners are squared off
  via CSS logical properties (`border-start-end-radius`/`border-end-end-radius` and their mirror),
  not physical properties, so the layout stays correct in RTL contexts - matching Tag's own
  wrapper/remove-button precedent.
- `IconButton`'s own `isExpanded` prop is not passed to the secondary action - verified directly
  that it has no visual effect in code today, and `Popup` (via Dropdown Menu) already overwrites
  `aria-expanded` via its own trigger-cloning regardless.
- Verified directly that `IconButton`'s own tooltip-auto-wrapping (triggered by passing
  `aria-label`) does not interfere with `Popup`'s trigger-cloning (`ref`/`aria-expanded` still reach
  the real `<button>`) - the same combination already exists, unremarked, in Dropdown Menu's own
  `Content` story.
- `alignment` is hardcoded to `'right'`, not exposed - Figma's own `split-button` variant set has
  no `alignment` axis at all; every instance opens "bottom right". This is a preferred alignment
  only - Popup's own collision detection already flips to an alternate alignment (and ultimately
  clamps to the viewport) when there isn't room, with no extra logic needed in Split Button.
- `isFullWidth` is omitted from the props Split Button inherits from Button - no verified Figma
  variant for a full-width split button exists.
- The primary-appearance divider uses `color-border-brand-primary-subtle`, not
  `color-border-brand-primary-default` (the obvious first guess for a name match, which resolves to
  the same `prussian-900` primitive as the primary button's own background - an invisible
  same-color-on-same-color divider). `color/border/brand/primary/subtle` is the variable Figma binds
  this fill to (`prussian-300` light / `prussian-900` dark); it was added in the brand-taupe token
  migration. Before that the divider used `color-content-brand-primary-subtle` as a stand-in -
  identical in light (`prussian-300`) but `prussian-700` rather than `prussian-900` in dark. The
  subtle tint is reused on a `background-color` the same way Slider's own active track-stop dot
  already reuses it for contrast against a bold fill. Caught live in Storybook twice:
  first the mistyped `-subtle` name resolved to nothing (fully transparent); after that fix, the
  syntactically-valid substitute was present but exactly camouflaged against both buttons.
- Both segments suppress their own border on the interior edge (`border-inline-end-width: 0` on the
  primary action, `border-inline-start-width: 0` on the secondary action) - Figma's own button/
  icon-button instances measure `strokeRightWeight`/`strokeLeftWeight: 0` on that exact edge, so the
  divider is the only thing drawing that seam. Caught live in Storybook: without this, Button's/
  IconButton's own 1px border on that edge stacked with the 1px divider into a visibly wide line.
- `IconButton`'s own `appearance_primary:disabled` (and `appearance_subtle:disabled`) now stays
  borderless (`border-color: transparent`), matching Button's own disabled rule split and Figma's
  own disabled variants (same fill regardless of tone, but primary/subtle drop the stroke entirely).
  Previously it shared the same visible-border rule as `appearance_default:disabled`, so a disabled
  primary secondary action looked identical to a disabled default one. This is an IconButton-atom
  fix (icon-button.module.css), not Split-Button-specific, but Split Button's primary+disabled
  secondary action is what surfaced it.
