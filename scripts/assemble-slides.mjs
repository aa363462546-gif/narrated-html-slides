#!/usr/bin/env node
import {cp, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parseFragment, serialize} from "parse5";
import {assertJobAssets, attachChildren, fillPage, readTemplateShell, resolvePageNarration, setAttr, TEMPLATE_IDS, validateDeckShape} from "./lib/v3-runtime.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jobDir = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/assemble-slides.mjs <job-directory>");

const deck = JSON.parse(await readFile(path.join(jobDir, "deck.json"), "utf8"));
if (!TEMPLATE_IDS.includes(deck.template)) throw new Error("deck.template is unsupported");
const templatePath = path.join(skillRoot, "assets", "templates", String(deck.template), "template.html");
const templateHtml = await readFile(templatePath, "utf8");
const model = readTemplateShell(templateHtml, deck.template);
const errors = validateDeckShape(deck, model);
if (errors.length) throw new Error(errors.join("\n"));
await assertJobAssets(deck, jobDir);
const narrations = await resolvePageNarration(deck, jobDir);

const sections = deck.pages.map((page, index) => fillPage(page, narrations[index], index, deck.pages.length));
attachChildren(model.stage, sections);
attachChildren(model.title, parseFragment(String(deck.title ?? "Narrated HTML Slides").replaceAll("&", "&amp;").replaceAll("<", "&lt;")).childNodes);
setAttr(model.htmlNode, "data-deck-template", deck.template);
setAttr(model.htmlNode, "data-deck-theme", deck.theme.preset);
setAttr(model.htmlNode, "data-deck-version", "4");

const toneCss = `<style id="deck-tone-styles">.deck-tone--primary{color:var(--fn-text-primary,var(--ink))}.deck-tone--accent{color:var(--fn-accent-primary,var(--aqua))}.deck-tone--contrast{color:var(--fn-accent-secondary,var(--aqua-soft))}.deck-tone--muted{color:var(--fn-text-muted,var(--muted))}</style>`;
const toneNodes = parseFragment(toneCss).childNodes;
for (const node of toneNodes) { node.parentNode = model.head; model.head.childNodes.push(node); }

const outputHtml = serialize(model.document).replaceAll("../../fonts/", "assets/fonts/");
await cp(path.join(skillRoot, "assets", "fonts"), path.join(jobDir, "assets", "fonts"), {recursive: true});
const output = path.join(jobDir, "slides.html");
await writeFile(output, outputHtml, "utf8");
console.log(output);
