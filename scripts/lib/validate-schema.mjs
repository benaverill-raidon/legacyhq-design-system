// Minimal JSON-Schema-subset interpreter: type, required, properties, items, enum,
// additionalProperties. Enough for this repo's generated-registry shapes; not a general
// validator. If a schema ever needs oneOf/$ref/conditionals, that's the trigger to add a real
// dependency (e.g. ajv) - not before (see docs/foundations/component-registry-governance.json).
export function validateAgainstSchema(value, schema, ctxPath = '$') {
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
