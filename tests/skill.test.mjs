import assert from "node:assert/strict";
import test from "node:test";
import {access, readFile} from "node:fs/promises";
import {mkdtemp, rm} from "node:fs/promises";
import os from "node:os";
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
    "references/layout-plan.md",
    "scripts/lib/layout-contract.mjs",
    "scripts/validate-layout-plan.mjs",
    "assets/templates/field-notes-a/template.html",
    "assets/templates/field-notes-a/design.md",
    "assets/templates/dark-teal-intelligence/template.html",
    "assets/templates/dark-teal-intelligence/design.md",
    "assets/fonts/manrope/OFL.txt",
    "assets/fonts/ibm-plex-sans-sc/LICENSE.txt",
    "assets/fonts/smiley-sans/OFL.txt",
  ]) await access(path.join(root, relative));
});

test("job creation is grouped by template and writes a portable manifest", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "narrated-html-jobs-"));
  try {
    const {stdout} = await execFileAsync(process.execPath, [
      "scripts/create-job.mjs",
      "field-notes-a",
      "portable-example",
      outputRoot,
    ], {cwd: root});
    const jobDir = path.join(outputRoot, "field-notes-a", "portable-example");
    assert.equal(stdout.trim(), jobDir);
    const manifest = JSON.parse(await readFile(path.join(jobDir, "manifest.json"), "utf8"));
    assert.deepEqual(manifest, {
      version: 1,
      template: "field-notes-a",
      job_name: "portable-example",
      files: {
        source: "source.md",
        layout_plan: "layout-plan.json",
        slides: "slides.html",
      },
    });
    assert.doesNotMatch(JSON.stringify(manifest), /\/Users\/|[A-Z]:\\/u);
  } finally {
    await rm(outputRoot, {recursive: true, force: true});
  }
});

