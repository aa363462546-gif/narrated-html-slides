#!/usr/bin/env node
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {extractCoverageItems} from "./lib/coverage-contract.mjs";

const sourcePath = path.resolve(process.argv[2] ?? "");
const outputPath = path.resolve(process.argv[3] ?? "");
if (!process.argv[2] || !process.argv[3]) throw new Error("Usage: node scripts/create-coverage-plan.mjs <source> <coverage-plan.json> [--source-type text|srt_audio] [--layout-plan <path>]");
const source = await readFile(sourcePath, "utf8");
const flag = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; };
const sourceType = flag("--source-type") ?? (sourcePath.endsWith(".srt") ? "srt_audio" : "text");
const layoutPlanPath = flag("--layout-plan");
const plan = layoutPlanPath ? JSON.parse(await readFile(path.resolve(layoutPlanPath), "utf8")) : null;
if (plan?.artifact_scope === "approval_sample" && plan.scenes?.length !== 3) throw new Error("approval_sample coverage requires a finalized three-scene layout plan");
const cueRanges = plan?.artifact_scope === "approval_sample" ? plan.scenes.map(({cue_start, cue_end}) => ({cue_start, cue_end})) : null;
const items = extractCoverageItems(source, {sourceType, cueRanges}).map((item) => ({...item, classification: "review", status: "unmapped", scene_id: null, omission_reason: null}));
await writeFile(outputPath, `${JSON.stringify({version: 2, artifact_scope: plan?.artifact_scope ?? "complete", items}, null, 2)}\n`, "utf8");
console.log(outputPath);
