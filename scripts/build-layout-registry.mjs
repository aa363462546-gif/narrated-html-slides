#!/usr/bin/env node
import {createHash} from "node:crypto";
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parse, serialize} from "parse5";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templates = ["field-notes-a", "dark-teal-intelligence"];

const roleMap = {
  "field-notes-a": {
    cover: ["opening"], question: ["question"], "core-idea": ["concept"], "capability-grid": ["parallel-items", "audience"],
    "platform-list": ["parallel-items", "audience"], "data-fields": ["parallel-items", "evidence", "metric"], process: ["process", "timeline", "roadmap"],
    caution: ["caution"], support: ["parallel-items", "evidence"], closing: ["closing"], "single-card": ["concept"],
    "dual-compare": ["comparison"], "stacked-compare": ["comparison", "caution"], "quote-card": ["question", "concept"],
    "quad-card-grid": ["parallel-items", "audience"], "six-card-grid": ["parallel-items", "audience"], "split-vertical-list": ["parallel-items", "process"],
    "hierarchy-stack": ["process", "timeline", "roadmap"], "tool-list": ["parallel-items"], "large-explainer": ["concept", "evidence", "metric"],
  },
  "dark-teal-intelligence": {
    hero: ["opening", "question", "concept", "closing"], editorial: ["question", "concept", "parallel-items", "evidence", "caution"],
    "split-proof": ["evidence"], portrait: ["evidence"], "values-grid": ["parallel-items", "comparison", "closing"],
    timeline: ["process", "timeline"], "revenue-arc": ["process", "metric", "timeline"], metric: ["metric"],
    compare: ["comparison", "caution"], audience: ["audience"], map: ["evidence"], roadmap: ["process", "roadmap"],
  },
};

const exactItems = {
  "field-notes-a--capability-grid": 3, "field-notes-a--process": 3, "field-notes-a--dual-compare": 2,
  "field-notes-a--stacked-compare": 2, "field-notes-a--quad-card-grid": 4, "field-notes-a--six-card-grid": 6,
  "field-notes-a--split-vertical-list": 3, "field-notes-a--hierarchy-stack": 3, "field-notes-a--tool-list": 3,
  "dark-teal-intelligence--values-grid--three-up": 3, "dark-teal-intelligence--values-grid--four-up": 4,
  "dark-teal-intelligence--values-grid--two-up-wide": 2, "dark-teal-intelligence--metric--two-up": 2,
  "dark-teal-intelligence--metric--three-up": 3, "dark-teal-intelligence--metric--five-up": 5,
  "dark-teal-intelligence--metric--sequence-four": 4, "dark-teal-intelligence--compare--capability-boundary": 2,
  "dark-teal-intelligence--audience--wide": 3, "dark-teal-intelligence--audience--compact": 5,
  "dark-teal-intelligence--roadmap--overlap-four": 4, "dark-teal-intelligence--roadmap--sequence-three": 3,
  "dark-teal-intelligence--hero--dual-signal": 2, "dark-teal-intelligence--portrait--balanced": 2,
  "dark-teal-intelligence--portrait--featured-left": 2,
};

