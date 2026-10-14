import * as React from 'react';
import { Story } from '@storybook/addon-docs/blocks';
import { CheckIcon, CloseIcon } from '../../assets/icons';
import { componentCss } from './component-css';
import { headerFacts, propRows, registryEntry, tokenRows, TOKEN_FAMILIES } from './component-page-data';
import type { ComponentPageSection, DocgenInfo, PropRow } from './component-page-data';
import { breakable, Code, doc, DocHeader, DocPage, DocSubsection } from './doc-page';
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

/** Name, the summary (children), the facts line, and a live example. */
export function ComponentHeader({ id, example, children }: { id: string; example?: React.ReactNode; children: React.ReactNode }) {
  const entry = registryEntry(id);
  return (
    <div className={styles.header}>
      <DocHeader title={displayName(entry.name)} lede={children} context={headerFacts(entry).join(' · ')} />
      {example && <div className={styles.stage}>{example}</div>}
    </div>
  );
}

/** One numbered section; `title` is one of COMPONENT_PAGE_SECTIONS, which the page test checks. */
export function Section({ title, children }: { title: ComponentPageSection; children: React.ReactNode }) {
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
  children: React.ReactNode;
};

/** One labelled part of the specimen; only meaningful inside <Anatomy>. */
export function Part(_props: PartProps) {
  return null;
}

type Box = { x: number; y: number; width: number; height: number };

/** How far above the specimen (or below its root) the part numbers sit, in px. */
const PIN_LIFT = 40;

const contains = (outer: Box, inner: Box) =>
  outer !== inner && outer.x <= inner.x && outer.y <= inner.y && outer.x + outer.width >= inner.x + inner.width && outer.y + outer.height >= inner.y + inner.height;

/**
 * A live specimen with each part outlined and numbered, and the numbered list beside it. Parts are
 * found by their CSS-module class; one that isn't found is listed as missing, so a renamed class
 * shows on the page. A part that holds others (the root) is numbered below the specimen.
 */
export function Anatomy({ specimen, children }: { specimen: React.ReactNode; children: React.ReactNode }) {
  const parts = React.Children.toArray(children)
    .filter((child): child is React.ReactElement<PartProps> => React.isValidElement(child) && child.type === Part)
    .map((child) => child.props);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = React.useState<Array<Box | null>>([]);
  const targets = parts.map((part) => part.target ?? '').join(' ');

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const origin = stage.getBoundingClientRect();
      setBoxes(
        targets.split(' ').map((target) => {
          const element = target ? stage.querySelector(`.${CSS.escape(target)}`) : null;
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
  }, [targets]);

  const specimenTop = Math.min(...boxes.map((box) => box?.y ?? Infinity));
  return (
    <div className={styles.anatomy}>
      <div ref={stageRef} className={`${styles.stage} ${styles.anatomyStage}`}>
        <div className={styles.specimen}>{specimen}</div>
        {boxes.map((box, index) => {
          if (!box) return null;
          const below = boxes.some((other) => other && contains(box, other));
          // Numbers sit in one row above the specimen (or below, for the root), each with a leader
          // line to its part, so they never land on the specimen itself.
          const top = below ? box.y + box.height : specimenTop - PIN_LIFT;
          const height = below ? PIN_LIFT : box.y - top;
          return (
            <React.Fragment key={index}>
              <span className={styles.outline} style={{ left: box.x, top: box.y, width: box.width, height: box.height }} aria-hidden="true" />
              <span
                className={`${styles.pin} ${below ? styles.pinBelow : ''}`}
                style={{ left: box.x + box.width / 2, top, height }}
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

const docgenOf = (stories: StoriesModule) => (stories.default.component as { __docgenInfo?: DocgenInfo } | undefined)?.__docgenInfo;

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
 * `native` names the element whose other attributes the component forwards.
 */
export function PropsTable({ of, native }: { of: StoriesModule; native?: string }) {
  const { current, deprecated } = propRows(docgenOf(of));
  return (
    <>
      <PropTable rows={current} />
      {native && (
        <p className={doc.caption}>
          Any other <Code>{`<${native}>`}</Code> attribute is passed to the root element, and <Code>className</Code> is added to its classes.
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
 * Every token the component's own stylesheet uses, by family: the property it sets and when.
 * `root` is the class on the root element (`button`, `root`); rules on it alone read as "base".
 */
export function TokensTable({ id, root = id }: { id: string; root?: string }) {
  const rows = tokenRows(cssOf(id), root);
  const families = TOKEN_FAMILIES.filter((family) => rows.some((row) => row.family === family));
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

// --- Related components -----------------------------------------------------------------------

/** A markdown list of DocLinks, each with the reason to pick it. */
export function Related({ children }: { children: React.ReactNode }) {
  return <div className={styles.related}>{children}</div>;
}
