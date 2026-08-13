const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;")
  .replaceAll("\n", "<br>");

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertExactKeys(value, required, label) {
  assertObject(value, label);
  const allowed = new Set(required);
  for (const key of required) if (!(key in value)) throw new Error(`${label}.${key} is required`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new Error(`${label}.${key} is not an approved slot`);
}

function replaceClassText(html, className, value, occurrence = 0) {
  const classPattern = escapeRegExp(className);
  const pattern = new RegExp(`(<([a-z][\\w:-]*)\\b[^>]*class=["'][^"']*(?<![\\w-])${classPattern}(?![\\w-])[^"']*["'][^>]*>)([\\s\\S]*?)(<\\/\\2>)`, "giu");
  let seen = 0;
  let replaced = false;
  const output = html.replace(pattern, (match, open, tag, inner, close) => {
    if (seen++ !== occurrence) return match;
    replaced = true;
    return `${open}${escapeHtml(value)}${close}`;
  });
  if (!replaced) throw new Error(`Canonical template is missing .${className} occurrence ${occurrence + 1}`);
  return output;
}

function replaceTagText(html, tagName, value, occurrence = 0) {
  const tag = escapeRegExp(tagName);
  const pattern = new RegExp(`(<${tag}\\b[^>]*>)([\\s\\S]*?)(<\\/${tag}>)`, "giu");
  let seen = 0;
  let replaced = false;
  const output = html.replace(pattern, (match, open, inner, close) => {
    if (seen++ !== occurrence) return match;
    replaced = true;
    return `${open}${escapeHtml(value)}${close}`;
  });
  if (!replaced) throw new Error(`Canonical template is missing <${tagName}> occurrence ${occurrence + 1}`);
  return output;
}

function replaceRepeated(html, className, items, renderItem) {
  const classPattern = escapeRegExp(className);
  const pattern = new RegExp(`(<article\\b[^>]*class=["'][^"']*(?<![\\w-])${classPattern}(?![\\w-])[^"']*["'][^>]*>)([\\s\\S]*?)(<\\/article>)`, "giu");
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== items.length) throw new Error(`${className} requires exactly ${matches.length} items; received ${items.length}`);
  let index = 0;
  return html.replace(pattern, (match, open, inner, close) => `${open}${renderItem(inner, items[index], index++)}${close}`);
}

function sectionKey(scene) {
  return scene.variant ? `${scene.layout}/${scene.variant}` : scene.layout;
}

function findCanonicalSection(template, scene) {
  const sections = [...template.matchAll(/<section\b([^>]*)>[\s\S]*?<\/section>/giu)];
  const found = sections.find((match) => {
    const attrs = match[1];
    if (scene.variant == null) return attrs.match(/\bdata-template-type=["']([^"']+)["']/iu)?.[1] === scene.layout;
    return attrs.match(/\bdata-layout=["']([^"']+)["']/iu)?.[1] === scene.layout
      && attrs.match(/\bdata-variant=["']([^"']+)["']/iu)?.[1] === scene.variant;
  });
  if (!found) throw new Error(`Mother template has no canonical section for ${sectionKey(scene)}`);
  return found[0];
}

function renderACore(section, slots) {
  assertExactKeys(slots, ["eyebrow", "title", "subtitle", "orbit_label"], "slots");
  section = replaceClassText(section, "eyebrow", slots.eyebrow);
  section = replaceClassText(section, "title", slots.title);
  section = replaceClassText(section, "sub", slots.subtitle);
  return replaceClassText(section, "orbit-label", slots.orbit_label);
}

function renderACapability(section, slots) {
  assertExactKeys(slots, ["eyebrow", "title", "items"], "slots");
  if (!Array.isArray(slots.items)) throw new Error("slots.items must be an array");
  section = replaceClassText(section, "eyebrow", slots.eyebrow);
  section = replaceClassText(section, "title", slots.title);
  return replaceRepeated(section, "cap", slots.items, (inner, item, index) => {
    assertExactKeys(item, ["index", "title", "body"], `slots.items[${index}]`);
    inner = replaceClassText(inner, "cap-no", item.index);
    inner = replaceTagText(inner, "h3", item.title);
    return replaceTagText(inner, "p", item.body);
  });
}

