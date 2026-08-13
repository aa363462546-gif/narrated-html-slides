# Field Notes A Template Guide

This document explains how to use Field Notes A. `template.html` is the exact DOM, geometry, component, and font-role source; `../layout-registry.json` is the machine source for capacities, slots, visual zones, and canonical fingerprints. This guide does not define the overall generation workflow.

## Character

Field Notes A is warm, editorial, reflective, and speaker-led. It uses botanical line geometry, an interior frame, restrained texture, generous hierarchy, serif display copy, sans-serif explanation, and mono structural labels. It is suitable for education, creator workflows, psychology, personal knowledge, and narrative explanation.

The template does not require permanent deep green. One coordinated deck theme may change semantic colors while preserving this contrast pattern:

- background remains darkest;
- surfaces remain close to the background and visibly separated by rules;
- primary text remains the highest-contrast reading layer;
- muted text remains readable but subordinate;
- primary accent carries botanical structure and main emphasis;
- secondary accent carries contrast, caution, or punctuation.

Default preset `botanical-deep`:

| Role | Value |
|---|---|
| background | `#0E1711` |
| surface | `#1F301F` |
| text_primary | `#F2EDDC` |
| text_muted | `#B7BDA5` |
| accent_primary | `#D5E576` |
| accent_secondary | `#B87552` |

Custom themes must pass registry hue/lightness/saturation ranges and WCAG contrast checks. Per-page colors, direct CSS variables, and independently selected decoration colors are forbidden.

## Fonts

- Display and structured headings: **Noto Serif SC**.
- Explanatory copy: **Noto Sans SC**.
- Labels, numbers, codes, and navigation: **DM Mono**.

These identities cannot be replaced or borrowed from B. Publication is blocked until the exact approved families, weights, and licenses are bundled and browser-verified. A fallback render is development evidence only.

## A20 Layout Catalogue

Agent may select, repeat, and reorder these layouts. Selecting a layout clones that section only; it does not preserve the mother catalogue's sample order.

| Stable ID | Use and capacity |
|---|---|
| `field-notes-a--cover` | Opening title and one support statement |
| `field-notes-a--question` | One question with two interpretations |
| `field-notes-a--core-idea` | One concept and its fixed visual metaphor |
| `field-notes-a--capability-grid` | Exactly three parallel capabilities |
| `field-notes-a--platform-list` | Named platforms/categories within registered slot capacity |
| `field-notes-a--data-fields` | Data fields/types plus one conclusion |
| `field-notes-a--process` | Exactly three ordered steps |
| `field-notes-a--caution` | Risks, prohibitions, or ethical boundary |
| `field-notes-a--support` | One lead statement plus three supports |
| `field-notes-a--closing` | One concise takeaway or CTA |
| `field-notes-a--single-card` | One framed concept requiring a full surface |
| `field-notes-a--dual-compare` | Exactly two equal comparison sides |
| `field-notes-a--stacked-compare` | Exactly two “not X / but Y” layers |
| `field-notes-a--quote-card` | One memorable statement or quote |
| `field-notes-a--quad-card-grid` | Exactly four peer items |
| `field-notes-a--six-card-grid` | Exactly six short peer items |
| `field-notes-a--split-vertical-list` | One claim plus exactly three right-side items |
| `field-notes-a--hierarchy-stack` | Exactly three semantic levels |
| `field-notes-a--tool-list` | Exactly three named tools/products |
| `field-notes-a--large-explainer` | One chapter statement plus substantial explanation |

Exact slots, item counts, and text-role count live in the registry. If content exceeds them, change layout or split the scene.

## Controlled Variation

- One deck-wide validated theme.
- Approved semantic tones only inside registry-declared semantic-text slots.
- A title may emphasize multiple discontinuous terms but may resolve to no more than two distinct semantic colors.
- Only slot text changes. Field Notes A has no image slots.

## Visual Prohibitions

- Do not change fonts, DOM, coordinates, type sizes, leading, tracking, card counts, decorative geometry, or navigation behavior.
- Do not add photographs, screenshots, charts, logos, video, QR codes, icons, or empty media placeholders.
- Do not leave informational layouts with required zones empty or content compressed into one corner.
- Do not copy mother demonstration prose.
- Do not retain old catalogue order, video timeline attributes, focus choreography, or external-project rules in generated jobs.
