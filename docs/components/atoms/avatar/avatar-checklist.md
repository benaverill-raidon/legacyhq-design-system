# Avatar Component Checklist

## Purpose

Avatar is an atom component used to visually represent a person in the interface. It may appear as a static identity marker, an interactive identity control, or a selectable item in people-focus UI.

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

## Entity type (fallback artwork)

`entityType` (`'person' | 'team'`, default `'person'`) selects which fallback artwork renders when
there is no `src` (or it fails to load). No Figma variant of its own - the `avatar` component set's
own `componentPropertyDefinitions` were checked directly and only define
size/status/state/presence/isInteractive/isDisabled/selected. The `team` artwork
(`team-light.svg`/`team-dark.svg`) is the real, already-shipped `team-and-partners` icon glyph
(`packages/ui/src/assets/icons/source/team-and-partners.svg`), rescaled and recolored to match the
`person` fallback's own template exactly (200x200, flat-color square, centered glyph, same two
light/dark color pairs) - not new art drawn from scratch.

## Anatomy

```txt
Avatar root
+- surface
   +- image | fallback artwork
   +- badge container
      +- badge icon
```

Use the same badge container and badge icon structure for every size. XL keeps visible padding between the two layers, and XS offsets the badge to `-2px` from the inline and block end. The visible badge icon carries the inverse border, and XXL should sit on the avatar edge instead of floating away from the circle.

## Implementation checklist

- [ ] Preserve image, full-size theme-aware fallback artwork, selected, loading-safe image fallback, and disabled behavior.
- [ ] Fallback artwork respects `entityType` (person vs. team) in both themes; has no effect once `src` loads successfully.
- [ ] Use the dedicated badge container and badge icon anatomy across all sizes.
- [ ] Keep status higher priority than presence.
- [ ] Map `offline` to the semantic subtle content color token rather than a primitive neutral color.
- [ ] Render online as a solid semantic success-green circle without an interior glyph.
- [ ] Keep the visible badge icon bordered with the inverse border token and tokenized bold border width.
- [ ] Remove the deprecated `focus` presence variant from stories, tests, and docs.
- [ ] Do not add disabled plus badge combinations back into examples.
- [ ] Validate focus-visible styling.
