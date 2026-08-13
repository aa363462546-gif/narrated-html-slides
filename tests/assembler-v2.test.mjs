import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {assembleRegisteredSection, validateCanonicalSkeleton} from "../scripts/lib/dom-assembler.mjs";
import {validateSemanticText, validateTheme} from "../scripts/lib/theme-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(await readFile(path.join(root, "assets/templates/layout-registry.json"), "utf8"));

test("semantic titles allow repeated discontinuous emphasis but at most two tones", () => {
  const good = {segments: [{text: "让", tone: "primary"}, {text: "AI", tone: "accent"}, {text: "操作", tone: "primary"}, {text: "电脑", tone: "accent"}]};
  assert.equal(validateSemanticText(good).ok, true);
  const bad = {segments: [...good.segments, {text: "现在", tone: "contrast"}]};
  assert.equal(validateSemanticText(bad).ok, false);
});

test("custom themes require exact roles, template ranges, and readable contrast", () => {
  assert.equal(validateTheme("field-notes-a", {preset: "botanical-deep"}, registry).ok, true);
  const arbitrary = validateTheme("field-notes-a", {background: "#FFFFFF", surface: "#FFFFFF", text_primary: "#FFFFFF", text_muted: "#FFFFFF", accent_primary: "#FFFFFF", accent_secondary: "#FFFFFF"}, registry);
  assert.equal(arbitrary.ok, false);
  assert.match(arbitrary.errors.join("\n"), /contrast|range|relationship/iu);
});

test("all A20 plus B31 production layouts assemble from registered slots and retain canonical skeletons", async () => {
  for (const entry of registry.layouts) {
    const template = await readFile(path.join(root, "assets/templates", entry.template, "template.html"), "utf8");
    const slots = Object.fromEntries(entry.slots.map((slot) => [slot.slot_id, slot.kind === "semantic_text" ? {segments: [{text: `标题 ${slot.slot_id}`, tone: "primary"}, {text: "重点", tone: "accent"}]} : `内容 ${slot.slot_id}`]));
    const assets = Object.fromEntries((entry.asset_requirements.slots ?? []).map((slot) => [slot.slot_id, {src: `assets/${slot.slot_id}.png`, alt: "用户提供的测试素材"}]));
    const section = assembleRegisteredSection(template, entry, slots, {scene_id: `fixture-${entry.layout_id}`, narration: "测试旁白", page_index: 1, page_total: 1, assets});
    assert.match(section, new RegExp(`data-layout-id=["']${entry.layout_id}["']`, "u"));
    assert.equal(validateCanonicalSkeleton(template, section, entry).ok, true, entry.layout_id);
  }
});

test("assembler rejects authored markup, unknown slots, and third-tone semantic text", async () => {
  const entry = registry.layouts.find((item) => item.layout_id === "field-notes-a--core-idea");
  const template = await readFile(path.join(root, "assets/templates", entry.template, "template.html"), "utf8");
  const slots = Object.fromEntries(entry.slots.map((slot) => [slot.slot_id, slot.kind === "semantic_text" ? {segments: [{text: "合法", tone: "primary"}]} : "合法"]));
  slots.unknown = "no";
  assert.throws(() => assembleRegisteredSection(template, entry, slots, {scene_id: "x", narration: "x", page_index: 1, page_total: 1}), /unknown slot/u);
  delete slots.unknown;
  const plain = entry.slots.find((slot) => slot.kind === "plain_text");
  slots[plain.slot_id] = "<strong>非法</strong>";
  const section = assembleRegisteredSection(template, entry, slots, {scene_id: "x", narration: "x", page_index: 1, page_total: 1});
  assert.doesNotMatch(section, /<strong>非法<\/strong>/u);
});

test("asset layouts require registered real assets and never leave placeholder frames", async () => {
  const entry = registry.layouts.find((item) => item.layout_id === "dark-teal-intelligence--split-proof--image-left");
  const template = await readFile(path.join(root, "assets/templates", entry.template, "template.html"), "utf8");
  const slots = Object.fromEntries(entry.slots.map((slot) => [slot.slot_id, slot.kind === "semantic_text" ? {segments: [{text: "证据", tone: "primary"}]} : "正文"]));
  assert.throws(() => assembleRegisteredSection(template, entry, slots, {scene_id: "asset", narration: "证据", page_index: 1, page_total: 1, assets: {}}), /asset/u);
  const section = assembleRegisteredSection(template, entry, slots, {scene_id: "asset", narration: "证据", page_index: 1, page_total: 1, assets: {"asset-01": {src: "assets/evidence.png", alt: "用户提供的证据"}}});
  assert.match(section, /<img[^>]+assets\/evidence\.png/u);
  assert.equal(validateCanonicalSkeleton(template, section, entry).ok, true);
});
