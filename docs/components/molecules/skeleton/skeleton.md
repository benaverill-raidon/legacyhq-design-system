# Skeleton

Skeleton is a placeholder shape shown in place of content that hasn't finished loading yet. It
pulses gently to signal that something is on its way, while preserving the layout the real content
will eventually fill - reducing perceived load time and avoiding layout shift.

Use Skeleton where the final shape of the content is already known: a text line, an avatar circle,
an image block, a card. Compose several Skeletons together to sketch out an entire loading layout.

Do not use Skeleton when the final shape is unknown - use Spinner for an indeterminate wait
instead of guessing at a layout. Do not use it when progress is measurable - that is ProgressBar's
job.

Skeleton is a molecule, not an atom, because it composes a sized, colored surface with a motion
treatment (the pulse) into a single named unit with its own variant surface (appearance, shape)
that neither piece owns alone - similar to how Icon Tile composes a colored container with an icon.

Skeleton renders a non-interactive `div`. It is decorative (`aria-hidden`) by default, since a
loading region typically already has its own surrounding context. Pass `label` only when a
Skeleton (or a group of them) is the sole indicator that content is loading.

Related components and patterns include Spinner (an indeterminate loading indicator with no
implied layout) and ProgressBar (a quantified, measurable loading state).
