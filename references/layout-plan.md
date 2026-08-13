# Semantic Layout Plan Contract

Page boundaries follow semantic change, visual-display need, registered layout capacity, and cue continuity. They never follow a duration target or minimum-page formula.

## SRT Cue Numbering

`cue_start` and `cue_end` are positions in parsed SRT cue order. They are **1-based and inclusive**. Original numeric labels in the SRT are preserved as source metadata but are not used as indexes, because real files may skip or repeat labels.

Agents write only cue ranges in `layout-plan.draft.json`. They must not write `start_sec` or `end_sec`. `scripts/finalize-layout-plan.mjs` derives:

- `start_sec` from the selected first cue's real start timestamp;
- `end_sec` from the selected last cue's real end timestamp.

## Scene Contract

```json
{
  "scene_id": "scene-01",
  "cue_start": 1,
  "cue_end": 5,
  "core_content": "三个工具及各自职责",
  "semantic_role": "parallel-items",
  "layout_id": "field-notes-a--capability-grid",
  "item_count": 3,
  "layout_reason": "三项同层级内容需要三卡片结构",
  "grouping_reason": "共同回答同一问题并且没有超过母版容量",
  "semantic_change": {
    "present": true,
    "type": "parallel-items",
    "requires_new_visual": true,
    "reason": "叙述从总论进入三个具体对象"
  }
}
```

Finalization adds exact `start_sec`, `end_sec`, and narration from those cues. Cue ranges must cover all parsed cues once, continuously, and in order.

## Pagination Decisions

- Reconsider the visual whenever a new concept, software, project, case, step, comparison, parallel group, or conclusion appears.
- Keep content on one page when it remains one visual theme and the chosen registered layout expresses it accurately within capacity.
- Add a page when a new structure, relation, card group, emphasis, evidence object, or visual focus is needed.
- A long explanation of one effective visual may remain one page. Rapid semantic changes may create short pages.
- Parallel items may share one capacity-matched layout or split across pages according to meaning and readability.
- Do not combine clearly different content to reduce page count. Do not split one content unit into repetitive pages without visual need.

Validation checks cue continuity, semantic-change records, registry compatibility, content capacity, coverage mappings, and repeated-page collapse. It performs no duration threshold or page-count calculation.
