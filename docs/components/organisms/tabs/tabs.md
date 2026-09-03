# Tabs

## Purpose

Tabs is an organism that lets people switch between related peer views in the same context. `Tabs`
renders an accessible tab bar from a `tabs` array and manages the selected value (controlled or
uncontrolled); optional `TabPanel` children render each view and are wired to their tab
automatically.

## When to use

Use Tabs to switch between peer views of the same subject - Overview / Activity / Documents - or to
organize a page section into a few related panels without navigating away.

## When not to use

Do not use Tabs for navigation between pages or routes; use links or a navigation component. Do not
use it for a sequence of steps; use a Progress Tracker / stepper. Do not use it for many (10+)
sections; consider a select or a side navigation.

## Design intent

Tabs has two visual `type`s: `line` (the default) draws a 3px underline on the selected tab over a
shared bottom border; `contained` renders radius-lg pill tabs, filling the selected one with a
selected surface. Labels use `heading-xs`; unselected tabs are `content/subtle` (darkening to
`content/default` on hover), and the selected tab is `content/selected`. The bottom border defaults
on for `line` and off for `contained` and is toggled with `showBorder`.

The component is data-driven (a `tabs` array, matching the repo's Menu style) but connects panels
ergonomically: provide a `TabPanel` per value and Tabs wires the ARIA and visibility. Panels are
optional, so the bar can be used on its own.

## Accessibility expectations

The tab list is a `role="tablist"` and must be labelled (`aria-label` or `aria-labelledby`). Tabs are
`role="tab"` with `aria-selected` and `aria-controls`; panels are `role="tabpanel"` labelled by their
tab. Selection follows the arrow keys (Left/Right, wrapping) plus Home/End, skipping disabled tabs;
only the selected tab is in the tab order (roving tabindex), and Tab then moves into the panel. Focus
uses the shared Focus Ring, and disabled tabs use the native `disabled` attribute.

## Related components

- Menu
- Progress Tracker
- Focus Ring
