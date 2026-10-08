import * as React from 'react';
import { componentCss, usersOf } from '../../blocks/component-css';
import { componentsUsingToken } from '../../blocks/css-usage';
import { inWords, listOf } from '../../blocks/doc-helpers';
import { DocLink } from '../../blocks/doc-link';
import { Code, doc, DocAnatomy, DocFooter, DocHeader, DocPage, DocSection, DocSubsection, DocTokenTable } from '../../blocks/doc-page';
import { componentShapeTokens, primitiveScale, radiusScale, shapeExceptions, themed, widthScale } from './radius-data';
import type { Exception, ShapeToken } from './radius-data';
import styles from './radius.module.css';

const usersOfToken = (name: string) => componentsUsingToken(name, componentCss);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const radius = (step: string) => radiusScale.find((token) => token.step === step);
const values = (list: number[]) => list.join(', ');

/** A rounded box drawn with the radius token itself. */
function Corner({ token }: { token: ShapeToken }) {
  return <span className={styles.corner} style={{ borderRadius: `var(--${token.name})` }} aria-hidden="true" />;
}

/** A line whose thickness is the border-width token itself, drawn as a real border. */
function Stroke({ token }: { token: ShapeToken }) {
  return <span className={styles.stroke} style={{ borderBlockStartWidth: `var(--${token.name})` }} aria-hidden="true" />;
}

function Structure() {
  const example = radius('lg') ?? radiusScale[0];
  return (
    <DocSection number={1} title="How shape is structured">
      <p className={doc.body}>
        Shape has its own primitive values, separate from the scale spacing and sizing share. Semantic tokens name the radius
        and border-width steps, and components use those directly
        {componentShapeTokens.length ? `, with ${componentShapeTokens.length} component-level shape tokens.` : ': there are no component-level shape tokens.'}{' '}
        A component that needs a different corner at each size switches between semantic steps rather than defining its own.
        {themed ? ' Some values change between Light and Dark.' : ' Nothing changes between Light and Dark.'}
      </p>
      <dl className={doc.definitions}>
        <div>
          <dt className={doc.title}>Primitives</dt>
          <dd className={doc.small}>
            <Code>border-radius-*</Code>: {values(primitiveScale.radius)}px, and <Code>border-width-*</Code>:{' '}
            {values(primitiveScale.width)}px. Raw values with no intent.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Radius</dt>
          <dd className={doc.small}>
            <Code>border-radius-*</Code>: {radiusScale.length} steps. The rounding of corners.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Border width</dt>
          <dd className={doc.small}>
            <Code>border-width-*</Code>: {widthScale.length} steps. The thickness of every stroke.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Component</dt>
          <dd className={doc.small}>
            {componentShapeTokens.length ? `${componentShapeTokens.length} tokens.` : 'None. Components switch between semantic steps.'}
          </dd>
        </div>
      </dl>
      <DocAnatomy
        parts={[
          ['border-radius', 'Family'],
          [example.step, 'Step'],
        ]}
      >
        Border widths follow the same pattern: <Code>border-width-md</Code> is the md step of stroke thickness. In Figma, the
        same tokens are variables in the Semantic: Border collection, such as <Code>{example.figmaName}</Code>.
      </DocAnatomy>
    </DocSection>
  );
}

function RadiusScale() {
  const fixed = radiusScale.filter(({ px }) => px < 999);
  const md = radius('md');
  const mdUsers = md ? usersOfToken(md.name) : [];
  return (
    <DocSection number={2} title="Radius scale">
      <p className={doc.body}>
        {capitalize(inWords(fixed.length))} fixed steps from {fixed[0].px} to {fixed[fixed.length - 1].px}px, plus{' '}
        <Code>full-round</Code> for pills and circles: a radius larger than any element, so its short side becomes a
        semicircle. Each sample is drawn with its token.
        {md && mdUsers.length === 1 && (
          <>
            {' '}
            <Code>md</Code> ({md.px}px) is currently used only by {mdUsers[0]}’s slash-command input; whether to keep it is an
            open design decision.
          </>
        )}
      </p>
      <DocTokenTable
        sampleLabel="Sample"
        sampleClassName={styles.sampleColumn}
        rows={radiusScale.map((token) => ({
          name: token.name,
          sample: <Corner token={token} />,
          value: token.px >= 999 ? `${token.px}px (pill)` : `${token.px}px`,
          figmaName: token.figmaName,
          users: usersOfToken(token.name),
        }))}
      />
    </DocSection>
  );
}

/** Control heights and the radius each size uses, as Button and its siblings do. */
const CONTROL_SIZES: Array<[size: string, height: string, step: string]> = [
  ['xs', 'size-control-xs', 'sm'],
  ['sm', 'size-control-sm', 'lg'],
  ['md', 'size-control-md', 'lg'],
  ['lg', 'size-control-lg', 'xl'],
];

