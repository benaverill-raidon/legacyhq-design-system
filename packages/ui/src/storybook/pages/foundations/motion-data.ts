import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import motionSource from '../../../tokens/src/semantic/semantic-motion.json';
import { componentName, displayNames, splitTopLevel, withoutComments } from '../../blocks/css-usage';
import { componentsMatching, titleCase } from '../../blocks/doc-helpers';

// Everything Foundations / Motion shows about the tokens is derived here from the DTCG source: the
// duration and easing primitives and the recipes built from them. The second half reads component
// CSS (passed in, so tests can use files read from disk) for how components move, how they respond
// to reduced motion, and the motion the page lists as exceptions. Guidance is authored on the page;
// motion.test.ts pins its factual claims.

type Entry = { $type?: string; $value?: unknown };
/** A transition composite carries its parts in `$value`; a loop recipe nests them as tokens. */
type RecipeEntry = Entry & { duration?: Entry; timingFunction?: Entry };
type Dimension = { value: number; unit: string };
export type Bezier = [number, number, number, number];

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const motion = (motionSource as unknown as Record<string, Record<string, RecipeEntry>>)['Semantic: Motion'];

const aliasName = (value: unknown) => (typeof value === 'string' ? value.match(/^\{(?:[^.}]+\.)*([^.}]+)\}$/)?.[1] : undefined);
const ms = (value: unknown) => {
  const { value: amount, unit } = value as Dimension;
  return unit === 's' ? amount * 1000 : amount;
};

// --- Primitives -------------------------------------------------------------------------------

export type Duration = { name: string; ms: number };
export type Easing = { name: string; points: Bezier };

/** `duration-*`, shortest first. */
export const durations: Duration[] = Object.entries(primitives)
  .filter(([, entry]) => entry.$type === 'duration')
  .map(([name, entry]) => ({ name, ms: ms(entry.$value) }))
  .sort((a, b) => a.ms - b.ms);

/** `ease-*`, in source order. */
export const easings: Easing[] = Object.entries(primitives)
  .filter(([, entry]) => entry.$type === 'cubicBezier')
  .map(([name, entry]) => ({ name, points: entry.$value as Bezier }));

const LINEAR: Bezier = [0, 0, 1, 1];
export const isLinear = (points: Bezier) => points.every((value, index) => value === LINEAR[index]);

/** Progress at time `t` along a cubic-bezier easing, solved for x so samples are evenly spaced in time. */
const progressAt = ([x1, y1, x2, y2]: Bezier, t: number) => {
  const curve = (a: number, b: number, s: number) => 3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 30; step++) {
    const mid = (low + high) / 2;
    if (curve(x1, x2, mid) < t) low = mid;
    else high = mid;
  }
  return curve(y1, y2, (low + high) / 2);
};

/** The furthest an easing carries progress: above 1 means it overshoots its end. */
export const peakOf = (points: Bezier) => Math.max(...Array.from({ length: 101 }, (_, index) => progressAt(points, index / 100)));
export const overshoots = (points: Bezier) => peakOf(points) > 1.001;

// --- Recipes ----------------------------------------------------------------------------------

export type Recipe = {
  /** CSS name without the leading dashes, e.g. `fade-quick`. */
  name: string;
  /** What it does: `fade`, `move`, `spin`, `pulse`. */
  behavior: string;
  /** `transition` recipes ease a change once; `loop` recipes repeat an animation. */
  kind: 'transition' | 'loop';
  duration: Duration;
  /** The easing primitive it uses, or undefined for a literal curve (pulse-loop's linear). */
  easing: string | undefined;
  points: Bezier;
  delayMs: number;
};

export const recipes: Recipe[] = Object.entries(motion).map(([name, entry]) => {
  const transition = entry.$type === 'transition' ? (entry.$value as { duration: unknown; delay?: unknown; timingFunction: unknown }) : undefined;
  const durationRef = transition ? transition.duration : entry.duration?.$value;
  const easingRef = transition ? transition.timingFunction : entry.timingFunction?.$value;
  const durationName = aliasName(durationRef);
  const easingName = aliasName(easingRef);
  return {
    name,
    behavior: name.split('-')[0],
    kind: transition ? 'transition' : 'loop',
    duration: durations.find((duration) => duration.name === durationName) ?? { name: durationName ?? 'literal', ms: ms(durationRef) },
    easing: easingName,
    points: easingName ? (easings.find((easing) => easing.name === easingName)?.points ?? LINEAR) : (easingRef as Bezier),
    delayMs: transition?.delay ? ms(transition.delay) : 0,
  };
});

