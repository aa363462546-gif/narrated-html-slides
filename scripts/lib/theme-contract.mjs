const toneSet = new Set(["primary", "accent", "contrast", "muted"]);

export function validateSemanticText(value) {
  const errors = [];
  if (!value || !Array.isArray(value.segments) || !value.segments.length) errors.push("semantic text requires segments[]");
  const tones = new Set();
  for (const [index, segment] of (value?.segments ?? []).entries()) {
    if (!String(segment?.text ?? "").trim()) errors.push(`segment ${index + 1} needs text`);
    if (!toneSet.has(segment?.tone)) errors.push(`segment ${index + 1} has an unapproved tone`);
    else tones.add(segment.tone);
  }
  if (tones.size > 2) errors.push("semantic text may use at most two distinct tones");
  return {ok: errors.length === 0, errors};
}

function rgb(hex) {
  const match = String(hex).match(/^#([0-9a-f]{6})$/iu);
  if (!match) return null;
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255);
}
function hsl(hex) {
  const value = rgb(hex);
  if (!value) return null;
  const [r, g, b] = value;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return {lightness: l * 100, saturation: s * 100};
}
function luminance(hex) {
  const value = rgb(hex);
  if (!value) return null;
  return value.map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}
function contrast(a, b) {
  const one = luminance(a);
  const two = luminance(b);
  if (one == null || two == null) return 0;
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

export function validateTheme(template, request, registry) {
  const errors = [];
  const contract = registry?.themes?.[template];
  if (!contract) return {ok: false, errors: [`unknown template theme ${template}`]};
  const theme = request?.preset ? contract.presets?.[request.preset] : request;
  if (!theme) return {ok: false, errors: [`unknown theme preset ${request?.preset}`]};
  const keys = Object.keys(theme ?? {});
  for (const role of contract.required_roles) if (!keys.includes(role)) errors.push(`theme role ${role} is required`);
  for (const key of keys) if (!contract.required_roles.includes(key)) errors.push(`theme role ${key} is not approved`);
  for (const role of contract.required_roles) {
    const color = hsl(theme[role]);
    if (!color) { errors.push(`${role} must be a six-digit hex color`); continue; }
    for (const [dimension, range] of Object.entries(contract.ranges[role] ?? {})) if (color[dimension] < range[0] || color[dimension] > range[1]) errors.push(`${role} ${dimension} is outside the template range`);
  }
  for (const rule of contract.contrast) if (contrast(theme[rule.foreground], theme[rule.background]) < rule.minimum) errors.push(`${rule.foreground}/${rule.background} contrast is below ${rule.minimum}`);
  const bg = luminance(theme.background);
  const surface = luminance(theme.surface);
  const text = luminance(theme.text_primary);
  if (!(bg < surface && surface < text)) errors.push(`theme relationship must satisfy ${contract.relationship}`);
  return {ok: errors.length === 0, errors, theme: errors.length ? null : theme};
}

export function themeCss(template, theme) {
  const triplet = (value) => rgb(value).map((channel) => Math.round(channel * 255)).join(",");
  const map = template === "field-notes-a" ? {
    background: "--fn-bg-base", text_primary: "--fn-text-primary", text_muted: "--fn-text-muted", accent_primary: "--fn-accent-primary", accent_secondary: "--fn-accent-secondary",
  } : {
    background: "--canvas", surface: "--surface", text_primary: "--ink", text_muted: "--muted", accent_primary: "--aqua", accent_secondary: "--aqua-soft",
  };
  const declarations = Object.entries(map).map(([role, variable]) => `${variable}:${theme[role]}`);
  if (template === "field-notes-a") declarations.push(`--fn-bg-base-rgb:${triplet(theme.background)}`, `--fn-surface-card-rgb:${triplet(theme.surface)}`, `--fn-accent-primary-rgb:${triplet(theme.accent_primary)}`, `--fn-accent-secondary-rgb:${triplet(theme.accent_secondary)}`);
  return declarations.join(";");
}