const assetRequirements = {
  "dark-teal-intelligence--hero--split-visual": {minimum: 1, type: "image_or_evidence", generated_image_requires_user_authorization: true},
  "dark-teal-intelligence--split-proof--image-left": {minimum: 1, type: "image", generated_image_requires_user_authorization: true},
  "dark-teal-intelligence--split-proof--image-right": {minimum: 1, type: "image", generated_image_requires_user_authorization: true},
  "dark-teal-intelligence--portrait--balanced": {minimum: 2, type: "image", generated_image_requires_user_authorization: true},
  "dark-teal-intelligence--portrait--featured-left": {minimum: 2, type: "image", generated_image_requires_user_authorization: true},
  "dark-teal-intelligence--map--map-left": {minimum: 1, type: "map_or_geographic_evidence", generated_image_requires_user_authorization: true},
  "dark-teal-intelligence--map--map-right": {minimum: 1, type: "map_or_geographic_evidence", generated_image_requires_user_authorization: true},
};

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
function setAttr(node, name, value) {
  node.attrs ??= [];
  const existing = node.attrs.find((item) => item.name === name);
  if (existing) existing.value = value;
  else node.attrs.push({name, value});
}
function walk(node, visit, pathParts = []) {
  visit(node, pathParts);
  for (const [index, child] of (node.childNodes ?? []).entries()) walk(child, visit, [...pathParts, index]);
}
function findAll(node, predicate) {
  const found = [];
  walk(node, (child, childPath) => { if (predicate(child)) found.push({node: child, path: childPath}); });
  return found;
}
function layoutId(template, section) {
  if (template === "field-notes-a") return `${template}--${attr(section, "data-template-type")}`;
  return `${template}--${attr(section, "data-layout")}--${attr(section, "data-variant")}`;
}
function classTokens(node) {
  return (attr(node, "class") ?? "").split(/\s+/u).filter(Boolean).filter((name) => !["active", "visible"].includes(name)).sort();
}
function nearestLabel(node) {
  const classes = classTokens(node).filter((name) => !/^d\d+$/u.test(name) && name !== "reveal");
  return classes[0] ?? node.tagName ?? "text";
}
function assetTargetClass(layoutId) {
  if (layoutId.includes("--split-proof--")) return "photo-slot";
  if (layoutId.includes("--portrait--")) return "portrait";
  if (layoutId.includes("--map--")) return "map-slot";
  if (layoutId === "dark-teal-intelligence--hero--split-visual") return "hero-evidence";
  return null;
}
function markAssetSlots(section, layoutId) {
  const targetClass = assetTargetClass(layoutId);
  if (!targetClass) return [];
  const found = findAll(section, (node) => node.tagName && classTokens(node).includes(targetClass));
  return found.map(({node, path: nodePath}, index) => {
    const slot_id = `asset-${String(index + 1).padStart(2, "0")}`;
    setAttr(node, "data-asset-slot-id", slot_id);
    return {slot_id, path: nodePath, type: layoutId.includes("--map--") ? "map_or_geographic_evidence" : layoutId.includes("--hero--") ? "image_or_evidence" : "image", required: true};
  });
}
function insideAssetSlot(node) {
  let current = node;
  while (current) {
    if (attr(current, "data-asset-slot-id")) return true;
    current = current.parentNode;
  }
  return false;
}
function collectSlots(section) {
  const slots = [];
  const counts = new Map();
  const systemClasses = new Set(["page", "footer-page"]);
  walk(section, (node, nodePath) => {
    if (!node.tagName || ["script", "style"].includes(node.tagName) || insideAssetSlot(node) || classTokens(node).some((name) => systemClasses.has(name))) return;
    const children = node.childNodes ?? [];
    const elementChildren = children.filter((child) => child.tagName && child.tagName !== "br");
    const meaningfulText = children.filter((child) => child.nodeName === "#text" && child.value.trim());
    if (!meaningfulText.length) return;
    const base = nearestLabel(node).replace(/[^a-z0-9-]+/giu, "-").toLowerCase();
    if (elementChildren.length === 0) {
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      slots.push({slot_id: `${base}-${String(count).padStart(2, "0")}`, kind: ["h1", "h2"].includes(node.tagName) || classTokens(node).some((name) => /title|headline|quote/u.test(name)) ? "semantic_text" : "plain_text", target: "element_content", path: nodePath, required: true});
    } else {
      for (const textNode of meaningfulText) {
        const count = (counts.get(base) ?? 0) + 1;
        counts.set(base, count);
        slots.push({slot_id: `${base}-${String(count).padStart(2, "0")}`, kind: "plain_text", target: "text_node", path: [...nodePath, children.indexOf(textNode)], required: true});
      }
    }
  });
  return slots;
}
function skeleton(node) {
  if (node.nodeName === "#text") return null;
  if (node.tagName === "br") return null;
  if (!node.tagName) return (node.childNodes ?? []).map(skeleton).filter(Boolean);
  const ignoredAttrs = new Set(["id", "aria-label", "style", "src", "srcset", "alt"]);
  return {
    tag: node.tagName,
    classes: classTokens(node),
    attrs: Object.fromEntries((node.attrs ?? []).filter((item) => !ignoredAttrs.has(item.name) && item.name !== "class").map((item) => [item.name, item.value]).sort(([a], [b]) => a.localeCompare(b))),
    children: attr(node, "data-asset-slot-id") ? [] : (node.childNodes ?? []).map(skeleton).flat().filter(Boolean),
  };
}
function directZoneClasses(section) {
  return (section.childNodes ?? []).filter((node) => node.tagName).flatMap(classTokens).filter((name) => !["frame", "page", "footer", "footer-page", "report-frame", "footer-rule", "footer-logo", "footer-year"].includes(name));
}

