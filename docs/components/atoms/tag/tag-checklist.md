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
tone: default | blue | green | purple | red | teal | yellow | orange | magenta | brand
isRemovable: false | true
elemBefore: false | true
isDisabled: false | true
tagText: string
```

## Code props

```ts
type TagTone =
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'orange'
  | 'magenta'
  | 'brand';

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
tone: default
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

## Validated Figma Details

- Root fill (`color-elevation-surface-raised-default`), border (`color-border-bold`), hover/pressed
  overlay layers (`color-background-neutral-overlay-hovered`/`-pressed`), disabled border/content
  (`color-border-disabled`/`color-content-disabled`), and the focus ring color
  (`color-border-focused`, `#003655`) all matched the existing implementation exactly - no color
  drift found.
- `sm` = 24px tall, 4px corner radius; `md` = 32px tall, 8px corner radius; remove-button container
  scales 24px/32px alongside - all already correct.
- Fixed a real bug: the `elemBefore` and remove-button icon glyphs are a constant 16px in Figma at
  both `sm` and `md` - the implementation incorrectly shrank the icon to 12px at `sm` via a
  component-token override. Fixed by letting `sm` inherit the constant 16px.
- Figma's `tone` variant options (`standard`, `blue`, `green`, `purple`, `red`, `teal`, `yellow`,
  `orange`, `magenta`, `brand`) match the implementation's `TagTone` type exactly - this doc's
  earlier `TagTone`/Figma-properties lists were missing `brand`, which has been corrected.
- Code's `standard` tone value was later renamed to `default` for clarity (this is now an
  intentional divergence from Figma's own `standard` variant name, not a mismatch to reconcile).
  Its background/hover/pressed also moved from `color-elevation-surface-raised-default` plus a
  `background-image` overlay hack to a solid `color-background-neutral-subtle-default/hovered/pressed`
  swap, so the tone's hover/pressed transition can animate like every other tone.
- Figma's single `state=focus` swatch shows a ring wrapping the entire tag, not a tight ring around
  just the focused sub-element - but Figma has only one `state` axis and can't represent "content
  focused" vs "remove button focused" as distinct variants. Decision: keep independent per-control
  focus rings (the existing, standard behavior for two separately-focusable native elements) rather
  than treat the single combined swatch as firm intent.
- Figma's own default `size` variant is `sm`; the code default stays `md`, consistent with every
  other sized atom in this library.

## Storybook requirements

Create the library's unified structure:

- Tag / Docs (.mdx)
- Tag / Playground
- Tag / Variants
- Tag / Sizes
- Tag / States
- Tag / Content
- Tag / EdgeCases

Show:

- all tones
- the four fundamentally different rendered forms (display-only, navigational, removable,
  navigational + removable)
- `sm`/`md` side by side, confirming the icon glyph stays visually the same size at both
- disabled tags
- hover/pressed previews via `data-force-state` (documentation-only, mirrors Button/Checkbox), and
  focus previews via real `autoFocus`, since content and remove are independently focusable
- a live example verifying hover/focus/remove independence by hand

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
- keeps the elemBefore/remove icon a constant 16px regardless of size
- supports data-force-state hover/pressed preview on both the content and remove areas

## Do not include

Do not nest button inside anchor.

Do not use MUI.

Do not use Tailwind.

Do not hardcode design values.

Do not create a separate public square-remove-button component unless needed elsewhere.

Do not add router-specific `asChild` behavior yet.
