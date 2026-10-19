// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The facts Templates / Document Generation states about the components it's built from, checked
// against their source, so the page can't drift from what the components do. The product facts its
// Purpose cites are checked too; everything else on the page is a placeholder, listed as an open
// question.

const COMPONENTS = 'packages/ui/src/components';
const source = (path: string): string => readFileSync(`${COMPONENTS}/${path}`, 'utf8');

describe('Document Generation cites', () => {
  it('what the repo already says about document generation', () => {
    expect(source('organisms/progress-tracker/progress-tracker.mdx')).toMatch(/A guided flow with named steps, such as matter setup or client onboarding\./);
    expect(source('atoms/progress-bar/progress-bar.stories.tsx')).toMatch(/Generating document package/);
    expect(source('molecules/split-button/SplitButton.stories.tsx')).toMatch(/label: 'Create from template'/);
    expect(source('molecules/text-area/rich/nav-tag.tsx')).toMatch(/matter/);
    for (const icon of ['DocumentGenerationIcon', 'DocumentTemplatesIcon', 'SignatureIcon']) {
      expect(readFileSync('packages/ui/src/assets/icons/generated/index.ts', 'utf8')).toContain(icon);
    }
  });

  it("Progress Tracker: a nav named for the flow, an ordered list, and links only for steps already done that have an href", () => {
    const tracker = source('organisms/progress-tracker/progress-tracker.tsx');
    expect(tracker).toMatch(/aria-label=\{ariaLabelledBy \? undefined : \(ariaLabel \?\? 'Progress'\)\}/);
    expect(tracker).toMatch(/<ol className=\{styles\.steps\}>/);
    expect(tracker).toMatch(/aria-current=\{isCurrent \? 'step' : undefined\}/);
    expect(tracker).toMatch(/const interactive = Boolean\(step\.href\) && !stepDisabled && !isCurrent && isVisited;/);
    expect(tracker).toMatch(/const stepDisabled = disabled \|\| Boolean\(step\.disabled\);/);
  });

  it("Table's selection is for acting on records, not choosing options in a form", () => {
    expect(source('organisms/table/table.mdx')).toMatch(/Table's selection is for acting on records\./);
  });

  it("a required Checkbox Group adds hidden text but doesn't make a checkbox required", () => {
    const group = source('atoms/checkbox/checkbox-group.tsx');
    expect(group).toMatch(/requiredLabel = 'required'/);
    expect(group).not.toMatch(/required=\{required\}/);
  });

  it("Form's title isn't a heading", () => {
    expect(source('organisms/form/form.tsx')).toMatch(/<div className=\{styles\.title\}>\{title\}<\/div>/);
  });

  it('Section Message takes a ref and tabIndex, and is a polite live region', () => {
    const message = source('organisms/section-message/section-message.tsx');
    expect(message).toMatch(/React\.forwardRef<HTMLDivElement, SectionMessageProps>/);
    expect(message).toMatch(/\{\.\.\.rest\}\s*ref=\{forwardedRef\}/);
    expect(message).toMatch(/role = 'status'/);
  });

  it("Progress Bar: getValueText is the announced value, and it isn't a live region", () => {
    const bar = source('atoms/progress-bar/progress-bar.tsx');
    expect(bar).toMatch(/const resolvedValueText = getValueText \? getValueText\(clampedValue\) : ariaValueText;/);
    expect(bar).toMatch(/aria-valuetext=\{resolvedValueText\}/);
    expect(bar).not.toMatch(/aria-live|role="status"/);
  });

  it('Breadcrumbs: a nav named "Breadcrumb" by default', () => {
    expect(source('molecules/breadcrumbs/breadcrumbs.tsx')).toMatch(/ariaLabel \?\? deprecatedAriaLabel \?\? 'Breadcrumb'/);
  });

  it("Table: a native table named by its title when there's no caption, under a heading at headingLevel", () => {
    const table = source('organisms/table/table.tsx');
    expect(table).toMatch(/<table /);
    expect(table).toMatch(/const captionContent = caption \?\? title;/);
    expect(table).toMatch(/const Heading = `h\$\{headingLevel\}` as const;/);
  });

  it('Modal Dialog moves focus in when it opens and returns it when it closes', () => {
    const dialog = source('organisms/modal-dialog/modal-dialog.tsx');
    expect(dialog).toMatch(/\(initialFocusRef\?\.current \?\? panelRef\.current\)\?\.focus\(\);/);
    expect(dialog).toMatch(/previouslyFocused\?\.focus\?\.\(\);/);
  });

  it("Toast Group announces through one polite live region", () => {
    expect(source('organisms/toast-group/toast-group.tsx')).toMatch(/role="status"/);
  });
});
