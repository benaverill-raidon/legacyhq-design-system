import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import StyleDictionary from 'style-dictionary';
import config from '../style-dictionary.config.js';
import tokens from './lib/tokens.cjs';
import { convert } from './convert-figma-tokens.mjs';
import recipes from './lib/css-recipes.cjs';
const { validateSources, cssValue, EXTENSION } = tokens;
const token = ($type, $value, extra = {}) => ({ $type, $value, ...extra });
const source = tree => ({ 'semantic/test.json': tree });

test('all selectors, declarations, values and runtime aliases match the pre-migration build', async () => {
  const output = await new StyleDictionary({ ...config, log: { verbosity: 'silent' } }).formatAllPlatforms();
  for (const [mode, [file]] of Object.entries(output)) {
    const baseline = fs.readFileSync(`scripts/fixtures/token-migration/${mode}.css`, 'utf8').replace(/\r\n/g, '\n');
    assert.equal(file.output, baseline, `${mode}.css changed from the pre-DTCG build`);
  }
});

test('invalid values, dangling aliases, cycles, mode crossings and collisions fail', () => {
  for (const tree of [
    { a: token('dimension', '12px') },
    { a: token('fontWeight', '500px') },
    { a: token('number', '1') },
    { a: token('duration', { value: 20, unit: 'px' }) },
    { a: token('color', '#fff') },
    { a: token('cubicBezier', [2, 0, 0, 1]) },
    { a: token('string', 'none') },
    { a: token('string', 'none', { $extensions: { [EXTENSION]: { cssKind: 'keyword' } } }) },
    { a: token('number', '{missing}') },
    { a: token('number', '{b'), b: token('number', 1) },
    { a: token('number', '{b}'), b: token('number', '{a}') },
    { a: token('dimension', '{b}'), b: token('number', 1) },
    { Light: { a: token('number', '{Dark.b}') }, Dark: { b: token('number', 1) } },
    { 'a-b': token('number', 1), a: { b: token('number', 2) } },
    { $extends: '{other}', a: token('number', 1) }
  ]) assert.throws(() => validateSources(source(tree)));
});

test('same CSS name in a primitive and a mode alias is emitted as a literal, never a CSS cycle', () => {
  const { tokens: entries, byId } = validateSources(source({
    Primitive: { Value: { size: token('dimension', { value: 12, unit: 'px' }) } },
    Light: { size: token('dimension', '{Primitive.Value.size}') }
  }));
  assert.equal(cssValue(entries[1], byId), '12px');
});

