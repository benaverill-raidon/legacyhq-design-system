# Avatar

Avatar is an atom that visually represents a person. It can render a profile image, fall back to full-size light or dark fallback artwork (a person silhouette, or - via `entityType="team"` - a two-person silhouette for a team/partner entity), and show one optional badge for either presence or calendar reply status.

Use Avatar for people in profile headers, participant lists, assignee rows, comments, activity records, and selectable people-focus UI. Use it when the visual identity marker supports nearby person-related content or acts as a compact interactive identity control.

Do not use Avatar as a firm's, trust's, or account's *primary* identity marker, or for initials fallback, square entity icons, internal tooltips, or selected/toggled controls that need more complex composition. Use Avatar Group (`docs/components/molecules/avatar-group/avatar-group.md`) or a future Entity Avatar pattern instead. `entityType="team"` is narrower than that: it exists so a team/partner entity can sit inside an otherwise person-populated roster (e.g. Avatar Group) without the fallback art implying an individual - it does not make Avatar a general-purpose firm/trust avatar on its own.

The design intent is to keep the component visually simple, circular, compact, and composition-friendly. The visual surface is separated from the root structure so the surface owns radius, background, image or fallback rendering, selected treatment, and badge placement. Status takes priority over presence so the component never shows conflicting badges.

Badge anatomy is consistent across sizes:

```txt
Avatar root
+- status/presence container
   +- status/presence icon
```

Static meaningful avatars should expose an accessible name through `name`, `alt`, `aria-label`, or `aria-labelledby`. Decorative avatars should be hidden from assistive technology. Interactive avatars render as native buttons and must have an accessible label. When relevant, selected, presence, and status information should be included in the accessible label.

Implementation should preserve native semantics, avoid tooltip or group behavior, avoid invalid interactive nesting, use the shared Focus Ring pattern for interactive focus-visible styling, and keep hover and press styles limited to interactive avatars. Image load failure must fall back to the theme-aware fallback artwork matching `entityType` (person or team), without otherwise changing the public API.

`entityType` (`'person' | 'team'`, default `'person'`) has no Figma variant of its own - it's a code-only addition (see `avatar.contract.json`'s `apiAdaptationNotes`) so a team/partner entity's fallback reads distinctly from an individual's. The team artwork is derived directly from the real, already-shipped `team-and-partners` icon glyph, rescaled and recolored to match the person fallback's own template exactly - not drawn from scratch.

The interactive hover/press overlay fades in using `fade-quick`. The selected-state ring grows in using `move-quick` (the spring-eased motion token) rather than snapping to full width instantly, since it's a physical ring appearing/growing rather than a plain color change.
