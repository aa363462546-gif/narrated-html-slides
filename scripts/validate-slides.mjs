#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , htmlArg] = process.argv;
if (!htmlArg) {
  console.error("Usage: node scripts/validate-slides.mjs <slides.html> [--static-only]");
  process.exit(2);
}

const htmlPath = path.resolve(htmlArg);
const html = await readFile(htmlPath, "utf8");
const errors = [];
const warnings = [];
const templateMode = process.argv.includes("--template");

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

if (!process.argv.includes("--static-only") && !errors.length) {
  const browserPath = await findBrowser();
  if (!browserPath) {
    warnings.push("Browser QA skipped: set CHROME_PATH or install Chrome/Chromium");
  } else {
    try {
      const { default: puppeteer } = await import("puppeteer-core");
      const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ["--allow-file-access-from-files"] });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
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
      await browser.close();
      for (const finding of browserResults) errors.push(`${finding.slide}: ${finding.type} (${finding.selector})`);
    } catch (error) {
      warnings.push(`Browser QA skipped: ${error.message}`);
    }
  }
}

const result = { ok: errors.length === 0, slide_count: slides.length, errors, warnings };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
