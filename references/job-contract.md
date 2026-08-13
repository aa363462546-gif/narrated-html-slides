# HTML Job Contract

Use one directory per article:

```text
jobs/<template-id>/<job-name>/
├── manifest.json
├── source.md
├── layout-plan.json
├── slide-content.json
├── assets/fonts/      # when the selected template uses bundled local fonts
└── slides.html
```

All five files are mandatory. Do not create empty media or output directories.

`slide-content.json` contains slot data only. It never contains HTML, CSS, class names, coordinates, or DOM structure. The stable section and shell are cloned from the selected mother template by `scripts/assemble-slides.mjs`:

```json
{
  "version": 2,
  "title": "浏览器标题",
  "slides": [
    {
      "scene_id": "scene-01",
      "slots": {
        "eyebrow": "COMPUTER CONTROL",
        "title": "第四层：操控整台电脑",
        "subtitle": "computer use 让 AI 像人一样操作电脑。",
        "orbit_label": "AI / USER\nWORKFLOW"
      }
    }
  ]
}
```

The entries must match `layout-plan.json` exactly and in order. Slot names and item counts are fixed by the canonical schema for that layout/variant. Unknown or missing slots fail assembly. The assembler rejects the legacy `html` field and supplies the complete section, `aria-label`, layout attributes, page counters, deck shell, navigation, styles, and scripts from the approved mother template.

## Invariants

- `manifest.json` records `template`, `job_name`, and job-relative file paths only. It must not contain a project root, home directory, drive letter, or another machine-specific absolute path.
- `source.md` preserves the user's complete source.
- For SRT input, `source.md` preserves the SRT blocks and timestamps verbatim. Every planned scene records a continuous cue range and exact start/end seconds; no ordinary scene may exceed 15 seconds.
- `layout-plan.json` is written and validated before HTML. It covers the source exactly, records semantic role and item count, and selects only approved layouts with a concrete reason.
- `slide-content.json` uses `version: 2` and contains one slot-data entry per planned scene. It cannot contain authored markup. Task-specific build scripts are not job artifacts.
- Every output section is cloned from the exact `template.html` section matching its layout/variant. Its class tokens and DOM hierarchy are not authored by an Agent.
- `slides.html` uses exactly one bundled template and a fixed 1920 x 1080 stage. The bundled catalog itself may omit job ids and narration labels; the copied job output may not.
- Every slide is a `<section class="slide">` with a unique id and complete narration in `aria-label`.
- Each visible slide must use an approved layout from the selected template and remain within the authored 1920 x 1080 stage.
- Scene ids, narration, layout, variant, and order in `slides.html` must exactly match `layout-plan.json`.
- Every `visible_terms` entry must be visibly rendered inside its slide. Metadata and `aria-label` do not satisfy this requirement.
- Generated HTML must not contain machine-specific absolute paths or depend on `frontend-slides`.
- Multi-page HTML preserves the selected template's presentation shell and exposes visible previous/next controls. Keyboard, click, wheel, and touch navigation remain usable in a normal browser preview.
- Fonts used by the copied template are copied into the job and referenced with job-relative paths. Missing font requests are validation failures, not warnings.

Downstream audio, subtitle, timing, composition, and video files are deliberately outside this contract. They must not be added as empty placeholders merely to satisfy this Skill.

The template category is data-driven: `<template-id>` must match a complete directory under `assets/templates/`. Adding a future template directory makes that id available to `create-job.mjs`; the script does not maintain a hard-coded A/B list.
