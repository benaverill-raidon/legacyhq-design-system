import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evidenceOf, highestSupported, unmetFor } from './lib/component-status.mjs';
import { validateAgainstSchema } from './lib/validate-schema.mjs';

const OUTPUT = 'docs/components/registry.json';

const TIER_DIRS = ['primitives', 'atoms', 'molecules', 'organisms'];

const SUBSTANTIVE_SECTIONS = [
  'purpose',
  'useCases',
  'states',
  'accessibility',
  'behaviorRules',
  'do',
  'dont',
  'acceptanceCriteria',
];

function isNonEmpty(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  if (typeof value === 'string') return value.length > 0;
  return true;
}

function computeContentCompleteness(raw) {
  const present = SUBSTANTIVE_SECTIONS.filter((key) => isNonEmpty(raw[key])).length;
  const ratio = present / SUBSTANTIVE_SECTIONS.length;
  if (ratio >= 0.875) return 'full';
  if (ratio >= 0.375) return 'partial';
  return 'stub';
}

// anatomy has 5 raw shapes across existing contract.json files:
//  (a) [{name, ...}]                (b) [{part, ...}]           (c) ["string", ...]
//  (d) {group: ["string", ...]}     (e) {part: "description string"}
// All normalize to Array<{name, description?, group?}>.
function normalizeAnatomy(raw, ctx) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((entry, i) => {
      if (typeof entry === 'string') return { name: entry };
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const name = entry.name ?? entry.part;
        if (!name) throw new Error(`${ctx}: anatomy[${i}] missing name/part: ${JSON.stringify(entry)}`);
        const out = { name };
        if (entry.description) out.description = entry.description;
        return out;
      }
      throw new Error(`${ctx}: unrecognized anatomy[${i}] shape`);
    });
  }
  if (raw && typeof raw === 'object') {
    const out = [];
    for (const [key, value] of Object.entries(raw)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== 'string') throw new Error(`${ctx}: anatomy.${key}[] contains a non-string entry`);
          out.push({ name: item, group: key });
        }
      } else if (typeof value === 'string') {
        out.push({ name: key, description: value });
      } else {
        throw new Error(`${ctx}: unrecognized anatomy.${key} shape`);
      }
    }
    return out;
  }
  throw new Error(`${ctx}: unrecognized top-level anatomy shape (${typeof raw})`);
}

// props has 4 raw shapes: {} empty, full {type,default,required,description,enum|values} map,
// sparse {values}-only map, or absent entirely. Normalizes to
// Record<string, {type, required, default, description, enum?}> - missing sub-fields become
// null/false, never a fabricated value.
function normalizeProps(raw, ctx) {
  if (raw == null) return {};
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`${ctx}: unrecognized top-level props shape`);
  const out = {};
  for (const [propName, detail] of Object.entries(raw)) {
    if (!detail || typeof detail !== 'object' || Array.isArray(detail)) {
      throw new Error(`${ctx}: props.${propName} is not an object`);
    }
    out[propName] = {
      type: detail.type ?? null,
      required: detail.required ?? false,
      default: 'default' in detail ? detail.default : null,
      description: detail.description ?? null,
    };
    const enumValues = detail.enum ?? detail.values;
    if (enumValues) out[propName].enum = enumValues;
  }
  return out;
}

// sizes has 5 raw shapes: array of size-detail objects, empty array, flat string array,
// object keyed by size name -> dimension detail, or absent (Skeleton uses `sizing` instead -
// handled separately as a pass-through, see normalizeComponent). Normalizes to string[].
function normalizeSizes(raw, ctx) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if (typeof raw[0] === 'string') {
      if (!raw.every((s) => typeof s === 'string')) throw new Error(`${ctx}: mixed-type sizes array`);
      return raw;
    }
    if (typeof raw[0] === 'object') {
      return raw.map((s, i) => {
        if (!s || !s.name) throw new Error(`${ctx}: sizes[${i}] missing name`);
        return s.name;
      });
    }
    throw new Error(`${ctx}: unrecognized sizes[] entry shape`);
  }
  if (typeof raw === 'object') return Object.keys(raw);
  throw new Error(`${ctx}: unrecognized top-level sizes shape (${typeof raw})`);
}

