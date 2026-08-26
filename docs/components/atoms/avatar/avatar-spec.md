# Avatar Component Spec

## Anatomy

```txt
Avatar root
+- surface
   +- content
   �  +- image | fallback artwork
   +- badge container
      +- badge icon
```

## Variants

```ts
type AvatarPresence = 'none' | 'online' | 'offline' | 'busy';
type AvatarStatus = 'none' | 'accepted' | 'declined';
type AvatarEntityType = 'person' | 'team';
```

Status takes priority over presence.

`entityType` (default `'person'`) has no Figma variant - Avatar's own component set only defines
size/status/state/presence/isInteractive/isDisabled/selected, verified directly. It selects which
fallback artwork renders when there is no `src` (or it fails to load): the existing person
silhouette, or a two-person silhouette for a team/partner entity. Purely a fallback-art switch - it
has no effect once an image loads successfully, and does not change accessible-name computation.

## Badge sizing

| Avatar size | Container | Icon |
|---|---:|---:|
| `xs` | 12px | 12px |
| `sm` | 12px | 12px |
| `md` | 14px | 14px |
| `lg` | 16px | 16px |
| `xl` | 20px | 18px |

Use the same structure at all sizes. Keep XS positioned at the block-end and inline-end with a `-2px` offset. Preserve the existing size anatomy, and keep the visible badge circle bordered with the inverse border token.

The online presence badge is a solid semantic success-green circle with no interior glyph.

## Token guidance

Keep component tokens only for avatar-specific anatomy such as avatar size, badge container size, and badge icon size. Prefer semantic tokens directly for badge color, selected border, badge border, hover and press overlays, border width, radius, and offline subtle content color.
