import * as React from 'react';
import { CheckIcon } from '../../assets/icons';
import { ComponentPage, NumberedSection } from './component-page';
import { typesOf } from './component-types';
import { DocLink } from './doc-link';
import { Code, doc, DocHeader } from './doc-page';
import { registryEntry } from './component-page-data';
import { componentImports, componentsUsed, displayNameOf, propValues, toneMatrix } from './pattern-page-data';
import type { PatternPageSection } from './pattern-page-data';
import styles from './pattern-page.module.css';

// The pattern page standard: guidance for combining components to solve a recurring product
// problem, written in a pattern's MDX inside addon-docs <Unstyled>. Built on the component page
// standard (its frame, numbered sections, examples, and do/don't pairs). Prose stays in the MDX;
// the components a pattern uses and the values they take come from the code.

export { CodeSample, Do, Dont, Example, Guidelines, Key, Keyboard, Subsection } from './component-page';

/** The page wrapper. */
export function PatternPage({ children }: { children: React.ReactNode }) {
  return <ComponentPage>{children}</ComponentPage>;
}

/**
 * Name, the summary (children), and the facts line. `source` is the pattern's stories file
 * (`?raw`), whose imports are the components it uses.
 */
export function PatternHeader({ title, source, children }: { title: string; source: string; children: React.ReactNode }) {
  const count = componentImports(source).length;
  return <DocHeader title={title} lede={children} context={`Pattern · ${count} components`} />;
}

/** One numbered section; `title` is one of PATTERN_PAGE_SECTIONS, which the page test checks. */
export function Section({ title, children }: { title: PatternPageSection; children: React.ReactNode }) {
  return <NumberedSection title={title}>{children}</NumberedSection>;
}

// --- Choosing ---------------------------------------------------------------------------------

/**
 * A decision table: one row per situation, the component to use (DocLinks as children), and a
 * column per extra fact. `situation` heads the first column, `use` the second ("Use" by default),
 * `columns` the facts after it.
 */
export function Choices({ situation, use = 'Use', columns, children }: { situation: string; use?: string; columns: string[]; children: React.ReactNode }) {
  return (
    <div className={styles.tableScroll}>
      <table className={`${doc.table} ${styles.choices}`}>
        <thead>
          <tr>
            <th scope="col">{situation}</th>
            <th scope="col">{use}</th>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** One row of <Choices>: the situation, the component(s) to use as children, then the facts. */
export function Choice({ situation, cells, children }: { situation: React.ReactNode; cells: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row">{situation}</th>
      <td>
        <div className={styles.use}>{children}</div>
      </td>
      {cells.map((cell, index) => (
        <td key={index}>{cell}</td>
      ))}
    </tr>
  );
}

/**
 * Which tones each component takes, read from its TypeScript `tone` prop (renamed, deprecated
 * values left out). `components` are folder ids, in the order to list them.
 */
export function ToneMatrix({ components, prop = 'tone' }: { components: string[]; prop?: string }) {
  const { columns, rows } = toneMatrix(components.map((id) => ({ name: displayNameOf(registryEntry(id).name), values: propValues(typesOf(id), prop) })));
  return (
    <div className={styles.tableScroll}>
      <table className={`${doc.table} ${styles.matrix}`}>
        <thead>
          <tr>
            <th scope="col">
              Component <span className={doc.subtle}>× {prop}</span>
            </th>
            {columns.map((column) => (
              <th key={column} scope="col">
                <Code>{column}</Code>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, has }) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              {has.map((value, index) => (
                <td key={columns[index]}>
                  {value ? (
                    <span className={styles.yes}>
                      <CheckIcon /> <span className={doc.visuallyHidden}>Yes</span>
                    </span>
                  ) : (
                    <span className={doc.subtle}>
                      – <span className={doc.visuallyHidden}>No</span>
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

// --- Components used --------------------------------------------------------------------------

/**
 * Every component the pattern's examples import, linked to its Docs, in the order they're imported.
 * The targets are worked out from the registry, so they aren't string literals for doc-link.test.ts
 * to read; pattern-pages.test.ts checks each one is a real Docs page instead.
 */
export function ComponentsUsed({ source }: { source: string }) {
  return (
    <ul className={styles.components}>
      {componentsUsed(source).map(({ id, name, title }) => (
        <li key={id}>{React.createElement(DocLink, { to: title }, name)}</li>
      ))}
    </ul>
  );
}
