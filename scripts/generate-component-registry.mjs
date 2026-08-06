import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const componentsDir = path.join(rootDir, 'docs/components');
const schemaPath = path.join(rootDir, 'docs/foundations/component-registry.schema.json');
const outputPath = path.join(componentsDir, 'registry.json');

const TIER_DIRS = ['primitives', 'atoms', 'molecules'];

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

function normalizeComponent({ id, tier, raw, relPath }) {
  const name = raw.name;
  if (!name) throw new Error(`${id}: missing "name"`);

  // Radio documents two components (Radio + RadioGroup) in one file: no top-level
  // anatomy/props, instead nested under `radio`/`radioGroup` keys. Detected structurally
  // (not by component name) so any future multi-component file is handled the same way.
  const isMultiComponent = !('anatomy' in raw) && !('props' in raw) && ('radio' in raw || 'radioGroup' in raw);

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
    anatomy = [];
    props = {};
  } else {
    anatomy = normalizeAnatomy(raw.anatomy, name);
    props = normalizeProps(raw.props, name);
  }

  const entry = {
    id,
    name,
    tier,
    category: raw.category ?? null,
    status: raw.status ?? 'undocumented',
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
  };

  // Skeleton-style free-size components use a singular `sizing` object instead of a `sizes`
  // enum. Detected structurally (has `sizing`, lacks `sizes`) so a future component reusing
  // this pattern is handled automatically, without hardcoding a component name.
  if (raw.sizing && raw.sizes == null) {
    entry.sizingDetail = raw.sizing;
  }

  return entry;
}

// Minimal JSON-Schema-subset interpreter: type, required, properties, items, enum,
// additionalProperties. Enough for this registry's shape; not a general validator. If the
// schema ever needs oneOf/$ref/conditionals, that's the trigger to add a real dependency
// (e.g. ajv) - not before (see docs/foundations/component-registry-governance.json).
function validateAgainstSchema(value, schema, ctxPath = '$') {
  if (schema.type === 'array') {
    if (!Array.isArray(value)) throw new Error(`${ctxPath}: expected array, got ${typeof value}`);
    if (schema.items) value.forEach((item, i) => validateAgainstSchema(item, schema.items, `${ctxPath}[${i}]`));
    return;
  }
  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${ctxPath}: expected object, got ${Array.isArray(value) ? 'array' : typeof value}`);
    }
    for (const key of schema.required ?? []) {
      if (!(key in value)) throw new Error(`${ctxPath}: missing required key "${key}"`);
    }
    for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
      if (key in value) validateAgainstSchema(value[key], propSchema, `${ctxPath}.${key}`);
    }
    if (schema.additionalProperties) {
      for (const [key, v] of Object.entries(value)) {
        if (schema.properties && key in schema.properties) continue;
        validateAgainstSchema(v, schema.additionalProperties, `${ctxPath}.${key}`);
      }
    }
    return;
  }
  if (schema.type && typeof value !== schema.type && value !== null) {
    throw new Error(`${ctxPath}: expected ${schema.type}, got ${typeof value}`);
  }
  if (schema.enum && value !== null && !schema.enum.includes(value)) {
    throw new Error(`${ctxPath}: "${JSON.stringify(value)}" not in enum [${schema.enum.join(', ')}]`);
  }
}

async function main() {
  const registry = [];
  const counts = { primitive: 0, atom: 0, molecule: 0 };

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
      registry.push(normalizeComponent({ id, tier, raw, relPath }));
      counts[tier] += 1;
    }
  }

  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
  validateAgainstSchema(registry, schema, '$registry');

  await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

  console.log(
    `Generated registry for ${registry.length} components ` +
      `(${counts.primitive} primitives, ${counts.atom} atoms, ${counts.molecule} molecules).`,
  );
}

main().catch((error) => {
  console.error('generate-component-registry failed:', error.message);
  process.exit(1);
});
