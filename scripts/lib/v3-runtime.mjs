import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {defaultTreeAdapter, parse, parseFragment} from "parse5";

export const TEMPLATE_IDS = ["field-notes-a", "dark-teal-intelligence"];
export const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
export function setAttr(node, name, value) {
  node.attrs ??= [];
  const current = node.attrs.find((item) => item.name === name);
  if (current) current.value = String(value);
  else node.attrs.push({name, value: String(value)});
}
export function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
}
export function attachChildren(parent, children) {
  parent.childNodes = children;
  for (const child of children) child.parentNode = parent;
}
export function normalizedText(value) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim();
}

function pageMarkupSources(markup) {
  const sources = [];
  walk(parseFragment(String(markup)), (node) => {
    const src = attr(node, "src") ?? attr(node, "href");
    if (src) sources.push(String(src));
  });
  return sources;
}

function validatePageMarkup(markup, pageId) {
  const errors = [];
  const fragment = parseFragment(String(markup));
  walk(fragment, (node) => {
    if (node.tagName === "script" || node.tagName === "style" || ["iframe", "object", "embed", "audio", "video"].includes(node.tagName)) errors.push(`${pageId}: unsupported active or external element <${node.tagName}>`);
    for (const item of node.attrs ?? []) {
      if (/^on[a-z]+$/iu.test(item.name)) errors.push(`${pageId}: event handlers are not allowed in page HTML`);
      if (["src", "href"].includes(item.name) && /^(?:https?:|data:|javascript:|\/\/)/iu.test(item.value)) errors.push(`${pageId}: external page asset is not allowed`);
    }
  });
  return errors;
}

function layoutShortId(template, fullId) {
  const prefix = `${template}--`;
  return fullId.startsWith(prefix) ? fullId.slice(prefix.length) : null;
}

