#!/usr/bin/env node
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , rawTemplate, rawName, rawRoot = "jobs"] = process.argv;

if (!rawTemplate || !rawName) {
  console.error("Usage: node scripts/create-job.mjs <template-id> <job-name> [output-root]");
  process.exit(2);
}

const templateId = rawTemplate.trim();
const jobName = rawName.trim();
if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(templateId)) {
  console.error("template-id must use lowercase letters, digits, and hyphens only");
  process.exit(2);
}
if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(jobName)) {
  console.error("job-name must use lowercase letters, digits, and hyphens only");
  process.exit(2);
}

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(skillRoot, "assets", "templates", templateId);
for (const required of ["design.md", "template.html"]) {
  try {
    await stat(path.join(templateDir, required));
  } catch {
    console.error(`Unknown or incomplete template: ${templateId}`);
    process.exit(2);
  }
}

const root = path.resolve(rawRoot);
const jobDir = path.join(root, templateId, jobName);

try {
  await stat(jobDir);
  console.error(`Refusing to overwrite existing job: ${jobDir}`);
  process.exit(1);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(jobDir, { recursive: true });
await writeFile(path.join(jobDir, "manifest.json"), `${JSON.stringify({
  version: 1,
  template: templateId,
  job_name: jobName,
  files: {
    source: "source.md",
    layout_plan: "layout-plan.json",
    slides: "slides.html",
  },
}, null, 2)}\n`, "utf8");
console.log(jobDir);
