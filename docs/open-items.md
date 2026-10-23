# Open items

What's still to decide or do after the Storybook docs work on `storybook-documentation`
(Oct 2026). Remove an item once it's settled, and record the decision where its rule lives.

**Issues with one component are its `knownIssues`**, in its `contract.json`: they hold it below
Stable, and show on its Docs page and on Introduction / Status, which lists them all. This file
keeps what isn't about one component. Some of that is tracked next to its rules too:

- `docs/foundations/token-governance.json`: each family's `openFindings` (dimensions, elevation,
  motion, icons), e.g. raw row heights and panel widths, the Figma icon reconciliation.
- `docs/foundations/component-api-governance.json`: each rule's `knownViolations`, e.g. the
  Button family's legacy `appearance`, Tag's color `tone`, Split Button's `tone`, mixed
  left/right vs start/end alignment, `removeAriaLabel`, labels still in English.
- `docs/foundations/component-registry-governance.json` and
  `docs/foundations/component-exemplars-governance.json`: content gaps and the exemplar backlog.

## Plan (agreed order)

1. Sidebar IA: done.
2. Introduction / Overview: done.
3. Foundations (Color, Typography, Spacing, Radius, Elevation, Motion, Icons): done.
4. Component Docs page standard: done, for all 56 components.
5. Patterns: done. Messages and Feedback (the reference page), Forms and Validation, Loading and
   Empty States, Collections.
6. Templates: drafts of Document Generation and Roadmap, built ahead of their designs. Revise
   them against the designs when those are done; each page lists its assumptions under Open
   questions.
7. Status: done. Draft, Beta, Stable, Deprecated, authored in each contract and checked against the
   evidence (componentStatus in component-registry-governance.json). Started at 15 Stable, 43 Beta.