test('legacy exports convert types, metadata, wrapped aliases, calculations and modes', () => {
  const legacy = {
    'primitives/primitive.json': { Primitive: { Value: {
      measurement: { type: 'float', value: '-1.5px', originalName: 'measurement/minus-half' },
      'typography-font-weight-500': { type: 'float', value: '500px' },
      'typography-font-family-public-sans': { type: 'string', value: '"Public Sans"' },
      time: { type: 'duration', value: '150ms' },
      ease: { type: 'cubicBezier', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      red: { type: 'color', value: 'rgba(255, 0, 0, 0.16)' }
    } } },
    'semantic/color.json': { 'Semantic: Color': {
      Light: { color: { type: 'color', value: 'var(--red)' } },
      Dark: { color: { type: 'color', value: 'transparent' } }
    } },
    'component/example.json': { component: { example: {
      size: { type: 'dimension', value: 'calc(var(--measurement) + 2 * var(--measurement))' },
      Light: { fill: { type: 'color', value: 'var(--color)' } },
      Dark: { fill: { type: 'color', value: 'var(--color)' } }
    } } }
  };
  const output = convert(legacy), { byId } = validateSources(output.sources);
  const get = id => byId.get(id).node;
  assert.deepEqual(get('Primitive.Value.measurement').$value, { value: -1.5, unit: 'px' });
  assert.equal(get('Primitive.Value.measurement').$extensions[EXTENSION].originalName, 'measurement/minus-half');
  assert.equal(get('Primitive.Value.typography-font-weight-500').$value, 500);
  assert.equal(get('Primitive.Value.typography-font-family-public-sans').$value, 'Public Sans');
  assert.deepEqual(get('Primitive.Value.time').$value, { value: 150, unit: 'ms' });
  assert.deepEqual(get('Primitive.Value.ease').$value, [0.34, 1.56, 0.64, 1]);
  assert.equal(get('component.example.Dark.fill').$value, '{Semantic: Color.Dark.color}');
  assert.equal(get('component.example.Light.fill').$value, '{Semantic: Color.Light.color}');
  assert(!byId.has('component.example.size'), 'CSS calculation must not masquerade as a DTCG token');
  assert.equal(recipes.recipeValue(output.recipes.declarations[0], byId), 'calc(var(--measurement) + 2 * var(--measurement))');
  assert.equal(cssValue(byId.get('Semantic: Color.Dark.color'), byId), 'rgba(0, 0, 0, 0)');
  assert.deepEqual(convert(legacy), output, 'converter is deterministic and does not mutate its input');
  legacy['component/example.json'].component.example.size.value = 'var(--missing)';
  assert.throws(() => convert(legacy), /missing\/ambiguous/);
});

test('transition composites validate nested references and preserve zero/nonzero/referenced delays', () => {
  const tree = {
    duration: token('duration', { value: 150, unit: 'ms' }),
    ease: token('cubicBezier', [0.2, 0, 0, 1]),
    fade: token('transition', { duration: '{duration}', delay: { value: 0, unit: 'ms' }, timingFunction: '{ease}' })
  };
  const render = () => {
    const { byId } = validateSources(source(tree));
    return cssValue(byId.get('fade'), byId);
  };
  assert.equal(render(), 'var(--duration) var(--ease)');
  tree.fade.$value.delay = { value: 25, unit: 'ms' };
  assert.equal(render(), 'var(--duration) var(--ease) 25ms');
  tree.fade.$value.delay = '{duration}';
  assert.equal(render(), 'var(--duration) var(--ease) var(--duration)');
  for (const invalid of [
    { duration: '{duration}', timingFunction: '{ease}' },
    { duration: '{ease}', delay: { value: 0, unit: 'ms' }, timingFunction: '{ease}' },
    { duration: '{duration}', delay: '{missing}', timingFunction: '{ease}' },
    { duration: '{duration}', delay: { value: 0, unit: 'ms' }, timingFunction: 'linear' },
    { duration: '{duration}', delay: { value: 0, unit: 'ms' }, timingFunction: [0, 0, 2, 1] },
    { duration: '{duration}', delay: { value: 0, unit: 'ms' }, timingFunction: '{ease}', extra: 1 }
  ]) {
    tree.fade.$value = invalid;
    assert.throws(render);
  }
});

test('assembled interchange document contains only standard types and resolves all references', () => {
  const { document, tokens: entries } = validateSources(tokens.readSources());
  const assembled = validateSources({ 'export.tokens.json': JSON.parse(JSON.stringify(document)) });
  assert.equal(assembled.tokens.length, entries.length);
  assert.equal(entries.filter(t => t.node.$type === 'transition').length, 4);
  assert(entries.every(t => t.node.$type !== 'string'));
  assert(!JSON.stringify(document).includes('cssKind'));
  assert(!JSON.stringify(document).includes('calc('));
  assert.throws(() => validateSources({ 'a.json': { x: token('number', 1) }, 'b.json': { x: { child: token('number', 2) } } }), /Conflicting/);
});

test('recipe failures cannot silently alter casing, drop declarations, or introduce dangling CSS', () => {
  const validated = validateSources(tokens.readSources());
  const good = recipes.readRecipes();
  for (const mutate of [
    r => { r.declarations[0].value.value = 'uppercase'; },
    r => { r.declarations[0].after = 'missing'; },
    r => { r.declarations[0].after = r.declarations[0].name; },
    r => { r.declarations[0].value = { kind: 'alias', target: 'missing' }; },
    r => { r.declarations[0].value = { kind: 'alias', target: r.declarations[0].name }; },
    r => { r.declarations.push(structuredClone(r.declarations[0])); },
    r => { r.omitTokens.push('Primitive.Value.measurement-4'); },
    r => { r.declarations.find(d => d.value.kind === 'inset-size').value.track = 'Primitive.Value.duration-fast'; }
  ]) {
    const bad = structuredClone(good); mutate(bad);
    assert.throws(() => recipes.buildDeclarations(validated.tokens, validated.byId, bad));
  }
});

test('future legacy exports separate authored casing, fade/move composites and loop parameters', () => {
  const legacy = {
    'primitives/primitive.json': { Primitive: { Value: {
      'typography-text-transform-none': { type: 'string', value: '"none"', originalName: 'typography/text-transform/none' },
      'duration-fast': { type: 'duration', value: '150ms' },
      'ease-loop': { type: 'cubicBezier', value: 'cubic-bezier(0.4, 0.15, 0.6, 0.85)' }
    } } },
    'semantic/motion.json': { 'Semantic: Motion': {
      'fade-quick': { type: 'string', value: 'var(--duration-fast) var(--ease-loop)', originalName: 'fade/quick' },
      'spin-loop': { type: 'string', value: 'var(--duration-fast) var(--ease-loop)', originalName: 'spin/loop' },
      'pulse-loop': { type: 'string', value: 'var(--duration-fast) linear', originalName: 'pulse/loop' }
    } },
    'semantic/typography.json': { 'Semantic: Typography': {
      'typography-body-text-transform': { type: 'string', value: 'var(--typography-text-transform-none)', originalName: 'typography/body/text-transform' }
    } }
  };
  const output = convert(legacy);
  const validated = validateSources(output.sources);
  const css = new Map(recipes.buildDeclarations(validated.tokens, validated.byId, output.recipes).tokens.map(t => [t.name, t.value]));
  assert.equal(validated.byId.get('Semantic: Motion.fade-quick').node.$type, 'transition');
  assert.equal(css.get('spin-loop'), 'var(--duration-fast) var(--ease-loop)');
  assert.equal(css.get('pulse-loop'), 'var(--duration-fast) linear');
  assert.equal(css.get('typography-body-text-transform'), 'var(--typography-text-transform-none)');
  assert.equal(output.recipes.declarations[0].originalName, 'typography/text-transform/none');
  assert.equal(output.sources['semantic/motion.json']['Semantic: Motion']['spin-loop'].$extensions[EXTENSION].originalName, 'spin/loop');
  legacy['primitives/primitive.json'].Primitive.Value['typography-text-transform-none'].value = '"uppercase"';
  assert.throws(() => convert(legacy), /new design decision/);
});
