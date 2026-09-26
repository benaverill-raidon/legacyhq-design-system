const fs = require('node:fs');
const path = require('node:path');
const EXTENSION = 'com.legacyhq';
const ROOT = 'packages/ui/src/tokens/src';
const RECIPE_FILE = 'packages/ui/src/tokens/css-recipes.json';
const TIERS = ['primitives', 'responsive', 'component', 'semantic'];
const WRAPPERS = new Set(['Primitive', 'Value', 'Light', 'Dark', 'Semantic: Border',
  'Semantic: Color', 'Semantic: Dimension', 'Semantic: Typography', 'Semantic: Motion']);
const wholeReference = /^\{([^{}]+)\}$/;
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const numeric = v => typeof v === 'number' && Number.isFinite(v);
const exactKeys = (v, required, optional = []) => object(v)
  && required.every(k => Object.hasOwn(v, k))
  && Object.keys(v).every(k => [...required, ...optional].includes(k));

function cssName(parts) {
  return parts.filter(part => !WRAPPERS.has(part)).map(part => part
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '').toLowerCase()).join('-');
}
function readSources(root = ROOT) {
  return Object.fromEntries(fs.readdirSync(root, { recursive: true })
    .filter(file => file.endsWith('.json')).sort()
    .map(file => [file.replace(/\\/g, '/'), JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))]));
}
function orderedSources(sources) {
  return Object.fromEntries(Object.entries(sources).sort(([a], [b]) =>
    TIERS.indexOf(a.split('/')[0]) - TIERS.indexOf(b.split('/')[0]) || a.localeCompare(b)));
}
function collect(sources, valueKey = '$value') {
  const tokens = [];
  function metadata(node, location) {
    if ('$description' in node && typeof node.$description !== 'string') throw new Error(`Invalid description: ${location}`);
    if ('$extensions' in node && !object(node.$extensions)) throw new Error(`Invalid extensions: ${location}`);
  }
  function visit(node, parts, file) {
    if (!object(node)) throw new Error(`Invalid group: ${parts}`);
    metadata(node, parts.join('.'));
    if (Object.hasOwn(node, valueKey)) {
      tokens.push({ node, path: parts, id: parts.join('.'), name: cssName(parts), file });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) {
        if (!['$description', '$extensions'].includes(key)) throw new Error(`Unsupported group property: ${key}`);
      } else {
        if (/[.{}]/.test(key)) throw new Error(`Invalid DTCG group/token name: ${key}`);
        visit(child, [...parts, key], file);
      }
    }
  }
  for (const [file, tree] of Object.entries(sources)) visit(tree, [], file);
  return tokens;
}
// Authoring files are fragments of one document. References resolve against
// this assembled namespace, never against CSS names or a single fragment.
function assembleSources(sources) {
  const result = {};
  function merge(into, from, location = '') {
    for (const [key, value] of Object.entries(from)) {
      if (!Object.hasOwn(into, key)) into[key] = structuredClone(value);
      else if (key === '$extensions' && object(into[key]) && object(value)) merge(into[key], value, `${location}.${key}`);
      else if (!key.startsWith('$') && object(into[key]) && object(value)
        && !('$value' in into[key]) && !('$value' in value)) merge(into[key], value, `${location}.${key}`);
      else if (key.startsWith('$') && JSON.stringify(into[key]) === JSON.stringify(value)) continue;
      else throw new Error(`Conflicting document path: ${location}.${key}`);
    }
  }
  for (const tree of Object.values(orderedSources(sources))) merge(result, tree);
  return result;
}
function scope(token) {
  return token.path.includes('Dark') ? 'dark' : token.path.includes('Light') ? 'light' : 'tokens';
}
function cssLiteral(type, value) {
  switch (type) {
    case 'dimension': case 'duration': return `${value.value}${value.unit}`;
    case 'fontFamily': return (Array.isArray(value) ? value : [value]).map(v => JSON.stringify(v)).join(', ');
    case 'cubicBezier': return value.every((n, i) => n === [0, 0, 1, 1][i]) ? 'linear' : `cubic-bezier(${value.join(', ')})`;
    case 'color': {
      const rgb = value.components.map(v => Math.round(v * 255));
      return (value.alpha ?? 1) === 1
        ? `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`
        : `rgba(${rgb.join(', ')}, ${value.alpha})`;
    }
    case 'number': case 'fontWeight': return String(value);
    default: throw new Error(`Unsupported CSS type: ${type}`);
  }
}
function cssTypedValue(type, value, byId, owner, seen = new Set()) {
  const match = typeof value === 'string' && value.match(wholeReference);
  if (match) {
    const target = byId.get(match[1]);
    if (!target) throw new Error(`Missing reference: ${match[1]}`);
    return target.name === owner ? cssValue(target, byId, seen) : `var(--${target.name})`;
  }
  if (type === 'transition') {
    const duration = cssTypedValue('duration', value.duration, byId, owner, seen);
    const easing = cssTypedValue('cubicBezier', value.timingFunction, byId, owner, seen);
    // Omit only a literal zero delay; a referenced delay remains live in CSS.
    const delay = object(value.delay) && value.delay.value === 0 ? ''
      : ` ${cssTypedValue('duration', value.delay, byId, owner, seen)}`;
    return `${duration} ${easing}${delay}`;
  }
  return cssLiteral(type, value);
}
function cssValue(token, byId, seen = new Set()) {
  if (seen.has(token.id)) throw new Error(`Circular reference: ${token.id}`);
  const next = new Set(seen).add(token.id);
  return cssTypedValue(token.node.$type, token.node.$value, byId, token.name, next);
}
function validateSources(sources) {
  const document = assembleSources(sources);
  collect({ 'assembled.tokens.json': document });
  const tokens = collect(sources), byId = new Map(), names = new Map();
  const fail = (t, message) => { throw new Error(`${t.id}: ${message}`); };
  for (const t of tokens) {
    if (byId.has(t.id)) fail(t, 'duplicate token path');
    byId.set(t.id, t);
    if (t.path.some(p => /[.{}]/.test(p) || p.startsWith('$'))) fail(t, 'invalid DTCG name');
    if (t.path.includes('Light') && t.path.includes('Dark')) fail(t, 'ambiguous mode');
    const key = `${scope(t)}:${t.name}`;
    if (names.has(key)) fail(t, `duplicate CSS name (${names.get(key)})`);
    names.set(key, t.id);
    if (!exactKeys(t.node, ['$type', '$value'], ['$description', '$extensions'])) fail(t, 'unsupported token property');
  }
  const done = new Set();
  function checkValue(type, v, t, stack) {
    const match = typeof v === 'string' && v.match(wholeReference);
    if (match) {
      if (t.file.startsWith('primitives/')) fail(t, 'primitive tokens must contain raw values');
      const target = byId.get(match[1]);
      if (!target) fail(t, `missing reference ${match[1]}`);
      if (type !== target.node.$type) fail(t, `reference type mismatch: ${target.id}`);
      if (scope(target) !== 'tokens' && scope(target) !== scope(t)) fail(t, 'reference crosses incompatible CSS modes');
      check(target, stack);
      return;
    }
    if (typeof v === 'string' && (/[{}]/.test(v) || v.includes('var('))) fail(t, 'only whole-token references are allowed');
    let valid = false;
    switch (type) {
      case 'color': valid = exactKeys(v, ['colorSpace', 'components'], ['alpha']) && v.colorSpace === 'srgb'
        && Array.isArray(v.components) && v.components.length === 3 && v.components.every(n => numeric(n) && n >= 0 && n <= 1)
        && (v.alpha === undefined || (numeric(v.alpha) && v.alpha >= 0 && v.alpha <= 1)); break;
      case 'dimension': case 'duration': valid = exactKeys(v, ['value', 'unit']) && numeric(v.value)
        && (type === 'dimension' ? ['px', 'rem'] : ['ms', 's']).includes(v.unit); break;
      case 'number': valid = numeric(v); break;
      case 'fontWeight': valid = numeric(v) && v >= 1 && v <= 1000; break;
      case 'fontFamily': valid = typeof v === 'string' || (Array.isArray(v) && v.length > 0 && v.every(n => typeof n === 'string')); break;
      case 'cubicBezier': valid = Array.isArray(v) && v.length === 4 && v.every(numeric) && [v[0], v[2]].every(n => n >= 0 && n <= 1); break;
      case 'transition':
        valid = exactKeys(v, ['duration', 'delay', 'timingFunction']);
        if (valid) {
          checkValue('duration', v.duration, t, stack);
          checkValue('duration', v.delay, t, stack);
          checkValue('cubicBezier', v.timingFunction, t, stack);
        }
        break;
    }
    if (!valid) fail(t, `unsupported type or invalid ${type} value`);
  }
  function check(t, stack = new Set()) {
    if (stack.has(t.id)) fail(t, 'circular reference');
    if (done.has(t.id)) return;
    checkValue(t.node.$type, t.node.$value, t, new Set(stack).add(t.id));
    done.add(t.id);
  }
  tokens.forEach(t => check(t));
  return { tokens, byId, document };
}
module.exports = { EXTENSION, ROOT, RECIPE_FILE, TIERS, wholeReference, cssName, readSources,
  orderedSources, collect, assembleSources, scope, cssLiteral, cssValue, validateSources };
