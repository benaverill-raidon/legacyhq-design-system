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

    it('applies size and context', () => {
      render(
        <RichTextArea value={[]} onChange={noop} onSearch={() => []} size="lg" context="inline" aria-label="Note" />,
      );

      const editor = getEditor();
      expect(editor).toHaveClass(styles.size_lg);
      expect(editor).toHaveClass(styles.context_inline);
    });

    it('still accepts the deprecated appearance, mapping subtle and inline to the inline context', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} appearance="subtle" aria-label="Note" />);
      expect(getEditor()).toHaveClass(styles.context_inline);
    });

    it('takes the wiring Field passes: description, required, invalid, and its label', () => {
      render(
        <>
          <span id="label">Notes</span>
          <span id="help">Mention a matter with /</span>
          <RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-labelledby="label" aria-describedby="help" aria-invalid required />
        </>,
      );
      const editor = screen.getByRole('textbox', { name: 'Notes' });
      expect(editor).toHaveAccessibleDescription('Mention a matter with /');
      expect(editor).toHaveAttribute('aria-required', 'true');
      expect(editor).toHaveAttribute('aria-invalid', 'true');
      expect(editor).toHaveAttribute('data-invalid', 'true');
    });

    it('marks a disabled editor with aria-disabled', () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => []} disabled aria-label="Note" />);
      expect(getEditor()).toHaveAttribute('aria-disabled', 'true');
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

    it('follows a disabled fieldset around it, as a native control does, and its changes', async () => {
      const { rerender } = render(
        <fieldset disabled>
          <RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-label="Note" />
        </fieldset>,
      );

      const editor = getEditor();
      expect(editor).toHaveAttribute('contenteditable', 'false');
      expect(editor).toHaveAttribute('data-disabled', 'true');
      expect(editor).toHaveAttribute('aria-disabled', 'true');
      expect(editor).toHaveAttribute('tabindex', '-1');

      rerender(
        <fieldset>
          <RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-label="Note" />
        </fieldset>,
      );
      await waitFor(() => expect(getEditor()).toHaveAttribute('contenteditable', 'true'));
      expect(getEditor()).not.toHaveAttribute('aria-disabled');
    });

    it("isn't disabled by a disabled fieldset when it sits in that fieldset's legend", () => {
      render(
        <fieldset disabled>
          <legend>
            <RichTextArea value={[]} onChange={noop} onSearch={() => []} aria-label="Note" />
          </legend>
        </fieldset>,
      );

      expect(getEditor()).toHaveAttribute('contenteditable', 'true');
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

    it('shows a trailing newline as an empty last line, and reports it back once', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'text', text: 'one\n' }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);

      const editor = getEditor();
      expect(editor.querySelectorAll('br')).toHaveLength(2);
      fireEvent.input(editor);
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'one\n' }]);
    });

    it('reports the value back unchanged, adding no space between a tag and the text after it', () => {
      const onChange = vi.fn();
      const value: RichTextValue = [
        { type: 'text', text: 'Ask ' },
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
        { type: 'text', text: ' about it' },
      ];
      render(<RichTextArea value={value} onChange={onChange} onSearch={() => []} aria-label="Note" />);

      fireEvent.input(getEditor());
      expect(onChange).toHaveBeenLastCalledWith(value);
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

    it('points assistive technology at the highlighted row while the list is open', async () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      expect(editor).toHaveAttribute('aria-haspopup', 'menu');
      expect(editor).not.toHaveAttribute('aria-activedescendant');
      pressSlash(editor);
      const menu = await screen.findByRole('menu', { name: 'Entities to link' });

      expect(document.getElementById(editor.getAttribute('aria-controls') ?? '')).toContainElement(menu);
      await waitFor(() => expect(document.getElementById(editor.getAttribute('aria-activedescendant') ?? '')).toHaveTextContent('Ben Averill'));
      fireEvent.keyDown(editor, { key: 'ArrowDown' });
      await waitFor(() => expect(document.getElementById(editor.getAttribute('aria-activedescendant') ?? '')).not.toHaveTextContent('Ben Averill'));
    });

    it('closes the list when Tab moves focus on', async () => {
      render(<RichTextArea value={[]} onChange={noop} onSearch={() => PEOPLE} recents={PEOPLE} aria-label="Note" />);

      const editor = getEditor();
      pressSlash(editor);
      await screen.findByRole('menu', { name: 'Entities to link' });

      fireEvent.keyDown(editor, { key: 'Tab' });

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
      expect(editor).not.toHaveAttribute('aria-controls');
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

    it('cancels bold, italic, and underline, which the value has no way to keep', () => {
      render(<RichTextArea value={[{ type: 'text', text: 'Ask' }]} onChange={noop} onSearch={() => []} aria-label="Note" />);

      for (const inputType of ['formatBold', 'formatItalic', 'formatUnderline']) {
        const event = new InputEvent('beforeinput', { inputType, bubbles: true, cancelable: true });
        getEditor().dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
      }
    });
  });

  describe('paste and drop', () => {
    const RICH_HTML = [
      '<script>window.__pwned = true</script>',
      '<img src="x" onerror="window.__pwned = true">',
      '<span style="color: red; font-size: 40px">Styled</span> ',
      '<a href="javascript:alert(1)">link</a>',
      '<p>second line</p>',
    ].join('');
    const RICH_PLAIN = 'Styled link\r\nsecond line';

    function clipboard(data: Record<string, string>) {
      return { getData: (type: string) => data[type] ?? '', types: Object.keys(data) };
    }

    /** No element in the editor other than line breaks and tag hosts with their tags. */
    function foreignElements(editor: HTMLElement) {
      return Array.from(editor.querySelectorAll('*')).filter(
        (el) => el.tagName !== 'BR' && !el.closest('[data-entity-id]'),
      );
    }

    it('pastes rich HTML as plain text only: no scripts, images, styles, links, or attributes', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      caretAt(editor, 0);

      const notCancelled = fireEvent.paste(editor, {
        clipboardData: clipboard({ 'text/html': RICH_HTML, 'text/plain': RICH_PLAIN }),
      });

      expect(notCancelled).toBe(false);
      expect(foreignElements(editor)).toEqual([]);
      expect(editor.innerHTML).not.toMatch(/script|img|onerror|style=|href|javascript/i);
      expect(editor.innerHTML).toBe('Styled link<br>second line');
      expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Styled link\nsecond line' }]);
    });

    it('keeps each pasted line break as a line break, and puts the caret after the paste', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'text', text: 'ab' }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      caretAt(editor.firstChild as Text, 1);

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': 'one\ntwo\r\n\nthree' }) });

      expect(editor.querySelectorAll('br')).toHaveLength(3);
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'aone\ntwo\n\nthreeb' }]);
      // Typing would continue right after the pasted text, before the "b".
      const selection = window.getSelection() as Selection;
      expect(selection.anchorNode?.textContent).toBe('threeb');
      expect(selection.anchorOffset).toBe(5);
    });

    it('pasted text ending in a line break at the end opens the new empty line', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'text', text: 'a' }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      caretAt(editor.firstChild as Text, 1);

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': 'b\n' }) });

      // The second <br> is the placeholder that shows the empty line; the value has one line break.
      expect(editor.innerHTML).toBe('ab<br><br>');
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'ab\n' }]);
      expect(window.getSelection()?.anchorNode).toBe(editor);
      expect(window.getSelection()?.anchorOffset).toBe(2);
    });

    it('replaces the selected text, and never pastes an image or other non-text', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'text', text: 'hello world' }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      const text = editor.firstChild as Text;
      const range = document.createRange();
      range.setStart(text, 6);
      range.setEnd(text, 11);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': 'there' }) });
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'hello there' }]);

      caretAt(editor.firstChild as Text, 0);
      fireEvent.paste(editor, { clipboardData: clipboard({ 'image/png': 'binary', 'text/html': '<img src="x">' }) });
      expect(editor.querySelector('img')).toBeNull();
      expect(editor.textContent).toBe('hello there');
    });

    it('pastes beside a tag without splitting or copying it', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill' } }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      caretAt(editor, 0);

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': 'Ask ' }) });

      expect(editor.querySelectorAll('[data-entity-id]')).toHaveLength(1);
      expect(onChange).toHaveBeenLastCalledWith([
        { type: 'text', text: 'Ask ' },
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill' } },
        { type: 'text', text: ' ' },
      ]);
    });

    it('pastes a single word into an open `/` query, and anything with spaces closes it as text', async () => {
      const onSearch = vi.fn(() => PEOPLE);
      render(<RichTextArea value={[]} onChange={noop} onSearch={onSearch} aria-label="Note" />);
      const editor = getEditor();
      pressSlash(editor);

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': 'ben' }) });
      expect(getSlashSpan()).toHaveTextContent('/ben');
      await waitFor(() => expect(onSearch).toHaveBeenCalledWith('ben'));

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': ' and <b>Jess</b>' }) });
      expect(getSlashSpan()).toBeNull();
      expect(editor.innerHTML).toBe('/ben and &lt;b&gt;Jess&lt;/b&gt;');
    });

    it('drops text from outside as plain text at the drop point', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'text', text: 'ab' }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      const text = editor.firstChild as Text;
      const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range };
      doc.caretRangeFromPoint = () => {
        const range = document.createRange();
        range.setStart(text, 1);
        return range;
      };
      try {
        const notCancelled = fireEvent.drop(editor, {
          clientX: 10,
          clientY: 10,
          dataTransfer: clipboard({ 'text/html': '<img src="x" onerror="alert(1)"><i>x</i>', 'text/plain': 'x' }),
        });
        expect(notCancelled).toBe(false);
      } finally {
        delete doc.caretRangeFromPoint;
      }
      expect(foreignElements(editor)).toEqual([]);
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'axb' }]);
    });

    it('moves a tag dragged within the editor, keeping it a tag', () => {
      const onChange = vi.fn();
      const value: RichTextValue = [
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill' } },
        { type: 'text', text: ' then' },
      ];
      render(<RichTextArea value={value} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      const host = editor.querySelector('[data-entity-id="p1"]') as HTMLElement;
      const end = editor.lastChild as Text;
      const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range };
      doc.caretRangeFromPoint = () => {
        const range = document.createRange();
        range.setStart(end, end.length);
        return range;
      };
      try {
        fireEvent.dragStart(host.firstChild as HTMLElement, { dataTransfer: clipboard({}) });
        fireEvent.drop(editor, { clientX: 10, clientY: 10, dataTransfer: clipboard({ 'text/plain': 'Ben Averill' }) });
      } finally {
        delete doc.caretRangeFromPoint;
      }
      expect(editor.querySelectorAll('[data-entity-id]')).toHaveLength(1);
      expect(editor.lastChild).toBe(host);
      expect(onChange).toHaveBeenLastCalledWith([
        { type: 'text', text: ' then' },
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill' } },
      ]);
    });

    it('handles a drop onto a tag too, putting the text after the tag', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[{ type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill' } }]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      const label = screen.getByText('Ben Averill');
      const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range };
      doc.caretRangeFromPoint = () => {
        const range = document.createRange();
        range.setStart(label.firstChild as Text, 3);
        return range;
      };
      try {
        // A tag is a portal: the drop lands in it, and the editor must still handle it.
        const notCancelled = fireEvent.drop(label, { clientX: 10, clientY: 10, dataTransfer: clipboard({ 'text/html': '<b>bold</b>', 'text/plain': 'bold' }) });
        expect(notCancelled).toBe(false);
      } finally {
        delete doc.caretRangeFromPoint;
      }
      expect(label).toHaveTextContent('Ben Averill');
      expect(foreignElements(editor)).toEqual([]);
      expect(onChange).toHaveBeenLastCalledWith([
        { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill' } },
        { type: 'text', text: 'bold ' },
      ]);
    });

    it('takes only plain text from a paste that reaches beforeinput', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[]} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      const editor = getEditor();
      caretAt(editor, 0);
      const event = new InputEvent('beforeinput', { inputType: 'insertFromPaste', bubbles: true, cancelable: true });
      Object.defineProperty(event, 'dataTransfer', {
        value: clipboard({ 'text/html': '<img src=x onerror=alert(1)>', 'text/plain': 'safe' }),
      });

      editor.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(editor.innerHTML).toBe('safe');
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'safe' }]);
    });

    it('ignores paste and drop while disabled', () => {
      const onChange = vi.fn();
      render(<RichTextArea value={[]} onChange={onChange} onSearch={() => []} disabled aria-label="Note" />);
      const editor = getEditor();
      caretAt(editor, 0);

      fireEvent.paste(editor, { clipboardData: clipboard({ 'text/plain': 'x' }) });
      fireEvent.drop(editor, { dataTransfer: clipboard({ 'text/plain': 'x' }) });

      expect(editor.textContent).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('deleting a tag', () => {
    const BEN = { id: 'p1', entityType: 'person', label: 'Ben Averill' };
    const JESS = { id: 'p2', entityType: 'person', label: 'Jess Averill' };

    function host(id = 'p1') {
      return getEditor().querySelector(`[data-entity-id="${id}"]`) as HTMLElement;
    }

    /** No empty text nodes and no zero-width characters anywhere in the editor's own text. */
    function expectClean(editor: HTMLElement) {
      editor.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          expect((node as Text).length).toBeGreaterThan(0);
          expect((node as Text).data).not.toMatch(/[\u200B\uFEFF]/);
        }
      });
    }

    function renderValue(value: RichTextValue) {
      const onChange = vi.fn();
      render(<RichTextArea value={value} onChange={onChange} onSearch={() => []} aria-label="Note" />);
      return { editor: getEditor(), onChange };
    }

    it('Backspace directly after a tag removes the whole tag, merging the text either side', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);
      caretAt(host().nextSibling as Text, 0);

      expect(fireEvent.keyDown(editor, { key: 'Backspace' })).toBe(false);

      expect(host()).toBeNull();
      expect(editor.childNodes).toHaveLength(1);
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask  ' }]);
      expect(window.getSelection()?.anchorOffset).toBe(4);
    });

    it('Backspace in text after a tag deletes a character, as usual', () => {
      const { editor } = renderValue([{ type: 'entity', entity: BEN }, { type: 'text', text: 'more' }]);
      caretAt(editor.lastChild as Text, 2);

      expect(fireEvent.keyDown(editor, { key: 'Backspace' })).toBe(true);
      expect(host()).not.toBeNull();
    });

    it('Backspace removes a tag at the start of a line, and keeps the line break', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'one\n' }, { type: 'entity', entity: BEN }]);
      caretAt(host().nextSibling as Text, 0);

      fireEvent.keyDown(editor, { key: 'Backspace' });

      expect(host()).toBeNull();
      expect(editor.querySelectorAll('br')).toHaveLength(1);
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'one\n ' }]);
      expectClean(editor);
    });

    it('Backspace at the start of a line under a tag joins the lines, leaving the tag', () => {
      const { editor } = renderValue([{ type: 'entity', entity: BEN }, { type: 'text', text: '\ntwo' }]);
      caretAt(editor.lastChild as Text, 0);

      expect(fireEvent.keyDown(editor, { key: 'Backspace' })).toBe(true);
      expect(host()).not.toBeNull();
    });

    it('Backspace removes a tag at the end of a line, with an empty text node left between', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'one ' }, { type: 'entity', entity: BEN }, { type: 'text', text: '\ntwo' }]);
      // The user deleted text after the tag, leaving an empty text node before the line break.
      const empty = document.createTextNode('');
      host().after(empty);
      caretAt(empty, 0);

      fireEvent.keyDown(editor, { key: 'Backspace' });

      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'one \ntwo' }]);
      expectClean(editor);
    });

    it("doesn't report the placeholder <br> a browser leaves where a line ended on a tag as a line break", () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);
      // Chrome, deleting the space after a tag at the end, puts a placeholder <br> in its place.
      host().nextSibling?.remove();
      editor.appendChild(document.createElement('br'));
      fireEvent.input(editor);
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);

      caretAt(editor, 2);
      fireEvent.keyDown(editor, { key: 'Backspace' });

      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask ' }]);
    });

    it('Backspace and Delete between two adjacent tags remove the tag on their side', () => {
      const { editor, onChange } = renderValue([{ type: 'entity', entity: BEN }, { type: 'entity', entity: JESS }]);
      // The user deleted the space between them.
      host('p1').nextSibling?.remove();
      caretAt(editor, 1);

      fireEvent.keyDown(editor, { key: 'Backspace' });
      expect(host('p1')).toBeNull();
      expect(host('p2')).not.toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'entity', entity: JESS }, { type: 'text', text: ' ' }]);

      // The tags as they were, caret between them again: Delete takes the one after.
      cleanup();
      const second = renderValue([{ type: 'entity', entity: BEN }, { type: 'entity', entity: JESS }]);
      host('p1').nextSibling?.remove();
      caretAt(second.editor, 1);
      fireEvent.keyDown(second.editor, { key: 'Delete' });
      expect(host('p2')).toBeNull();
      expect(host('p1')).not.toBeNull();
      expect(second.onChange).toHaveBeenLastCalledWith([{ type: 'entity', entity: BEN }, { type: 'text', text: ' ' }]);
    });

    it('Delete at the start of the editor removes a tag there; Backspace there does nothing', () => {
      const { editor, onChange } = renderValue([{ type: 'entity', entity: BEN }, { type: 'text', text: 'x' }]);
      caretAt(editor, 0);

      expect(fireEvent.keyDown(editor, { key: 'Backspace' })).toBe(true);
      expect(host()).not.toBeNull();

      fireEvent.keyDown(editor, { key: 'Delete' });
      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'x' }]);
      expectClean(editor);
    });

    it('Delete directly before a tag in text removes it', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);
      caretAt(editor.firstChild as Text, 4);

      fireEvent.keyDown(editor, { key: 'Delete' });

      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask  ' }]);
    });

    it('Backspace removes a tag at the end of the editor', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);
      host().nextSibling?.remove();
      caretAt(editor, editor.childNodes.length);

      fireEvent.keyDown(editor, { key: 'Backspace' });

      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask ' }]);
      expectClean(editor);
    });

    it('Backspace removes a tag that is the only content, leaving the editor empty', () => {
      const { editor, onChange } = renderValue([{ type: 'entity', entity: BEN }]);
      host().nextSibling?.remove();
      caretAt(editor, 1);

      fireEvent.keyDown(editor, { key: 'Backspace' });

      expect(editor.childNodes).toHaveLength(0);
      expect(editor).toHaveAttribute('data-empty', 'true');
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('removes zero-width filler between the caret and the tag along with it', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);
      const after = host().nextSibling as Text;
      after.data = '\uFEFF ';
      editor.insertBefore(document.createTextNode('\u200B'), after);
      caretAt(after, 1);

      fireEvent.keyDown(editor, { key: 'Backspace' });

      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask  ' }]);
      expectClean(editor);
    });

    it('removes a tag whole from a beforeinput delete (keyboards without a usable keydown)', () => {
      const { editor, onChange } = renderValue([{ type: 'text', text: 'Ask ' }, { type: 'entity', entity: BEN }]);
      caretAt(host().nextSibling as Text, 0);
      const event = new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true });

      editor.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(host()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith([{ type: 'text', text: 'Ask  ' }]);
    });
  });

  describe('query box caret guard', () => {
    /** Open the query box between two runs of text: "ask " + [/] + "later". */
    function openBetween() {
      const onSearch = vi.fn(() => PEOPLE);
      render(<RichTextArea value={[{ type: 'text', text: 'ask later' }]} onChange={noop} onSearch={onSearch} aria-label="Note" />);
      const editor = getEditor();
      const text = editor.firstChild as Text;
      pressSlash(editor, text, 4);
      const span = getSlashSpan() as HTMLElement;
      return { editor, span, before: span.previousSibling as Text, after: span.nextSibling as Text, onSearch };
    }

    function selectionChange() {
      document.dispatchEvent(new Event('selectionchange'));
    }

    function typeChar(editor: HTMLElement, data: string) {
      const event = new InputEvent('beforeinput', { inputType: 'insertText', data, bubbles: true, cancelable: true });
      editor.dispatchEvent(event);
      return event;
    }

    it('moves a caret on the outside end edge of the box back inside it', async () => {
      const { span, after } = openBetween();
      await screen.findByRole('menu');
      caretAt(after, 0);

      selectionChange();

      const selection = window.getSelection() as Selection;
      expect(selection.anchorNode).toBe(span.firstChild);
      expect(selection.anchorOffset).toBe(1);
      expect(getSlashSpan()).toBe(span);
    });

    it('moves a caret on the element-level edges, or in front of the `/`, to just after the `/`', async () => {
      const { editor, span, before } = openBetween();
      await screen.findByRole('menu');

      caretAt(before, before.length);
      selectionChange();
      expect(window.getSelection()?.anchorNode).toBe(span.firstChild);
      expect(window.getSelection()?.anchorOffset).toBe(1);

      caretAt(span.firstChild as Text, 0);
      selectionChange();
      expect(window.getSelection()?.anchorOffset).toBe(1);

      typeQuery(editor, 'be');
      caretAt(editor, Array.prototype.indexOf.call(editor.childNodes, span) + 1);
      selectionChange();
      expect(window.getSelection()?.anchorNode).toBe(span.firstChild);
      expect(window.getSelection()?.anchorOffset).toBe(3);
    });

    it('closes the box when the caret moves away from it, leaving the caret there', async () => {
      const { before } = openBetween();
      await screen.findByRole('menu');
      caretAt(before, 1);

      selectionChange();

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
      expect(getSlashSpan()).toBeNull();
      expect(window.getSelection()?.anchorNode).toBe(before);
      expect(window.getSelection()?.anchorOffset).toBe(1);
    });

    it('routes text typed on the outside edge into the query', async () => {
      const { editor, span, after, onSearch } = openBetween();
      await screen.findByRole('menu');
      caretAt(after, 0);

      const event = typeChar(editor, 'b');

      expect(event.defaultPrevented).toBe(true);
      expect(span).toHaveTextContent('/b');
      expect(after.data).toBe('later');
      await waitFor(() => expect(onSearch).toHaveBeenCalledWith('b'));
      expect(window.getSelection()?.anchorNode).toBe(span.firstChild);
      expect(window.getSelection()?.anchorOffset).toBe(2);
    });

    it('a space typed into the query ends it, keeping the text and the caret after the space', async () => {
      const { editor, span } = openBetween();
      await screen.findByRole('menu');
      caretAt(span.firstChild as Text, 1);
      typeChar(editor, 'b');

      typeChar(editor, ' ');

      expect(getSlashSpan()).toBeNull();
      expect(editor.textContent).toBe('ask /b later');
      const selection = window.getSelection() as Selection;
      expect(selection.anchorNode?.textContent).toBe('/b ');
      expect(selection.anchorOffset).toBe(3);
    });

    it('lets text typed away from the box go where the caret is, and closes the box', async () => {
      const { editor, before } = openBetween();
      await screen.findByRole('menu');
      caretAt(before, 0);

      const event = typeChar(editor, 'x');

      expect(event.defaultPrevented).toBe(false);
      expect(getSlashSpan()).toBeNull();
    });

    it('closes the box when the arrow keys move past either end of the query', async () => {
      const { editor, span } = openBetween();
      await screen.findByRole('menu');
      typeQuery(editor, 'be');

      caretAt(span.firstChild as Text, 2);
      fireEvent.keyDown(editor, { key: 'ArrowRight' });
      expect(getSlashSpan()).toBe(span);

      caretAt(span.firstChild as Text, 3);
      fireEvent.keyDown(editor, { key: 'ArrowRight' });
      expect(getSlashSpan()).toBeNull();
      expect(editor.textContent).toBe('ask /belater');
      // The caret stays where it was in the text; the browser's own arrow move happens from there.
      expect(window.getSelection()?.anchorNode?.textContent).toBe('/be');
      expect(window.getSelection()?.anchorOffset).toBe(3);
    });

    it('ArrowLeft over the `/` closes the box too', async () => {
      const { editor, span } = openBetween();
      await screen.findByRole('menu');
      caretAt(span.firstChild as Text, 1);

      fireEvent.keyDown(editor, { key: 'ArrowLeft' });

      expect(getSlashSpan()).toBeNull();
    });
  });
});