/** The recipes that use a primitive, e.g. `duration-fast` -> fade-quick, move-quick. */
export const recipesUsing = (primitive: string) => recipes.filter(({ duration, easing }) => duration.name === primitive || easing === primitive).map(({ name }) => name);

// --- Component CSS ----------------------------------------------------------------------------

export type Rule = {
  component: string;
  selectors: string[];
  declarations: Array<{ property: string; value: string }>;
  /** The reduced-motion block the rule sits in, if any. */
  motionQuery: 'reduce' | 'no-preference' | undefined;
};

const isMotionProperty = (property: string) => /^(transition|animation)(-|$)/.test(property);

/** Every style rule in a stylesheet, with the reduced-motion block it sits in. Keyframe steps are skipped. */
export function rulesIn(css: string, component: string): Rule[] {
  const rules: Rule[] = [];
  const open: string[] = [];
  let text = '';
  for (const char of withoutComments(css)) {
    if (char === '{') {
      open.push(text.trim());
      text = '';
    } else if (char === '}') {
      const head = open.pop() ?? '';
      if (!head.startsWith('@') && !open.some((at) => at.startsWith('@keyframes'))) {
        const query = open.find((at) => at.includes('prefers-reduced-motion'));
        rules.push({
          component,
          selectors: splitTopLevel(head, ','),
          declarations: [...text.matchAll(/([a-z-]+)\s*:\s*([^;]+);?/g)].map(([, property, value]) => ({ property, value: value.trim() })),
          motionQuery: query?.includes('no-preference') ? 'no-preference' : query?.includes('reduce') ? 'reduce' : undefined,
        });
      }
      text = '';
    } else text += char;
  }
  return rules;
}

/** Every rule in component CSS (story-only stylesheets skipped). */
export const rulesOf = (cssByPath: Record<string, string>) =>
  Object.entries(cssByPath).flatMap(([path, css]) => {
    const component = componentName(path);
    return component && !component.endsWith('-stories') ? rulesIn(css, component) : [];
  });

/** Rules that make something move: a transition or an animation, outside a reduce block. */
const moving = (rules: Rule[]) =>
  rules.filter(
    ({ declarations, motionQuery }) =>
      motionQuery !== 'reduce' && declarations.some(({ property, value }) => isMotionProperty(property) && !/^(none|0m?s)$/.test(value)),
  );

/** Display names of components whose CSS transitions or animates anything. */
export const animatedComponents = (cssByPath: Record<string, string>) => displayNames(moving(rulesOf(cssByPath)).map(({ component }) => component));

/** `@keyframes` animations by component, e.g. `{ component: 'Modal Dialog', name: 'modal-panel-in' }`. */
export const keyframesOf = (cssByPath: Record<string, string>) =>
  Object.entries(cssByPath).flatMap(([path, css]) => {
    const component = componentName(path);
    if (!component || component.endsWith('-stories')) return [];
    return [...withoutComments(css).matchAll(/@keyframes\s+([\w-]+)/g)].map(([, name]) => ({ component: titleCase(component), name }));
  });

/**
 * Components with hover styles but no motion at all: their hover feedback is instant. High-frequency,
 * direct feedback such as menu and table rows and inline links.
 */
export const instantHover = (cssByPath: Record<string, string>) =>
  componentsMatching((css) => {
    const plain = withoutComments(css);
    return /:hover/.test(plain) && !/(transition|animation)[\w-]*\s*:/.test(plain);
  }, cssByPath).map(titleCase);

// --- Reduced motion ---------------------------------------------------------------------------

export type Treatment = 'instant' | 'stopped' | 'entrance-instant' | 'allowed-only';

/** How each animated component responds to reduced motion, by treatment. */
export function reducedMotion(cssByPath: Record<string, string>): Array<{ treatment: Treatment; components: string[] }> {
  const rules = rulesOf(cssByPath);
  const where = (test: (rule: Rule) => boolean) => displayNames(rules.filter(test).map(({ component }) => component));
  const sets = (rule: Rule, property: string, value: RegExp) => rule.declarations.some((declaration) => declaration.property === property && value.test(declaration.value));
  const found: Array<{ treatment: Treatment; components: string[] }> = [
    { treatment: 'instant', components: where((rule) => rule.motionQuery === 'reduce' && sets(rule, 'transition-duration', /^0m?s$/)) },
    { treatment: 'stopped', components: where((rule) => rule.motionQuery === 'reduce' && sets(rule, 'animation', /^none$/)) },
    { treatment: 'entrance-instant', components: where((rule) => rule.motionQuery === 'reduce' && sets(rule, 'animation-duration', /^0m?s$/)) },
    { treatment: 'allowed-only', components: where((rule) => rule.motionQuery === 'no-preference' && rule.declarations.some(({ property }) => isMotionProperty(property))) },
  ];
  return found.filter(({ components }) => components.length > 0);
}

