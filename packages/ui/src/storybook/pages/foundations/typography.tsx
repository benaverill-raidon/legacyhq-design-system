import * as React from 'react';
import { componentsWith, usersOf } from '../../blocks/component-css';
import { inWords, listOf, titleCase } from '../../blocks/doc-helpers';
import { DocLink } from '../../blocks/doc-link';
import { Code, doc, DocAnatomy, DocFooter, DocHeader, DocPage, DocSection, DocSubsection, UsedBy } from '../../blocks/doc-page';
import {
  componentTypographyTokens,
  displayOnlySizes,
  displayOverlapSizes,
  figmaStyleOf,
  GROUPS,
  groupFace,
  pairedSizes,
  primitiveCount,
  primitiveScale,
  PROPERTIES,
  roles,
  rolesAtSmallestSize,
  rolesIn,
  scale,
  semanticTokenCount,
  smallestSize,
  themed,
  uniformCasing,
  uniformLetterSpacing,
  weightName,
} from './typography-data';
import type { Group, Role } from './typography-data';
import styles from './typography.module.css';

const ascending = (sizes: number[]) => [...sizes].sort((a, b) => a - b).map(String);
const faceOf = (group: Group) => {
  const face = groupFace(group);
  return face ? `${face.family} ${weightName(face.weight)}` : undefined;
};

/** Inline styles that render text with a role's own tokens. */
const roleStyle = (role: Role): React.CSSProperties => ({
  fontFamily: `var(--typography-${role.name}-font-family)`,
  fontSize: `var(--typography-${role.name}-font-size)`,
  fontWeight: `var(--typography-${role.name}-font-weight)`,
  lineHeight: `var(--typography-${role.name}-line-height)`,
  letterSpacing: `var(--typography-${role.name}-letter-spacing)`,
  textTransform: `var(--typography-${role.name}-text-transform)` as React.CSSProperties['textTransform'],
});

const SPECIMENS: Record<Group, string> = {
  display: 'A plan for every generation',
  heading: 'Estate plan for the Morgan family',
  body: 'Review the trust documents and confirm each beneficiary before the next client meeting.',
};

function RoleRow({ role }: { role: Role }) {
  return (
    <li className={styles.roleRow}>
      <p className={styles.specimen} style={roleStyle(role)}>
        {SPECIMENS[role.group]}
      </p>
      <dl className={styles.spec}>
        <div>
          <dt className={doc.eyebrow}>Role</dt>
          <dd>
            <Code>{role.name}</Code>
          </dd>
        </div>
        <div>
          <dt className={doc.eyebrow}>Size / line height</dt>
          <dd className={styles.numbers}>
            {role.fontSize} / {role.lineHeight}px <span className={doc.subtle}>· {(role.lineHeight / role.fontSize).toFixed(2)}</span>
          </dd>
        </div>
        <div>
          <dt className={doc.eyebrow}>Weight</dt>
          <dd>
            {weightName(role.weight)} {role.weight}
          </dd>
        </div>
        {role.paragraphSpacing > 0 && (
          <div>
            <dt className={doc.eyebrow}>Paragraph spacing</dt>
            <dd className={styles.numbers}>{role.paragraphSpacing}px</dd>
          </div>
        )}
        <div>
          <dt className={doc.eyebrow}>Used by</dt>
          <dd>
            <UsedBy users={usersOf(`typography-${role.name}-`)} />
          </dd>
        </div>
      </dl>
    </li>
  );
}

function RoleGroup({ group, children }: { group: Group; children: React.ReactNode }) {
  return (
    <DocSubsection title={titleCase(group)}>
      <p className={doc.body}>{children}</p>
      <ol className={styles.roleList}>
        {rolesIn(group).map((role) => (
          <RoleRow key={role.name} role={role} />
        ))}
      </ol>
    </DocSubsection>
  );
}

