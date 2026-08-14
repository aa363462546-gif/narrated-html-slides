#!/usr/bin/env node
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {finalizeLayoutPlan} from "./lib/plan-contract.mjs";

const jobDir = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/finalize-layout-plan.mjs <job-directory>");
const manifest = JSON.parse(await readFile(path.join(jobDir, "manifest.json"), "utf8"));
const draft = JSON.parse(await readFile(path.join(jobDir, manifest.files.layout_plan_draft), "utf8"));
const source = await readFile(path.join(jobDir, manifest.files.source), "utf8");
const result = await finalizeLayoutPlan(draft, source, {artifactScope: manifest.artifact_scope ?? "complete"});
if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
const output = path.join(jobDir, manifest.files.layout_plan);
await writeFile(output, `${JSON.stringify(result.plan, null, 2)}\n`, "utf8");
console.log(output);
