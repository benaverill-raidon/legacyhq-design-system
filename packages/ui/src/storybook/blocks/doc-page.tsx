import * as React from 'react';
import doc from './doc-page.module.css';

// Shared building blocks for Storybook docs pages rendered inside addon-docs <Unstyled>: the page
// rhythm and type scale (`doc` classes) plus the structure every page repeats - header, numbered
// sections, subsections, footer note, and inline code. Page-specific layout stays with the page.

export { doc };

export function DocPage({ children }: { children: React.ReactNode }) {
  return <div className={doc.page}>{children}</div>;
}

export function DocHeader({ title, lede, context }: { title: string; lede: React.ReactNode; context?: React.ReactNode }) {
  return (
    <header className={doc.header}>
      <h1 className={doc.h1}>{title}</h1>
      {/* A div: MDX wraps a multi-line summary in its own paragraph. */}
      <div className={doc.lede}>{lede}</div>
      {context && <p className={doc.context}>{context}</p>}
    </header>
  );
}

export function DocSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  const id = `doc-section-${number}`;
  return (
    <section className={doc.section} aria-labelledby={id}>
      <h2 id={id} className={doc.h2}>
        <span className={doc.sectionNumber}>{number}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export function DocSubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={doc.subsection}>
      <h3 className={doc.h3}>{title}</h3>
      {children}
    </div>
  );
}

/** A real name split into its parts, each labelled with what it names; children are the caption. */
export function DocAnatomy({
  parts,
  title = 'Anatomy of a token name',
  children,
}: {
  parts: Array<[part: string, meaning: string]>;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={doc.anatomy}>
      <p className={doc.eyebrow}>{title}</p>
      <ol className={doc.anatomyParts}>
        {parts.map(([part, meaning]) => (
          <li key={part}>
            <Code>{part}</Code>
            <span className={doc.small}>{meaning}</span>
          </li>
        ))}
      </ol>
      {children && <p className={doc.caption}>{children}</p>}
    </div>
  );
}

/** The components that use something: up to four by name, otherwise three and a "+N more" count. */
export function UsedBy({ users }: { users: string[] }) {
  if (!users.length) return <span className={doc.subtle}>Not used by components yet</span>;
  const shown = users.length <= 4 ? users : users.slice(0, 3);
  return (
    <span title={users.length > shown.length ? users.join(', ') : undefined}>
      {shown.join(', ')}
      {users.length > shown.length && <span className={doc.subtle}> +{users.length - shown.length} more</span>}
    </span>
  );
}

export type DocTokenRow = {
  /** CSS name without the leading dashes, e.g. `spacing-sm`. */
  name: string;
  /** A picture of the value, drawn with the token itself. */
  sample: React.ReactNode;
  value: string;
  figmaName?: string;
  users: string[];
};

/**
 * A token scale, one row per step: name, a live sample, value, Figma name, and the components that
 * use it. `sampleLabel` names the sample column for screen readers; `sampleClassName` sizes it.
 */
export function DocTokenTable({ rows, sampleLabel, sampleClassName }: { rows: DocTokenRow[]; sampleLabel: string; sampleClassName?: string }) {
  return (
    <table className={doc.table}>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col" className={sampleClassName}>
            <span className={doc.visuallyHidden}>{sampleLabel}</span>
          </th>
          <th scope="col">Value</th>
          <th scope="col">Figma</th>
          <th scope="col">Used by</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <th scope="row">
              <Code>{row.name}</Code>
            </th>
            <td className={sampleClassName}>{row.sample}</td>
            <td className={doc.numbers}>{row.value}</td>
            <td className={doc.subtle}>{row.figmaName}</td>
            <td>
              <UsedBy users={row.users} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The closing note that says which source files the page reads from. */
export function DocFooter({ children }: { children: React.ReactNode }) {
  return (
    <footer className={doc.footer}>
      <p className={doc.small}>{children}</p>
    </footer>
  );
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className={doc.code}>{children}</code>;
}

/** Long token identifiers get break opportunities after their separators instead of mid-word. */
export function breakable(identifier: string) {
  return identifier.split(/(?<=[/.-])/).map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && <wbr />}
      {part}
    </React.Fragment>
  ));
}
