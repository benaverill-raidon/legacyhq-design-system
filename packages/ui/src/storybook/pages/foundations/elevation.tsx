import * as React from 'react';
import { componentCss, usersOf } from '../../blocks/component-css';
import { componentsUsingToken, declarationsIn, displayNames, kindOf, shadowLayers } from '../../blocks/css-usage';
import { inWords, listOf } from '../../blocks/doc-helpers';
import { DocLink } from '../../blocks/doc-link';
import { Code, doc, DocAnatomy, DocFooter, DocHeader, DocPage, DocSection, DocSubsection, DocTokenTable, UsedBy } from '../../blocks/doc-page';
import {
  composedColors,
  declaredProperties,
  elevationExceptions,
  elevationShadows,
  familiesWithoutRole,
  ringWidth,
  shadowColorFamilies,
  shadowPrimitives,
  surfaces,
  THEMES,
  themed,
} from './elevation-data';
import type { Layer, Surface } from './elevation-data';
import styles from './elevation.module.css';

const generatedCss = import.meta.glob('../../../tokens/generated/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const usersOfToken = (name: string) => componentsUsingToken(name, componentCss);
const overlay = elevationShadows.find(({ role }) => role === 'overlay') ?? elevationShadows[0];
/** Figma's descriptions of the shadow families that have no elevation shadow in code yet. */
const UNUSED_FAMILY_COPY: Record<string, string> = {
  raised: 'raised, for resting cards',
  overflow: 'overflow, for content that scrolls under other content',
};
const SURFACE_LABELS: Record<Surface['role'], string> = { deep: 'Deep', sunken: 'Sunken', default: 'Default', raised: 'Raised' };

/** One layer as CSS, drawn with the same tokens the composite uses. */
const layerCss = (layer: Layer) =>
  [
    layer.inset ? 'inset' : '',
    layer.offsetX,
    layer.offsetY,
    layer.blur,
    /^[a-z]/.test(layer.spread) ? `var(--${layer.spread})` : layer.spread,
    layer.colorToken ? `var(--${layer.colorToken})` : layer.color,
  ]
    .filter(Boolean)
    .join(' ');

/** The page's surfaces from most recessed to floating, drawn with their tokens on the default surface. */
function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  return (
    <figure className={styles.stage} data-theme={theme === 'Dark' ? 'dark' : undefined}>
      <ol className={styles.tiles}>
        {surfaces.map((surface) => (
          <li key={surface.role}>
            <span className={styles.tile} style={{ background: `var(--${surface.name})` }} aria-hidden="true" />
            <span className={doc.small}>{SURFACE_LABELS[surface.role]}</span>
          </li>
        ))}
        <li>
          <span className={styles.tile} style={{ background: 'var(--color-elevation-surface-raised-default)', boxShadow: `var(--${overlay.name})` }} aria-hidden="true" />
          <span className={doc.small}>Overlay</span>
        </li>
      </ol>
      <figcaption className={doc.caption}>{theme}</figcaption>
    </figure>
  );
}

function Structure() {
  const shadowColorCount = shadowColorFamilies.reduce((sum, { tokens }) => sum + tokens.length, 0);
  return (
    <DocSection number={1} title="How elevation is structured">
      <p className={doc.body}>
        Visual depth has two parts. Surface colors set where a region sits within the page: recessed below it, level with
        it, or raised above it. Their values are on <DocLink to="Foundations/Color">Color</DocLink>. An elevation shadow is
        added only to a surface that floats above the interface. Stacking order, which surface paints over which, is set
        separately with z-index and isn’t tokenized yet.
      </p>
      <dl className={doc.definitions}>
        <div>
          <dt className={doc.title}>Surface colors</dt>
          <dd className={doc.small}>
            <Code>color-elevation-surface-*</Code>: {inWords(surfaces.length)} roles ({listOf(surfaces.map(({ role }) => role))}),
            each with default, hover, and press.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Elevation shadows</dt>
          <dd className={doc.small}>
            <Code>elevation-shadow-*</Code>: {listOf(elevationShadows.map(({ role }) => role))}. A shadow composite with Light
            and Dark values.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Shadow colors</dt>
          <dd className={doc.small}>
            <Code>color-elevation-shadow-*</Code>: {shadowColorCount} colors in {inWords(shadowColorFamilies.length)} families.
            The overlay shadow composes {inWords(composedColors.length)} of them; the {listOf(familiesWithoutRole)} families
            aren’t used yet.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Primitives</dt>
          <dd className={doc.small}>
            <Code>shadow-*</Code>: {shadowPrimitives.length} offset, blur, and spread values. No token or component uses them
            yet.
          </dd>
        </div>
      </dl>
      <DocAnatomy
        parts={[
          ['elevation', 'Family'],
          ['shadow', 'Kind'],
          [overlay.role, 'Role'],
        ]}
      >
        The colors a shadow is made of keep their own names, such as <Code>color-elevation-shadow-overlay-spread</Code>; use
        the shadow, not its colors. In Figma, the role is the <Code>{overlay.figmaName.Light}</Code> and{' '}
        <Code>{overlay.figmaName.Dark}</Code> effect styles.
      </DocAnatomy>
    </DocSection>
  );
}

