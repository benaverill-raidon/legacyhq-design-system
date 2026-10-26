#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  QueryError,
  REPO_ROOT,
  checkSystem,
  componentFilterValues,
  getComponent,
  getExamples,
  getRules,
  getToken,
  iconCategories,
  listRuleTopics,
  searchComponents,
  searchIcons,
  searchTokens,
  tokenFilterValues,
} from '../query/index.mjs';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../query/core.mjs';

// The design system's query library as a local, read-only MCP server over stdio. Each tool wraps one
// library function: its structured result is the library's result exactly (what `legacyhq ... --json`
// prints), and its text is a short summary followed by that result as JSON, for clients that only
// read text. stdout carries the protocol only; anything else goes to stderr.

const limit = z.number().int().min(1).max(MAX_LIMIT).optional()
  .describe(`At most this many results (default ${DEFAULT_LIMIT}).`);
const mode = z.enum(['light', 'dark']).optional().describe('Only the values that apply in this color mode.');
const oneOf = (values, description) => z.enum(values).optional().describe(description);

const plural = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;

function countLine(shown, total, noun) {
  if (!total) return `No ${noun}s found.`;
  return shown < total ? `${shown} of ${total} ${noun}s (raise limit for more):` : `${plural(total, noun)}:`;
}

const listed = (rows, total, noun, label) => [countLine(rows.length, total, noun), ...rows.map((row) => `- ${label(row)}`)];

// Filter values come from the schema and the data, so the input schemas can't drift from them.
function tools() {
  const components = componentFilterValues();
  const tokens = tokenFilterValues();
  const topics = listRuleTopics().map((t) => t.topic);

  return {
    search_components: {
      title: 'Search components',
      description: 'Find LegacyHQ design system components by name, category, prop, or variant (for example "text input" or "date"). Returns a compact list, best match first; use get_component for one component\'s detail.',
      input: {
        query: z.string().min(1).describe('Words to match: a name, a category, a prop, or a variant.'),
        category: oneOf(components.category, 'Only this category.'),
        tier: oneOf(components.tier, 'Only this tier (compositional complexity).'),
        status: oneOf(components.status, 'Only this status.'),
        limit,
      },
      call: ({ query, ...options }) => searchComponents(query, options),
      summary: (r) => listed(r.results, r.total, 'component', (c) => `${c.id} (${c.name}): ${c.tier}, ${c.category}, ${c.status}${c.knownIssues ? `, ${plural(c.knownIssues, 'known issue')}` : ''}`),
    },
    get_component: {
      title: 'Get a component',
      description: 'One component in full: props with types and defaults, variants, sizes, anatomy, slots, sub-components, accessibility, design tokens, related components, status, known issues, and its Figma source.',
      input: { id: z.string().min(1).describe('The component id ("key-value-pair") or name ("Key Value Pair").') },
      call: ({ id }) => getComponent(id),
      summary: (c) => [
        `${c.name} (${c.id}): ${c.tier}, ${c.category}, ${c.status}. Source: ${c.source}`,
        c.knownIssues.length ? `Known issues: ${c.knownIssues.map((i) => `[${i.kind}] ${i.summary}`).join(' ')}` : 'No known issues.',
      ],
    },
    get_examples: {
      title: 'Get examples',
      description: 'A component\'s documented usage examples (JSX) and anti-examples (what not to do, and why), exactly as written in its examples file.',
      input: {
        id: z.string().min(1).describe('The component id or name.'),
        kind: z.enum(['all', 'example', 'anti']).optional().describe('example, anti, or all (default).'),
      },
      call: ({ id, kind }) => getExamples(id, { kind }),
      summary: (r) => [
        `${r.name} (${r.id}). Source: ${r.source}`,
        ...(r.examples ? [`${plural(r.examples.length, 'example')}: ${r.examples.map((e) => e.name).join('; ')}`] : []),
        ...(r.antiExamples ? [`${plural(r.antiExamples.length, 'anti-example')}: ${r.antiExamples.map((e) => e.name).join('; ')}`] : []),
      ],
    },
    search_tokens: {
      title: 'Search tokens',
      description: 'Find design tokens by name (for example "brand background" or "spacing"). Semantic tokens rank first: components consume semantic tokens, never primitives. Each result is the CSS custom property components use, with its values per mode.',
      input: {
        query: z.string().min(1).describe('Words to match against token names.'),
        tier: oneOf(tokens.tier, 'Only this tier.'),
        type: oneOf(tokens.type, 'Only this token type.'),
        mode,
        limit,
      },
      call: ({ query, ...options }) => searchTokens(query, options),
      summary: (r) => listed(r.results, r.total, 'token', (t) => `${t.cssVar} (${t.type}, ${t.tier}${t.inCss ? '' : ', not in CSS'})`),
    },
    get_token: {
      title: 'Get a token',
      description: 'One design token: its CSS custom property, type, tier, description, and per mode its authored value, the tokens it references, and the CSS the build writes.',
      input: {
        name: z.string().min(1).describe('The CSS name ("fade-quick", "--fade-quick", or "var(--fade-quick)") or the DTCG id.'),
        mode,
      },
      call: ({ name, mode: m }) => getToken(name, { mode: m }),
      summary: (t) => [
        `${t.cssVar}: ${t.type}, ${t.tier}. Source: ${t.source}`,
        ...(t.inCss ? [] : ['Not in the CSS: the build leaves it out, so it can\'t be used as a var().']),
        ...t.values.map((v) => `${v.mode}: ${v.css ?? JSON.stringify(v.value)}`),
      ],
    },
    get_rules: {
      title: 'Get governance rules',
      description: 'The design system\'s governance rules: token architecture, dimensions, elevation, motion, icons, and prop naming. With no topic, lists the topics with a summary of each.',
      input: { topic: oneOf(topics, 'The topic to show. Omit to list them.') },
      call: ({ topic }) => (topic ? getRules(topic) : { topics: listRuleTopics() }),
      summary: (r) => (r.topics
        ? [`${plural(r.topics.length, 'rule topic')}: ${r.topics.map((t) => t.topic).join(', ')}`]
        : [`${r.topic} (${r.source}: ${r.key})`]),
    },
    search_icons: {
      title: 'Search icons',
      description: 'Find icons in the system\'s icon set by name, label, or keyword. Use the icon name with the Icon component.',
      input: {
        query: z.string().optional().describe('Words to match. Omit to list icons.'),
        category: oneOf(iconCategories(), 'Only this icon category.'),
        limit,
      },
      call: ({ query, ...options }) => searchIcons(query ?? '', options),
      summary: (r) => listed(r.results, r.total, 'icon', (icon) => `${icon.name} (${icon.component})`),
    },
    check_system: {
      title: 'Check the system data',
      description: 'A quick check that the generated registry.json and exemplars.json are current and the token sources validate. It reports and fixes nothing, and isn\'t npm run validate (types, lint, every test).',
      input: {},
      call: () => checkSystem(),
      summary: (r) => [
        r.ok ? 'All checks passed.' : 'Some checks failed.',
        ...r.checks.map((c) => `${c.ok ? 'PASS' : 'FAIL'} ${c.message}${c.ok ? '' : ` Fix: ${c.fix}`}`),
      ],
    },
  };
}