const layouts = [];
for (const template of templates) {
  const file = path.join(root, "assets", "templates", template, "template.html");
  const document = parse(await readFile(file, "utf8"));
  const sections = findAll(document, (node) => node.tagName === "section" && classTokens(node).includes("slide"));
  for (const {node: section} of sections) {
    const id = layoutId(template, section);
    setAttr(section, "data-layout-id", id);
    const assetSlots = markAssetSlots(section, id);
    const layout = template === "field-notes-a" ? attr(section, "data-template-type") : attr(section, "data-layout");
    const variant = template === "field-notes-a" ? null : attr(section, "data-variant");
    const slots = collectSlots(section);
    const bone = skeleton(section);
    const sparse = ["cover", "closing"].includes(layout) || (template === "dark-teal-intelligence" && ["hero", "editorial"].includes(layout));
    layouts.push({
      layout_id: id,
      template,
      layout,
      variant,
      status: "production",
      semantic_roles: roleMap[template][layout],
      capacity: {item_count: exactItems[id] ?? null, text_slot_count: slots.length, overflow_action: "change_layout_or_split"},
      slots,
      asset_requirements: {...(assetRequirements[id] ?? {minimum: 0, type: null, generated_image_requires_user_authorization: true}), slots: assetSlots},
      semantic_text_rules: {max_distinct_tones: 2, allowed_tones: ["primary", "accent", "contrast", "muted"]},
      visual_contract: {
        semantic_zones: directZoneClasses(section),
        required_zones: directZoneClasses(section),
        allowed_whitespace_zones: sparse ? ["editorial-negative-space"] : ["outer-margins", "component-gaps"],
        minimum_density: {required_text_slots: slots.length, content_envelope_width_ratio: sparse ? 0.25 : 0.55},
        allowed_overlaps: layout === "roadmap" || layout === "audience" ? ["registered-component-overlap"] : ["decorative-stage-bleed"],
      },
      canonical_skeleton: {fingerprint: createHash("sha256").update(JSON.stringify(bone)).digest("hex"), ignored_values: ["slot_text", "asset_paths", "theme_variables", "approved_semantic_spans", "runtime_state"]},
    });
  }
  await writeFile(file, serialize(document), "utf8");
}

const registry = {
  version: 1,
  cue_numbering: "one_based_inclusive_parsed_order",
  themes: {
    "field-notes-a": {
      default_preset: "botanical-deep",
      presets: {"botanical-deep": {background: "#0E1711", surface: "#1F301F", text_primary: "#F2EDDC", text_muted: "#B7BDA5", accent_primary: "#D5E576", accent_secondary: "#B87552"}},
      required_roles: ["background", "surface", "text_primary", "text_muted", "accent_primary", "accent_secondary"],
      ranges: {background: {lightness: [3, 25]}, surface: {lightness: [6, 38]}, text_primary: {lightness: [75, 100]}, text_muted: {lightness: [45, 88]}, accent_primary: {lightness: [35, 92], saturation: [25, 100]}, accent_secondary: {lightness: [30, 85], saturation: [20, 100]}},
      contrast: [{foreground: "text_primary", background: "background", minimum: 4.5}, {foreground: "text_muted", background: "background", minimum: 3}, {foreground: "accent_primary", background: "background", minimum: 3}],
      relationship: "background < surface < text_primary",
      custom_theme_requires_validation: true
    },
    "dark-teal-intelligence": {
      default_preset: "intelligence-teal",
      presets: {"intelligence-teal": {background: "#202324", surface: "#292B2C", text_primary: "#F3F4F2", text_muted: "#A4AAA8", accent_primary: "#18E3D0", accent_secondary: "#86EEE6"}},
      required_roles: ["background", "surface", "text_primary", "text_muted", "accent_primary", "accent_secondary"],
      ranges: {background: {lightness: [4, 28]}, surface: {lightness: [7, 40]}, text_primary: {lightness: [75, 100]}, text_muted: {lightness: [45, 88]}, accent_primary: {lightness: [35, 90], saturation: [30, 100]}, accent_secondary: {lightness: [40, 95], saturation: [20, 100]}},
      contrast: [{foreground: "text_primary", background: "background", minimum: 4.5}, {foreground: "text_muted", background: "background", minimum: 3}, {foreground: "accent_primary", background: "background", minimum: 3}],
      relationship: "background < surface < text_primary",
      custom_theme_requires_validation: true
    },
  },
  layouts,
};
await writeFile(path.join(root, "assets", "templates", "layout-registry.json"), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(JSON.stringify({layouts: layouts.length, a: layouts.filter((item) => item.template === "field-notes-a").length, b: layouts.filter((item) => item.template === "dark-teal-intelligence").length}));
