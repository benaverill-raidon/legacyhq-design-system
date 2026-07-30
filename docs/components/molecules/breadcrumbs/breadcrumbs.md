# Breadcrumbs

Breadcrumbs are a navigation system used to show a user's location in a site or app - an ordered
trail from a root section down to the current page. They let people understand where they are in a
hierarchy and jump back to any ancestor in one step.

Use Breadcrumbs at the top of a page in deep or nested sections - multi-level settings, nested
folders/categories, a multi-step wizard's completed steps - wherever "how did I get here, and how
do I go back" is a real question.

Do not use Breadcrumbs as the primary navigation for a shallow or single-level app - it adds
hierarchy signal that doesn't exist. Do not use Breadcrumbs to show progress through a linear flow
that hasn't been visited yet (unvisited future steps) - that's Progress Indicator's job, not a
location trail. Do not put more than one Breadcrumbs trail on a page.

Breadcrumbs is a molecule because it composes the `Link` atom (each ancestor in the trail) and a
plain text label (the current page) into a single ordered-list unit with its own layout (separators,
spacing) - none of which any single atom owns today.

Breadcrumbs renders a `nav` landmark labelled `"Breadcrumb"` by default, containing an ordered list.
Every item except the last renders as a real `Link`; the last item in `items` always renders as
non-interactive text carrying `aria-current="page"`, following the WAI-ARIA breadcrumb pattern -
whether an item is "current" is driven by whether it has an `href`, not by a separate flag, so the
rule is simple: no `href` means "this is where you are."

Related components and patterns include Link (the atom every non-current crumb wraps), and Progress
Indicator (for step-based progress through a flow, rather than a location trail).
