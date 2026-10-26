// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  REPO_ROOT,
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
import { run } from './legacyhq.mjs';

// Most tests call run() in-process and capture its output; a few start the real program to check
// it works from another directory and exits with the right code.

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), 'legacyhq.mjs');

async function cli(...argv) {
  const out = [];
  const err = [];
  const code = await run(argv, { out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join('\n'), err: err.join('\n') };
}

async function json(...argv) {
  const result = await cli(...argv, '--json');
  expect(result).toMatchObject({ code: 0, err: '' });
  return JSON.parse(result.out);
}

describe('--json prints the library result exactly', () => {
  it('for every command', async () => {
    expect(await json('components', 'list', '--category', 'forms')).toEqual(listComponents({ category: 'forms' }));
    expect(await json('components', 'search', 'text', 'input', '--limit', '3')).toEqual(searchComponents('text input', { limit: 3 }));
    expect(await json('components', 'get', 'Key', 'Value', 'Pair')).toEqual(getComponent('key-value-pair'));
    expect(await json('examples', 'button', '--kind', 'anti')).toEqual(getExamples('button', { kind: 'anti' }));
    expect(await json('tokens', 'search', 'brand', 'background', '--mode', 'dark')).toEqual(searchTokens('brand background', { mode: 'dark' }));
    expect(await json('tokens', 'get', 'var(--fade-quick)')).toEqual(getToken('fade-quick'));
    expect(await json('rules')).toEqual(listRuleTopics());
    expect(await json('rules', 'motion')).toEqual(getRules('motion'));
    expect(await json('icons', 'search', 'delete')).toEqual(searchIcons('delete'));
    expect(await json('icons', 'search', '--limit', '200')).toEqual(searchIcons('', { limit: 200 }));
  });

  it('for doctor', async () => {
    const result = await json('doctor');
    expect(result.ok).toBe(true);
    expect(result.checks.length).toBeGreaterThan(0);
  });
});

describe('text output', () => {
  it('lists components one per line, with a count', async () => {
    const { code, out } = await cli('components', 'list', '--tier', 'primitive');
    const primitives = listComponents({ tier: 'primitive' });
    expect(code).toBe(0);
    expect(out.split('\n')).toHaveLength(primitives.length + 1);
    expect(out).toContain(`${primitives.length} components.`);
  });

  it('says when results are cut off by the limit', async () => {
    const { out } = await cli('tokens', 'search', 'background', '--limit', '2');
    expect(out).toMatch(/^2 of \d+ tokens \(use --limit for more\)\.$/m);
  });

  it('shows a component\'s props and known issues', async () => {
    const { out } = await cli('components', 'get', 'button');
    expect(out).toContain('Button (button)');
    expect(out).toMatch(/^ {2}size: "xs" \| "sm" \| "md" \| "lg" \(default "md"\)$/m);
  });

  it('shows each mode of a token, and its CSS', async () => {
    const { out } = await cli('tokens', 'get', 'color-background-brand-primary-bold-default');
    expect(out).toContain('--color-background-brand-primary-bold-default');
    expect(out).toMatch(/^light:$/m);
    expect(out).toMatch(/^dark:$/m);
  });

  it('reports every doctor check and points to npm run validate', async () => {
    const { code, out } = await cli('doctor');
    expect(code).toBe(0);
    expect(out).toMatch(/^PASS {2}/m);
    expect(out).not.toMatch(/^FAIL/m);
    expect(out).toContain('npm run validate is the full check');
  });
});

describe('errors and exit codes', () => {
  it('exits 1 for not found, with suggestions on stderr', async () => {
    const result = await cli('components', 'get', 'buton');
    expect(result).toMatchObject({ code: 1, out: '' });
    expect(result.err).toContain('No component "buton".');
    expect(result.err).toContain('Did you mean: button?');
  });

  it('exits 2 for input the library rejects', async () => {
    const result = await cli('tokens', 'search', 'background', '--tier', 'semantics');
    expect(result.code).toBe(2);
    expect(result.err).toContain('Unknown tier "semantics"');
    expect((await cli('components', 'search', 'button', '--limit', 'ten')).code).toBe(2);
  });

  it('exits 2 for usage errors, and says how to get help', async () => {
    for (const argv of [['nope'], ['components'], ['components', 'nope'], ['components', 'get'], ['components', 'list', '--kind', 'anti'], ['doctor', '--wat']]) {
      const result = await cli(...argv);
      expect(result.code, argv.join(' ')).toBe(2);
      expect(result.out, argv.join(' ')).toBe('');
      expect(result.err, argv.join(' ')).toContain('legacyhq --help');
    }
  });

  it('prints errors as JSON on stderr with --json', async () => {
    const result = await cli('components', 'get', 'buton', '--json');
    expect(result).toMatchObject({ code: 1, out: '' });
    expect(JSON.parse(result.err)).toEqual({ error: { code: 'NOT_FOUND', message: 'No component "buton".', suggestions: ['button'] } });
    expect(JSON.parse((await cli('nope', '--json')).err).error.code).toBe('INVALID_USAGE');
  });
});

describe('help and version', () => {
  it('lists every command, and each command\'s options', async () => {
    const help = await cli('--help');
    expect(help.code).toBe(0);
    for (const command of ['components list', 'components search', 'components get', 'examples', 'tokens search', 'tokens get', 'rules', 'icons search', 'doctor']) {
      expect(help.out).toContain(`  ${command}`);
    }
    const tokensHelp = await cli('tokens', 'search', '--help');
    expect(tokensHelp.out).toContain('Usage: legacyhq tokens search QUERY [options]');
    expect(tokensHelp.out).toContain('--mode MODE');
  });

  it('prints usage to stderr and exits 2 with no command', async () => {
    const result = await cli();
    expect(result).toMatchObject({ code: 2, out: '' });
    expect(result.err).toContain('Usage: legacyhq COMMAND');
  });

  it('prints the package version', async () => {
    const { version } = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    expect((await cli('--version')).out).toBe(version);
  });
});

describe('the program', () => {
  const program = (...argv) => spawnSync(process.execPath, [CLI, ...argv], { cwd: tmpdir(), encoding: 'utf8' });

  it('works from another directory', () => {
    const result = program('components', 'get', 'button', '--json');
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).id).toBe('button');
  });

  it('exits with the command\'s code', () => {
    expect(program('components', 'get', 'buton').status).toBe(1);
    expect(program('nope').status).toBe(2);
  });

  it('is the package\'s legacyhq bin', () => {
    const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    expect(path.resolve(REPO_ROOT, pkg.bin.legacyhq)).toBe(CLI);
    expect(readFileSync(CLI, 'utf8')).toMatch(/^#!\/usr\/bin\/env node\r?\n/);
  });
});
