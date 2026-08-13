# HTML Job Contract

Use one directory per article:

```text
jobs/<template-id>/<job-name>/
├── manifest.json
├── source.md
├── layout-plan.json
├── assets/fonts/      # when the selected template uses bundled local fonts
└── slides.html
```

All four files are mandatory. Do not create empty media or output directories.

## Invariants

- `manifest.json` records `template`, `job_name`, and job-relative file paths only. It must not contain a project root, home directory, drive letter, or another machine-specific absolute path.
- `source.md` preserves the user's complete source.
- `layout-plan.json` is written and validated before HTML. It covers the source exactly, records semantic role and item count, and selects only approved layouts with a concrete reason.
- `slides.html` uses exactly one bundled template and a fixed 1920 x 1080 stage. The bundled catalog itself may omit job ids and narration labels; the copied job output may not.
- Every slide is a `<section class="slide">` with a unique id and complete narration in `aria-label`.
- Each visible slide must use an approved layout from the selected template and remain within the authored 1920 x 1080 stage.
- Scene ids, narration, layout, variant, and order in `slides.html` must exactly match `layout-plan.json`.
- Generated HTML must not contain machine-specific absolute paths or depend on `frontend-slides`.
- Multi-page HTML preserves the selected template's presentation shell and exposes visible previous/next controls. Keyboard, click, wheel, and touch navigation remain usable in a normal browser preview.
- Fonts used by the copied template are copied into the job and referenced with job-relative paths. Missing font requests are validation failures, not warnings.

Downstream audio, subtitle, timing, composition, and video files are deliberately outside this contract. They must not be added as empty placeholders merely to satisfy this Skill.

The template category is data-driven: `<template-id>` must match a complete directory under `assets/templates/`. Adding a future template directory makes that id available to `create-job.mjs`; the script does not maintain a hard-coded A/B list.
