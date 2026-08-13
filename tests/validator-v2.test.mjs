import assert from "node:assert/strict";
import test from "node:test";
import {execFile} from "node:child_process";
import {mkdtemp, readFile, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {promisify} from "node:util";

const exec = promisify(execFile);
const root = path.resolve(new URL("../", import.meta.url).pathname);

async function fixture() {
  const output = await mkdtemp(path.join(os.tmpdir(), "validate-job-v2-"));
  const {stdout} = await exec(process.execPath, ["scripts/create-job.mjs", "field-notes-a", "sample", output, "--input", "text"], {cwd: root});
  const job = stdout.trim();
  const narration = "核心概念需要新的视觉展示。";
  await writeFile(path.join(job, "source.md"), narration, "utf8");
  const scene = {scene_id: "scene-01", narration, core_content: "核心概念", semantic_role: "concept", layout_id: "field-notes-a--core-idea", item_count: 1, layout_reason: "单概念使用核心页", grouping_reason: "同一视觉主题", semantic_change: {present: true, type: "concept", requires_new_visual: true, reason: "进入核心概念"}};
  await writeFile(path.join(job, "layout-plan.draft.json"), JSON.stringify({version: 2, template: "field-notes-a", source_type: "text", scenes: [scene]}), "utf8");
  await writeFile(path.join(job, "layout-plan.json"), JSON.stringify({version: 2, template: "field-notes-a", source_type: "text", cue_numbering: null, scenes: [scene]}), "utf8");
  const registry = JSON.parse(await readFile(path.join(root, "assets/templates/layout-registry.json"), "utf8"));
  const entry = registry.layouts.find((item) => item.layout_id === scene.layout_id);
  const slots = Object.fromEntries(entry.slots.map((slot) => [slot.slot_id, slot.kind === "semantic_text" ? {segments: [{text: "核心概念", tone: "primary"}, {text: "视觉展示", tone: "accent"}]} : "准确解释当前观点"]));
  await writeFile(path.join(job, "slide-content.json"), JSON.stringify({version: 3, title: "验证", theme: {preset: "botanical-deep"}, slides: [{scene_id: scene.scene_id, layout_id: scene.layout_id, slots, assets: {}}]}), "utf8");
  await writeFile(path.join(job, "coverage-plan.json"), JSON.stringify({version: 1, items: []}), "utf8");
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  return job;
}

test("unified validator reports each QA layer and never calls font-blocked output publishable", async () => {
  const job = await fixture();
  const {stdout} = await exec(process.execPath, ["scripts/validate-job.mjs", job], {cwd: root});
  const report = JSON.parse(stdout);
  for (const key of ["technical", "canonical", "content", "visual", "mobile", "fonts", "publication"]) assert.ok(report[key], key);
  assert.equal(report.technical.ok, true, report.technical.errors.join("\n"));
  assert.equal(report.canonical.ok, true, report.canonical.errors.join("\n"));
  assert.equal(report.content.ok, true, report.content.errors.join("\n"));
  assert.equal(report.fonts.status, "blocked_by_font");
  assert.equal(report.publication.ok, false);
});

test("canonical validation fails when generated DOM is manually changed", async () => {
  const job = await fixture();
  const file = path.join(job, "slides.html");
  await writeFile(file, (await readFile(file, "utf8")).replace("class=\"browser-orbit reveal d2\"", "class=\"invented-orbit reveal d2\""), "utf8");
  await assert.rejects(exec(process.execPath, ["scripts/validate-job.mjs", job], {cwd: root}), (error) => {
    const report = JSON.parse(error.stdout);
    assert.equal(report.canonical.ok, false);
    assert.match(report.canonical.errors.join("\n"), /skeleton/u);
    return true;
  });
});
