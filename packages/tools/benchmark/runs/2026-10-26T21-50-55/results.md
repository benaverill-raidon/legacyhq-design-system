# Benchmark run 2026-10-26T21-50-55

Commit `83c257afddc95db93a513999202966c0e1278285`, model `claude-sonnet-5-5`, Claude Code 2.1.311 (Claude Code), 2026-10-26T21:50:55.285Z.

| Task | Condition | # | Checks | Failed | Off-system | Tool calls (design system) | Files read | Turns | Cost (USD) | Time (s) |
|---|---|---|---|---|---|---|---|---|---|---|
| choose-control | cli | 1 | 4/4 | - | - | 1 (1) | 0 | 2 | 0.090 | 8 |
| choose-control | docs | 1 | 4/4 | - | - | 5 (0) | 2 | 6 | 0.089 | 10 |
| choose-control | mcp | 1 | 4/4 | - | - | 6 (6) | 0 | 7 | 0.123 | 9 |
| find-tokens | cli | 1 | 7/7 | - | - | 5 (5) | 0 | 6 | 0.094 | 26 |
| find-tokens | docs | 1 | 7/7 | - | - | 6 (0) | 0 | 7 | 0.098 | 15 |
| find-tokens | mcp | 1 | 7/7 | - | - | 13 (11) | 1 | 14 | 0.177 | 14 |
| implement-pattern | cli | 1 | 9/9 | - | - | 8 (1) | 1 | 9 | 0.236 | 42 |
| implement-pattern | docs | 1 | 9/9 | - | - | 15 (0) | 5 | 16 | 0.274 | 51 |
| implement-pattern | mcp | 1 | 9/9 | - | - | 21 (13) | 3 | 22 | 0.329 | 44 |

## Tool calls

### choose-control / cli / 1

1. `Bash npm run -s ds -- components search "radio choose one option billing" 2>&1 \| head -30; npm run -s ds -- examples radio-group 2>&1 \| head -60`

### choose-control / docs / 1

1. `Glob packages/ui/src/components/**/radio*/*.{tsx,types.ts}`
2. `Grep radio-group\|segmented\|Radio Group\|Segmented`
3. `Read <worktree>/packages/ui/src/components/atoms/radio/radio.types.ts`
4. `Read <worktree>/packages/ui/src/components/atoms/radio/radio-group.tsx`
5. `Grep import\|from`

### choose-control / mcp / 1

1. `search_components radio group choose one option`
2. `search_components segmented control select`
3. `search_components radio`
4. `search_components forms forms`
5. `get_component radio`
6. `get_examples radio`

### find-tokens / cli / 1

1. `Bash npm run -s ds -- tokens search elevation-surface 2>&1 \| head -30; npm run -s ds -- tokens search "border-width" 2>&1 \| head; npm run -s ds -- tokens sear`
2. `Bash npm run -s ds -- tokens search "text" 2>&1 \| grep -E "color-(text\|content)" \| head -20; grep -rhE "color-text\|typography-body" packages/ui/src/componen`
3. `Bash npm run -s ds -- tokens search "color-content" 2>&1 \| head -12; npm run -s ds -- tokens search "spacing-" 2>&1 \| grep -E "^--spacing-" \| head -12; grep `
4. `Bash npm run -s ds -- tokens search "color-content-subtle" 2>&1 \| head; npm run -s ds -- tokens get spacing-lg 2>&1 \| head; npm run -s ds -- tokens get border`
5. `Bash cat packages/ui/src/components/molecules/card/*.module.css 2>/dev/null \| head -40; npm run -s ds -- tokens get border-radius-lg \| sed -n 5,7p`

### find-tokens / docs / 1

1. `Grep --color-elevation-surface\|--color-border-[a-z-]+\|--radius-[a-z0-9-]+\|--spacing-lg\|--border-width-sm\|--color-text-(primary\|secondary\|subtle)` (error or denied)
2. `Grep "elevation"\|"surface"\|raised`
3. `Grep var/(--(color-(border\|text\|content\|elevation-surface)[a-z-]*\|radius[a-z0-9-]*\|spacing-lg\|border-width-sm)/)`
4. `Grep elevation-surface-raised\|text-secondary\|text-subtle\|text-muted`
5. `Grep border-radius:.*\|font(-size\|-family)?:.*var`
6. `Grep radius\|font\|line-height\|letter`

### find-tokens / mcp / 1

