# Generate Split Button Molecule

Use `split-button-spec.md` as the source of truth.

## Goal

Generate a production-ready Split Button molecule for our internal React component library. A
split button lets people perform an action, or choose from a small group of similar actions - a
thin composition of a real Button, a real IconButton, and Dropdown Menu, not a third independent
implementation of any of them.

Split Button is classified as a molecule despite composing Dropdown Menu, an organism - the same
documented tier exception Tag Group and Avatar Group already established (see CLAUDE.md and
`split-button-spec.md`'s own reasoning; this prompt does not re-derive it).

---

## Inputs

Use these inputs:
- `split-button-checklist.md` for design/product context
- `split-button-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `split-button` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `4620:101467`, filed on the "✅⏲️ Split Button" page) - verified live via the
  Desktop Bridge plugin, correctly named
- Figma part `figma-parts / split-button / divider` (componentSetNodeId `2121:59148`) - the
  divider's real source, a 1px vector fill keyed to tone
- Figma part `figma-parts / secondary-action` (componentSetNodeId `4620:94657`) - the secondary
  action's real source, itself an IconButton instance (`shape="square"`) with a `caret_down` icon
  (matches this codebase's existing `CaretDownIcon`)
- The existing Button atom (`packages/ui/src/components/atoms/button/`) - render the primary
  action through it directly
- The existing IconButton atom (`packages/ui/src/components/atoms/icon-button/`) - render the
  secondary action through it directly
- The existing Dropdown Menu organism (`packages/ui/src/components/organisms/dropdown-menu/`) -
  render the secondary action's panel through it directly

If anything conflicts, follow `split-button-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules (`split-button.module.css` - the divider and the squared inner corners only; no raw
  values other than `0` for "no radius", which has no meaningful token)

---

## Implementation

Create:

```txt
packages/ui/src/components/molecules/split-button/
├─ split-button.tsx
├─ split-button.types.ts
├─ split-button.module.css
├─ SplitButton.test.tsx
├─ SplitButton.stories.tsx
├─ split-button.mdx
└─ index.ts
```

No changes to Button or IconButton are needed - both already support everything this composition
requires.

---

## Component API

```ts
export type SplitButtonAppearance = 'default' | 'primary';

export interface SplitButtonProps extends Omit<ButtonProps, 'appearance' | 'isFullWidth'> {
  appearance?: SplitButtonAppearance;
  sections: MenuSection[];
  secondaryActionLabel: string;
}
```

Defaults:

```ts
appearance = 'default' // matches Button's/IconButton's own code default - no divergence needed
size = 'md'             // matches Button's/IconButton's own code default
```

(Every other default is `ButtonProps`'s own, applied by Button itself - do not re-declare them.)

---

## Behavioral Requirements

- Hold exactly one piece of state - `open` (boolean) - to drive the secondary action's
  `DropdownMenu`, which is itself fully controlled.
- Render the primary action as `<Button {...rest} ref={forwardedRef} className={styles.primaryAction}
  appearance={appearance} size={size} disabled={disabled} isLoading={isLoading} onClick={onClick}>
  {children}</Button>` - forward every other `ButtonProps` prop (`tone`, `iconBefore`, `iconAfter`,
  any native button attribute) through unchanged via `{...rest}`.
- Render the divider as a single internal `<span className={styles.divider}
  data-disabled={disabled ? 'true' : undefined} aria-hidden="true" />` - not its own exported
  component.
- Render the secondary action as `<IconButton className={styles.secondaryAction}
  appearance={appearance} size={size} shape="square" disabled={disabled || isLoading}
  aria-label={secondaryActionLabel} onClick={() => setOpen((current) => !current)}>
  <CaretDownIcon size="md" decorative /></IconButton>`, wrapped in `<DropdownMenu
  aria-label={secondaryActionLabel} open={open} onOpenChange={setOpen} showSearch={false}
  alignment="right" sections={sections}>`.
- Do not pass `isExpanded` to the secondary action's IconButton - it has no visual effect in code
  today, and Popup (via Dropdown Menu) already overwrites `aria-expanded` via its own
  trigger-cloning regardless of whatever IconButton would set internally.
- `disabled` disables both segments together (native `disabled` on both). `isLoading` applies only
  to the primary action (Button's own loading treatment - `aria-busy`/`aria-disabled`, not native
  `disabled`, so it stays focusable), but additionally sets the secondary action's own `disabled` to
  `disabled || isLoading` - picking a different action while the primary one is mid-flight would be
  confusing.
- Apply `appearance` and `size` uniformly to both segments - there is no per-segment appearance or
  size mixing in Figma's own `split-button` variant set.
- `showSearch={false}` and `alignment="right"` are hardcoded on the internal `DropdownMenu` call,
  not exposed as `SplitButtonProps` - Figma's own variant set has no `alignment` axis at all (every
  instance opens "bottom right").

---

## CSS Requirements

- `.root`: `display: inline-flex; align-items: stretch;` - no gap, matching Figma's own
  `itemSpacing: 0`.
- `.primaryAction`: square the trailing corners only - `border-start-end-radius: 0;
  border-end-end-radius: 0;`. Do not touch the leading corners; Button's own per-size radius token
  already applies correctly there. Also set `border-inline-end-width: 0;` on the same rule - Figma's
  own button instance inside split-button measures `strokeRightWeight: 0` on that exact edge, so
  Button's own 1px border there must be suppressed or it stacks with the divider into a visibly wide
  seam instead of one clean 1px line.
- `.secondaryAction`: square the leading corners only - `border-start-start-radius: 0;
  border-end-start-radius: 0;`. Do not touch the trailing corners. Also set
  `border-inline-start-width: 0;` on the same rule - the mirror of the primary action's fix
  (Figma's own icon-button instance measures `strokeLeftWeight: 0` on that exact edge).
- Use CSS logical properties for both, not physical (`border-top-left-radius` etc.) - keeps the
  layout correct in RTL contexts, matching Tag's own wrapper/remove-button precedent.
- `.divider`: `inline-size: var(--border-width-sm);` with a per-size `block-size` matching button
  height (`--size-control-xs/sm/md/lg` on `.size_xs .divider` / `.size_sm .divider` / etc., applied
  via a `size_${size}` class on the root - same descendant-selector pattern Avatar Group's own
  `.size_xs .overflowTrigger` already uses). Background color: `var(--color-border-input)` under an
  `appearance_default` root class, `var(--color-content-brand-primary-subtle)` under
  `appearance_primary`, both overridden to `var(--color-border-disabled)` when
  `[data-disabled='true']` is set on the divider itself.
  Do not use `--color-border-brand-primary-subtle` - it does not exist in the generated token CSS
  (Figma's own variable on this fill uses that name, but no code-side "subtle" border variant has
  been built); it silently resolves to nothing and renders the divider fully transparent.
  Do not use `--color-border-brand-primary` either, even though the name looks like the obvious
  fallback - it resolves to the exact same `prussian-900` primitive as the primary button's own
  background (`--color-background-brand-primary-bold-default`), so the divider paints itself
  invisible on top of an identical-colored surface. Resolve Figma's own fill node directly (not
  just the variable name) and it's `prussian-300`, a light tint - `--color-content-brand-primary-
  subtle` already aliases exactly that value, reused here on a `background-color` the same way
  Slider's own active track-stop dot already reuses it ("needs the subtle/light brand color for
  contrast against that dark fill" - see slider.module.css's own comment).
- No raw pixel values anywhere except the CSS `0` used for squared corners (an explicitly-ignored
  value in the token-governance stylelint rule, since "no radius" has no meaningful token to
  reference).

---

## Accessibility Rules

- Do not add any custom key handling to either segment - both are real `<button>` elements (Button,
  IconButton), so Enter/Space activation is native on both.
- Forward `secondaryActionLabel` to both the secondary action's own `aria-label` and to
  `DropdownMenu`'s `aria-label` (which forwards to Menu's `role="menu"` container) - these are two
  different accessible names (the button itself, and the panel it opens) that happen to read
  naturally with the same text in this case.
- Do not set a `role` on the root element - it is a plain layout container; each segment and the
  panel already carry their own correct roles.

---

## Storybook Requirements

Create stories for:
- Playground (prop exploration via Storybook controls)
- Variants (both verified `appearance` values, at every `size`)
- Content (realistic primary-action-plus-alternatives examples)
- EdgeCases (`isLoading` with the secondary action disabled alongside it; `disabled` on both
  segments together at both `appearance` values - `primary` must render borderless, not borrow
  `default`'s bordered disabled look; a live example confirming a menu selection reaches the
  consumer via that item's own `onSelect`)

---

## Test Requirements

Create tests for:
- Renders the primary action with its own label
- Calls `onClick` when the primary action is activated
- Renders the secondary action with its own accessible name, distinct from the primary label
- Opens a menu holding the given `sections` when the secondary action is activated
- Calls a menu item's own `onSelect` when chosen
- Closes the dropdown on Escape (inherited from Popup)
- Disables both the primary and secondary actions when `disabled` is set
- Disables the secondary action while the primary action is `isLoading`
- Does not call the primary action's `onClick` while `isLoading` (inherited from Button)
- Applies `appearance` to both the primary and secondary actions
- Applies `size` to both the primary and secondary actions
- Forwards a ref to the primary action
- Suppresses each segment's own border on the interior edge (`border-inline-end-width: 0` on
  `.primaryAction`, `border-inline-start-width: 0` on `.secondaryAction`)
- Gives the primary-appearance divider `--color-content-brand-primary-subtle`, not
  `--color-border-brand-primary` (same primitive as the primary button's own background - an
  invisible divider) or `--color-border-brand-primary-subtle` (does not exist)
- Supports a custom `id`/`className` on the root

---

## Rules

1. Follow `split-button-spec.md` exactly.
2. Do not duplicate any Button, IconButton, Popup, Menu, or Dropdown Menu behavior - render through
   all of them, don't re-implement any of it.
3. No MUI. No Tailwind. No hardcoded colors/spacing - `split-button.module.css` uses `var(--...)`
   exclusively, aside from the `0` used for squared corners.
4. Export the component and its types.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify ESLint passes.
- Verify `npm run lint:css` passes (no raw values in `split-button.module.css` other than the
  explicitly-ignored `0`).
- Verify Storybook compiles.
- Verify tests pass.
- Verify the implementation matches the real Figma structure (the `tone`/`size`/`isDisabled`/
  `isOpen` variant grid, the measured squared-corner radii, and the divider/secondary-action parts'
  real identities).
