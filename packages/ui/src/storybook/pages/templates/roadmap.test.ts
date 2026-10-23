// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { propValues } from '../../blocks/pattern-page-data';

// The facts Templates / Roadmap states about the components it's built from, checked against their
// source, so the page fails here when a component changes under it.

const COMPONENTS = 'packages/ui/src/components';
const source = (path: string): string => readFileSync(`${COMPONENTS}/${path}`, 'utf8');

describe('Roadmap cites what the repo says about roadmaps', () => {
  it('a roadmap is a record, linked in purple; matters in teal, people in blue', () => {
    const navTag = source('molecules/text-area/rich/nav-tag.tsx');
    expect(navTag).toMatch(/roadmap: \{ tone: 'purple' \}/);
    expect(navTag).toMatch(/matter: \{ tone: 'teal' \}/);
    expect(navTag).toMatch(/person: \{ tone: 'blue' \}/);
  });

  it('completion is a circular Progress Bar named "Roadmap completion"', () => {
    expect(source('atoms/progress-bar/progress-bar.stories.tsx')).toMatch(/variant="circular" value=\{\d+\} label="Roadmap completion"/);
    expect(source('atoms/progress-bar/progress-bar.mdx')).toMatch(/A compact completion summary on a card or a tile, with the circular variant\./);
  });

  it('tasks are not started, in progress, or complete: the task icons', () => {
    const icons = readFileSync('packages/ui/src/assets/icons/generated/index.ts', 'utf8');
    for (const name of ['TaskNotStartedIcon', 'TaskInProgressIcon', 'TaskCompleteIcon', 'RoadmapIcon']) expect(icons).toContain(`export { ${name} }`);
  });
});

