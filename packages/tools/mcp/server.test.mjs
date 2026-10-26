// @vitest-environment node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { run } from '../cli/legacyhq.mjs';
import { REPO_ROOT, componentFilterValues, iconCategories, listRuleTopics, tokenFilterValues } from '../query/index.mjs';
import { createServer } from './server.mjs';

// Most tests talk to the server in-process through the SDK's own client; one starts the real
// program over stdio. Parity tests compare each tool's structured result with `legacyhq ... --json`.

const SERVER = path.join(path.dirname(fileURLToPath(import.meta.url)), 'server.mjs');

let client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverTransport);
  client = new Client({ name: 'test', version: '0' });
  await client.connect(clientTransport);
});

afterAll(() => client.close());

const call = (name, args = {}) => client.callTool({ name, arguments: args });

async function cliJson(...argv) {
  const out = [];
  const err = [];
  const code = await run([...argv, '--json'], { out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.length ? JSON.parse(out.join('\n')) : null, err: err.length ? JSON.parse(err.join('\n')) : null };
}

describe('tools', () => {
  it('are the eight read-only tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual([
      'search_components', 'get_component', 'get_examples', 'search_tokens', 'get_token', 'get_rules', 'search_icons', 'check_system',
    ]);
    for (const tool of tools) {
      expect(tool.description, tool.name).toBeTruthy();
      expect(tool.annotations, tool.name).toMatchObject({ readOnlyHint: true, openWorldHint: false });
    }
  });

  it('take filter values from the schema and data, and cap limits', async () => {
    const schemas = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t.inputSchema.properties]));
    const components = componentFilterValues();
    const tokens = tokenFilterValues();
    expect(schemas.search_components.category.enum).toEqual(components.category);
    expect(schemas.search_components.tier.enum).toEqual(components.tier);
    expect(schemas.search_components.status.enum).toEqual(components.status);
    expect(schemas.search_tokens.tier.enum).toEqual(tokens.tier);
    expect(schemas.search_tokens.type.enum).toEqual(tokens.type);
    expect(schemas.search_tokens.mode.enum).toEqual(tokens.mode);
    expect(schemas.search_icons.category.enum).toEqual(iconCategories());
    expect(schemas.get_rules.topic.enum).toEqual(listRuleTopics().map((t) => t.topic));
    for (const tool of ['search_components', 'search_tokens', 'search_icons']) {
      expect(schemas[tool].limit, tool).toMatchObject({ minimum: 1, maximum: 200 });
    }
  });
});

describe('parity with the CLI', () => {
  const cases = [
    ['search_components', { query: 'text input', category: 'forms', limit: 3 }, ['components', 'search', 'text', 'input', '--category', 'forms', '--limit', '3']],
    ['get_component', { id: 'Key Value Pair' }, ['components', 'get', 'key-value-pair']],
    ['get_examples', { id: 'button', kind: 'anti' }, ['examples', 'button', '--kind', 'anti']],
    ['search_tokens', { query: 'brand background', tier: 'semantic', mode: 'dark' }, ['tokens', 'search', 'brand', 'background', '--tier', 'semantic', '--mode', 'dark']],
    ['get_token', { name: 'var(--fade-quick)' }, ['tokens', 'get', 'fade-quick']],
    ['get_rules', { topic: 'motion' }, ['rules', 'motion']],
    ['search_icons', { query: 'delete' }, ['icons', 'search', 'delete']],
    ['check_system', {}, ['doctor']],
  ];

  it.each(cases)('%s returns what the CLI prints with --json', async (name, args, argv) => {
    const result = await call(name, args);
    const cli = await cliJson(...argv);
    expect(cli.code).toBe(0);
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual(cli.out);
  });

  it('get_rules with no topic lists the topics the CLI lists', async () => {
    expect((await call('get_rules')).structuredContent).toEqual({ topics: (await cliJson('rules')).out });
  });

  it('errors match the CLI\'s JSON errors', async () => {
    for (const [name, args, argv] of [
      ['get_component', { id: 'buton' }, ['components', 'get', 'buton']],
      ['get_token', { name: 'color-background-brnad' }, ['tokens', 'get', 'color-background-brnad']],
      ['search_components', { query: ' ' }, ['components', 'search', ' ']],
    ]) {
      const result = await call(name, args);
      const cli = await cliJson(...argv);
      expect(result.isError, name).toBe(true);
      expect(result.structuredContent, name).toEqual(cli.err);
    }
  });
});

