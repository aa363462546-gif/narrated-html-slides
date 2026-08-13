import assert from "node:assert/strict";
import test from "node:test";
import {extractCoverageItems} from "../scripts/lib/coverage-contract.mjs";
import {finalizeLayoutPlan, parseSrt} from "../scripts/lib/plan-contract.mjs";

const srt = `10
00:00:00,500 --> 00:00:08,250
先介绍 Excel 和 3 个步骤。

30
00:00:08,250 --> 00:00:32,750
然后比较 VBA 与 Python，仍然属于同一个观点。
`;

const draft = {
  version: 2,
  template: "field-notes-a",
  source_type: "srt_audio",
  scenes: [{
    scene_id: "scene-01",
    cue_start: 1,
    cue_end: 2,
    core_content: "Excel 自动化及两种方式的比较",
    semantic_role: "comparison",
    layout_id: "field-notes-a--dual-compare",
    item_count: 2,
    layout_reason: "两种方式需要并列比较",
    grouping_reason: "前后共同解释同一个自动化观点，双栏仍能准确承载",
    semantic_change: {present: true, type: "comparison", requires_new_visual: true, reason: "进入VBA与Python对比"},
  }],
};

test("SRT cue indexes are parsed-order one-based positions, independent of source labels", () => {
  const cues = parseSrt(srt);
  assert.deepEqual(cues.map((cue) => [cue.position, cue.source_label]), [[1, "10"], [2, "30"]]);
});

test("finalization derives exact scene timestamps and allows long same-idea pages", async () => {
  const result = await finalizeLayoutPlan(draft, srt);
  assert.equal(result.ok, true, result.errors?.join("\n"));
  assert.equal(result.plan.scenes[0].start_sec, 0.5);
  assert.equal(result.plan.scenes[0].end_sec, 32.75);
  assert.match(result.plan.scenes[0].narration, /Excel/u);
  assert.doesNotMatch(JSON.stringify(result), /15s|minimum page|duration exception/iu);
});

test("agents cannot supply start_sec or end_sec in the draft", async () => {
  const invalid = structuredClone(draft);
  invalid.scenes[0].start_sec = 999;
  const result = await finalizeLayoutPlan(invalid, srt);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /must be derived/u);
});

test("cue ranges must cover parsed cues once in continuous order", async () => {
  const invalid = structuredClone(draft);
  invalid.scenes[0].cue_start = 2;
  const result = await finalizeLayoutPlan(invalid, srt);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /continuous/u);
});

test("coverage extraction finds names, numbers, comparisons, and enumerated items", () => {
  const items = extractCoverageItems("使用 Excel，分为第一步采集、第二步清洗、第三步导出；比较 VBA 与 Python，成本下降 30%。");
  const text = items.map((item) => item.source_text).join("|");
  assert.match(text, /Excel/u);
  assert.match(text, /VBA/u);
  assert.match(text, /Python/u);
  assert.match(text, /30%/u);
  assert.ok(items.some((item) => item.type === "step"));
  assert.ok(items.some((item) => item.type === "comparison"));
});

test("text plans cover the complete source exactly and in order", async () => {
  const scene = {
    scene_id: "scene-01", narration: "只覆盖前半段。", core_content: "前半段", semantic_role: "concept",
    layout_id: "field-notes-a--core-idea", item_count: 1, layout_reason: "单概念", grouping_reason: "同一主题",
    semantic_change: {present: true, type: "concept", requires_new_visual: true, reason: "进入概念"},
  };
  const result = await finalizeLayoutPlan({version: 2, template: "field-notes-a", source_type: "text", scenes: [scene]}, "只覆盖前半段。还漏了后半段。");
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /complete source exactly and in order/u);
});
