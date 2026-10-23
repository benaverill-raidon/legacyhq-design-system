import * as React from 'react';
import { Story } from '@storybook/addon-docs/blocks';
import { CheckIcon, CloseIcon } from '../../assets/icons';
import { componentCss } from './component-css';
import { headerFacts, placePins, propRows, registryEntry, rootClassOf, tokenRows, TOKEN_FAMILIES } from './component-page-data';
import type { ComponentPageSection, DocgenInfo, PinBox, PropRow } from './component-page-data';
import { DocLink } from './doc-link';
import { breakable, Code, doc, DocHeader, DocPage, DocSubsection } from './doc-page';
import { codeParts, ISSUE_KINDS, statusEntries, statusLabel } from './status-data';
import type { KnownIssue } from './status-data';
import styles from './component-page.module.css';

// The component Docs page standard: blocks a component's MDX page is written with, inside
// addon-docs <Unstyled>. Prose stays in the MDX; facts come from the code - the props from the
// TypeScript types (Storybook's docgen), the tokens from the component's CSS, the header from
// registry.json. Sections are numbered by CSS in the order the page lists them.

/** The page wrapper. */
export function ComponentPage({ children }: { children: React.ReactNode }) {
  return (
    <DocPage>
      <div className={styles.page}>{children}</div>
    </DocPage>
  );
}

/** `IconButton` -> `Icon Button`. */
const displayName = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2');

/** A known issue's summary, with its `code` set as code. */
export function IssueText({ summary }: { summary: string }) {
  return (
    <>
      {codeParts(summary).map(({ part, code }, index) => (code ? <Code key={index}>{part}</Code> : <React.Fragment key={index}>{part}</React.Fragment>))}
    </>
  );
}