function Applying() {
  return (
    <DocSection number={3} title="Applying radius">
      <p className={doc.body}>
        Choose a radius by what the element is and how big it is. Larger, more enclosing surfaces get larger corners; small
        dense elements get small ones.
      </p>
      <ol className={styles.levels}>
        <li className={styles.level}>
          <div className={styles.levelText}>
            <h3 className={doc.title}>Controls</h3>
            <p>
              The corner steps up with the control’s size: xs controls use <Code>sm</Code>, sm and md use <Code>lg</Code>, and
              lg uses <Code>xl</Code>, so the corner keeps its proportion as the control grows. Button, Icon Button, Toggle
              Button, Link Button, Text Field, and Icon Tile all follow this.
            </p>
          </div>
          <ul className={styles.controls} aria-label="Control sizes and their radius">
            {CONTROL_SIZES.map(([size, height, step]) => (
              <li key={size}>
                <span
                  className={styles.control}
                  style={{ blockSize: `var(--${height})`, borderRadius: `var(--border-radius-${step})` }}
                  aria-hidden="true"
                />
                <span className={doc.small}>
                  {size} · <Code>{step}</Code>
                </span>
              </li>
            ))}
          </ul>
        </li>
        <li className={styles.level}>
          <div className={styles.levelText}>
            <h3 className={doc.title}>Small elements</h3>
            <p>
              Badges, labels, tooltips, and calendar days use <Code>sm</Code>. <Code>xs</Code> is for the smallest targets,
              such as a Link’s focus shape and Checkbox’s box.
            </p>
          </div>
        </li>
        <li className={styles.level}>
          <div className={styles.levelText}>
            <h3 className={doc.title}>Containers and overlays</h3>
            <p>
              Card defaults to <Code>lg</Code> and offers <Code>xl</Code> and <Code>xxl</Code>. Popup is <Code>lg</Code>,
              Section Message and Toast are <Code>xl</Code>, and Modal Dialog is <Code>xxl</Code>.
            </p>
          </div>
        </li>
        <li className={styles.level}>
          <div className={styles.levelText}>
            <h3 className={doc.title}>Round</h3>
            <p>
              <Code>full-round</Code> is for things that are round by nature: avatars, status dots, slider and switch thumbs,
              progress tracks, and chips.
            </p>
          </div>
        </li>
        <li className={styles.level}>
          <div className={styles.levelText}>
            <h3 className={doc.title}>Nested surfaces</h3>
            <p>
              Keep nested corners roughly concentric: the inner radius is about the outer radius minus the space between the
              two edges. Contained Tabs puts <Code>lg</Code> tabs inside an <Code>xl</Code> list with <Code>spacing-xs</Code>{' '}
              of padding.
            </p>
          </div>
          <span className={styles.nested} aria-hidden="true">
            <span />
          </span>
        </li>
      </ol>
    </DocSection>
  );
}

const STROKE_TECHNIQUES: Array<[when: string, use: React.ReactNode, example: string]> = [
  ['It’s there at rest and part of the element’s box', 'A border', 'Text Field’s frame'],
  [
    'It appears or thickens with state, and content must not move',
    <>
      An inset shadow, <Code>calc(var(--border-width-md) - var(--border-width-sm))</Code> thick, inside the resting border
    </>,
    'Text Field and Text Area focus and invalid',
  ],
  ['It sits inside the padding without resizing the element', 'An inset shadow', 'Menu’s and Time Picker’s selected indicators'],
  ['It’s painted over content', 'An inset shadow on an overlay', 'Avatar’s selected ring'],
  ['It rings an element from outside without resizing it', 'An outset shadow, spread only', 'Avatar Group’s separators'],
  ['It shows keyboard focus', 'An outline, through Focus Ring', 'Button, Checkbox'],
  ['It’s a line of its own', 'An element sized with the width token', 'Menu dividers, Tabs’ selected indicator'],
  ['It blurs', 'Not a stroke: that’s elevation', 'Popup and Toast shadows'],
];

const EXCEPTION_COPY: Record<string, (components: string[]) => React.ReactNode> = {
  'raw-radius': (c) => <>{listOf(c)} round corners with a raw length.</>,
  'raw-stroke': (c) => <>{listOf(c)} draw strokes with a raw thickness.</>,
  'primitive-shape': (c) => <>{listOf(c)} use primitive shape tokens directly.</>,
  'other-token-as-radius': (c) => <>{listOf(c)} round corners with a spacing or size token.</>,
  'other-token-as-stroke': (c) => <>{listOf(c)} set stroke widths with a spacing or size token.</>,
  'radius-borrowed': (c) => <>{listOf(c)} use a radius token for something other than a corner.</>,
  'width-borrowed': (c) => <>{listOf(c)} use a border-width token for spacing or type.</>,
};

