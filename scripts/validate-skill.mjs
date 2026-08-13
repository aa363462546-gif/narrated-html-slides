#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/design-system.md",
  "references/template-selection.md",
  "references/job-contract.md",
  "references/layout-plan.md",
  "scripts/lib/layout-contract.mjs",
  "scripts/validate-layout-plan.mjs",
  "assets/templates/field-notes-a/design.md",
  "assets/templates/field-notes-a/template.html",
  "assets/templates/dark-teal-intelligence/design.md",
  "assets/templates/dark-teal-intelligence/template.html",
];

for (const relative of required) await access(path.join(root, relative));
const skill = await readFile(path.join(root, "SKILL.md"), "utf8");
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? "";
if (!/^name:\s*narrated-html-slides\s*$/mu.test(frontmatter)) throw new Error("Invalid or missing Skill name");
if (!/^description:\s*\S.+$/mu.test(frontmatter)) throw new Error("Missing Skill description");
if (/\[TODO|TODO:/u.test(skill)) throw new Error("SKILL.md contains TODO placeholders");
if (skill.split("\n").length > 500) throw new Error("SKILL.md exceeds 500 lines");
console.log("Skill structure valid");