test("job creation rejects an unregistered template directory", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "narrated-html-jobs-"));
  try {
    await assert.rejects(
      execFileAsync(process.execPath, ["scripts/create-job.mjs", "future-c", "example", outputRoot], {cwd: root}),
      (error) => {
        assert.match(error.stderr, /Unknown or incomplete template/u);
        return true;
      },
    );
  } finally {
    await rm(outputRoot, {recursive: true, force: true});
  }
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
  assert.equal((b.match(/<section\b[^>]*class=["'][^"']*\bslide\b/giu) ?? []).length, 31);
  assert.match(b, /data-layout="values-grid" data-variant="three-up"/u);
  assert.doesNotMatch(a, /frontend-slides|\/Users\/hx7/u);
  assert.doesNotMatch(b, /frontend-slides|\/Users\/hx7/u);
  assert.match(b, /url\("\.\.\/\.\.\/fonts\/manrope\//u);
  assert.match(b, /url\("\.\.\/\.\.\/fonts\/smiley-sans\//u);
});

test("minimal HTML passes static slide validation", async () => {
  const planResult = await execFileAsync(process.execPath, [
    "scripts/validate-layout-plan.mjs",
    "examples/minimal/source.md",
    "examples/minimal/layout-plan.json",
  ], {cwd: root});
  assert.equal(JSON.parse(planResult.stdout).ok, true);

  const {stdout} = await execFileAsync(process.execPath, [
    "scripts/validate-slides.mjs",
    "examples/minimal/slides.html",
    "--plan",
    "examples/minimal/layout-plan.json",
    "--static-only",
  ], {cwd: root});
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.equal(result.slide_count, 2);
});

test("generated HTML cannot bypass the mandatory layout plan", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [
      "scripts/validate-slides.mjs",
      "examples/minimal/slides.html",
      "--static-only",
    ], {cwd: root}),
    (error) => {
      const result = JSON.parse(error.stdout);
      assert.match(result.errors.join("\n"), /require --plan/u);
      return true;
    },
  );
});

test("browser QA cannot be reported as a successful skip", async () => {
  const validator = await read("scripts/validate-slides.mjs");
  assert.match(validator, /require\.resolve\("puppeteer-core"/u);
  assert.match(validator, /errors\.push\(`Browser QA failed:/u);
  assert.doesNotMatch(validator, /Browser QA skipped/u);
});

test("multi-page delivery requires working visible navigation and loaded fonts", async () => {
  const validator = await read("scripts/validate-slides.mjs");
  assert.match(validator, /Multi-page slides require visible previous and next controls/u);
  assert.match(validator, /Next control did not activate the second slide/u);
  assert.match(validator, /Font failed to load:/u);
  const b = await read("assets/templates/dark-teal-intelligence/template.html");
  assert.match(b, /id="deckPrev"/u);
  assert.match(b, /id="deckNext"/u);
  assert.match(b, /addEventListener\('wheel'/u);
  assert.match(b, /addEventListener\('touchend'/u);
  assert.match(b, /ignoreClickUntil/u);
});

test("B density QA protects structured openings, roadmaps, and summaries", async () => {
  const validator = await read("scripts/validate-slides.mjs");
  const design = await read("assets/templates/dark-teal-intelligence/design.md");
  const template = await read("assets/templates/dark-teal-intelligence/template.html");
  assert.match(validator, /dual-signal rows need concrete examples or process detail/u);
  assert.match(validator, /overlap-four requires visible 01-04 ordinals and supporting phrases/u);
  assert.match(validator, /closing three-up cards need explanation and result lines/u);
  assert.match(design, /distinct consequence or result line/u);
  assert.equal((template.match(/class="value-result"/gu) ?? []).length, 3);
});

test("layout plan narration must cover the source exactly and in order", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const plan = JSON.parse(await read("examples/minimal/layout-plan.json"));
  const source = await read("examples/minimal/source.md");
  assert.equal(validateLayoutPlan(plan, source).ok, true);
  plan.scenes[1].narration = "结论回答我们应该怎么做。";
  const result = validateLayoutPlan(plan, source);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /cover source\.md exactly and in order/u);
});

test("a B comparison cannot be planned as a hero subtitle page", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const result = validateLayoutPlan({
    version: 1,
    template: "dark-teal-intelligence",
    scenes: [{
      scene_id: "scene-01",
      narration: "稳定的方案和不稳定的方案有什么区别？",
      semantic_role: "comparison",
      item_count: 2,
      layout: "hero",
      variant: "center",
      reason: "展示两种方案。",
    }],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /comparison may not use hero/u);
});

test("plain numbered concepts cannot use a B metric layout", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const result = validateLayoutPlan({
    version: 1,
    template: "dark-teal-intelligence",
    scenes: [{
      scene_id: "scene-01",
      narration: "声音分为人声配音、背景音乐和音效。",
      semantic_role: "parallel-items",
      item_count: 3,
      layout: "metric",
      variant: "three-up",
      reason: "使用三列编号。",
    }],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /parallel-items may not use metric/u);
});

test("three semantic items can use the B three-up values layout", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const result = validateLayoutPlan({
    version: 1,
    template: "dark-teal-intelligence",
    scenes: [{
      scene_id: "scene-01",
      narration: "声音分为人声配音、背景音乐和音效。",
      semantic_role: "parallel-items",
      item_count: 3,
      layout: "values-grid",
      variant: "three-up",
      reason: "三个并列概念以语义标题为主。",
    }],
  });
  assert.equal(result.ok, true);
});

test("four peer B items must use the four-up values grid", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const result = validateLayoutPlan({
    version: 1,
    template: "dark-teal-intelligence",
    scenes: [{
      scene_id: "scene-01",
      narration: "画面形式包括人物讲解、标题卡、流程图和对比卡。",
      semantic_role: "parallel-items",
      item_count: 4,
      layout: "editorial",
      variant: "evidence-stack",
      reason: "把四项放进一列。",
    }],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /four peer items must use values-grid\/four-up/u);
});

test("adjacent lower-left B hero pages are rejected", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const base = ["hero/center", "editorial/balanced", "values-grid/three-up", "timeline/flat", "roadmap/sequence-three", "hero/lower-left", "hero/lower-left", "editorial/evidence-wide"];
  const scenes = base.map((entry, index) => {
    const [layout, variant] = entry.split("/");
    return {
      scene_id: `scene-${String(index + 1).padStart(2, "0")}`,
      narration: `第${index + 1}页。`,
      semantic_role: index === 0 ? "opening" : index >= 5 && index <= 6 ? "closing" : layout === "timeline" ? "timeline" : layout === "roadmap" ? "roadmap" : layout === "values-grid" ? "parallel-items" : "evidence",
      item_count: layout === "values-grid" || layout === "roadmap" ? 3 : layout === "timeline" ? 3 : 1,
      layout,
      variant,
      reason: "测试批准版式。",
    };
  });
  const result = validateLayoutPlan({version: 1, template: "dark-teal-intelligence", scenes});
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /consecutive lower-left hero pages/u);
});

test("multi-item B openings and closings reject sparse hero variants", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  for (const semantic_role of ["opening", "closing"]) {
    const result = validateLayoutPlan({
      version: 1,
      template: "dark-teal-intelligence",
      scenes: [{
        scene_id: "scene-01",
        narration: "素材库、声音方案和编排规则共同决定稳定性。",
        semantic_role,
        item_count: 3,
        layout: "hero",
        variant: "lower-left",
        reason: "只放一句大字。",
      }],
    });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), semantic_role === "opening" ? /multi-item opening/u : /multi-item closing/u);
  }
});

test("a long B deck made entirely from hero pages is rejected", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const plan = {
    version: 1,
    template: "dark-teal-intelligence",
    scenes: Array.from({length: 48}, (_, index) => ({
      scene_id: `scene-${String(index + 1).padStart(2, "0")}`,
      narration: `这是第${index + 1}页的完整旁白。`,
      semantic_role: index === 0 ? "opening" : "concept",
      item_count: 1,
      layout: "hero",
      variant: "center",
      reason: "把旁白直接写成标题。",
    })),
  };
  const result = validateLayoutPlan(plan);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /at least 6 distinct approved layouts/u);
  assert.match(result.errors.join("\n"), /three consecutive scenes/u);
  assert.match(result.errors.join("\n"), /may not exceed 30%/u);
});

test("a long A deck made entirely from cover pages is rejected", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const plan = {
    version: 1,
    template: "field-notes-a",
    scenes: Array.from({length: 24}, (_, index) => ({
      scene_id: `scene-${String(index + 1).padStart(2, "0")}`,
      narration: `这是第${index + 1}页的完整旁白。`,
      semantic_role: "opening",
      item_count: 1,
      layout: "cover",
      variant: null,
      reason: "把旁白直接写成封面标题。",
    })),
  };
  const result = validateLayoutPlan(plan);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /at least 6 distinct approved layouts/u);
  assert.match(result.errors.join("\n"), /three consecutive scenes/u);
  assert.match(result.errors.join("\n"), /may not exceed 30%/u);
});

test("plan and HTML layout choices must agree scene by scene", async () => {
  const html = await read("examples/minimal/slides.html");
  const mismatched = html.replace('data-template-type="core-idea"', 'data-template-type="quote-card"');
  const tempPath = path.join(root, "examples/minimal/slides-mismatch.tmp.html");
  const {writeFile, unlink} = await import("node:fs/promises");
  await writeFile(tempPath, mismatched, "utf8");
  try {
    await assert.rejects(
      execFileAsync(process.execPath, [
        "scripts/validate-slides.mjs",
        tempPath,
        "--plan",
        "examples/minimal/layout-plan.json",
        "--static-only",
      ], {cwd: root}),
      (error) => {
        const result = JSON.parse(error.stdout);
        assert.match(result.errors.join("\n"), /plan requires core-idea/u);
        return true;
      },
    );
  } finally {
    await unlink(tempPath);
  }
});
