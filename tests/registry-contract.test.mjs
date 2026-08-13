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

test("font inventory publishes only exact locally verified approved faces", async () => {
  const inventory = JSON.parse(await read("assets/fonts/font-inventory.json"));
  assert.equal(inventory.substitution_allowed, false);
  for (const template of ["field-notes-a", "dark-teal-intelligence"]) {
    const record = inventory.templates[template];
    assert.equal(record.publish_status, "publishable");
    assert.deepEqual(record.missing_families, []);
    assert.ok(record.browser_verified_at);
    for (const font of record.available_files) {
      assert.match(font.path, /\.(?:ttf|otf|woff2)$/u);
      assert.ok(font.family);
      assert.ok(font.weight);
      assert.match(font.sha256, /^[a-f0-9]{64}$/u);
      assert.ok(font.license);
      assert.equal(font.browser_recognized, true);
      await read(`assets/fonts/${font.license}`);
    }
  }
});
