import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {mkdtemp, readFile, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {promisify} from "node:util";

const exec = promisify(execFile);
const root = path.resolve(new URL("../", import.meta.url).pathname);

function page(overrides = {}) {
  return {
    id: "scene-01",
    source_text: "ChatGPT 和 Excel 共同处理内容、公式、格式和图表。",
    visual_form: "relationship",
    content_html: '<div class="free-page"><h1>ChatGPT 连接 Excel</h1><p>内容、公式、格式和图表进入同一条工作流。</p></div>',
    must_show: {terms: ["ChatGPT", "Excel"], groups: [["内容", "公式", "格式", "图表"]]},
    assets: {},
    ...overrides
  };
}

async function makeJob({pages = [page()], source, ...rest} = {}) {
  const job = await mkdtemp(path.join(os.tmpdir(), "narrated-v4-"));
  const resolvedSource = source ?? {type: "text", text: pages.map((item) => item.source_text).join("")};
  await writeFile(path.join(job, "deck.json"), `${JSON.stringify({
    version: 4,
    title: "V4 自由组合测试",
    template: "field-notes-a",
    theme: {preset: "botanical-deep"},
    source: resolvedSource,
    permissions: {generated_images: false, external_assets: false},
    pages,
    ...rest
  }, null, 2)}\n`, "utf8");
  return job;
}

test("one deck.json assembles a mother-template page with template shell and timing metadata", async () => {
  const job = await makeJob();
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  const html = await readFile(path.join(job, "slides.html"), "utf8");
  assert.match(html, /data-deck-template="field-notes-a"/u);
  assert.match(html, /class="slide free-page[^"]*"/u);
  assert.match(html, /ChatGPT 连接 Excel/u);
  assert.doesNotMatch(html, /data-layout-id="field-notes-a--/u);
});

test("old layout, slots, and Director contracts are rejected", async () => {
  const job = await makeJob({pages: [page({layout: "core-idea", slots: {title: "错误"}})]});
  await assert.rejects(exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root}), /layout and slots are removed/u);
  const directorJob = await makeJob({director: {units: []}});
  await assert.rejects(exec(process.execPath, ["scripts/assemble-slides.mjs", directorJob], {cwd: root}), /director is not part of/u);
});

test("text pages must cover the complete source directly and in order", async () => {
  const job = await makeJob({source: {type: "text", text: "先提出问题。再给出答案。"}, pages: [page({source_text: "先提出问题。"})]});
  await assert.rejects(exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root}), /pages do not cover the complete text source/u);
});

test("SRT ranges derive narration and timing without opening audio", async () => {
  const job = await mkdtemp(path.join(os.tmpdir(), "narrated-v4-srt-"));
  await writeFile(path.join(job, "source.srt"), "1\n00:00:00,000 --> 00:00:01,500\n问题\n\n2\n00:00:01,500 --> 00:00:03,000\n答案\n", "utf8");
  await writeFile(path.join(job, "deck.json"), `${JSON.stringify({
    version: 4, title: "SRT", template: "field-notes-a", theme: {preset: "botanical-deep"},
    source: {type: "srt_audio", srt: "source.srt"},
    permissions: {generated_images: false, external_assets: false},
    pages: [
      page({id: "scene-01", cue_range: [1, 1], source_text: undefined, content_html: "<h1>问题</h1>", must_show: {terms: ["问题"], groups: []}}),
      page({id: "scene-02", cue_range: [2, 2], source_text: undefined, content_html: "<h1>答案</h1>", must_show: {terms: ["答案"], groups: []}})
    ]
  }, null, 2)}\n`, "utf8");
  const deckPath = path.join(job, "deck.json");
  const deck = JSON.parse(await readFile(deckPath, "utf8"));
  for (const item of deck.pages) delete item.source_text;
  await writeFile(deckPath, `${JSON.stringify(deck, null, 2)}\n`, "utf8");
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  const html = await readFile(path.join(job, "slides.html"), "utf8");
  assert.match(html, /data-cue-start="1"/u);
  assert.match(html, /data-cue-end="2"/u);
  assert.match(html, /data-start="0\.000"/u);
  assert.match(html, /data-end="3\.000"/u);
});

test("unsafe active or external page markup is rejected", async () => {
  const job = await makeJob({pages: [page({content_html: '<script>alert(1)</script><h1>坏内容</h1>'})]});
  await assert.rejects(exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root}), /unsupported active or external element/u);
});

test("must-show metadata does not block structural Build", async () => {
  const job = await makeJob({pages: [page({content_html: "<h1>只有标题</h1>"})]});
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  const {stdout} = await exec(process.execPath, ["scripts/validate-job.mjs", job], {cwd: root});
  const report = JSON.parse(stdout);
  assert.equal(report.build.status, "pass");
});

test("Build remains structural and requires human review", async () => {
  const job = await makeJob();
  await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root});
  const {stdout} = await exec(process.execPath, ["scripts/validate-job.mjs", job], {cwd: root});
  const report = JSON.parse(stdout);
  assert.deepEqual(Object.keys(report).sort(), ["build", "review_required"]);
  assert.equal(report.build.status, "pass");
  assert.equal(report.review_required, true);
});
