import * as React from 'react';
import { Label } from '../../../components/atoms/label';
import type { LabelTone } from '../../../components/atoms/label';
import { ToggleButton } from '../../../components/atoms/toggle-button';
import { ButtonGroup } from '../../../components/molecules/button-group';
import { breakable, Code, doc, DocFooter, DocHeader, DocPage, DocSection, DocSubsection } from '../../blocks/doc-page';
import {
  accent,
  aliasOf,
  backgroundMatrices,
  bandOf,
  componentColorTokens,
  componentsUsing,
  contrast,
  CONTRAST_SURFACES,
  contrastGaps,
  dataViz,
  MODES,
  palettes,
  primitiveColorNames,
  ratioRange,
  semanticNames,
  surfaces,
  tokensIn,
} from './color-data';
import type { ContrastBand, Matrix, Mode } from './color-data';
import styles from './color.module.css';

// Vite inlines component CSS so usage ("used today by ...") is read from the stylesheets themselves.
const componentCss = import.meta.glob('../../../components/**/*.module.css', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

const titleCase = (value: string) => value.replace(/(^|-)([a-z])/g, (_m, dash, letter) => `${dash ? ' ' : ''}${letter.toUpperCase()}`);
const listOf = (items: string[]) =>
  items.length <= 2 ? items.join(' and ') : `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
const usersOf = (...prefixes: string[]) =>
  [...new Set(prefixes.flatMap((prefix) => componentsUsing(prefix, componentCss)))].sort().map(titleCase);
const ratioText = (ratio: number) => `${ratio.toFixed(2)}:1`;
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const inWords = (count: number) => NUMBER_WORDS[count] ?? String(count);

// --- Theme switch + live values -----------------------------------------------------------------

const ThemeContext = React.createContext<Mode>('Light');

/**
 * A swatch region rendered in the selected theme. Values shown come from the live CSS: the
 * panel reads each token's computed value after it renders in that theme.
 */
function ThemePanel({ names, children }: { names: string[]; children: (value: (name: string) => string) => React.ReactNode }) {
  const theme = React.useContext(ThemeContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const key = names.join('|');
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    setValues(Object.fromEntries(key.split('|').map((name) => [name, style.getPropertyValue(`--${name}`).trim()])));
  }, [theme, key]);
  const value = (name: string) => {
    const raw = values[name] ?? '';
    return raw.startsWith('#') ? raw.toUpperCase() : raw;
  };
  return (
    <div ref={ref} className={styles.panel} data-theme={theme === 'Dark' ? 'dark' : undefined}>
      {children(value)}
    </div>
  );
}

function ThemeSwitch({ theme, onChange }: { theme: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className={styles.switchRow}>
      <span className={doc.eyebrow}>Swatches show</span>
      <ButtonGroup aria-label="Theme for color swatches">
        {MODES.map((mode) => (
          <ToggleButton key={mode} size="sm" isSelected={theme === mode} onClick={() => onChange(mode)}>
            {mode}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </div>
  );
}

function Swatch({ name, label, value, kind = 'fill' }: { name: string; label: string; value: string; kind?: 'fill' | 'text' | 'border' }) {
  const accessibleName = `${label}: ${value || name}`;
  const title = `--${name} ${value}`;
  // `highlight` is the text-selection tint: it sits behind text rather than coloring it.
  const textStyle = name.endsWith('-highlight')
    ? { background: `var(--${name})`, color: 'var(--color-content-default)' }
    : { color: `var(--${name})` };
  const sample =
    kind === 'text' ? (
      <span role="img" aria-label={accessibleName} title={title} className={styles.textSample} style={textStyle}>
        Aa
      </span>
    ) : (
      <span
        role="img"
        aria-label={accessibleName}
        title={title}
        className={kind === 'border' ? styles.borderSample : styles.swatch}
        style={kind === 'border' ? { borderColor: `var(--${name})` } : { background: `var(--${name})` }}
      />
    );
  // Inverse colors are meant for bold fills, so their samples sit on one (neutral bold flips with the theme too).
  return name.includes('-inverse-') ? <span className={styles.onBold}>{sample}</span> : sample;
}

// --- Token tables and matrices --------------------------------------------------------------------

function TokenTable({ names, prefix, kind }: { names: string[]; prefix: string; kind: 'fill' | 'text' | 'border' }) {
  const theme = React.useContext(ThemeContext);
  return (
    <ThemePanel names={names}>
      {(value) => (
        <table className={styles.tokenTable}>
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Sample</th>
              <th scope="col">Value</th>
              <th scope="col">Points to ({theme})</th>
            </tr>
          </thead>
          <tbody>
            {names.map((name) => {
              const role = name.slice(prefix.length) || name;
              return (
                <tr key={name}>
                  <th scope="row">
                    <Code>{breakable(name)}</Code>
                  </th>
                  <td>
                    <Swatch name={name} label={role} value={value(name)} kind={kind} />
                  </td>
                  <td className={styles.value}>{value(name)}</td>
                  <td className={styles.alias}>{breakable(aliasOf(name, theme) ?? '—')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </ThemePanel>
  );
}

function headerGroups(columns: string[]) {
  const groups: Array<{ group: string; span: number }> = [];
  for (const column of columns) {
    const group = column.split('-')[0];
    const last = groups[groups.length - 1];
    if (last?.group === group) last.span += 1;
    else groups.push({ group, span: 1 });
  }
  return groups;
}

const stateOf = (column: string) => column.split('-').slice(1).join('-');

function ExtrasList({ names, value }: { names: string[]; value: (name: string) => string }) {
  if (!names.length) return null;
  return (
    <ul className={styles.extras}>
      {names.map((name) => (
        <li key={name} className={doc.small}>
          <Swatch name={name} label={name} value={value(name)} /> <Code>{breakable(name)}</Code>
          <span className={styles.value}>{value(name)}</span>
        </li>
      ))}
    </ul>
  );
}

function MatrixTable({
  matrix,
  rowHeader,
  rowLabel = titleCase,
  extraColumns = [],
  extras = matrix.extras,
}: {
  matrix: Matrix;
  rowHeader: string;
  rowLabel?: (row: string) => string;
  extraColumns?: Array<{ group: string; columns: Array<{ state: string; name: (row: string) => string | undefined }> }>;
  extras?: string[];
}) {
  const groups = headerGroups(matrix.columns);
  const single = groups.length === 1 && !extraColumns.length;
  const names = [
    ...matrix.rows.flatMap(({ cells }) => Object.values(cells)),
    ...extraColumns.flatMap(({ columns }) => matrix.rows.flatMap(({ row }) => columns.map((column) => column.name(row)))),
    ...extras,
  ].filter((name): name is string => Boolean(name));
  return (
    <ThemePanel names={names}>
      {(value) => (
        <>
          <div className={styles.matrixScroll}>
            <table className={styles.matrix}>
              <thead>
                {!single && (
                  <tr>
                    <td />
                    {groups.map(({ group, span }) => (
                      <th key={group} scope="colgroup" colSpan={span}>
                        {titleCase(group)}
                      </th>
                    ))}
                    {extraColumns.map(({ group, columns }) => (
                      <th key={group} scope="colgroup" colSpan={columns.length}>
                        {group}
                      </th>
                    ))}
                  </tr>
                )}
                <tr>
                  <th scope="col">{rowHeader}</th>
                  {matrix.columns.map((column) => (
                    <th key={column} scope="col">
                      {titleCase(stateOf(column))}
                    </th>
                  ))}
                  {extraColumns.flatMap(({ group, columns }) =>
                    columns.map(({ state }) => (
                      <th key={`${group}-${state}`} scope="col">
                        {state}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map(({ row, cells }) => (
                  <tr key={row}>
                    <th scope="row">{rowLabel(row)}</th>
                    {matrix.columns.map((column) => (
                      <td key={column}>
                        {cells[column] ? (
                          <Swatch name={cells[column]} label={`${rowLabel(row)} ${column.replace('-', ' ')}`} value={value(cells[column])} />
                        ) : null}
                      </td>
                    ))}
                    {extraColumns.flatMap(({ group, columns }) =>
                      columns.map(({ state, name }) => {
                        const token = name(row);
                        return (
                          <td key={`${group}-${state}`}>
                            {token ? (
                              <Swatch
                                name={token}
                                label={`${rowLabel(row)} ${group.toLowerCase()} ${state.toLowerCase()}`}
                                value={value(token)}
                                kind={group === 'Border' ? 'border' : group === 'Content' ? 'text' : 'fill'}
                              />
                            ) : null}
                          </td>
                        );
                      }),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ExtrasList names={extras} value={value} />
        </>
      )}
    </ThemePanel>
  );
}

function BackgroundSubgroup({ title, caption, children }: { title: string; caption: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={styles.subgroup}>
      <h4 className={doc.title}>{title}</h4>
      <p className={`${doc.small} ${styles.subgroupCaption}`}>{caption}</p>
      {children}
    </div>
  );
}

function SimpleSwatches({ names }: { names: string[] }) {
  return (
    <ThemePanel names={names}>
      {(value) => <ExtrasList names={names} value={value} />}
    </ThemePanel>
  );
}

function DataViz() {
  const names = [
    ...dataViz.sequences.flatMap(({ steps }) => steps.map(({ name }) => name)),
    ...dataViz.categorical.flatMap(({ byHue }) => Object.values(byHue)),
    ...dataViz.diverging,
  ];
  return (
    <ThemePanel names={names}>
      {(value) => (
        <div className={styles.dataViz}>
          <div>
            <p className={doc.eyebrow}>Sequential</p>
            {dataViz.sequences.map(({ family, steps }) => (
              <div key={family} className={styles.strip}>
                <span className={`${doc.small} ${styles.stripLabel}`}>{titleCase(family)}</span>
                <span className={styles.stripSwatches}>
                  {steps.map(({ step, name }) => (
                    <Swatch key={name} name={name} label={`${family} ${step}`} value={value(name)} />
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div>
            <p className={doc.eyebrow}>Categorical</p>
            {dataViz.categorical.map(({ emphasis, byHue }) => (
              <div key={emphasis} className={styles.strip}>
                <span className={`${doc.small} ${styles.stripLabel}`}>{titleCase(emphasis)}</span>
                <span className={styles.stripSwatches}>
                  {dataViz.categoricalHues.map((hue) =>
                    byHue[hue] ? <Swatch key={hue} name={byHue[hue]} label={`${emphasis} ${hue}`} value={value(byHue[hue])} /> : null,
                  )}
                </span>
              </div>
            ))}
          </div>
          <div>
            <p className={doc.eyebrow}>Diverging</p>
            <div className={styles.strip}>
              <span className={`${doc.small} ${styles.stripLabel}`}>Negative → positive</span>
              <span className={styles.stripSwatches}>
                {dataViz.diverging.map((name) => (
                  <Swatch key={name} name={name} label={name.replace('color-data-viz-diverging-', '')} value={value(name)} />
                ))}
              </span>
            </div>
          </div>
        </div>
      )}
    </ThemePanel>
  );
}

// --- Sections -----------------------------------------------------------------------------------

function Structure() {
  const families = palettes.families;
  const components = componentColorTokens.map(({ component }) => titleCase(component));
  const componentCount = componentColorTokens.reduce((total, { names }) => total + names.length, 0);
  const anatomy: Array<[string, string]> = [
    ['color', 'Category'],
    ['background', 'Property'],
    ['brand', 'Role'],
    ['primary', 'Variant'],
    ['bold', 'Emphasis'],
    ['default', 'State'],
  ];
  return (
    <DocSection number={1} title="How color is structured">
      <p className={doc.body}>
        Components never pick colors directly. They use semantic tokens that describe a role, and each semantic token points
        to a primitive value in each theme. Light and Dark share the same names; only the primitive behind them changes.
      </p>
      <ol className={styles.tiers}>
        <li className={styles.tier}>
          <p className={doc.eyebrow}>Primitive</p>
          <p className={styles.tierCount}>{primitiveColorNames.length}</p>
          <p className={doc.small}>
            Raw values in {inWords(families.length)} families: {inWords(families.filter(({ brand }) => brand).length)} brand
            palettes and {inWords(families.filter(({ brand }) => !brand).length)} hues. Reference only.
          </p>
        </li>
        <li className={styles.tier}>
          <p className={doc.eyebrow}>Semantic</p>
          <p className={styles.tierCount}>{semanticNames.length}</p>
          <p className={doc.small}>Named roles, per theme. What components use.</p>
        </li>
        <li className={styles.tier}>
          <p className={doc.eyebrow}>Component</p>
          <p className={styles.tierCount}>{componentCount}</p>
          <p className={doc.small}>
            Exceptions for independent control: {listOf(components)}.
          </p>
        </li>
      </ol>
      <div className={styles.anatomy}>
        <p className={doc.eyebrow}>Anatomy of a token name</p>
        <ol className={styles.anatomyParts}>
          {anatomy.map(([part, role]) => (
            <li key={part}>
              <Code>{part}</Code>
              <span className={doc.small}>{role}</span>
            </li>
          ))}
        </ol>
        <p className={doc.caption}>
          Not every token uses every part: <Code>color-content-default</Code> is just a property and a role. States are{' '}
          <Code>default</Code>, <Code>hover</Code>, and <Code>press</Code>; <Code>overlay</Code> tokens are translucent state
          layers placed over another fill.
        </p>
      </div>
    </DocSection>
  );
}

function SemanticColor() {
  const [theme, setTheme] = React.useState<Mode>('Light');
  const accentUsers = usersOf('color-background-accent-', 'color-content-accent-', 'color-border-accent-');
  const vizUsers = usersOf('color-data-viz-');
  return (
    <ThemeContext.Provider value={theme}>
      <DocSection number={2} title="Semantic color">
        <p className={doc.body}>
          These are the colors components use. The switch shows every swatch in this section in Light or Dark; names stay the
          same, values and primitives change.
        </p>
        <ThemeSwitch theme={theme} onChange={setTheme} />

        <DocSubsection title="Content">
          <p className={doc.body}>
            Content colors are for text and icons. <Code>default</Code> is for primary text and <Code>subtle</Code> for
            secondary text and supporting labels. <Code>disabled</Code> marks inactive controls, and <Code>inverse</Code> is
            for text on bold or dark fills. <Code>brand</Code> and <Code>selected</Code> mark brand-led emphasis and the
            current choice. <Code>highlight</Code> is the translucent text-selection tint inside inputs. Status colors (
            <Code>error</Code>, <Code>warning</Code>, <Code>success</Code>, <Code>information</Code>) carry meaning, so always
            pair them with text or an icon; never use color as the only signal. <Code>subtler</Code> is limited to
            non-essential content (see Contrast).
          </p>
          <TokenTable names={tokensIn('content')} prefix="color-content-" kind="text" />
        </DocSubsection>

        <DocSubsection title="Border">
          <p className={doc.body}>
            Border colors separate and outline. <Code>default</Code> divides content and outlines containers;{' '}
            <Code>bold</Code> and <Code>bolder</Code> are for boundaries that must read clearly. <Code>input</Code> outlines
            form fields and outlined controls, and <Code>focus</Code> is reserved for focus indication through the shared
            Focus Ring. Status, brand, and selected borders mirror their content and background counterparts, so a
            component’s edge and fill agree.
          </p>
          <TokenTable names={tokensIn('border')} prefix="color-border-" kind="border" />
        </DocSubsection>

        <DocSubsection title="Background">
          <p className={doc.body}>
            Background colors fill components; page and card backgrounds come from Surfaces. Most roles come in three
            emphasis levels (<Code>subtle</Code>, <Code>default</Code>, <Code>bold</Code>), each with <Code>hover</Code> and{' '}
            <Code>press</Code> states, plus translucent <Code>overlay</Code> tints that layer an interaction state over any
            fill.
          </p>
          <BackgroundSubgroup
            title="Status"
            caption="Error, warning, success, and information fills for messages, badges, and validation. Pair them with the matching content and border colors."
          >
            <MatrixTable matrix={backgroundMatrices.status} rowHeader="Tone" />
          </BackgroundSubgroup>
          <BackgroundSubgroup
            title="Brand"
            caption={
              <>
                Primary (Prussian) is for primary actions and brand-led emphasis; Secondary (Taupe) is the quieter brand fill.
                This subgroup also holds the brand gradients and the modal backdrop (<Code>blanket</Code>).
              </>
            }
          >
            <MatrixTable matrix={backgroundMatrices.brand} rowHeader="Variant" />
          </BackgroundSubgroup>
          <BackgroundSubgroup
            title="Neutral"
            caption="Fills with no particular meaning. Its overlays provide hover and press states across most interactive components."
          >
            <MatrixTable matrix={backgroundMatrices.neutral} rowHeader="Role" />
          </BackgroundSubgroup>
          <BackgroundSubgroup title="Selected" caption="The chosen item in menus, tabs, tables, calendars, and toggles.">
            <MatrixTable matrix={backgroundMatrices.selected} rowHeader="Role" />
          </BackgroundSubgroup>
          <BackgroundSubgroup title="Disabled" caption="Fills for inactive controls, on both standard and inverse backgrounds.">
            <SimpleSwatches names={tokensIn('background-disabled')} />
          </BackgroundSubgroup>
          <BackgroundSubgroup
            title="Autofill"
            caption={`The fill for browser-autofilled fields.${usersOf('color-background-autofill-').length ? '' : ' Not yet used by components.'}`}
          >
            <SimpleSwatches names={tokensIn('background-autofill')} />
          </BackgroundSubgroup>
        </DocSubsection>

        <DocSubsection title="Surfaces">
          <p className={doc.body}>
            Surfaces are the layers a page is built on. <Code>default</Code> is the page itself; <Code>raised</Code> sits above
            it for cards and panels; <Code>sunken</Code> and <Code>deep</Code> recess content into wells and inset regions.
            Each surface has hover and press states for when the whole surface is interactive. Shadows and elevation depth
            will be documented with Elevation.
          </p>
          <MatrixTable matrix={surfaces} rowHeader="Surface" />
        </DocSubsection>

        <DocSubsection title="Accent">
          <p className={doc.body}>
            Accent colors are still semantic tokens, but their meaning is categorical rather than status-oriented: they tell
            items apart, such as a tag’s category, an icon tile, or a visited link, without implying success, warning, or
            error. Each of the {inWords(accent.hues.length)} hues provides background fills at three emphasis levels with interaction
            states, and most also have matching content and border colors.
            {accentUsers.length ? ` Today they’re used by ${listOf(accentUsers)}.` : ''} To signal status, use the status
            colors instead.
          </p>
          <MatrixTable
            matrix={accent.background}
            rowHeader="Hue"
            extras={accent.extras}
            extraColumns={[
              {
                group: 'Content',
                columns: [
                  { state: 'Default', name: (hue) => accent.content(hue, 'default') },
                  { state: 'Bold', name: (hue) => accent.content(hue, 'bold') },
                ],
              },
              { group: 'Border', columns: [{ state: 'Default', name: (hue) => accent.border(hue) }] },
            ]}
          />
        </DocSubsection>

        <DocSubsection title="Data visualization">
          <p className={doc.body}>
            These colors are reserved for charts: {inWords(dataViz.sequences.length)} sequential ramps (
            {listOf(dataViz.sequences.map(({ family }) => titleCase(family)))}) for ordered values, a{' '}
            {inWords(dataViz.categoricalHues.length)}-hue categorical palette at {inWords(dataViz.categorical.length)}{' '}
            emphasis levels for distinct series, and a {inWords(dataViz.diverging.length)}-step diverging scale for values
            above and below a midpoint.{' '}
            {vizUsers.length <= 1
              ? `${vizUsers.length ? `Apart from ${vizUsers[0]}, no` : 'No'} component uses them yet, so they’re shown here in compact form.`
              : `They’re used today by ${listOf(vizUsers)}.`}
          </p>
          <DataViz />
        </DocSubsection>
      </DocSection>
    </ThemeContext.Provider>
  );
}

const bandLabel: Record<ContrastBand, { text: string; tone: LabelTone }> = {
  text: { text: '4.5+', tone: 'success' },
  large: { text: '3–4.5', tone: 'warning' },
  low: { text: 'Under 3', tone: 'error' },
};

const surfaceLabel = (surface: string) => titleCase(surface.replace('color-elevation-surface-', '').replace('-default', ''));

function Contrast() {
  const subtler = MODES.map((mode) => ratioRange('color-content-subtler', mode));
  const subtlerMin = Math.min(...subtler.map(({ min }) => min));
  const subtlerMax = Math.max(...subtler.map(({ max }) => max));
  return (
    <DocSection number={3} title="Contrast">
      <p className={doc.body}>
        Ratios are calculated from the token values for each text color on the three main surfaces, in both themes, using
        the WCAG contrast formula. 4.5:1 is the minimum for body-size text; 3:1 applies to large text and to the graphical
        parts of controls. These results are reported, not yet enforced; thresholds and exceptions will be set on the
        Accessibility page.
      </p>
      <ul className={styles.legend} aria-label="Rating key">
        {(Object.keys(bandLabel) as ContrastBand[]).map((band) => (
          <li key={band} className={doc.small}>
            <Label size="sm" emphasis="subtle" tone={bandLabel[band].tone}>
              {bandLabel[band].text}
            </Label>{' '}
            {band === 'text' ? 'Meets the WCAG minimum for body text' : band === 'large' ? 'Large text and UI graphics only' : 'Below both WCAG minimums'}
          </li>
        ))}
      </ul>
      <div className={styles.matrixScroll}>
        <table className={styles.contrastTable}>
          <thead>
            <tr>
              <td />
              {MODES.map((mode) => (
                <th key={mode} scope="colgroup" colSpan={CONTRAST_SURFACES.length}>
                  {mode}
                </th>
              ))}
            </tr>
            <tr>
              <th scope="col">Text color</th>
              {MODES.flatMap((mode) =>
                CONTRAST_SURFACES.map((surface) => (
                  <th key={`${mode}-${surface}`} scope="col">
                    {surfaceLabel(surface)}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {contrast.map(({ text, byMode }) => (
              <tr key={text}>
                <th scope="row">
                  <Code>{text.replace('color-content-', '')}</Code>
                </th>
                {MODES.flatMap((mode) =>
                  byMode[mode].map(({ surface, ratio }) => {
                    const band = bandLabel[bandOf(ratio)];
                    return (
                      <td key={`${mode}-${surface}`}>
                        <span className={styles.contrastCell}>
                          {/* Only the sample takes the theme; the rating belongs to the (light) page. */}
                          <span
                            className={styles.contrastSample}
                            data-theme={mode === 'Dark' ? 'dark' : undefined}
                            style={{ background: `var(--${surface})`, color: `var(--${text})` }}
                            aria-hidden="true"
                          >
                            Aa
                          </span>
                          <span className={styles.contrastResult}>
                            <span className={styles.contrastRatio}>{ratioText(ratio)}</span>
                            <Label size="sm" emphasis="subtle" tone={band.tone}>
                              {band.text}
                            </Label>
                          </span>
                        </span>
                      </td>
                    );
                  }),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className={styles.notes}>
        <li className={doc.small}>
          <Code>subtler</Code> measures between {subtlerMin.toFixed(1)}:1 and {subtlerMax.toFixed(1)}:1 and is for
          non-essential, highly de-emphasized content only. Don’t use it for body copy, labels, instructions, controls, or
          anything needed to understand or operate the interface.
        </li>
        <li className={doc.small}>
          <Code>disabled</Code> is also below 4.5:1. WCAG doesn’t require contrast for inactive controls, so this applies to
          disabled states only.
        </li>
        <li className={doc.small}>
          {contrastGaps.length ? (
            <>
              Known gaps:{' '}
              {contrastGaps.map(({ text, mode, surface, ratio }, index) => (
                <React.Fragment key={`${text}-${mode}-${surface}`}>
                  {index > 0 && '; '}
                  {mode} <Code>{text.replace('color-content-', '')}</Code> on {surfaceLabel(surface).toLowerCase()} at{' '}
                  {ratioText(ratio)}
                </React.Fragment>
              ))}
              .
            </>
          ) : (
            'No known gaps: every other text color meets 4.5:1 on every surface in both themes.'
          )}
        </li>
      </ul>
    </DocSection>
  );
}

function PrimitivePalettes() {
  const brands = palettes.families.filter(({ brand }) => brand).map(({ family }) => titleCase(family));
  const hues = palettes.families.filter(({ brand }) => !brand);
  return (
    <DocSection number={4} title="Primitive palettes">
      <p className={doc.body}>
        Primitives are the raw palette every semantic color points to: {inWords(brands.length)} brand families (
        {listOf(brands)}) and {inWords(hues.length)} hues, each a solid ramp plus translucent alpha steps. They’re here for
        reference and for designing new semantic roles.
        Components never use them directly, and a test checks that. If no semantic token fits, propose a new semantic role
        rather than reaching for a primitive.
      </p>
      <div className={styles.palettes}>
        {palettes.families.map(({ family, brand, solid, alpha }) => (
          <div key={family} className={styles.palette}>
            <p className={doc.title}>
              {titleCase(family)}
              {brand && <span className={`${doc.small} ${doc.subtle}`}> · brand</span>}
            </p>
            <ol className={styles.ramp}>
              {solid.map(({ step, name }) => (
                <li key={name} title={`--${name}`}>
                  <span className={styles.rampSwatch} style={{ background: `var(--${name})` }} role="img" aria-label={`${family} ${step}`} />
                  <span className={styles.rampStep}>{step}</span>
                </li>
              ))}
            </ol>
            <ol className={styles.alphaRamp} aria-label={`${family} alpha steps`}>
              {alpha.map(({ step, name }) => (
                <li key={name} title={`--${name}`}>
                  <span className={styles.alphaSwatch} style={{ background: `var(--${name})` }} role="img" aria-label={`${family} alpha ${step}`} />
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </DocSection>
  );
}

function UsingColor() {
  return (
    <DocSection number={5} title="Using color in code">
      <p className={doc.body}>
        Reference colors by their CSS custom properties, never by hex. Stylelint rejects raw colors in component CSS, and a
        test rejects primitive color tokens. Light values are defined on <Code>:root</Code>, and Dark applies to everything
        inside <Code>{'[data-theme="dark"]'}</Code>, so a region can switch theme without any change to component code. In Figma,
        the same tokens are variables in the Tokens v1.0.0 library, in the Primitive and Semantic: Color collections, with
        Light and Dark modes.
      </p>
      <pre className={doc.codeBlock}>
        <code>
          {`.notice {
  color: var(--color-content-default);
  background: var(--color-background-information-subtle-default);
  border: var(--border-width-sm) solid var(--color-border-information);
}`}
        </code>
      </pre>
    </DocSection>
  );
}

export function Color() {
  return (
    <DocPage>
      <DocHeader
        title="Color"
        lede="Color tokens give each part of the interface a named role (text, borders, fills, surfaces) that resolves to the right value in Light and Dark."
        context={`${primitiveColorNames.length} primitive colors · ${semanticNames.length} semantic colors per theme · Light and Dark`}
      />
      <Structure />
      <SemanticColor />
      <Contrast />
      <PrimitivePalettes />
      <UsingColor />
      <DocFooter>
        This page reads from the system itself: token names, groups, aliases, and counts from the DTCG source in{' '}
        <Code>packages/ui/src/tokens/src</Code>, swatch values from the live CSS, contrast calculated from the token values,
        and component usage from component CSS.
      </DocFooter>
    </DocPage>
  );
}
