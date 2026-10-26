/*
 * DOM editing for Rich Text Area's contenteditable surface. The editor holds only text nodes, `<br>`
 * line breaks (and the line `<div>`s a browser adds on Enter), tag hosts (`[data-entity-id]`,
 * contenteditable=false), and, while a `/` command is open, the query box (`[data-slash]`). These
 * helpers keep it that way when text is pasted or dropped, when a tag is deleted, and when the caret
 * reaches the query box's edge. They work on the DOM and the selection only; the component decides
 * when to call them and reports the value afterwards.
 */

/** Zero-width characters a browser can leave as caret filler beside a non-editable element. */
const FILLER = /^[\u200B\uFEFF]*$/;

export function isTagHost(node: Node | null | undefined): node is HTMLElement {
  return !!node && node.nodeType === Node.ELEMENT_NODE && !!(node as HTMLElement).dataset.entityId;
}

function isText(node: Node | null | undefined): node is Text {
  return !!node && node.nodeType === Node.TEXT_NODE;
}

/** An empty text node, or one holding only zero-width filler. */
function isFiller(node: Node | null | undefined): node is Text {
  return isText(node) && FILLER.test(node.data);
}

export function indexOf(node: Node): number {
  return node.parentNode ? Array.prototype.indexOf.call(node.parentNode.childNodes, node) : -1;
}

export function setCaret(node: Node, offset: number) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/** The number of characters of `root`'s text before a position inside it. */
export function textOffsetIn(root: Node, node: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(root, 0);
  range.setEnd(node, offset);
  return range.toString().length;
}

/** Whether nothing but empty or zero-width-only text follows a node in its parent. */
function endsItsParent(node: Node | null): boolean {
  let next = node;
  while (isFiller(next)) next = next.nextSibling;
  return next === null;
}

/**
 * Whether a `<br>` is a block's placeholder rather than a line break: the last thing in the editor
 * or in a line `<div>`. A browser shows no empty line after a block's last `<br>`; it keeps one there
 * so an empty line, or a line ending on a non-editable tag, can hold the caret.
 */
export function isPlaceholderBreak(br: Element, editor: HTMLElement): boolean {
  const parent = br.parentElement;
  if (!parent || !endsItsParent(br.nextSibling)) return false;
  return parent === editor || !window.getComputedStyle(parent).display.startsWith('inline');
}

/** The tag host a node sits in, if any. Some browsers can put the caret inside one. */
function closestHost(node: Node, editor: HTMLElement): HTMLElement | null {
  let element: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
  while (element && element !== editor) {
    if (element.dataset.entityId) return element;
    element = element.parentElement;
  }
  return null;
}

/**
 * Clipboard or dropped text as the editor takes it: plain text only, with every line-break form as
 * `\n` and other control characters removed.
 */
export function toPlainText(text: string): string {
  return (
    text
      .replace(/\r\n?|[\u2028\u2029]/g, '\n')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  );
}

/**
 * Insert plain text at a range in the editor, each `\n` as a `<br>` (the editor's own line break, as
 * when it hydrates from a value), replacing what the range covers, and put the caret after it. Only
 * text nodes and `<br>`s are created - never parsed markup - so nothing pasted can add elements,
 * attributes, styles, or URLs. A range edge inside a tag is moved outside it, so a tag is replaced
 * whole or not at all.
 */
