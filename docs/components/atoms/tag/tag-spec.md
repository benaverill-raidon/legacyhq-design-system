# Tag Component Spec

## Overview

Tag is an atom used to label UI objects for classification and navigation. In LegacyHQ, tags often represent referenced entities such as tasks, notes, assets, trusts, clients, people, documents, or other records.

Tags can be display-only, navigational, removable, or both navigational and removable.

## Description

A tag labels UI objects for classification and navigation.

## When to use

Use Tag when a compact labeled reference needs to appear in a UI, such as:

- A trust referenced inside a task
- An asset mentioned in a note
- A person mention
- A classification attached to a record
- A category or entity reference that links to a detail page
- A removable relationship or association

## When not to use

Do not use Tag for:

- Status labels that are purely informational and non-interactive; use Label or Badge instead
- Primary actions; use Button
- Icon-only actions; use Icon Button or Toggle Icon Button
- Freeform text links; use Link

## Component anatomy

```txt
Tag
├─ root wrapper
│  ├─ content area
│  │  ├─ elemBefore, optional
│  │  └─ text
│  └─ remove button, optional
```

## Behavior types

### Display-only Tag

A non-interactive classification tag.

```tsx
<Tag tone="green">Active</Tag>
```

### Navigational Tag

A tag that links to an entity or page.

```tsx
<Tag href="/trusts/123" tone="green">
  Averill Family Living Trust
</Tag>
```

### Removable Tag

A tag that can be removed from a collection or relationship.

```tsx
<Tag isRemovable onRemove={handleRemove}>
  Averill Family Living Trust
</Tag>
```

### Navigational + removable Tag

A tag that links to an entity and can also be removed from the current context.

```tsx
<Tag href="/trusts/123" isRemovable onRemove={handleRemove}>
  Averill Family Living Trust
</Tag>
```

This is important for LegacyHQ task and note references, where the tag body opens the entity and the remove control removes the reference.

## Public API

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

## Root semantics

The rendered semantic structure depends on props.

### No href and not removable

Render non-interactive content.

Recommended root:

```tsx
<span className={styles.root}>...</span>
```

### href and not removable

Render a native anchor.

```tsx
<a className={styles.root} href={href}>...</a>
```

### removable without href

Render a wrapper with a non-interactive content area and a native remove button.

```tsx
<span className={styles.root}>
  <span className={styles.content}>...</span>
  <button type="button" className={styles.removeButton} />
</span>
```

### href and removable

Render a wrapper containing an anchor content area and a separate native remove button.

```tsx
<span className={styles.root}>
  <a className={styles.content} href={href}>...</a>
  <button type="button" className={styles.removeButton} />
</span>
```

Do not nest the remove button inside the anchor.

## Navigation

When `href` is provided and `isDisabled` is false, the tag content should navigate to `href`.

Use native anchor behavior.

Support:

- `href`
- `target`
- `rel`
- `aria-describedby`
- other safe anchor attributes

## External link security

If `target="_blank"` and `rel` is not provided, set:

```txt
rel="noopener noreferrer"
```

Preserve a provided `rel` value.

## Remove behavior

When `isRemovable` is true:

- Render a remove button
- Use `type="button"`
- Use accessible label text
- Call `onRemove` when clicked
- Stop event propagation
- Prevent default as needed
- Do not trigger navigation

## Remove label behavior

Preferred explicit label:

```tsx
<Tag removeLabel="Remove Averill Family Living Trust" />
```

If `children` is a string, derive:

```txt
Remove {children}
```

Fallback:

```txt
Remove tag
```

## Disabled behavior

When `isDisabled` is true:

- Use disabled visual tokens
- Suppress hover and press styling
- Prevent navigation
- Suppress remove interaction
- Set `aria-disabled="true"` for anchor content
- Set `tabIndex={-1}` for anchor content
- Set native `disabled` on remove button

## Leading element

`elemBefore` supports icons, avatars, or other compact visual content.

```tsx
<Tag elemBefore={<AssetIcon />}>Ben’s Investments</Tag>
```

The leading element should be visually aligned with the text and should inherit or map to the tag tone where appropriate.

## Size

Supported sizes:

```txt
sm
md
```

Use Figma/token values for padding, height, typography, icon/remove sizes, and gap.

## Tone

Supported tones:

```txt
standard
blue
green
purple
red
teal
yellow
orange
magenta
```

Tone should map to semantic color tokens for background, border, and content.

## State

Supported states:

```txt
default
hover
press
focus
disabled
```

Interactive states apply only when the tag content is navigational or the remove button is present.

Display-only tags do not need hover/press states unless Figma intentionally shows them for visual consistency.

## Focus

If the tag is navigational, the anchor content receives focus.

If the tag is removable, the remove button receives focus independently.

Use shared Focus Ring utility/classes where appropriate.

Do not create a custom focus ring if the system already has one.

## Accessibility

Tag must preserve valid HTML and clear keyboard behavior.

Rules:

- Link body uses native anchor when navigational
- Remove control uses native button
- Do not nest button inside anchor
- Disabled anchor content uses `aria-disabled` and `tabIndex={-1}`
- Remove button has an accessible label
- The remove button must be keyboard accessible
- Pressing remove must not navigate

## Storybook

Create:

```txt
UI/Atoms/Tag/Playground
UI/Atoms/Tag/Variants
UI/Atoms/Tag/Examples
```

Do not create separate States or Accessibility pages unless the library convention changes.

### Playground controls

```txt
children
size
tone
href
target
isRemovable
isDisabled
elemBefore
removeLabel
```

### Variants story

Show:

- all tones
- sm and md
- display-only
- with elemBefore
- removable
- navigational
- navigational + removable
- disabled
- focus/hover/press previews if supported by current story patterns

### Examples story

Show:

- entity reference tag
- task tag
- note mention tag
- asset reference tag
- trust reference tag with remove button
- tag row/wrap example

## Tests

Required tests:

```txt
renders display-only span when no href
renders anchor when href is provided and not removable
renders wrapper with anchor plus remove button when href and isRemovable are provided
does not nest button inside anchor
applies href
supports target
adds secure rel for target blank
preserves provided rel
renders elemBefore
renders remove button when isRemovable
remove button calls onRemove
remove button does not trigger navigation/click on anchor content
disabled prevents navigation
disabled disables remove button
sets aria-disabled for disabled navigational content
sets tabIndex -1 for disabled navigational content
applies tone class
applies size class
custom className works
```

## Future considerations

Potential future support:

- `asChild` for router links
- richer entity metadata
- avatar-specific sizing rules
- tag groups
- max-width/truncation behavior

Do not implement these unless requested.