export function readTemplateShell(templateHtml, expectedTemplate) {
  const document = parse(templateHtml);
  let htmlNode;
  let stage;
  let head;
  let title;
  walk(document, (node) => {
    if (node.tagName === "html") htmlNode = node;
    if (node.tagName === "head") head = node;
    if (node.tagName === "title") title = node;
    if (node.tagName === "main" && attr(node, "id") === "deckStage") stage = node;
  });
  if (!htmlNode || !head || !title || !stage) throw new Error("template shell is incomplete");
  if (attr(htmlNode, "data-template-id") !== expectedTemplate) throw new Error("template id does not match its directory");
  const themes = new Set(String(attr(htmlNode, "data-theme-presets") ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  if (themes.size === 0) throw new Error(`${expectedTemplate}: no controlled theme preset is defined`);
  return {document, htmlNode, head, title, stage, themes};
}

export function readTemplateModel(templateHtml, expectedTemplate) {
  const model = readTemplateShell(templateHtml, expectedTemplate);
  const layouts = new Map();
  walk(model.document, (node) => {
    if (node.tagName === "section" && attr(node, "data-layout-id")) {
      const fullId = attr(node, "data-layout-id");
      const shortId = layoutShortId(expectedTemplate, fullId);
      if (!shortId) throw new Error(`${fullId}: layout does not belong to ${expectedTemplate}`);
      if (layouts.has(shortId)) throw new Error(`${shortId}: duplicate layout`);
      const slots = new Map();
      const assets = new Map();
      walk(node, (child) => {
        const slot = attr(child, "data-slot");
        const asset = attr(child, "data-asset-slot");
        if (slot) {
          if (slots.has(slot)) throw new Error(`${fullId}: duplicate slot ${slot}`);
          slots.set(slot, {node: child, kind: attr(child, "data-slot-kind") ?? "plain-text"});
        }
        if (asset) {
          if (assets.has(asset)) throw new Error(`${fullId}: duplicate asset slot ${asset}`);
          assets.set(asset, child);
        }
      });
      layouts.set(shortId, {fullId, node, slots, assets});
    }
  });
  return {...model, layouts};
}

function parseSrtTime(raw) {
  const match = String(raw).trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/u);
  if (!match) throw new Error(`invalid SRT timestamp ${raw}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

export function parseSrt(text) {
  const blocks = String(text).replaceAll("\r\n", "\n").trim().split(/\n{2,}/u);
  return blocks.map((block, position) => {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) throw new Error(`SRT cue ${position + 1} has no timing line`);
    const [startRaw, endRaw] = lines[timingIndex].split("-->").map((part) => part.trim().split(/\s+/u)[0]);
    const cueText = lines.slice(timingIndex + 1).join("\n").trim();
    if (!cueText) throw new Error(`SRT cue ${position + 1} has no text`);
    return {position: position + 1, start: parseSrtTime(startRaw), end: parseSrtTime(endRaw), text: cueText};
  });
}

function compactSource(value) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/gu, "");
}

export async function resolvePageNarration(deck, jobDir) {
  if (deck.source?.type === "text") {
    if (!String(deck.source.text ?? "").trim()) throw new Error("source.text is required for text input");
    const combined = deck.pages.map((page) => page.source_text ?? "").join("");
    if (compactSource(combined) !== compactSource(deck.source.text)) throw new Error("pages do not cover the complete text source in order");
    return deck.pages.map((page) => ({narration: page.source_text, start: null, end: null, cue_range: null}));
  }
  if (deck.source?.type !== "srt_audio") throw new Error("source.type must be text or srt_audio");
  if (!String(deck.source.srt ?? "").trim()) throw new Error("source.srt is required");
  const srtPath = path.isAbsolute(deck.source.srt) ? deck.source.srt : path.join(jobDir, deck.source.srt);
  const cues = parseSrt(await readFile(srtPath, "utf8"));
  let previousEnd = 0;
  for (const page of deck.pages) {
    const range = page.cue_range;
    if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isInteger)) throw new Error(`${page.id}: cue_range must contain two integers`);
    const [start, end] = range;
    if (start < 1 || end < start || end > cues.length) throw new Error(`${page.id}: cue_range is outside the SRT`);
    if (start <= previousEnd) throw new Error(`${page.id}: page cue ranges must be ordered and non-overlapping`);
    if (start !== previousEnd + 1) throw new Error(`${page.id}: page coverage has a cue gap`);
    previousEnd = end;
  }
  if (previousEnd !== cues.length) throw new Error("pages do not cover the final SRT cue");
  return deck.pages.map((page) => {
    const [start, end] = page.cue_range;
    return {
      narration: cues.slice(start - 1, end).map((cue) => cue.text).join("\n"),
      start: cues[start - 1].start,
      end: cues[end - 1].end,
      cue_range: [start, end]
    };
  });
}

export function validateDeckShape(deck, model) {
  const errors = [];
  if (deck?.version !== 4) errors.push("deck.json must use version 4");
  if (!TEMPLATE_IDS.includes(deck?.template)) errors.push("deck.template is unsupported");
  if (!deck?.theme?.preset || !model.themes.has(deck.theme.preset)) errors.push(`theme preset ${deck?.theme?.preset ?? "(missing)"} is not defined by template.html`);
  if (!Array.isArray(deck?.pages) || deck.pages.length === 0) errors.push("deck.pages must be non-empty");
  if ("director" in (deck ?? {})) errors.push("director is not part of the speaker-led V3 contract; map source directly on pages");
  const ids = new Set();
  for (const page of deck?.pages ?? []) {
    if (!page.id || ids.has(page.id)) errors.push(`${page.id ?? "page"}: page id is missing or duplicated`);
    ids.add(page.id);
    if ("narration" in page) errors.push(`${page.id}: narration is derived from source_text or cue_range`);
    if (!String(page.content_html ?? "").trim()) errors.push(`${page.id}: content_html is required`);
    errors.push(...validatePageMarkup(page.content_html, page.id ?? "page"));
    if ("layout" in page || "slots" in page) errors.push(`${page.id}: layout and slots are removed; compose the page in content_html`);
    if (deck.source?.type === "srt_audio") {
      if (!Array.isArray(page.cue_range) || page.cue_range.length !== 2 || !page.cue_range.every(Number.isInteger)) errors.push(`${page.id}: SRT page requires an integer cue_range`);
      if ("source_text" in page) errors.push(`${page.id}: SRT page must not declare source_text`);
    } else if (deck.source?.type === "text") {
      if (!String(page.source_text ?? "").trim()) errors.push(`${page.id}: text page requires source_text`);
      if ("cue_range" in page) errors.push(`${page.id}: text page must not invent cue_range`);
    }
    for (const [asset, value] of Object.entries(page.assets ?? {})) {
      if (!value?.src || !value?.alt || !value?.origin) errors.push(`${page.id}: asset ${asset} requires src, alt, and origin`);
      if (value?.origin && !["generated", "external", "user-provided"].includes(value.origin)) errors.push(`${page.id}: asset ${asset} origin is unsupported`);
      if (value?.origin === "generated" && !deck.permissions?.generated_images) errors.push(`${page.id}: generated_images permission is false`);
      if (value?.origin !== "generated" && !deck.permissions?.external_assets) errors.push(`${page.id}: external_assets permission is false`);
      if (/^(?:[a-z]+:|\/|~)/iu.test(String(value?.src ?? "")) || String(value?.src ?? "").includes("..")) errors.push(`${page.id}: asset ${asset} src must be job-relative`);
    }
    for (const source of pageMarkupSources(page.content_html)) {
      if (source.startsWith("assets/") && !Object.values(page.assets ?? {}).some((asset) => asset.src === source)) errors.push(`${page.id}: markup asset ${source} is not declared in page.assets`);
    }
  }
  return errors;
}

function assetChildren(value) {
  const src = String(value.src).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const alt = String(value.alt).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  return parseFragment(`<img data-deck-asset="true" src="${src}" alt="${alt}">`).childNodes;
}

export function fillPage(page, narration, index, total) {
  const section = parseFragment('<section class="slide free-page"></section>').childNodes[0];
  attachChildren(section, parseFragment(String(page.content_html)).childNodes);
  setAttr(section, "id", page.id);
  if (page.visual_form) setAttr(section, "data-visual-form", page.visual_form);
  setAttr(section, "aria-label", narration.narration);
  setAttr(section, "data-page-index", index + 1);
  if (narration.cue_range) {
    setAttr(section, "data-cue-start", narration.cue_range[0]);
    setAttr(section, "data-cue-end", narration.cue_range[1]);
    setAttr(section, "data-start", narration.start.toFixed(3));
    setAttr(section, "data-end", narration.end.toFixed(3));
  }
  const classes = new Set(String(attr(section, "class") ?? "").split(/\s+/u).filter(Boolean));
  classes.delete("active"); classes.delete("visible");
  if (index === 0) { classes.add("active"); classes.add("visible"); }
  setAttr(section, "class", [...classes].join(" "));
  const pageNumber = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  walk(section, (node) => {
    const classes = String(attr(node, "class") ?? "").split(/\s+/u);
    if (classes.includes("page") || classes.includes("footer-page")) attachChildren(node, [defaultTreeAdapter.createTextNode(pageNumber)]);
  });
  return section;
}

export async function assertJobAssets(deck, jobDir) {
  for (const page of deck.pages) for (const asset of Object.values(page.assets ?? {})) await access(path.join(jobDir, asset.src));
}
