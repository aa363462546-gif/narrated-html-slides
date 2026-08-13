import {readFile} from "node:fs/promises";

export const A_LAYOUTS = new Set([
  "cover", "question", "core-idea", "capability-grid", "platform-list",
  "data-fields", "process", "caution", "support", "closing", "single-card",
  "dual-compare", "stacked-compare", "quote-card", "quad-card-grid",
  "six-card-grid", "split-vertical-list", "hierarchy-stack", "tool-list",
  "large-explainer",
]);

export const B_VARIANTS = new Map([
  ["hero", new Set(["center", "lower-left", "split-visual", "dual-signal"])],
  ["editorial", new Set(["balanced", "evidence-wide", "statement-mark", "evidence-stack"])],
  ["split-proof", new Set(["image-left", "image-right"])],
  ["portrait", new Set(["balanced", "featured-left"])],
  ["values-grid", new Set(["three-up", "four-up", "two-up-wide"])],
  ["timeline", new Set(["rising", "flat"])],
  ["revenue-arc", new Set(["rising", "descending"])],
  ["metric", new Set(["two-up", "three-up", "five-up", "sequence-four", "evidence-hero"])],
  ["compare", new Set(["capability-boundary"])],
  ["audience", new Set(["wide", "compact"])],
  ["map", new Set(["map-left", "map-right"])],
  ["roadmap", new Set(["overlap-four", "sequence-three"])],
]);

const ROLES = new Set([
  "opening", "question", "concept", "parallel-items", "comparison", "process",
  "evidence", "metric", "audience", "timeline", "roadmap", "caution", "closing",
]);

const ROLE_LAYOUTS = {
  "field-notes-a": {
    opening: ["cover"],
    question: ["question", "quote-card"],
    concept: ["core-idea", "single-card", "quote-card", "large-explainer"],
    "parallel-items": ["capability-grid", "platform-list", "data-fields", "support", "quad-card-grid", "six-card-grid", "split-vertical-list", "tool-list"],
    comparison: ["dual-compare", "stacked-compare"],
    process: ["process", "hierarchy-stack", "split-vertical-list"],
    evidence: ["data-fields", "support", "large-explainer"],
    metric: ["data-fields", "large-explainer"],
    audience: ["capability-grid", "platform-list", "quad-card-grid", "six-card-grid"],
    timeline: ["process", "hierarchy-stack"],
    roadmap: ["process", "hierarchy-stack"],
    caution: ["caution", "stacked-compare"],
    closing: ["closing"],
  },
  "dark-teal-intelligence": {
    opening: ["hero"],
    question: ["hero", "editorial"],
    concept: ["hero", "editorial"],
    "parallel-items": ["values-grid", "audience", "roadmap", "editorial"],
    comparison: ["compare", "values-grid"],
    process: ["timeline", "roadmap", "revenue-arc"],
    evidence: ["editorial", "split-proof", "portrait", "map"],
    metric: ["metric", "revenue-arc"],
    audience: ["audience"],
    timeline: ["timeline", "revenue-arc"],
    roadmap: ["roadmap"],
    caution: ["editorial", "compare"],
    closing: ["hero", "values-grid"],
  },
};

const EXACT_ITEM_COUNTS = new Map([
  ["field-notes-a/capability-grid", 3],
  ["field-notes-a/process", 3],
  ["field-notes-a/dual-compare", 2],
  ["field-notes-a/stacked-compare", 2],
  ["field-notes-a/quad-card-grid", 4],
  ["field-notes-a/six-card-grid", 6],
  ["field-notes-a/split-vertical-list", 3],
  ["field-notes-a/hierarchy-stack", 3],
  ["field-notes-a/tool-list", 3],
  ["dark-teal-intelligence/values-grid/four-up", 4],
  ["dark-teal-intelligence/values-grid/two-up-wide", 2],
  ["dark-teal-intelligence/values-grid/three-up", 3],
  ["dark-teal-intelligence/metric/two-up", 2],
  ["dark-teal-intelligence/metric/three-up", 3],
  ["dark-teal-intelligence/metric/five-up", 5],
  ["dark-teal-intelligence/metric/sequence-four", 4],
  ["dark-teal-intelligence/compare/capability-boundary", 2],
  ["dark-teal-intelligence/audience/wide", 3],
  ["dark-teal-intelligence/audience/compact", 5],
  ["dark-teal-intelligence/roadmap/overlap-four", 4],
  ["dark-teal-intelligence/roadmap/sequence-three", 3],
]);