export function insertPlainText(editor: HTMLElement, range: Range, rawText: string) {
  const text = toPlainText(rawText);
  if (range.collapsed) {
    const host = closestHost(range.startContainer, editor);
    if (host) range.setStartAfter(host);
    range.collapse(true);
  } else {
    const startHost = closestHost(range.startContainer, editor);
    if (startHost) range.setStartBefore(startHost);
    const endHost = closestHost(range.endContainer, editor);
    if (endHost) range.setEndAfter(endHost);
    range.deleteContents();
  }
  if (!text) {
    setCaret(range.startContainer, range.startOffset);
    return;
  }

  const lines = text.split('\n');
  const { startContainer: container, startOffset } = range;
  // Write into a text node: the one at the caret, the one beside it, or a new one.
  let textNode: Text;
  let offset = startOffset;
  if (isText(container)) {
    textNode = container;
  } else {
    const before = container.childNodes[startOffset - 1];
    const after = container.childNodes[startOffset];
    if (isText(before)) {
      textNode = before;
      offset = before.length;
    } else if (isText(after)) {
      textNode = after;
      offset = 0;
    } else {
      textNode = document.createTextNode('');
      container.insertBefore(textNode, after ?? null);
      offset = 0;
    }
  }

  textNode.insertData(offset, lines[0]);
  let caretNode: Node = textNode;
  let caretOffset = offset + lines[0].length;

  if (lines.length > 1) {
    const parent = textNode.parentNode as Node;
    const tail = caretOffset < textNode.length ? textNode.splitText(caretOffset) : null;
    const ref = tail ?? textNode.nextSibling;
    lines.slice(1).forEach((line, index, rest) => {
      parent.insertBefore(document.createElement('br'), ref);
      const isLast = index === rest.length - 1;
      if (isLast && tail) {
        tail.insertData(0, line);
        caretNode = tail;
        caretOffset = line.length;
      } else if (line) {
        const lineNode = document.createTextNode(line);
        parent.insertBefore(lineNode, ref);
        if (isLast) {
          caretNode = lineNode;
          caretOffset = line.length;
        }
      } else if (isLast) {
        if (endsItsParent(ref)) {
          // The text ended in a line break at the end of its block: add the placeholder `<br>` that
          // shows the new empty line, and put the caret on it.
          const placeholder = document.createElement('br');
          parent.insertBefore(placeholder, ref);
          caretNode = parent;
          caretOffset = indexOf(placeholder);
        } else if (isText(ref)) {
          caretNode = ref;
          caretOffset = 0;
        } else {
          caretNode = parent;
          caretOffset = ref ? indexOf(ref) : parent.childNodes.length;
        }
      }
    });
    if (textNode.length === 0) textNode.remove();
  }
  setCaret(caretNode, caretOffset);
}

/**
 * Remove a tag host, merge the text either side of it, and put the caret where it was. Empty text
 * nodes beside it go too, so nothing stray is left in the DOM.
 */
export function removeTag(host: HTMLElement) {
  const parent = host.parentNode as Node;
  let prev = host.previousSibling;
  let next = host.nextSibling;
  host.remove();
  while (isText(prev) && prev.length === 0) {
    const before: ChildNode | null = prev.previousSibling;
    prev.remove();
    prev = before;
  }
  while (isText(next) && next.length === 0) {
    const after: ChildNode | null = next.nextSibling;
    next.remove();
    next = after;
  }
  if (isText(prev) && isText(next)) {
    const at = prev.length;
    prev.appendData(next.data);
    next.remove();
    setCaret(prev, at);
  } else if (isText(prev)) {
    setCaret(prev, prev.length);
  } else if (isText(next)) {
    setCaret(next, 0);
  } else {
    setCaret(parent, next ? indexOf(next) : parent.childNodes.length);
  }
}

/**
 * Backspace (`backward`) or Delete (`forward`) with a collapsed caret directly beside a tag: remove
 * the whole tag, and any empty or zero-width-only text between it and the caret. "Directly beside"
 * is within the same line - at a line's start, Backspace still joins the line to the one above, as
 * in any text field. Returns whether a tag was removed; when it wasn't, the browser should delete
 * as usual.
 */