8. **Now: the held items.**
   - Naming and behavior decisions, done 2026-10-22: start/end alignment, `removeLabel`,
     `toast.information()`, Field `success`, when errors show, loading toasts, focus after
     removal, disabled fieldsets, Slider field names, and the Table, Link, Modal Dialog, and
     Tooltip decisions.
   - Gaps, done 2026-10-22: Section Message `errors`, Checkbox `errorMessage`, Slider `invalid` and
     Field wiring, Inline Edit `validate`, Table title size by `size`, Progress Bar's empty ring,
     and the Table, Label, and Tag Group decisions.
   - Bugs, done 2026-10-23: 27 known issues closed across 16 components. Now 25 Stable, 33 Beta.
   - **Next: docs tooling** (union-prop API tables, light-only canvas, overlay anatomy, the code
     samples' indent on component pages), then the remaining known issues that need decisions or
     Figma.

## Figma (the owner's checklist)

Work in Figma first; the code follows. Items that belong to one component are also that
component's known issues, so they show on Introduction / Status too.

**Publish**

- [ ] **Tokens v1.0.0**: the 31 variable and 6 style renames, the Heading/XXL rebind, the 15 style
  descriptions, and `spacing/075`.
- [ ] **Components v1.0.0**: the vocabulary renames (status → tone, the in-a-row look → context,
  info → information, inverted → inverse, gray → taupe, circle → round, Modal Dialog sm–xl).

**Rename to match the code** (done in code 2026-10-22, old names still accepted there)

- [ ] Alignment variants `left` / `right` → `start` / `end` in popup, dropdown-menu, chip-group,
  and tag-group (popup's `topLeft`… → `topStart`…).
- [ ] Field's `state=valid` → `success`, and the message's `valid` boolean → `success`.

**Add to match the code** (built in code 2026-10-22)

- [ ] Table: the `sm` size's title is `heading/md` (`md` stays `heading/lg`).
- [ ] Progress Bar: the circular `value=0` variant shows the bordered empty track, as the linear one
  does.
- [ ] Slider: an invalid variant (error-colored handle and track).
- [ ] Inline Edit: an error state (the message under the field, in Field's error look).
- [ ] Section Message: an errors list (linked field names under the description).
- [ ] Checkbox: an error message under a single checkbox.
- [ ] Select: turn on the trigger's `elemBeforeInput` icon slot in the single, has-value variants
  (the code now shows the chosen option's icon there).
- [ ] Slider: the room now kept above the track for the value bubble (every horizontal Slider is
  taller by the bubble's height plus `spacing-sm`).

**Progress Bar (code matched to the revised Figma 2026-10-23)**

- [ ] Tokens v1.0.0: `component/progress-bar/circular/size` 72 → 80 (the repo's token is 80 now).
- [ ] Tokens v1.0.0: remove the now-unused linear `pad` (sm/md/lg) and `root-size` (sm/md/lg)
  variables; the repo removes them after (and `token-data.test.ts`'s root-size check with them).
- [ ] Circular `sm`: Figma has none; code draws an 8px ring. Add it, or drop `sm` for circular.
- [ ] Clean up `progress-bar-circular`: a hidden 72px "donut" layer in `progress=100, size=md`
  still bound to `color/data-viz/sequence/prussian/300`, and an empty 72px "donut" layer in every
  `lg` variant except 100.

**Check a value**

- [ ] Table header fill (node `2956:29798`): surface sunken (the CSS) or surface default (the
  contract)?
- [ ] Button Group gap: confirm the stacked variants' 8px; there's no value for the horizontal gap.
- [ ] Field: is the status icon meant to center against a message that wraps?
- [ ] Field's label (`heading-xxs`) vs Radio's and Checkbox's group legends (`body-md`), and the
  required `*` spacing: which is right?

**Create tokens**

- [ ] A focus-ring offset (the code uses a raw 2px).
- [ ] An inverse focus ring for dark surfaces.
- [ ] A Toast loading title color that passes contrast (3.19:1 light, 4.31:1 dark).
- [ ] A Progress Indicator inverse dot that shows on surfaces that stay dark.
- [ ] A stronger Skeleton subtle fill.
- [ ] Remove `component/tooltip/z-index` (unused; z-index isn't a token).

**Icons**

- [ ] 16 Figma-only names (agent1–3, beneficiary, billing, detailed-theme, estate-plan,
  estate-planning, family, fiduciary, firm, liability, mobile-phone, relationships, sort,
  status_discovery) and 2 code-only names (administrative-account and one more: the full list is
  `icons.openFindings` in token-governance.json).
- [ ] Two components named `menu`.
- [ ] Four glyphs drawn differently from code: assets, node, and the rings of radio_checked and
  radio_unchecked.
- [ ] `incapacitated` and `life-insurance-policy` are the same glyph.
- [ ] The icon wrapper defaults to `Size=sm` (code: md), and the property is capitalized.
- [ ] Decide the "more" icon: horizontal (Icon Button's page) or vertical (row actions).

**Decide**

- [ ] Tag `tone` holds color names: rename to `appearance`, or keep.
- [ ] Tag or Label for categories on a record.
- [ ] Split Button `tone`: drop, or deprecate until Icon Button has one.

**Earlier clean-up, if not done**

- [ ] Rebind components still bound to deleted variables (old spacing, stroke, border-width) and
  replace raw pill radii.
- [ ] Drop the duplicate `size/avatar/2xl` (Avatar xl is bound to it).
- [ ] Text Field and Text Area have an autofill color in Figma the code doesn't use yet.

**When the designs are ready**

- [ ] Check Templates / Document Generation and Roadmap against them; each lists its guesses under
  Open questions.

## Across components

- **Popups are placed by physical left and right.** Popup and everything built on it (Dropdown
  Menu, Tooltip, Select, the pickers, Inline Message, Split Button) take `start` / `end`, but on a
  right-to-left page `start` stays on the left. Recorded as a known limitation on Popup and
  Dropdown Menu; supporting right-to-left is a separate piece of work.

- **A Modal Dialog opened from inside a Popup paints below it**: dialogs are layered at 1000 and
  popups at 1200 (`primitives/layers.ts`). Today nothing opens a dialog from a popup; decide the
  rule if something needs to.

## Found recently (2026-10-22)

While carrying out the naming and behavior decisions. Each is also its component's known issue.

- Chip: the remove button's tooltip says "Remove" in English, with no prop to translate it.
- Tag Group: no `aria-label`, so focus lands on an unnamed group when its last tag is removed.
- Slider: a press on a disabled single Slider still sets `data-dragging="true"`.
- Slider: its examples file uses a `type` prop that doesn't exist.
- Chip Group and Tag Group: an empty group's root is 0×0, so its focus ring barely shows when
  focus lands there.

Not a known issue: Field's label doesn't dim when its control is disabled. It's already planned as
a future enhancement in Field's contract.

Found while closing the gaps:

- Templates / Document Generation still builds its own error list inside Section Message; it can
  use Section Message's new `errors`.
- Inline Edit inside Field wires nothing (now Inline Edit's known issue).

Found while fixing the bugs (2026-10-23):

- When the last filter chip is removed, or Clear filters is pressed, focus falls to the page: Table's
  WithToolbar and FullShell stories and Patterns / Collections unmount the whole Chip Group and its
  Clear button. Per the focus rule, the page should move focus to a stable element.
- Table's CellVariants story titles ("Cell variants — MD/SM") render very faint; not looked at yet.
- Progress Bar no longer accepts a `role` (it's always `progressbar`): a type-level break if the
  LegacyHQ app passes one.

## Docs tooling

- Union prop types leave the generated API table empty (Chip and Select list theirs by hand; both
  carry it as a known issue). Fix with react-docgen-typescript, or a PropsTable that merges a
  union's members.
- The Anatomy block can't outline portalled or fixed overlays (Popup, Tooltip, Modal Dialog,
  Toast Group).
- **Code samples lose their indent on 51 component Docs pages** (180 samples): MDX strips two
  spaces from every line of a multi-line string in a JSX attribute (`code={`...`}`). The pattern
  pages write them as MDX exports instead, and their test enforces it; the component pages need
  the same change (scriptable), plus the rule in component-pages.test.ts. Empty State's page
  compensates with extra spaces, which an export would double.
- Pattern blocks: "Components used" identifies components by folder, so Rich Text Area (in
  `molecules/text-area`) would show as Text Area; `ToneMatrix` reads only string values (no table
  of which controls take the boolean `invalid`) and only the first declaration of a prop, so it
  can't read Chip's `mode` from its union of prop types.
- Storybook's Dark toolbar themes only a wrapper, so portalled overlays render light in dark mode.
  With the OS in dark mode, the canvas body is transparent and takes the browser's dark color while
  the tokens stay light, so a story's own text reads dark on dark.
- Only one Toast Group can mount per docs page, so a story's toasts show only when the story that
  mounts it is on the page (Document Generation's failure story, viewed alone).
- Foundations / Icons under-counts the components that use `sm` icons: its detector misses an icon
  picked from a lookup (Field's status icon).
- Template screens start their headings at `h3` so they sit inside the docs outline; the product's
  own levels are stated in prose only. The blocks have no way to set a base level.

## Housekeeping

- The stale `.claude/worktrees` folder breaks `npm run validate` at lint. Until it's removed, lint
  with `npx eslint . --ignore-pattern ".claude/**"`.
- `packages/ui/src/components/atoms/button/button-case-study.stories.tsx` is a temporary, untracked
  portfolio capture. Delete it once the Button Docs page replaces it.
- 61 deprecated CSS aliases and the `@deprecated` prop aliases stay until the LegacyHQ app has
  been searched for their use.
