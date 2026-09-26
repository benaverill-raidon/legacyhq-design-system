# Card completion checklist

## Design and API

- [x] Inspect all 30 Figma variants and bound tokens via Figma Console.
- [x] Record source IDs, default values, border, clipping, and zero padding.
- [x] Expose surface, border, borderRadius, and arbitrary children; forward native div attributes/ref.
- [x] Support transparent surface=none and border=false independently, retaining rounded clipping.
- [x] Use semantic tokens without adding component tokens.
- [x] Keep spacing, content structure, dimensions, and interactions consumer-owned.

## Deliverables

- [x] Component, types, CSS Module, and index exports.
- [x] Composition tests for root/ref/attributes, child state, and native form submission.
- [x] Playground, all variants, transparent/borderless panels, arbitrary content, edge-to-edge, and working form stories.
- [x] Attached Storybook MDX documentation.
- [x] Usage, spec, implementation brief, checklist, contract, and examples.
- [x] Regenerate registry/exemplars and update llms.txt.

## Verification

- [x] Full npm run validate passes (1,191 tests; existing calendar hook lint warning only).
- [x] Storybook production build passes.
- [x] Inspect all 30 variants in light and dark themes.
- [x] Verify border=false computes to 0px and surface=none is transparent in both themes.
- [x] Check narrow layout, edge clipping, and a working form in the browser.

Final browser verification completed 2026-09-22, including a 375px viewport with no horizontal
overflow, rounded edge-to-edge content, and successful submission of the composed form.
