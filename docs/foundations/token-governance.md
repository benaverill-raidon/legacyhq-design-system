# LegacyHQ Token Governance

## Overview

LegacyHQ uses a three-tier token architecture:

1. Primitive Tokens
2. Semantic Tokens
3. Component Tokens

The goal is to create a scalable, maintainable, and themeable design system while minimizing duplicate meanings.

---

# Tier 1: Primitive Tokens

Primitive tokens contain raw design values.

Examples:

* color.blue.500
* color.gray.100
* spacing.4
* radius.md
* shadow.sm

Rules:

* Primitives contain raw values only.
* Primitives should not represent intent.
* Components should never consume primitive tokens directly.

Example:

color.blue.500 = #0057FF

---

# Tier 2: Semantic Tokens

Semantic tokens represent meaning and intent.

Examples:

* color.background.primary
* color.background.brand
* color.text.primary
* color.text.inverse
* color.border.default

Rules:

* Semantic tokens should be the primary tokens consumed throughout the system.
* Semantic tokens map to primitive tokens.
* New semantic tokens should only be created when a new meaning is introduced.

Example:

color.background.brand
→ color.blue.500

---

# Tier 3: Component Tokens

Component tokens represent component-specific decisions.

Examples:

* button.primary.background
* button.primary.text
* alert.success.icon

Rules:

* Component tokens are exceptions, not defaults.
* Component tokens should generally alias semantic tokens.
* Component tokens should only exist when a component requires independent control, theming, or behavior.

Example:

button.primary.background
→ color.background.brand

---

# Component Token Creation Rule

Before creating a component token:

1. Search existing semantic tokens.
2. Determine whether a semantic token already expresses the same meaning.
3. Reuse the semantic token whenever possible.
4. Create a component token only when the semantic layer cannot adequately express the requirement.

If an equivalent semantic token exists:

DO NOT create a new component token.

Preferred:

Button Background
→ color.background.brand

Avoid:

button.primary.background
→ color.background.brand

unless there is a documented need for independent control.

---

# Naming Conventions

## Primitive

Format:

category.scale.value

Examples:

* color.blue.500
* spacing.4
* radius.md

---

## Semantic

Format:

category.role.state

Examples:

* color.background.primary
* color.background.brand
* color.text.primary
* color.border.default

---

## Component

Format:

component.variant.property

Examples:

* button.primary.background
* button.primary.text
* alert.success.icon

---

# Anti-Patterns

Avoid:

* Duplicate meanings
* Component tokens that mirror existing semantic tokens
* Component tokens that reference primitive values directly
* Creating tokens for a single isolated use case
* Creating semantic tokens that differ only by component name

Examples:

Bad:

button.primary.background
badge.primary.background
toast.primary.background

when all represent:

color.background.brand

Good:

color.background.brand

consumed consistently across components.

---

# Decision Framework

Before creating any token, ask:

1. Does a token already exist?
2. Can an existing semantic token be reused?
3. Will multiple components share this meaning?
4. Does the token represent meaning or implementation?

If a semantic token already expresses the meaning, reuse it.

When in doubt, prefer fewer tokens with clearer intent.
