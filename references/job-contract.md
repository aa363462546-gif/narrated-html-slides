# HTML Job Contract

The core deliverable is `slides.html`. Planning and QA files support it; no audio or video artifact is generated, copied, edited, analyzed, mixed, or rendered.

```text
jobs/<template-id>/<job-name>/
├── manifest.json
├── source.md or source.srt
├── layout-plan.draft.json
├── layout-plan.json
├── coverage-plan.json
├── slide-content.json
├── assets/                 # user-supplied approved visual assets and bundled fonts only
├── qa-report.json
└── slides.html
```

## Input Types

- `text`: complete source in `source.md`.
- `srt_audio`: original SRT in `source.srt`; `manifest.json` may record a matching audio path as an external input reference. No script in this Skill may open or process that audio.

Input and output paths in the manifest are job-relative except an optional user-provided audio reference. Generated HTML must never contain machine-specific absolute paths.

## Artifact Scope

`manifest.json` declares `artifact_scope`:

- `approval_sample`: exactly three representative SRT pages selected before full-deck approval. Validation applies only to their declared cue ranges.
- `complete`: the final HTML deck. Source coverage applies to the complete text or every parsed SRT cue.

Create sample jobs with `--scope approval_sample`; the default is `complete`. A sample pass never implies complete-deck approval.

## Slot Content

`slide-content.json` uses registry-backed slot data only:

```json
{
  "version": 3,
  "theme": {"preset": "botanical-deep"},
  "slides": [
    {
      "scene_id": "scene-01",
      "layout_id": "field-notes-a--core-idea",
      "slots": {
        "title-01": {
          "segments": [
            {"text": "让 AI 操作", "tone": "primary"},
            {"text": "整台电脑", "tone": "accent"}
          ]
        }
      },
      "assets": {}
    }
  ]
}
```

- Plain-text slots accept strings only.
- Semantic-text slots accept ordered text segments and registered tones. One complete title may use at most two distinct tones; the same tone may appear in multiple discontinuous segments.
- HTML, CSS, `style`, class names, DOM fragments, coordinates, font declarations, and unregistered keys fail assembly.
- Asset slots accept only manifest-registered real files. Generated images require explicit user authorization recorded in the manifest.
- Missing assets make asset-dependent layouts unavailable; empty frames and fabricated screenshots are forbidden.

The assembler clones the exact section selected by stable `data-layout-id`, fills approved slots, and owns shell, DOM, classes, page counters, navigation, theme mapping, and semantic spans.
