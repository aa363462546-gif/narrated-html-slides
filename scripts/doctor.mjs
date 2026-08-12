#!/usr/bin/env node
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asJson = process.argv.includes("--json");

async function file(name) {
  try {
    await access(name);
    return { available: true, detail: name };
  } catch {
    return { available: false, detail: name };
  }
}

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

let browser = { available: false, detail: null };
for (const candidate of chromeCandidates) {
  const result = await file(candidate);
  if (result.available) {
    browser = result;
    break;
  }
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
const report = {
  node: { available: nodeMajor >= 22, detail: process.version, required: ">=22" },
  browser,
};

report.htmlReady = report.node.available && report.browser.available;

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const [name, value] of Object.entries(report)) {
    if (typeof value !== "object") continue;
    console.log(`${value.available ? "OK" : "MISSING"}\t${name}\t${value.detail ?? ""}`);
  }
  console.log(`\nHTML QA ready: ${report.htmlReady ? "yes" : "no"}`);
}

process.exitCode = report.htmlReady ? 0 : 1;
