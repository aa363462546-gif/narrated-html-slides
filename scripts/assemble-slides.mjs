#!/usr/bin/env node
import {access, cp, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parse, parseFragment, serialize} from "parse5";
import {assembleRegisteredSection} from "./lib/dom-assembler.mjs";
import {readRegistry, registryIndex} from "./lib/registry.mjs";
import {themeCss, validateTheme} from "./lib/theme-contract.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jobDir = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/assemble-slides.mjs <job-directory>");
const manifest = JSON.parse(await readFile(path.join(jobDir, "manifest.json"), "utf8"));
if (manifest.version !== 2) throw new Error("manifest.json must use version 2");
const [plan, content, registry] = await Promise.all([
  readFile(path.join(jobDir, manifest.files.layout_plan), "utf8").then(JSON.parse),
  readFile(path.join(jobDir, manifest.files.slide_content), "utf8").then(JSON.parse),
  readRegistry(),
]);
if (plan.version !== 2 || plan.template !== manifest.template) throw new Error("final layout plan does not match manifest");
if (content.version !== 3 || !Array.isArray(content.slides) || content.slides.length !== plan.scenes.length) throw new Error("slide-content.json must use version 3 with one slide per planned scene");
const themeResult = validateTheme(plan.template, content.theme, registry);
if (!themeResult.ok) throw new Error(`Invalid theme:\n${themeResult.errors.join("\n")}`);
const index = await registryIndex();
const templatePath = path.join(skillRoot, "assets", "templates", plan.template, "template.html");
let templateHtml = await readFile(templatePath, "utf8");
const sections = plan.scenes.map((scene, position) => {
  const data = content.slides[position];
  if (data?.scene_id !== scene.scene_id || data?.layout_id !== scene.layout_id) throw new Error(`${scene.scene_id}: slide content order/layout mismatch`);
  if (data.html != null || data.css != null) throw new Error(`${scene.scene_id}: authored HTML/CSS is forbidden`);
  const entry = index.get(scene.layout_id);
  if (!entry || entry.status !== "production") throw new Error(`${scene.scene_id}: layout is not production-registered`);
  return assembleRegisteredSection(templateHtml, entry, data.slots, {scene_id: scene.scene_id, narration: scene.narration, page_index: position + 1, page_total: plan.scenes.length, assets: data.assets ?? {}});
});

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
function setAttr(node, name, value) {
  node.attrs ??= [];
  const existing = node.attrs.find((item) => item.name === name);
  if (existing) existing.value = String(value); else node.attrs.push({name, value: String(value)});
}
function walk(node, visit) { visit(node); for (const child of node.childNodes ?? []) walk(child, visit); }
const document = parse(templateHtml);
let stage;
let head;
let title;
let html;
walk(document, (node) => {
  if (node.tagName === "main" && attr(node, "id") === "deckStage") stage = node;
  if (node.tagName === "head") head = node;
  if (node.tagName === "title") title = node;
  if (node.tagName === "html") html = node;
});
if (!stage || !head || !title || !html) throw new Error("mother template shell is incomplete");
const fragment = parseFragment(sections.join("\n"));
stage.childNodes = fragment.childNodes;
for (const child of stage.childNodes) child.parentNode = stage;
title.childNodes = parseFragment(String(content.title ?? manifest.job_name).replaceAll("&", "&amp;").replaceAll("<", "&lt;")).childNodes;
for (const child of title.childNodes) child.parentNode = title;
const presetName = content.theme.preset ?? "custom";
setAttr(html, "data-deck-theme", presetName);
const css = `:root,.deck-stage{${themeCss(plan.template, themeResult.theme)}}\n.semantic-tone--primary{color:var(--fn-text-primary,var(--ink))}.semantic-tone--accent{color:var(--fn-accent-primary,var(--aqua))}.semantic-tone--contrast{color:var(--fn-accent-secondary,var(--aqua-soft))}.semantic-tone--muted{color:var(--fn-text-muted,var(--muted))}`;
const styleNodes = parseFragment(`<style id="controlled-deck-theme">${css}</style>`).childNodes;
for (const node of styleNodes) { node.parentNode = head; head.childNodes.push(node); }
templateHtml = serialize(document).replaceAll("../../fonts/", "assets/fonts/");
const fontsSource = path.join(skillRoot, "assets", "fonts");
try { await access(fontsSource); await cp(fontsSource, path.join(jobDir, "assets", "fonts"), {recursive: true}); } catch {}
const output = path.join(jobDir, manifest.files.slides);
await writeFile(output, templateHtml, "utf8");
console.log(output);
