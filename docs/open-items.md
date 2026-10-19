# Open items

What's still to decide or do after the Storybook docs work on `storybook-documentation`
(Oct 2026). Remove an item once it's settled, and record the decision where its rule lives.

Some open items are already tracked next to their rules, and aren't repeated here:

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
6. **Templates: next.**
7. Status / maturity vocabulary: deferred until after Overview, and still waiting. Pages show no
   status yet.

## Figma (publish and check)

- Publish **Tokens v1.0.0**: the variable and style renames, the Heading/XXL rebind, the style
  descriptions, and `spacing/075`.
- Publish **Components v1.0.0**: the vocabulary renames (tone, context, information, inverse,
  taupe, round, Modal Dialog sm–xl).
- Table header fill: the CSS uses `color-elevation-surface-sunken-default`, while the contract and
  spec say `elevation/surface/default`. Read the fill on node `2956:29798`.
- Field: the status icon is centered against a message that wraps. Is that intended?

## Tokens to create in Figma first

- A focus-ring offset. Focus Ring and Table use a raw 2px, and other components borrow spacing
  tokens or `spacing-none` for it.
- An inverse focus ring, for the Button family and others on dark surfaces.
- A Toast loading title color that passes contrast: it's 3.19:1 in light and 4.31:1 in dark.
- Progress Indicator's inverse dot can't be seen on surfaces that stay dark.
- Skeleton's subtle fill is faint on a raised surface.
- `--component-tooltip-z-index` isn't read by anything, and z-index isn't tokenized (see
  `primitives/layers.ts`). It's a candidate to remove.

## Design decisions

- **Split Button `tone`:** drop it or deprecate it until Icon Button has a tone. The evidence
  points to deprecating.
- **Button Group gap:** Figma's stacked variants are 8px, and the contract's 4 is stale. The
  horizontal group gap uses `spacing-lg`, but Figma has no value for it.
- **Tag `tone`:** it holds color names. Rename it to `appearance` (in code and Figma), or keep it
  as Toggle Button's is kept.
- **Link:** is the `strong` emphasis default intended? It matches the contract.
- **Modal Dialog:** it has no exit animation, which is the documented current state. Should it
  have one?
- **Tooltip on a disabled control:** keyboard users can't reach it, as the spec intends. But the
  contract lists "explaining why a control is disabled" as a use. Pick one.
- **Tag Group:** its contract lists an active-filters use case
  (`tag-group.contract.json`), but its page, Chip's, and Label's all say filters are Chips in a
  Chip Group. The Collections pattern follows the pages.
- **Tag or Label for categories:** both pages claim "a category or a classification" on a record.
  Pick one. The Collections pattern uses Label only for status.
- **The "more" icon:** Icon Button's page uses `MoreHorizIcon` for "More actions"; Dropdown Menu's
  page and stories and Table's stories use `MoreVertIcon` for row actions. Pick the standard.
- **Validation timing:** no component or page sets when errors show. Forms and Validation gives
  guidance (check on submit, show every error at once, then update each field as it changes);
  Field's "Live validation" story shows an error from the first keystroke. Decide whether that's a
  rule.
- **Field label vs group legend:** Field's label is `heading-xxs`, Radio's and Checkbox's group
  legends are `body-md`, and the required `*` has a gap in the groups but none in Field. They sit
  side by side in one form.
- **A loading toast's dismiss button:** Toast's page says to turn dismissing off for a loading
  toast, but `toast.loading()` doesn't, and if you pass `isDismissible: false` the result toast
  keeps it (an update keeps every option it doesn't set, except `duration`).

## Bugs and gaps still open

- A removable Tag without `href` ignores `onClick`.
- Dismissing a toast from the keyboard leaves focus on the page.
- Icon Tile with `decorative={false}` and no label has no accessible name, and no warning.
- Avatar Group's overflow button is named only "+3".
- Slider Range submits `name` and `${name}Max`. Is that the intended form shape?
- Slider's hover-only value bubble floats over the label.
- Controls inside a plain `<fieldset disabled>` don't look disabled.
- Popup has no `aria-label` prop.
- Layers order by when they open. A popup and a dialog that mount already open in the same render
  stack with the popup under the dialog.
- Table: two defaults are still built from English, the footer name and "Select row".
- Toast Group's helper is `toast.info()`, which sets the `information` tone. By the one-name rule
  it would be `toast.information()`, with `info` kept as a deprecated alias.
- Field's `state` uses `valid` where every message component says `success`.

Found while writing the patterns:

- A single Checkbox has `invalid` but no way to show an error message, and wrapping it in Field
  replaces its own label as its name. Forms and Validation uses a one-option Checkbox Group.
- Slider has no `invalid` state or message, and Field's page doesn't list it among the controls it
  wires.
- Inline Edit has no error state and can't reject a draft: focus leaving the field always confirms.
- There's no system way to list errors in a form's summary: the Forms example lays out a plain
  list itself.
- Field's AnyControl story says "Bio is required.", against Field's own Do (write the error as what
  to do).
- Table:
  - selection counts rows a filter now hides, and bulk actions act on them; its page only says
    selection is kept "across pages and sorts";
  - its page isn't reset when the data shrinks, only clamped to the page count;
  - its default empty text ("No results" over "There is nothing to show here yet.") mixes two kinds
    of empty, and sits on the deep surface where a passed Empty State is transparent;
  - nothing announces that a search found nothing (its only live region is the selection count);
  - skeleton rows ignore a column's `align: 'end'`;
  - its WithToolbar and FullShell stories pass filter Chips without a named Chip Group, which
    Chip Group's page asks for, and `activeFilters` renders in a plain div;
  - its CellVariants story puts status words in a Badge, which Badge's page says is for one to four
    characters (use Label).
- Card spreads `onClick` and other props onto its div, while its page says it "handles no events".
- Button's `isLoading` JSDoc leaves out the `aria-disabled` it sets (its page mentions it).
- Progress Bar's page says it renders `role="progressbar"`, but a `role` you pass replaces it.

## Docs tooling

- Chip's and Select's union props leave the generated API table empty, so they're listed by hand.
  Fix with react-docgen-typescript, or a PropsTable that merges the union's members.
- The Anatomy block can't outline portalled or fixed overlays (Popup, Tooltip, Modal Dialog,
  Toast Group).
- The Inline Edit page shows a Key Value Pair on its own, without a `dl` (invalid HTML).
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

## Housekeeping

- The stale `.claude/worktrees` folder breaks `npm run validate` at lint. Until it's removed, lint
  with `npx eslint . --ignore-pattern ".claude/**"`.
- `packages/ui/src/components/atoms/button/button-case-study.stories.tsx` is a temporary, untracked
  portfolio capture. Delete it once the Button Docs page replaces it.
- 61 deprecated CSS aliases and the `@deprecated` prop aliases stay until the LegacyHQ app has
  been searched for their use.
