# Toggle Button Component Checklist

## Component name

Toggle Button

## Description

Allows users to switch between selected and unselected states while visible as a button.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Button
- Icon Button
- Toggle Icon Button
- Toggle Button Group, future component

## Purpose

Use Toggle Button when a button needs to represent a persistent selected/unselected state.

Toggle Button should look like a button, but semantically behave like a pressed/unpressed toggle control.

## Do not confuse with Switch

Toggle Button is not Switch.

- Switch changes a setting on or off.
- Toggle Button represents whether a button-style option is selected.

## Anatomy

Toggle Button contains:

1. Root button element
2. Optional leading icon
3. Text label
4. Optional trailing icon
5. Focus Ring
6. Selected-state styling

## Figma properties

```txt
size: lg | md | xs | sm
tone: default | subtle
state: default | hover | press | focus
isSelected: false | true
isDisabled: false | true
iconBefore: false | true
iconAfter: false | true
buttonText: string
```

## Code props

```ts
type ToggleButtonTone = 'default' | 'subtle';
type ToggleButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ToggleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: ToggleButtonSize;
  tone?: ToggleButtonTone;
  isSelected?: boolean;
  isDisabled?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
```

## Defaults

```txt
size: md
tone: default
isSelected: false
isDisabled: false
type: button
```

## Required accessibility

Toggle Button must render a native button.

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

## Controlled behavior

Toggle Button should be controlled by the parent.

It should not manage internal selected state in this initial implementation.

Example:

```tsx
<ToggleButton isSelected={isBold} onClick={toggleBold}>
  Bold
</ToggleButton>
```

## Supported tones

```txt
default
subtle
```

Do not add warning, error, discovery, or primary tones in this pass.

## Supported sizes

```txt
xs
sm
md
lg
```

Use Button sizing.

## Supported states

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

## Selected styling

Selected state should use the semantic brand mappings bound in Figma. Background/content are
shared across tones - border is not:

```txt
background: color/background/brand/primary/default/default   (both tones)
content: color/content/brand/primary/default                  (both tones)
border: color/border/brand/primary/default                     (tone=default only)
border: transparent                                             (tone=subtle)
```

Use actual generated token names in code.

## Disabled behavior

When disabled:

- Use native `disabled`.
- Suppress hover/press styles.
- Suppress click behavior.
- Use disabled semantic color tokens, with the same tone-specific border split as selected:
  `tone=default` keeps a border (`color-border-disabled`), `tone=subtle` stays borderless.

Disabled should win over interaction states.

## Focus behavior

Use the shared Focus Ring utility/classes.

Focus should match Button.

Do not create a custom one-off focus implementation.

## Icon behavior

Support:

```txt
iconBefore
iconAfter
```

Use Button icon behavior:

- md icon size
- same gap
- same color inheritance
- same disabled behavior

Do not expose icon size as a public prop.

## Loading behavior

Do not include loading for Toggle Button in this pass.

## Expanded behavior

Do not include expanded behavior.

## Group behavior

Do not build ToggleButtonGroup in this pass.

## Validated Figma Details

- Root fill/border tokens (resting `color-border-input`/`color-content-subtle`, selected
  `color-background-brand-primary-default-default`/`color-border-brand-primary`/
  `color-content-brand-primary-default`, disabled `color-background-disabled`/`color-border-disabled`/
  `color-content-disabled`, hover/pressed overlays `color-background-neutral-overlay-hovered`/
  `-pressed`, focus ring `color-border-focused`) all matched the existing implementation exactly.
  One Components-file swatch (the untouched resting-state fill) resolved to an orphaned variable
  name (`color/background/neutral/overlay/default`) that no longer exists in the live Tokens file -
  a stale library-cache artifact, not a real color. The implementation's `background: transparent`
  at rest is correct.
- `xs`/`sm`/`md`/`lg` = 24/32/40/48px tall, 4/8/8/12px corner radius, 6/8/12/16px inline padding -
  all already correct.
- Fixed a real bug: the icon-to-text gap was `--spacing-sm` (8px); Figma's own auto-layout
  itemSpacing measures a constant 6px at every size. Fixed to `--measurement-6`.
- The icon glyph itself is never resized by this component (no CSS icon-size override, matching
  Button, which also doesn't resize its icons - both just render whatever default size the icon
  itself uses).
- Figma's own default `size` variant is `lg`; the code default stays `md`, consistent with Button
  and every other sized atom in this library.
- Figma has no unique visual treatment for selected+disabled - disabled fully overrides selected,
  matching the existing implementation and this doc's own "State priority" guidance.
- Follow-up review (after Figma added `tone=subtle, isSelected=true` variants): fixed a real bug -
  `.selected` and `.toggleButton:disabled` were single, tone-agnostic rules that always drew a
  border, so a subtle selected/disabled button incorrectly got a border it should never have.
  Figma's `tone=subtle` selected/disabled variants share the exact same fill/text tokens as
  `tone=default`'s but have no stroke at all. Split both rules by tone
  (`.tone_default.selected`/`.tone_subtle.selected`, `.tone_default:disabled`/`.tone_subtle:disabled`)
  so `tone=subtle` stays borderless in both states, matching its own resting look - the same
  bordered/borderless split Button already uses for disabled.

## Storybook requirements

Create the library's unified structure:

- Toggle Button / Docs (.mdx)
- Toggle Button / Playground
- Toggle Button / Variants
- Toggle Button / Sizes
- Toggle Button / States
- Toggle Button / Content
- Toggle Button / EdgeCases

Show:

- both tones crossed with selected/unselected (Variants)
- all sizes (Sizes)
- hover/pressed previews via `data-force-state` (documentation-only, mirrors Button/Checkbox), and
  focus previews via the same mechanism - the shared Focus Ring primitive already reacts to
  `data-force-state="focus"` directly on this element, so no extra CSS is needed (States)
- disabled, selected + disabled, and a live click-to-toggle example (States)
- toolbar example, view-mode example, filter pair (Content)
- long label wrapping, dark surface (EdgeCases)

## Test requirements

Test:

- renders native button
- defaults type to button
- renders children
- supports iconBefore
- supports iconAfter
- sets `aria-pressed="false"` by default
- sets `aria-pressed="true"` when selected
- applies selected class/state when selected
- applies size classes
- applies tone classes
- disabled sets native disabled
- disabled prevents click
- supports custom `className`
- forwards ref
- uses a 6px icon-to-text gap at every size
- supports data-force-state hover/pressed preview

## Do not include

Do not use MUI.

Do not use Tailwind.

Do not render an anchor.

Do not use `aria-selected`.

Do not use `aria-expanded`.

Do not use `role="switch"`.

Do not add loading.

Do not add `asChild`.

Do not add ToggleButtonGroup.
