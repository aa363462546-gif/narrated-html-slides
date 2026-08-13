#!/usr/bin/env node
import {access, readFile, writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {parse, serializeOuter} from "parse5";
import {extractCoverageItems, validateCoveragePlan} from "./lib/coverage-contract.mjs";
import {validateCanonicalSkeleton} from "./lib/dom-assembler.mjs";
import {finalizeLayoutPlan} from "./lib/plan-contract.mjs";
import {readRegistry, registryIndex} from "./lib/registry.mjs";
import {validateTheme} from "./lib/theme-contract.mjs";

const jobDir = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/validate-job.mjs <job-directory>");
const section = () => ({ok: true, errors: [], warnings: []});
const report = {technical: section(), canonical: section(), content: section(), visual: section(), mobile: section(), fonts: {ok: false, status: "unknown", errors: [], warnings: []}, publication: {ok: false, reasons: []}};
const fail = (layer, message) => { report[layer].ok = false; report[layer].errors.push(message); };

let manifest;
let plan;
let draft;
let coverage;
let content;
let source;
let htmlText;
try {
  manifest = JSON.parse(await readFile(path.join(jobDir, "manifest.json"), "utf8"));
  [plan, draft, coverage, content, source, htmlText] = await Promise.all([
    readFile(path.join(jobDir, manifest.files.layout_plan), "utf8").then(JSON.parse),
    readFile(path.join(jobDir, manifest.files.layout_plan_draft), "utf8").then(JSON.parse),
    readFile(path.join(jobDir, manifest.files.coverage_plan), "utf8").then(JSON.parse),
    readFile(path.join(jobDir, manifest.files.slide_content), "utf8").then(JSON.parse),
    readFile(path.join(jobDir, manifest.files.source), "utf8"),
    readFile(path.join(jobDir, manifest.files.slides), "utf8"),
  ]);
} catch (error) {
  fail("technical", `job files cannot be read: ${error.message}`);
}

const registry = await readRegistry();
const index = await registryIndex();
if (manifest) {
  if (manifest.version !== 2) fail("technical", "manifest must use version 2");
  if (!registry.layouts.some((entry) => entry.template === manifest.template)) fail("technical", "manifest template is not registered");
}

let htmlDocument;
const htmlSections = [];
if (htmlText) {
  htmlDocument = parse(htmlText);
  const walk = (node, visit) => { visit(node); for (const child of node.childNodes ?? []) walk(child, visit); };
  const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
  walk(htmlDocument, (node) => {
    const classes = (attr(node, "class") ?? "").split(/\s+/u);
    if (node.tagName === "section" && classes.includes("slide")) htmlSections.push(node);
  });
  if (!/width:\s*1920px/iu.test(htmlText) || !/height:\s*1080px/iu.test(htmlText)) fail("technical", "fixed 1920 x 1080 stage is missing");
  if (/file:\/\/|\/Users\/|[A-Z]:\\/u.test(htmlText)) fail("technical", "generated HTML contains a machine-specific path");
  if (/frontend-slides|Hyperframes|narrated-video-pipeline|Remocha/iu.test(htmlText)) fail("technical", "generated HTML depends on an external project");
  if (!/id=["'](?:prev|deckPrev)["']/u.test(htmlText) || !/id=["'](?:next|deckNext)["']/u.test(htmlText)) fail("technical", "visible previous/next controls are missing");
}
if (plan && htmlSections.length !== plan.scenes.length) fail("technical", "HTML scene count does not match layout plan");

if (draft && source && plan) {
  const finalized = await finalizeLayoutPlan(draft, source);
  if (!finalized.ok) for (const error of finalized.errors) fail("content", error);
  else if (draft.source_type === "srt_audio") {
    for (const [position, scene] of plan.scenes.entries()) {
      const expected = finalized.plan.scenes[position];
      if (!expected || scene.start_sec !== expected.start_sec || scene.end_sec !== expected.end_sec || scene.narration !== expected.narration) fail("content", `${scene.scene_id}: finalized SRT timing/narration was not derived from its cue range`);
    }
  }
}
if (plan && content) {
  if (content.version !== 3 || content.slides?.length !== plan.scenes.length) fail("content", "slide content does not match final plan");
  const theme = validateTheme(plan.template, content.theme, registry);
  for (const error of theme.errors) fail("content", `theme: ${error}`);
}

if (source && coverage && plan) {
  const extracted = extractCoverageItems(draft?.source_type === "srt_audio" ? source.replace(/^\d+\s*$|^\d{2}:.*-->.*$/gmu, "") : source);
  const coverageResult = validateCoveragePlan(coverage, extracted, plan);
  for (const error of coverageResult.errors) fail("content", error);
  const visibleTextByScene = new Map(htmlSections.map((node) => {
    const attrs = Object.fromEntries((node.attrs ?? []).map((item) => [item.name, item.value]));
    return [attrs.id, serializeOuter(node).replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>/giu, " ").replace(/\s+/gu, " ")];
  }));
  for (const item of coverage.items ?? []) if (item.status === "visible" && !visibleTextByScene.get(item.scene_id)?.normalize("NFKC").toLocaleLowerCase("zh-CN").includes(String(item.source_text).normalize("NFKC").toLocaleLowerCase("zh-CN"))) fail("content", `${item.id}: mapped source text is not visible in ${item.scene_id}`);
  for (let index = 1; index < plan.scenes.length; index += 1) {
    const previous = plan.scenes[index - 1]; const current = plan.scenes[index];
    const normalize = (value) => String(value).normalize("NFKC").replace(/[\s\p{P}\p{S}]+/gu, "").toLocaleLowerCase("zh-CN");
    if (previous.layout_id === current.layout_id && normalize(previous.core_content) === normalize(current.core_content)) fail("content", `${current.scene_id}: adjacent page repeats the same core content in the same layout without a new visual need`);
  }
}

if (plan && htmlSections.length) {
  const templateHtml = await readFile(path.resolve(path.dirname(new URL(import.meta.url).pathname), "../assets/templates", plan.template, "template.html"), "utf8");
  for (const [position, scene] of plan.scenes.entries()) {
    const entry = index.get(scene.layout_id);
    if (!entry) { fail("canonical", `${scene.scene_id}: unregistered layout_id`); continue; }
    const result = validateCanonicalSkeleton(templateHtml, serializeOuter(htmlSections[position]), entry);
    for (const error of result.errors) fail("canonical", `${scene.scene_id}: ${error}`);
  }
}

async function browserPath() {
  for (const candidate of [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean)) {
    try { await access(candidate); return candidate; } catch {}
  }
  return null;
}
async function loadPuppeteer() {
  try { return (await import("puppeteer-core")).default; }
  catch {
    const require = createRequire(import.meta.url);
    return (await import(pathToFileURL(require.resolve("puppeteer-core", {paths: [process.cwd()]})).href)).default;
  }
}

if (report.technical.ok && report.canonical.ok && htmlText) {
  const executablePath = await browserPath();
  if (!executablePath) {
    fail("visual", "browser unavailable");
    fail("mobile", "browser unavailable");
  } else {
    let browser;
    try {
      const puppeteer = await loadPuppeteer();
      browser = await puppeteer.launch({executablePath, headless: true, args: ["--allow-file-access-from-files"]});
      const page = await browser.newPage();
      const failedFonts = [];
      page.on("requestfailed", (request) => { if (request.resourceType() === "font") failedFonts.push(request.url()); });
      await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});
      await page.goto(pathToFileURL(path.join(jobDir, manifest.files.slides)).href, {waitUntil: "domcontentloaded", timeout: 30000});
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 8000))]));
      const desktop = await page.evaluate((layoutContracts) => {
        const errors = [];
        const slides = [...document.querySelectorAll("section.slide")];
        for (const slide of slides) {
          slide.style.visibility = "visible"; slide.style.opacity = "1"; slide.style.pointerEvents = "auto";
          const slideRect = slide.getBoundingClientRect();
          const layout = layoutContracts[slide.dataset.layoutId];
          for (const zone of layout?.visual_contract?.required_zones ?? []) {
            const element = slide.querySelector(`.${CSS.escape(zone)}`);
            if (!element || element.getBoundingClientRect().width < 1 || element.getBoundingClientRect().height < 1) errors.push(`${slide.id}: required layout zone .${zone} is missing or collapsed`);
          }
          const zoneRects = (layout?.visual_contract?.semantic_zones ?? []).map((zone) => slide.querySelector(`.${CSS.escape(zone)}`)?.getBoundingClientRect()).filter((rect) => rect && rect.width > 0 && rect.height > 0);
          if (zoneRects.length) {
            const envelope = {left: Math.min(...zoneRects.map((rect) => rect.left)), right: Math.max(...zoneRects.map((rect) => rect.right))};
            const ratio = (envelope.right - envelope.left) / slideRect.width;
            const minimum = layout.visual_contract.minimum_density?.content_envelope_width_ratio ?? 0;
            if (ratio + .01 < minimum) errors.push(`${slide.id}: meaningful content occupies only ${ratio.toFixed(2)} of slide width; layout requires ${minimum}`);
          }
          const leaves = [...slide.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,[data-qa-box]")].filter((element) => element.textContent.trim());
          for (const element of leaves) {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const clipsX = ["hidden", "clip", "auto", "scroll"].includes(style.overflowX);
            const clipsY = ["hidden", "clip", "auto", "scroll"].includes(style.overflowY);
            if ((clipsX && element.scrollWidth > element.clientWidth + 8) || (clipsY && element.scrollHeight > element.clientHeight + 8)) errors.push(`${slide.id}: clipped overflow ${element.className || element.tagName}`);
            if (rect.left < slideRect.left - 2 || rect.top < slideRect.top - 2 || rect.right > slideRect.right + 2 || rect.bottom > slideRect.bottom + 2) errors.push(`${slide.id}: out-of-bounds ${element.className || element.tagName}`);
            const metadata = /meta|label|index|page|footer|badge|date|logo|unit|mark|no\b/u.test(element.className || "");
            const isTextNode = element.matches("h1,h2,h3,h4,p,li,blockquote");
            if (isTextNode && !metadata && Number.parseFloat(style.fontSize) < 36) errors.push(`${slide.id}: supporting text below 36px ${element.className || element.tagName}`);
          }
          for (let left = 0; left < leaves.length; left += 1) for (let right = left + 1; right < leaves.length; right += 1) {
            const a = leaves[left]; const b = leaves[right];
            if (a.contains(b) || b.contains(a)) continue;
            const ar = a.getBoundingClientRect(); const br = b.getBoundingClientRect();
            const overlapWidth = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
            const overlapHeight = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
            if (overlapWidth > 4 && overlapHeight > 4) errors.push(`${slide.id}: text overlap ${a.className || a.tagName} <> ${b.className || b.tagName}`);
          }
          slide.style.visibility = "hidden"; slide.style.opacity = "0"; slide.style.pointerEvents = "none";
        }
        return errors;
      }, Object.fromEntries(registry.layouts.map((entry) => [entry.layout_id, entry])));
      for (const error of desktop) fail("visual", error);
      await page.setViewport({width: 390, height: 844, deviceScaleFactor: 1});
      await page.reload({waitUntil: "domcontentloaded"});
      const mobileErrors = await page.evaluate(() => {
        const errors = [];
        const stage = document.getElementById("deckStage");
        const scale = stage.getBoundingClientRect().width / 1920;
        for (const slide of document.querySelectorAll("section.slide")) {
          slide.style.visibility = "visible"; slide.style.opacity = "1";
          for (const element of slide.querySelectorAll("h1,h2,h3,p,li,blockquote")) {
            if (!element.textContent.trim() || /meta|label|index|page|footer|badge|date|logo|unit|mark|no\b/u.test(element.className || "")) continue;
            if (Number.parseFloat(getComputedStyle(element).fontSize) * scale < 7) errors.push(`${slide.id}: mobile rendered text below 7px ${element.className || element.tagName}`);
          }
          slide.style.visibility = "hidden"; slide.style.opacity = "0";
        }
        return errors;
      });
      for (const error of mobileErrors) fail("mobile", error);
      if (htmlSections.length > 1) {
        const before = await page.$eval("section.slide.active", (node) => node.id);
        await page.click(await page.$("#deckNext") ? "#deckNext" : "#next");
        const after = await page.$eval("section.slide.active", (node) => node.id);
        if (before === after) fail("technical", "next navigation did not change slides");
      }
      report.fonts.network_failures = [...new Set(failedFonts)];
      await page.close();
    } catch (error) {
      fail("visual", `browser QA failed: ${error.message}`);
      fail("mobile", `browser QA failed: ${error.message}`);
    } finally { if (browser) await browser.close(); }
  }
}

if (manifest?.template) {
  const inventory = JSON.parse(await readFile(path.resolve(path.dirname(new URL(import.meta.url).pathname), "../assets/fonts/font-inventory.json"), "utf8"));
  const status = inventory.templates[manifest.template];
  report.fonts.status = status.publish_status;
  report.fonts.ok = status.publish_status === "publishable";
  report.fonts.missing_families = status.missing_families;
  if (!report.fonts.ok) report.fonts.warnings.push(`publication blocked by missing approved fonts: ${status.missing_families.join(", ")}`);
}
const requiredLayers = ["technical", "canonical", "content", "visual", "mobile"];
report.publication.ok = requiredLayers.every((key) => report[key].ok) && report.fonts.ok;
if (!report.fonts.ok) report.publication.reasons.push("approved local font contract is incomplete");
for (const key of requiredLayers) if (!report[key].ok) report.publication.reasons.push(`${key} QA failed`);
const output = manifest?.files?.qa_report ? path.join(jobDir, manifest.files.qa_report) : path.join(jobDir, "qa-report.json");
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (requiredLayers.some((key) => !report[key].ok)) process.exitCode = 1;
