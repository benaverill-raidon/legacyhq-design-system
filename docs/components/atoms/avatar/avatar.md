# Avatar

Avatar is an atom that visually represents a person. It can render a profile image, fall back to a generic person icon, and show one optional badge for either presence or calendar reply status.

Use Avatar for people in profile headers, participant lists, assignee rows, comments, activity records, and selectable people-focused UI. Use it when the visual identity marker supports nearby person-related content or acts as a compact interactive identity control.

Do not use Avatar for families, firms, trusts, accounts, or other non-person entities. Do not use it for avatar groups, initials fallback, square entity icons, internal tooltips, or selected/toggled controls that need more complex composition. Use Avatar Group or a future Entity Avatar pattern instead.

The design intent is to keep the component visually simple, circular, compact, and composition-friendly. The visual surface is separated from the root structure so the surface owns radius, background, image or fallback rendering, selected treatment, and badge placement. Status takes priority over presence so the component never shows conflicting badges.

Badge anatomy is consistent across sizes:

```txt
Avatar root
+- status/presence container
   +- status/presence icon
```

Static meaningful avatars should expose an accessible name through `name`, `alt`, `aria-label`, or `aria-labelledby`. Decorative avatars should be hidden from assistive technology. Interactive avatars render as native buttons and must have an accessible label. When relevant, selected, presence, and status information should be included in the accessible label.

Implementation should preserve native semantics, avoid tooltip or group behavior, avoid invalid interactive nesting, use the shared Focus Ring pattern for interactive focus-visible styling, and keep hover and pressed styles limited to interactive avatars. Image load failure must fall back to the icon artwork without changing the public API.
