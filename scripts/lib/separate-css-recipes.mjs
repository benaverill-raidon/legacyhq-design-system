import tokens from './tokens.cjs';
import css from './css-recipes.cjs';
const { collect, orderedSources, EXTENSION, scope, validateSources, wholeReference } = tokens;

// Split the known legacy CSS conventions from standard token data. This is used
// by future exports too; no non-standard $type is ever written to the source tree.
export function separateCssRecipes(input) {
  const sources = structuredClone(input);
  const entries = collect(orderedSources(sources));
  const byId = new Map(entries.map(t => [t.id, t]));
  const recipes = { version: 1, omitTokens: [], declarations: [] };
  const previous = new Map();
  function remove(t) {
    const parent = t.path.slice(0, -1).reduce((node, key) => node[key], sources[t.file]);
    delete parent[t.path.at(-1)];
  }
  function casing(t, seen = new Set()) {
    if (!t || seen.has(t.id)) throw new Error('Invalid casing alias');
    const match = typeof t.node.$value === 'string' && t.node.$value.match(wholeReference);
    return match ? casing(byId.get(match[1]), new Set(seen).add(t.id)) : t.node.$value;
  }
  for (const t of entries) {
    const mode = scope(t), after = previous.get(mode) ?? null;
    previous.set(mode, t.name);
    if (t.node.$type !== 'string') continue;
    const originalName = t.node.$extensions?.[EXTENSION]?.originalName;
    const declaration = { name: t.name, mode, after, sourcePath: t.id,
      ...(originalName ? { originalName } : {}) };
    const value = t.node.$value;
    if (t.name.includes('text-transform')) {
      if (casing(t) !== 'none') throw new Error(`${t.id}: casing requires a new design decision`);
      const alias = value.match(wholeReference);
      declaration.value = alias ? { kind: 'alias', target: byId.get(alias[1]).name } : { kind: 'keyword', value: 'none' };
      // Do not mutate t.node: other casing aliases still need it during conversion.
      remove(t);
    } else if (/^(fade|move)-(quick|long)$/.test(t.name)) {
      const match = value.match(/^(\{[^{}]+\}) (\{[^{}]+\})$/);
      if (!match) throw new Error(`Unsupported transition: ${t.id}`);
      t.node.$type = 'transition';
      t.node.$value = { duration: match[1], delay: { value: 0, unit: 'ms' }, timingFunction: match[2] };
      delete t.node.$extensions?.[EXTENSION]?.cssKind;
      continue;
    } else if (['spin-loop', 'pulse-loop'].includes(t.name)) {
      const match = value.match(/^(\{[^{}]+\}) (\{[^{}]+\}|linear)$/);
      if (!match) throw new Error(`Unsupported loop: ${t.id}`);
      const group = {
        ...(originalName ? { $extensions: { [EXTENSION]: { originalName } } } : {}),
        duration: { $type: 'duration', $value: match[1] },
        timingFunction: { $type: 'cubicBezier', $value: match[2] === 'linear' ? [0, 0, 1, 1] : match[2] }
      };
      const parent = t.path.slice(0, -1).reduce((node, key) => node[key], sources[t.file]);
      parent[t.path.at(-1)] = group;
      const duration = `${t.id}.duration`, timingFunction = `${t.id}.timingFunction`;
      recipes.omitTokens.push(duration, timingFunction);
      declaration.value = { kind: 'motion', duration, timingFunction };
    } else {
      const match = value.match(/^calc\(\{([^{}]+)\} \+ 2 \* \{([^{}]+)\}\)$/);
      if (!match) throw new Error(`Unsupported CSS expression: ${t.id}`);
      declaration.value = { kind: 'inset-size', track: match[1], padding: match[2] };
      remove(t);
    }
    recipes.declarations.push(declaration);
  }
  const validated = validateSources(sources);
  css.buildDeclarations(validated.tokens, validated.byId, recipes);
  return { sources, recipes };
}
