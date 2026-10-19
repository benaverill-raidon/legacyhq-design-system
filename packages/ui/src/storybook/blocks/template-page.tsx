import * as React from 'react';
import { NumberedSection } from './component-page';
import { DocHeader } from './doc-page';
import { componentImports } from './pattern-page-data';
import type { TemplatePageSection } from './pattern-page-data';
import { PatternPage } from './pattern-page';

// The template page standard: a complete LegacyHQ workflow composed from system components, written
// in a template's MDX inside addon-docs <Unstyled>. Built on the pattern page standard: the same
// frame, numbered sections, decision tables (for the regions a screen is made of), and the
// components used, read from the template's stories file.

export { Choice, Choices, CodeSample, ComponentsUsed, Example, Key, Keyboard, Subsection } from './pattern-page';

/** The page wrapper. */
export function TemplatePage({ children }: { children: React.ReactNode }) {
  return <PatternPage>{children}</PatternPage>;
}

/**
 * Name, the summary (children), and the facts line. `source` is the template's stories file
 * (`?raw`), whose imports are the components it uses. `draft` says the template was built before
 * its designs were final, so its content and structure are still to be checked against them.
 */
export function TemplateHeader({ title, source, draft = false, children }: { title: string; source: string; draft?: boolean; children: React.ReactNode }) {
  const facts = ['Template', ...(draft ? ['Draft: built ahead of the final designs'] : []), `${componentImports(source).length} components`];
  return <DocHeader title={title} lede={children} context={facts.join(' · ')} />;
}

/** One numbered section; `title` is one of TEMPLATE_PAGE_SECTIONS, which the page test checks. */
export function Section({ title, children }: { title: TemplatePageSection; children: React.ReactNode }) {
  return <NumberedSection title={title}>{children}</NumberedSection>;
}
