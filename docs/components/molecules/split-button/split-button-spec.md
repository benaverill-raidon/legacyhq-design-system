# Split Button Component Spec

## Overview

Split Button is a thin composition: a real `Button` (primary action) and a real `IconButton`
(secondary, caret-only action) joined by a 1px divider, with the secondary segment wrapped in a
`DropdownMenu`. It introduces no visual language of its own beyond the divider and the squared
inner corners that make the two segments read as one continuous shape.

**Tier exception.** Split Button is a molecule, but Dropdown Menu (and, transitively, Menu) are
organisms - the same deliberate, documented exception Tag Group and Avatar Group already
established (see their own contract.json `tierNote`s; not re-derived here).

## Anatomy

```txt
SplitButton
├─ root (inline-flex row, align-items: stretch, no gap)
│  ├─ Button (primary action - trailing corners squared)
│  ├─ divider (1px rule, color keyed to appearance/disabled)
│  └─ DropdownMenu (alignment="right", hardcoded)
│     └─ IconButton (secondary action - leading corners squared, shape="square")
│        └─ Menu (the panel content)
```

## Public API

```ts
type SplitButtonAppearance = 'default' | 'primary';

interface SplitButtonProps extends Omit<ButtonProps, 'appearance' | 'isFullWidth'> {
  appearance?: SplitButtonAppearance;
  sections: MenuSection[];
  secondaryActionLabel: string;
}
```

`SplitButtonProps` extends `ButtonProps` directly (minus `appearance`, narrowed, and `isFullWidth`,
unsupported - no verified Figma variant for a full-width split button) rather than re-declaring
`onClick`/`isLoading`/`iconBefore`/`iconAfter`/`tone`/`disabled`/every native button attribute by
hand. This mirrors how `TagGroupItem`/`AvatarGroupItem` extended their own atom's props via `Omit`,
just applied to the component's own top-level props instead of a per-item shape (Split Button has
no repeating list of items - `sections` is the one list-shaped prop, matching Dropdown Menu's own).

## Defaults

```txt
appearance: default
size: md
disabled: false
isLoading: false
```

Matches Button's and IconButton's own code defaults exactly (both already default to
`size="md"`/`appearance="default"`) - unlike Tag Group and Avatar Group, there's no evidence in
Figma of the *group* preferring a different default than the atoms it composes, so none was
introduced.

## Composition

```tsx
<div className={styles.root}>
  <Button
    {...rest}
    ref={forwardedRef}
    className={styles.primaryAction}
    appearance={appearance}
    size={size}
    disabled={disabled}
    isLoading={isLoading}
    onClick={onClick}
  >
    {children}
  </Button>
  <span className={styles.divider} data-disabled={disabled ? 'true' : undefined} aria-hidden="true" />
  <DropdownMenu
    aria-label={secondaryActionLabel}
    open={open}
    onOpenChange={setOpen}
    showSearch={false}
    alignment="right"
    sections={sections}
  >
    <IconButton
      className={styles.secondaryAction}
      appearance={appearance}
      size={size}
      shape="square"
      disabled={disabled || isLoading}
      aria-label={secondaryActionLabel}
      onClick={() => setOpen((current) => !current)}
    >
      <CaretDownIcon size="md" decorative />
    </IconButton>
  </DropdownMenu>
</div>
```

Split Button holds exactly one piece of state - `open` - to drive the secondary action's
`DropdownMenu`, identical in shape to Tag Group's and Avatar Group's own `overflowOpen`.

`showSearch={false}` and `alignment="right"` are both hardcoded, not exposed as props - matching
Tag Group/Avatar Group's own precedent of not exposing every Menu/DropdownMenu prop, and matching
the fact that Figma's own `split-button` variant set has no `alignment` axis at all (every
instance opens "bottom right"). `alignment="right"` maps to Popup's own `'bottomRight'` (via
Dropdown Menu's `ALIGNMENT_MAP`) - the intended default for every Split Button. This is a preferred
alignment, not a forced one: Popup's own collision detection (`getAlignmentOrder`/
`getCandidatePosition` in popup.tsx) already measures available space on open and flips to an
alternate alignment - trying the opposite side first, then the other alignments - before falling
back to viewport clamping, so a Split Button near a viewport edge repositions automatically without
Split Button needing any collision logic of its own.

