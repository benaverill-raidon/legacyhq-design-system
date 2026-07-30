# Toggle Icon Button Component Checklist

## Component name

Toggle Icon Button

## Description

An icon-only toggle button lets users switch between selected and unselected states where space is limited.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Button
- Icon Button
- Toggle Button
- Tooltip
- Toggle Icon Button Group, future component

## Purpose

Use Toggle Icon Button when a compact icon-only control needs to represent a persistent selected/unselected state.

Use Icon Button for momentary icon-only actions.
Use Toggle Button when the action benefits from visible text.
Use Switch for settings that turn something on or off.

## Anatomy

Toggle Icon Button contains:

1. Root button element
2. Icon slot using `children`
3. Focus Ring
4. Selected/unselected visual state
5. Accessible name through `aria-label` or `aria-labelledby`

## Figma properties

```txt
shape: round | square
size: xs | sm | md | lg
tone: default | subtle
state: default | hover | press | focus
isSelected: false | true
isDisabled: false | true
```

## Code props

```ts
type ToggleIconButtonTone = 'default' | 'subtle';
type ToggleIconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type ToggleIconButtonShape = 'square' | 'round';

interface ToggleIconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: ToggleIconButtonSize;
  tone?: ToggleIconButtonTone;
  shape?: ToggleIconButtonShape;
  isSelected?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}
```

## Defaults

```txt
size: md
tone: default
shape: square
isSelected: false
isDisabled: false
type: button
```

## Required accessibility

Toggle Icon Button must have an accessible name.

Acceptable:

```tsx
<ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

```tsx
<ToggleIconButton aria-labelledby="grid-view-label" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

Not acceptable:

```tsx
<ToggleIconButton isSelected>
  <GridIcon />
</ToggleIconButton>
```

Tooltip text must not be the only accessible name.

## ARIA behavior

Use:

```tsx
aria-pressed={isSelected}
```

Do not use:

```txt
aria-selected
aria-expanded
role="switch"
role="checkbox"
```

## Tooltip guidance

Toggle Icon Button should not render Tooltip internally.

Tooltip may wrap Toggle Icon Button:

```tsx
<Tooltip content="Grid view">
  <ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
    <GridIcon />
  </ToggleIconButton>
</Tooltip>
```

Tooltip content should usually match or clarify the accessible label.

## Size requirements

Toggle Icon Button uses the same square size scale as Icon Button.

```txt
xs: 24px square
sm: 32px square
md: 40px square
lg: 48px square
```

Icon size is always `md`.

Do not scale the icon by button size unless future design direction changes.

## Shape requirements

```txt
square: size-specific Button/Icon Button radius
round: full-round radius
```

Default shape is `square`.

## Tone requirements

Supported tones:

```txt
default
subtle
```

Do not add warning, error, discovery, or primary for the initial pass.

## State requirements

Support:

```txt
default
hover
press
focus
selected
selected + hover
selected + press
selected + focus
disabled
selected + disabled
```

## Selected behavior

When `isSelected` is true:

- Set `aria-pressed="true"`.
- Apply selected visual styling.
- Preserve button dimensions.
- Keep icon centered.

Selected mappings bound in Figma:

```txt
background: color/background/brand/primary/default/default
content: color/content/brand
border: color/border/brand
```

Use actual generated token names in code.

## Disabled behavior

When disabled:

- Use native `disabled`.
- Suppress hover/press styles.
- Suppress click behavior.
- Use disabled semantic color tokens.
- Maintain accessible disabled semantics.

Disabled should win over selected for interaction.

## Focus behavior

Use the shared Focus Ring primitive or utility classes.

Focus Ring should match Icon Button and Toggle Button behavior.

Do not create a custom one-off focus style.

## Keyboard behavior

Native button behavior:

```txt
Enter: activates
Space: activates
Tab: focuses
```

## Token usage

Use semantic tokens where available.

Use shared semantic, dimension, spacing, and radius tokens directly.

Do not hardcode:

- sizes
- colors
- spacing
- border widths
- radius values
- focus ring values

## Validated Figma Details

- Root fill/border/selected/disabled/hover/pressed/focus tokens all matched exactly - identical to
  the token set already verified for Toggle Button (same underlying pattern), including the one
  orphaned Components-file reference for the resting-state fill (a stale library-cache artifact
  pointing at a variable that no longer exists in the live Tokens file - `background: transparent`
  is correct as implemented).
- `xs`/`sm`/`md`/`lg` = 24/32/40/48px square, 4/8/8/12px corner radius (`square` shape) - all
  already correct. `round` shape measures a full circle (`cornerRadius: 999`) at every size,
  matching `border-radius-full-round`.
- The icon glyph is a constant 16px at every size in Figma, and this component never resizes it via
  CSS - matching Icon Button and Toggle Button's own convention of not touching the icon's default
  size. No bug found here.
- No unique visual treatment exists for selected+disabled - disabled fully overrides selected,
  matching this doc's own state-priority guidance.

## Storybook requirements

Create the library's unified structure:

- Toggle Icon Button / Docs (.mdx)
- Toggle Icon Button / Playground
- Toggle Icon Button / Variants
- Toggle Icon Button / Sizes
- Toggle Icon Button / States
- Toggle Icon Button / Content
- Toggle Icon Button / EdgeCases

Show:

- tone crossed with selected, plus the independent shape axis (Variants)
- all sizes (Sizes)
- hover/pressed previews via `data-force-state` (documentation-only, mirrors Button/Checkbox), and
  focus previews via the same mechanism - the shared Focus Ring primitive already reacts to
  `data-force-state="focus"` directly on this element, so no extra CSS is needed (States)
- disabled, selected + disabled, and a live click-to-toggle example (States)
- view-mode, formatting-toolbar, and favorite/save examples (Content)
- the missing-accessible-name anti-pattern (logs a dev warning) and dark surface (EdgeCases)

## Test requirements

Test:

- renders a native button
- defaults to `type="button"`
- requires/supports accessible name
- supports `aria-label`
- supports `aria-labelledby`
- renders children as icon content
- sets `aria-pressed="false"` by default
- sets `aria-pressed="true"` when selected
- applies selected state/class
- disabled uses native disabled behavior
- click handler fires when enabled
- click handler does not fire when disabled
- applies size classes
- applies tone classes
- applies shape classes
- supports custom `className`
- forwards ref
- supports data-force-state hover/pressed preview

## Do not include

Do not include Tooltip internally.

Do not include `asChild`.

Do not include link behavior.

Do not include loading for the initial pass.

Do not include expanded/menu-trigger behavior.

Do not expose icon size as a public prop.

Do not build ToggleIconButtonGroup yet.
