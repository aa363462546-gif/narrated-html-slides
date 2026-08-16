#!/usr/bin/env node
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {parse} from "parse5";
import {
  assertJobAssets,
  attr,
  readTemplateShell,
  resolvePageNarration,
  TEMPLATE_IDS,
  validateDeckShape,
  walk
} from "./lib/v3-runtime.mjs";

const root = path.resolve(new URL("../", import.meta.url).pathname);
const jobDir = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/validate-job.mjs <job-directory>");

const report = {
  build: {status: "pass", issues: []},
  review_required: true
};
const buildIssue = (message) => { report.build.status = "fail"; report.build.issues.push(message); };

let deck;
let templateHtml;
let model;
let htmlText;
let htmlDocument;
let htmlRoot;
let narrations;
const sections = [];
try {
  deck = JSON.parse(await readFile(path.join(jobDir, "deck.json"), "utf8"));
  if (!TEMPLATE_IDS.includes(deck.template)) throw new Error("deck.template is unsupported");
  templateHtml = await readFile(path.join(root, "assets", "templates", String(deck.template), "template.html"), "utf8");
  model = readTemplateShell(templateHtml, deck.template);
  for (const error of validateDeckShape(deck, model)) buildIssue(error);
  await assertJobAssets(deck, jobDir);
  narrations = await resolvePageNarration(deck, jobDir);
  htmlText = await readFile(path.join(jobDir, "slides.html"), "utf8");
  htmlDocument = parse(htmlText);
  walk(htmlDocument, (node) => {
    if (node.tagName === "html") htmlRoot = node;
    if (node.tagName === "section" && String(attr(node, "class") ?? "").split(/\s+/u).includes("slide")) sections.push(node);
  });
} catch (error) {
  buildIssue(`job cannot be loaded: ${error.message}`);
}

if (deck && model && htmlText && htmlDocument) {
  if (attr(htmlRoot, "data-deck-template") !== deck.template) buildIssue("deck template does not match final HTML");
  if (attr(htmlRoot, "data-deck-theme") !== deck.theme.preset) buildIssue("deck theme does not match final HTML");
  if (attr(htmlRoot, "data-deck-version") !== "4") buildIssue("final HTML is not marked as V4");
  if (sections.length !== deck.pages.length) buildIssue("final HTML page count does not match deck.json");
  if (/\b(?:src|href)=["']https?:\/\//iu.test(htmlText) || /@import\s+url\(\s*["']?https?:/iu.test(htmlText)) buildIssue("final HTML contains a runtime external dependency");
  if (!/width:\s*1920px/iu.test(htmlText) || !/height:\s*1080px/iu.test(htmlText)) buildIssue("fixed 1920 x 1080 stage is missing");

  for (const [index, page] of deck.pages.entries()) {
    const section = sections[index];
    if (!section) continue;
    const narration = narrations?.[index];
    if (attr(section, "id") !== page.id) buildIssue(`${page.id}: final HTML page id/order mismatch`);
    if (narration?.cue_range) {
      if (attr(section, "data-cue-start") !== String(narration.cue_range[0]) || attr(section, "data-cue-end") !== String(narration.cue_range[1])) buildIssue(`${page.id}: final HTML cue range does not match deck.json`);
    }
  }

}

const output = path.join(jobDir, "qa-report.json");
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (report.build.status !== "pass") process.exitCode = 1;