1. `search_tokens elevation surface semantic`
2. `search_tokens border semantic`
3. `search_tokens text semantic`
4. `search_tokens spacing semantic`
5. `search_tokens radius semantic`
6. `search_tokens color-text semantic light 40`
7. `search_tokens typography-body-md 30`
8. `search_tokens text primary light`
9. `search_tokens text secondary light`
10. `Grep font: \|font-size\|--color-text\|--color-foreground\|--color-content`
11. `get_token color-content-default`
12. `get_token color-content-subtle`
13. `Read <worktree>/packages/ui/src/components/molecules/key-value-pair/key-value-pair.module.css`

### implement-pattern / cli / 1

1. `Bash npm run -s ds -- components search form 2>&1 \| head -40; npm run -s ds -- rules 2>&1 \| grep -i -B1 -A3 -E "valid\|error" \| head -60; ls packages/ui/src/`
2. `Bash ls packages/ui/src/components/organisms/form packages/ui/src/components/molecules/text-field; cat packages/ui/src/components/organisms/form/form.mdx \| hea`
3. `Bash cd ~/AppData/Local/Temp/legacyhq-bench-1793051622302/packages/ui/src && ls storybook/pages/patterns/; cat storybook/pages/patterns/forms-and-validation.mdx`
4. `Bash cd ~/AppData/Local/Temp/legacyhq-bench-1793051622302/packages/ui/src/components && cat molecules/field/field.types.ts; sed -n 1,80p atoms/checkbox/checkbox`
5. `Bash cd ~/AppData/Local/Temp/legacyhq-bench-1793051622302/packages/ui/src/storybook/pages/patterns && grep -n "SubmitAndValidate" -B5 forms-and-validation.stori` (error or denied)
6. `Grep SubmitAndValidate\|^import\|useRef\|focus/(`
7. `Read <worktree>/packages/ui/src/storybook/pages/patterns/forms-and-validation.stories.tsx`
8. `Write <worktree>/packages/ui/src/examples/new-contact-form.tsx` (error or denied)

### implement-pattern / docs / 1

1. `Grep "id": "(form\|text-field\|text-input\|input\|field\|checkbox\|switch\|radio\|radio-group\|button\|select)"`
2. `Glob packages/ui/src/components/**/{form,text-field,text-input,field,checkbox,switch,radio*,toggle*}/*.{tsx,mdx}`
3. `Grep validation\|error`
4. `Read <worktree>/packages/ui/src/storybook/pages/patterns/forms-and-validation.mdx`
5. `Read <worktree>/packages/ui/src/components/organisms/form/form.tsx`
6. `Read <worktree>/packages/ui/src/components/organisms/form/form.mdx`
7. `Grep SubmitAndValidate`
8. `Glob packages/ui/src/components/atoms/checkbox/checkbox.types.ts`
9. `Read <worktree>/packages/ui/src/storybook/pages/patterns/forms-and-validation.stories.tsx`
10. `Read <worktree>/packages/ui/src/components/atoms/checkbox/checkbox.types.ts`
11. `Glob packages/ui/src/*`
12. `Grep export (const\|function\|/*)`
13. `Glob packages/ui/src/**/index.ts`
14. `Glob packages/ui/src/storybook/pages/templates/*`
15. `Write <worktree>/packages/ui/src/examples/new-contact-form.tsx` (error or denied)

### implement-pattern / mcp / 1

1. `search_components form`
2. `search_components text input field`
3. `search_components checkbox switch yes no choice`
4. `get_rules anti-patterns`
5. `get_component form`
6. `get_examples form`
7. `get_component text-field`
8. `get_component checkbox`
9. `get_component switch`
10. `get_component field`
11. `get_examples switch`
12. `get_examples checkbox`
13. `Grep error summary\|ErrorSummary\|validation`
14. `Read <worktree>/packages/ui/src/storybook/pages/patterns/forms-and-validation.mdx`
15. `Glob packages/ui/src/storybook/pages/patterns/forms-and-validation*`
16. `Read <worktree>/packages/ui/src/storybook/pages/patterns/forms-and-validation.stories.tsx`
17. `get_component section-message`
18. `Glob packages/ui/src/components/{atoms/checkbox,organisms/form,organisms/section-message}/*.ts*`
19. `Glob packages/ui/src/*`
20. `Read <worktree>/packages/ui/src/components/atoms/checkbox/checkbox.types.ts`
21. `Write <worktree>/packages/ui/src/examples/new-contact-form.tsx` (error or denied)

