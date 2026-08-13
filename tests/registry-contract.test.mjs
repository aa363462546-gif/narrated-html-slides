import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("registry contains exactly A20 plus B31 stable layout ids", async () => {
  const registry = JSON.parse(await read("assets/templates/layout-registry.json"));
  assert.equal(registry.version, 1);
  assert.equal(registry.layouts.length, 51);
  assert.equal(registry.layouts.filter((entry) => entry.template === "field-notes-a").length, 20);
  assert.equal(registry.layouts.filter((entry) => entry.template === "dark-teal-intelligence").length, 31);
  assert.equal(new Set(registry.layouts.map((entry) => entry.layout_id)).size, 51);
  for (const entry of registry.layouts) {
    assert.match(entry.layout_id, /^(field-notes-a|dark-teal-intelligence)--[a-z0-9-]+(?:--[a-z0-9-]+)?$/u);
    assert.ok(Array.isArray(entry.semantic_roles) && entry.semantic_roles.length > 0);
    assert.ok(entry.capacity && typeof entry.capacity === "object");
    assert.ok(Array.isArray(entry.slots) && entry.slots.length > 0);
    assert.ok(entry.visual_contract?.required_zones);
    assert.ok(entry.canonical_skeleton?.fingerprint);
  }
});

test("every mother section has one registry-backed data-layout-id", async () => {
  const registry = JSON.parse(await read("assets/templates/layout-registry.json"));
  for (const [template, expected] of [["field-notes-a", 20], ["dark-teal-intelligence", 31]]) {
    const html = await read(`assets/templates/${template}/template.html`);
    const ids = [...html.matchAll(/<section\b[^>]*\bdata-layout-id=["']([^"']+)["']/giu)].map((match) => match[1]);
    assert.equal(ids.length, expected);
    assert.equal(new Set(ids).size, expected);
    assert.deepEqual(new Set(ids), new Set(registry.layouts.filter((entry) => entry.template === template).map((entry) => entry.layout_id)));
  }
});

test("font inventory blocks publication without substituting approved faces", async () => {
  const inventory = JSON.parse(await read("assets/fonts/font-inventory.json"));
  assert.equal(inventory.templates["field-notes-a"].publish_status, "blocked_by_font");
  assert.equal(inventory.templates["dark-teal-intelligence"].publish_status, "blocked_by_font");
  assert.deepEqual(inventory.templates["field-notes-a"].missing_families, ["Noto Serif SC", "Noto Sans SC", "DM Mono"]);
  assert.deepEqual(inventory.templates["dark-teal-intelligence"].missing_families, ["IBM Plex Mono"]);
  assert.equal(inventory.substitution_allowed, false);
});