export function normalizeNarration(value) {
  return String(value)
    .normalize("NFKC")
    .replace(/^---[\s\S]*?---/u, "")
    .replace(/^#{1,6}\s.*$/gmu, "")
    .replace(/<[^>]+>/gu, "")
    .replace(/[\p{P}\p{S}\s]/gu, "")
    .toLocaleLowerCase("zh-CN");
}

export async function readLayoutPlan(planPath) {
  return JSON.parse(await readFile(planPath, "utf8"));
}

export function layoutKey(scene) {
  return scene.variant ? `${scene.layout}/${scene.variant}` : scene.layout;
}

export function validateLayoutPlan(plan, source) {
  const errors = [];
  const warnings = [];
  if (!plan || plan.version !== 1) errors.push("layout-plan.json must use version 1");
  const template = plan?.template;
  if (!ROLE_LAYOUTS[template]) errors.push("template must be field-notes-a or dark-teal-intelligence");
  const scenes = Array.isArray(plan?.scenes) ? plan.scenes : [];
  if (!scenes.length) errors.push("layout-plan.json needs scenes[]");

  const ids = new Set();
  for (const [index, scene] of scenes.entries()) {
    const label = scene?.scene_id || `scene ${index + 1}`;
    if (!scene?.scene_id || !/^[a-z0-9][a-z0-9-]*$/u.test(scene.scene_id)) errors.push(`${label}: invalid scene_id`);
    if (ids.has(scene?.scene_id)) errors.push(`${label}: duplicate scene_id`);
    ids.add(scene?.scene_id);
    if (!String(scene?.narration ?? "").trim()) errors.push(`${label}: narration is required`);
    if (!ROLES.has(scene?.semantic_role)) errors.push(`${label}: invalid semantic_role`);
    if (!String(scene?.reason ?? "").trim()) errors.push(`${label}: layout selection reason is required`);
    if (!Number.isInteger(scene?.item_count) || scene.item_count < 1) errors.push(`${label}: item_count must be a positive integer`);

    if (template === "field-notes-a") {
      if (!A_LAYOUTS.has(scene?.layout)) errors.push(`${label}: unapproved Field Notes A layout ${scene?.layout}`);
      if (scene?.variant != null) errors.push(`${label}: Field Notes A scenes must use variant: null`);
    } else if (template === "dark-teal-intelligence") {
      if (!B_VARIANTS.has(scene?.layout) || !B_VARIANTS.get(scene.layout)?.has(scene?.variant)) {
        errors.push(`${label}: unapproved Dark Teal layout/variant ${scene?.layout}/${scene?.variant}`);
      }
    }

    const allowed = ROLE_LAYOUTS[template]?.[scene?.semantic_role] ?? [];
    if (scene?.layout && !allowed.includes(scene.layout)) errors.push(`${label}: ${scene?.semantic_role} may not use ${scene.layout}`);
    const exactKey = `${template}/${scene?.layout}${scene?.variant ? `/${scene.variant}` : ""}`;
    const exact = EXACT_ITEM_COUNTS.get(exactKey);
    if (exact && scene.item_count !== exact) errors.push(`${label}: ${layoutKey(scene)} requires exactly ${exact} items`);
    if (template === "dark-teal-intelligence" && scene.semantic_role === "opening" && scene.item_count > 1 && scene.layout === "hero" && ["center", "lower-left"].includes(scene.variant)) {
      errors.push(`${label}: a multi-item opening must use a structured hero variant`);
    }
    if (template === "dark-teal-intelligence" && scene.semantic_role === "closing" && scene.item_count > 1 && scene.layout === "hero") {
      errors.push(`${label}: a multi-item closing must use a structural summary layout`);
    }
    if (template === "dark-teal-intelligence" && scene.semantic_role === "parallel-items" && scene.item_count === 4 && !(scene.layout === "values-grid" && scene.variant === "four-up")) {
      errors.push(`${label}: four peer items must use values-grid/four-up`);
    }
  }

  const plannedSource = scenes.map((scene) => scene.narration).join("");
  if (source != null && normalizeNarration(plannedSource) !== normalizeNarration(source)) {
    errors.push("layout plan narration must cover source.md exactly and in order");
  }

  if (scenes.length >= 8) {
    const keys = scenes.map(layoutKey);
    const uniqueMinimum = scenes.length >= 24 ? 6 : scenes.length >= 12 ? 4 : 3;
    if (new Set(keys).size < uniqueMinimum) errors.push(`long deck needs at least ${uniqueMinimum} distinct approved layouts`);
    for (let index = 2; index < keys.length; index += 1) {
      if (keys[index] === keys[index - 1] && keys[index] === keys[index - 2]) {
        errors.push(`three consecutive scenes may not repeat ${keys[index]} (ending at ${scenes[index].scene_id})`);
      }
    }
    if (template === "dark-teal-intelligence") {
      for (let index = 1; index < scenes.length; index += 1) {
        const previous = scenes[index - 1];
        const current = scenes[index];
        if (previous.layout === "hero" && previous.variant === "lower-left" && current.layout === "hero" && current.variant === "lower-left") {
          errors.push(`consecutive lower-left hero pages are not allowed (ending at ${current.scene_id})`);
        }
      }
    }
    const titleLayouts = template === "dark-teal-intelligence" ? new Set(["hero"]) : new Set(["cover", "quote-card", "closing"]);
    const titleCount = scenes.filter((scene) => titleLayouts.has(scene.layout)).length;
    if (titleCount / scenes.length > 0.3) errors.push("title/hero pages may not exceed 30% of a long deck");
  }

  return {
    ok: errors.length === 0,
    template,
    scene_count: scenes.length,
    distinct_layouts: new Set(scenes.map(layoutKey)).size,
    errors,
    warnings,
  };
}
