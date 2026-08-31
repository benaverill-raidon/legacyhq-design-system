import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RichTextArea } from './rich';
import type { EntitySection, RichTextValue } from './rich';
import styles from './rich/rich-text-area.module.css';

afterEach(cleanup);

const PEOPLE: EntitySection[] = [
  {
    id: 'people',
    heading: 'People',
    entityType: 'person',
    items: [
      { id: 'p1', entityType: 'person', label: 'Ben Averill', description: 'Design', href: '/people/p1' },
      { id: 'p2', entityType: 'person', label: 'Jess Averill', description: 'Legal', href: '/people/p2' },
    ],
  },
];

const MATTERS: EntitySection[] = [
  {
    id: 'matters',
    heading: 'Matters',
    entityType: 'matter',
    items: [{ id: 'm1', entityType: 'matter', label: 'Acme v. Widget', href: '/matters/m1' }],
  },
];

function noop() {
  return undefined;
}

/**
 * Put a collapsed caret at a DOM position. contenteditable typing is not simulated by jsdom, so
 * every slash-command test drives the component the way the browser would: place the caret, then
 * dispatch the key or input event the real editor would have received.
 */
function caretAt(node: Node, offset: number) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return range;
}

function getEditor() {
  return screen.getByRole('textbox');
}

/** Open the picker the way a user does: caret in the editor, then press `/`. */
function pressSlash(editor: HTMLElement, at: Node = editor, offset = 0) {
  caretAt(at, offset);
  fireEvent.keyDown(editor, { key: '/' });
}

function getSlashSpan(): HTMLElement | null {
  return document.querySelector('[data-slash="true"]');
}

/** Type into the `/` span, then fire the input event the browser would have fired. */
function typeQuery(editor: HTMLElement, query: string) {
  const span = getSlashSpan();
  if (!span) throw new Error('no slash span - the picker is not open');
  const textNode = span.firstChild as Text;
  textNode.data = `/${query}`;
  caretAt(textNode, textNode.data.length);
  fireEvent.input(editor);
}

