# Avatar Component Checklist

## Purpose

Avatar is an atom component used to visually represent a person in the interface. It may appear as a static identity marker, an interactive identity control, or a selectable item in people-focused UI.

## Badge behavior

Avatar supports one badge slot.

Priority:

```txt
status > presence
```

If both `status` and `presence` are passed, render `status` only.

Presence values:

- `none`
- `online`
- `offline`
- `busy`

Status values:

- `none`
- `accepted`
- `declined`

## Anatomy

```txt
Avatar root
+- surface
   +- image | fallback icon
   +- badge container
      +- badge icon
```

Use the same badge container and badge icon structure for every size. XL keeps visible padding between the two layers, and XS offsets the badge to `-2px` from the inline and block end. The visible badge icon carries the inverse border, and XXL should sit on the avatar edge instead of floating away from the circle.

## Implementation checklist

- [ ] Preserve image, fallback icon, selected, loading-safe image fallback, and disabled behavior.
- [ ] Use the dedicated badge container and badge icon anatomy across all sizes.
- [ ] Keep status higher priority than presence.
- [ ] Map `offline` to the semantic subtle content color token rather than a primitive neutral color.
- [ ] Keep the visible badge icon bordered with the inverse border token and tokenized bold border width.
- [ ] Remove the deprecated `focus` presence variant from stories, tests, and docs.
- [ ] Do not add disabled plus badge combinations back into examples.
- [ ] Validate focus-visible styling.