## Squared inner corners

Measured directly against Figma, not assumed symmetric:

| Segment | Outer corners (kept) | Inner corners (squared to 0) |
|---|---|---|
| Primary action (`Button`) | leading (`border-start-start-radius`/`border-end-start-radius`) | trailing (`border-start-end-radius`/`border-end-end-radius`) |
| Secondary action (`IconButton`) | trailing (`border-start-end-radius`/`border-end-end-radius`) | leading (`border-start-start-radius`/`border-end-start-radius`) |

At `size=lg`, the primary action measured `topLeft`/`bottomLeft`: 12 (Button's own `lg` radius,
`--border-radius-xl`, untouched), `topRight`/`bottomRight`: 0. The secondary action measured the
exact mirror. Implemented with CSS logical properties (`border-start-start-radius`, etc.) rather
than physical `border-top-left-radius`, so the layout stays correct in RTL contexts - the same
technique Tag's own wrapper/remove-button pairing already uses.

**Each segment's own border is also suppressed on that same interior edge.** Figma's own `button`
instance inside `split-button` measures `strokeRightWeight: 0` (all other sides `1`); its
`secondary-action`/`icon-button` instance measures the exact mirror, `strokeLeftWeight: 0`. Without
suppressing that edge in code too, Button's/IconButton's own 1px border on the interior side stacks
with the 1px divider into a visibly wide seam instead of one clean 1px line. Implemented as
`border-inline-end-width: 0` on `.primaryAction` and `border-inline-start-width: 0` on
`.secondaryAction` - a distinct longhand from `border-color` (which each appearance's own class
still sets), so there's no specificity fight with Button's/IconButton's own hover/disabled rules;
both sub-properties simply apply together.

## Divider

A 1px rule (`inline-size: var(--border-width-sm)`) sitting flush between the two segments (the row
itself has no gap). Not its own exported component - namespaced in Figma as
`figma-parts / split-button / divider` (component-specific, unlike `figma-parts / secondary-action`
which is reused across other components), and no existing shared `Divider` primitive exists in this
codebase to reuse instead.

Height matches the button height at each size (`--size-control-xs/sm/md/lg` - the same tokens
Button/IconButton already use for their own fixed `block-size`, and Avatar Group already reused for
its own forced-square overflow trigger).

Color depends on `appearance`, with `disabled` overriding both:

| State | Token |
|---|---|
| `appearance="default"` | `color-border-input` |
| `appearance="primary"` | `color-content-brand-primary-subtle` |
| `disabled` (either appearance) | `color-border-disabled` |

Measured directly per `tone` in Figma's own divider part (`figma-parts / split-button / divider`,
12 variants: `size` x `tone` [default/primary/disabled] x `isDisabled`) - `disabled` is Figma's own
separate `tone` value, not a CSS-only addition, confirming disabled state overrides the
default/primary color distinction entirely rather than just dimming it.

`appearance="primary"` does **not** use `--color-border-brand-primary`, despite the name being the
obvious first guess. That token resolves to the exact same `prussian-900` primitive
(`--color-background-brand-primary-bold-default`) as the primary button's own fill, so a divider
painted in it disappears - identical color on identical color. Figma's own variable on this fill is
named `color/border/brand/primary/subtle`; resolving the node directly (not just the variable name)
gives `#b3e3ff` - `prussian-300`, a light tint, not a darker/duller shade of `prussian-900`. No
`--color-border-*` token exists at that step, but `--color-content-brand-primary-subtle` already
aliases exactly `prussian-300` - reused here on a `background-color` the same way Slider's own
active track-stop dot already reuses it (see `slider.module.css`'s own comment: "needs the
subtle/light brand color for contrast against that dark fill"), not a text-token repurposed by
coincidence. Caught live in Storybook twice: first the mistyped `-subtle` token name resolved to
nothing (fully transparent divider); after that fix, the syntactically-valid but wrong substitute
token rendered a divider that was technically present but exactly camouflaged against both
buttons' own background.

## Secondary action: real IconButton, not a bespoke part

Figma's own `figma-parts / secondary-action` part is, traced one level deeper, the real `IconButton`
component (`shape="square"`) with a single icon child - `caret_down` (resolved directly from the
Figma instance's own bound component key; matches this codebase's existing `CaretDownIcon`
one-for-one, not a new or different glyph).

`IconButton`'s own `isExpanded` prop has no visual effect in code today (verified directly - it only
sets `aria-expanded`/`data-expanded`, with no corresponding CSS), and `DropdownMenu`/`Popup` already
overwrites `aria-expanded` via its own trigger-cloning regardless of whatever `IconButton` would set
internally - so Split Button does not pass `isExpanded` to the secondary action at all; it would be
redundant.

