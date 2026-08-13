import assert from "node:assert/strict";
import test from "node:test";
import {access, readFile} from "node:fs/promises";
import {mkdtemp, mkdir, rm, writeFile} from "node:fs/promises";
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
    "scripts/lib/canonical-sections.mjs",
    "scripts/assemble-slides.mjs",
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

test("SRT plans enforce exact continuous cue timing and a 15 second maximum", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const srt = `1\n00:00:00,000 --> 00:00:08,000\n先介绍 Context7。\n\n2\n00:00:08,000 --> 00:00:16,100\n再介绍 GitHub。\n`;
  const scene = {
    scene_id: "scene-01",
    narration: "先介绍 Context7。\n再介绍 GitHub。",
    semantic_role: "parallel-items",
    item_count: 2,
    layout: "platform-list",
    variant: null,
    visible_terms: ["Context7", "GitHub"],
    cue_start: 1,
    cue_end: 2,
    start_sec: 0,
    end_sec: 16.1,
    reason: "两个工具依次介绍。",
  };
  const tooLong = validateLayoutPlan({version: 1, template: "field-notes-a", scenes: [scene]}, srt);
  assert.equal(tooLong.ok, false);
  assert.match(tooLong.errors.join("\n"), /exceeds the 15s maximum/u);

  const split = [
    {...scene, scene_id: "scene-01", narration: "先介绍 Context7。", semantic_role: "concept", item_count: 1, layout: "single-card", visible_terms: ["Context7"], cue_end: 1, end_sec: 8},
    {...scene, scene_id: "scene-02", narration: "再介绍 GitHub。", semantic_role: "concept", item_count: 1, layout: "single-card", visible_terms: ["GitHub"], cue_start: 2, cue_end: 2, start_sec: 8},
  ];
  assert.equal(validateLayoutPlan({version: 1, template: "field-notes-a", scenes: split}, srt).ok, true);
  split[1].cue_start = 1;
  const overlap = validateLayoutPlan({version: 1, template: "field-notes-a", scenes: split}, srt);
  assert.equal(overlap.ok, false);
  assert.match(overlap.errors.join("\n"), /cue ranges must be continuous/u);
});

test("visible terms must belong to the narration", async () => {
  const {validateLayoutPlan} = await import("../scripts/lib/layout-contract.mjs");
  const plan = JSON.parse(await read("examples/minimal/layout-plan.json"));
  const source = await read("examples/minimal/source.md");
  plan.scenes[0].visible_terms = ["不存在的产品名"];
  const result = validateLayoutPlan(plan, source);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /is not present in narration/u);
});

test("required terms hidden only in aria-label fail slide validation", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "visible-terms-"));
  try {
    const plan = JSON.parse(await read("examples/minimal/layout-plan.json"));
    plan.scenes[0].visible_terms = ["事实"];
    const html = (await read("examples/minimal/slides.html")).replace("<h1 class=\"title reveal\">先看事实</h1>", "<h1 class=\"title reveal\">先看重点</h1>");
    const planPath = path.join(tempRoot, "layout-plan.json");
    const htmlPath = path.join(tempRoot, "slides.html");
    await writeFile(planPath, JSON.stringify(plan), "utf8");
    await writeFile(htmlPath, html, "utf8");
    await assert.rejects(
      execFileAsync(process.execPath, ["scripts/validate-slides.mjs", htmlPath, "--plan", planPath, "--static-only"], {cwd: root}),
      (error) => {
        const result = JSON.parse(error.stdout);
        assert.match(result.errors.join("\n"), /required visible term "事实" is not shown/u);
        return true;
      },
    );
  } finally {
    await rm(tempRoot, {recursive: true, force: true});
  }
});

