// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { propValues } from '../../blocks/pattern-page-data';

// The facts Patterns / Collections cites, checked against the component source, so the page fails
// here when a component changes under it.

const COMPONENTS = 'packages/ui/src/components';
const source = (path: string): string => readFileSync(`${COMPONENTS}/${path}`, 'utf8');
const table = source('organisms/table/table.tsx');
const tableTypes = source('organisms/table/table.types.ts');

describe('Collections cites Table', () => {
  it('leaves filtering to you: the rows come from data alone, never the search text', () => {
    expect(table).toMatch(/const rows = React\.useMemo\(\s*\(\) => data\.map\(/);
    expect(table).not.toMatch(/currentSearch[^\n]*\.filter\(|\.filter\([^\n]*currentSearch/);
    expect(tableTypes).toMatch(/Table doesn't filter `data`: filter it yourself in `onSearchChange`\./);
  });

  it('sorts ascending, then descending, then back to the order of data', () => {
    expect(table).toMatch(/next = \{ columnKey, direction: 'asc' \};\s*else if \(currentSort\.direction === 'asc'\) next = \{ columnKey, direction: 'desc' \};\s*else next = null;/);
    expect(table).toMatch(/'ascending'[\s\S]*'descending'[\s\S]*'none'/);
  });

  it("uses the row's position in data as its id by default", () => {
    expect(table).toMatch(/getRowId = \(_row, index\) => index,/);
  });

  it('counts every selected id, wherever the row is, and announces the count politely', () => {
    expect(table).toMatch(/const selectedCount = currentSelectedIds\.length;/);
    expect(table).toMatch(/selectionCountLabel = \(count\) => `\$\{count\} selected`,/);
    expect(table).toMatch(/role="status" aria-live="polite"/);
  });

  it('replaces the toolbar buttons with the selection bar while rows are selected', () => {
    expect(table).toMatch(/\{selectable && selectedCount > 0 \? \(\s*<div className=\{styles\.selectionPill\}>/);
  });

  it('names every row Checkbox "Select row" without getSelectionLabel', () => {
    expect(table).toMatch(/aria-label=\{getSelectionLabel\?\.\(row, index\) \?\? 'Select row'\}/);
  });

  it('names the table by caption, or title, and the footer for the table', () => {
    expect(table).toMatch(/const captionContent = caption \?\? title;/);
    expect(table).toMatch(/role="navigation" aria-label=\{paginationLabel \?\? \(name \? `\$\{name\} pagination` : 'Table pagination'\)\}/);
  });

  it('has a default empty description written for a list with nothing in it yet', () => {
    expect(table).toMatch(/emptyDescriptionLabel = 'There is nothing to show here yet\.',/);
  });

  it('takes the props the page uses', () => {
    for (const prop of ['searchable', 'activeFilters', 'onClearFilters', 'bulkActions', 'getSelectionLabel', 'manualSort', 'manualPagination', 'pageCount', 'itemsPerPageOptions', 'empty']) {
      expect(tableTypes).toMatch(new RegExp(`^\\s*${prop}\\?:`, 'm'));
    }
    expect(propValues(tableTypes, 'cellAppearance')).toEqual(['default', 'editable']);
  });
});

describe('Collections cites the other components', () => {
  it('Chip Group is a group only when it has a name', () => {
    expect(source('molecules/chip-group/chip-group.tsx')).toMatch(/role=\{ariaLabel \|\| ariaLabelledBy \? 'group' : undefined\}/);
  });

  it("a filter Chip's value is named with its field, and its remove button is \"Remove\" plus the field", () => {
    const chip = source('molecules/chip/chip.tsx');
    expect(chip).toMatch(/aria-labelledby=\{`\$\{propertyNameId\} \$\{segmentTextId\}`\}/);
    expect(chip).toMatch(/return propertyName \? `Remove \$\{propertyName\}` : 'Remove';/);
  });

  it('Pagination is a nav named "Pagination" by default, with no page-size control', () => {
    const pagination = source('molecules/pagination/pagination.tsx');
    expect(pagination).toMatch(/\?\? 'Pagination';/);
    expect(pagination).toMatch(/<nav/);
    expect(source('molecules/pagination/pagination.types.ts')).not.toMatch(/pageSize|itemsPerPage/);
  });

  it('Tag Group overflows behind "+3 more", and Avatar Group behind "+3"', () => {
    expect(source('molecules/tag-group/tag-group.tsx')).toMatch(/return `\+\$\{hiddenCount\} more`;/);
    expect(source('molecules/avatar-group/avatar-group.tsx')).toMatch(/return `\+\$\{hiddenCount\}`;/);
  });

  it('Card is a plain div, and Key Value List a dl', () => {
    expect(source('organisms/card/card.tsx')).toMatch(/<div\s/);
    expect(source('organisms/card/card.tsx')).not.toMatch(/role=|tabIndex/);
    expect(source('molecules/key-value-list/key-value-list.tsx')).toMatch(/<dl /);
  });

  it('Label has the status tones the examples use; Badge holds a short number', () => {
    expect(propValues(source('atoms/label/label.types.ts'), 'tone')).toEqual(expect.arrayContaining(['default', 'information', 'warning', 'success']));
    expect(source('atoms/badge/badge.types.ts')).toMatch(/a short number of one to four characters/);
  });

  it('Modal Dialog takes the error tone for a destructive confirmation', () => {
    expect(propValues(source('organisms/modal-dialog/modal-dialog.types.ts'), 'tone')).toContain('error');
  });
});
