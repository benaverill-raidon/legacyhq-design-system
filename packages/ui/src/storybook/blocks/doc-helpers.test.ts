import { describe, expect, it } from 'vitest';
import { componentsMatching, componentsUsing, inWords, listOf, titleCase } from './doc-helpers';

const css = {
  'packages/ui/src/components/atoms/label/label.module.css': '.root { color: var(--color-content-accent-red-default); }',
  'packages/ui/src/components/molecules/icon-tile/icon-tile.module.css': '.root { text-overflow: ellipsis; }',
  'packages\\ui\\src\\components\\atoms\\tag\\tag.module.css': '.root { background: var(--color-background-accent-red-subtle-default); }',
  'packages/ui/src/components/molecules/text-area/rich/rich-text-area.module.css': '.chip { text-overflow: ellipsis; }',
  'packages/ui/src/components/organisms/card/card-stories.module.css': '.demo { color: var(--color-content-accent-red-default); text-overflow: ellipsis; }',
};

describe('doc helpers', () => {
  it('formats copy', () => {
    expect(titleCase('icon-tile')).toBe('Icon Tile');
    expect(listOf(['Label'])).toBe('Label');
    expect(listOf(['Label', 'Tag'])).toBe('Label and Tag');
    expect(listOf(['Icon Tile', 'Label', 'Tag'])).toBe('Icon Tile, Label, and Tag');
    expect(inWords(9)).toBe('nine');
    expect(inWords(15)).toBe('15');
  });

  it('finds components by token prefix or CSS text, named by stylesheet and skipping story-only CSS', () => {
    expect(componentsUsing('color-background-accent-', css)).toEqual(['tag']);
    expect(componentsUsing('color-', css)).toEqual(['label', 'tag']);
    expect(componentsMatching((source) => source.includes('text-overflow: ellipsis'), css)).toEqual(['icon-tile', 'rich-text-area']);
  });
});
