import * as React from 'react';
import * as generatedIcons from '../../../assets/icons/generated';
import { AddIcon, SearchIcon } from '../../../assets/icons';
import { Button } from '../../../components/atoms/button';
import type { IconProps } from '../../../components/primitives/icon';
import iconCss from '../../../components/primitives/icon/icon.module.css?raw';
import { TextField } from '../../../components/molecules/text-field';
import { inWords, listOf } from '../../blocks/doc-helpers';
import { DocLink } from '../../blocks/doc-link';
import { Code, doc, DocAnatomy, DocFooter, DocHeader, DocPage, DocSection, DocSubsection } from '../../blocks/doc-page';
import {
  BRAND_MARKS,
  CATEGORIES,
  colorsIn,
  controlHeights,
  fixedSizes,
  gridsOf,
  iconExceptions,
  iconProps,
  icons,
  iconsIn,
  iconUsage,
  iconUsers,
  identicalGlyphs,
  INVERSE_SURFACES,
  LOOK_ALIKES,
  lowestContrast,
  searchIcons,
  sizesIn,
  spaciousBoxIn,
} from './icons-data';
import type { IconCategory, IconEntry } from './icons-data';
import styles from './icons.module.css';

const componentTsx = import.meta.glob('../../../components/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const sourceSvgs = import.meta.glob('../../../assets/icons/source/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const Glyphs = generatedIcons as unknown as Record<string, React.ComponentType<IconProps>>;
const usage = iconUsage(componentTsx);
const users = iconUsers(componentTsx);
const sizes = sizesIn(iconCss);
const md = sizes.find(({ name }) => name === 'md');
const sm = sizes.find(({ name }) => name === 'sm');
const spacious = spaciousBoxIn(iconCss);
const grid = gridsOf(Object.values(sourceSvgs));
const nameOf = (path: string) => path.replace(/\\/g, '/').split('/').pop()!.replace(/\.svg$/, '');
const identical = identicalGlyphs(Object.fromEntries(Object.entries(sourceSvgs).map(([path, svg]) => [nameOf(path), svg])));
const byName = (name: string) => icons.find((icon) => icon.name === name);
const ratio = (value: number) => `${value.toFixed(1)}:1`;

/** Renders a library icon by its kebab-case name. */
function Glyph({ name, ...props }: IconProps & { name: string }) {
  const Component = Glyphs[byName(name)?.component ?? ''];
  return Component ? <Component {...props} /> : null;
}

// Figma's own descriptions of the two categories, from the Icons page.
const CATEGORY_COPY: Record<IconCategory, { title: string; description: string }> = {
  'multi-purpose': {
    title: 'Multi-purpose',
    description: 'For use in a variety of contexts. Named descriptively, after what they show.',
  },
  'single-purpose': {
    title: 'Single-purpose',
    description: 'Reserved for a dedicated meaning and named after their associated function. Before adding one, check whether the concept needs its own icon.',
  },
};

function Structure() {
  return (
    <DocSection number={1} title="How icons are structured">
      <p className={doc.body}>
        Every icon is a glyph from one library: filled, single-color symbols drawn on a {grid.join(' and ')}px grid. In code,
        the SVG files in <Code>assets/icons/source</Code> are the source of truth, and <Code>npm run generate:icons</Code> turns
        each into a component that renders through Icon. In Figma, the same glyphs are on the Icons page. Keep these apart:
      </p>
      <dl className={doc.definitions}>
        <div>
          <dt className={doc.title}>Glyph</dt>
          <dd className={doc.small}>The symbol itself, from the library. Choose it by meaning.</dd>
        </div>
        <div>
          <dt className={doc.title}>Size</dt>
          <dd className={doc.small}>
            {listOf(sizes.map(({ name, px }) => `${name} ${px}px`))}. The size of the glyph, not of the control around it.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Container</dt>
          <dd className={doc.small}>
            The control or slot around the icon: an Icon Button, a Button’s icon slot, a list row. It owns the height and hit area.
          </dd>
        </div>
        <div>
          <dt className={doc.title}>Color</dt>
          <dd className={doc.small}>The surrounding text color by default. A semantic color only when the icon carries meaning.</dd>
        </div>
        <div>
          <dt className={doc.title}>Accessible name</dt>
          <dd className={doc.small}>Lives on the control or in the text beside the icon, not on the icon.</dd>
        </div>
        <div>
          <dt className={doc.title}>Decorative</dt>
          <dd className={doc.small}>The default: hidden from assistive technology, because the text beside it says the same thing.</dd>
        </div>
      </dl>
      <DocAnatomy
        title="Anatomy of an icon name"
        parts={[
          ['status', 'What it shows'],
          ['error', 'Which one'],
        ]}
      >
        The file <Code>status-error.svg</Code> becomes <Code>StatusErrorIcon</Code>. Multi-purpose icons are named for what they
        show; single-purpose icons for the job they’re reserved for.
      </DocAnatomy>
    </DocSection>
  );
}

function IconCell({ icon }: { icon: IconEntry }) {
  const usedBy = usage[icon.component] ?? [];
  return (
    <li className={styles.cell} title={`${icon.component}${usedBy.length ? ` · used in ${usedBy.join(', ')}` : ''}`}>
      <Glyph name={icon.name} />
      <span className={styles.cellName}>{icon.name}</span>
      {usedBy.length > 0 && (
        <>
          <span className={styles.usedMark} aria-hidden="true" />
          <span className={doc.visuallyHidden}>, used in {listOf(usedBy)}</span>
        </>
      )}
    </li>
  );
}

function Library() {
  const [query, setQuery] = React.useState('');
  const matches = searchIcons(query);
  return (
    <DocSection number={2} title="Icon library">
      <p className={doc.body}>
        {icons.length} icons in two groups. Search by name or keyword. A dot marks the {Object.keys(usage).length} icons components
        already use; hover a cell for its component name.
      </p>
      <div className={styles.search}>
        <TextField
          aria-label="Search icons"
          placeholder="Search icons, e.g. arrow or delete"
          iconBefore={<SearchIcon />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <p className={`${doc.small} ${doc.subtle}`} aria-live="polite">
          {query ? `${matches.length} of ${icons.length} icons` : `${icons.length} icons`}
        </p>
      </div>
      {CATEGORIES.map((category) => {
        const inCategory = iconsIn(category).filter((icon) => matches.includes(icon));
        return (
          <DocSubsection key={category} title={`${CATEGORY_COPY[category].title} (${inCategory.length})`}>
            <p className={`${doc.body} ${doc.subtle}`}>{CATEGORY_COPY[category].description}</p>
            {inCategory.length ? (
              <ul className={styles.grid}>
                {inCategory.map((icon) => (
                  <IconCell key={icon.name} icon={icon} />
                ))}
              </ul>
            ) : (
              <p className={`${doc.small} ${doc.subtle}`}>No {CATEGORY_COPY[category].title.toLowerCase()} icons match.</p>
            )}
          </DocSubsection>
        );
      })}
      <DocSubsection title="Same glyph, different job">
        <p className={doc.body}>
          Some glyphs appear under more than one name, because a single-purpose icon reuses a multi-purpose glyph for its own
          meaning. Choose by the job the icon does, not by its shape.
          {identical.length > 0 && (
            <>
              {' '}
              {listOf(identical.map((names) => listOf(names.map((name) => `“${name}”`))))} are the same file twice.
            </>
          )}
        </p>
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.glyphColumn}>
                <span className={doc.visuallyHidden}>Glyph</span>
              </th>
              <th scope="col">Names</th>
            </tr>
          </thead>
          <tbody>
            {[...identical, ...LOOK_ALIKES].map((names) => (
              <tr key={names.join('|')}>
                <td className={styles.glyphColumn}>
                  <Glyph name={names[0]} />
                </td>
                <td>
                  {names.map((name, index) => (
                    <React.Fragment key={name}>
                      {index > 0 && ' · '}
                      <Code>{name}</Code> <span className={doc.subtle}>({byName(name)?.category})</span>
                    </React.Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={doc.body}>
          Brand marks ({listOf(BRAND_MARKS.map((name) => name))}) are icons like any other: one color, taken from the text
          around them.
        </p>
      </DocSubsection>
    </DocSection>
  );
}

function Size() {
  const smComponents = [...new Set(fixedSizes(componentTsx, 'sm').map(({ component }) => component))];
  return (
    <DocSection number={3} title="Size">
      <p className={doc.body}>
        Use <Code>md</Code>, {md?.px}px. It’s the default, and the size in every component at every control size. <Code>sm</Code>,{' '}
        {sm?.px}px, is for dense marks beside small text. {inWords(smComponents.length + 1).replace(/^\w/, (c) => c.toUpperCase())}{' '}
        components use it: Field’s status icon, Inline Edit’s error message, Menu’s clear-search button, Table’s sort arrows, and Link’s external-link icon at the <Code>sm</Code>{' '}
        link size.
      </p>
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col" className={styles.glyphColumn}>
              <span className={doc.visuallyHidden}>Sample</span>
            </th>
            <th scope="col">Token</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map(({ name, token, px }) => (
            <tr key={name}>
              <th scope="row">
                <Code>{name}</Code>
              </th>
              <td className={styles.glyphColumn}>
                <AddIcon size={name as IconProps['size']} />
              </td>
              <td>
                <Code>{token}</Code>
              </td>
              <td className={doc.numbers}>{px}px</td>
            </tr>
          ))}
        </tbody>
      </table>
      <DocSubsection title="Icon size isn’t control size">
        <p className={doc.body}>
          The control sets its height and hit area; the icon stays {md?.px}px and centered. A{' '}
          {controlHeights[0].px}px and a {controlHeights[controlHeights.length - 1].px}px button carry the same icon.
        </p>
        <ul className={styles.controls}>
          {controlHeights.map(({ size, px }) => (
            <li key={size}>
              <Button size={size as 'xs' | 'sm' | 'md' | 'lg'} prominence="secondary" iconBefore={<AddIcon />}>
                Add
              </Button>
              <span className={`${doc.small} ${doc.subtle}`}>
                {px}px control · {md?.px}px icon
              </span>
            </li>
          ))}
        </ul>
      </DocSubsection>
      <DocSubsection title="The spacious box">
        <p className={doc.body}>
          <Code>{'spacing="spacious"'}</Code> centers the icon in a {spacious?.px}px box (<Code>{spacious?.token}</Code>) so it lines
          up with {spacious?.px}px slots, such as a menu row’s leading element or a message’s status icon. It’s a layout box, not a
          hit area.
        </p>
        <ul className={styles.boxes}>
          <li>
            <span className={styles.box} aria-hidden="true">
              <AddIcon />
            </span>
            <span className={`${doc.small} ${doc.subtle}`}>none · {md?.px}px</span>
          </li>
          <li>
            <span className={styles.box} aria-hidden="true">
              <AddIcon spacing="spacious" />
            </span>
            <span className={`${doc.small} ${doc.subtle}`}>
              spacious · {spacious?.px}px
            </span>
          </li>
        </ul>
      </DocSubsection>
      <p className={doc.body}>
        Two components draw glyphs at their own sizes, by design: Icon Tile scales its glyph to two-thirds of the tile, and
        Avatar’s presence and status badges are two-tone glyphs sized with Avatar’s badge tokens.
      </p>
    </DocSection>
  );
}

const COLOR_USE: Record<string, string> = {
  inherit: 'Most icons: inside controls and beside text',
  default: 'A standalone icon that reads as body text',
  subtle: 'Secondary, supporting icons',
  inverse: 'On dark or bold surfaces',
  brand: 'Brand emphasis',
  selected: 'A selected item’s icon',
  success: 'The status-success icon',
  warning: 'The status-warning icon',
  error: 'The status-error icon',
  information: 'The status-information icon',
  disabled: 'A standalone icon in a disabled context',
};

function Color() {
  const colors = colorsIn(iconCss);
  return (
    <DocSection number={4} title="Color">
      <p className={doc.body}>
        An icon takes the color of the text around it, so it follows its control through hover, selection, disabled, and
        inverse. Set <Code>color</Code> only when the icon carries meaning of its own, like a status, or stands alone. Never set
        a raw color or fill. Values are on <DocLink to="Foundations/Color">Color</DocLink>.
      </p>
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">Color</th>
            <th scope="col" className={styles.glyphColumn}>
              <span className={doc.visuallyHidden}>Sample</span>
            </th>
            <th scope="col">Token</th>
            <th scope="col">Lowest contrast, Light · Dark</th>
            <th scope="col">Use for</th>
          </tr>
        </thead>
        <tbody>
          {colors.map(({ name, token }) => {
            const contrast = token && name !== 'disabled' ? lowestContrast(token, name === 'inverse' ? INVERSE_SURFACES : undefined) : undefined;
            return (
              <tr key={name}>
                <th scope="row">
                  <Code>{name}</Code>
                </th>
                <td className={`${styles.glyphColumn} ${name === 'inverse' ? styles.inverseSample : ''}`}>
                  <AddIcon color={name as IconProps['color']} />
                </td>
                <td>{token ? <Code>{token}</Code> : <span className={doc.subtle}>The surrounding text color</span>}</td>
                <td className={doc.numbers}>
                  {contrast ? `${ratio(contrast.Light)} · ${ratio(contrast.Dark)}${name === 'inverse' ? ' on brand bold' : ''}` : name === 'disabled' ? <span className={doc.subtle}>Exempt</span> : <span className={doc.subtle}>Its text’s</span>}
                </td>
                <td className={doc.subtle}>{COLOR_USE[name] ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={doc.body}>
        Icons are graphics, so they need 3:1 against what’s behind them. Every color clears it on the page and raised surfaces in
        both themes, and inverse on the brand bold surface; disabled is exempt.
      </p>
      <DocSubsection title="Status icons">
        <p className={doc.body}>Each status has a glyph and a color; use them together.</p>
        <ul className={styles.statuses}>
          {(['error', 'warning', 'success', 'information'] as const).map((status) => (
            <li key={status}>
              <Glyph name={`status-${status}`} color={status} />
              <Code>{`status-${status}`}</Code>
              <span className={doc.subtle}>
                color=<Code>{status}</Code>
              </span>
            </li>
          ))}
        </ul>
      </DocSubsection>
    </DocSection>
  );
}

const A11Y_CASES: Array<[when: string, what: React.ReactNode, example: string]> = [
  ['Beside visible text', 'Leave it decorative (the default).', '<Button iconBefore={<SaveIcon />}>Save</Button>'],
  ['An icon-only control', 'Use Icon Button with an aria-label. The label also becomes its tooltip.', '<IconButton aria-label="Delete"><DeleteIcon /></IconButton>'],
  ['Alone, and it means something', <>Set <Code>decorative={'{false}'}</Code> and a <Code>title</Code>.</>, '<StatusWarningIcon decorative={false} title="Overdue" />'],
  ['A status', 'Say the status in text too. Banner, Section Message, and Toast read it before the message.', 'Error: Upload failed'],
];

const EXCEPTION_COPY: Record<string, (components: string[]) => React.ReactNode> = {
  'raw-glyph': (c) => <>{listOf(c)} draw a glyph by hand instead of using the library.</>,
  'fixed-color': (c) => <>{listOf(c)} give an icon a fixed color.</>,
  'unnamed-control': (c) => <>{listOf(c)} render an icon-only control with no accessible name.</>,
};

function Exceptions() {
  const exceptions = iconExceptions(componentTsx);
  if (!exceptions.length) return null;
  return (
    <aside className={styles.exceptions} aria-labelledby="icon-exceptions">
      <p id="icon-exceptions" className={doc.eyebrow}>
        Icon exceptions in component source
      </p>
      <ul className={doc.small}>
        {exceptions.map(({ key, components }) => (
          <li key={key}>{EXCEPTION_COPY[key]?.(components) ?? `${listOf(components)}: ${key}`}</li>
        ))}
      </ul>
      <p className={doc.caption}>
        Listed where an icon bypasses the library, its color, or its label. Read from component source; each line disappears once
        it’s fixed.
      </p>
    </aside>
  );
}

function Accessibility() {
  return (
    <DocSection number={5} title="Accessibility">
      <p className={doc.body}>
        Icons are decorative by default: hidden from assistive technology, because the text beside them says the same thing.
        When there’s no text, the meaning moves to the control.
      </p>
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">When the icon is…</th>
            <th scope="col">Do</th>
            <th scope="col">For example</th>
          </tr>
        </thead>
        <tbody>
          {A11Y_CASES.map(([when, what, example]) => (
            <tr key={when}>
              <th scope="row">{when}</th>
              <td>{what}</td>
              <td>
                <Code>{example}</Code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={doc.body}>
        Icon Button warns in development when it has no accessible name. Components with built-in icon-only controls take their
        label as a prop, such as <Code>dismissLabel</Code> or <Code>clearSearchLabel</Code>, so they can be translated. Link reads
        “(opens in a new tab)” after its text when its external-link icon shows.
      </p>
      <Exceptions />
    </DocSection>
  );
}

function UsingIcons() {
  return (
    <DocSection number={6} title="Using icons in code">
      <p className={doc.body}>
        Import icons by name from the library. Pass them to a component’s icon slot, such as <Code>iconBefore</Code>,{' '}
        <Code>iconAfter</Code>, or <Code>elemBefore</Code>, or as Icon Button’s child; the component handles size and color.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`import { DeleteIcon, StatusWarningIcon } from '../../../assets/icons';

<Button iconBefore={<DeleteIcon />}>Delete</Button>

<IconButton aria-label="Delete">
  <DeleteIcon />
</IconButton>

<StatusWarningIcon color="warning" decorative={false} title="Overdue" />`}
        </code>
      </pre>
      <DocSubsection title="Props">
        <p className={doc.body}>Every icon takes the same props.</p>
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {iconProps.map((prop) => (
              <tr key={prop.name}>
                <th scope="row">
                  <Code>{prop.name}</Code>
                </th>
                <td>
                  <Code>{prop.type}</Code>
                </td>
                <td>{prop.default !== undefined ? <Code>{prop.default}</Code> : <span className={doc.subtle}>none</span>}</td>
                <td className={doc.subtle}>{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocSubsection>
    </DocSection>
  );
}

export function Icons() {
  return (
    <DocPage>
      <DocHeader
        title="Icons"
        lede="Icons are small symbols that help people recognize an action, object, or status at a glance. They support text; on their own, they need a label."
        context={`${icons.length} icons · ${grid.join(', ')}px grid · ${sizes.length} sizes · used in ${users.length} components`}
      />
      <Structure />
      <Library />
      <Size />
      <Color />
      <Accessibility />
      <UsingIcons />
      <DocFooter>
        This page reads from the system itself: the icons and their categories from the generated metadata, the grid from the
        source SVGs, sizes and colors from Icon’s CSS and the DTCG source, props from Icon’s contract, and usage and exceptions
        from component source.
      </DocFooter>
    </DocPage>
  );
}
