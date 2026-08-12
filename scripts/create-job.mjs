#!/usr/bin/env node
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const [, , rawName, rawRoot = "jobs"] = process.argv;

if (!rawName) {
  console.error("Usage: node scripts/create-job.mjs <job-name> [output-root]");
  process.exit(2);
}

const jobName = rawName.trim();
if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(jobName)) {
  console.error("job-name must use lowercase letters, digits, and hyphens only");
  process.exit(2);
}

const root = path.resolve(rawRoot);
const jobDir = path.join(root, jobName);

try {
  await stat(jobDir);
  console.error(`Refusing to overwrite existing job: ${jobDir}`);
  process.exit(1);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(jobDir, { recursive: true });
console.log(jobDir);
