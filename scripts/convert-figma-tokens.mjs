import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import tokens from './lib/tokens.cjs';
import { separateCssRecipes } from './lib/separate-css-recipes.mjs';
const { EXTENSION, readSources, collect } = tokens;

// Accept the repository's legacy export shape, organized by tier. New shapes
// require an explicit mapping; never silently guess missing/ambiguous aliases.
export function convert(sources) {
  const output = structuredClone(sources), entries = collect(output, 'value');
  const byName = new Map();
  for (const t of entries) byName.set(t.name, [...(byName.get(t.name) ?? []), t]);
  function targetFor(name, from) {
    let candidates = (byName.get(name) ?? []).filter(t => t.id !== from.id);
    const mode = from.path.find(p => ['Light', 'Dark'].includes(p));
    const sameMode = candidates.filter(t => t.path.includes(mode));
    candidates = sameMode.length ? sameMode : candidates.filter(t => !t.path.some(p => ['Light', 'Dark'].includes(p)));
    if (candidates.length > 1) {
      const primitives = candidates.filter(t => t.file.startsWith('primitives/'));
      if (primitives.length === 1 && name === from.name) candidates = primitives;
    }
    if (candidates.length !== 1) throw new Error(`${from.id}: missing/ambiguous CSS alias ${name}`);
    return candidates[0];
  }
  function convertOne(t, seen = new Set()) {
    if ('$value' in t.node) return;
    if (seen.has(t.id)) throw new Error(`Circular legacy alias: ${t.id}`);
    seen.add(t.id);
    const { value, type, originalName, description, ...extra } = t.node;
    if (Object.keys(extra).length) throw new Error(`${t.id}: unsupported legacy metadata`);
    let next = value, nextType = type, cssKind;
    const alias = typeof value === 'string' && value.match(/^var\(--([^)]+)\)$/);
    if (alias) {
      const target = targetFor(alias[1], t);
      convertOne(target, new Set(seen));
      next = `{${target.id}}`; nextType = target.node.$type;
      cssKind = target.node.$extensions?.[EXTENSION]?.cssKind;
    } else if (typeof value === 'string' && value.includes('var(')) {
      nextType = 'string'; cssKind = 'expression';
      next = value.replace(/var\(--([^)]+)\)/g, (_, name) => `{${targetFor(name, t).id}}`);
    } else if (type === 'color') {
      let rgb, alpha = 1;
      if (/^#[\da-f]{6}$/i.test(value)) rgb = [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
      else if (/^rgba\([\d.,\s]+\)$/.test(value)) {
        const parts = value.slice(5, -1).split(',').map(Number);
        if (parts.length !== 4) throw new Error(`Invalid rgba: ${value}`);
        rgb = parts.slice(0, 3); alpha = parts[3];
      } else if (value === 'transparent') { rgb = [0, 0, 0]; alpha = 0; }
      else throw new Error(`Unsupported color: ${value}`);
      next = { colorSpace: 'srgb', components: rgb.map(n => n / 255), alpha };
    } else if (t.name.includes('font-weight')) {
      nextType = 'fontWeight'; next = Number(String(value).replace(/px$/, ''));
    } else if (t.name.includes('font-family')) {
      nextType = 'fontFamily'; next = value.replace(/^"(.*)"$/, '$1');
    } else if (t.name.includes('text-transform')) {
      nextType = 'string'; cssKind = 'keyword'; next = value.replace(/^"(.*)"$/, '$1');
    } else if (type === 'float' || type === 'dimension' || type === 'duration') {
      const match = String(value).match(/^(-?\d+(?:\.\d+)?)(px|rem|ms|s)$/);
      if (!match) throw new Error(`${t.id}: unsupported unit ${value}`);
      nextType = type === 'duration' ? 'duration' : 'dimension'; next = { value: Number(match[1]), unit: match[2] };
    } else if (type === 'number') next = Number(value);
    else if (type === 'cubicBezier' && /^cubic-bezier\([\d.,\s-]+\)$/.test(value)) next = value.slice(13, -1).split(',').map(Number);
    else throw new Error(`${t.id}: unsupported legacy value ${value}`);
    for (const key of Object.keys(t.node)) delete t.node[key];
    Object.assign(t.node, { $type: nextType, $value: next });
    if (description) t.node.$description = description;
    if (originalName || cssKind) t.node.$extensions = { [EXTENSION]: {
      ...(originalName ? { originalName } : {}), ...(cssKind ? { cssKind } : {})
    } };
  }
  entries.forEach(t => convertOne(t));
  return separateCssRecipes(output);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || fs.existsSync(output)) throw new Error('Usage: npm run tokens:convert -- <legacy-tier-directory> <new-output-directory> (output must not exist)');
  const { sources, recipes } = convert(readSources(input));
  for (const [file, tree] of Object.entries(sources)) {
    const dest = path.join(output, 'src', file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, `${JSON.stringify(tree, null, 2)}\n`);
  }
  fs.writeFileSync(path.join(output, 'css-recipes.json'), `${JSON.stringify(recipes, null, 2)}\n`);
  console.log(`Converted ${Object.keys(sources).length} DTCG source files and ${recipes.declarations.length} CSS recipes into ${output}`);
}
