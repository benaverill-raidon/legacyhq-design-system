# Link Button Component Checklist

## Component name

Link Button

## Description

Link buttons open new pages, websites, or new locations on a page. These are buttons that behave like links. For actions that only affect the current page, use a regular button.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Button
- Link
- Icon Button
- Spinner

## Purpose

Use Link Button when navigation should look visually like a Button.

Use regular Button for actions that affect the current page or trigger behavior without navigation.

## Anatomy

Link Button contains:

1. Anchor root
2. Optional leading icon
3. Text label
4. Optional trailing icon
5. Optional Spinner when loading
6. Focus Ring

## Figma properties

```txt
size: xs | sm | md | lg
tone: default | primary | subtle | warning | error | discovery
state: default | hover | press | focus
isDisabled: false | true
isLoading: false | true
iconBefore: false | true
iconAfter: false | true
buttonText: string
```

## Code props

Mirror Button naming and behavior as closely as possible.

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

If Button uses `appearance` instead of `tone`, use Button’s exact prop name.

## Defaults

```txt
tone: default
size: md
isDisabled: false
isLoading: false
target: undefined
rel: undefined, unless target is _blank
```

## Required behavior

Link Button renders a native anchor:

```tsx
<a href="/path">Label</a>
```

It should not render a `button`.

## Navigation behavior

Use Link Button for:

- navigating to another page
- opening an external website
- jumping to another location on the page
- opening a document/download URL if styled as a button

Do not use Link Button for:

- saving
- submitting
- deleting
- opening menus
- toggling UI
- changing in-page state only

## Disabled behavior

Native anchors do not support `disabled`.

When `isDisabled` is true:

- Set `aria-disabled="true"`.
- Set `tabIndex={-1}`.
- Prevent navigation with `event.preventDefault()`.
- Suppress click handler behavior.
- Use disabled Button visual styling.
- Do not remove `href` unless existing project conventions require it.

## Loading behavior

When `isLoading` is true:

- Replace leading content area with Spinner if following Button loading behavior.
- Preserve the original label width.
- Set `aria-busy="true"`.
- Prevent navigation.
- Apply disabled/loading interaction behavior.
- Keep the same dimensions as normal Link Button.

## External links

If `target="_blank"` is provided and `rel` is not provided, automatically set:

```txt
rel="noopener noreferrer"
```

## Icon behavior

Match Button icon behavior.

- Icons use md size.
- Icons use spacing none internally.
- Gap remains consistent with Button.
- Support leading and trailing icons.
- Loading should replace leading content area with Spinner while preserving label width.

## Focus behavior

Use shared Focus Ring utility/classes.

Focus should visually match Button.

## Size behavior

Use the same size mapping as Button:

```txt
xs
sm
md
lg
```

## Tone behavior

Use the same visual tone mapping as Button:

```txt
default
primary
subtle
warning
error
discovery
```

## Storybook requirements

Stories should include:

- Playground
- Variants
- Examples

Do not create separate States or Accessibility pages if the current library has moved away from those.

Show:

- all sizes
- all tones
- disabled
- loading
- icon before
- icon after
- external link
- in-page anchor link
- internal route link

## Test requirements

Test:

- renders native anchor
- requires/passes href
- applies href
- applies target
- auto-adds rel for target blank
- does not override provided rel
- renders children
- renders iconBefore
- renders iconAfter
- loading renders Spinner
- loading sets aria-busy
- loading prevents navigation
- disabled sets aria-disabled
- disabled sets tabIndex -1
- disabled prevents navigation/click
- applies size classes
- applies tone/appearance classes
- supports custom className
- forwards ref

## Do not include

Do not render a native button.

Do not add `type`.

Do not add `asChild` yet.

Do not include router-specific behavior yet.

Do not add underline behavior from text Link.

Do not use Tooltip internally.
