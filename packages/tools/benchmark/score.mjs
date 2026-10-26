import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { QueryError, REPO_ROOT, getToken } from '../query/index.mjs';

// Scores one benchmark answer against its task's checks (tasks.json), plus the general checks every
// answer gets: components that don't exist, props a component doesn't have, tokens that don't
// exist, primitive tokens, and raw values. Everything is judged from the repo's own files.

export const TASKS = JSON.parse(readFileSync(new URL('./tasks.json', import.meta.url), 'utf8')).tasks;

/** The code in an answer: its fenced blocks, or the whole answer when it has none. */
export function extractCode(answer) {
  const blocks = [...answer.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.length ? blocks.join('\n') : answer;
}

function attrText(attr) {
  if (!attr.initializer) return true;
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  return attr.initializer.expression ? attr.initializer.expression.getText() : attr.initializer.getText();
}

/** The JSX elements in some code, with their attributes, and the PascalCase names it declares. */
export function parseJsx(code) {
  const source = ts.createSourceFile('answer.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = [];
  const declared = new Set();
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attrs = {};
      for (const attr of node.attributes.properties) {
        if (ts.isJsxAttribute(attr)) attrs[attr.name.getText()] = attrText(attr);
      }
      elements.push({ name: node.tagName.getText(), attrs });
    }
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) declared.add(node.name.text);
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) declared.add(node.name.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { elements, declared };
}

const SOURCE = /\.tsx?$/;
const NOT_SOURCE = /\.(test|stories)\.tsx?$/;

let componentsCache;
/**
 * Every PascalCase name the components export (Form, FormSection, RadioGroup, ...), mapped to the
 * props its folder's source declares (`name:` or `name?:`). The registry's props list only some
 * props for some components, so the source is the reference here.
 * @returns {Map<string, Set<string>>}
 */
export function componentProps(root = REPO_ROOT) {
  if (componentsCache) return componentsCache;
  const components = new Map();
  const walk = (dir) => {
    const files = readdirSync(dir, { withFileTypes: true });
    const sources = files.filter((f) => f.isFile() && SOURCE.test(f.name) && !NOT_SOURCE.test(f.name)).map((f) => readFileSync(path.join(dir, f.name), 'utf8'));
    const props = new Set(sources.flatMap((text) => [...text.matchAll(/^\s+(\w+)\??:/gm)].map((m) => m[1])));
    for (const text of sources) {
      const names = [...text.matchAll(/^export (?:const|function|class) ([A-Z]\w*)/gm)].map((m) => m[1]);
      for (const m of text.matchAll(/^export \{([^}]+)\}/gm)) {
        for (const part of m[1].split(',').map((p) => p.trim())) {
          const name = part.split(/\s+as\s+/).pop();
          if (/^[A-Z]/.test(name) && !part.startsWith('type ')) names.push(name);
        }
      }
      for (const name of names) components.set(name, new Set([...(components.get(name) ?? []), ...props]));
    }
    for (const f of files) if (f.isDirectory()) walk(path.join(dir, f.name));
  };
  walk(path.join(root, 'packages/ui/src/components'));
  componentsCache = components;
  return components;
}

/** Every PascalCase name the components export. */
export const systemComponents = (root = REPO_ROOT) => new Set(componentProps(root).keys());

// Attributes any component passes through to its element, so they're never an invented prop.
const PASSTHROUGH = /^(key|ref|id|className|style|children|name|value|defaultValue|checked|defaultChecked|type|placeholder|autoComplete|autoFocus|htmlFor|title|role|tabIndex|hidden|lang|dir|disabled|required|readOnly|form|noValidate|action|method|encType|inputMode|pattern|min|max|step|minLength|maxLength|multiple|accept|rows|cols|href|target|rel|aria-.+|data-.+|on[A-Z]\w*)$/;

function tokenReport(code) {
  const unknown = new Set();
  const primitive = new Set();
  const notInCss = new Set();
  for (const [, name] of code.matchAll(/var\(\s*--([a-z0-9-]+)/g)) {
    try {
      const token = getToken(name);
      if (token.tier === 'primitive') primitive.add(name);
      if (!token.inCss) notInCss.add(name);
    } catch (error) {
      if (!(error instanceof QueryError)) throw error;
      unknown.add(name);
    }
  }
  return { unknown: [...unknown], primitive: [...primitive], notInCss: [...notInCss] };
}

/** Raw colors and lengths written as literals instead of tokens (0 and percentages are fine). */
export function rawValues(code) {
  const css = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/var\([^)]*\)/g, '');
  const found = [
    ...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g),
    ...css.matchAll(/\b(rgba?|hsla?)\(/g),
    ...css.matchAll(/(?<![\w.-])(?!0(px|rem|em)\b)\d*\.?\d+(px|rem|em)\b/g),
  ].map((m) => m[0]);
  return [...new Set(found)];
}

function holds(condition, code, elements) {
  if (condition.code) return new RegExp(condition.code, 'm').test(code);
  return elements.some((el) => el.name === condition.element && Object.entries(condition.has ?? {}).every(([attr, want]) => {
    const got = el.attrs[attr];
    if (got === undefined) return false;
    return want === true || (typeof got === 'string' && new RegExp(want).test(got));
  }));
}

/**
 * Scores an answer for a task id.
 * @returns {{ task, checks: {id, kind, describe, pass}[], passed, total, offSystem: object, offSystemCount, accessibilityMisses }}
 */
export function scoreAnswer(taskId, answer) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) throw new Error(`Unknown task "${taskId}".`);
  const code = extractCode(answer);
  const { elements, declared } = parseJsx(code);

  const checks = task.checks.map((check) => ({
    id: check.id,
    kind: check.kind,
    describe: check.describe,
    // An empty answer passes nothing, not even a check that only forbids.
    pass: Boolean(answer.trim()) && (check.require ?? []).every((c) => holds(c, code, elements)) && !(check.forbid ?? []).some((c) => holds(c, code, elements)),
  }));

  const system = componentProps();
  const pascal = elements.filter((el) => /^[A-Z]/.test(el.name) && !/^(React\.)?Fragment$/.test(el.name) && !declared.has(el.name));
  const inventedComponents = [...new Set(pascal.filter((el) => !system.has(el.name)).map((el) => el.name))];
  const inventedProps = [...new Set(pascal.filter((el) => system.has(el.name)).flatMap((el) => Object.keys(el.attrs)
    .filter((attr) => !system.get(el.name).has(attr) && !PASSTHROUGH.test(attr))
    .map((attr) => `${el.name}.${attr}`)))];
  const tokens = tokenReport(code);
  const offSystem = {
    inventedComponents,
    inventedProps,
    unknownTokens: tokens.unknown,
    primitiveTokens: tokens.primitive,
    tokensNotInCss: tokens.notInCss,
    rawValues: rawValues(code),
  };

  return {
    task: taskId,
    checks,
    passed: checks.filter((c) => c.pass).length,
    total: checks.length,
    offSystem,
    offSystemCount: Object.values(offSystem).reduce((sum, list) => sum + list.length, 0),
    accessibilityMisses: checks.filter((c) => c.kind === 'accessibility' && !c.pass).map((c) => c.id),
  };
}
