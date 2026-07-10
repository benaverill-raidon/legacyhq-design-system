# Tag Component Checklist

## Component name

Tag

## Description

A tag labels UI objects for classification and navigation.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Badge
- Label
- Link
- Icon Button
- Button
- Avatar

## Purpose

Use Tag to represent referenced entities, classifications, or navigational metadata in the product. In LegacyHQ, tags may represent linked entities such as people, assets, trusts, tasks, notes, documents, or other referenced records.

Tags may be display-only, navigational, removable, or both navigational and removable.

## Core use cases

- Display a classification or category
- Link to a referenced entity
- Show a selected/reference item in task or note content
- Remove a referenced entity from a collection
- Include a leading icon, avatar, or slot component

## Figma properties

```txt
size: sm | md
state: default | hover | press | focus
tone: standard | blue | green | purple | red | teal | yellow | orange | magenta
isRemovable: false | true
elemBefore: false | true
isDisabled: false | true
tagText: string
```

## Code props

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

## Defaults

```txt
size: md
tone: standard
isRemovable: false
isDisabled: false
removeLabel: Remove tag
```

## Rendering behavior

Display-only Tag:

```tsx
<Tag>Estate plan</Tag>
```

Navigational Tag:

```tsx
<Tag href="/entities/trusts/123">Averill Family Living Trust</Tag>
```

Removable Tag:

```tsx
<Tag isRemovable onRemove={handleRemove}>Averill Family Living Trust</Tag>
```

Navigational and removable Tag:

```tsx
<Tag href="/entities/trusts/123" isRemovable onRemove={handleRemove}>
  Averill Family Living Trust
</Tag>
```

## Navigational + removable structure

Do not nest a button inside an anchor.

Correct structure:

```tsx
<span className={styles.root}>
  <a className={styles.content} href="/entities/trusts/123">
    <span className={styles.elemBefore} />
    <span className={styles.text}>Averill Family Living Trust</span>
  </a>
  <button className={styles.removeButton} type="button" aria-label="Remove Averill Family Living Trust" />
</span>
```

Incorrect:

```tsx
<a href="/entities/trusts/123">
  Averill Family Living Trust
  <button type="button">Remove</button>
</a>
```

## Accessibility

Tag should preserve the semantics of its behavior:

- Display-only: non-interactive text container
- Navigational: native anchor with `href`
- Removable: remove control is a native button
- Navigational + removable: anchor and remove button are separate interactive controls

## Disabled behavior

When disabled:

- Suppress navigation
- Suppress remove interaction
- Use disabled semantic tokens
- Set `aria-disabled="true"` on navigational content
- Remove navigational content from tab order with `tabIndex={-1}`
- Disable remove button with native `disabled`

## External link behavior

If `target="_blank"` is provided and `rel` is not provided, automatically set:

```txt
rel="noopener noreferrer"
```

## Remove behavior

When `isRemovable` is true:

- Render a remove button
- Use `type="button"`
- Provide an accessible remove label
- Stop propagation so remove does not trigger tag navigation
- Prevent default when needed

## Remove label

Preferred:

```tsx
<Tag removeLabel="Remove Averill Family Living Trust" />
```

Fallback:

```txt
Remove tag
```

If `children` is a plain string, the component may derive:

```txt
Remove {children}
```

## Leading element

Use `elemBefore` for icons, avatars, or slot components.

```tsx
<Tag elemBefore={<TrustIcon />}>Averill Family Living Trust</Tag>
```

## Token usage

Use semantic tokens only where available.

Do not hardcode:

- colors
- sizes
- spacing
- border widths
- focus ring values
- radius values

## Storybook requirements

Create:

- Tag / Playground
- Tag / Variants
- Tag / Examples

Show:

- all sizes
- all tones
- display-only tags
- navigational tags
- removable tags
- navigational + removable tags
- leading icon/avatar examples
- disabled tags
- focus/hover/press preview states if current story conventions support them

## Test requirements

Test:

- renders display-only tag without href
- renders anchor content when href is provided
- applies href
- target blank adds secure rel
- provided rel is preserved
- renders elemBefore
- renders remove button when removable
- remove button calls onRemove
- remove button does not trigger navigation/click on tag content
- disabled prevents navigation
- disabled disables remove button
- applies tone classes
- applies size classes
- forwards ref if supported
- custom className works

## Do not include

Do not nest button inside anchor.

Do not use MUI.

Do not use Tailwind.

Do not hardcode design values.

Do not create a separate public square-remove-button component unless needed elsewhere.

Do not add router-specific `asChild` behavior yet.
