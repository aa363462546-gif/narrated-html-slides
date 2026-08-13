import assert from "node:assert/strict";
import test from "node:test";
import {access, readFile} from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("../", import.meta.url).pathname);
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Skill has one V2 workflow and no time-derived pagination gate", async () => {
  const skill = await read("SKILL.md");
  assert.match(skill, /^name: narrated-html-slides$/mu);
  assert.match(skill, /semantic change/iu);
  assert.match(skill, /cue_start.*cue_end/su);
  assert.doesNotMatch(skill, /6[–-]12|15\s*秒|最低页数|总时长.*页数/iu);
  assert.doesNotMatch(skill, /自由.*HTML|任意.*CSS/iu);
});

test("repository contract stays HTML-only and project-isolated", async () => {
  const files = ["SKILL.md", "README.md", "references/job-contract.md", "references/layout-plan.md", "scripts/assemble-slides.mjs", "scripts/validate-job.mjs"];
  const combined = (await Promise.all(files.map(read))).join("\n");
  assert.doesNotMatch(combined, /ffmpeg|voiceover\.wav|render.*mp4/iu);
  for (const forbidden of ["scripts/build-composition.mjs", "scripts/build-timing-from-srt.mjs", "scripts/prepare-narration.mjs", "references/hyperframes.md"]) await assert.rejects(access(path.join(root, forbidden)));
});

test("only unified V2 validators and generic assembler remain", async () => {
  for (const required of ["scripts/finalize-layout-plan.mjs", "scripts/create-coverage-plan.mjs", "scripts/assemble-slides.mjs", "scripts/validate-job.mjs"]) await access(path.join(root, required));
  for (const removed of ["scripts/validate-layout-plan.mjs", "scripts/validate-slides.mjs", "scripts/lib/layout-contract.mjs", "scripts/lib/canonical-sections.mjs", "scripts/build-plugin-job.mjs"]) await assert.rejects(access(path.join(root, removed)));
  const assembler = await read("scripts/assemble-slides.mjs");
  assert.doesNotMatch(assembler, /field-notes-a--core-idea.*dark-teal-intelligence--/su);
  assert.match(assembler, /assembleRegisteredSection/u);
});

test("font licenses and inventory are explicit", async () => {
  for (const file of ["assets/fonts/manrope/OFL.txt", "assets/fonts/ibm-plex-sans-sc/LICENSE.txt", "assets/fonts/smiley-sans/OFL.txt", "assets/fonts/font-inventory.json"]) await access(path.join(root, file));
  const inventory = JSON.parse(await read("assets/fonts/font-inventory.json"));
  for (const template of ["field-notes-a", "dark-teal-intelligence"]) {
    assert.ok(inventory.templates[template]);
    assert.ok(["publishable", "blocked_by_font"].includes(inventory.templates[template].publish_status));
  }
});

test("mother templates never request runtime network fonts", async () => {
  for (const template of ["field-notes-a", "dark-teal-intelligence"]) assert.doesNotMatch(await read(`assets/templates/${template}/template.html`), /fonts\.googleapis|fonts\.gstatic|@import\s+url\(https?:/iu);
});
