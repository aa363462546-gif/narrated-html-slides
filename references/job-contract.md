# HTML Job Contract

Use one directory per article:

```text
jobs/<job-name>/
├── source.md
└── slides.html
```

`source.md` and `slides.html` are mandatory. Do not create empty media or output directories.

## Invariants

- `source.md` preserves the user's complete source.
- `slides.html` uses exactly one bundled template and a fixed 1920 x 1080 stage. The bundled catalog itself may omit job ids and narration labels; the copied job output may not.
- Every slide is a `<section class="slide">` with a unique id and complete narration in `aria-label`.
- Each visible slide must use an approved layout from the selected template and remain within the authored 1920 x 1080 stage.
- Generated HTML must not contain machine-specific absolute paths or depend on `frontend-slides`.

Downstream audio, subtitle, timing, composition, and video files are deliberately outside this contract. They must not be added as empty placeholders merely to satisfy this Skill.
