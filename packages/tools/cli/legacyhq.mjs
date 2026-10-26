#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  QueryError,
  REPO_ROOT,
  checkSystem,
  getComponent,
  getExamples,
  getRules,
  getToken,
  listComponents,
  listRuleTopics,
  searchComponents,
  searchIcons,
  searchTokens,
} from '../query/index.mjs';

// `legacyhq`: the design system's query library on the command line. Every command prints readable
// text, or with --json the library's result exactly. Results go to stdout and everything else to
// stderr, so `--json` output can be piped. Exit codes: 0 success; 1 not found, a failed doctor
// check, or an unexpected error; 2 invalid usage or input.

const OPTIONS = {
  json: { type: 'boolean', help: 'Print the result as JSON (the library result, unabridged).' },
  help: { type: 'boolean', short: 'h', help: 'Show help.' },
  version: { type: 'boolean', help: 'Show the version.' },
  limit: { type: 'string', value: 'N', help: 'At most N results (1-200, default 25).' },
  category: { type: 'string', value: 'CATEGORY', help: 'Only this category.' },
  tier: { type: 'string', value: 'TIER', help: 'Only this tier.' },
  status: { type: 'string', value: 'STATUS', help: 'Only this status (draft, beta, stable, deprecated).' },
  kind: { type: 'string', value: 'KIND', help: 'example, anti, or all (default).' },
  mode: { type: 'string', value: 'MODE', help: 'light or dark: only values that apply in that mode.' },
  type: { type: 'string', value: 'TYPE', help: 'Only this token type (color, dimension, transition, ...).' },
};

const number = (value) => (value === undefined ? undefined : Number(value));
const joined = (words) => (words.length ? words.join(' ') : undefined);

// Each command: what it takes, which options apply, what it calls, and how its result reads.
const COMMANDS = {
  'components list': {
    summary: 'List components.',
    options: ['category', 'tier', 'status'],
    call: (_, o) => listComponents({ category: o.category, tier: o.tier, status: o.status }),
    text: (result) => componentTable(result, result.length),
  },
  'components search': {
    args: 'QUERY',
    summary: 'Find components by name, category, prop, or variant.',
    options: ['category', 'tier', 'status', 'limit'],
    call: (words, o) => searchComponents(joined(words), { category: o.category, tier: o.tier, status: o.status, limit: number(o.limit) }),
    text: (result) => componentTable(result.results, result.total),
  },
  'components get': {
    args: 'ID',
    summary: 'Show one component, by id or name.',
    call: (words) => getComponent(joined(words)),
    text: componentText,
  },
  examples: {
    args: 'ID',
    summary: "Show a component's examples and anti-examples.",
    options: ['kind'],
    call: (words, o) => getExamples(joined(words), { kind: o.kind }),
    text: examplesText,
  },
  'tokens search': {
    args: 'QUERY',
    summary: 'Find tokens by name; semantic tokens first.',
    options: ['tier', 'type', 'mode', 'limit'],
    call: (words, o) => searchTokens(joined(words), { tier: o.tier, type: o.type, mode: o.mode, limit: number(o.limit) }),
    text: (result) => tokenTable(result.results, result.total),
  },
  'tokens get': {
    args: 'NAME',
    summary: 'Show one token, by CSS name (fade-quick or var(--fade-quick)) or DTCG id.',
    options: ['mode'],
    call: (words, o) => getToken(joined(words), { mode: o.mode }),
    text: tokenText,
  },
  rules: {
    args: '[TOPIC]',
    summary: 'List rule topics, or show one topic from the governance files.',
    call: (words) => (words.length ? getRules(joined(words)) : listRuleTopics()),
    text: (result) => (Array.isArray(result) ? topicsText(result) : ruleText(result)),
  },
  'icons search': {
    args: '[QUERY]',
    summary: 'Find icons by name, label, or keyword; with no query, list them.',
    options: ['category', 'limit'],
    call: (words, o) => searchIcons(joined(words) ?? '', { category: o.category, limit: number(o.limit) }),
    text: (result) => iconTable(result.results, result.total),
  },
  doctor: {
    summary: 'Check the generated files and token sources (not a substitute for npm run validate).',
    call: () => checkSystem(),
    text: doctorText,
    failed: (result) => !result.ok,
  },
};
const GROUPS = new Set(Object.keys(COMMANDS).filter((name) => name.includes(' ')).map((name) => name.split(' ')[0]));

class UsageError extends Error {}

// ---------------------------------------------------------------------------------------------
// Text output

function table(rows, columns) {
  const widths = columns.map((column) => Math.max(...rows.map((row) => String(row[column] ?? '').length)));
  return rows.map((row) => columns.map((column, i) => String(row[column] ?? '').padEnd(i === columns.length - 1 ? 0 : widths[i])).join('  ').trimEnd());
}