// slots has 4 raw shapes: populated array of objects, flat string array, empty array, or
// absent. Normalizes to string[] of slot names.
function normalizeSlots(raw, ctx) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if (typeof raw[0] === 'string') {
      if (!raw.every((s) => typeof s === 'string')) throw new Error(`${ctx}: mixed-type slots array`);
      return raw;
    }
    if (typeof raw[0] === 'object') {
      return raw.map((s, i) => {
        if (!s || !s.name) throw new Error(`${ctx}: slots[${i}] missing name`);
        return s.name;
      });
    }
    throw new Error(`${ctx}: unrecognized slots[] entry shape`);
  }
  throw new Error(`${ctx}: unrecognized top-level slots shape (${typeof raw})`);
}

// variants has 4+ raw shapes, dispatched PER AXIS (not per file) so a file mixing shapes
// across its own axes (e.g. TextField: `size` as a dimension-detail object, `appearance` as
// a {purpose,className} object) normalizes correctly with no component-specific carve-out.
// Normalizes to Record<axis, string[]>.
function normalizeVariants(raw, ctx) {
  if (raw == null) return {};
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`${ctx}: unrecognized top-level variants shape`);
  const out = {};
  for (const [axis, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      if (!value.every((v) => typeof v === 'string')) throw new Error(`${ctx}: variants.${axis}[] has non-string values`);
      out[axis] = value;
    } else if (value && typeof value === 'object') {
      out[axis] = Object.keys(value);
    } else {
      throw new Error(`${ctx}: unrecognized variants.${axis} value shape`);
    }
  }
  return out;
}

/**
 * Where each component's code lives, read from the source tree, with the status evidence found
 * there: a Docs page (on the component page standard, `<ComponentHeader id="...">`, or the
 * component's own `<id>.mdx`, such as Icon's Foundations page) and tests beside it.
 */
async function codeEvidence(codeDir) {
  const files = (await readdir(codeDir, { recursive: true })).map((file) => file.split(path.sep).join('/'));
  const byId = new Map();
  for (const file of files.filter((name) => name.endsWith('.mdx'))) {
    const mdx = await readFile(path.join(codeDir, file), 'utf8');
    const id = mdx.match(/<ComponentHeader\s+id="([a-z-]+)"/)?.[1] ?? (path.posix.basename(file, '.mdx') === path.posix.basename(path.posix.dirname(file)) ? path.posix.basename(file, '.mdx') : null);
    if (!id || byId.has(id)) continue;
    const dir = path.posix.dirname(file);
    const tests = files.some((name) => path.posix.dirname(name) === dir && /\.test\.tsx?$/.test(name));
    byId.set(id, { docsPage: true, tests });
  }
  return byId;
}

function normalizeStatus({ name, raw, evidence }) {
  // Authored, never defaulted: a component without a status fails generation, and the schema
  // enum rejects anything outside the vocabulary (componentStatus in component-registry-governance.json).
  if (!raw.status) throw new Error(`${name}: missing "status" (see componentStatus in component-registry-governance.json)`);
  return {
    status: raw.status,
    knownIssues: raw.knownIssues ?? [],
    replacedBy: raw.replacedBy ?? null,
    statusCheck: { supported: highestSupported(evidence), unmet: unmetFor('stable', evidence), evidence },
  };
}

