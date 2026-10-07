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
      <p className={doc.lede}>{lede}</p>
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
