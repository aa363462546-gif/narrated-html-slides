#!/usr/bin/env node
import {execFile} from "node:child_process";
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {promisify} from "node:util";
import {extractCoverageItems} from "./lib/coverage-contract.mjs";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "probes");
const semantic = (...segments) => ({segments: segments.map(([text, tone]) => ({text, tone}))});
const common = (scene_id, narration, semantic_role, layout_id, item_count, core_content) => ({
  scene_id, narration, core_content, semantic_role, layout_id, item_count,
  layout_reason: `使用已登记的 ${layout_id} 表达当前${semantic_role}内容`,
  grouping_reason: "本页内容属于同一视觉主题并且没有超过母版容量",
  semantic_change: {present: true, type: semantic_role, requires_new_visual: true, reason: `进入新的${semantic_role}展示`},
});

const decks = [{
  directory: "field-notes-a-v2", template: "field-notes-a", preset: "botanical-deep", title: "Field Notes A V2 Probe",
  scenes: [
    common("scene-01", "Mac上的协作可以同时做到：后台执行、同步推进、过程留痕。", "parallel-items", "field-notes-a--capability-grid", 3, "Mac协作的三项能力"),
    common("scene-02", "面对同一任务，Excel适合直接整理表格，VBA适合把重复步骤自动化。", "comparison", "field-notes-a--dual-compare", 2, "Excel与VBA的职责对比"),
    common("scene-03", "完整流程分为三步：理解目标、执行操作、检查结果。", "process", "field-notes-a--process", 3, "三步执行流程"),
  ],
  slides: [
    {scene_id: "scene-01", layout_id: "field-notes-a--capability-grid", assets: {}, slots: {"eyebrow-01": "MAC WORKFLOW", "title-01": semantic(["Mac 协作", "primary"], ["三项能力", "accent"]), "cap-no-01": "01", "h3-01": "后台执行", "p-01": "任务推进，不打断操作。", "cap-no-02": "02", "h3-02": "同步推进", "p-02": "人与系统同步推进。", "cap-no-03": "03", "h3-03": "过程留痕", "p-03": "关键步骤可回看、可复核。"}},
    {scene_id: "scene-02", layout_id: "field-notes-a--dual-compare", assets: {}, slots: {"eyebrow-01": "TOOL BOUNDARY", "title-01": semantic(["同一任务", "primary"], ["两种职责", "accent"]), "compare-label-01": "DIRECT / 整理", "h3-01": "Excel", "p-01": "直接整理内容、公式、格式和图表。", "compare-index-01": "A", "compare-label-02": "AUTOMATE / 自动化", "h3-02": "VBA", "p-02": "把重复步骤变成可复用规则。", "compare-index-02": "B"}},
    {scene_id: "scene-03", layout_id: "field-notes-a--process", assets: {}, slots: {"eyebrow-01": "THREE-STEP FLOW", "title-01": semantic(["从目标", "primary"], ["走到结果", "accent"]), "num-01": "STEP 01", "h3-01": "理解目标", "p-01": "确认输入、范围和完成标准。", "num-02": "STEP 02", "h3-02": "执行操作", "p-02": "按已确认规则完成具体任务。", "num-03": "STEP 03", "h3-03": "检查结果", "p-03": "回读关键内容并确认没有遗漏。", "command-01": "UNDERSTAND → EXECUTE → VERIFY"}},
  ],
}, {
  directory: "dark-teal-intelligence-v2", template: "dark-teal-intelligence", preset: "intelligence-teal", title: "Dark Teal Intelligence V2 Probe",
  scenes: [
    common("scene-01", "Excel负责直接改表，VBA负责把重复规则自动化，两者能力边界不同。", "comparison", "dark-teal-intelligence--compare--capability-boundary", 2, "Excel与VBA能力边界"),
    common("scene-02", "表格工作包含内容、公式、格式和图表四类操作。", "parallel-items", "dark-teal-intelligence--values-grid--four-up", 4, "四类表格操作"),
    common("scene-03", "spreadsheets让ChatGPT进入Excel工作环境，重点是直接完成任务。", "concept", "dark-teal-intelligence--editorial--statement-mark", 1, "办公控制的核心价值"),
  ],
  slides: [
    {scene_id: "scene-01", layout_id: "dark-teal-intelligence--compare--capability-boundary", assets: {}, slots: {"section-label-01": "CAPABILITY BOUNDARY", "headline-01": semantic(["直接改表", "primary"], ["规则自动化", "accent"]), "capability-mark-01": "✓", "capability-title-01": semantic(["Excel", "primary"]), "capability-copy-01": "面向当前文件，直接处理表格内容。", "capability-caption-01": "DIRECT WORK", "capability-mark-02": "?", "capability-title-02": semantic(["VBA", "accent"]), "capability-copy-02": "面向重复任务，把步骤固化成规则。", "capability-caption-02": "REPEATABLE RULES", "footer-logo-01": "INTELLIGENCE", "footer-year-01": "2026"}},
    {scene_id: "scene-02", layout_id: "dark-teal-intelligence--values-grid--four-up", assets: {}, slots: {"section-label-01": "FOUR OPERATIONS", "headline-01": semantic(["表格工作的", "primary"], ["四个层面", "accent"]), "value-index-01": "01", "subhead-01": "内容", "body-copy-01": "写入、替换并整理单元格信息。", "value-index-02": "02", "subhead-02": "公式", "body-copy-02": "建立计算逻辑并检查引用关系。", "value-index-03": "03", "subhead-03": "格式", "body-copy-03": "统一字体、颜色和数值样式。", "value-index-04": "04", "subhead-04": "图表", "body-copy-04": "把结果转换成清晰的视觉表达。", "footer-logo-01": "INTELLIGENCE", "footer-year-01": "2026"}},
    {scene_id: "scene-03", layout_id: "dark-teal-intelligence--editorial--statement-mark", assets: {}, slots: {"section-label-01": "OFFICE CONTROL", "headline-01": semantic(["进入工作环境", "primary"], ["直接完成任务", "accent"]), "statement-quote-01": semantic(["spreadsheets 连接 Excel", "primary"], ["AI 直接执行", "accent"]), "statement-note-01": "ChatGPT 保留职责边界，同时让结果可检查。", "statement-mark-01": "XLS", "footer-logo-01": "INTELLIGENCE", "footer-year-01": "2026"}},
  ],
}];