function normalizeComponent({ id, tier, raw, relPath, code, exemplarCompleteness }) {
  const name = raw.name;
  if (!name) throw new Error(`${id}: missing "name"`);
  // category is required, not nullable: the schema enum alone can't catch a missing value
  // (validateAgainstSchema treats null leaves as valid), so check presence explicitly here.
  if (!raw.category) throw new Error(`${name}: missing "category" (see classification in component-registry-governance.json)`);

  // Radio documents two components (Radio + RadioGroup) in one file, nested under `radio`/
  // `radioGroup` keys. Detected by those keys, so a top-level anatomy (the Docs page labels the
  // main component's parts from it) doesn't hide the sub-components.
  const isMultiComponent = 'radio' in raw || 'radioGroup' in raw;

  let anatomy;
  let props;
  const subComponents = [];

  if (isMultiComponent) {
    for (const key of ['radio', 'radioGroup']) {
      if (!(key in raw)) continue;
      const sub = raw[key];
      const subName = key === 'radio' ? 'Radio' : 'RadioGroup';
      const subCtx = `${name}.${key}`;
      subComponents.push({
        name: subName,
        anatomy: normalizeAnatomy(sub.anatomy, subCtx),
        props: normalizeProps(sub.props, subCtx),
      });
    }
    anatomy = 'anatomy' in raw ? normalizeAnatomy(raw.anatomy, name) : [];
    props = 'props' in raw ? normalizeProps(raw.props, name) : {};
  } else {
    anatomy = normalizeAnatomy(raw.anatomy, name);
    props = normalizeProps(raw.props, name);
  }

  const entry = {
    id,
    name,
    tier,
    category: raw.category,
    path: relPath,
    anatomy,
    props,
    sizes: normalizeSizes(raw.sizes, name),
    slots: normalizeSlots(raw.slots, name),
    variants: normalizeVariants(raw.variants, name),
    subComponents,
    tokens: raw.tokens ?? {},
    accessibility: raw.accessibility ?? {},
    relatedComponents: raw.relatedComponents ?? [],
    contentCompleteness: computeContentCompleteness(raw),
    // Passthrough, not normalized - deliberately supports several shapes (single node,
    // multi-variant-node, sub-component, or a documented no-node exception like Icon/Logo).
    // See docs/foundations/design-code-mapping-governance.json.
    figmaSource: raw.figmaSource ?? null,
    ...normalizeStatus({
      name,
      raw,
      evidence: evidenceOf({ ...code, figmaSource: raw.figmaSource, contentCompleteness: computeContentCompleteness(raw), exemplarCompleteness, knownIssues: raw.knownIssues }),
    }),
  };

  // Skeleton-style free-size components use a singular `sizing` object instead of a `sizes`
  // enum. Detected structurally (has `sizing`, lacks `sizes`) so a future component reusing
  // this pattern is handled automatically, without hardcoding a component name.
  if (raw.sizing && raw.sizes == null) {
    entry.sizingDetail = raw.sizing;
  }

  return entry;
}

/**
 * Builds the registry from the contracts and the source tree, validated against its schema, without
 * writing it. Reads exemplars.json for each component's exemplar completeness unless `exemplars` (the
 * output of buildExemplars) is passed, which is how a freshness check compares against the sources.
 * @param {string} rootDir repository root
 * @param {{ exemplars?: Array<{ id: string, exemplarCompleteness: string }> }} [options]
 */
export async function buildRegistry(rootDir, { exemplars: builtExemplars } = {}) {
  const componentsDir = path.join(rootDir, 'docs/components');
  const registry = [];
  const code = await codeEvidence(path.join(rootDir, 'packages/ui/src/components'));
  // Generated by generate:exemplars; run that first when an examples.json changes.
  const exemplarList = builtExemplars ?? JSON.parse(await readFile(path.join(componentsDir, 'exemplars.json'), 'utf8'));
  const exemplars = new Map(exemplarList.map((entry) => [entry.id, entry.exemplarCompleteness]));

  for (const tierDir of TIER_DIRS) {
    const tier = tierDir.slice(0, -1);
    const dirents = await readdir(path.join(componentsDir, tierDir), { withFileTypes: true });
    const ids = dirents
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const id of ids) {
      const contractPath = path.join(componentsDir, tierDir, id, `${id}.contract.json`);
      const raw = JSON.parse(await readFile(contractPath, 'utf8'));
      const relPath = path.relative(rootDir, contractPath).split(path.sep).join('/');
      registry.push(normalizeComponent({ id, tier, raw, relPath, code: code.get(id) ?? {}, exemplarCompleteness: exemplars.get(id) }));
    }
  }

  const schema = JSON.parse(await readFile(path.join(rootDir, 'docs/foundations/component-registry.schema.json'), 'utf8'));
  validateAgainstSchema(registry, schema, '$registry');
  return registry;
}

/** The registry exactly as generate:registry writes it. */
export const serializeRegistry = (registry) => `${JSON.stringify(registry, null, 2)}\n`;

async function main() {
  const rootDir = process.cwd();
  const registry = await buildRegistry(rootDir);
  await writeFile(path.join(rootDir, OUTPUT), serializeRegistry(registry), 'utf8');

  const counts = { primitive: 0, atom: 0, molecule: 0, organism: 0 };
  for (const entry of registry) counts[entry.tier] += 1;
  console.log(
    `Generated registry for ${registry.length} components ` +
      `(${counts.primitive} primitives, ${counts.atom} atoms, ${counts.molecule} molecules, ${counts.organism} organisms).`,
  );
}

// Run only as a script, not when the query library imports buildRegistry.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('generate-component-registry failed:', error.message);
    process.exit(1);
  });
}
