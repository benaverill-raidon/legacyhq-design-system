# Avatar Component Spec

## Anatomy

```txt
Avatar root
+- surface
   +- content
   ¦  +- image | fallback icon
   +- badge container
      +- badge icon
```

## Variants

```ts
type AvatarPresence = 'none' | 'online' | 'offline' | 'busy';
type AvatarStatus = 'none' | 'accepted' | 'declined';
```

Status takes priority over presence.

## Badge sizing

| Avatar size | Container | Icon |
|---|---:|---:|
| `xs` | 12px | 12px |
| `sm` | 12px | 12px |
| `md` | 14px | 14px |
| `lg` | 16px | 16px |
| `xl` | 20px | 18px |

Use the same structure at all sizes. Keep XS positioned at the block-end and inline-end with a `-2px` offset. Preserve the existing `xxs` and `xxl` public sizes while matching the same anatomy, and keep the visible badge circle bordered with the inverse border token.

## Token guidance

Keep component tokens only for avatar-specific anatomy such as avatar size, fallback size, badge container size, and badge icon size. Prefer semantic tokens directly for badge color, selected border, badge border, hover and pressed overlays, border width, radius, and offline subtle content color.
