import assert from "node:assert/strict";
import test from "node:test";
import {extractCoverageItems, validateCoveragePlan} from "../scripts/lib/coverage-contract.mjs";
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

test("SRT entity extraction never joins cue boundaries or parallel acronyms", () => {
  const acronymSrt = `53
00:01:21,366 --> 00:01:22,400
平时学的PS  PR

54
00:01:22,766 --> 00:01:24,466
PRT  AI  AE这些教程

55
00:01:24,500 --> 00:01:25,500
OK，那我们继续。
`;
  const items = extractCoverageItems(acronymSrt, {sourceType: "srt_audio"});
  const names = items.filter((item) => item.type === "proper_name").map((item) => item.source_text);
  for (const name of ["PS", "PR", "PRT", "AI", "AE", "OK"]) assert.ok(names.includes(name), name);
  assert.ok(items.every((item) => !/[\r\n]/u.test(item.source_text)));
  assert.ok(!names.includes("PS PR PRT"));
  assert.ok(!names.includes("AI AE"));
  assert.deepEqual(items.filter((item) => ["PS", "PR"].includes(item.source_text)).map((item) => item.cue_start), [1, 1]);
  assert.deepEqual(items.filter((item) => ["PRT", "AI", "AE"].includes(item.source_text)).map((item) => item.cue_start), [2, 2, 2]);
});

test("ordinary spoken Latin terms can be classified without pretending an extraction omission", () => {
  const extracted = [{id: "coverage-001", source_text: "OK", type: "proper_name", extracted_by: "rule", cue_start: 1, cue_end: 1, display_policy: "review"}];
  const plan = {version: 2, artifact_scope: "approval_sample", scenes: [{scene_id: "scene-01"}]};
  const coverage = {version: 2, artifact_scope: "approval_sample", items: [{...extracted[0], classification: "ordinary_spoken_term", status: "not_required", classification_reason: "句首口播确认词，不是软件、项目或步骤名称"}]};
  assert.equal(validateCoveragePlan(coverage, extracted, plan).ok, true);
  coverage.items[0].classification = "named_entity";
  assert.equal(validateCoveragePlan(coverage, extracted, plan).ok, false);
});

test("approval samples select exactly three ordered non-overlapping high-risk cue segments", async () => {
  const sampleSrt = `1
00:00:00,000 --> 00:00:01,000
核心观点。

2
00:00:01,000 --> 00:00:02,000
过渡说明。

3
00:00:02,000 --> 00:00:03,000
Excel、VBA 和 Python。

4
00:00:03,000 --> 00:00:04,000
三个软件各有职责。

5
00:00:04,000 --> 00:00:05,000
另一个过渡。

6
00:00:05,000 --> 00:00:06,000
最后比较并总结三步。
`;
  const base = (scene_id, cue_start, cue_end, sample_role, layout_id, semantic_role, item_count) => ({
    scene_id, cue_start, cue_end, sample_role, sample_selection_reason: `${sample_role} 高风险内容代表`, core_content: sample_role,
    semantic_role, layout_id, item_count, layout_reason: "匹配样本风险类型", grouping_reason: "所选 cue 属于同一连续内容段",
    semantic_change: {present: true, type: semantic_role, requires_new_visual: true, reason: "进入新的样本风险类型"},
  });
  const sampleDraft = {version: 2, template: "field-notes-a", source_type: "srt_audio", scenes: [
    base("scene-01", 1, 1, "core_idea", "field-notes-a--core-idea", "concept", 1),
    base("scene-02", 3, 4, "named_entities", "field-notes-a--capability-grid", "parallel-items", 3),
    base("scene-03", 6, 6, "structured_content", "field-notes-a--process", "process", 3),
  ]};
  const sample = await finalizeLayoutPlan(sampleDraft, sampleSrt, {artifactScope: "approval_sample"});
  assert.equal(sample.ok, true, sample.errors.join("\n"));
  assert.equal(sample.plan.artifact_scope, "approval_sample");
  assert.deepEqual(sample.plan.scenes.map((scene) => [scene.cue_start, scene.cue_end]), [[1, 1], [3, 4], [6, 6]]);
  assert.deepEqual(sample.plan.scenes.map((scene) => scene.narration), ["核心观点。", "Excel、VBA 和 Python。\n三个软件各有职责。", "最后比较并总结三步。"]);
  const complete = await finalizeLayoutPlan(sampleDraft, sampleSrt, {artifactScope: "complete"});
  assert.equal(complete.ok, false);
  assert.match(complete.errors.join("\n"), /continuous|coverage/u);
  const unrepresentative = structuredClone(sampleDraft);
  unrepresentative.scenes[1].cue_start = 2;
  unrepresentative.scenes[1].cue_end = 2;
  const rejected = await finalizeLayoutPlan(unrepresentative, sampleSrt, {artifactScope: "approval_sample"});
  assert.equal(rejected.ok, false);
  assert.match(rejected.errors.join("\n"), /named_entities.*multiple.*name/iu);
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