function countLine(shown, total, noun) {
  if (!total) return `No ${noun}s found.`;
  return shown < total ? `${shown} of ${total} ${noun}s (use --limit for more).` : `${total} ${noun}${total === 1 ? '' : 's'}.`;
}

function componentTable(rows, total) {
  const issues = rows.map((row) => ({ ...row, issues: row.knownIssues ? `${row.knownIssues} known issue${row.knownIssues === 1 ? '' : 's'}` : '' }));
  return [...table(issues, ['id', 'name', 'tier', 'category', 'status', 'issues']), countLine(rows.length, total, 'component')];
}

function componentText(c) {
  const lines = [`${c.name} (${c.id})`, `${c.tier}, ${c.category}, ${c.status}`, `Source: ${c.source}`];
  if (c.knownIssues.length) {
    lines.push('', 'Known issues:', ...c.knownIssues.map((issue) => `  - [${issue.kind}] ${issue.summary}`));
  }
  const props = Object.entries(c.props);
  if (props.length) {
    lines.push('', 'Props:');
    for (const [name, prop] of props) {
      const type = prop.enum ? prop.enum.map((v) => JSON.stringify(v)).join(' | ') : prop.type ?? 'unknown';
      const extras = [prop.required && 'required', prop.default !== null && `default ${JSON.stringify(prop.default)}`].filter(Boolean);
      lines.push(`  ${name}: ${type}${extras.length ? ` (${extras.join(', ')})` : ''}`);
      if (prop.description) lines.push(`      ${prop.description}`);
    }
  }
  const variants = Object.entries(c.variants);
  if (variants.length) lines.push('', 'Variants:', ...variants.map(([axis, values]) => `  ${axis}: ${values.join(', ')}`));
  if (c.sizes.length) lines.push('', `Sizes: ${c.sizes.join(', ')}`);
  if (c.anatomy.length) lines.push('', `Anatomy: ${c.anatomy.map((part) => part.name).join(', ')}`);
  if (c.subComponents.length) lines.push('', `Sub-components: ${c.subComponents.map((sub) => sub.name).join(', ')}`);
  if (c.relatedComponents.length) lines.push('', `Related: ${c.relatedComponents.join(', ')}`);
  lines.push('', 'Accessibility, tokens, and the Figma source: use --json.');
  return lines;
}

function examplesText(result) {
  const lines = [`${result.name} (${result.id})`, `Source: ${result.source}`];
  for (const example of result.examples ?? []) {
    lines.push('', `Example: ${example.name}`);
    if (example.description) lines.push(example.description);
    lines.push(...example.jsx.split('\n').map((line) => `    ${line}`));
  }
  for (const anti of result.antiExamples ?? []) {
    lines.push('', `Don't: ${anti.name}`);
    if (anti.reason) lines.push(anti.reason);
    lines.push(...anti.jsx.split('\n').map((line) => `    ${line}`));
  }
  return lines;
}

const modesOf = (token) => token.values.map((v) => v.mode).join(', ');

function tokenTable(rows, total) {
  const display = rows.map((t) => ({ ...t, modes: modesOf(t), note: t.inCss ? '' : 'not in CSS' }));
  return [...table(display, ['cssVar', 'type', 'tier', 'modes', 'note']), countLine(rows.length, total, 'token')];
}

function tokenText(t) {
  const lines = [t.cssVar, `${t.type}, ${t.tier}`, `Source: ${t.source}`];
  if (t.description) lines.push(t.description);
  if (!t.inCss) lines.push('Not in the CSS: the build leaves it out, so it can\'t be used as a var().');
  for (const v of t.values) {
    lines.push('', `${v.mode}:`);
    if (v.css !== null) lines.push(`  CSS: ${v.css}`);
    if (v.references.length) lines.push(`  References: ${v.references.map((name) => `--${name}`).join(', ')}`);
    lines.push(`  Value: ${JSON.stringify(v.value)}`);
  }
  return lines;
}

function topicsText(topics) {
  const lines = table(topics.map((t) => ({ ...t, summary: t.summary ? t.summary.split('\n')[0].slice(0, 100) : '' })), ['topic', 'summary']);
  return [...lines, '', 'Show one with: legacyhq rules TOPIC'];
}

const ruleText = (rule) => [`${rule.topic} (${rule.source}: ${rule.key})`, '', ...JSON.stringify(rule.content, null, 2).split('\n')];

function iconTable(rows, total) {
  const display = rows.map((icon) => ({ ...icon, keywords: icon.keywords.join(', ') }));
  return [...table(display, ['name', 'component', 'category', 'keywords']), countLine(rows.length, total, 'icon')];
}

function doctorText(result) {
  const lines = [];
  for (const check of result.checks) {
    lines.push(`${check.ok ? 'PASS' : 'FAIL'}  ${check.message}`);
    if (!check.ok) lines.push(`      Fix: ${check.fix}`);
  }
  lines.push('', result.ok ? 'All checks passed.' : 'Some checks failed.', 'This is a quick data check; npm run validate is the full check (types, lint, every test).');
  return lines;
}

