import assert from "node:assert/strict";
import test from "node:test";
import {execFile} from "node:child_process";
import {mkdtemp, readFile, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {promisify} from "node:util";

const exec = promisify(execFile);
const root = path.resolve(new URL("../", import.meta.url).pathname);

test("create-job writes a v2 self-contained HTML contract without touching audio", async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), "narrated-job-v2-"));
  const {stdout} = await exec(process.execPath, ["scripts/create-job.mjs", "field-notes-a", "sample", output, "--input", "srt_audio", "--scope", "approval_sample", "--audio-reference", "/input/voice.mp3"], {cwd: root});
  const job = stdout.trim();
  const manifest = JSON.parse(await readFile(path.join(job, "manifest.json"), "utf8"));
  assert.equal(manifest.version, 2);
  assert.equal(manifest.input.type, "srt_audio");
  assert.equal(manifest.input.audio_reference, "/input/voice.mp3");
  assert.equal(manifest.artifact_scope, "approval_sample");
  assert.equal(manifest.files.source, "source.srt");
  assert.equal(manifest.files.slides, "slides.html");
  assert.equal(manifest.files.layout_plan_draft, "layout-plan.draft.json");
  assert.equal(manifest.files.coverage_plan, "coverage-plan.json");
});

test("generic assembler builds a registered section, applies a validated theme, and preserves canonical DOM", async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), "narrated-assemble-v2-"));
  const {stdout} = await exec(process.execPath, ["scripts/create-job.mjs", "field-notes-a", "sample", output, "--input", "text"], {cwd: root});
  const job = stdout.trim();
  await writeFile(path.join(job, "source.md"), "让 AI 操作整台电脑。", "utf8");
  const plan = {version: 2, template: "field-notes-a", source_type: "text", cue_numbering: null, scenes: [{scene_id: "scene-01", narration: "让 AI 操作整台电脑。", core_content: "电脑操作", semantic_role: "concept", layout_id: "field-notes-a--core-idea", item_count: 1, layout_reason: "单概念", grouping_reason: "一个视觉主题", semantic_change: {present: true, type: "concept", requires_new_visual: true, reason: "新概念"}}]};
  await writeFile(path.join(job, "layout-plan.json"), JSON.stringify(plan), "utf8");
  const registry = JSON.parse(await readFile(path.join(root, "assets/templates/layout-registry.json"), "utf8"));
  const entry = registry.layouts.find((item) => item.layout_id === "field-notes-a--core-idea");
  const slots = Object.fromEntries(entry.slots.map((slot) => [slot.slot_id, slot.kind === "semantic_text" ? {segments: [{text: "让 AI 操作", tone: "primary"}, {text: "整台电脑", tone: "accent"}]} : "说明"]));
  await writeFile(path.join(job, "slide-content.json"), JSON.stringify({version: 3, theme: {preset: "botanical-deep"}, slides: [{scene_id: "scene-01", layout_id: entry.layout_id, slots, assets: {}}]}), "utf8");
  await writeFile(path.join(job, "coverage-plan.json"), JSON.stringify({version: 1, items: []}), "utf8");
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  const html = await readFile(path.join(job, "slides.html"), "utf8");
  assert.match(html, /data-layout-id="field-notes-a--core-idea"/u);
  assert.match(html, /data-semantic-tone="accent"/u);
  assert.match(html, /data-deck-theme="botanical-deep"/u);
  assert.doesNotMatch(html, /<strong>|<style[^>]+unknown/iu);
});
