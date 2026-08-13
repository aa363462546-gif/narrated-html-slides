#!/usr/bin/env node
import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asJson = process.argv.includes("--json");
async function available(file) { try { await access(file); return true; } catch { return false; } }
const chromeCandidates = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean);
let browserPath = null;
for (const candidate of chromeCandidates) if (await available(candidate)) { browserPath = candidate; break; }
const registry = JSON.parse(await readFile(path.join(root, "assets/templates/layout-registry.json"), "utf8"));
const fonts = JSON.parse(await readFile(path.join(root, "assets/fonts/font-inventory.json"), "utf8"));
const report = {
  node: {ok: Number(process.versions.node.split(".")[0]) >= 22, actual: process.version, required: ">=22"},
  browser: {ok: Boolean(browserPath), path: browserPath},
  registry: {ok: registry.layouts.length === 51 && registry.layouts.filter((item) => item.template === "field-notes-a").length === 20 && registry.layouts.filter((item) => item.template === "dark-teal-intelligence").length === 31, total: registry.layouts.length},
  fonts: Object.fromEntries(Object.entries(fonts.templates).map(([template, value]) => [template, {publish_status: value.publish_status, missing_families: value.missing_families}])),
};
report.development_ready = report.node.ok && report.browser.ok && report.registry.ok;
report.publication_ready = report.development_ready && Object.values(report.fonts).every((item) => item.publish_status === "publishable");
if (asJson) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`${report.node.ok ? "OK" : "MISSING"}\tnode\t${report.node.actual}`);
  console.log(`${report.browser.ok ? "OK" : "MISSING"}\tbrowser\t${report.browser.path ?? ""}`);
  console.log(`${report.registry.ok ? "OK" : "INVALID"}\tregistry\t${report.registry.total} layouts`);
  for (const [template, value] of Object.entries(report.fonts)) console.log(`${value.publish_status === "publishable" ? "OK" : "BLOCKED"}\tfont:${template}\t${value.missing_families.join(", ") || "complete"}`);
  console.log(`Development ready: ${report.development_ready ? "yes" : "no"}`);
  console.log(`Publication ready: ${report.publication_ready ? "yes" : "no"}`);
}
process.exitCode = report.development_ready ? 0 : 1;
