# LegacyHQ Design System Instructions

## Design System Source of Truth

Before creating or modifying design tokens, review:

* docs/foundations/token-governance.md

This document defines the official token architecture, naming conventions, and governance rules for the LegacyHQ Design System.

## Required Process

Before adding any token:

1. Search existing semantic tokens.
2. Determine whether an existing token satisfies the need.
3. Reuse existing tokens whenever possible.
4. Create new tokens only when necessary.

## Token Creation Priority

Always prefer:

Existing Semantic Token
→ New Semantic Token
→ New Component Token

Component tokens are the last resort.

## Design Philosophy

Favor consistency, maintainability, scalability, and themeability over local component optimization.

Avoid duplicate meanings represented by multiple tokens.

When unsure, recommend reusing an existing semantic token rather than creating a new component token.

## Required Output

Whenever creating a new token, explain:

* Why the token is needed
* Which existing semantic tokens were evaluated
* Why those tokens were insufficient
* Why a new token is justified

Do not create duplicate semantic or component tokens.
