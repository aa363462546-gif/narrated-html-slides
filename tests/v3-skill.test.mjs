import assert from "node:assert/strict";
import {access, readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("../", import.meta.url).pathname);
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Skill uses one source-order visual workflow and mother-template composition", async () => {
  const skill = await read("SKILL.md");
  assert.match(skill, /Start at cue 1 or the first sentence and read the script or SRT in source order/iu);
  assert.match(skill, /visibly explain the section just processed/iu);
  assert.match(skill, /sharing one broad topic does not keep it open/iu);
  assert.match(skill, /The page count is unknown until this cue-by-cue pass finishes/iu);
  assert.match(skill, /Before assembly, check every page against its own cues/iu);
  assert.match(skill, /`cue_range`, hidden narration.*do not count/isu);
  assert.match(skill, /choose the existing mother layout for each page/iu);
  assert.match(skill, /Do not write a new layout/iu);
  assert.match(skill, /There is no fixed page count/iu);
  assert.match(skill, /complete script or SRT and asks for generation, treat it as a new task/iu);
  assert.match(skill, /read only the user-provided input for this task.*current `SKILL\.md`.*selected template files.*assembly and validation scripts/isu);
  assert.match(skill, /Do not list, search, inspect, diff, open, or copy `jobs\/`, `outputs\/`, or any other historical task directory/iu);
  assert.match(skill, /Do not use a historical task as a content source, pagination hint, page-count hint, template, run reference, or shortcut/iu);
  assert.match(skill, /Only when the user explicitly asks to inspect or continue a named historical task may you read that named task/iu);
  assert.match(skill, /Never read the whole source and then create a topic list, chapter outline, shot list, or page-count estimate/iu);
  assert.match(skill, /A software name must be the visible subject/iu);
  assert.doesNotMatch(skill, /Geometry checks every actual text node/iu);
  assert.doesNotMatch(skill, /temporary.*ledger|speech act|lowest-capacity|second.*pass/iu);
});

test("V4 contract has one deck and no fixed layout-slot page contract", async () => {
  const contract = await read("references/job-contract.md");
  assert.match(contract, /content_html/iu);
  assert.match(contract, /visual_form.*selected template mother layout/isu);
  assert.match(contract, /Do not include `layout`, `slots`, `director`/iu);
  assert.match(contract, /cue_range.*does not decide what deserves to be shown/isu);
});

test("template systems remain the single source for A20 plus B31 visual styles", async () => {
  for (const [template, expected] of [["field-notes-a", 20], ["dark-teal-intelligence", 31]]) {
    const html = await read(`assets/templates/${template}/template.html`);
    const layouts = [...html.matchAll(/<section\b[^>]*\bdata-layout-id=["']([^"']+)["']/giu)].map((match) => match[1]);
    assert.equal(layouts.length, expected, template);
    assert.equal(new Set(layouts).size, expected, `${template} unique visual components`);
    assert.match(html, /data-theme-presets=["'][^"']+,[^"']+["']/u);
    assert.match(html, /@font-face/u);
  }
});

test("old planning chain is not present", async () => {
  for (const required of ["scripts/assemble-slides.mjs", "scripts/validate-job.mjs", "scripts/validate-skill.mjs", "examples/minimal/deck.json"]) await access(path.join(root, required));
  for (const removed of ["assets/templates/layout-registry.json", "scripts/create-job.mjs", "scripts/create-coverage-plan.mjs", "scripts/finalize-layout-plan.mjs", "references/coverage-plan.md", "references/layout-plan.md", "examples/minimal/manifest.json", "examples/minimal/layout-plan.json", "examples/minimal/coverage-plan.json", "examples/minimal/slide-content.json"]) await assert.rejects(access(path.join(root, removed)), removed);
});

test("production mothers keep the approved larger typography", async () => {
  const fieldNotes = await read("assets/templates/field-notes-a/template.html");
  assert.match(fieldNotes, /\.platform\{[^}]*height:220px[^}]*font:700 45px/isu);
  assert.match(fieldNotes, /\.field\{[^}]*height:230px[^}]*font:700 40px/isu);
  assert.match(fieldNotes, /\.data-note\{[^}]*bottom:140px[^}]*font:500 45px/isu);
  const darkTeal = await read("assets/templates/dark-teal-intelligence/template.html");
  assert.match(darkTeal, /\.headline\s*\{[^}]*font:\s*700 90px/isu);
});