function slotContaining(slide, sourceText) {
  for (const [slot, value] of Object.entries(slide.slots)) {
    const text = typeof value === "string" ? value : value.segments.map((segment) => segment.text).join("");
    if (text.normalize("NFKC").toLocaleLowerCase("zh-CN").includes(sourceText.normalize("NFKC").toLocaleLowerCase("zh-CN"))) return slot;
  }
  return null;
}

for (const deck of decks) {
  const job = path.join(outputRoot, deck.directory);
  await mkdir(job, {recursive: true});
  const source = deck.scenes.map((scene) => scene.narration).join("\n");
  const manifest = {version: 2, template: deck.template, job_name: deck.directory, input: {type: "text"}, permissions: {generated_images_authorized: false}, files: {source: "source.md", layout_plan_draft: "layout-plan.draft.json", layout_plan: "layout-plan.json", coverage_plan: "coverage-plan.json", slide_content: "slide-content.json", slides: "slides.html", qa_report: "qa-report.json"}};
  const draft = {version: 2, template: deck.template, source_type: "text", scenes: deck.scenes};
  const content = {version: 3, title: deck.title, theme: {preset: deck.preset}, slides: deck.slides};
  const coverage = {version: 1, items: extractCoverageItems(source).map((item) => {
    const slide = deck.slides.find((candidate) => slotContaining(candidate, item.source_text));
    if (!slide) throw new Error(`${deck.directory}: coverage item is not visible: ${item.source_text}`);
    return {...item, status: "visible", scene_id: slide.scene_id, slot: slotContaining(slide, item.source_text)};
  })};
  await Promise.all([
    writeFile(path.join(job, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(path.join(job, "source.md"), `${source}\n`),
    writeFile(path.join(job, "layout-plan.draft.json"), `${JSON.stringify(draft, null, 2)}\n`),
    writeFile(path.join(job, "slide-content.json"), `${JSON.stringify(content, null, 2)}\n`),
    writeFile(path.join(job, "coverage-plan.json"), `${JSON.stringify(coverage, null, 2)}\n`),
  ]);
  await exec(process.execPath, ["scripts/finalize-layout-plan.mjs", job], {cwd: root});
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  await exec(process.execPath, ["scripts/validate-job.mjs", job], {cwd: root});
  console.log(job);
}
