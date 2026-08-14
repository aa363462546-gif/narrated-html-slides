---
name: narrated-html-slides
description: Turn a complete Chinese script, or matching SRT plus audio inputs, into stable speaker-led slides.html using the bundled Field Notes A or Dark Teal Intelligence templates. This Skill outputs HTML and planning/QA files only; it never generates, edits, mixes, or renders audio or video.
---

# Narrated HTML Slides

## Boundary

This is a self-contained HTML slide Skill. Read only files inside this Skill and the user-provided input paths. Never read or depend on `frontend-slides`, Hyperframes, Remocha, `narrated-video-pipeline`, or another project directory.

The core deliverable is `slides.html`. Supporting files may include `manifest.json`, `layout-plan.json`, `coverage-plan.json`, `slide-content.json`, and QA reports. SRT supplies ordered cue text and timestamps for traceability. Matching audio may be recorded as an input reference, but this Skill never opens, analyzes, copies, edits, generates, or combines audio. It never renders video. A separately requested complete-video task belongs to the independent `narrated-video-pipeline` after the HTML is approved.

## Director Workflow

1. Run `node scripts/doctor.mjs --json` and read the font publication status.
2. Read the complete source. Choose one template for the entire deck: Field Notes A for warm editorial narration, or Dark Teal Intelligence for structured evidence-led narration.
3. Read only that template's `design.md`, its `template.html`, and the shared machine registry at `assets/templates/layout-registry.json`.
4. Create a job with `node scripts/create-job.mjs <template-id> <job-name> [output-root] --input text|srt_audio --scope complete|approval_sample`.
5. Build `coverage-plan.json`: extract important software, projects, people, platforms, steps, numbers, comparisons, conclusions, and parallel items from the applicable source scope. SRT extraction operates cue by cue; it never joins names across cue boundaries or blank lines. Classify each candidate as a display-relevant named entity or a specifically explained ordinary spoken term. Map named entities to visible page content or give a specific approved omission reason; do not disguise extraction errors as omissions.
6. Build `layout-plan.draft.json`. Divide pages by semantic change and visual-display need, not by seconds. A new concept, tool, case, step, relationship, parallel group, or conclusion triggers a decision: keep it only when the current visual theme and registered layout capacity still express it accurately; otherwise add a page.
7. For SRT input, record `cue_start` and `cue_end` as 1-based inclusive positions in parsed cue order. Do not write `start_sec` or `end_sec`. Run `node scripts/finalize-layout-plan.mjs <job>`; it derives those values from the first and last cue timestamps and writes final `layout-plan.json`.
8. Write only registered slot values to `slide-content.json`. Agent-authored HTML, CSS, class names, coordinates, font changes, and arbitrary DOM are forbidden.
9. Run `node scripts/assemble-slides.mjs <job>`. It clones the registered mother section, fills approved slots/assets, applies one validated deck theme, and writes `slides.html`.
10. Run `node scripts/validate-job.mjs <job>`. Technical, canonical DOM, content coverage, visual, mobile, font, and publication statuses must be reported separately.
11. Before any complete real article, generate an `approval_sample` of exactly three A pages and three B pages for user review. Select three ordered, non-overlapping SRT segments whose internal cue ranges are continuous and represent these risks in order: `core_idea`, `named_entities`, `structured_content`. The second covers software/project-dense parallel content; the third covers a comparison, process, ordered steps, or conclusion. Sample coverage and QA apply only to the selected cue ranges. Full HTML generation and full-source coverage require explicit approval of those samples.

## Semantic Direction

- One slide has one primary claim and no more than three information levels.
- Keep full narration traceable while distilling visible copy. Never paste subtitle blocks into a display headline.
- Comparisons use comparison structures; parallel items use capacity-matched cards/lists; ordered steps use process/timeline structures; evidence and metrics use their real registered families.
- A page may remain visible for a long explanation when it still communicates the same accurate visual idea. Fast semantic changes may require short pages. Time length never determines page count.
- Parallel items may share a registered multi-item page or split across pages according to meaning, capacity, and readability.
- Important source names and enumerated items must be visible, not hidden only in `aria-label`.
- Do not omit facts, repeat the same visible sentence across roles, collapse distinct content into one generic headline, or split one idea into repetitive near-identical pages.
- If content does not fit, choose another production layout or split the page. Never shrink fonts, move coordinates, change card structure, or hide overflow.
- Prefer user-provided real images and evidence. Never generate images without explicit user authorization. If a required asset is missing, choose a non-asset layout.

## Theme And Emphasis

- A template fixes its visual language and font character, not one permanent color palette.
- Select one registered theme preset or submit one deck-wide semantic theme that passes the template's range, relationship, and contrast rules.
- No per-page themes, arbitrary CSS, or free color values outside the theme contract.
- A semantic title may contain multiple discontinuous emphasized segments, but the whole title may resolve to at most two distinct semantic colors. The Agent submits segments and tones; the assembler owns the spans and classes.
- A and B never exchange fonts. Missing approved fonts block publication; substitutions are forbidden.

## Acceptance Meaning

- Technical pass means the document opens and operates.
- Canonical pass means every generated page matches its registered normalized mother skeleton.
- Content pass means the declared scope is covered: selected cue ranges for `approval_sample`, or the entire source/SRT for `complete`.
- Visual pass means registered density, whitespace, capacity, overlap, bounds, and type rules pass at desktop and phone viewing sizes.
- Publication pass additionally requires exact approved local fonts.
- No lower-level pass may be reported as complete HTML acceptance.

## Resources

- `assets/templates/layout-registry.json`: single machine source for all A20 plus B31 layouts.
- `assets/templates/<template>/design.md`: template selection, capacity, visual character, theme, and prohibited use.
- `assets/templates/<template>/template.html`: exact mother DOM, geometry, components, and font roles.
- `references/job-contract.md`: inputs, outputs, slots, assets, and manifests.
- `references/layout-plan.md`: semantic pagination and SRT cue contract.
- `references/coverage-plan.md`: automatic source coverage contract.
- `references/dependencies.md`: local runtime and publication requirements.
