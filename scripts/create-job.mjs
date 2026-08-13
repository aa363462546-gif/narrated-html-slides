#!/usr/bin/env node
import {mkdir, stat, writeFile} from "node:fs/promises";
import path from "node:path";
import {readRegistry} from "./lib/registry.mjs";

const [, , templateId, jobName, rawRoot = "jobs", ...flags] = process.argv;
if (!templateId || !jobName) throw new Error("Usage: node scripts/create-job.mjs <template-id> <job-name> [output-root] --input text|srt_audio [--audio-reference <path>]");
if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(templateId) || !/^[a-z0-9][a-z0-9-]{0,63}$/u.test(jobName)) throw new Error("template-id and job-name must use lowercase letters, digits, and hyphens");
const flag = (name) => {
  const index = flags.indexOf(name);
  return index >= 0 ? flags[index + 1] : null;
};
const inputType = flag("--input") ?? "text";
const audioReference = flag("--audio-reference");
if (!["text", "srt_audio"].includes(inputType)) throw new Error("--input must be text or srt_audio");
if (audioReference && inputType !== "srt_audio") throw new Error("--audio-reference is allowed only with srt_audio input");
const registry = await readRegistry();
if (!registry.layouts.some((entry) => entry.template === templateId)) throw new Error(`Unknown registered template: ${templateId}`);
const jobDir = path.resolve(rawRoot, templateId, jobName);
try { await stat(jobDir); throw new Error(`Refusing to overwrite existing job: ${jobDir}`); } catch (error) { if (error.code !== "ENOENT") throw error; }
await mkdir(jobDir, {recursive: true});
const source = inputType === "srt_audio" ? "source.srt" : "source.md";
const manifest = {
  version: 2,
  template: templateId,
  job_name: jobName,
  input: {type: inputType, ...(audioReference ? {audio_reference: audioReference} : {})},
  permissions: {generated_images_authorized: false},
  files: {source, layout_plan_draft: "layout-plan.draft.json", layout_plan: "layout-plan.json", coverage_plan: "coverage-plan.json", slide_content: "slide-content.json", slides: "slides.html", qa_report: "qa-report.json"},
};
await writeFile(path.join(jobDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(jobDir);
