# V4 Job Contract

Each task has one content file and two generated outputs:

```text
job/
├── deck.json
├── assets/
├── slides.html
└── qa-report.json
```

`deck.json` is the only content plan. The selected `template` supplies the visual system: fonts, theme presets, fixed stage, navigation shell, and reusable CSS components. Every page copies one existing mother layout from that template and replaces its audience-facing text; it is not a free HTML redesign.

## Source And Pages

For SRT plus audio:

```json
{
  "version": 4,
  "title": "Deck title",
  "template": "field-notes-a",
  "source": {
    "type": "srt_audio",
    "srt": "/absolute/source.srt"
  },
    "permissions": {"generated_images": false, "external_assets": false},
  "theme": {"preset": "botanical-deep"},
  "pages": [
    {
      "id": "scene-01",
      "cue_range": [1, 4],
      "visual_form": "question",
      "content_html": "<div class=\"question\"><h2>插件到底装哪几个？</h2><div class=\"two-lines\"><p>上百个插件。</p><p>先看清优先级。</p></div></div>",
      "must_show": {"terms": ["ChatGPT"], "groups": [["插件", "上百个"]]},
      "assets": {}
    }
  ]
}
```

For complete text input, replace `cue_range` with the exact consecutive `source_text`. Do not invent timestamps.

`cue_range` determines when a page appears. It does not decide what deserves to be shown or prove that the page explains its cues. Under `complete`, page ranges cover every cue exactly once and in order, but each page must visibly carry the spoken section in its own range. The assembler derives narration and timing from the ranges and never opens the audio path.

## Composition Rules

- `content_html` is the audience-facing content inserted into a copied mother layout. Use the selected template's existing classes and structure. Do not add a new layout, inline positioning system, new class, or new CSS variable.
- Do not include `script`, `style`, event-handler attributes, external URLs, or active media elements in page content.
- Asset paths must be job-relative, declared in `assets`, and allowed by the deck permissions.
- `visual_form` records the selected template mother layout for human traceability.
- Do not include `layout`, `slots`, `director`, or parallel planning files.
- `must_show` is optional author metadata. It never authorizes repetition and is not a Build gate.
- The page may use as much or as little text as its spoken section needs. If the next cue no longer fits the current visual explanation, create another page.

The assembler owns the fixed stage, theme, fonts, navigation, page metadata, and source timing. The Agent owns the content order, visual interpretation, composition, and page boundaries. The assembler does not open or require an audio file.

## QA Meaning

`qa-report.json` contains only:

- `build`: deck/template/final-HTML consistency, source coverage, safe page markup, required visible terms, and asset authorization.
- `review_required`: always `true` until the user visually accepts the result.

Build does not prove that the Agent understood the narration, chose the right page boundary, made the named software a visual focus, or made an attractive page. There is no geometry gate: layout and readability are reviewed against the narration by the user, and a layout problem is fixed in the page composition rather than by shrinking content to satisfy a checker.