function Scale() {
  return (
    <DocSection number={2} title="Elevation scale">
      <p className={doc.body}>
        From most recessed to floating, each drawn with its token on the page’s default surface. Raised surfaces rest on the
        page and don’t cast a shadow; only a floating surface does.
      </p>
      <div className={styles.stages}>
        {THEMES.map((theme) => (
          <Stage key={theme} theme={theme} />
        ))}
      </div>
      <DocTokenTable
        sampleLabel="Sample"
        sampleClassName={styles.sampleColumn}
        rows={[
          ...surfaces.map((surface) => ({
            name: surface.name,
            sample: <span className={styles.swatch} style={{ background: `var(--${surface.name})` }} aria-hidden="true" />,
            value: `${surface.values.Light} · ${surface.values.Dark}`,
            figmaName: surface.figmaName,
            users: usersOfToken(surface.name),
          })),
          ...elevationShadows.map((shadow) => ({
            name: shadow.name,
            sample: <span className={styles.swatch} style={{ background: 'var(--color-elevation-surface-raised-default)', boxShadow: `var(--${shadow.name})` }} aria-hidden="true" />,
            value: `${shadow.layers.Light.length} layers`,
            figmaName: shadow.figmaName.Light?.replace(/^Light\//, ''),
            users: usersOfToken(shadow.name),
          })),
        ]}
      />
      <DocSubsection title="The overlay shadow, layer by layer">
        <p className={doc.body}>
          Three layers, in order. Colors are what each resolves to in that theme. The inner ring has no blur: it’s a Shape
          stroke, sized with <Code>{ringWidth}</Code>, composed into the elevation recipe so the role matches Figma. It’s
          transparent in both themes today.
        </p>
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">Layer</th>
              <th scope="col" className={styles.sampleColumn}>
                <span className={doc.visuallyHidden}>Sample</span>
              </th>
              <th scope="col">Geometry</th>
              {THEMES.map((theme) => (
                <th key={theme} scope="col">
                  {theme}
                </th>
              ))}
              <th scope="col">Kind</th>
            </tr>
          </thead>
          <tbody>
            {overlay.layers.Light.map((layer, index) => (
              <tr key={index}>
                <th scope="row">{layer.stroke ? 'Inner ring' : layer.offsetY !== '0' ? 'Drop' : 'Perimeter'}</th>
                <td className={styles.sampleColumn}>
                  <span className={styles.swatch} style={{ background: 'var(--color-elevation-surface-raised-default)', boxShadow: layerCss(layer) }} aria-hidden="true" />
                </td>
                <td className={doc.numbers}>
                  <Code>{[layer.inset ? 'inset' : '', layer.offsetX, layer.offsetY, layer.blur, layer.spread].filter(Boolean).join(' ')}</Code>
                </td>
                {THEMES.map((theme) => (
                  <td key={theme}>{overlay.layers[theme][index].color}</td>
                ))}
                <td className={doc.subtle}>{layer.stroke ? 'Stroke (Shape)' : 'Elevation'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocSubsection>
      <DocSubsection title="Defined, not used yet">
        <p className={doc.body}>
          Figma also defines {inWords(familiesWithoutRole.length)} shadows no component uses yet:{' '}
          {familiesWithoutRole.map((family) => UNUSED_FAMILY_COPY[family] ?? family).join('; ')}. Their colors
          exist as tokens, but they have no elevation shadow; one gets added when a component needs it. The {shadowPrimitives.length} <Code>shadow-*</Code>{' '}
          primitives are unused too.
        </p>
      </DocSubsection>
    </DocSection>
  );
}

function Applying() {
  return (
    <DocSection number={3} title="Applying elevation">
      <ol className={styles.levels}>
        <li>
          <h3 className={doc.title}>Resting surfaces</h3>
          <p>
            Cards, panels, inputs, and table bodies are raised and separated from the page by their border. They don’t cast a
            shadow, in Figma or in code.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Recessed regions</h3>
          <p>
            Wells and recessed areas use <Code>sunken</Code> or <Code>deep</Code>: Empty State’s panel is sunken, and Progress
            Bar’s track is deep. Card offers both as surfaces.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Floating surfaces</h3>
          <p>
            Anything that floats above the interface takes the overlay shadow: Popup and everything built on it (Dropdown
            Menu, Select, Date Picker, Time Picker, and Inline Message), Rich Text Area’s slash-command picker, Toast, and
            Modal Dialog. Each keeps its 1px border; the
            shadow doesn’t replace it. Tooltip is the exception: a small, short-lived dark pill whose contrast already
            separates it, so it has no shadow.
          </p>
        </li>
        <li>
          <h3 className={doc.title}>Nested elevation</h3>
          <p>
            An overlay opened from another overlay keeps the same shadow; shadows don’t deepen with nesting. Inside a raised
            surface, inner regions use sunken or default, not another raised layer.
          </p>
        </li>
      </ol>
    </DocSection>
  );
}

const EXCEPTION_COPY: Record<string, (components: string[]) => React.ReactNode> = {
  'raw-blurred': (c) => <>{listOf(c)} draw a blurred shadow with raw lengths instead of an elevation shadow.</>,
  'missing-token': (c) => <>{listOf(c)} refer to an elevation token that doesn’t exist.</>,
  'rebuilt-role': (c) => <>{listOf(c)} rebuild a shadow from the shadow colors instead of using the elevation shadow.</>,
  'primitive-shadow': (c) => <>{listOf(c)} use shadow primitives directly.</>,
  'borrowed-geometry': (c) => <>{listOf(c)} borrow spacing or size tokens for a shadow’s offset or blur.</>,
};

function Exceptions() {
  const exceptions = elevationExceptions(componentCss, declaredProperties(...Object.values(generatedCss)));
  if (!exceptions.length) return null;
  return (
    <aside className={styles.exceptions} aria-labelledby="elevation-exceptions">
      <p id="elevation-exceptions" className={doc.eyebrow}>
        Elevation exceptions in component CSS
      </p>
      <ul className={doc.small}>
        {exceptions.map(({ key, components }) => (
          <li key={key}>{EXCEPTION_COPY[key]?.(components) ?? `${listOf(components)}: ${key}`}</li>
        ))}
      </ul>
      <p className={doc.caption}>
        Listed where elevation is missing, misclassified, or borrowed. Read from component CSS; each line disappears once
        it’s fixed.
      </p>
    </aside>
  );
}

function ShadowsVsStrokes() {
  const shadows = declarationsIn(componentCss)
    .filter(({ property }) => kindOf(property) === 'shadow')
    .map(({ component, value }) => ({ component, layers: shadowLayers(value) }));
  const elevationUsers = displayNames(
    shadows.filter(({ layers }) => layers.some((layer) => layer.blurred || layer.references.some((name) => name.startsWith('elevation-shadow-')))).map(({ component }) => component),
  );
  const strokeUsers = displayNames(
    shadows
      .filter(({ layers }) => layers.some((layer) => !layer.blurred && layer.lengths.some((length) => !/^-?0(px)?$/.test(length))))
      .map(({ component }) => component),
  );
  return (
    <DocSection number={4} title="Shadows vs. strokes">
      <p className={doc.body}>
        Blur is the difference. A blurred layer is elevation. An unblurred offset or spread draws a stroke, which belongs to
        Shape and takes its thickness from a border-width token; see <DocLink to="Foundations/Radius">Radius</DocLink>.
        Elevation can compose a Shape stroke into its recipe, as the overlay’s inner ring does, but a standalone ring is still
        Shape.
      </p>
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">In component CSS</th>
            <th scope="col">Belongs to</th>
            <th scope="col">Used by</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Blurred shadows, through an elevation shadow</td>
            <td>Elevation</td>
            <td>
              <UsedBy users={elevationUsers} />
            </td>
          </tr>
          <tr>
            <td>Unblurred rings and edges drawn as shadows</td>
            <td>Shape</td>
            <td>
              <UsedBy users={strokeUsers} />
            </td>
          </tr>
        </tbody>
      </table>
      <Exceptions />
    </DocSection>
  );
}

function UsingElevation() {
  return (
    <DocSection number={5} title="Using elevation in code">
      <p className={doc.body}>
        Use the elevation shadow, not its colors: a shadow rebuilt from <Code>color-elevation-shadow-*</Code> drifts from the
        role. A floating surface keeps its border, with the shadow outside it. The shadow resolves per theme, so it follows{' '}
        <Code>{'data-theme'}</Code>; popups and dialogs render at the end of the page, so set the theme on the root element for
        them to pick it up.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`.panel {
  background: var(--color-elevation-surface-raised-default);
  border: var(--border-width-sm) solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--elevation-shadow-overlay);
}`}
        </code>
      </pre>
    </DocSection>
  );
}

export function Elevation() {
  return (
    <DocPage>
      <DocHeader
        title="Elevation"
        lede="Surface color expresses depth within the page; an elevation shadow indicates that a surface floats above the interface."
        context={`${surfaces.length} surface roles · ${elevationShadows.length} elevation shadow · used by ${
          usersOf('color-elevation-surface-', 'elevation-shadow-').length
        } components · ${themed ? 'differs in Light and Dark' : 'the same in Light and Dark'}`}
      />
      <Structure />
      <Scale />
      <Applying />
      <ShadowsVsStrokes />
      <UsingElevation />
      <DocFooter>
        This page reads from the system itself: surfaces, shadow layers, and colors from the DTCG source in{' '}
        <Code>packages/ui/src/tokens</Code>, samples drawn with the live CSS variables in each theme, and usage and exceptions
        from component CSS.
      </DocFooter>
    </DocPage>
  );
}

