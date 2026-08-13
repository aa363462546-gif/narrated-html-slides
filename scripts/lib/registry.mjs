import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const registryPath = path.join(root, "assets", "templates", "layout-registry.json");

let cache;
export async function readRegistry() {
  cache ??= JSON.parse(await readFile(registryPath, "utf8"));
  return cache;
}

export async function registryIndex() {
  const registry = await readRegistry();
  return new Map(registry.layouts.map((entry) => [entry.layout_id, entry]));
}
