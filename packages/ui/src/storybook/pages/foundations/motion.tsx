import * as React from 'react';
import { Button } from '../../../components/atoms/button';
import { componentCss, usersOf } from '../../blocks/component-css';
import { componentsUsingToken } from '../../blocks/css-usage';
import { inWords, listOf } from '../../blocks/doc-helpers';
import { DocLink } from '../../blocks/doc-link';
import { Code, doc, DocAnatomy, DocFooter, DocHeader, DocPage, DocSection, DocSubsection, UsedBy } from '../../blocks/doc-page';
import {
  animatedComponents,
  declaredProperties,
  durations,
  easings,
  instantHover,
  isLinear,
  keyframesOf,
  motionExceptions,
  overshoots,
  peakOf,
  recipes,
  recipesUsing,
  reducedMotion,
} from './motion-data';
import type { Bezier, Recipe, Treatment } from './motion-data';
import styles from './motion.module.css';

const generatedCss = import.meta.glob('../../../tokens/generated/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const usersOfToken = (name: string) => componentsUsingToken(name, componentCss);
const recipe = (name: string) => recipes.find((entry) => entry.name === name);
const easingLabel = ({ easing, points }: Pick<Recipe, 'easing' | 'points'>) => (easing ? easing.replace(/^ease-/, '') : isLinear(points) ? 'linear' : `cubic-bezier(${points.join(', ')})`);
const animated = animatedComponents(componentCss);
const treatments = reducedMotion(componentCss);
const reducedCount = new Set(treatments.flatMap(({ components }) => components)).size;
const allReduced = reducedCount === animated.length;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** Recipe families: `fade-*` when a behavior has more than one recipe, otherwise the recipe's own name. */
const families = [...new Set(recipes.map(({ behavior }) => behavior))].map((behavior) => {
  const members = recipes.filter((entry) => entry.behavior === behavior);
  return members.length > 1 ? `${behavior}-*` : members[0].name;
});
/** What travels in each component that uses move-quick. */
const MOVING_PARTS: Record<string, string> = {
  Avatar: 'Avatar’s selection ring',
  Slider: 'Slider’s handle',
  Switch: 'Switch’s thumb',
};

/** A demo's recipe, set as a custom property so the demo's CSS plays it with the token itself. */
const demoStyle = (name: string) => ({ '--motion-demo': `var(--${name})` }) as React.CSSProperties;

/** A visual state change, drawn as a fill growing, as Progress Bar's does. */
function FillDemo({ name }: { name: string }) {
  return (
    <span className={styles.track} style={demoStyle(name)} aria-hidden="true">
      <span className={styles.fill} />
    </span>
  );
}

/** Physical movement, drawn as a thumb traveling along a track, as Switch's does. */
function TravelDemo({ name }: { name: string }) {
  return (
    <span className={styles.track} style={demoStyle(name)} aria-hidden="true">
      <span className={styles.travel}>
        <span className={styles.thumb} />
      </span>
    </span>
  );
}

function SpinDemo({ name }: { name: string }) {
  return <span className={styles.spin} style={demoStyle(name)} aria-hidden="true" />;
}

function PulseDemo({ name }: { name: string }) {
  return <span className={styles.pulse} style={demoStyle(name)} aria-hidden="true" />;
}

const DEMOS: Record<string, (props: { name: string }) => React.ReactElement> = { fade: FillDemo, move: TravelDemo, spin: SpinDemo, pulse: PulseDemo };

/** Every curve is drawn on the same scale, tall enough for the furthest overshoot. */
const curveTop = Math.max(1, ...easings.map(({ points }) => peakOf(points)));

/** An easing as a graph of progress over time, drawn from its cubic-bezier points. Dashed lines mark start and end. */
function Curve({ points }: { points: Bezier }) {
  const [x1, y1, x2, y2] = points;
  const y = (progress: number) => (curveTop - progress) * 100;
  return (
    <svg className={styles.curve} viewBox={`-4 -8 108 ${curveTop * 100 + 16}`} aria-hidden="true" focusable="false">
      <path className={styles.curveGuide} d={`M 0 ${y(0)} H 100 M 0 ${y(1)} H 100`} />
      <path className={styles.curveLine} d={`M 0 ${y(0)} C ${x1 * 100} ${y(y1)} ${x2 * 100} ${y(y2)} 100 ${y(1)}`} />
    </svg>
  );
}

function Structure() {
  const keyframes = keyframesOf(componentCss);
  const fadeQuick = recipe('fade-quick');
  const fadeLong = recipe('fade-long');
  return (
    <DocSection number={1} title="How motion is structured">
      <p className={doc.body}>
        Motion is code-only: Figma has no motion variables, so these tokens exist only in the token source and CSS. Durations
        and easings are primitives, and components don’t use them directly. They use recipes, which pair a duration with an
        easing. Anything more, such as keyframes or how far something travels, belongs to the component.
      </p>
      <dl className={doc.definitions}>
        <div>
          <dt className={doc.title}>Durations</dt>
          <dd className={doc.small}>
            <Code>duration-*</Code>: {listOf(durations.map(({ ms }) => String(ms)))}ms. How long motion takes.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Easings</dt>
          <dd className={doc.small}>
            <Code>ease-*</Code>: {listOf(easings.map(({ name }) => name.replace(/^ease-/, '')))}. How speed changes over that time.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Recipes</dt>
          <dd className={doc.small}>
            {families.map((family, index) => (
              <React.Fragment key={family}>
                {index > 0 && (index === families.length - 1 ? ', and ' : ', ')}
                <Code>{family}</Code>
              </React.Fragment>
            ))}
            : {inWords(recipes.length)} recipes. A duration and an easing in one value, used whole in a transition or an
            animation.{recipes.every(({ delayMs }) => delayMs === 0) && ' None has a delay.'}
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Component motion</dt>
          <dd className={doc.small}>
            Keyframes and travel distances, local to the component and timed with a recipe: {inWords(keyframes.length)} keyframe
            animations in {inWords(new Set(keyframes.map(({ component }) => component)).size)} components.
          </dd>
        </div>
      </dl>
      <DocAnatomy
        parts={[
          ['fade', 'Behavior'],
          ['quick', 'Duration'],
        ]}
      >
        <Code>fade-*</Code> uses the standard non-overshooting motion curve for visual state changes. <Code>move-*</Code> uses
        the spring curve for physical movement of an element. <Code>quick</Code> is <Code>{fadeQuick?.duration.name}</Code> (
        {fadeQuick?.duration.ms}ms) and <Code>long</Code> is <Code>{fadeLong?.duration.name}</Code> ({fadeLong?.duration.ms}ms).
        The loops are named for what they do: <Code>spin-loop</Code> and <Code>pulse-loop</Code>.
      </DocAnatomy>
    </DocSection>
  );
}

function Recipes() {
  const [playing, setPlaying] = React.useState(false);
  const fadeQuick = recipe('fade-quick');
  const maxMs = Math.max(...durations.map(({ ms }) => ms));
  const linearRecipes = recipes.filter(({ easing, points }) => !easing && isLinear(points)).map(({ name }) => name);
  return (
    <DocSection number={2} title="Recipes">
      <p className={doc.body}>
        Most motion is <Code>fade-quick</Code>: {fadeQuick?.duration.ms}ms on the standard curve, which never overshoots. Play
        the demos to compare them; each one runs with its own token.
      </p>
      <div className={styles.demos} data-playing={playing ? 'true' : undefined}>
        <div className={styles.controls}>
          <Button size="sm" prominence="secondary" onClick={() => setPlaying((value) => !value)}>
            {playing ? 'Reset' : 'Play'}
          </Button>
          <p className={`${doc.small} ${doc.subtle} ${styles.reducedNote}`}>
            Your system asks for reduced motion, so the demos jump to where they end, as components do.
          </p>
        </div>
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">Recipe</th>
              <th scope="col" className={styles.demoColumn}>
                <span className={doc.visuallyHidden}>Demo</span>
              </th>
              <th scope="col">Duration</th>
              <th scope="col">Easing</th>
              <th scope="col">Used by</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((entry) => {
              const Demo = DEMOS[entry.behavior] ?? FillDemo;
              return (
                <tr key={entry.name}>
                  <th scope="row">
                    <Code>{entry.name}</Code>
                  </th>
                  <td className={styles.demoColumn}>
                    <Demo name={entry.name} />
                  </td>
                  <td className={doc.numbers}>
                    {entry.duration.ms}ms{entry.kind === 'loop' && ', repeating'}
                  </td>
                  <td>{easingLabel(entry)}</td>
                  <td>
                    <UsedBy users={usersOfToken(entry.name)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DocSubsection title="Durations and easings">
        <p className={doc.body}>
          The primitives the recipes are built from. Components never use them directly.
          {linearRecipes.length > 0 && (
            <>
              {' '}
              {listOf(linearRecipes)} {linearRecipes.length === 1 ? 'uses' : 'use'} a linear curve of its own rather than an
              easing primitive.
            </>
          )}
        </p>
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">Duration</th>
              <th scope="col" className={styles.demoColumn}>
                <span className={doc.visuallyHidden}>Length</span>
              </th>
              <th scope="col">Value</th>
              <th scope="col">In recipes</th>
            </tr>
          </thead>
          <tbody>
            {durations.map(({ name, ms }) => (
              <tr key={name}>
                <th scope="row">
                  <Code>{name}</Code>
                </th>
                <td className={styles.demoColumn}>
                  <span className={styles.bar} style={{ inlineSize: `${(ms / maxMs) * 100}%` }} aria-hidden="true" />
                </td>
                <td className={doc.numbers}>{ms}ms</td>
                <td>{listOf(recipesUsing(name))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className={styles.curves}>
          {easings.map(({ name, points }) => (
            <li key={name}>
              <Curve points={points} />
              <p className={doc.small}>
                <Code>{name}</Code>
              </p>
              <p className={`${doc.small} ${doc.subtle} ${doc.numbers}`}>
                cubic-bezier({points.join(', ')})
                <br />
                {overshoots(points) ? `Overshoots to ${Math.round(peakOf(points) * 100)}%, then settles` : 'Never overshoots'}
                <br />
                In {listOf(recipesUsing(name))}
              </p>
            </li>
          ))}
        </ul>
      </DocSubsection>
    </DocSection>
  );
}

function Applying() {
  const hover = instantHover(componentCss);
  const moving = usersOfToken('move-quick');
  return (
    <DocSection number={3} title="Applying motion">
      <ol className={styles.levels}>
        <li>
          <h3 className={doc.title}>State changes</h3>
          <p>
            Hover, press, and selection change color with <Code>fade-quick</Code>, listing only the properties that change.
            Indicators that turn or grow are state changes too: Select’s caret turns, and Progress Bar’s and Progress Tracker’s
            fills grow, with <Code>fade-quick</Code>. Progress never springs.
          </p>
          <p>
            High-frequency, direct hover feedback may be instant. {listOf(hover)} change on hover with no transition, so
            feedback keeps up as the pointer sweeps across rows and links. More prominent state changes use{' '}
            <Code>fade-quick</Code>.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Moving parts</h3>
          <p>
            <Code>move-quick</Code> is for a part of a control that travels: {listOf(moving.map((name) => MOVING_PARTS[name] ?? name))}.
            The spring overshoots slightly before it settles, so the part lands like a physical object.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Overlays</h3>
          <p>
            Overlays enter using <Code>fade-quick</Code>; individual components may add local keyframed choreography, such as
            Modal Dialog’s 8px rise. Popup, and everything built on it, fades in; Modal Dialog’s backdrop fades in while its
            panel fades and rises. Both leave at once. Their shadow is on <DocLink to="Foundations/Elevation">Elevation</DocLink>.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Toasts</h3>
          <p>
            Toast Group uses the long recipes: <Code>move-long</Code> as toasts shift and scale in the stack and as it expands,
            and <Code>fade-long</Code> as toasts appear and leave. A dismissed toast is removed once its fade has finished.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Loading</h3>
          <p>
            <Code>spin-loop</Code> turns Spinner and <Code>pulse-loop</Code> pulses Skeleton for as long as content is loading.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Distance</h3>
          <p>
            How far something travels is the component’s own geometry, not a motion token and not{' '}
            <DocLink to="Foundations/Spacing">Spacing</DocLink>: Switch’s thumb travel is a component token for each size, and
            Modal Dialog’s 8px rise lives in its keyframes.
          </p>
        </li>
      </ol>
    </DocSection>
  );
}

const TREATMENT_COPY: Record<Treatment, [what: string, how: string]> = {
  instant: ['Transitions finish at once', 'transition-duration: 0ms'],
  stopped: ['Loops stop', 'animation: none'],
  'entrance-instant': ['The entrance finishes at once', 'animation-duration: 0ms'],
  'allowed-only': ['The entrance plays only when motion is allowed', '@media (prefers-reduced-motion: no-preference)'],
};

const EXCEPTION_COPY: Record<string, (components: string[]) => React.ReactNode> = {
  'raw-timing': (c) => <>{listOf(c)} write a raw duration or easing instead of a recipe.</>,
  'recipe-plus-timing': (c) => <>{listOf(c)} add a timing function after a recipe, so the browser drops the declaration.</>,
  'not-reduced': (c) => <>{listOf(c)} keep moving when reduced motion is requested.</>,
  'primitive-motion': (c) => <>{listOf(c)} use duration or easing primitives directly.</>,
  'missing-token': (c) => <>{listOf(c)} refer to a motion token that doesn’t exist.</>,
};

function Exceptions() {
  const exceptions = motionExceptions(componentCss, declaredProperties(...Object.values(generatedCss)));
  if (!exceptions.length) return null;
  return (
    <aside className={styles.exceptions} aria-labelledby="motion-exceptions">
      <p id="motion-exceptions" className={doc.eyebrow}>
        Motion exceptions in component CSS
      </p>
      <ul className={doc.small}>
        {exceptions.map(({ key, components }) => (
          <li key={key}>{EXCEPTION_COPY[key]?.(components) ?? `${listOf(components)}: ${key}`}</li>
        ))}
      </ul>
      <p className={doc.caption}>
        Listed where motion is missing, misclassified, or borrowed. Read from component CSS; each line disappears once it’s
        fixed.
      </p>
    </aside>
  );
}

function ReducedMotion() {
  return (
    <DocSection number={4} title="Reduced motion">
      <p className={doc.body}>
        {allReduced
          ? 'Every component that moves responds to '
          : `${capitalize(inWords(reducedCount))} of the ${animated.length} components that move respond to `}
        <Code>prefers-reduced-motion: reduce</Code>. The state still changes, just without the movement: transitions finish at
        once, loops stop, and entrances don’t play. Spinner stops too, showing a still arc, rather than turning slowly.
      </p>
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">Under reduced motion</th>
            <th scope="col">Written as</th>
            <th scope="col">Components</th>
          </tr>
        </thead>
        <tbody>
          {treatments.map(({ treatment, components }) => (
            <tr key={treatment}>
              <td>{TREATMENT_COPY[treatment][0]}</td>
              <td>
                <Code>{TREATMENT_COPY[treatment][1]}</Code>
              </td>
              <td>
                <UsedBy users={components} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={doc.body}>
        Either way of writing it works: switch motion off in a <Code>reduce</Code> block, or add it only in a{' '}
        <Code>no-preference</Code> block. In a <Code>reduce</Code> block, list every selector that adds motion. A media query
        adds no specificity, so a more specific rule elsewhere would keep moving.
      </p>
      <Exceptions />
    </DocSection>
  );
}

function UsingMotion() {
  const slow = durations.find(({ name }) => name === recipe('fade-long')?.duration.name);
  return (
    <DocSection number={5} title="Using motion in code">
      <p className={doc.body}>
        Use a recipe whole, once for each property that changes. A recipe is already a duration and an easing: a timing
        function added after it makes the declaration invalid, and the browser drops it. A timer in JavaScript that waits for
        motion to finish should match the recipe’s duration, as Toast Group’s exit timer matches <Code>{slow?.name}</Code> (
        {slow?.ms}ms). Stylelint doesn’t check motion values yet. Until it does, review catches them, and this page lists any
        it finds in component CSS under Reduced motion.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`.control {
  transition:
    background-color var(--fade-quick),
    border-color var(--fade-quick);
}

/* Choreography stays local, timed with a recipe. */
@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.panel {
  animation: panel-in var(--fade-quick);
}

@media (prefers-reduced-motion: reduce) {
  .control {
    transition-duration: 0ms;
  }

  .panel {
    animation-duration: 0ms;
  }
}`}
        </code>
      </pre>
    </DocSection>
  );
}

export function Motion() {
  return (
    <DocPage>
      <DocHeader
        title="Motion"
        lede="Motion gives feedback and explains change: a control responding, a surface arriving, work in progress. LegacyHQ keeps it short and restrained, and reduces it when people ask for less motion."
        context={`${durations.length} durations · ${easings.length} easings · ${recipes.length} recipes · used by ${
          usersOf('fade-', 'move-', 'spin-', 'pulse-').length
        } components · ${allReduced ? 'reduced in every one' : `reduced in ${reducedCount} of ${animated.length}`}`}
      />
      <Structure />
      <Recipes />
      <Applying />
      <ReducedMotion />
      <UsingMotion />
      <DocFooter>
        This page reads from the system itself: durations, easings, and recipes from the DTCG source in{' '}
        <Code>packages/ui/src/tokens</Code>, demos played with the live CSS variables, and usage, reduced-motion handling, and
        exceptions from component CSS.
      </DocFooter>
    </DocPage>
  );
}