function errorResult(error) {
  const detail = error instanceof QueryError
    ? { code: error.code, message: error.message, suggestions: error.suggestions, allowed: error.allowed }
    : { code: 'INTERNAL_ERROR', message: error.message };
  const lines = [detail.message];
  if (detail.suggestions?.length) lines.push(`Did you mean: ${detail.suggestions.join(', ')}?`);
  if (detail.allowed?.length) lines.push(`Allowed: ${detail.allowed.join(', ')}.`);
  return { isError: true, content: [{ type: 'text', text: lines.join('\n') }], structuredContent: { error: JSON.parse(JSON.stringify(detail)) } };
}

/** Builds the server with every tool registered; connect it to a transport to use it. */
export function createServer() {
  const { version } = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  const server = new McpServer({ name: 'legacyhq-design-system', version });
  for (const [name, tool] of Object.entries(tools())) {
    server.registerTool(name, {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.input,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    }, async (args) => {
      try {
        const result = await tool.call(args);
        return {
          content: [{ type: 'text', text: [...tool.summary(result), '', JSON.stringify(result)].join('\n') }],
          structuredContent: result,
        };
      } catch (error) {
        if (!(error instanceof QueryError)) process.stderr.write(`legacyhq-mcp: ${name}: ${error.stack}\n`);
        return errorResult(error);
      }
    });
  }
  return server;
}

// Run only as the program, not when tests import createServer().
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createServer();
  // Exit cleanly when the client goes away.
  process.stdin.on('close', () => server.close().finally(() => process.exit(0)));
  await server.connect(new StdioServerTransport());
}
