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
- icon-only selected controls; use Toggle Icon Button later
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

Selected state should use semantic selected tokens.

Expected mapping:

```txt
background: color/background/selected/default
content: color/content/selected
border: color/border/selected
```

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

Use Button size tokens and visual dimensions.

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
- disabled semantic tokens are used

## State priority

Recommended priority:

```txt
disabled > selected > press > hover > default
```

If selected + disabled has no unique design treatment, disabled styling may fully override selected visuals.

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

Create:

```txt
Toggle Button / Playground
Toggle Button / Variants
Toggle Button / Examples
```

Do not create separate States or Accessibility pages.

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

Show:

```txt
sizes: xs | sm | md | lg
tones: default | subtle
selected: false | true
icons: none | before | after
disabled
```

### Examples story

Show:

- text formatting toolbar
- view mode toggle
- filter button pair
- selected and unselected examples

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
```

## Future considerations

Future components:

- ToggleButtonGroup
- Toggle Icon Button

Do not implement either in this pass.