**IconButton's own tooltip-wrapping is safe as a Popup trigger.** `IconButton` auto-wraps itself in
`Tooltip` whenever an explicit `aria-label` is given (its own existing behavior, unrelated to Split
Button). `Tooltip` in turn wraps its child in its own `Popup` (for the tooltip bubble itself, with
`manageTriggerAria={false}` so it doesn't fight the outer Dropdown Menu's own aria management).
Verified this doesn't break the *outer* `Popup`'s (Dropdown Menu's) own trigger-cloning: `ref` and
`aria-expanded`/`aria-controls` are injected as props on the authored `<IconButton>` element itself,
and `IconButton`'s own `forwardRef` and prop-destructuring route them to its real internal `<button>`
regardless of what `IconButton` internally renders around it. This exact combination (an `IconButton`
with an explicit `aria-label`, used as a `DropdownMenu` trigger) already exists in Dropdown Menu's
own `Content` story - Split Button doesn't newly discover the interaction, it relies on an
already-exercised path.

## Accessibility

- The primary action keeps Button's own documented accessibility unchanged.
- The secondary action is a real `IconButton` - `aria-expanded`/`aria-controls` come from Popup (via
  Dropdown Menu); its accessible name and tooltip both come from `secondaryActionLabel`.
- `disabled` disables both segments together (native `disabled` on both, matching how Figma's own
  `isDisabled` axis covers the whole component, not one segment).
- `isLoading` applies Button's own loading treatment (`aria-busy`/`aria-disabled`, spinner replacing
  `iconBefore`) to the primary action only, and additionally disables the secondary action (native
  `disabled`) - picking a different action while the primary one is mid-flight would be confusing,
  and Figma's own `isOpen`/`isDisabled` variants never model "open while loading" as a state to
  design around.

## Styling and tokens

`split-button.module.css` declares no raw values - the squared corners use `0` (an explicitly
ignored value in the stylelint token-governance rule, not a token reference, since "no radius" has
no meaningful token), the divider's size/color use `border-width-sm`, `size-control-xs/sm/md/lg`,
`color-border-input`/`color-content-brand-primary-subtle`/`color-border-disabled`. Every other
value is Button's, IconButton's, or Dropdown Menu/Menu's own tokens.

## Storybook

```txt
SplitButton
├─ Docs (.mdx)
├─ Playground
├─ Variants
├─ Content
└─ EdgeCases
```

### Variants story

Both verified `appearance` values, at every `size`.

### Content story

Realistic primary-action-plus-alternatives examples (send for signature, create trust).

### EdgeCases story

`isLoading` (secondary action disabled alongside it), `disabled` (both segments together), and a
live example confirming a menu selection actually reaches the consumer via that item's own
`onSelect`.

## Tests

Required tests:

```txt
renders the primary action with its own label
calls onClick when the primary action is activated
renders the secondary action with its own accessible name, distinct from the primary label
opens a menu holding the given sections when the secondary action is activated
calls a menu item's own onSelect when chosen
closes the dropdown on Escape, inherited from Popup
disables both the primary and secondary actions when disabled is set
disables the secondary action while the primary action is loading
does not call the primary action's onClick while isLoading, inherited from Button
applies appearance to both the primary and secondary actions
applies size to both the primary and secondary actions
forwards a ref to the primary action
supports a custom id/className on the root
```

## Future considerations

Potential future support:

- A `renderSecondaryAction`/custom-icon escape hatch, if a real use case needs something other than
  the caret.
- Exposing `alignment`, if a real layout ever needs the panel to open left instead of right.

Do not implement these unless requested.