describe('results', () => {
  it('are a short summary, then the structured result as JSON', async () => {
    const result = await call('search_components', { query: 'date', limit: 2 });
    const lines = result.content[0].text.split('\n');
    expect(lines[0]).toMatch(/^2 of \d+ components \(raise limit for more\):$/);
    expect(lines[1]).toMatch(/^- date-picker /);
    expect(JSON.parse(lines.at(-1))).toEqual(result.structuredContent);
  });

  it('keep searches compact, and give one component in full', async () => {
    const search = await call('search_components', { query: 'button' });
    expect(Object.keys(search.structuredContent.results[0]).sort()).toEqual(['category', 'id', 'knownIssues', 'name', 'source', 'status', 'tier']);
    const button = await call('get_component', { id: 'button' });
    expect(button.structuredContent).toMatchObject({ id: 'button', status: expect.any(String), knownIssues: expect.any(Array), props: expect.any(Object) });
  });

  it('name close matches when something isn\'t found', async () => {
    const result = await call('get_component', { id: 'buton' });
    expect(result.content[0].text).toBe('No component "buton".\nDid you mean: button?');
    expect(result.structuredContent.error).toMatchObject({ code: 'NOT_FOUND', suggestions: ['button'] });
  });

  it('reject input outside the schema', async () => {
    for (const [name, args] of [
      ['search_components', { query: 'button', limit: 201 }],
      ['search_components', { query: 'button', limit: 0 }],
      ['search_components', { query: 'button', tier: 'atoms' }],
      ['search_tokens', { query: 'brand', mode: 'dim' }],
      ['get_rules', { topic: 'nope' }],
      ['get_component', {}],
    ]) {
      expect((await call(name, args)).isError, JSON.stringify(args)).toBe(true);
    }
  });

  it('treat ids as names to look up, never as paths', async () => {
    const result = await call('get_component', { id: '../../package.json' });
    expect(result.isError).toBe(true);
    expect(result.structuredContent.error.code).toBe('NOT_FOUND');
  });
});

describe('the program', () => {
  it('speaks only the protocol on stdout, works from another directory, and exits when the client leaves', async () => {
    const child = spawn(process.execPath, [SERVER], { cwd: tmpdir(), stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    const send = (message) => child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);
    const waitFor = (id) => new Promise((resolve) => {
      const check = () => {
        const line = stdout.split('\n').find((l) => l && JSON.parse(l).id === id);
        if (line) resolve(JSON.parse(line));
        else setTimeout(check, 20);
      };
      check();
    });

    send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } } });
    expect((await waitFor(1)).result.serverInfo.name).toBe('legacyhq-design-system');
    send({ method: 'notifications/initialized' });
    send({ id: 2, method: 'tools/call', params: { name: 'get_component', arguments: { id: 'button' } } });
    expect((await waitFor(2)).result.structuredContent.id).toBe('button');

    const exited = new Promise((resolve) => child.on('exit', resolve));
    child.stdin.end();
    expect(await exited).toBe(0);
    for (const line of stdout.split('\n').filter(Boolean)) expect(JSON.parse(line).jsonrpc).toBe('2.0');
  }, 20000);

  it('is registered in .mcp.json with a relative path', () => {
    const config = JSON.parse(readFileSync(path.join(REPO_ROOT, '.mcp.json'), 'utf8'));
    const entry = config.mcpServers['legacyhq-design-system'];
    expect(entry.command).toBe('node');
    expect(entry.args).toHaveLength(1);
    expect(path.isAbsolute(entry.args[0])).toBe(false);
    expect(path.resolve(REPO_ROOT, entry.args[0])).toBe(SERVER);
  });
});
