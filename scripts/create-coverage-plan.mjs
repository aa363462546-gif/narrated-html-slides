#!/usr/bin/env node
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {extractCoverageItems} from "./lib/coverage-contract.mjs";

const sourcePath = path.resolve(process.argv[2] ?? "");
const outputPath = path.resolve(process.argv[3] ?? "");
if (!process.argv[2] || !process.argv[3]) throw new Error("Usage: node scripts/create-coverage-plan.mjs <source> <coverage-plan.json>");
const source = await readFile(sourcePath, "utf8");
const items = extractCoverageItems(source).map((item) => ({...item, status: "unmapped", scene_id: null, omission_reason: null}));
await writeFile(outputPath, `${JSON.stringify({version: 1, items}, null, 2)}\n`, "utf8");
console.log(outputPath);