test("the bundled assembler owns the template shell and avoids task-specific scripts", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "assembled-job-"));
  try {
    const jobDir = await writeCanonicalJob(outputRoot, {
      template: "field-notes-a",
      scene: {scene_id: "scene-01", narration: "事实与结论需要分开。", semantic_role: "concept", item_count: 1, layout: "core-idea", variant: null, visible_terms: ["事实"], reason: "单一核心观点。"},
      slots: {eyebrow: "THE CORE IDEA", title: "先看事实", subtitle: "再形成结论。", orbit_label: "FACT / CLAIM"},
    });
    const {stdout} = await execFileAsync(process.execPath, ["scripts/assemble-slides.mjs", jobDir], {cwd: root});
    const html = await readFile(stdout.trim(), "utf8");
    assert.match(html, /id="scene-01" data-template-type="core-idea" aria-label=/u);
    assert.match(html, /id="prev"/u);
    assert.match(html, /01 \/ 01/u);
    assert.match(html, /class="idea"/u);
    assert.doesNotMatch(await read("scripts/assemble-slides.mjs"), /chatgpt-desktop-plugin-layers|plugins-20260813/u);
  } finally {
    await rm(outputRoot, {recursive: true, force: true});
  }
});

async function writeCanonicalJob(tempRoot, {template, scene, slots}) {
  const jobDir = path.join(tempRoot, template, scene.scene_id);
  await mkdir(jobDir, {recursive: true});
  const source = scene.narration;
  await writeFile(path.join(jobDir, "source.md"), source, "utf8");
  await writeFile(path.join(jobDir, "layout-plan.json"), JSON.stringify({version: 1, template, scenes: [scene]}), "utf8");
  await writeFile(path.join(jobDir, "slide-content.json"), JSON.stringify({
    version: 2,
    title: "Canonical slot test",
    slides: [{scene_id: scene.scene_id, slots}],
  }), "utf8");
  await writeFile(path.join(jobDir, "manifest.json"), JSON.stringify({
    version: 1,
    template,
    job_name: scene.scene_id,
    files: {
      source: "source.md",
      layout_plan: "layout-plan.json",
      slide_content: "slide-content.json",
      slides: "slides.html",
    },
  }), "utf8");
  return jobDir;
}

