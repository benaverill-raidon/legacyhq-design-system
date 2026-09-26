# Token source format and CSS compatibility

`packages/ui/src/tokens/src/` contains standard DTCG token data. CSS-specific
recipes live separately in `packages/ui/src/tokens/css-recipes.json`. Recipes
are not DTCG tokens and are excluded from the interchange export.

The primitive, semantic, and component tiers and Figma collection/mode groups
remain intact. Figma names are preserved in `$extensions.com.legacyhq.originalName`
on tokens/groups, or in `originalName` plus `sourcePath` on moved CSS recipes.
Current colors, the 500 font weight, and the absence of overline tokens remain
intentional. Do not restore older exports or edit generated CSS.

## Standard token data

The authored data follows the [DTCG 2025.10 Format module](https://www.designtokens.org/TR/2025.10/format/)
and [Color module](https://www.designtokens.org/TR/2025.10/color/).

| Type | Supported source representation |
| --- | --- |
| `color` | sRGB object, three normalized components, optional alpha |
| `dimension` | Numeric `value` and `px`/`rem` unit; zero and negative lengths supported |
| `duration` | Numeric `value` and `ms`/`s` unit |
| `fontFamily` | Unquoted family string or ordered string array |
| `fontWeight` | Numeric weight in [1, 1000] |
| `number` | Unitless JSON number |
| `cubicBezier` | Four numbers; x coordinates in [0, 1] |
| `transition` | `duration`, `delay`, and `timingFunction`, each a correctly typed value or token reference |

Every token declares `$type`. References use complete token paths, including
collection and mode groups, for example `{Primitive.Value.duration-fast}`.
There are no custom types, interpolated strings, CSS `var()` values, or CSS
calculations in the token source. Line heights remain standalone dimensions;
they are pixel lengths, not typography-composite multipliers.

Authoring files are fragments of one token document. The pipeline assembles
and validates the complete namespace, rejecting conflicting paths, malformed
values, unknown types/properties, dangling aliases, cycles, and reference type
mismatches, including transition members. Export one self-contained document:

```sh
npm run tokens:export -- .cache/legacyhq.tokens.json
```

The export retains references and metadata and is revalidated after assembly.
Import that complete document into another tool; individual source fragments
may reference tokens in other fragments.

The data uses a valid subset of DTCG. Our validator/formatter is **not a complete
implementation of every DTCG tool requirement**. It intentionally rejects
unimplemented features such as group type inheritance, `$extends`, JSON Pointer
`$ref`, other composite types, non-sRGB colors, and font-weight keywords.
Light/Dark output routing remains repository configuration, not an implementation
of DTCG Resolver documents. CSS recipes are platform-specific and do not become
portable DTCG behavior merely because the token data is valid.

## Approved CSS recipes and motion

All 24 former custom-string tokens have been removed or remodeled:

- **Authored casing:** 16 compatibility declarations move to recipes: one `none`
  keyword and 15 aliases. Casing is not a per-style design control. The exporter
  rejects a new casing value such as uppercase; introducing that behavior needs
  a deliberate design decision. Existing variable names and runtime aliases
  remain available to consumers.
- **Fade/move:** Four tokens are standard transition composites using the existing
  duration/easing aliases and a literal zero delay. CSS serialization omits the
  zero delay, preserving the exact shorthand. Nonzero delays and referenced
  delays are emitted; references remain live even if their current value is zero.
- **Loops:** `spin-loop` and `pulse-loop` are groups with duration and timingFunction
  tokens. Two CSS recipes produce the existing shorthand declarations. The four
  parameter tokens are omitted as standalone CSS declarations to preserve the
  public variable set. Spinner timing still aliases the existing non-linear
  `ease-loop`. Pulse timing is `[0, 0, 1, 1]`, serialized as `linear`.
- **Progress bar:** Two recipes emit `calc(track size + 2 * padding)` using the
  existing CSS variable references. Total height has no independent token and is
  not frozen to 20px/32px. Runtime track/padding changes retain their dependency.

Recipes describe keyword, alias, inset-size, and motion declarations. `after`
anchors preserve declaration order; missing/cyclic anchors fail rather than
silently dropping output. Token targets and emitted CSS reference graphs are
validated, including references into the base file from either theme.

CSS naming strips the known Figma collection/mode wrappers only at output.
Base and Light declarations use `:root`; Dark uses `[data-theme="dark"]`.
The formatter preserves live aliases, including aliases across output files.
Different source paths flattening to a CSS self-reference are emitted as a
referenced value instead; duplicate declarations within a mode are rejected.
The current source has no such self-reference, but its regression test remains.

Colors serialize to six-digit hex or rgba with 8-bit RGB channels; font families
receive CSS quotes. Existing component-to-primitive references remain unchanged;
this migration does not revise the three-tier governance policy.

## Build, validation, and exports

Use Node 22+ and `npm ci`. Style Dictionary is pinned to 5.3.0 and runs with
`usesDtcg: true`. The build validates sources and recipes before rendering.

```sh
npm run build
npm run tokens:check
npm run test:tokens
npm run validate
```

`tokens:check` validates the assembled document, formats twice for repeatability,
compares checked-in CSS, and verifies both theme reference graphs. Pipeline tests
cover transition member types, delays, source assembly, recipe errors, export
conversion, casing policy, and exact comparison with the pre-migration CSS.
Both checks run in `validate` and CI. Historical compatibility fixtures are in
`scripts/fixtures/token-migration/`; do not replace them to conceal a regression.

There is **no automated Figma token export path** in this checkout. Existing
scripts generate icons, registry entries, and exemplars; they do not fetch Figma
variables. `packages/ui/src/tokens/figma-export/` is an ignored archive directory.

For a future legacy `value`/`type`/`originalName` export:

1. Save it separately under tier directories, preserving collection/mode groups.
   Include retained legacy component definitions when needed for alias resolution.
   Do not mix legacy and DTCG input files.
2. Convert into a new, nonexistent output directory:

   ```sh
   npm run tokens:convert -- packages/ui/src/tokens/figma-export/incoming packages/ui/src/tokens/figma-export/converted
   ```

3. Review both outputs: `converted/src/` contains only DTCG fragments;
   `converted/css-recipes.json` contains CSS compatibility declarations. Compare
   with the current source and recipes, preserving hand-authored component rules
   and intentional recent token changes. Copy only reviewed changes into place.
4. Build and run validation; inspect every CSS difference.

The converter handles the specific historical export dialect, not arbitrary
Figma API/plugin formats. It converts CSS aliases to unambiguous source paths,
selects matching modes, converts known motion definitions, and separates known
CSS recipes. Unsupported expressions, casing decisions, metadata, and unresolved
or ambiguous aliases stop conversion before output is written. Adapt and test
new exporter schemas explicitly.

## Migration evidence

Baseline: checkout `03cd31dccc2d07fa6b394e8c45da78af2cdad4da`, captured 2026-09-26
using Style Dictionary 5.3.0 before source/config changes. `npm run build` matched
all checked-in CSS: **no pre-existing drift**. The fixture manifest records
LF-normalized SHA-256 hashes.

The first migration retained 1,207 tokens, including 24 documented custom string
tokens. The follow-up replaces those exceptions with standard data and separate
recipes: **1,191 DTCG tokens and 20 CSS recipe declarations**. Four loop parameter
tokens are used through recipes rather than emitted separately. Figma traceability
for the former casing tokens is preserved on recipes and loop names on groups.

All three regenerated CSS files still match the original baseline exactly,
normalizing line endings only: 561 base, 323 Light, and 323 Dark declarations.
Selectors, variable names, values, aliases, calculations, and order are unchanged.
Component styles and React code, including reduced-motion rules, are unchanged.

Validation passed: `npm run build`, `npm run tokens:check`, `npm run tokens:export`,
eight pipeline tests, full `npm run validate` (1,141 component tests across 56
files), and `git diff --check`. ESLint reports only the existing
`react-hooks/exhaustive-deps` warning in `date-picker-calendar.tsx:152`.

A headless Edge check compared baseline/generated CSS using the unchanged
progress-bar, spinner, and skeleton styles. Both normal and reduced-motion runs
matched. Progress-bar heights were 20px/32px initially; changing the medium track
to 20px produced 28px, and then changing its padding to 6px produced 32px.
Text-transform stayed `none`. Spinner retained 860ms and
`cubic-bezier(0.4, 0.15, 0.6, 0.85)`; skeleton retained 1500ms linear timing.
Both animations computed to `none` with reduced motion enabled.