/**
 * Components with a moving selector that no reduce block switches off. Selectors must match
 * exactly: a media query adds no specificity, so a more specific moving rule (`.item[data-x]`)
 * would win over a reduce rule for `.item` alone.
 */
function unreduced(rules: Rule[]) {
  const stops = (rule: Rule, kind: 'transition' | 'animation') =>
    rule.declarations.some(({ property, value }) => (property === kind || property === `${kind}-duration`) && /^(none|0m?s)$/.test(value));
  return moving(rules)
    .filter(({ motionQuery }) => motionQuery !== 'no-preference')
    .filter((rule) =>
      (['transition', 'animation'] as const).some(
        (kind) =>
          rule.declarations.some(({ property }) => property.startsWith(kind)) &&
          rule.selectors.some(
            (selector) => !rules.some((other) => other.component === rule.component && other.motionQuery === 'reduce' && other.selectors.includes(selector) && stops(other, kind)),
          ),
      ),
    )
    .map(({ component }) => component);
}

// --- Exceptions -------------------------------------------------------------------------------

// The page shows an exception only when motion is missing, misclassified, or borrowed: a raw duration
// or easing instead of a recipe, a recipe followed by a second timing function (the browser drops the
// whole declaration), motion that reduced motion doesn't switch off, a motion primitive used
// directly, or a reference to a motion token that doesn't exist. A 0ms duration or `none` switches
// motion off, so it isn't a raw timing.

export type Exception = { key: string; components: string[] };

const RAW_EASINGS = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$|^(cubic-bezier|steps)\(/;
const RECIPE = /^var\(\s*--(fade|move|spin|pulse)-[\w-]+\s*(,[^)]*)?\)$/;
const isRawDuration = (part: string) => /^-?(\d*\.)?\d+m?s$/.test(part) && !/^-?0+(\.0+)?m?s$/.test(part);
/** A motion value split into its parts: `opacity var(--x), color 2s` -> opacity, var(--x), color, 2s. */
const partsOf = (value: string) => splitTopLevel(value, ',').flatMap((layer) => splitTopLevel(layer, ' '));

/** Custom properties declared anywhere in these stylesheets. */
export const declaredProperties = (...stylesheets: string[]) =>
  new Set(stylesheets.flatMap((css) => [...css.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name.slice(2))));

/** Where motion is missing, misclassified, or borrowed. `defined` holds every token CSS declares. */
export function motionExceptions(cssByPath: Record<string, string>, defined: Set<string>): Exception[] {
  const rules = rulesOf(cssByPath);
  const declarations = rules.flatMap((rule) =>
    rule.declarations.filter(({ property }) => isMotionProperty(property)).map((declaration) => ({ ...declaration, component: rule.component })),
  );
  const local = declaredProperties(...Object.values(cssByPath));
  const references = rules.flatMap((rule) =>
    rule.declarations.flatMap(({ value }) => [...value.matchAll(/var\(\s*--([\w-]+)/g)].map(([, name]) => ({ component: rule.component, name }))),
  );
  // A recipe followed by another timing function: `var(--fade-quick) ease-out`.
  const doubled = declarations.filter(({ value }) =>
    splitTopLevel(value, ',').some((layer) => {
      const parts = splitTopLevel(layer, ' ');
      return parts.some((part, index) => RECIPE.test(part) && parts.slice(index + 1).some((next) => RAW_EASINGS.test(next)));
    }),
  );
  const raw = declarations.filter(
    (declaration) =>
      !doubled.includes(declaration) &&
      partsOf(declaration.value).some((part) => isRawDuration(part) || RAW_EASINGS.test(part) || /^var\(--[\w-]+\s*,[^)]*\d+m?s/.test(part)),
  );
  const found: Exception[] = [
    { key: 'raw-timing', components: displayNames(raw.map(({ component }) => component)) },
    { key: 'recipe-plus-timing', components: displayNames(doubled.map(({ component }) => component)) },
    { key: 'not-reduced', components: displayNames(unreduced(rules)) },
    { key: 'primitive-motion', components: displayNames(references.filter(({ name }) => /^(duration|ease)-/.test(name)).map(({ component }) => component)) },
    {
      key: 'missing-token',
      components: displayNames(
        references.filter(({ name }) => /^(fade|move|spin|pulse|duration|ease)-/.test(name) && !defined.has(name) && !local.has(name)).map(({ component }) => component),
      ),
    },
  ];
  return found.filter(({ components }) => components.length > 0);
}
