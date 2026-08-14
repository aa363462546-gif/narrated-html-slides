#!/usr/bin/env node
import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parse} from "parse5";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "SKILL.md", "agents/openai.yaml", "references/job-contract.md", "references/layout-plan.md", "references/coverage-plan.md", "references/dependencies.md",
  "scripts/create-job.mjs", "scripts/finalize-layout-plan.mjs", "scripts/create-coverage-plan.mjs", "scripts/assemble-slides.mjs", "scripts/validate-job.mjs",
  "scripts/lib/plan-contract.mjs", "scripts/lib/coverage-contract.mjs", "scripts/lib/dependency-contract.mjs", "scripts/lib/dom-assembler.mjs", "scripts/lib/theme-contract.mjs", "scripts/lib/registry.mjs",
  "assets/fonts/font-inventory.json", "assets/templates/layout-registry.json",
  "assets/templates/field-notes-a/design.md", "assets/templates/field-notes-a/template.html", "assets/templates/dark-teal-intelligence/design.md", "assets/templates/dark-teal-intelligence/template.html",
];
for (const relative of required) await access(path.join(root, relative));
const [skill, registryText, aHtml, bHtml] = await Promise.all([
  readFile(path.join(root, "SKILL.md"), "utf8"), readFile(path.join(root, "assets/templates/layout-registry.json"), "utf8"),
  readFile(path.join(root, "assets/templates/field-notes-a/template.html"), "utf8"), readFile(path.join(root, "assets/templates/dark-teal-intelligence/template.html"), "utf8"),
]);
if (!/^name:\s*narrated-html-slides\s*$/mu.test(skill.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? "")) throw new Error("Invalid Skill name");
if (/6[–-]12|15\s*(?:秒|second)|minimum page|最低页数/iu.test(skill)) throw new Error("Skill still contains a time-based pagination gate");
const executableSource = await Promise.all(["scripts/create-job.mjs", "scripts/finalize-layout-plan.mjs", "scripts/create-coverage-plan.mjs", "scripts/assemble-slides.mjs", "scripts/validate-job.mjs"].map((file) => readFile(path.join(root, file), "utf8")));
if (executableSource.some((source) => /(?:from|import\s*\()\s*["'](?:\/Users\/|\.\.\/\.\.\/)/u.test(source))) throw new Error("Executable code imports outside the Skill project");
const registry = JSON.parse(registryText);
if (registry.layouts.length !== 51) throw new Error("Registry must contain exactly 51 layouts");
const ids = new Set(registry.layouts.map((item) => item.layout_id));
if (ids.size !== 51) throw new Error("Every layout_id must be unique");
for (const [template, html, count] of [["field-notes-a", aHtml, 20], ["dark-teal-intelligence", bHtml, 31]]) {
  const document = parse(html); const found = [];
  const walk = (node) => { if (node.tagName === "section") { const id = node.attrs?.find((item) => item.name === "data-layout-id")?.value; if (id) found.push(id); } for (const child of node.childNodes ?? []) walk(child); };
  walk(document);
  if (found.length !== count || found.some((id) => !ids.has(id))) throw new Error(`${template} mother layout IDs do not match the registry`);
}
console.log(JSON.stringify({ok: true, layouts: {"field-notes-a": 20, "dark-teal-intelligence": 31, total: 51}}));
