# Link Button Component Spec

## Overview

Link Button is a Button-family atom that renders as an anchor. It looks exactly like Button but behaves like a link.

## Description

Link buttons open new pages, websites, or new locations on a page. These are buttons that behave like links. For actions that only affect the current page, use a regular button.

## When to use

Use Link Button when the result of the interaction is navigation:

- Go to a client profile
- Open a detail page
- Open an external website
- Jump to a section on the same page
- Open a document URL
- Navigate to a setup flow

## When not to use

Use Button instead when the interaction:

- Saves data
- Submits a form
- Opens a modal
- Opens a menu
- Deletes an item
- Toggles state
- Changes only the current view without navigation

## Core principle

Visual style follows Button.

Semantics follow Link.

That means Link Button should render:

```tsx
<a href="/clients">Clients</a>
```

not:

```tsx
<button>Clients</button>
```

## Anatomy

```txt
LinkButton
├─ anchor root
│  ├─ leading icon, optional
│  ├─ spinner, loading only
│  ├─ label
│  └─ trailing icon, optional
└─ focus ring
```

## Public API

Match Button API as much as possible.

If Button uses `tone`, use:

```ts
type LinkButtonTone =
  | 'default'
  | 'primary'
  | 'subtle'
  | 'warning'
  | 'error'
  | 'discovery';

type LinkButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string;
  tone?: LinkButtonTone;
  size?: LinkButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
```

If Button uses `appearance`, use `appearance` instead.

## Defaults

```txt
tone: default
size: md
isDisabled: false
isLoading: false
```

## Root element

Link Button must render a native anchor.

```tsx
<a href={href}>...</a>
```

Do not render a `button`.

Do not support `type`.

## Href

`href` is required.

Examples:

```tsx
<LinkButton href="/clients">Clients</LinkButton>
```

```tsx
<LinkButton href="https://example.com" target="_blank">
  Visit website
</LinkButton>
```

```tsx
<LinkButton href="#billing">Billing</LinkButton>
```

## Target and rel

If `target="_blank"` is used and `rel` is not provided, apply:

```txt
rel="noopener noreferrer"
```

If `rel` is provided, preserve the provided value.

## Disabled behavior

Because anchors do not support `disabled`, use semantic disabled behavior.

When `isDisabled` is true:

```txt
aria-disabled="true"
tabIndex={-1}
```

Also:

- Prevent default navigation.
- Suppress `onClick`.
- Apply disabled visual styling.
- Keep the anchor in the DOM.

## Loading behavior

When `isLoading` is true:

- Set `aria-busy="true"`.
- Prevent navigation.
- Show Spinner.
- Preserve dimensions.
- Preserve label width.
- Match Button loading behavior.

Recommended loading model:

```txt
Spinner replaces leading content area while preserving label width.
```

## Icon behavior

Match Button.

- `iconBefore` renders before label.
- `iconAfter` renders after label.
- Icons use md size.
- Gap follows Button.
- Loading replaces leading content area with Spinner.
- Do not expose icon size prop.

## Size mapping

Use Button size tokens and classes.

```txt
xs
sm
md
lg
```

The visual result should match Button exactly.

## Tone mapping

Use Button tone mappings:

```txt
default
primary
subtle
warning
error
discovery
```

Tone styles should match Button for:

- default
- hover
- press
- focus
- disabled
- loading

## Focus behavior

Use the shared Focus Ring utility/classes.

Focus should match Button.

## Accessibility

Link Button must:

- Render a native anchor.
- Have meaningful link text.
- Preserve native link semantics.
- Use `aria-disabled` when disabled.
- Use `aria-busy` when loading.
- Add secure `rel` for `_blank`.
- Preserve keyboard behavior.

Keyboard behavior:

```txt
Enter: follows link
Tab: focuses link
```

Space should not be treated as click unless browser/default anchor behavior does so.

## Styling

Visually identical to Button.

Do not add text-link underline behavior.

Do not use text Link styles.

## Storybook

Create:

```txt
Link Button / Playground
Link Button / Variants
Link Button / Examples
```

### Playground controls

```txt
href
children
tone / appearance
size
isDisabled
isLoading
iconBefore
iconAfter
target
```

### Variants story

Show matrix:

```txt
sizes: xs | sm | md | lg
tones: default | primary | subtle | warning | error | discovery
states: default | hover | press | focus
icons: none | before | after
loading
disabled
```

### Examples story

Show:

- internal navigation
- external link
- target blank
- in-page anchor link
- icon before
- icon after
- loading
- disabled

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders anchor
requires/passes href
applies href
renders children
renders iconBefore
renders iconAfter
loading renders Spinner
loading sets aria-busy
loading prevents navigation
disabled sets aria-disabled
disabled sets tabIndex=-1
disabled prevents click/navigation
target blank adds rel noopener noreferrer
provided rel is preserved
applies size class
applies tone/appearance class
custom className works
forwards ref
```

## Future considerations

Potential future API:

```tsx
<LinkButton asChild>
  <RouterLink to="/clients">Clients</RouterLink>
</LinkButton>
```

Do not implement this now.
