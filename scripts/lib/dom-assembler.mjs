import {createHash} from "node:crypto";
import {defaultTreeAdapter, parse, parseFragment, serializeOuter} from "parse5";
import {validateSemanticText} from "./theme-contract.mjs";

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
function setAttr(node, name, value) {
  node.attrs ??= [];
  const existing = node.attrs.find((item) => item.name === name);
  if (existing) existing.value = String(value);
  else node.attrs.push({name, value: String(value)});
}
function classTokens(node) {
  return (attr(node, "class") ?? "").split(/\s+/u).filter(Boolean).filter((name) => !["active", "visible"].includes(name)).sort();
}
function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
}
function findSection(document, layoutId) {
  let found;
  walk(document, (node) => { if (node.tagName === "section" && attr(node, "data-layout-id") === layoutId) found = node; });
  return found;
}
function nodeAtPath(root, path) {
  return path.reduce((node, index) => node?.childNodes?.[index], root);
}
function attachChildren(parent, children) {
  parent.childNodes = children;
  for (const child of children) child.parentNode = parent;
}
function escapedFragment(value) {
  const escaped = String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  return parseFragment(escaped.replaceAll("\n", "<br>")).childNodes;
}
function semanticChildren(value) {
  const result = validateSemanticText(value);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  const html = value.segments.map((segment) => `<span class="semantic-tone semantic-tone--${segment.tone}" data-semantic-tone="${segment.tone}">${String(segment.text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</span>`).join("");
  return parseFragment(html).childNodes;
}
function assetChildren(value) {
  if (!value || typeof value !== "object" || !String(value.src ?? "").trim() || !String(value.alt ?? "").trim()) throw new Error("asset requires src and alt");
  if (/^(?:[a-z]+:|\/|~)/iu.test(value.src) || value.src.includes("..")) throw new Error("asset src must be a safe job-relative path");
  const escapedSrc = String(value.src).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const escapedAlt = String(value.alt).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  return parseFragment(`<img data-generated-asset="true" src="${escapedSrc}" alt="${escapedAlt}">`).childNodes;
}
function setTextNode(node, value) {
  if (node?.nodeName !== "#text") throw new Error("registered text-node path no longer matches the mother template");
  node.value = String(value);
}

export function assembleRegisteredSection(templateHtml, entry, slots, scene) {
  const expected = new Set(entry.slots.map((slot) => slot.slot_id));
  for (const slot of entry.slots) if (!(slot.slot_id in (slots ?? {}))) throw new Error(`missing slot ${slot.slot_id}`);
  for (const key of Object.keys(slots ?? {})) if (!expected.has(key)) throw new Error(`unknown slot ${key}`);
  const document = parse(templateHtml);
  const source = findSection(document, entry.layout_id);
  if (!source) throw new Error(`mother template has no ${entry.layout_id}`);
  const section = structuredClone(source);
  for (const slot of entry.slots) {
    const target = nodeAtPath(section, slot.path);
    const value = slots[slot.slot_id];
    if (slot.kind === "plain_text" && typeof value !== "string") throw new Error(`${slot.slot_id} must be plain text`);
    if (slot.target === "text_node") setTextNode(target, value);
    else if (slot.target === "element_content") attachChildren(target, slot.kind === "semantic_text" ? semanticChildren(value) : escapedFragment(value));
    else throw new Error(`unsupported slot target ${slot.target}`);
  }
  const expectedAssets = new Set((entry.asset_requirements?.slots ?? []).map((slot) => slot.slot_id));
  const suppliedAssets = scene.assets ?? {};
  for (const asset of entry.asset_requirements?.slots ?? []) {
    if (!(asset.slot_id in suppliedAssets)) throw new Error(`missing asset ${asset.slot_id}`);
    attachChildren(nodeAtPath(section, asset.path), assetChildren(suppliedAssets[asset.slot_id]));
  }
  for (const key of Object.keys(suppliedAssets)) if (!expectedAssets.has(key)) throw new Error(`unknown asset ${key}`);
  setAttr(section, "id", scene.scene_id);
  setAttr(section, "aria-label", scene.narration);
  const classes = classTokens(section);
  if (scene.page_index === 1) classes.push("active", "visible");
  setAttr(section, "class", classes.join(" "));
  const page = `${String(scene.page_index).padStart(2, "0")} / ${String(scene.page_total).padStart(2, "0")}`;
  walk(section, (node) => { if (classTokens(node).some((name) => ["page", "footer-page"].includes(name))) attachChildren(node, [defaultTreeAdapter.createTextNode(page)]); });
  return serializeOuter(section);
}

function normalized(node) {
  if (node?.nodeName === "#text") return null;
  if (node?.tagName === "br") return null;
  if (!node?.tagName) return (node?.childNodes ?? []).map(normalized).flat().filter(Boolean);
  if (node.tagName === "span" && attr(node, "data-semantic-tone")) return [];
  const ignoredAttrs = new Set(["id", "aria-label", "style", "src", "srcset", "alt"]);
  return {
    tag: node.tagName,
    classes: classTokens(node),
    attrs: Object.fromEntries((node.attrs ?? []).filter((item) => !ignoredAttrs.has(item.name) && item.name !== "class").map((item) => [item.name, item.value]).sort(([a], [b]) => a.localeCompare(b))),
    children: attr(node, "data-asset-slot-id") ? [] : (node.childNodes ?? []).map(normalized).flat().filter(Boolean),
  };
}
function fingerprint(node) {
  return createHash("sha256").update(JSON.stringify(normalized(node))).digest("hex");
}

export function validateCanonicalSkeleton(templateHtml, generatedSectionHtml, entry) {
  const template = parse(templateHtml);
  const canonical = findSection(template, entry.layout_id);
  const generatedDocument = parseFragment(generatedSectionHtml);
  const generated = findSection(generatedDocument, entry.layout_id);
  const errors = [];
  if (!canonical || !generated) errors.push("canonical or generated section is missing");
  else {
    const canonicalHash = fingerprint(canonical);
    const generatedHash = fingerprint(generated);
    if (canonicalHash !== entry.canonical_skeleton.fingerprint) errors.push("registry canonical fingerprint does not match mother template");
    if (generatedHash !== canonicalHash) errors.push("generated normalized skeleton differs from mother template");
  }
  return {ok: errors.length === 0, errors};
}