function Structure() {
  const { families, sizes, weights, lineHeights, letterSpacings, paragraphSpacings } = primitiveScale;
  const example = roles.find(({ name }) => name === 'heading-sm') ?? roles[0];
  return (
    <DocSection number={1} title="How typography is structured">
      <p className={doc.body}>
        Typography currently uses primitives and semantic roles,{' '}
        {componentTypographyTokens.length
          ? `plus ${componentTypographyTokens.length} component-level typography tokens.`
          : 'with no component-level typography tokens.'}{' '}
        Each role is a bundle of {inWords(PROPERTIES.length)} properties (family, size, weight, line height, letter spacing,
        and paragraph spacing) applied together, so a role reads the same wherever it’s used.
        {themed ? ' Some values change between Light and Dark.' : ' Nothing changes between Light and Dark.'}
      </p>
      <dl className={doc.definitions}>
        <div>
          <dt className={doc.title}>Primitives</dt>
          <dd className={doc.small}>
            {primitiveCount} raw values: {families.length} families · {sizes.length} sizes · {weights.length} weights ·{' '}
            {lineHeights.length} line heights · {letterSpacings.length} letter spacings · {paragraphSpacings.length} paragraph
            spacings
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Semantic roles</dt>
          <dd className={doc.small}>
            {roles.length} roles × {PROPERTIES.length} properties = {semanticTokenCount} tokens:{' '}
            {GROUPS.map((group) => `${rolesIn(group).length} ${group}`).join(' · ')}
          </dd>
        </div>
      </dl>
      <DocAnatomy
        parts={[
          ['typography', 'Category'],
          [example.group, 'Group'],
          [example.size, 'Size'],
          ['font-size', 'Property'],
        ]}
      >
        A role’s tokens share the first three parts; only the property changes. In Figma, the same roles are text styles
        named by group and size, such as <Code>{figmaStyleOf(example)}</Code>.
      </DocAnatomy>
    </DocSection>
  );
}

function TypeRoles() {
  const displayUnused = rolesIn('display').every((role) => !usersOf(`typography-${role.name}-`).length);
  return (
    <DocSection number={2} title="Type roles">
      <p className={doc.body}>
        Each role is rendered below with its own tokens.
        {uniformLetterSpacing === 0 && uniformCasing === 'none' && (
          <>
            {' '}
            Letter spacing and casing are defined in code only: every role’s letter spacing currently resolves to 0, and
            casing is preserved as authored.
          </>
        )}
      </p>
      <RoleGroup group="display">
        Display is the most expressive type in the system, using Merriweather for high-emphasis moments where the product
        needs a more editorial voice. It is intended for occasional large titles or focused experiences, not routine
        application headings.{displayUnused && ' No component uses it yet.'}
      </RoleGroup>
      <RoleGroup group="heading">
        Headings label pages, sections, cards, and dialogs{faceOf('heading') ? `, in ${faceOf('heading')}` : ''}. The smaller
        sizes double as emphasized interface text: button and tab labels use <Code>heading-sm</Code> and{' '}
        <Code>heading-xs</Code>, and badges and field labels use <Code>heading-xxs</Code>.
      </RoleGroup>
      <RoleGroup group="body">
        Running text and most interface copy{faceOf('body') ? `, in ${faceOf('body')}` : ''}. <Code>body-md</Code> is the
        default interface text; <Code>body-sm</Code> is for supporting text such as helper messages and tooltips.
      </RoleGroup>
    </DocSection>
  );
}

