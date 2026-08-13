#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { layoutKey, readLayoutPlan, validateLayoutPlan } from "./lib/layout-contract.mjs";

const [, , htmlArg] = process.argv;
if (!htmlArg) {
  console.error("Usage: node scripts/validate-slides.mjs <slides.html> --plan <layout-plan.json> [--static-only]");
  process.exit(2);
}

const htmlPath = path.resolve(htmlArg);
const html = await readFile(htmlPath, "utf8");
const errors = [];
const warnings = [];
const templateMode = process.argv.includes("--template");
const planIndex = process.argv.indexOf("--plan");
const planPath = planIndex >= 0 ? path.resolve(process.argv[planIndex + 1] ?? "") : null;

const sectionMatches = [...html.matchAll(/<section\b([^>]*)>/giu)];
const slides = sectionMatches.map((match) => match[1]).filter((attrs) => {
  const classes = attrs.match(/\bclass=["']([^"']*)["']/iu)?.[1]?.split(/\s+/u) ?? [];
  return classes.includes("slide");
});

if (!slides.length) errors.push("No <section class=\"slide\"> elements found");
const ids = slides.map((attrs) => attrs.match(/\bid=["']([^"']+)["']/iu)?.[1]).filter(Boolean);
if (!templateMode && ids.length !== slides.length) errors.push("Every slide needs an id");
if (new Set(ids).size !== ids.length) errors.push("Slide ids must be unique");
if (!templateMode && slides.some((attrs) => !/\baria-label=["'][^"']+["']/iu.test(attrs))) errors.push("Every slide needs complete narration in aria-label");
if (!/width:\s*1920px/iu.test(html) || !/height:\s*1080px/iu.test(html)) errors.push("A fixed 1920 x 1080 stage is required");
if (/file:\/\/|\/Users\/|[A-Z]:\\/u.test(html)) errors.push("Generated HTML must not contain machine-specific absolute paths");
if (/frontend-slides/iu.test(html)) errors.push("Generated HTML must not depend on frontend-slides");

let plan = null;
if (!templateMode) {
  if (!planPath) errors.push("Generated slides require --plan <layout-plan.json>");
  else {
    try {
      plan = await readLayoutPlan(planPath);
      const planResult = validateLayoutPlan(plan);
      errors.push(...planResult.errors.map((error) => `layout plan: ${error}`));
      if (plan.scenes?.length !== slides.length) errors.push("Layout plan scene count does not match slides.html");
      else {
        slides.forEach((attrs, index) => {
          const expected = plan.scenes[index];
          const id = attrs.match(/\bid=["']([^"']+)["']/iu)?.[1];
          const narration = attrs.match(/\baria-label=["']([^"']+)["']/iu)?.[1];
          const actualLayout = plan.template === "field-notes-a"
            ? attrs.match(/\bdata-template-type=["']([^"']+)["']/iu)?.[1]
            : attrs.match(/\bdata-layout=["']([^"']+)["']/iu)?.[1];
          const actualVariant = attrs.match(/\bdata-variant=["']([^"']+)["']/iu)?.[1] ?? null;
          if (id !== expected.scene_id) errors.push(`Scene order/id mismatch at ${expected.scene_id}`);
          if (narration !== expected.narration) errors.push(`${expected.scene_id}: aria-label does not match layout plan narration`);
          if (actualLayout !== expected.layout || actualVariant !== (expected.variant ?? null)) {
            errors.push(`${expected.scene_id}: HTML uses ${actualLayout}/${actualVariant}, plan requires ${layoutKey(expected)}`);
          }
        });
      }
    } catch (error) {
      errors.push(`Cannot read layout plan: ${error.message}`);
    }
  }
}

