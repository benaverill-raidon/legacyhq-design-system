import * as React from 'react';
import { componentCss, usersOf } from '../../blocks/component-css';
import { componentsUsingToken, tokenUses } from '../../blocks/css-usage';
import { componentsMatching, inWords, listOf, titleCase } from '../../blocks/doc-helpers';
import { Code, doc, DocAnatomy, DocFooter, DocHeader, DocPage, DocSection, DocSubsection, DocTokenTable, UsedBy } from '../../blocks/doc-page';
import {
  componentDimensionTokens,
  overlapScale,
  primitiveScale,
  sizeFamilies,
  SPACING_KINDS,
  spacingExceptions,
  spacingScale,
  spacingUsage,
  themed,
} from './spacing-data';
import type { DimensionToken, Exception } from './spacing-data';
import styles from './spacing.module.css';

const uses = tokenUses(componentCss);
const usersOfToken = (name: string) => componentsUsingToken(name, componentCss);
const step = (name: string) => spacingScale.find((token) => token.name === `spacing-${name}`);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const usersOfTokens = (names: string[]) => [...new Set(names.flatMap(usersOfToken))].sort();
/** `singular` for one component, `plural` for several. */
const agree = (components: string[], singular: string, plural: string) => (components.length === 1 ? singular : plural);

/** A square exactly the size of the step, drawn with the token itself. */
function Square({ token }: { token: DimensionToken }) {
  return <span className={styles.square} style={{ inlineSize: `var(--${token.name})`, blockSize: `var(--${token.name})` }} aria-hidden="true" />;
}

function Structure() {
  const { positive, negative } = primitiveScale;
  const sizeCount = sizeFamilies.reduce((sum, family) => sum + family.tokens.length, 0);
  const componentTokenCount = componentDimensionTokens.reduce((sum, { count }) => sum + count, 0);
  return (
    <DocSection number={1} title="How dimensions are structured">
      <p className={doc.body}>
        Every dimension starts as a raw length on one primitive scale. Components never use those lengths directly; they use
        semantic tokens named for what a value does. Spacing is the distance between, inside, or relative to elements; sizing
        is the dimensions of the elements themselves. Corner radius and border width are separate families. Geometry that
        only one component has, such as a switch thumb’s travel, is a component token, which may alias the primitive scale.
      </p>
      <dl className={doc.definitions}>
        <div>
          <dt className={doc.title}>Primitives</dt>
          <dd className={doc.small}>
            <Code>measurement-*</Code>: {positive.length} lengths from {positive[0]} to {positive[positive.length - 1]}px, plus{' '}
            {negative.length} negative lengths. Raw values with no intent.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Spacing</dt>
          <dd className={doc.small}>
            <Code>spacing-*</Code>: {spacingScale.length} steps, and <Code>overlap-*</Code>: {overlapScale.length} negative
            steps. Distance between, inside, or relative to elements.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Sizing</dt>
          <dd className={doc.small}>
            <Code>size-*</Code>: {sizeCount} tokens in {sizeFamilies.length} families. The dimensions of elements.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Component</dt>
          <dd className={doc.small}>
            {componentTokenCount} dimension tokens for {listOf(componentDimensionTokens.map(({ component }) => titleCase(component)))}.
            Geometry only that component has.
          </dd>
        </div>
      </dl>
      <DocAnatomy
        parts={[
          ['spacing', 'Family'],
          ['md', 'Step'],
        ]}
      >
        Size tokens add a role between the two: <Code>size-control-md</Code> is the md step of the control heights. One
        spacing step, <Code>spacing-075</Code>, has a numeric name, like the numeric size scale, where 100 is 8px.
      </DocAnatomy>
    </DocSection>
  );
}