function TypeScale() {
  return (
    <DocSection number={3} title="Type scale">
      <p className={doc.body}>
        At {listOf(ascending(pairedSizes))}px, each size has both a heading and a body style, so a label and its content can
        sit at the same size. Display overlaps the heading scale at {listOf(ascending(displayOverlapSizes))}px and extends it to{' '}
        {listOf(ascending(displayOnlySizes))}px.
      </p>
      <table className={styles.scale}>
        <thead>
          <tr>
            <th scope="col">Size</th>
            {GROUPS.map((group) => (
              <th key={group} scope="col">
                {titleCase(group)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scale.map(({ size, byGroup }) => (
            <tr key={size}>
              <th scope="row" className={styles.numbers}>
                {size}px
              </th>
              {GROUPS.map((group) => (
                <td key={group}>
                  {byGroup[group].map((role) => (
                    <span key={role.name} className={styles.scaleCell}>
                      <span className={styles.scaleSample} style={roleStyle(role)} aria-hidden="true">
                        Ag
                      </span>
                      <span className={doc.small}>
                        <Code>{role.name}</Code>{' '}
                        <span className={`${doc.subtle} ${styles.numbers}`}>
                          {role.fontSize}/{role.lineHeight}
                        </span>
                      </span>
                    </span>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </DocSection>
  );
}

function Usage() {
  const truncating = componentsWith('text-overflow: ellipsis');
  return (
    <DocSection number={4} title="Usage">
      <DocSubsection title="Hierarchy">
        <p className={doc.body}>
          Use one page title per screen and step down the heading scale. Choose the HTML heading level from the document’s
          structure, not from size: a card title can be <Code>heading-sm</Code> in an <Code>h3</Code>. Display is for
          occasional large titles and focused experiences, not routine page titles.
        </p>
      </DocSubsection>
      <DocSubsection title="Emphasis">
        <p className={doc.body}>
          In the interface, hierarchy comes from roles: use the role that fits, such as a heading style for a label that needs
          weight, rather than overriding the font weight of body text. In running text, semantic emphasis is still valid where
          the content’s meaning calls for it: <Code>strong</Code> for importance, <Code>em</Code> for stress. The roles
          themselves have no italic or uppercase styles, and casing is preserved as authored; introducing uppercase needs a
          design decision.
        </p>
      </DocSubsection>
      <DocSubsection title="Wrapping and truncation">
        <p className={doc.body}>
          Controls keep their labels on one line. Where space runs out, {listOf(truncating)} truncate with an ellipsis. Label
          never truncates: overflow is a signal to shorten the text. Don’t truncate running text that people need to read.
        </p>
      </DocSubsection>
      <DocSubsection title="Accessibility">
        <p className={doc.body}>
          {smallestSize}px is the smallest size (
          {rolesAtSmallestSize.map((role, index) => (
            <React.Fragment key={role.name}>
              {index > 0 && ' and '}
              <Code>{role.name}</Code>
            </React.Fragment>
          ))}
          ); reserve it for supporting text, not primary content. Sizes are set in pixels, so text scales with browser zoom but
          not with a user’s default font-size setting. Line heights are fixed per role rather than proportional. Contrast for
          text colors is covered on <DocLink to="Foundations/Color">Color</DocLink>.
        </p>
      </DocSubsection>
    </DocSection>
  );
}

function UsingTypography() {
  const examples = ['display-lg', 'heading-sm', 'body-md']
    .map((name) => roles.find((role) => role.name === name))
    .filter((role): role is Role => Boolean(role))
    .map(figmaStyleOf);
  return (
    <DocSection number={5} title="Using typography in code">
      <p className={doc.body}>
        Set every property of a role together, from the same role, and never reference the primitive scale directly. Native
        form controls don’t inherit fonts, so components reset them with <Code>{'font: inherit'}</Code>. In Figma, each
        role is a text style named by group and size (
        {examples.map((name, index) => (
          <React.Fragment key={name}>
            {index > 0 && (index === examples.length - 1 ? ', and ' : ', ')}
            <Code>{name}</Code>
          </React.Fragment>
        ))}
        ) and bound to the Semantic: Typography variables.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`.cardTitle {
  font-family: var(--typography-heading-sm-font-family);
  font-size: var(--typography-heading-sm-font-size);
  font-weight: var(--typography-heading-sm-font-weight);
  line-height: var(--typography-heading-sm-line-height);
  letter-spacing: var(--typography-heading-sm-letter-spacing);
}`}
        </code>
      </pre>
    </DocSection>
  );
}

export function Typography() {
  const { families, sizes, weights } = primitiveScale;
  return (
    <DocPage>
      <DocHeader
        title="Typography"
        lede="Typography tokens define a small set of named text roles (display, heading, and body) so text looks and reads the same wherever it appears."
        context={`${families.length} typefaces · ${roles.length} roles · ${sizes.length} sizes · ${weights.length} weights · ${
          themed ? 'varies by theme' : 'the same in Light and Dark'
        }`}
      />
      <Structure />
      <TypeRoles />
      <TypeScale />
      <Usage />
      <UsingTypography />
      <DocFooter>
        This page reads from the system itself: roles, values, and aliases from the DTCG source and CSS recipes in{' '}
        <Code>packages/ui/src/tokens</Code>, specimens rendered with the live CSS variables, and component usage from
        component CSS.
      </DocFooter>
    </DocPage>
  );
}