function renderADualCompare(section, slots) {
  assertExactKeys(slots, ["eyebrow", "title", "items"], "slots");
  if (!Array.isArray(slots.items)) throw new Error("slots.items must be an array");
  section = replaceClassText(section, "eyebrow", slots.eyebrow);
  section = replaceClassText(section, "title", slots.title);
  return replaceRepeated(section, "compare-card", slots.items, (inner, item, index) => {
    assertExactKeys(item, ["label", "title", "body", "index"], `slots.items[${index}]`);
    inner = replaceClassText(inner, "compare-label", item.label);
    inner = replaceTagText(inner, "h3", item.title);
    inner = replaceTagText(inner, "p", item.body);
    return replaceClassText(inner, "compare-index", item.index);
  });
}

function renderBBoundary(section, slots) {
  assertExactKeys(slots, ["eyebrow", "title", "items"], "slots");
  if (!Array.isArray(slots.items)) throw new Error("slots.items must be an array");
  section = replaceClassText(section, "section-label", slots.eyebrow);
  section = replaceClassText(section, "headline", slots.title);
  return replaceRepeated(section, "capability-side", slots.items, (inner, item, index) => {
    assertExactKeys(item, ["mark", "title", "body", "caption"], `slots.items[${index}]`);
    inner = replaceClassText(inner, "capability-mark", item.mark);
    inner = replaceClassText(inner, "capability-title", item.title);
    inner = replaceClassText(inner, "capability-copy", item.body);
    return replaceClassText(inner, "capability-caption", item.caption);
  });
}

function renderBValues(section, slots) {
  assertExactKeys(slots, ["eyebrow", "title", "items"], "slots");
  if (!Array.isArray(slots.items)) throw new Error("slots.items must be an array");
  section = replaceClassText(section, "section-label", slots.eyebrow);
  section = replaceClassText(section, "headline", slots.title);
  return replaceRepeated(section, "value-card", slots.items, (inner, item, index) => {
    assertExactKeys(item, ["index", "title", "body"], `slots.items[${index}]`);
    inner = replaceClassText(inner, "value-index", item.index);
    inner = replaceClassText(inner, "subhead", item.title);
    inner = replaceClassText(inner, "body-copy", item.body);
    if (/\bvalue-result\b/u.test(inner)) inner = replaceClassText(inner, "value-result", `结果：${item.body}`);
    return inner;
  });
}

function renderBStatement(section, slots) {
  assertExactKeys(slots, ["eyebrow", "title", "quote", "note", "mark"], "slots");
  section = replaceClassText(section, "section-label", slots.eyebrow);
  section = replaceClassText(section, "headline", slots.title);
  section = replaceClassText(section, "statement-quote", slots.quote);
  section = replaceClassText(section, "statement-note", slots.note);
  return replaceClassText(section, "statement-mark", slots.mark);
}

const renderers = new Map([
  ["field-notes-a/core-idea", renderACore],
  ["field-notes-a/capability-grid", renderACapability],
  ["field-notes-a/dual-compare", renderADualCompare],
  ["dark-teal-intelligence/compare/capability-boundary", renderBBoundary],
  ["dark-teal-intelligence/values-grid/four-up", renderBValues],
  ["dark-teal-intelligence/editorial/statement-mark", renderBStatement],
]);

export function assembleCanonicalSection(template, scene, slots, {active, total}) {
  const rendererKey = `${scene._template}/${sectionKey(scene)}`;
  const renderer = renderers.get(rendererKey);
  if (!renderer) throw new Error(`Canonical slot schema is not implemented for ${rendererKey}`);
  let section = renderer(findCanonicalSection(template, scene), slots);
  const originalClass = section.match(/^<section\b[^>]*class=["']([^"']+)["']/iu)?.[1] ?? "slide";
  const classes = originalClass.split(/\s+/u).filter((name) => name && name !== "active" && name !== "visible");
  if (active.value) classes.push("active", "visible");
  const attrs = scene.variant == null
    ? `data-template-type="${escapeHtml(scene.layout)}"`
    : `data-layout="${escapeHtml(scene.layout)}" data-variant="${escapeHtml(scene.variant)}"`;
  section = section.replace(/^<section\b[^>]*>/iu, `<section class="${classes.join(" ")}" id="${escapeHtml(scene.scene_id)}" ${attrs} aria-label="${escapeHtml(scene.narration)}">`);
  const pageText = `${String(active.index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  section = scene.variant == null ? replaceClassText(section, "page", pageText) : replaceClassText(section, "footer-page", pageText);
  return section;
}
