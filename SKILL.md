---
name: narrated-html-slides
description: Turn a complete Chinese article or narration script into a fixed-stage slides.html using one of two bundled production templates. Use when Codex needs to create stable speaker-led HTML slides, choose Field Notes A or Dark Teal Intelligence, preserve approved layouts, and validate readability without frontend-slides. This Skill generates HTML only; external video renderers are outside its scope.
---

# Narrated HTML Slides

# Scope

Create speaker-led 1920 x 1080 HTML slides from a complete article or narration script. Use only the bundled A or B template. Do not call or read `frontend-slides`. Do not generate audio, subtitles, timing data, compositions, or video in this Skill; a separate renderer may consume the finished `slides.html` later.

## Workflow

1. Run `node scripts/doctor.mjs --json`. Stop only when Node or browser-based HTML QA is unavailable.
2. Create a job with `node scripts/create-job.mjs <job-name> [output-root]` and save the complete source as `source.md`.
3. Read [references/design-system.md](references/design-system.md), then [references/template-selection.md](references/template-selection.md). Choose one template for the whole deck.
4. Read only the selected template's `design.md` and `template.html` under `assets/templates/`. The bundled file is a visual catalog: copy approved slide sections into the job, add a unique scene id, and put the complete matching source passage in `aria-label`. Replace content; do not invent a new geometry, font system, card family, or page-specific coordinates.
5. Keep source narration and visible copy separate. Condense visible copy without changing facts. If content exceeds a layout's capacity, split the scene or select another approved layout. Run `node scripts/validate-slides.mjs <job>/slides.html` and fix every error before delivery.
6. Report the generated `slides.html` path and the selected template. Any audio, subtitle, or video work happens later in a separate tool or workflow and is not performed by this Skill.

## Non-Negotiable Rules

- Keep the source article and generated HTML traceable inside one job directory.
- Keep each slide to one primary claim and at most three information levels.
- Keep spoken explanatory copy at least 48px and card/list supporting copy at least 36px on the 1920 x 1080 stage.
- Do not use hidden overflow or smaller text to conceal capacity failures.
- Do not copy demo wording from the bundled templates into the user's output.
- Do not add dashboard grids, arbitrary decorative cards, random colors, or unsupported page families.
- Do not write machine-specific absolute paths into generated artifacts.

## Resources

- [references/job-contract.md](references/job-contract.md): required HTML job files and invariants.
- [references/design-system.md](references/design-system.md): shared content and visual rules.
- [references/template-selection.md](references/template-selection.md): A/B and page-type selection.
- [references/dependencies.md](references/dependencies.md): Node and browser requirements for HTML QA.
- `assets/templates/`: bundled fixed-stage master templates.
- `scripts/`: deterministic job setup, environment, and HTML QA helpers.
