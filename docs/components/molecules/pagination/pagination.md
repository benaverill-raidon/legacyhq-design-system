# Pagination

Pagination divides a large amount of content into smaller chunks across multiple pages, and lets
people jump directly to a specific page rather than only stepping forward or backward one page at
a time.

Use Pagination for paged tables, search results, or lists where jumping to a specific page (not
just "next") is genuinely useful, and where the total number of pages is known up front.

Do not use Pagination for infinite-scroll or "load more" content - there's no fixed page count to
navigate between. Do not use Pagination for step-based flows (a wizard, onboarding) - that's
Progress Indicator's job, not a content-paging control. Do not use Pagination when there are only
one or two pages - the control adds navigation overhead a simple "next" affordance wouldn't.

Pagination is a molecule because it composes existing atoms - `ToggleButton` for each page number
and `IconButton` for the previous/next controls - into a single unit with its own layout algorithm
(which page numbers to show, where to collapse into an ellipsis) that no single atom owns.

Pagination is fully controlled: it takes `currentPage` and `totalPages` and calls `onPageChange`
with the page the user picked - it does not manage page state internally. The current page is
marked with `aria-current="page"` in addition to `ToggleButton`'s own pressed styling, and the
previous/next controls disable automatically at the first and last page.

Related components and patterns include Toggle Button and Icon Button (the atoms Pagination always
wraps), and Progress Indicator (for step-based flow progress instead of content paging).