function Exceptions() {
  const exceptions = shapeExceptions(componentCss);
  if (!exceptions.length) return null;
  return (
    <aside className={styles.exceptions} aria-labelledby="shape-exceptions">
      <p id="shape-exceptions" className={doc.eyebrow}>
        Shape exceptions in component CSS
      </p>
      <ul className={doc.small}>
        {exceptions.map(({ key, components }: Exception) => (
          <li key={key}>{EXCEPTION_COPY[key]?.(components) ?? `${listOf(components)}: ${key}`}</li>
        ))}
      </ul>
      <p className={doc.caption}>
        Listed where shape is missing, misclassified, or borrowed for something else. Read from component CSS; each line
        disappears once it’s fixed.
      </p>
    </aside>
  );
}

function Borders() {
  return (
    <DocSection number={4} title="Borders and strokes">
      <p className={doc.body}>
        Border-width tokens define stroke thickness whatever draws the stroke: a border, an outline, an inset or outset shadow,
        a divider, an indicator, or an SVG stroke. <Code>sm</Code> is the default border. <Code>md</Code> is emphasis: focus
        rings, selected indicators, and focused or invalid fields. <Code>lg</Code> is kept for the strongest marks, the
        selected tab’s indicator and the largest spinner’s stroke. Border colors are on{' '}
        <DocLink to="Foundations/Color">Color</DocLink>.
      </p>
      <DocTokenTable
        sampleLabel="Sample"
        sampleClassName={styles.sampleColumn}
        rows={widthScale.map((token) => ({
          name: token.name,
          sample: <Stroke token={token} />,
          value: `${token.px}px`,
          figmaName: token.figmaName,
          users: usersOfToken(token.name),
        }))}
      />
      <DocSubsection title="Border, shadow, or outline">
        <p className={doc.body}>
          A border is part of the element’s box, so changing its width moves everything inside. Strokes that change with state
          are drawn so they don’t.
        </p>
        <figure className={styles.compare}>
          <div>
            <span className={styles.field}>Estate plan</span>
            <p className={doc.small}>At rest: a 1px border</p>
          </div>
          <div>
            <span className={`${styles.field} ${styles.fieldFocused}`}>Estate plan</span>
            <p className={doc.small}>Focused: the extra pixel is painted inside the border</p>
          </div>
          <figcaption className={doc.caption}>The text sits in the same place in both; the focused edge reads as md.</figcaption>
        </figure>
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">When the stroke…</th>
              <th scope="col">Draw it with</th>
              <th scope="col">For example</th>
            </tr>
          </thead>
          <tbody>
            {STROKE_TECHNIQUES.map(([when, use, example]) => (
              <tr key={when}>
                <td>{when}</td>
                <td>{use}</td>
                <td className={doc.subtle}>{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={doc.body}>
          In Figma, strokes are drawn inside the frame and don’t take up layout space, so a stroke can change between states
          for free. In CSS a border takes space, which is why components draw their state strokes as inset shadows.
        </p>
      </DocSubsection>
      <Exceptions />
    </DocSection>
  );
}

function UsingShape() {
  return (
    <DocSection number={5} title="Using shape in code">
      <p className={doc.body}>
        Use the semantic tokens for both radius and stroke width, never the primitives, and take a stroke’s thickness from a
        border-width token whatever draws it. Stylelint rejects raw radius values; border widths and shadows aren’t checked
        yet, so those rely on review for now.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`.panel {
  border: var(--border-width-sm) solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
}

/* Emphasize the edge without moving content: paint the difference inside the border. */
.panel:focus-within {
  border-color: var(--color-border-focus);
  box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm)) var(--color-border-focus);
}`}
        </code>
      </pre>
    </DocSection>
  );
}

export function Radius() {
  return (
    <DocPage>
      <DocHeader
        title="Radius"
        lede="Radius tokens round the corners of surfaces and controls, and border-width tokens set the thickness of every stroke. Together they give the interface its shape."
        context={`${radiusScale.length} radius steps · ${widthScale.length} border widths · used by ${usersOf('border-radius-', 'border-width-').length} components · ${
          themed ? 'varies by theme' : 'the same in Light and Dark'
        }`}
      />
      <Structure />
      <RadiusScale />
      <Applying />
      <Borders />
      <UsingShape />
      <DocFooter>
        This page reads from the system itself: steps, values, and aliases from the DTCG source in{' '}
        <Code>packages/ui/src/tokens</Code>, samples drawn with the live CSS variables, and usage and exceptions from
        component CSS.
      </DocFooter>
    </DocPage>
  );
}
