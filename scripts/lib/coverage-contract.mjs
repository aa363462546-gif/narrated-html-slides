const dedupe = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}:${item.source_text.normalize("NFKC").toLocaleLowerCase("zh-CN")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((item, index) => ({id: `coverage-${String(index + 1).padStart(3, "0")}`, ...item}));
};

export function extractCoverageItems(source) {
  const text = String(source);
  const items = [];
  for (const match of text.matchAll(/\b[A-Za-z][A-Za-z0-9.+#/-]*(?:\s+[A-Za-z][A-Za-z0-9.+#/-]*){0,2}\b/gu)) items.push({source_text: match[0], type: "proper_name", extracted_by: "rule"});
  for (const match of text.matchAll(/\d+(?:\.\d+)?\s*(?:%|％|元|万元|亿|秒|分钟|小时|个|项|步|倍)/gu)) items.push({source_text: match[0].replace(/\s+/gu, ""), type: "number", extracted_by: "rule"});
  for (const match of text.matchAll(/第[一二三四五六七八九十\d]+步[^、，；。]*/gu)) items.push({source_text: match[0], type: "step", extracted_by: "rule"});
  for (const match of text.matchAll(/(?:比较|对比)[^，；。]{1,40}(?:与|和|跟|vs\.?)[^，；。]{1,40}/giu)) items.push({source_text: match[0], type: "comparison", extracted_by: "rule"});
  for (const match of text.matchAll(/[“「《]([^”」》]{2,40})[”」》]/gu)) items.push({source_text: match[1], type: "quoted_name", extracted_by: "rule"});
  return dedupe(items);
}

const omissionCodes = new Set(["nonessential-background-time", "duplicate-alias", "spoken-filler", "already-visible-equivalent"]);

export function validateCoveragePlan(plan, extractedItems, finalPlan) {
  const errors = [];
  const entries = Array.isArray(plan?.items) ? plan.items : [];
  const byText = new Map(entries.map((entry) => [String(entry.source_text).normalize("NFKC").toLocaleLowerCase("zh-CN"), entry]));
  for (const item of extractedItems) if (!byText.has(item.source_text.normalize("NFKC").toLocaleLowerCase("zh-CN"))) errors.push(`coverage missing extracted item: ${item.source_text}`);
  const sceneIds = new Set(finalPlan?.scenes?.map((scene) => scene.scene_id) ?? []);
  for (const entry of entries) {
    if (entry.status === "visible") {
      if (!sceneIds.has(entry.scene_id) || !entry.slot) errors.push(`${entry.id}: visible item needs a valid scene_id and slot`);
    } else if (entry.status === "omitted") {
      if (!omissionCodes.has(entry.omit_reason_code) || !String(entry.omit_reason ?? "").trim()) errors.push(`${entry.id}: omitted item needs an approved specific reason`);
    } else errors.push(`${entry.id}: status must be visible or omitted`);
  }
  return {ok: errors.length === 0, errors};
}
