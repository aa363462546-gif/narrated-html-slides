import assert from "node:assert/strict";
import test from "node:test";
import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFile} from "node:child_process";
import {promisify} from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Skill metadata and resources are complete", async () => {
  const skill = await read("SKILL.md");
  assert.match(skill, /^name: narrated-html-slides/mu);
  assert.match(skill, /^description: .+/mu);
  assert.doesNotMatch(skill, /\[TODO|TODO:/u);
  for (const relative of [
    "agents/openai.yaml",
    "assets/templates/field-notes-a/template.html",
    "assets/templates/field-notes-a/design.md",
    "assets/templates/dark-teal-intelligence/template.html",
    "assets/templates/dark-teal-intelligence/design.md",
    "assets/fonts/manrope/OFL.txt",
    "assets/fonts/ibm-plex-sans-sc/LICENSE.txt",
    "assets/fonts/smiley-sans/OFL.txt",
  ]) await access(path.join(root, relative));
});

test("repository is HTML-only and has no bundled media pipeline", async () => {
  const packageJson = await read("package.json");
  const skill = await read("SKILL.md");
  assert.doesNotMatch(packageJson, /hyperframes|ffmpeg|whisper|tts/iu);
  assert.doesNotMatch(skill, /MP4|voiceover\.wav|subtitles\.srt|timing\.json|Hyperframes/iu);
  for (const relative of [
    "scripts/build-composition.mjs",
    "scripts/build-timing-from-srt.mjs",
    "scripts/prepare-narration.mjs",
    "references/hyperframes.md",
    "examples/minimal/subtitles.srt",
  ]) {
    await assert.rejects(access(path.join(root, relative)));
  }
});

test("bundled templates are self-contained and meet minimum catalog sizes", async () => {
  const a = await read("assets/templates/field-notes-a/template.html");
  const b = await read("assets/templates/dark-teal-intelligence/template.html");
  assert.equal((a.match(/<section\b/giu) ?? []).length, 20);
  assert.equal((b.match(/<section\b[^>]*class=["'][^"']*\bslide\b/giu) ?? []).length, 30);
  assert.doesNotMatch(a, /frontend-slides|\/Users\/hx7/u);
  assert.doesNotMatch(b, /frontend-slides|\/Users\/hx7/u);
  assert.match(b, /url\("\.\.\/\.\.\/fonts\/manrope\//u);
  assert.match(b, /url\("\.\.\/\.\.\/fonts\/smiley-sans\//u);
});

test("minimal HTML passes static slide validation", async () => {
  const {stdout} = await execFileAsync(process.execPath, [
    "scripts/validate-slides.mjs",
    "examples/minimal/slides.html",
    "--static-only",
  ], {cwd: root});
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.equal(result.slide_count, 2);
});