test("canonical slot assembly clones the approved DOM for six high-risk layouts", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "canonical-slots-"));
  const cases = [
    {
      template: "field-notes-a",
      scene: {scene_id: "a-core", narration: "第四层操控整台电脑，computer use 值得关注。", semantic_role: "concept", item_count: 1, layout: "core-idea", variant: null, visible_terms: ["computer use"], reason: "单一核心观点。"},
      slots: {eyebrow: "COMPUTER CONTROL", title: "第四层：操控整台电脑", subtitle: "computer use 值得关注。", orbit_label: "AI / USER\nWORKFLOW"},
      required: ["idea", "browser-orbit", "orbit-label"],
      forbidden: ["core", "orbit"],
    },
    {
      template: "field-notes-a",
      scene: {scene_id: "a-cap", narration: "Mac 可以不占用电脑、同步协作并记录流程。", semantic_role: "parallel-items", item_count: 3, layout: "capability-grid", variant: null, visible_terms: ["Mac"], reason: "三个并列能力。"},
      slots: {eyebrow: "MAC EXPERIENCE", title: "Mac：可以同步工作", items: [{index: "01", title: "不占用电脑", body: "仍能继续做自己的事。"}, {index: "02", title: "同步协作", body: "可以与 AI 同时推进。"}, {index: "03", title: "记录流程", body: "保存成可复用流程。"}]},
      required: ["cap-head", "cap-grid", "cap", "cap-no"],
      forbidden: ["capabilities", "capability-grid", "capability"],
    },
    {
      template: "field-notes-a",
      scene: {scene_id: "a-compare", narration: "Remotion 与 Hyperframes 都可以生成动画视频。", semantic_role: "comparison", item_count: 2, layout: "dual-compare", variant: null, visible_terms: ["Remotion", "Hyperframes"], reason: "两个工具对比。"},
      slots: {eyebrow: "CREATIVE TOOLS", title: "两种动画视频工具", items: [{label: "A", title: "Remotion", body: "代码驱动动画。", index: "A"}, {label: "B", title: "Hyperframes", body: "HTML 驱动动画。", index: "B"}]},
      required: ["dual-compare", "dual-compare-grid", "compare-card"],
      forbidden: [],
    },
    {
      template: "dark-teal-intelligence",
      scene: {scene_id: "b-boundary", narration: "Excel 改表需要确认，配上 VBA 才能自动化。", semantic_role: "comparison", item_count: 2, layout: "compare", variant: "capability-boundary", visible_terms: ["Excel", "VBA"], reason: "能力边界。"},
      slots: {eyebrow: "EXCEL + VBA", title: "改表只是 Excel 的起点", items: [{mark: "✓", title: "逐处确认", body: "确认后才修改。", caption: "表格协作"}, {mark: "?", title: "配上 VBA", body: "把 Excel 变成自动化工具。", caption: "规则驱动"}]},
      required: ["capability-boundary", "capability-side", "capability-title", "capability-copy", "capability-caption"],
      forbidden: ["compare-grid", "compare-card", "compare-caption"],
    },
    {
      template: "dark-teal-intelligence",
      scene: {scene_id: "b-values", narration: "内容、公式、格式、图表都可以修改。", semantic_role: "parallel-items", item_count: 4, layout: "values-grid", variant: "four-up", visible_terms: [], reason: "四项并列。"},
      slots: {eyebrow: "EXCEL LIVE CONTROL", title: "四类表格操作", items: [{index: "01", title: "内容", body: "修改单元格内容。"}, {index: "02", title: "公式", body: "调整计算逻辑。"}, {index: "03", title: "格式", body: "统一呈现规范。"}, {index: "04", title: "图表", body: "生成可视化。"}]},
      required: ["values-grid", "value-card", "value-index"],
      forbidden: [],
    },
    {
      template: "dark-teal-intelligence",
      scene: {scene_id: "b-editorial", narration: "spreadsheets 让 ChatGPT 进入 Excel 工作。", semantic_role: "concept", item_count: 1, layout: "editorial", variant: "statement-mark", visible_terms: ["spreadsheets", "ChatGPT", "Excel"], reason: "单一工具观点。"},
      slots: {eyebrow: "OFFICE CONTROL", title: "第一层：操作软件", quote: "spreadsheets 让 ChatGPT 进入 Excel 工作。", note: "先从最常用的办公软件开始。", mark: "XLS"},
      required: ["statement-mark-region", "statement-copy", "statement-quote", "statement-note", "statement-mark"],
      forbidden: [],
    },
  ];
  try {
    for (const item of cases) {
      const jobDir = await writeCanonicalJob(tempRoot, item);
      const {stdout} = await execFileAsync(process.execPath, ["scripts/assemble-slides.mjs", jobDir], {cwd: root});
      const html = await readFile(stdout.trim(), "utf8");
      for (const className of item.required) assert.match(html, new RegExp(`class="(?:[^"]*\\s)?${className}(?:\\s[^"]*)?"`, "u"), `${item.scene.scene_id} must use .${className}`);
      for (const className of item.forbidden) assert.doesNotMatch(html, new RegExp(`class="(?:[^"]*\\s)?${className}(?:\\s[^"]*)?"`, "u"), `${item.scene.scene_id} must not use .${className}`);
      for (const term of item.scene.visible_terms) assert.match(html, new RegExp(term, "iu"));
    }
  } finally {
    await rm(tempRoot, {recursive: true, force: true});
  }
});

test("canonical layouts reject arbitrary authored inner HTML", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "canonical-reject-html-"));
  try {
    const item = {
      template: "field-notes-a",
      scene: {scene_id: "scene-01", narration: "computer use 操控电脑。", semantic_role: "concept", item_count: 1, layout: "core-idea", variant: null, visible_terms: ["computer use"], reason: "单一观点。"},
      slots: {},
    };
    const jobDir = await writeCanonicalJob(tempRoot, item);
    await writeFile(path.join(jobDir, "slide-content.json"), JSON.stringify({title: "bad", slides: [{scene_id: "scene-01", html: '<div class="core"><div class="orbit">computer use</div></div>'}]}), "utf8");
    await assert.rejects(
      execFileAsync(process.execPath, ["scripts/assemble-slides.mjs", jobDir], {cwd: root}),
      (error) => {
        assert.match(error.stderr, /version 2|slots|arbitrary inner HTML/iu);
        return true;
      },
    );
  } finally {
    await rm(tempRoot, {recursive: true, force: true});
  }
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
        slide_content: "slide-content.json",
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