describe('Roadmap cites the components', () => {
  it('Progress Bar: value text replaces the percentage, and it is not a live region', () => {
    const code = source('atoms/progress-bar/progress-bar.tsx');
    expect(code).toMatch(/aria-valuetext=\{resolvedValueText\}/);
    expect(code).toMatch(/if \(label\) \{\s*return \{ 'aria-label': label \};/);
    expect(code).not.toMatch(/aria-live/);
  });

  it('Progress Bar shows the empty ring at 0: the track, with no arc', () => {
    const css = source('atoms/progress-bar/progress-bar.module.css');
    expect(css).toMatch(/\.variant_circular\[data-empty='true'\] \.circularProgress \{\s*display: none;/);
    expect(css).not.toMatch(/\[data-empty='true'\] \.circularTrack/);
    expect(source('atoms/progress-bar/progress-bar.mdx')).toMatch(/At 0 both variants show only their empty track/);
  });

  it('Progress Tracker is position in a sequence, for a guided flow, not completion', () => {
    const mdx = source('organisms/progress-tracker/progress-tracker.mdx');
    expect(mdx).toMatch(/A guided flow with named steps/);
    expect(mdx).toMatch(/Progress Tracker is position in a sequence, not completion\./);
  });

  it('Table: for records compared across the same fields, edited in place; Card is not', () => {
    expect(source('organisms/table/table.mdx')).toMatch(/Records compared side by side across the same fields\./);
    expect(source('organisms/table/table.mdx')).toMatch(/Editing a few fields of many records in place, with editable cells\./);
    expect(source('organisms/card/card.mdx')).toMatch(/\*\*Many records compared side by side:\*\* <DocLink to="Components\/Data Display\/Table" \/>/);
    expect(propValues(source('organisms/table/table.types.ts'), 'cellAppearance')).toEqual(['default', 'editable']);
  });

  it('Table has no row groups, and filters belong to one table', () => {
    const types = source('organisms/table/table.types.ts');
    expect(types).not.toMatch(/^\s*(group|groupBy|getGroup)\w*\?:/m);
    expect(types).toMatch(/^\s*activeFilters\?:/m);
  });

  it("Table: a scroll region named by its title that takes focus, and aria-busy while loading", () => {
    const table = source('organisms/table/table.tsx');
    expect(table).toMatch(/const name = accessibleString\(caption, title\);/);
    expect(table).toMatch(/role="region" aria-label=\{name \?\? scrollRegionLabel\} tabIndex=\{0\}/);
    expect(table).toMatch(/aria-busy=\{loading \|\| undefined\}/);
  });

  it("Label has no icon slot", () => {
    expect(source('atoms/label/label.types.ts')).not.toMatch(/icon/i);
    expect(source('atoms/label/label.mdx')).toMatch(/It has no border, icon, or remove control, by design/);
  });

  it("a single Select shows the chosen option's icon, as the rows and multi-select chips do", () => {
    const select = source('molecules/select/select.tsx');
    expect(select).toMatch(/leadingElement: option\.icon/);
    expect(select).toMatch(/const chips = multi\s*\?/);
    expect(select).toMatch(/elemBefore=\{option\.icon\}/);
    expect(select).toMatch(/leadingContent=\{chips\}/);
    expect(select).toMatch(/iconBefore=\{selectedSingleOption\?\.icon\}/);
  });

  it('icons, avatars, chip previews, and menu-row icons are decorative', () => {
    expect(source('primitives/icon/icon-base.tsx')).toMatch(/decorative = true,/);
    expect(source('atoms/avatar/avatar.types.ts')).toMatch(/^\s*decorative\?: boolean;/m);
    expect(source('molecules/chip/chip.tsx')).toMatch(/<span className=\{styles\.preview\} aria-hidden="true">/);
    expect(source('organisms/menu/menu.types.ts')).toMatch(/It's hidden from assistive\s+\* technology, so it can't carry meaning/);
  });

  it('a filter chip is named by its field and value, and its remove button "Remove" plus the field; a named Chip Group is a group', () => {
    const chip = source('molecules/chip/chip.tsx');
    expect(chip).toMatch(/aria-labelledby=\{`\$\{propertyNameId\} \$\{segmentTextId\}`\}/);
    expect(chip).toMatch(/return propertyName \? `Remove \$\{propertyName\}` : 'Remove';/);
    expect(source('molecules/chip-group/chip-group.tsx')).toMatch(/role=\{ariaLabel \|\| ariaLabelledBy \? 'group' : undefined\}/);
  });

  it('Dropdown Menu returns focus to its trigger, unless focus already moved on purpose', () => {
    const menu = source('organisms/dropdown-menu/dropdown-menu.tsx');
    expect(menu).toMatch(/if \(!active \|\| active === document\.body \|\| getPanel\(\)\?\.contains\(active\)\) \{\s*triggerRef\.current\?\.focus\(\);/);
  });

  it('Date Picker: a calendar dialog named "Choose a date" that returns focus to the field', () => {
    expect(source('organisms/date-picker/date-picker.tsx')).toMatch(/dialogLabel = 'Choose a date',/);
    expect(source('organisms/date-picker/date-picker.mdx')).toMatch(/Picking a day, Escape, and Tab out of the calendar close it\s+and return focus to the field/);
  });

  it('Breadcrumbs is a nav named "Breadcrumb" by default', () => {
    const breadcrumbs = source('molecules/breadcrumbs/breadcrumbs.tsx');
    expect(breadcrumbs).toMatch(/\?\? 'Breadcrumb';/);
    expect(breadcrumbs).toMatch(/<nav/);
  });

  it("Toast Group reads each toast's tone, title, and description from one polite live region", () => {
    const group = source('organisms/toast-group/toast-group.tsx');
    expect(group).toMatch(/\{status \? `\$\{status\}: ` : null\}\s*\{item\.title\}\s*\{hasDescription \? <div>\{item\.description\}<\/div> : null\}/);
    expect(group).toMatch(/role="status" aria-atomic="false"/);
  });

  it('Empty State is not a live region; a labelled Skeleton is a polite status', () => {
    expect(source('organisms/empty-state/empty-state.tsx')).not.toMatch(/aria-live|role=/);
    expect(source('molecules/skeleton/skeleton.tsx')).toMatch(/role=\{hasLabel \? 'status' : undefined\}/);
  });
});
