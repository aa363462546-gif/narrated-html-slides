# Layout Plan Contract

Write and validate `layout-plan.json` before creating `slides.html`.

```json
{
  "version": 1,
  "template": "field-notes-a",
  "scenes": [
    {
      "scene_id": "scene-01",
      "narration": "完整、连续、未经改写的本页旁白",
      "semantic_role": "opening",
      "item_count": 1,
      "layout": "cover",
      "variant": null,
      "visible_terms": [],
      "reason": "开场只表达一个总主题"
    }
  ]
}
```

For Dark Teal Intelligence, use its approved family in `layout` and approved named variant in `variant`. For Field Notes A, use the approved `data-template-type` name in `layout` and `null` in `variant`.

Allowed semantic roles are: `opening`, `question`, `concept`, `parallel-items`, `comparison`, `process`, `evidence`, `metric`, `audience`, `timeline`, `roadmap`, `caution`, and `closing`.

When the input is SRT, preserve `source.md` as the original SRT and add these fields to every scene:

```json
{
  "cue_start": 1,
  "cue_end": 6,
  "start_sec": 0.066,
  "end_sec": 12.066
}
```

Cue numbers are 1-based and inclusive. Ranges must be continuous, cover every cue once, and match the cue timestamps exactly. Aim for 6-12 seconds per ordinary page; 15 seconds is the hard maximum. If a semantic unit is longer, split it across multiple approved layouts instead of compressing it into one page.

## Planning Rules

- Preserve the complete source across scene narrations exactly and in order. Visible copy may be condensed later; narration may not.
- Put every product, project, person, platform, or tool name that the audience must see into `visible_terms`. An empty array is valid only when the scene contains no such required name. These terms must appear in visible slide copy; `aria-label` does not count.
- Count the actual semantic items. A comparison has two sides; three named tools have item count three; ordered stages use their real count.
- Count concrete examples and summary pillars even on opening and closing pages. A multi-item opening needs a structured hero variant; a multi-item closing needs a structural summary before the final CTA.
- Select the layout from meaning and capacity, not from visual variety alone.
- Do not use a hero/title page for ordinary explanatory paragraphs, lists, comparisons, tools, steps, metrics, or evidence.
- Use `metric` only when the source contains a real value, ratio, percentage, amount, KPI, or measured quantity. Plain `01/02/03` ordering is metadata, not a metric.
- In Dark Teal Intelligence, three unordered concepts use `values-grid / three-up`: the index stays subordinate and the semantic title is the primary reading layer.
- In Dark Teal Intelligence, exactly four peer ideas, examples, components, or decisions use `values-grid / four-up`. Use `timeline` only when order or cause-and-effect is the meaning, not merely because four items can be numbered.
- In Dark Teal Intelligence, a `hero / dual-signal` opening must carry concrete examples or process nouns in both signal rows. `roadmap / overlap-four` keeps small `01–04` ordinals plus one supporting phrase per circle. A closing `values-grid / three-up` card needs both an explanation and a distinct result/consequence line.
- Do not place two `hero / lower-left` pages next to each other. A multi-point summary must use a structural family; reserve the final sparse hero for one short closing or CTA.
- Count distinct calls to action as distinct items. A short final CTA uses `hero / center`; `hero / lower-left` is for a deliberate closing statement, not the default CTA. Two actions require a structural layout or one action must be selected as the visible focus while the full narration stays in `aria-label`.
- Do not inspect an old generated job to recover its page choices unless the user explicitly requests reuse. Evaluation and new work must depend on the source, this contract, the selected `design.md`, and its mother template.
- For decks with 8 or more scenes, never repeat the same layout three times consecutively and keep title/hero pages at or below 30%.
- Decks with 8–11 scenes require at least 3 distinct layouts, 12–23 require 4, and 24 or more require 6. This is a collapse detector, not a target: use every additional structure the content genuinely requires.

Run:

```bash
node scripts/validate-layout-plan.mjs <job>/source.md <job>/layout-plan.json
```

Only after it passes may the Agent create HTML. Then enforce correspondence with:

```bash
node scripts/validate-slides.mjs <job>/slides.html --plan <job>/layout-plan.json
```