export function deleteTagAtCaret(editor: HTMLElement, direction: 'backward' | 'forward'): boolean {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || !selection.isCollapsed) return false;
  const { startContainer: node, startOffset: offset } = selection.getRangeAt(0);
  if (!editor.contains(node)) return false;

  const inside = closestHost(node, editor);
  if (inside) {
    removeTag(inside);
    return true;
  }

  const cleanups: Array<() => void> = [];
  let sibling: Node | null;
  if (isText(node)) {
    const beside = direction === 'backward' ? node.data.slice(0, offset) : node.data.slice(offset);
    if (!FILLER.test(beside)) return false;
    if (beside) {
      cleanups.push(() =>
        direction === 'backward' ? node.deleteData(0, offset) : node.deleteData(offset, node.length - offset),
      );
    }
    sibling = direction === 'backward' ? node.previousSibling : node.nextSibling;
  } else {
    sibling = (direction === 'backward' ? node.childNodes[offset - 1] : node.childNodes[offset]) ?? null;
  }
  while (isFiller(sibling)) {
    const filler = sibling;
    cleanups.push(() => filler.remove());
    sibling = direction === 'backward' ? filler.previousSibling : filler.nextSibling;
  }
  if (!isTagHost(sibling)) return false;
  cleanups.forEach((cleanup) => cleanup());
  removeTag(sibling);
  return true;
}

/** The query box's text node, made a single text node first if editing split it. */
export function slashTextNode(span: HTMLElement): Text {
  const first = span.firstChild;
  if (span.childNodes.length === 1 && isText(first)) return first;
  const text = document.createTextNode(span.textContent ?? '');
  span.replaceChildren(text);
  return text;
}

/** The nearest sibling in a direction, past empty and zero-width-only text nodes. */
function nonFillerSibling(node: Node, direction: 'previous' | 'next'): Node | null {
  let sibling = direction === 'previous' ? node.previousSibling : node.nextSibling;
  while (isFiller(sibling)) sibling = direction === 'previous' ? sibling.previousSibling : sibling.nextSibling;
  return sibling;
}

/** The nearest child before or after an element position, past empty and zero-width-only text. */
function nonFillerChild(parent: Node, offset: number, direction: 'previous' | 'next'): Node | null {
  let child: Node | null = (direction === 'previous' ? parent.childNodes[offset - 1] : parent.childNodes[offset]) ?? null;
  while (isFiller(child)) child = direction === 'previous' ? child.previousSibling : child.nextSibling;
  return child;
}

/**
 * Where a DOM position falls for the `/` query box: an offset into the box's text when the position
 * is inside the box or on either outside edge of it - the boundary Firefox and Safari can leave the
 * caret on, which looks the same on screen - or null when it's anywhere else. The offset is clamped
 * to after the `/`, so typing can't go in front of it.
 */
export function slashOffsetAt(span: HTMLElement, node: Node, offset: number): number | null {
  const length = (span.textContent ?? '').length;
  const first = Math.min(1, length);
  if (span.contains(node)) return Math.min(Math.max(textOffsetIn(span, node, offset), first), length);
  if (isText(node)) {
    if (offset === node.length && nonFillerSibling(node, 'next') === span) return first;
    if (offset === 0 && nonFillerSibling(node, 'previous') === span) return length;
    return null;
  }
  if (node === span.parentNode) {
    if (nonFillerChild(node, offset, 'next') === span) return first;
    if (nonFillerChild(node, offset, 'previous') === span) return length;
  }
  return null;
}

/** Put text into the query box between two of its text offsets, and the caret after it. */
export function insertIntoSlash(span: HTMLElement, start: number, end: number, text: string) {
  const node = slashTextNode(span);
  node.replaceData(start, end - start, text);
  setCaret(node, start + text.length);
}

/** A collapsed range at a viewport point, from whichever caret-from-point API the browser has. */
export function rangeFromPoint(x: number, y: number): Range | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  if (typeof doc.caretPositionFromPoint === 'function') {
    const position = doc.caretPositionFromPoint(x, y);
    if (!position) return null;
    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  }
  if (typeof doc.caretRangeFromPoint === 'function') return doc.caretRangeFromPoint(x, y);
  return null;
}
