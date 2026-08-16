#!/usr/bin/env node
import {execFile} from "node:child_process";
import {mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {promisify} from "node:util";
import {readTemplateModel} from "./lib/v3-runtime.mjs";
import {parseFragment, serialize} from "parse5";

const exec = promisify(execFile);
const root = path.resolve(new URL("../", import.meta.url).pathname);
const expectedCounts = {"field-notes-a": 20, "dark-teal-intelligence": 31};
const result = {ok: true, layouts: {}, themes: {}, total: 0};
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "narrated-html-slides-v3-publish-"));
const serializeChildren = (children) => serialize({nodeName: "#document-fragment", childNodes: children});

try {
  for (const [template, expectedCount] of Object.entries(expectedCounts)) {
    const templatePath = path.join(root, "assets", "templates", template, "template.html");
    const html = await readFile(templatePath, "utf8");
    if (/fonts\.googleapis|fonts\.gstatic|@import\s+url\(\s*["']?https?:/iu.test(html)) throw new Error(`${template}: runtime network font found`);
    const model = readTemplateModel(html, template);
    if (model.layouts.size !== expectedCount) throw new Error(`${template}: expected ${expectedCount} layouts, found ${model.layouts.size}`);
    const fullIds = new Set([...model.layouts.values()].map((layout) => layout.fullId));
    if (fullIds.size !== expectedCount) throw new Error(`${template}: duplicate layout id`);
    for (const [layoutId, layout] of model.layouts) {
    }
    result.layouts[template] = model.layouts.size;
    result.themes[template] = [...model.themes];
    result.total += model.layouts.size;

    for (const theme of model.themes) {
      const job = path.join(tempRoot, `${template}-${theme}`);
      await mkdir(path.join(job, "assets"), {recursive: true});
      await writeFile(path.join(job, "assets", "integrity.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#444"/></svg>', "utf8");
      const pages = [...model.layouts.entries()].map(([layoutId, layout], index) => {
        const pageId = `scene-${String(index + 1).padStart(2, "0")}`;
        const sourceText = `${layoutId}母版完整性测试。`;
        const contentHtml = `<div class="integrity-probe"><h1>${layoutId}</h1></div>`;
        return {id: pageId, source_text: sourceText, visual_form: layoutId, content_html: contentHtml, must_show: {terms: [layoutId], groups: []}, assets: {}};
      });
      const deck = {
        version: 4,
        title: `${template} integrity`,
        template,
        theme: {preset: theme},
        source: {type: "text", text: pages.map((page) => page.source_text).join("")},
        permissions: {generated_images: false, external_assets: true},
        pages,
      };
      await writeFile(path.join(job, "deck.json"), `${JSON.stringify(deck, null, 2)}\n`, "utf8");
      await exec(process.execPath, ["scripts/assemble-slides.mjs", job], {cwd: root, maxBuffer: 10 * 1024 * 1024});
      await exec(process.execPath, ["scripts/validate-job.mjs", job], {cwd: root, maxBuffer: 10 * 1024 * 1024});
    }
  }
} finally {
  await rm(tempRoot, {recursive: true, force: true});
}

console.log(JSON.stringify(result));
