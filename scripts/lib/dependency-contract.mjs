import {parse} from "parse5";

const pathLooksMachineSpecific = (value) => /^(?:file:\/\/|\/Users\/|[A-Z]:\\)/u.test(String(value).trim());
const isRemoteUrl = (value) => /^https?:\/\//iu.test(String(value).trim());
const externalProjectPath = (value) => /(?:^|[\\/])(?:frontend-slides|Hyperframes|narrated-video-pipeline|Remocha)(?:[\\/]|$)/iu.test(String(value));

export function validateDocumentDependencies(html) {
  const errors = [];
  const document = parse(String(html));
  const references = [];
  const inlineExecutable = [];
  const walk = (node) => {
    const attrs = Object.fromEntries((node.attrs ?? []).map((item) => [item.name, item.value]));
    for (const name of ["src", "href", "action", "poster", "data"]) if (attrs[name]) references.push({context: `${node.tagName ?? "node"}[${name}]`, value: attrs[name]});
    if (attrs.srcset) for (const candidate of attrs.srcset.split(",")) references.push({context: `${node.tagName ?? "node"}[srcset]`, value: candidate.trim().split(/\s+/u)[0]});
    if (attrs.style) for (const match of attrs.style.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/giu)) references.push({context: "style attribute url()", value: match[1]});
    if (node.tagName === "style") {
      const css = (node.childNodes ?? []).map((child) => child.value ?? "").join("");
      for (const match of css.matchAll(/(?:@import\s+(?:url\()?|url\()\s*["']?([^"')\s;]+)["']?\s*\)?/giu)) references.push({context: "CSS resource", value: match[1]});
    }
    if (node.tagName === "script" && !attrs.src) inlineExecutable.push((node.childNodes ?? []).map((child) => child.value ?? "").join(""));
    for (const child of node.childNodes ?? []) walk(child);
  };
  walk(document);

  for (const source of inlineExecutable) {
    for (const match of source.matchAll(/(?:import\s+(?:[\s\S]*?\s+from\s+)?|import\s*\(|require\s*\()\s*["']([^"']+)["']/gu)) references.push({context: "JavaScript import", value: match[1]});
  }
  for (const reference of references) {
    if (isRemoteUrl(reference.value)) errors.push(`${reference.context} uses external URL: ${reference.value}`);
    else if (pathLooksMachineSpecific(reference.value)) errors.push(`${reference.context} uses a machine-specific path: ${reference.value}`);
    else if (externalProjectPath(reference.value)) errors.push(`${reference.context} depends on an external project path: ${reference.value}`);
  }
  return {ok: errors.length === 0, errors, references};
}