function Scale() {
  const first = spacingScale[0];
  const last = spacingScale[spacingScale.length - 1];
  const usage = spacingUsage(uses, spacingScale.map(({ name }) => name));
  const largeSteps = spacingScale.filter((token) => token.px >= 20);
  const organisms = new Set(componentsMatching(() => true, Object.fromEntries(Object.entries(componentCss).filter(([path]) => path.includes('/organisms/')))).map(titleCase));
  const largeStepUsers = usersOfTokens(largeSteps.map(({ name }) => name));
  const onlyOrganisms = largeStepUsers.length > 0 && largeStepUsers.every((name) => organisms.has(name));
    return (
    <DocSection number={2} title="Spacing scale">
      <p className={doc.body}>
        {capitalize(inWords(spacingScale.length))} steps from {first.px} to {last.px}px, close together at the small end, where a
        2px difference is visible, and further apart as distances grow. Each square is drawn at its step’s size.
      </p>
      <DocTokenTable
        sampleLabel="Size"
        sampleClassName={styles.squareColumn}
        rows={spacingScale.map((token) => ({
          name: token.name,
          sample: <Square token={token} />,
          value: `${token.px}px`,
          figmaName: token.figmaName,
          users: usersOfToken(token.name),
        }))}
      />
      <DocSubsection title="Overlap">
        <p className={doc.body}>
          Overlap is negative spacing, for elements that deliberately stack, like the avatars in an Avatar Group.
        </p>
        <ul className={styles.overlaps}>
          {overlapScale.map((token) => (
            <li key={token.name}>
              <span className={styles.stack} style={{ '--stack-overlap': `var(--${token.name})` } as React.CSSProperties} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={doc.small}>
                <Code>{token.name}</Code> <span className={`${doc.subtle} ${doc.numbers}`}>{token.px}px</span>
              </span>
              <span className={doc.small}>
                <UsedBy users={usersOfToken(token.name)} />
              </span>
            </li>
          ))}
        </ul>
      </DocSubsection>
      <DocSubsection title="How the scale is used">
        <p className={doc.body}>
          How many components use each step, and for what, counted from component CSS. A step set through a component’s own
          variable counts where that variable ends up.
          {onlyOrganisms &&
            ` From ${largeSteps[0].step} (${largeSteps[0].px}px) up, the steps appear only in organisms, where they separate sections and inset large containers.`}
        </p>
        <table className={`${doc.table} ${styles.compact}`}>
          <thead>
            <tr>
              <th scope="col">Step</th>
              {SPACING_KINDS.map((kind) => (
                <th key={kind} scope="col" className={styles.count}>
                  {kind === 'inset' ? 'Layout inset' : titleCase(kind)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usage.map(({ token, byKind }) => (
              <tr key={token}>
                <th scope="row">
                  <Code>{token}</Code>
                </th>
                {SPACING_KINDS.map((kind) => (
                  <td key={kind} className={`${styles.count} ${doc.numbers}`} title={byKind[kind].join(', ') || undefined}>
                    {byKind[kind].length || <span className={doc.subtle}>–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DocSubsection>
    </DocSection>
  );
}

const LEVELS: Array<{ title: string; steps: string[]; children: React.ReactNode }> = [
  {
    title: 'Between related items',
    steps: ['xxs', 'xs', '075', 'sm'],
    children: (
      <>
        Things that read as one unit sit closest: an icon and its label (<Code>075</Code> in Toggle Button), a label and its
        field (<Code>xs</Code> in Field), and the items in a Button Group, Chip Group, or Tag Group (<Code>sm</Code>).
      </>
    ),
  },
  {
    title: 'Inside a component',
    steps: ['sm', 'md', 'lg', '2xl'],
    children: (
      <>
        Padding scales with the component’s size. Button’s inline padding is <Code>sm</Code> at xs and sm, <Code>md</Code> at
        md, and <Code>lg</Code> at lg; its height comes from <Code>size-control-*</Code>, not from vertical padding. Larger
        containers sit further in: Modal Dialog’s content is inset <Code>2xl</Code>.
      </>
    ),
  },
  {
    title: 'Between groups',
    steps: ['md', 'lg'],
    children: (
      <>
        Distinct groups need clear separation: a form’s rows and columns are <Code>lg</Code> apart, and its title and
        description <Code>md</Code>.
      </>
    ),
  },
  {
    title: 'Between sections',
    steps: ['3xl', '4xl'],
    children: (
      <>
        The largest steps separate sections: Form sections are <Code>3xl</Code> apart, and its footer sits <Code>4xl</Code> below
        the last section.
      </>
    ),
  },
];

function Applying() {
  return (
    <DocSection number={3} title="Applying spacing">
      <p className={doc.body}>
        Choose spacing by relationship: the more closely two things are related, the less space between them. A component
        doesn’t add space around itself; the layout that places it sets the gap.
      </p>
      <ol className={styles.levels}>
        {LEVELS.map(({ title, steps, children }) => (
          <li key={title} className={styles.level}>
            <div className={styles.levelText}>
              <h3 className={doc.title}>{title}</h3>
              <p>{children}</p>
            </div>
            <ul className={styles.levelSteps} aria-label={`${title} steps`}>
              {steps.map((name) => {
                const token = step(name);
                return token ? (
                  <li key={name}>
                    <Square token={token} />
                    <span className={`${doc.small} ${doc.numbers}`}>
                      <Code>{name}</Code> {token.px}px
                    </span>
                  </li>
                ) : null;
              })}
            </ul>
          </li>
        ))}
      </ol>
    </DocSection>
  );
}

const DECISIONS: Array<[value: string, use: React.ReactNode, example: React.ReactNode]> = [
  ['Space between, inside, or relative to elements: padding, gaps, margins, layout insets', <Code key="u">spacing-*</Code>, 'xs between a label and its field'],
  ['Elements that deliberately stack', <Code key="u">overlap-*</Code>, 'Avatar Group'],
  ['The height of a control', <Code key="u">size-control-*</Code>, 'Button, Text Field'],
  ['Checkbox and radio geometry', <Code key="u">size-choice-*</Code>, 'Checkbox, Radio'],
  ['Icons and markers', <><Code>size-icon-*</Code> <Code>size-marker-*</Code></>, 'Tag’s 16px icons'],
  ['A component with its own size scale', <><Code>size-avatar-*</Code> <Code>size-logo-*</Code> <Code>size-spinner-*</Code></>, 'Avatar, Logo, Spinner'],
  ['Any other element dimension', <>Numeric <Code>size-*</Code></>, <><Code key="e">size-200</Code> for Badge’s height</>],
  ['Corner radius and border width', <><Code>border-radius-*</Code> <Code>border-width-*</Code></>, 'Separate families'],
  ['Geometry only one component has', 'A component token', 'Switch’s thumb travel'],
  ['Focus-ring offsets, motion travel, shadows', 'Not spacing', 'No shared token yet'],
  ['Layout arithmetic: percentages, centering, calc() of tokens', 'Plain values', 'Inline Edit’s action-row offset'],
];

const EXCEPTION_COPY: Record<string, (exception: Exception) => React.ReactNode> = {
  'primitive-as-spacing': ({ components: c }) => (
    <>
      {listOf(c)} {agree(c, 'spaces', 'space')} elements with a primitive dimension token: the spacing scale is missing that
      step.
    </>
  ),
  'size-as-spacing': ({ components: c }) => <>{listOf(c)} {agree(c, 'spaces', 'space')} elements with a size token.</>,
  'spacing-as-size': ({ components: c }) => <>{listOf(c)} {agree(c, 'sizes', 'size')} an element with a spacing token.</>,
  'spacing-as-focus-offset': ({ components: c, raw = [] }) => (
    <>
      Focus-ring offsets borrow spacing tokens in {listOf(c)}
      {raw.length > 0 && (
        <>
          , and {listOf(raw)} {agree(raw, 'sets', 'set')} a raw length
        </>
      )}
      ; there’s no focus-ring offset token yet.
    </>
  ),
  'spacing-as-motion': ({ components: c }) => <>{listOf(c)} {agree(c, 'moves', 'move')} elements with spacing tokens.</>,
  'spacing-as-stroke': ({ components: c }) => <>{listOf(c)} {agree(c, 'draws', 'draw')} strokes with spacing tokens.</>,
  'spacing-as-shadow': ({ components: c }) => (
    <>
      {listOf(c)} {agree(c, 'builds', 'build')} a shadow from spacing tokens, because the shadow token it refers to doesn’t
      exist yet.
    </>
  ),
  'spacing-as-typography': ({ components: c }) => (
    <>
      {listOf(c)} {agree(c, 'sets', 'set')} a line height or font size with a spacing token.
    </>
  ),
};

function Exceptions() {
  const exceptions = spacingExceptions(componentCss);
  if (!exceptions.length) return null;
  return (
    <aside className={styles.exceptions} aria-labelledby="spacing-exceptions">
      <p id="spacing-exceptions" className={doc.eyebrow}>
        Spacing exceptions in component CSS
      </p>
      <ul className={doc.small}>
        {exceptions.map((exception) => (
          <li key={exception.key}>{EXCEPTION_COPY[exception.key]?.(exception) ?? `${listOf(exception.components)}: ${exception.key}`}</li>
        ))}
      </ul>
      <p className={doc.caption}>
        Listed where spacing is missing, misclassified, or borrowed for something that isn’t spacing. Read from component CSS;
        each line disappears once it’s fixed.
      </p>
    </aside>
  );
}

function SpacingVsSizing() {
  const lg = step('lg');
  const size200 = sizeFamilies.flatMap((family) => family.tokens).find(({ name }) => name === 'size-200');
  return (
    <DocSection number={4} title="Spacing vs. sizing">
      <p className={doc.body}>
        Spacing and sizing share one primitive scale, so many tokens resolve to the same number. Choose the token by what the
        value does, not by the number you need.
      </p>
      {lg && size200 && (
        <figure className={styles.compare}>
          <div>
            <span className={styles.pair} aria-hidden="true">
              <span />
              <span className={styles.space} />
              <span />
            </span>
            <p className={doc.small}>
              <Code>spacing-lg</Code> · {lg.px}px between two elements
            </p>
          </div>
          <div>
            <span className={styles.sized} aria-hidden="true" />
            <p className={doc.small}>
              <Code>size-200</Code> · a {size200.px}px-tall element, like a Badge
            </p>
          </div>
          <figcaption className={doc.caption}>The same {lg.px}px, two different jobs, two different tokens.</figcaption>
        </figure>
      )}
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">The value is…</th>
            <th scope="col">Use</th>
            <th scope="col">For example</th>
          </tr>
        </thead>
        <tbody>
          {DECISIONS.map(([value, use, example]) => (
            <tr key={value}>
              <td>{value}</td>
              <td>{use}</td>
              <td className={doc.subtle}>{example}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={doc.body}>
        Never use <Code>measurement-*</Code> in component CSS. If the right family doesn’t have the value you need, raise it as
        a gap; don’t borrow a primitive, or a token from another family that happens to share the number.
      </p>
      <DocSubsection title="Sizing tokens">
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">Family</th>
              <th scope="col">Values</th>
              <th scope="col">Used by</th>
            </tr>
          </thead>
          <tbody>
            {sizeFamilies.map((family) => {
              const values = family.tokens.map(({ px: value }) => value);
              return (
                <tr key={family.key}>
                  <th scope="row" className={doc.strong}>
                    {family.label}
                  </th>
                  <td className={doc.numbers}>
                    {family.key === 'numeric'
                      ? `${values.length} steps, ${Math.min(...values)}–${Math.max(...values)}px`
                      : `${family.tokens.map(({ step: name, px: value }) => `${name.replace(`${family.key}-`, '')} ${value}`).join(' · ')}`}
                  </td>
                  <td>
                    <UsedBy users={usersOfTokens(family.tokens.map(({ name }) => name))} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DocSubsection>
      <DocSubsection title="Component dimensions">
        <p className={doc.body}>
          A width or height that belongs to one component, like a menu’s width or a slider handle, is a component token in{' '}
          <Code>packages/ui/src/tokens/src/component</Code>. Component tokens may alias the primitive scale when the geometry is
          unique to that component; component CSS may not.
        </p>
      </DocSubsection>
      <Exceptions />
    </DocSection>
  );
}

function UsingSpacing() {
  return (
    <DocSection number={5} title="Using spacing in code">
      <p className={doc.body}>
        Use the semantic token for what the value does. Stylelint rejects raw values in padding, margin, and gap; it doesn’t
        check sizes, offsets, or whether a token is a primitive, so those rely on review for now. In Figma, the same tokens are
        variables in the Semantic: Dimension collection, named with slashes, such as <Code>spacing/sm</Code>.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`.toolbar {
  display: flex;
  gap: var(--spacing-sm);
  padding-block: var(--spacing-xs);
  padding-inline: var(--spacing-md);
}

.toolbarIcon {
  inline-size: var(--size-icon-md);
  block-size: var(--size-icon-md);
}`}
        </code>
      </pre>
    </DocSection>
  );
}

export function Spacing() {
  const first = spacingScale[0];
  const last = spacingScale[spacingScale.length - 1];
  return (
    <DocPage>
      <DocHeader
        title="Spacing"
        lede="Spacing is the distance between, inside, or relative to elements when that distance expresses a layout relationship. Every padding, gap, margin, and layout inset comes from one shared scale."
        context={`${spacingScale.length} steps · ${first.px}–${last.px}px · used by ${usersOf('spacing-').length} components · ${
          themed ? 'varies by theme' : 'the same in Light and Dark'
        }`}
      />
      <Structure />
      <Scale />
      <Applying />
      <SpacingVsSizing />
      <UsingSpacing />
      <DocFooter>
        This page reads from the system itself: steps, values, and aliases from the DTCG source in{' '}
        <Code>packages/ui/src/tokens</Code>, squares and samples drawn with the live CSS variables, and usage and exceptions from component
        CSS.
      </DocFooter>
    </DocPage>
  );
}

