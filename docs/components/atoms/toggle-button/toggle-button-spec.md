# Toggle Button Component Spec

## Overview

Toggle Button is a Button-family atom that lets users switch a button between selected and unselected states.

It should visually follow Button, but semantically represent a pressed/unpressed toggle state.

## Description

Allows users to switch between selected and unselected states while visible as a button.

## When to use

Use Toggle Button for button-like options that can stay selected, such as:

- text formatting controls
- view mode controls
- filter controls
- editor toolbar options
- display preferences
- selected/unselected UI modes

## When not to use

Do not use Toggle Button for:

- navigation; use Link Button
- normal actions; use Button
- settings that turn something on/off; use Switch
- icon-only selected controls; use Toggle Icon Button
- mutually exclusive groups; use ToggleButtonGroup later

## Core principle

Toggle Button is a native button with pressed state.

Use:

```tsx
aria-pressed={isSelected}
```

Do not use:

```txt
aria-selected
aria-expanded
role="switch"
```

## Anatomy

```txt
ToggleButton
├─ button root
│  ├─ leading icon, optional
│  ├─ label
│  └─ trailing icon, optional
└─ focus ring
```

## Public API

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

## Root element

Toggle Button must render a native button.

```tsx
<button type="button" aria-pressed={isSelected}>...</button>
```

Do not render an anchor.

## Selected behavior

`isSelected` controls the selected state.

When selected:

```txt
aria-pressed=true
selected visual styling is applied
```

When unselected:

```txt
aria-pressed=false
default visual styling is applied
```

Toggle Button should not manage internal selected state in this initial implementation.

The parent owns the selected value.

## Selected token mapping

Selected state should use the semantic brand mappings bound in Figma. Background and content
tokens are shared across both tones - only the border differs, matching each tone's own resting
border visibility:

```txt
background: color/background/brand/primary/default/default   (both tones)
content: color/content/brand/primary/default                  (both tones)
border: color/border/brand/primary/default                     (tone=default only)
border: transparent                                             (tone=subtle)
```

`tone="default"` already shows a visible border at rest, so selected keeps one. `tone="subtle"` is
borderless at rest - applying the same border there would draw a border that was never part of its
look, so selected stays borderless too. Confirmed directly from Figma's `tone=subtle,
isSelected=true` variants (no stroke, same fill/text tokens as `tone=default`'s selected state).

Use actual generated token names.

Do not hardcode colors.

## Tone support

Supported tones:

```txt
default
subtle
```

Do not add primary, warning, error, or discovery in this pass.

## Size support

Supported sizes:

```txt
xs
sm
md
lg
```

Use shared dimension, spacing, typography, and radius tokens that match Button-family geometry:
24/32/40/48px tall, 4/8/8/12px corner radius, 6/8/12/16px inline padding - verified against Figma.

The icon-to-text gap is a constant 6px (`--measurement-6`) at every size - verified by measuring
Figma's own auto-layout itemSpacing, which is identical across xs/sm/md/lg. This isn't one of the
named spacing tokens (4/8/12/16px), so it's aliased directly to the raw 6px measurement rather than
a semantic spacing token.

## Icon support

Support:

```tsx
iconBefore
iconAfter
```

Match Button icon behavior:

- md icon size
- same gap
- same color inheritance
- same disabled behavior

Do not expose icon size as a public prop.

## Focus behavior

Use shared Focus Ring utility/classes.

Focus should visually match Button.

## Disabled behavior

Use native disabled behavior.

When disabled:

```tsx
disabled={true}
```

Expected:

- click is suppressed by native behavior
- hover/press styles are suppressed
- disabled semantic tokens are used, with the same tone-specific border split selected uses:
  `tone="default"` disabled keeps a visible border (`color/border/disabled`), `tone="subtle"`
  disabled stays borderless (confirmed directly from Figma's `tone=subtle, isDisabled=true`
  variants - no stroke)

## State priority

Recommended priority:

```txt
disabled > selected > press > hover > default
```

Figma has no unique selected+disabled treatment, so disabled styling fully overrides selected
visuals - but the tone-specific border split still applies within disabled itself (see above), so a
disabled `tone="subtle"` selected button stays borderless while a disabled `tone="default"`
selected button keeps its border.

## Loading

Do not include loading in this pass.

## Expanded

Do not include expanded behavior.

This component uses `aria-pressed`, not `aria-expanded`.

## Accessibility

Toggle Button must:

- render a native button
- default to `type="button"`
- set `aria-pressed`
- support disabled
- preserve native keyboard behavior
- forward refs

Keyboard behavior:

```txt
Enter: activates
Space: activates
Tab: focuses
```

## Styling

Toggle Button should reuse Button-family styling where practical.

It should support:

```txt
text only
icon before
icon after
selected
unselected
disabled
focus
hover
press
```

Do not use Link Button styles.

Do not use Switch styles.

## Storybook

Unified story structure, matching the rest of the library:

```txt
Toggle Button
├─ Docs (.mdx)
├─ Playground
├─ Variants
├─ Sizes
├─ States
├─ Content
└─ EdgeCases
```

### Playground controls

```txt
children
size
tone
isSelected
isDisabled
iconBefore
iconAfter
```

### Variants story

Show `tone` (`default`/`subtle`) crossed with `isSelected` - the two designed forms and the state
that overrides both - plus icon-before/icon-after examples.

### Sizes story

Show `xs`/`sm`/`md`/`lg` side by side.

### States story

`data-force-state` mirrors the adjacent pseudo-class (documentation-only, not part of the public
API) so hover/press render as a static regression reference - the same convention Button and
Checkbox use. Focus preview needs no extra CSS: the shared Focus Ring primitive already reacts to
`data-force-state="focus"` directly on this element. Cross unselected/selected with
default/hover/focus/press/disabled, and include a live click-to-toggle example.

### Content story

Show:

- text formatting toolbar
- view mode toggle
- filter button pair

### EdgeCases story

Show:

- long label wrapping in a narrow container
- dark surface

Do not build ToggleButtonGroup yet.

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders native button
defaults type to button
renders children
supports iconBefore
supports iconAfter
sets aria-pressed=false by default
sets aria-pressed=true when isSelected=true
applies selected class/state when selected
applies size class
applies tone class
disabled sets native disabled
disabled prevents click
custom className works
forwards ref
uses a 6px icon-to-text gap at every size
supports data-force-state hover/press preview
```

## Future considerations

Future components:

- ToggleButtonGroup

Do not implement in this pass.