if (!templateMode && slides.length > 1) {
  if (!/\bid=["'](?:prev|deckPrev)["']/u.test(html) || !/\bid=["'](?:next|deckNext)["']/u.test(html)) {
    errors.push("Multi-page slides require visible previous and next controls");
  }
}

const activeSections = [...html.matchAll(/<section\b[^>]*class=["'][^"']*\bactive\b[^"']*["'][^>]*>/giu)];
if (activeSections.length > 1) warnings.push("More than one slide is active in the static preview");

async function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  return null;
}

async function loadPuppeteer() {
  try {
    return (await import("puppeteer-core")).default;
  } catch (originalError) {
    try {
      const require = createRequire(import.meta.url);
      const resolved = require.resolve("puppeteer-core", { paths: [process.cwd(), path.dirname(htmlPath)] });
      return (await import(pathToFileURL(resolved).href)).default;
    } catch {
      throw originalError;
    }
  }
}

if (!process.argv.includes("--static-only") && !errors.length) {
  const browserPath = await findBrowser();
  if (!browserPath) {
    errors.push("Browser QA unavailable: set CHROME_PATH or install Chrome/Chromium");
  } else {
    try {
      const puppeteer = await loadPuppeteer();
      const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ["--allow-file-access-from-files"] });
      const page = await browser.newPage();
      const failedFonts = [];
      page.on("requestfailed", (request) => {
        if (request.resourceType() === "font") failedFonts.push(request.url());
      });
      page.on("response", (response) => {
        if (response.request().resourceType() === "font" && response.status() >= 400) failedFonts.push(`${response.status()} ${response.url()}`);
      });
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      if (slides.length > 1) {
        const before = await page.$eval("section.slide.active", (element) => element.id);
        const nextSelector = await page.$("#deckNext") ? "#deckNext" : "#next";
        await page.click(nextSelector);
        await new Promise((resolve) => setTimeout(resolve, 50));
        const after = await page.$eval("section.slide.active", (element) => element.id);
        if (before === after || after !== ids[1]) errors.push("Next control did not activate the second slide");
      }
      const browserResults = await page.evaluate(() => {
        const findings = [];
        const slideElements = [...document.querySelectorAll("section.slide")];
        slideElements.forEach((slide, index) => {
          slide.style.visibility = "visible";
          slide.style.opacity = "1";
          slide.style.display = "block";
          slide.style.pointerEvents = "auto";
          const slideRect = slide.getBoundingClientRect();
          const textNodes = [...slide.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,[data-qa-box]")]
            .filter((element) => element.textContent.trim() || element.hasAttribute("data-qa-box"));
          for (const element of textNodes) {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            if (style.display === "none" || style.visibility === "hidden") continue;
            const hasFixedBox = element.clientWidth > 0 && element.clientHeight > 0
              && (style.overflow === "hidden" || style.overflowX === "hidden" || style.overflowY === "hidden" || style.display === "grid" || style.display === "flex");
            // Font ascenders/descenders can exceed a CSS line box by a few pixels;
            // larger differences still indicate real clipping in fixed containers.
            if (hasFixedBox && (element.scrollWidth > element.clientWidth + 8 || element.scrollHeight > element.clientHeight + 8)) {
              findings.push({ slide: slide.id || index + 1, type: "overflow", selector: element.className || element.tagName });
            }
            if (rect.left < slideRect.left - 2 || rect.top < slideRect.top - 2 || rect.right > slideRect.right + 2 || rect.bottom > slideRect.bottom + 2) {
              findings.push({ slide: slide.id || index + 1, type: "out-of-bounds", selector: element.className || element.tagName });
            }
          }
          slide.style.visibility = "hidden";
          slide.style.opacity = "0";
          slide.style.pointerEvents = "none";
        });
        return findings;
      });
      if (plan) {
        const densityFindings = await page.evaluate((scenes) => {
          const findings = [];
          for (const scene of scenes) {
            const slide = document.getElementById(scene.scene_id);
            if (!slide) continue;
            if (scene.layout === "hero" && scene.variant === "dual-signal") {
              const rows = [...slide.querySelectorAll(".signal-row")];
              if (rows.length !== 2 || rows.some((row) => (row.querySelector(".signal-note")?.textContent.trim().length ?? 0) < 8)) {
                findings.push(`${scene.scene_id}: dual-signal rows need concrete examples or process detail`);
              }
            }
            if (scene.layout === "roadmap" && scene.variant === "overlap-four") {
              const steps = [...slide.querySelectorAll(".road-step")];
              const notes = [...slide.querySelectorAll(".road-circle .body-copy")];
              if (steps.length !== 4 || steps.some((step, index) => !step.textContent.trim().startsWith(String(index + 1).padStart(2, "0"))) || notes.length !== 4 || notes.some((note) => !note.textContent.trim())) {
                findings.push(`${scene.scene_id}: overlap-four requires visible 01-04 ordinals and supporting phrases`);
              }
            }
            if (scene.semantic_role === "closing" && scene.layout === "values-grid" && scene.variant === "three-up") {
              const cards = [...slide.querySelectorAll(".value-card")];
              if (cards.length !== 3 || cards.some((card) => !card.querySelector(".body-copy")?.textContent.trim() || !card.querySelector(".value-result")?.textContent.trim())) {
                findings.push(`${scene.scene_id}: closing three-up cards need explanation and result lines`);
              }
            }
            if (scene.layout === "timeline") {
              const labels = [...slide.querySelectorAll(".timeline-label")];
              if (labels.length && !labels.at(-1)?.classList.contains("end")) {
                findings.push(`${scene.scene_id}: final timeline label needs approved endpoint alignment`);
              }
            }
          }
          return findings;
        }, plan.scenes);
        errors.push(...densityFindings);
      }
      await browser.close();
      for (const font of [...new Set(failedFonts)]) errors.push(`Font failed to load: ${font}`);
      for (const finding of browserResults) errors.push(`${finding.slide}: ${finding.type} (${finding.selector})`);
    } catch (error) {
      errors.push(`Browser QA failed: ${error.message}`);
    }
  }
}

const result = { ok: errors.length === 0, slide_count: slides.length, errors, warnings };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
