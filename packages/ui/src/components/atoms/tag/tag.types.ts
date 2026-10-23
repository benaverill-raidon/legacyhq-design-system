import type * as React from 'react';

export type TagTone =
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'orange'
  | 'magenta'
  | 'brand';

export type TagSize = 'sm' | 'md';

export interface TagProps extends React.HTMLAttributes<HTMLElement> {
  /** `md`, the default, is 32px tall; `sm` is 24px, for dense rows and inline text. Text and icons are the same size at both. */
  size?: TagSize;
  /**
   * The color set for the fill, border, and text. `default` is neutral and `brand` is the product
   * color; the others are accent colors with no fixed meaning, for telling kinds of records apart.
   */
  tone?: TagTone;
  /** Makes the tag a link to this address: the whole tag, or the content beside the remove button. */
  href?: string;
  /** The link's native `target`. With `_blank` and no `rel`, Tag adds `rel="noopener noreferrer"`. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  /** The link's native `rel`, used as given. Leave it unset with `target="_blank"` to get `noopener noreferrer`. */
  rel?: string;
  /** Adds a remove button after the content, a separate control from the link. Handle it with `onRemove`. */
  isRemovable?: boolean;
  /**
   * Greys the tag out. A link gets `aria-disabled`, leaves the tab order, and doesn't navigate; the
   * remove button and an interactive tag are natively disabled. A display-only tag only changes its look.
   */
  disabled?: boolean;
  /** @deprecated Use `disabled`. Still accepted and treated the same; `disabled` wins when both are set. */
  isDisabled?: boolean;
  /**
   * Renders a tag with no `href` as a `button`, for a tag that opens something, such as Tag Group's
   * overflow tag. Passing `onClick` does the same. In a removable tag, the content beside the remove
   * button becomes the button. Ignored with `href`.
   */
  isInteractive?: boolean;
  /** An icon before the text, set to 16px at both sizes. It takes the tag's text color. */
  elemBefore?: React.ReactNode;
  /** Called when the remove button is clicked, unless the tag is disabled. Take the tag out of your list here: Tag doesn't remove itself. */
  onRemove?: () => void;
  /**
   * The remove button's accessible name. Defaults to "Remove" and the text when `children` is a
   * string, otherwise "Remove tag". Set it to translate it, or to name a tag whose children aren't text.
   */
  removeLabel?: string;
  /**
   * Makes a tag with no `href` a `button`, like `isInteractive`: in a removable tag, the content
   * beside the remove button. On a link it runs on click. Not called while disabled, and never by
   * the remove button.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** The visible text, on one line. Required. It ends with an ellipsis when the tag is narrower than its text. */
  children: React.ReactNode;
}
