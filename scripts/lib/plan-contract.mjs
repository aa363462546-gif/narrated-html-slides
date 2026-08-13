import {registryIndex} from "./registry.mjs";

function parseTimestamp(value) {
  const match = String(value).match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/u);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

export function parseSrt(source) {
  const cues = [];
  for (const block of String(source).replace(/\r/gu, "").trim().split(/\n{2,}/u)) {
    const lines = block.split("\n");
    const timingIndex = /^\d+$/u.test(lines[0]?.trim() ?? "") ? 1 : 0;
    const timing = lines[timingIndex]?.match(/^(\d{2}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}[,.]\d{3})/u);
    if (!timing) continue;
    const start_sec = parseTimestamp(timing[1]);
    const end_sec = parseTimestamp(timing[2]);
    const text = lines.slice(timingIndex + 1).join("\n").trim();
    if (start_sec == null || end_sec == null || !text) continue;
    cues.push({position: cues.length + 1, source_label: timingIndex === 1 ? lines[0].trim() : null, start_sec, end_sec, text});
  }
  return cues;
}

const requiredSceneFields = ["scene_id", "core_content", "semantic_role", "layout_id", "item_count", "layout_reason", "grouping_reason", "semantic_change"];

export async function finalizeLayoutPlan(draft, source) {
  const errors = [];
  if (draft?.version !== 2) errors.push("layout-plan.draft.json must use version 2");
  if (!["text", "srt_audio"].includes(draft?.source_type)) errors.push("source_type must be text or srt_audio");
  const scenes = Array.isArray(draft?.scenes) ? draft.scenes : [];
  if (!scenes.length) errors.push("layout plan needs scenes[]");
  const registry = await registryIndex();
  const cues = draft?.source_type === "srt_audio" ? parseSrt(source) : [];
  if (draft?.source_type === "srt_audio" && !cues.length) errors.push("srt_audio input has no parseable SRT cues");
  const ids = new Set();
  let expectedCue = 1;
  const finalScenes = [];

  for (const [index, scene] of scenes.entries()) {
    const label = scene?.scene_id || `scene ${index + 1}`;
    for (const field of requiredSceneFields) if (scene?.[field] == null || scene[field] === "") errors.push(`${label}: ${field} is required`);
    if (ids.has(scene?.scene_id)) errors.push(`${label}: duplicate scene_id`);
    ids.add(scene?.scene_id);
    if ("start_sec" in (scene ?? {}) || "end_sec" in (scene ?? {})) errors.push(`${label}: start_sec/end_sec must be derived from SRT and cannot appear in the draft`);
    const layout = registry.get(scene?.layout_id);
    if (!layout || layout.status !== "production") errors.push(`${label}: layout_id is not production-registered`);
    else {
      if (layout.template !== draft.template) errors.push(`${label}: layout belongs to ${layout.template}, not ${draft.template}`);
      if (!layout.semantic_roles.includes(scene.semantic_role)) errors.push(`${label}: ${scene.semantic_role} is not approved for ${scene.layout_id}`);
      if (layout.capacity.item_count != null && scene.item_count !== layout.capacity.item_count) errors.push(`${label}: layout requires exactly ${layout.capacity.item_count} items`);
    }
    if (!scene?.semantic_change || typeof scene.semantic_change !== "object" || !String(scene.semantic_change.reason ?? "").trim()) errors.push(`${label}: semantic_change requires a specific reason`);

    if (draft.source_type === "srt_audio") {
      if (!Number.isInteger(scene.cue_start) || !Number.isInteger(scene.cue_end)) errors.push(`${label}: cue_start/cue_end must be 1-based inclusive integers`);
      else if (scene.cue_start !== expectedCue || scene.cue_end < scene.cue_start || scene.cue_end > cues.length) errors.push(`${label}: cue ranges must be continuous parsed-order positions; expected cue_start ${expectedCue}`);
      else {
        const selected = cues.slice(scene.cue_start - 1, scene.cue_end);
        finalScenes.push({...scene, narration: selected.map((cue) => cue.text).join("\n"), start_sec: selected[0].start_sec, end_sec: selected.at(-1).end_sec});
        expectedCue = scene.cue_end + 1;
        continue;
      }
    } else {
      if (!String(scene?.narration ?? "").trim()) errors.push(`${label}: text input scenes require narration`);
    }
    finalScenes.push({...scene});
  }
  if (draft?.source_type === "srt_audio" && expectedCue !== cues.length + 1) errors.push(`SRT cue coverage must end at parsed cue position ${cues.length}`);
  if (draft?.source_type === "text") {
    const normalize = (value) => String(value).normalize("NFKC").replace(/\s+/gu, "");
    if (normalize(finalScenes.map((scene) => scene.narration ?? "").join("")) !== normalize(source)) errors.push("text scene narration must cover the complete source exactly and in order");
  }
  return {ok: errors.length === 0, errors, plan: {version: 2, template: draft?.template, source_type: draft?.source_type, cue_numbering: "one_based_inclusive_parsed_order", scenes: finalScenes}};
}