// ---------------------------------------------------------------------------------------------
// Help

const optionHelp = (name) => {
  const option = OPTIONS[name];
  return `  --${name}${option.value ? ` ${option.value}` : ''}`.padEnd(22) + option.help;
};

function commandHelp(name) {
  const command = COMMANDS[name];
  const options = [...(command.options ?? []), 'json'];
  return [`Usage: legacyhq ${name}${command.args ? ` ${command.args}` : ''} [options]`, '', command.summary, '', 'Options:', ...options.map(optionHelp)];
}

function generalHelp() {
  const names = Object.keys(COMMANDS);
  const width = Math.max(...names.map((name) => `${name} ${COMMANDS[name].args ?? ''}`.length)) + 2;
  return [
    'legacyhq: look up the LegacyHQ design system (components, examples, tokens, rules, icons).',
    '',
    'Usage: legacyhq COMMAND [options]',
    '',
    'Commands:',
    ...names.map((name) => `  ${`${name} ${COMMANDS[name].args ?? ''}`.padEnd(width)}${COMMANDS[name].summary}`),
    '',
    'Every command takes --json. Run legacyhq COMMAND --help for its options.',
    'Exit codes: 0 success; 1 not found or a failed check; 2 invalid usage or input.',
  ];
}

// ---------------------------------------------------------------------------------------------

function resolve(positionals) {
  const [first, second, ...rest] = positionals;
  if (!first) return { name: null, words: [] };
  if (GROUPS.has(first)) {
    const name = `${first} ${second ?? ''}`.trim();
    if (!COMMANDS[name]) {
      const subcommands = Object.keys(COMMANDS).filter((n) => n.startsWith(`${first} `)).map((n) => n.split(' ')[1]);
      throw new UsageError(`${second ? `Unknown command "${name}"` : `"${first}" needs a subcommand`}. Use: ${subcommands.map((s) => `${first} ${s}`).join(', ')}.`);
    }
    return { name, words: rest };
  }
  if (!COMMANDS[first]) throw new UsageError(`Unknown command "${first}".`);
  return { name: first, words: [second, ...rest].filter((word) => word !== undefined) };
}

/**
 * Runs one command line and returns its exit code. `io.out` and `io.err` each take one line.
 * @param {string[]} argv the arguments after the program name
 * @param {{ out: (line: string) => void, err: (line: string) => void }} io
 */
export async function run(argv, io) {
  let json = argv.includes('--json');
  try {
    const parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: Object.fromEntries(Object.entries(OPTIONS).map(([name, { type, short }]) => [name, { type, ...(short && { short }) }])),
    });
    const { values } = parsed;
    json = Boolean(values.json);
    if (values.version) {
      io.out(JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')).version);
      return 0;
    }
    const { name, words } = resolve(parsed.positionals);
    if (!name) {
      (values.help ? io.out : io.err)(generalHelp().join('\n'));
      return values.help ? 0 : 2;
    }
    if (values.help) {
      io.out(commandHelp(name).join('\n'));
      return 0;
    }
    const command = COMMANDS[name];
    const allowed = new Set([...(command.options ?? []), 'json', 'help', 'version']);
    const extra = Object.keys(values).find((option) => !allowed.has(option));
    if (extra) throw new UsageError(`--${extra} doesn't apply to "${name}".`);
    if (command.args && !command.args.startsWith('[') && !words.length) throw new UsageError(`"${name}" needs ${command.args}.`);

    const result = await command.call(words, values);
    io.out(json ? JSON.stringify(result, null, 2) : command.text(result).join('\n'));
    return command.failed?.(result) ? 1 : 0;
  } catch (error) {
    const usage = error instanceof UsageError || error.code?.startsWith?.('ERR_PARSE_ARGS');
    const code = error instanceof QueryError ? (error.code === 'NOT_FOUND' ? 1 : 2) : usage ? 2 : 1;
    if (json) {
      const detail = error instanceof QueryError
        ? { code: error.code, message: error.message, suggestions: error.suggestions, allowed: error.allowed }
        : { code: usage ? 'INVALID_USAGE' : 'INTERNAL_ERROR', message: error.message };
      io.err(JSON.stringify({ error: detail }, null, 2));
    } else {
      io.err(`legacyhq: ${error.message}`);
      if (error.suggestions?.length) io.err(`Did you mean: ${error.suggestions.join(', ')}?`);
      if (usage) io.err('Run legacyhq --help for usage.');
    }
    return code;
  }
}

// Run only as the program, not when tests import run().
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const code = await run(process.argv.slice(2), {
    out: (line) => process.stdout.write(`${line}\n`),
    err: (line) => process.stderr.write(`${line}\n`),
  });
  process.exitCode = code;
}
