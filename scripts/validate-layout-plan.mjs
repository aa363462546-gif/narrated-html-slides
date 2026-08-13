#!/usr/bin/env node
import {readFile} from "node:fs/promises";
import path from "node:path";
import {readLayoutPlan, validateLayoutPlan} from "./lib/layout-contract.mjs";

const [, , sourceArg, planArg] = process.argv;
if (!sourceArg || !planArg) {
  console.error("Usage: node scripts/validate-layout-plan.mjs <source.md> <layout-plan.json>");
  process.exit(2);
}

const [source, plan] = await Promise.all([
  readFile(path.resolve(sourceArg), "utf8"),
  readLayoutPlan(path.resolve(planArg)),
]);
const result = validateLayoutPlan(plan, source);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
