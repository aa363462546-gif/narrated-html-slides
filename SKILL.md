---
name: narrated-html-slides
description: Turn a complete Chinese article or narration script into a fixed-stage slides.html using one of two bundled production templates. Use when Codex needs to create stable speaker-led HTML slides, choose Field Notes A or Dark Teal Intelligence, preserve approved layouts, and validate readability without frontend-slides. This Skill generates HTML only; external video renderers are outside its scope.
---

# Narrated HTML Slides

# Scope

Create speaker-led 1920 x 1080 HTML slides from a complete article or narration script. Use only the bundled A or B template. Do not call or read `frontend-slides`. Do not generate audio, subtitles, timing data, compositions, or video in this Skill; a separate renderer may consume the finished `slides.html` later.

## Workflow

1. Run `node scripts/doctor.mjs --json`. Stop only when Node or browser-based HTML QA is unavailable.
2. Read [references/design-system.md](references/design-system.md), then [references/template-selection.md](references/template-selection.md). Choose one template for the whole deck.
3. Create the job with `node scripts/create-job.mjs <template-id> <job-name> [output-root]`. This creates `jobs/<template-id>/<job-name>/manifest.json`; save the complete source beside it as `source.md`. If the user supplies SRT, preserve the original SRT including timestamps rather than flattening it into prose.
4. Read only the selected template's `design.md` and `template.html` under `assets/templates/`. Do not inspect a historical job or previously generated deck as an answer unless the user explicitly asks to reuse it.
5. Before writing HTML, create `layout-plan.json` using [references/layout-plan.md](references/layout-plan.md). Record every scene's complete narration, semantic role, item count, approved layout/variant, required visible names, and selection reason. For SRT input also record each page's continuous cue range and exact timestamps; target 6-12 seconds and never exceed 15 seconds. Run `node scripts/validate-layout-plan.mjs <job>/source.md <job>/layout-plan.json`. Do not write slide content until it passes.
6. Write only approved slot values to `<job>/slide-content.json` using the version 2 format in [references/job-contract.md](references/job-contract.md), then run `node scripts/assemble-slides.mjs <job>`. Never write HTML or CSS in this file. The assembler clones the exact canonical section for the planned layout/variant and owns every class, DOM level, decoration, coordinate, font, navigation control, and page counter. If a layout has no canonical slot schema, stop instead of inventing markup or creating a task-specific build script.
7. Run `node scripts/validate-slides.mjs <job>/slides.html --plan <job>/layout-plan.json` and fix every error before delivery. Report `layout-plan.json`, `slides.html`, the selected template, and the layout distribution.

## Non-Negotiable Rules

- Keep the source article and generated HTML traceable inside one job directory at `jobs/<template-id>/<job-name>/`.
- Never encode a machine-specific project root in the job contract. `manifest.json` stores template and job ids plus paths relative to its own directory, so another user can move the repository without editing the manifest.
- Never skip or backfill `layout-plan.json` after HTML generation.
- Never author slide inner HTML. `slide-content.json` contains slot data only; unknown slots, missing slots, arbitrary markup, and layouts without a canonical schema are hard failures.
- Never turn a long deck into repeated subtitle/title pages. Three identical layouts in sequence, excessive hero/title pages, or insufficient layout diversity are validation failures.
- When narration explicitly contains comparison, parallel items, ordered steps, metrics, evidence, or named tools, use the matching structural family recorded in the plan.
- For SRT input, every cue must belong to exactly one page. Ordinary pages should last 6-12 seconds and may never exceed 15 seconds; this prevents a four-minute narration from collapsing into a handful of static pages.
- Product, project, person, platform, and tool names that matter to the narration must be listed in `visible_terms` and shown as visible text. Metadata-only names are omissions.
- In B, exactly four comparable ideas, examples, components, or decisions use `values-grid / four-up`. A timeline is only for a real chronological or causal sequence; visual variety is not a reason to turn four peers into a line chart.
- Treat `01/02/03` as ordering metadata, never as a metric. Use a metric family only for a real value, ratio, percentage, amount, KPI, or measured quantity.
- Do not use adjacent `hero / lower-left` pages. Put multi-point summaries in a structural layout and reserve the sparse hero for one short final statement or CTA.
- A final sparse hero carries one short action only. Use `hero / center` for a short CTA; reserve `hero / lower-left` for a stronger reveal or closing statement that intentionally needs grounded editorial weight. If the source asks for both engagement and questions/comments, choose the primary action for visible copy or use a structural layout.
- Fill every reserved evidence zone with source meaning. A B dual-signal board needs concrete examples or a short process in both rows; an overlap roadmap keeps small `01–04` ordinals plus one supporting phrase per circle; a closing three-up grid gives every card both an explanation and a distinct result/consequence line.
- Keep each slide to one primary claim and at most three information levels.
- Keep spoken explanatory copy at least 48px and card/list supporting copy at least 36px on the 1920 x 1080 stage.
- Timeline endpoint labels must use the template's approved endpoint alignment class so the last item remains inside the stage. Never repair clipping by nudging a label beyond its approved geometry.
- Do not use hidden overflow or smaller text to conceal capacity failures.
- Do not copy demo wording from the bundled templates into the user's output.
- Do not add dashboard grids, arbitrary decorative cards, random colors, or unsupported page families.
- Do not write machine-specific absolute paths into generated artifacts.
- A multi-page `slides.html` must be directly reviewable: visible previous/next buttons must work, keyboard navigation must work, and local fonts must load without failed requests. Passing a static layout check is not enough.

## Resources

- [references/job-contract.md](references/job-contract.md): required HTML job files and invariants.
- [references/layout-plan.md](references/layout-plan.md): mandatory pre-HTML semantic planning contract and gates.
- [references/design-system.md](references/design-system.md): shared content and visual rules.
- [references/template-selection.md](references/template-selection.md): A/B and page-type selection.
- [references/dependencies.md](references/dependencies.md): Node and browser requirements for HTML QA.
- `assets/templates/`: bundled fixed-stage master templates.
- `scripts/`: deterministic job setup, environment, and HTML QA helpers.
