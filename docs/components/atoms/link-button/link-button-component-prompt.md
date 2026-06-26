# Link Button Component Prompt

## Component

Link Button

## Description

Link buttons open new pages, websites, or new locations on a page. These are buttons that behave like links. For actions that only affect the current page, use a regular button.

## Implementation summary

Build Link Button as a Button-family atom.

It should look exactly like Button but render a native anchor.

Use Button styling, tokens, sizes, tones, icon behavior, loading behavior, and focus behavior wherever practical.

## Core API

Match Button naming.

If Button uses `tone`:

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

If Button uses `appearance`, use `appearance` instead of `tone`.

## Defaults

```txt
tone: default
size: md
isDisabled: false
isLoading: false
```

## Required root

Render:

```tsx
<a href={href}>...</a>
```

Do not render:

```tsx
<button>...</button>
```

## Disabled

When disabled:

```txt
aria-disabled="true"
tabIndex={-1}
```

Prevent navigation and suppress `onClick`.

## Loading

When loading:

```txt
aria-busy="true"
```

Prevent navigation.

Render Spinner using Button loading behavior.

Preserve label width and dimensions.

## External link security

If:

```tsx
target="_blank"
```

and no `rel` is provided, add:

```txt
rel="noopener noreferrer"
```

## Icons

Support:

```tsx
iconBefore
iconAfter
```

Use the same icon behavior as Button.

Icons are md size.

Do not expose icon size prop.

## Styling

Use Button visual styles exactly.

Supported visual props:

```txt
size: xs | sm | md | lg
tone/appearance: default | primary | subtle | warning | error | discovery
```

States:

```txt
default
hover
press
focus
disabled
loading
```

Do not add underline behavior.

## Files

Create:

```txt
packages/ui/src/components/atoms/link-button/
```

Expected files:

```txt
LinkButton.tsx
LinkButton.types.ts
LinkButton.module.css
LinkButton.test.tsx
LinkButton.stories.tsx
index.ts
link-button-component-checklist.md
link-button-component-spec.md
link-button-component-prompt.md
```

Use actual project naming conventions.

## Exports

Add Link Button to atom/component barrel exports.

## Storybook

Create:

```txt
Link Button / Playground
Link Button / Variants
Link Button / Examples
```

Do not create separate States or Accessibility pages.

## Testing

Test:

- anchor rendering
- href
- target
- rel behavior
- disabled behavior
- loading behavior
- icons
- size class
- tone/appearance class
- ref forwarding
- custom className
- click behavior

## Do not

Do not use MUI.

Do not use Tailwind.

Do not hardcode design values.

Do not render a button.

Do not add `type`.

Do not add `asChild`.

Do not add router-specific behavior.

Do not add Tooltip internally.

Do not add underline/text-link styling.
