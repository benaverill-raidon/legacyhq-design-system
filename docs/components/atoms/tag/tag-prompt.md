# Tag Component Prompt

## Component

Tag

## Description

A tag labels UI objects for classification and navigation.

## Implementation summary

Build Tag as an atom that supports display-only, navigational, removable, and navigational + removable behavior.

In LegacyHQ, tags are used as a fundamental representation for referenced entities in tasks, notes, and related workflows. A tag may link to an entity and also have a remove button to remove the relationship/reference from the current context.

## Core API

```ts
type TagTone =
  | 'standard'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'orange'
  | 'magenta';

type TagSize = 'sm' | 'md';

interface TagProps extends React.HTMLAttributes<HTMLElement> {
  size?: TagSize;
  tone?: TagTone;
  href?: string;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: string;
  isRemovable?: boolean;
  isDisabled?: boolean;
  elemBefore?: React.ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  children: React.ReactNode;
}
```

Use actual project conventions.

## Defaults

```txt
size: md
tone: standard
isRemovable: false
isDisabled: false
removeLabel: Remove tag
```

## Required behavior model

Tag supports four behavior modes:

```txt
1. Display-only
2. Navigational
3. Removable
4. Navigational + removable
```

## Display-only

When no `href` and no `isRemovable` are provided, render a non-interactive tag.

```tsx
<Tag tone="green">Active</Tag>
```

## Navigational

When `href` is provided, tag content should be a native anchor.

```tsx
<Tag href="/assets/123" tone="green">
  Ben’s Investments
</Tag>
```

Do not render a button for navigation.

## Removable

When `isRemovable` is true, render a native remove button.

```tsx
<Tag isRemovable onRemove={handleRemove}>
  Estate planning
</Tag>
```

## Navigational + removable

When both `href` and `isRemovable` are provided, render a wrapper with separate interactive elements:

```tsx
<span className={styles.root}>
  <a className={styles.content} href={href}>...</a>
  <button className={styles.removeButton} type="button" />
</span>
```

Do not nest a button inside an anchor.

The content area navigates. The remove button removes the tag/reference.

## Remove button

Use a private/internal remove control. Do not expose `square-remove-button` as a public component unless the project already needs it elsewhere.

Remove button requirements:

- native button
- `type="button"`
- accessible label
- calls `onRemove`
- stops propagation
- does not trigger navigation
- disabled when tag is disabled

## Accessible remove label

Use `removeLabel` when provided.

If children is a string, derive:

```txt
Remove {children}
```

Otherwise fallback to:

```txt
Remove tag
```

## Leading element

Support `elemBefore` for icon, avatar, or slot component.

```tsx
<Tag elemBefore={<TrustIcon />} href="/trusts/123">
  Averill Family Living Trust
</Tag>
```

## Disabled

When `isDisabled` is true:

- disabled visual styling wins
- suppress navigation
- suppress remove behavior
- set `aria-disabled="true"` on anchor content
- set `tabIndex={-1}` on anchor content
- set native `disabled` on remove button

## External links

If `target="_blank"` is provided and `rel` is not provided, automatically set:

```txt
rel="noopener noreferrer"
```

Preserve provided `rel`.

## Visual properties

Support:

```txt
size: sm | md
tone: standard | blue | green | purple | red | teal | yellow | orange | magenta
state: default | hover | press | focus
isRemovable: false | true
elemBefore: false | true
isDisabled: false | true
```

## Token rules

Use semantic tokens where available.

Do not hardcode:

- colors
- sizes
- spacing
- borders
- focus ring values
- radius values

## Storybook

Create:

```txt
Tag / Playground
Tag / Variants
Tag / Examples
```

Do not create separate States or Accessibility pages.

## Testing

Test all behavior modes, especially navigational + removable.

Important test:

```txt
Clicking remove does not trigger navigation or the tag link click handler.
```

## Do not

Do not use MUI.

Do not use Tailwind.

Do not nest button inside anchor.

Do not add router-specific `asChild` yet.

Do not expose square-remove-button publicly yet.

Do not make unrelated component changes.
