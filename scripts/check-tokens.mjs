import assert from 'node:assert/strict';
import fs from 'node:fs';
import StyleDictionary from 'style-dictionary';
import config from '../style-dictionary.config.js';
import tokens from './lib/tokens.cjs';

const { tokens: entries, document } = tokens.validateSources(tokens.readSources());
tokens.validateSources({ 'assembled.tokens.json': document });
const build = () => new StyleDictionary({ ...config, log: { verbosity: 'silent', warnings: 'error' } }).formatAllPlatforms();
const first = await build();
assert.deepEqual(await build(), first, 'Token builds must be repeatable');
const normalize = text => text.replace(/\r\n/g, '\n');
for (const [mode, [file]] of Object.entries(first)) {
  assert.equal(normalize(fs.readFileSync(file.destination, 'utf8')), normalize(file.output), `${mode}.css is stale; run npm run build`);
}

// Verify the actual runtime graph after CSS names and theme overrides are applied.
const declarations = css => new Map([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value]));
for (const mode of ['light', 'dark']) {
  const values = new Map([...declarations(first.tokens[0].output), ...declarations(first[mode][0].output)]);
  const done = new Set();
  function visit(name, stack = new Set()) {
    assert(!stack.has(name), `${mode}: CSS reference cycle at ${name}`);
    assert(values.has(name), `${mode}: undefined CSS variable ${name}`);
    if (done.has(name)) return;
    stack.add(name);
    for (const [, ref] of values.get(name).matchAll(/var\((--[\w-]+)\)/g)) visit(ref, new Set(stack));
    done.add(name);
  }
  values.forEach((_, name) => visit(name));
}
console.log(`Validated ${entries.length} standard DTCG tokens and the assembled document; generated CSS is current, repeatable, and references resolve in both themes.`);