describe('RichTextArea', () => {
  describe('rendering', () => {
    it('renders a multiline textbox', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-label="Note" />);

      const editor = screen.getByRole('textbox', { name: 'Note' });
      expect(editor).toHaveAttribute('aria-multiline', 'true');
      expect(editor).toHaveAttribute('contenteditable', 'true');
    });

    it('uses the default size and resize', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-label="Note" />);

      const editor = getEditor();
      expect(editor).toHaveClass(styles.size_md);
      expect(editor).toHaveClass(styles.resize_vertical);
    });

    it('applies size and appearance', () => {
      render(
        <RichTextArea value={[]} onChange={noop} onSearch={() => []} size="lg" appearance="subtle" aria-label="Note" />,
      );

      const editor = getEditor();
      expect(editor).toHaveClass(styles.size_lg);
      expect(editor).toHaveClass(styles.appearance_subtle);
    });

    it('applies each resize option as a class', () => {
      const { rerender } = render(
        <RichTextArea value={[]} onChange={noop} onSearch={() => []} resize="none" aria-label="Note" />,
      );
      expect(getEditor()).toHaveClass(styles.resize_none);

      rerender(<RichTextArea value={[]} onChange={noop} onSearch={() => []} resize="both" aria-label="Note" />);
      expect(getEditor()).toHaveClass(styles.resize_both);
    });

    it('marks the invalid state for assistive tech and styling', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} invalid aria-label="Note" />);

      const editor = getEditor();
      expect(editor).toHaveAttribute('aria-invalid', 'true');
      expect(editor).toHaveAttribute('data-invalid', 'true');
    });

    it('exposes the placeholder and empty state', () => {
      render(
        <RichTextArea value={[]} onChange={noop} onSearch={() => []} placeholder="Write a note" aria-label="Note" />,
      );

      const editor = getEditor();
      expect(editor).toHaveAttribute('data-placeholder', 'Write a note');
      expect(editor).toHaveAttribute('data-empty', 'true');
    });

    it('sets the row count as a custom property', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} rows={5} aria-label="Note" />);

      expect(getEditor().style.getPropertyValue('--rta-rows')).toBe('5');
    });
  });

  describe('disabled', () => {
    it('is not editable and not focusable', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} disabled aria-label="Note" />);

      const editor = getEditor();
      expect(editor).toHaveAttribute('contenteditable', 'false');
      expect(editor).toHaveAttribute('data-disabled', 'true');
      expect(editor).toHaveAttribute('tabindex', '-1');
    });

    it('does not open the picker', () => {
      const onSearch = vi.fn(() => []);
      render(<RichTextArea value={[]} onChange={noop} onSearch={onSearch} disabled aria-label="Note" />);

      pressSlash(getEditor());

      expect(getSlashSpan()).toBeNull();
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe('value hydration', () => {
    it('renders text and entity nodes from the value', () => {
      const value: RichTextValue = [
        { type: 'text', text: 'Ask ' },
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
        { type: 'text', text: ' about it' },
      ];
      render(<RichTextArea value={value} onChange={noop} onSearch={() => []} aria-label="Note" />);

      const editor = getEditor();
      expect(editor.textContent).toContain('Ask ');
      expect(editor.textContent).toContain('about it');

      const host = editor.querySelector('[data-entity-id="p1"]');
      expect(host).not.toBeNull();
      expect(host).toHaveAttribute('contenteditable', 'false');
      expect(host).toHaveAttribute('data-entity-label', 'Ben Averill');
    });

    it('renders each entity as a navigational tag', () => {
      const value: RichTextValue = [
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
      ];
      render(<RichTextArea value={value} onChange={noop} onSearch={() => []} aria-label="Note" />);

      const link = screen.getByRole('link', { name: 'Ben Averill' });
      expect(link).toHaveAttribute('href', '/people/p1');
    });

    it('is not empty when it hydrates with content', () => {
      const value: RichTextValue = [{ type: 'text', text: 'Hello' }];
      render(<RichTextArea value={value} onChange={noop} onSearch={() => []} aria-label="Note" />);

      expect(getEditor()).not.toHaveAttribute('data-empty');
    });

    it('renders a newline in a text node as a line break', () => {
      const value: RichTextValue = [{ type: 'text', text: 'one\ntwo' }];
      render(<RichTextArea value={value} onChange={noop} onSearch={() => []} aria-label="Note" />);

      expect(getEditor().querySelectorAll('br')).toHaveLength(1);
    });
  });

  describe('slash command', () => {
    it('opens the picker and wraps the query in a slash input', async () => {
      const onSearch = vi.fn(() => PEOPLE);
      render(<RichTextArea value={[]} onChange={noop} onSearch={onSearch} aria-label="Note" />);

      pressSlash(getEditor());

      const span = getSlashSpan();
      expect(span).not.toBeNull();
      expect(span).toHaveTextContent('/');
      expect(span).toHaveAttribute('data-slash-empty', 'true');
      expect(await screen.findByRole('menu', { name: 'Entities to link' })).toBeInTheDocument();
      expect(onSearch).toHaveBeenCalledWith('');
    });

    it('shows recents instead of searching when the query is empty', async () => {
      const onSearch = vi.fn(() => MATTERS);
      render(<RichTextArea value={[]} onChange={noop} onSearch={onSearch} recents={PEOPLE} aria-label="Note" />);

      pressSlash(getEditor());

      expect(await screen.findByText('Ben Averill')).toBeInTheDocument();
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('searches as the query is typed', async () => {
      const onSearch = vi.fn(() => PEOPLE);
      render(<RichTextArea value={[]} onChange={noop} onSearch={onSearch} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      pressSlash(editor);
      typeQuery(editor, 'ben');

      await waitFor(() => expect(onSearch).toHaveBeenCalledWith('ben'));
      expect(getSlashSpan()).not.toHaveAttribute('data-slash-empty');
    });

    it('only triggers at a boundary, not mid-word', () => {
      const onSearch = vi.fn(() => PEOPLE);
      render(
        <RichTextArea
          value={[{ type: 'text', text: 'and' }]}
          onChange={noop}
          onSearch={onSearch}
          aria-label="Note"
        />,
      );

      const editor = getEditor();
      const text = editor.firstChild as Text;
      pressSlash(editor, text, text.length);

      expect(getSlashSpan()).toBeNull();
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('triggers after whitespace', async () => {
      const onSearch = vi.fn(() => PEOPLE);
      render(
        <RichTextArea
          value={[{ type: 'text', text: 'ask ' }]}
          onChange={noop}
          onSearch={onSearch}
          aria-label="Note"
        />,
      );

      const editor = getEditor();
      const text = editor.firstChild as Text;
      pressSlash(editor, text, text.length);

      expect(getSlashSpan()).not.toBeNull();
      await waitFor(() => expect(onSearch).toHaveBeenCalledWith(''));
    });
  });

  describe('picker keyboard', () => {
    it('inserts the active entity on Enter and reports the new value', async () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[]} onChange={onChange} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      pressSlash(editor);
      await screen.findByText('Ben Averill');

      fireEvent.keyDown(editor, { key: 'Enter' });

      expect(editor.querySelector('[data-entity-id="p1"]')).not.toBeNull();
      expect(getSlashSpan()).toBeNull();
      expect(onChange).toHaveBeenCalledWith([
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
        { type: 'text', text: ' ' },
      ]);
    });

    it('moves the active row with the arrow keys', async () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[]} onChange={onChange} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      pressSlash(editor);
      await screen.findByText('Ben Averill');

      fireEvent.keyDown(editor, { key: 'ArrowDown' });
      fireEvent.keyDown(editor, { key: 'Enter' });

      expect(editor.querySelector('[data-entity-id="p2"]')).not.toBeNull();
    });

    it('does not move above the first row', async () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[]} onChange={onChange} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      pressSlash(editor);
      await screen.findByText('Ben Averill');

      fireEvent.keyDown(editor, { key: 'ArrowUp' });
      fireEvent.keyDown(editor, { key: 'ArrowUp' });
      fireEvent.keyDown(editor, { key: 'Enter' });

      expect(editor.querySelector('[data-entity-id="p1"]')).not.toBeNull();
    });

    it('closes on Escape and leaves the query as plain text', async () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      pressSlash(editor);
      typeQuery(editor, 'ben');
      await screen.findByRole('menu', { name: 'Entities to link' });

      fireEvent.keyDown(editor, { key: 'Escape' });

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
      expect(getSlashSpan()).toBeNull();
      expect(editor.textContent).toContain('/ben');
    });

    it('leaves the picker closed for ordinary typing', () => {
      const onSearch = vi.fn(() => PEOPLE);
      render(<RichTextArea value={[]} onChange={noop} onSearch={onSearch} aria-label="Note" />);

      fireEvent.keyDown(getEditor(), { key: 'a' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe('serialization', () => {
    it('reports text and entities in document order', async () => {
      const onChange = vi.fn();
      const value: RichTextValue = [{ type: 'text', text: 'Ask ' }];
      render(
        <RichTextArea value={value} onChange={onChange} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />,
      );

      const editor = getEditor();
      const text = editor.firstChild as Text;
      pressSlash(editor, text, text.length);
      await screen.findByText('Ben Averill');
      fireEvent.keyDown(editor, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith([
        { type: 'text', text: 'Ask ' },
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
        { type: 'text', text: ' ' },
      ]);
    });

    it('drops an entity from the value when its tag is removed', () => {
      const onChange = vi.fn();
      const value: RichTextValue = [
        { type: 'text', text: 'Ask ' },
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
      ];
      render(<RichTextArea value={value} onChange={onChange} onSearch={() => []} aria-label="Note" />);

      const editor = getEditor();
      editor.querySelector('[data-entity-id="p1"]')?.remove();
      fireEvent.input(editor);

      // The separating space that follows a tag is ordinary text, so deleting the
      // tag leaves it behind - the surrounding runs then merge into one node.
      expect(onChange).toHaveBeenCalledWith([{ type: 'text', text: 'Ask  ' }]);
    });
  });
});
