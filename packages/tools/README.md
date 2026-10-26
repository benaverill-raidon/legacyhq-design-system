# LegacyHQ design system tools

Read-only lookups over the data this repo already generates: components, usage examples, design
tokens, governance rules, and icons. People and coding agents can get a precise answer without
reading the repo's files.

- `query/`: the library. Everything below answers through it.
- `cli/`: `legacyhq`, the library on the command line.
- `mcp/`: an MCP server over the same library (planned).

Nothing here writes, uses the network, or is published to npm. The answers come from:

| Data | Read from |
|---|---|
| Components | `docs/components/registry.json` (generated from the contracts) |
| Examples and anti-examples | `docs/components/exemplars.json` (generated from the examples files) |
| Tokens | `packages/ui/src/tokens/src/` through `scripts/lib/tokens.cjs`, plus `packages/ui/src/tokens/css-recipes.json` |
| Rules | `docs/foundations/token-governance.json`, `docs/foundations/component-api-governance.json` |
| Icons | `packages/ui/src/assets/icons/metadata/icons.json` |

## Running the CLI

From the repo, after `npm install`:

```bash
npm run -s ds -- components search text input
```

`-s` stops npm printing its own header, so `--json` output stays clean. To run `legacyhq`
directly from any folder, link the package once:

```bash
npm link
```

```bash
legacyhq tokens search brand background
```

## Commands

| Command | Does |
|---|---|
| `components list [--category] [--tier] [--status]` | Lists components. |
| `components search QUERY [--category] [--tier] [--status] [--limit]` | Finds components by name, category, prop, or variant. |
| `components get ID` | Shows one component, by id (`key-value-pair`) or name (`Key Value Pair`). |
| `examples ID [--kind example\|anti\|all]` | Shows a component's examples and anti-examples, exactly as documented. |
| `tokens search QUERY [--tier] [--type] [--mode light\|dark] [--limit]` | Finds tokens by name. Semantic tokens come first. |
| `tokens get NAME [--mode light\|dark]` | Shows one token, by CSS name (`fade-quick` or `var(--fade-quick)`) or DTCG id. |
| `rules [TOPIC]` | Lists rule topics, or shows one (`motion`, `dimensions`, `disabled-prop`, ...). |
| `icons search [QUERY] [--category] [--limit]` | Finds icons by name, label, or keyword. |
| `doctor` | Checks that the generated files are current and the token sources validate. |

Every command takes `--json` and `--help`. A query can be several words without quotes. Searches
return 25 results unless `--limit` says otherwise (up to 200).

`--category`, `--tier`, `--status`, `--type`, and icon categories only accept values that exist in
the data; an unknown one fails and lists the valid values.

### Output and exit codes

- Results go to stdout and everything else to stderr. With `--json`, stdout is the library's result
  exactly, and an error is a JSON object on stderr: `{ "error": { "code", "message", "suggestions"?, "allowed"? } }`.
- `0` success. `1` not found (with "Did you mean" suggestions), a failed `doctor` check, or an
  unexpected error. `2` invalid usage or input.

### Tokens

A token is named by the CSS custom property components use: `--color-background-brand-primary-bold-default`,
not a DTCG path. Each result lists its values per mode: `light` and `dark` for themed tokens, `all`
for tokens with one value in both. For each value it gives the authored DTCG value, the tokens it
references, and the CSS the build writes.

Four DTCG tokens are left out of the CSS by the build (css-recipes.json `omitTokens`). They're marked
`inCss: false` and rank last, because they can't be used as a `var()`. The CSS-only declarations in
css-recipes.json (such as `spin-loop`) are included.

### doctor

`doctor` is a quick data check. It confirms that `registry.json` and `exemplars.json` read, list the
same components, and match their sources, and that the token sources validate. Each failure names
the file and the command that fixes it. It isn't `npm run validate`, which also typechecks, lints,
and runs every test, and which CI runs on every pull request.

## Using the library

```js
import { getComponent, searchTokens, checkSystem } from './packages/tools/query/index.mjs';

getComponent('button');                                   // the registry entry
searchTokens('background', { tier: 'semantic', limit: 5 }); // { total, results }
await checkSystem();                                      // { ok, checks }
```

The functions are `listComponents`, `getComponent`, `searchComponents`, `getExamples`, `getToken`,
`searchTokens`, `getRules`, `listRuleTopics`, `searchIcons`, `checkFreshness`, and `checkSystem`. Each
is documented in its file. Searches return `{ total, results }` with the best match first and a
stable order for ties. The only errors thrown on purpose are `QueryError`s: `NOT_FOUND` (with
`suggestions`) or `INVALID_INPUT` (with `allowed` where there's a fixed set).

## Tests

`query/query.test.mjs` and `cli/cli.test.mjs` run with `npm test`, and so in `npm run validate` and CI.
They check the answers against the repo's own files, not hand-copied values.
