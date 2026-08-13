#!/usr/bin/env node
import {access, cp, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {readLayoutPlan, validateLayoutPlan} from "./lib/layout-contract.mjs";
import {assembleCanonicalSection} from "./lib/canonical-sections.mjs";

const [, , jobArg] = process.argv;
if (!jobArg) {
  console.error("Usage: node scripts/assemble-slides.mjs <job-directory>");
  process.exit(2);
}

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jobDir = path.resolve(jobArg);
const manifest = JSON.parse(await readFile(path.join(jobDir, "manifest.json"), "utf8"));
const sourcePath = path.join(jobDir, manifest.files.source);
const planPath = path.join(jobDir, manifest.files.layout_plan);
const contentPath = path.join(jobDir, manifest.files.slide_content ?? "slide-content.json");
const outputPath = path.join(jobDir, manifest.files.slides);
const [source, plan, content] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readLayoutPlan(planPath),
  readFile(contentPath, "utf8").then(JSON.parse),
]);
const planResult = validateLayoutPlan(plan, source);
if (!planResult.ok) throw new Error(`Layout plan is invalid:\n${planResult.errors.join("\n")}`);
if (manifest.template !== plan.template) throw new Error("manifest template does not match layout plan");
if (!Array.isArray(content.slides) || content.slides.length !== plan.scenes.length) throw new Error("slide-content.json must contain one entry per planned scene");
if (content.version !== 2) throw new Error("slide-content.json must use version 2 canonical slots; arbitrary inner HTML is not accepted");

const total = plan.scenes.length;
const templatePath = path.join(skillRoot, "assets", "templates", plan.template, "template.html");
let template = await readFile(templatePath, "utf8");
const sections = plan.scenes.map((scene, index) => {
  const entry = content.slides[index];
  if (!entry || entry.scene_id !== scene.scene_id) throw new Error(`slide-content order/id mismatch at ${scene.scene_id}`);
  if (entry.html != null) throw new Error(`${scene.scene_id}: arbitrary inner HTML is not accepted; provide slots`);
  return assembleCanonicalSection(template, {...scene, _template: plan.template}, entry.slots, {active: {value: index === 0, index}, total});
}).join("\n");

const mainOpen = template.match(/<main\b[^>]*\bid=["']deckStage["'][^>]*>/iu);
if (!mainOpen || mainOpen.index == null) throw new Error("Mother template has no #deckStage main element");
const bodyStart = mainOpen.index + mainOpen[0].length;
const bodyEnd = template.indexOf("</main>", bodyStart);
if (bodyEnd < 0) throw new Error("Mother template has no closing </main>");
template = `${template.slice(0, bodyStart)}\n${sections}\n  ${template.slice(bodyEnd)}`;
template = template.replace(/<title>[\s\S]*?<\/title>/iu, `<title>${String(content.title || manifest.job_name).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>`);
template = template.replaceAll("../../fonts/", "assets/fonts/");

const fontsSource = path.join(skillRoot, "assets", "fonts");
try {
  await access(fontsSource);
  await cp(fontsSource, path.join(jobDir, "assets", "fonts"), {recursive: true});
} catch {}
await writeFile(outputPath, template, "utf8");
console.log(outputPath);