/** A component's known issues, each with its kind. */
export function KnownIssues({ issues }: { issues: KnownIssue[] }) {
  return (
    <ul className={styles.issues}>
      {issues.map(({ kind, summary }) => (
        <li key={summary}>
          <span className={styles.issueKind}>{ISSUE_KINDS[kind]}</span> <IssueText summary={summary} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Name, the summary (children), the facts line with the status (a link to what it means), the
 * known issues that hold the component below Stable, and a live example.
 */
export function ComponentHeader({ id, example, children }: { id: string; example?: React.ReactNode; children: React.ReactNode }) {
  const entry = registryEntry(id);
  const { status, knownIssues } = statusEntries.find((candidate) => candidate.id === id) ?? { status: '', knownIssues: [] };
  const [group, tier, ...rest] = headerFacts(entry);
  const context = (
    <>
      {group} · {tier} ·{' '}
      <DocLink size="sm" to="Introduction/Status">
        {statusLabel(status)}
      </DocLink>
      {rest.map((fact) => ` · ${fact}`)}
    </>
  );
  return (
    <div className={styles.header}>
      <DocHeader title={displayName(entry.name)} lede={children} context={context} />
      {knownIssues.length > 0 && (
        <details className={styles.knownIssues}>
          <summary>
            {knownIssues.length} known {knownIssues.length === 1 ? 'issue' : 'issues'}
          </summary>
          <KnownIssues issues={knownIssues} />
        </details>
      )}
      {example && <div className={`${styles.stage} ${styles.headerStage}`}>{example}</div>}
    </div>
  );
}

/** One numbered section; `title` is one of COMPONENT_PAGE_SECTIONS, which the page test checks. */
export function Section({ title, children }: { title: ComponentPageSection; children: React.ReactNode }) {
  return <NumberedSection title={title}>{children}</NumberedSection>;
}

/** A numbered section with any title, for other page standards built on this one (patterns). */
export function NumberedSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `section-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <section className={`${doc.section} ${styles.section}`} aria-labelledby={id}>
      <h2 id={id} className={doc.h2}>
        <span className={`${doc.sectionNumber} ${styles.sectionNumber}`} />
        {title}
      </h2>
      <div className={styles.prose}>{children}</div>
    </section>
  );
}

export { DocSubsection as Subsection };

/** A story rendered on the page, in the standard frame, with an optional caption. */
export function Example({ of, caption }: { of: Parameters<typeof Story>[0]['of']; caption?: React.ReactNode }) {
  return (
    <figure className={styles.example}>
      <div className={styles.stage}>
        <Story of={of} />
      </div>
      {caption && <figcaption className={doc.caption}>{caption}</figcaption>}
    </figure>
  );
}

// --- When to use ------------------------------------------------------------------------------

/** "Use it for" beside "Use something else for": a markdown list in each. */
export function Usage({ children }: { children: React.ReactNode }) {
  return <div className={styles.usage}>{children}</div>;
}

export function UseFor({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.usageColumn}>
      <p className={doc.title}>Use it for</p>
      {children}
    </div>
  );
}

export function UseInstead({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.usageColumn}>
      <p className={doc.title}>Use something else</p>
      {children}
    </div>
  );
}

// --- Anatomy ----------------------------------------------------------------------------------

type PartProps = {
  /** The part's name, as the contract's anatomy lists it. */
  name: string;
  /** The CSS-module class on the part's element, e.g. `buttonStyles.leading`. */
  target?: string;
  /** Which match of `target` is the part, counting from 1, when the class is on several elements. Defaults to 1. */
  nth?: number;
  children: React.ReactNode;
};

/** One labelled part of the specimen; only meaningful inside <Anatomy>. */
export function Part(_props: PartProps) {
  return null;
}

/**
 * A live specimen with each part outlined and numbered, and the numbered list beside it. Parts are
 * found by their CSS-module class; one that isn't found is listed as missing, so a renamed class
 * shows on the page. Placement is placePins': numbers above a row of parts (the root's below), or to
 * the left of a column of them.
 */
export function Anatomy({ specimen, children }: { specimen: React.ReactNode; children: React.ReactNode }) {
  const parts = React.Children.toArray(children)
    .filter((child): child is React.ReactElement<PartProps> => React.isValidElement(child) && child.type === Part)
    .map((child) => child.props);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = React.useState<Array<PinBox | null>>([]);
  const targets = parts.map((part) => (part.target ? `${part.target}#${part.nth ?? 1}` : '')).join(' ');
  const pins = placePins(boxes);
  const side = pins.some((pin) => pin?.side === 'left');

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const origin = stage.getBoundingClientRect();
      setBoxes(
        targets.split(' ').map((entry) => {
          const [target, nth] = entry.split('#');
          const element = target ? stage.querySelectorAll(`.${CSS.escape(target)}`)[Number(nth) - 1] : null;
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height };
        }),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // Re-measure when the side layout's extra room moves the specimen.
  }, [targets, side]);

  return (
    <div className={styles.anatomy}>
      <div ref={stageRef} className={`${styles.stage} ${styles.anatomyStage} ${side ? styles.anatomyStageSide : ''}`}>
        <div className={styles.specimen}>{specimen}</div>
        {boxes.map((box, index) => {
          const pin = pins[index];
          if (!box || !pin) return null;
          return (
            <React.Fragment key={index}>
              <span className={styles.outline} style={{ left: box.x, top: box.y, width: box.width, height: box.height }} aria-hidden="true" />
              <span
                className={`${styles.pin} ${styles[`pin_${pin.side}`]}`}
                style={pin.side === 'left' ? { left: pin.x, top: pin.y, width: pin.length } : { left: pin.x, top: pin.y, height: pin.length }}
                aria-hidden="true"
              >
                <span className={styles.pinNumber}>{index + 1}</span>
                <span className={styles.pinLine} />
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <ol className={styles.parts}>
        {parts.map((part, index) => (
          <li key={part.name}>
            <span className={styles.partNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <p className={doc.title}>{part.name.charAt(0).toUpperCase() + part.name.slice(1)}</p>
              <p className={doc.subtle}>
                {part.children}
                {boxes.length > 0 && !boxes[index] && part.target !== undefined && <span className={styles.missing}> (not found on the specimen)</span>}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// --- Variants ---------------------------------------------------------------------------------

/** Which values of two axes are designed together, from a contract's `supportedCombinations`. */
export function CombinationTable({
  rowAxis,
  columnAxis,
  columns,
  supported,
}: {
  rowAxis: string;
  columnAxis: string;
  columns: string[];
  supported: Record<string, string[] | string>;
}) {
  const rows = Object.entries(supported).filter((entry): entry is [string, string[]] => Array.isArray(entry[1]));
  return (
    <div className={styles.tableScroll}>
      <table className={`${doc.table} ${styles.combinations}`}>
        <thead>
          <tr>
            <th scope="col">
              {rowAxis} <span className={doc.subtle}>× {columnAxis}</span>
            </th>
            {columns.map((column) => (
              <th key={column} scope="col">
                <Code>{column}</Code>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([row, values]) => (
            <tr key={row}>
              <th scope="row">
                <Code>{row}</Code>
              </th>
              {columns.map((column) => (
                <td key={column}>
                  {values.includes(column) ? (
                    <span className={styles.yes}>
                      <CheckIcon /> <span className={doc.visuallyHidden}>Designed</span>
                    </span>
                  ) : (
                    <span className={doc.subtle}>
                      – <span className={doc.visuallyHidden}>Not designed</span>
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Do and don't -----------------------------------------------------------------------------

/** Pairs of guidance: each <Do> beside the <Dont> that follows it. */
export function Guidelines({ children }: { children: React.ReactNode }) {
  return <div className={styles.guidelines}>{children}</div>;
}

function Guideline({ kind, caption, code, children }: { kind: 'do' | 'dont'; caption: React.ReactNode; code?: string; children?: React.ReactNode }) {
  const isDo = kind === 'do';
  return (
    <figure className={`${styles.guideline} ${isDo ? styles.do : styles.dont}`}>
      <figcaption className={styles.verdict}>
        <span className={styles.verdictLabel}>
          {isDo ? <CheckIcon /> : <CloseIcon />}
          {isDo ? 'Do' : 'Don’t'}
        </span>
        <span>{caption}</span>
      </figcaption>
      {children && <div className={styles.guidelineExample}>{children}</div>}
      {code && <pre className={doc.codeBlock}>{code}</pre>}
    </figure>
  );
}

export const Do = (props: { caption: React.ReactNode; code?: string; children?: React.ReactNode }) => <Guideline kind="do" {...props} />;
export const Dont = (props: { caption: React.ReactNode; code?: string; children?: React.ReactNode }) => <Guideline kind="dont" {...props} />;

// --- Accessibility ----------------------------------------------------------------------------

/** The keyboard, one row per key: <Key keys="Enter">Activates it.</Key>. */
export function Keyboard({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.tableScroll}>
      <table className={doc.table}>
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Does</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Key({ keys, children }: { keys: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className={styles.keys}>
        {keys.split(' + ').map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && ' + '}
            <kbd className={styles.kbd}>{key}</kbd>
          </React.Fragment>
        ))}
      </th>
      <td>{children}</td>
    </tr>
  );
}

// --- API --------------------------------------------------------------------------------------

type StoriesModule = { default: { component?: unknown } };

const docgenOf = (component: unknown) => (component as { __docgenInfo?: DocgenInfo } | undefined)?.__docgenInfo;

/** A JSDoc description with its `code` spans set as code. */
function described(text: string) {
  return text.split(/`([^`]+)`/).map((part, index) => (index % 2 ? <Code key={index}>{part}</Code> : part));
}

function PropTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className={styles.tableScroll}>
      <table className={`${doc.table} ${styles.props}`}>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <Code>{row.name}</Code>
              </th>
              <td>{row.type ? <Code>{row.type}</Code> : <span className={doc.subtle}>-</span>}</td>
              <td>{row.required ? <span className={styles.required}>Required</span> : row.defaultValue ? <Code>{row.defaultValue}</Code> : <span className={doc.subtle}>-</span>}</td>
              <td className={doc.subtle}>{row.deprecated ? described(row.deprecated) : row.description ? described(row.description) : <span className={styles.missing}>No description in the types yet.</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The props, read from the component's TypeScript types and their comments (Storybook's docgen), so
 * the table can't drift from the code. Deprecated props are listed after, with what replaces them.
 * `of` is the stories module, whose meta names the component; pass `component` instead for a second
 * component on the same page (Radio Group beside Radio). `native` names the element whose other
 * attributes the component forwards; `classNameOn` names a different element when `className` goes
 * elsewhere (Text Field passes attributes to its input and `className` to its frame).
 */
export function PropsTable({ of, component, native, classNameOn }: { of?: StoriesModule; component?: unknown; native?: string; classNameOn?: string }) {
  const { current, deprecated } = propRows(docgenOf(component ?? of?.default.component));
  // Say so rather than draw an empty table: docgen can't read a union of props types (Chip, Select),
  // and those pages list their props by hand after this.
  if (!current.length && !deprecated.length) return <p className={doc.caption}>{"Storybook's docgen read no props from this component's types."}</p>;
  return (
    <>
      <PropTable rows={current} />
      {native && (
        <p className={doc.caption}>
          {classNameOn ? (
            <>
              Any other <Code>{`<${native}>`}</Code> attribute is passed to the {native}, and <Code>className</Code> is added to the {classNameOn}.
            </>
          ) : (
            <>
              Any other <Code>{`<${native}>`}</Code> attribute is passed to the root element, and <Code>className</Code> is added to its classes.
            </>
          )}
        </p>
      )}
      {deprecated.length > 0 && (
        <DocSubsection title="Deprecated props">
          <p className={doc.caption}>Still accepted, so existing code keeps working. Use what each one names instead.</p>
          <PropTable rows={deprecated} />
        </DocSubsection>
      )}
    </>
  );
}

// --- Design tokens ----------------------------------------------------------------------------

const cssOf = (id: string) => Object.entries(componentCss).find(([path]) => path.replace(/\\/g, '/').endsWith(`/${id}.module.css`))?.[1] ?? '';

/**
 * Every token the component's own stylesheet (`<id>.module.css`) uses, by family: the property it
 * sets and when. `root` is the class on the root element, the stylesheet's first class unless given;
 * rules on it alone read as "base".
 */
export function TokensTable({ id, root }: { id: string; root?: string }) {
  const css = cssOf(id);
  const rows = tokenRows(css, root ?? rootClassOf(css));
  const families = TOKEN_FAMILIES.filter((family) => rows.some((row) => row.family === family));
  if (!rows.length) return <p className={doc.caption}>This stylesheet reads no design tokens.</p>;
  return (
    <div className={styles.tableScroll}>
      <table className={`${doc.table} ${styles.tokens}`}>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Property</th>
            <th scope="col">When</th>
          </tr>
        </thead>
        {families.map((family) => (
          <tbody key={family}>
            <tr>
              <th scope="colgroup" colSpan={3} className={styles.family}>
                {family}
              </th>
            </tr>
            {rows
              .filter((row) => row.family === family)
              .map((row) => (
                <tr key={`${row.token}|${row.property}`}>
                  <th scope="row">
                    <Code>{breakable(row.token)}</Code>
                  </th>
                  <td className={doc.subtle}>{row.property}</td>
                  <td className={doc.subtle}>{row.when.join(', ')}</td>
                </tr>
              ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

// --- Code in prose ----------------------------------------------------------------------------

/** A code sample in running prose, such as a value's shape. Pass the code as a string. */
export function CodeSample({ code }: { code: string }) {
  return <pre className={doc.codeBlock}>{code}</pre>;
}

// --- Related components -----------------------------------------------------------------------

/** A markdown list of DocLinks, each with the reason to pick it. */
export function Related({ children }: { children: React.ReactNode }) {
  return <div className={styles.related}>{children}</div>;
}
