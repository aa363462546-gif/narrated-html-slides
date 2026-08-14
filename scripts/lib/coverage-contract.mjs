const dedupe = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}:${item.source_text.normalize("NFKC").toLocaleLowerCase("zh-CN")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((item, index) => ({id: `coverage-${String(index + 1).padStart(3, "0")}`, ...item}));
};

function extractTextItems(text, cuePosition = null) {
  const items = [];
  for (const match of String(text).matchAll(/[A-Za-z][A-Za-z0-9.+#/-]*(?:[\t ]+[A-Za-z][A-Za-z0-9.+#/-]*){0,2}/gu)) {
    const phrase = match[0].replace(/[\t ]+/gu, " ").trim();
    const tokens = phrase.split(" ");
    const allAcronyms = tokens.length > 1 && tokens.every((token) => /^[A-Z][A-Z0-9.+#/-]{0,7}$/u.test(token));
    for (const source_text of allAcronyms ? tokens : [phrase]) items.push({source_text, type: "proper_name", extracted_by: "rule", display_policy: "review", ...(cuePosition == null ? {} : {cue_start: cuePosition, cue_end: cuePosition})});
  }
  for (const match of text.matchAll(/\d+(?:\.\d+)?\s*(?:%|％|元|万元|亿|秒|分钟|小时|个|项|步|倍)/gu)) items.push({source_text: match[0].replace(/\s+/gu, ""), type: "number", extracted_by: "rule"});
  for (const match of text.matchAll(/第[一二三四五六七八九十\d]+步[^、，；。]*/gu)) items.push({source_text: match[0], type: "step", extracted_by: "rule"});
  for (const match of text.matchAll(/(?:比较|对比)[^，；。]{1,40}(?:与|和|跟|vs\.?)[^，；。]{1,40}/giu)) items.push({source_text: match[0], type: "comparison", extracted_by: "rule"});
  for (const match of text.matchAll(/[“「《]([^”」》]{2,40})[”」》]/gu)) items.push({source_text: match[1], type: "quoted_name", extracted_by: "rule"});
  return items.map((item) => cuePosition == null || item.cue_start != null ? item : {...item, cue_start: cuePosition, cue_end: cuePosition});
}

export function extractCoverageItems(source, {sourceType = "text", cueRanges = null} = {}) {
  if (sourceType !== "srt_audio") return dedupe(extractTextItems(String(source)));
  const ranges = cueRanges?.length ? cueRanges : null;
  const selected = parseSrt(source).filter((cue) => !ranges || ranges.some(({cue_start, cue_end}) => cue.position >= cue_start && cue.position <= cue_end));
  return dedupe(selected.flatMap((cue) => extractTextItems(cue.text, cue.position)));
}

const omissionCodes = new Set(["nonessential-background-time", "duplicate-alias", "already-visible-equivalent"]);

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
    } else if (entry.status === "not_required") {
      if (entry.classification !== "ordinary_spoken_term" || !String(entry.classification_reason ?? "").trim()) errors.push(`${entry.id}: not_required is only valid for a specifically explained ordinary spoken term`);
    } else errors.push(`${entry.id}: status must be visible, omitted, or not_required`);
  }
  return {ok: errors.length === 0, errors};
}
import {parseSrt} from "./plan-contract.mjs";
