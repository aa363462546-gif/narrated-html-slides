# Dark Teal Intelligence

## Fixed-Stage Policy

- Every final slide is exactly `1920px × 1080px`.
- The browser scales the whole stage with one uniform transform. Children never reflow.
- All approved layout variants resolve to fixed stage-pixel coordinates before delivery.
- No breakpoint may move, stack, hide, or resize slide content.
- If content exceeds a declared capacity, split it into another slide. Never shrink core copy below its minimum.
- The template has no left rail and no vertical divider. Every family uses the full slide field.

## Overview

Dark Teal Intelligence is a restrained editorial intelligence system: charcoal report surfaces, high-contrast typography, one luminous aqua accent, thin evidence rules, and large information-bearing geometry. It is suitable for research, market intelligence, strategic reviews, product analysis, and evidence-led narratives.

The system is stable without being rigid. Stability comes from immutable tokens, a finite catalog of named variants, explicit capacity limits, and fixed final coordinates. It does not come from forcing every article into one universal rectangle.

## Three-Layer Fixed Geometry

### 第一层：不可变视觉合同

These values never change between articles:

- Stage: `1920 × 1080`.
- Report frame: `x=60, y=58, w=1800, h=960`.
- Content-safe horizontal range: `x=96–1824`.
- Footer boundary: `y=960`; footer content baseline: `y=990`.
- Palette, font roles, minimum type sizes, borders, card treatment, table treatment, and footer grammar.
- Main spoken explanation minimum: `48px`; card/list/step description minimum: `36px`; footer metadata minimum: `18px`.
- Overflow response: split the content or choose another approved variant.

### 第二层：有限版式变体

Every page family has only the named variants in this document. The Agent selects a variant using the content conditions below. It may not invent a page-specific `left`, `top`, grid, or font size.

- Short centered statement → centered hero.
- Strong closing or reveal phrase → lower-left hero.
- Statement plus real visual/evidence → split-visual hero.
- Opening with two opposed signals → dual-signal hero.
- Similar evidence weights → balanced editorial.
- Large table, quote, or evidence block → evidence-wide editorial.
- Strong judgment plus one memorable subject glyph → statement-mark editorial.
- A capability and its boundary → capability-boundary compare.
- Item count determines approved grid/metric variants.
- Ordered change determines rising/flat/descending path variants.

### 第三层：最终固定像素

After the Agent selects a variant, the matching CSS variables in `template.html` resolve to fixed `1920 × 1080` pixel values. The final article HTML copies those fixed values. It must not retain live viewport layout rules such as `vw`, `vh`, `auto-fit`, or responsive reflow.

## Colors

| Token | Value | Use |
|---|---:|---|
| `--outer` | `#000000` | Letterbox/pillarbox |
| `--canvas` | `#202324` | Main canvas |
| `--surface` | `#292B2C` | Cards and restrained panels |
| `--surface-deep` | `#17191A` | Evidence field |
| `--ink` | `#F3F4F2` | Main reading layer |
| `--ink-secondary` | `#D6D9D7` | Supporting copy |
| `--muted` | `#A4AAA8` | Metadata |
| `--line` | `rgba(185,190,188,.28)` | Thin frame/rules |
| `--line-strong` | `rgba(231,233,231,.48)` | One structural rule |
| `--aqua` | `#18E3D0` | Primary accent |
| `--aqua-soft` | `#86EEE6` | Supporting accent |
| `--teal` | `#0A5556` | Wash depth |

No extra category colors, gradients, glass blur, shadows, or dashboard status colors are allowed.

## Typography

### Confirmed Production Fonts

The template uses the softer type system preserved from the original 12-page deck:

- Display/headlines: **Smiley Sans Local** for rounded Chinese display text.
- Symbols and prominent Latin/numeric marks: **Manrope Local**, including `✓`, `?`, metrics, and signal values.
- Body/explanation: **IBM Plex Sans SC Local**.
- Labels, dates, counters, and technical metadata: **IBM Plex Mono**, with IBM Plex Sans SC Local as the Chinese fallback.

Primary display and body faces are checked into the project so their shape does not drift with a network fallback:

```text
assets/fonts/smiley-sans/SmileySans-Oblique.otf
assets/fonts/manrope/Manrope-Variable.ttf
assets/fonts/ibm-plex-sans-sc/IBMPlexSansSC-Regular.woff2
assets/fonts/ibm-plex-sans-sc/IBMPlexSansSC-Medium.woff2
```

Verified computed stacks:

- Hero display: `"Smiley Sans Local", "Manrope Local", "IBM Plex Sans SC Local", sans-serif`
- Body: `"IBM Plex Sans SC Local", "Manrope Local", sans-serif`
- Symbols and prominent numbers: `"Manrope Local", sans-serif`
- Labels and metadata: `"IBM Plex Mono", "IBM Plex Sans SC Local", monospace`

The primary visual identities are local fonts. IBM Plex Mono remains the only network-loaded role and is used only for small technical metadata.

### Font Roles and Scale

| Role | Family | Size / leading | Weight | Capacity |
|---|---|---:|---:|---|
| Hero display | Display | `104px / 1.06` | `700` | 2–3 CJK lines |
| Primary headline | Display | `76px / 1.08` | `700` | 1–2 lines |
| Section label | Mono | `24px / 1.20` | `500` | 1 line |
| Subhead | Display | `48px / 1.14` | `600` | 1–3 lines |
| Lead | Body | `48px / 1.32` | `500` | 2–5 lines |
| Main body | Body | `48px / 1.38` | `400` | 2–5 lines |
| Component description | Body | `36px / 1.38` | `400` | 1–4 lines |
| Capability mark (`✓` / `?`) | Manrope | `140px / .90` | `700` | one symbol |
| Metric | Display/Mono | `118px / .92` | `700` | one value |
| Metric hero | Display/Mono | `164px / .88` | `700` | one value |
| Chart/table label | Body/Mono | `36px / 1.28` | `500` | 1–2 lines |
| Metadata | Mono | `20–22px / 1.25` | `500` | 1–2 lines |
| Footer | Mono | `18px / 1.20` | `400` | one line |

Chinese display text uses Smiley Sans Local with restrained negative tracking (`-0.02em` to `-0.035em`) to preserve the original deck's rounded, compact character. `✓`, `?`, arrows, and prominent numbers must use Manrope Local rather than inheriting the Chinese display face. CJK body copy never uses artificial italic or negative tracking.

## Shared Layout Contract

- Report frame: `x=60, y=58, w=1800, h=960`.
- Standard header: `x=96, y=82, w=1728, h=205`.
- Optional header rule: `x=96, y=304, w=1728`.
- Evidence zone: `x=96, y=340, w=1728, h=588`.
- Footer: left label `x=96`; year `x=1510`; page `x=1750`; all at `y=978`.
- Spacing rhythm: `24, 32, 48, 64, 96px`.
- Cards: square or `4px` radius maximum, `1px` border, no shadow.
- Tables: use the full approved evidence zone; header `64–76px`, rows `92–124px`, primary cell type `28–36px`.
- A header rule may not cross a table or card border. Values and table variants omit the header rule when their own top border supplies the structure.

## Approved Families and Variants

### Hero

- `hero / center`: copy `x=240, y=236, w=1440, h=610`; use for a short title whose visual center should be the page center.
- `hero / lower-left`: copy `x=96, y=450, w=1420, h=430`; use for a reveal, closing phrase, or statement that benefits from grounded lower-left weight.
- `hero / split-visual`: copy `x=96, y=220, w=820, h=650`; evidence field `x=1040, y=160, w=720, h=720`; use only when a real visual, diagram, or supplied evidence exists.
- `hero / dual-signal`: copy `x=96, y=250, w=820, h=580`; two-signal board `x=1050, y=178, w=720, h=720`; use at an opening when two opposed outcomes establish the problem immediately.

Hero capacity is one label plus one title. No subtitle list or card row.

### Editorial

- `editorial / balanced`: narrative `x=96, y=382, w=720, h=480`; evidence `x=900, y=382, w=924, h=480`.
- `editorial / evidence-wide`: one lead line `x=96, y=340, w=1728, h=90`; evidence `x=96, y=466, w=1728, h=414`.
- `editorial / statement-mark`: quote and explanation on the left with one oversized subject glyph on the right. Use for one memorable judgment tied to a concrete subject such as `AI`, `ROI`, or a category acronym.
- `editorial / evidence-stack`: number + three evidence rows + arrow + conclusion. Use when several concrete observations lead to one judgment.

Use evidence-wide for tables, code, long quotes, or one dominant proof block. It is not a small black card.

### Split Proof

- `split-proof / image-left`: image `x=60, y=60, w=780, h=880`; copy `x=920, y=90, w=820, h=800`.
- `split-proof / image-right`: copy `x=96, y=90, w=820, h=800`; image `x=1080, y=60, w=780, h=880`.

Exactly one real image and one concise judgment.

### Portrait

- `portrait / balanced`: two equal portraits `360 × 400` centered at `x=500` and `x=1060`.
- `portrait / featured-left`: featured portrait `520 × 520` at `x=240`; main explanation `x=800, w=520`; secondary portrait `320 × 360` at `x=1430`, with its caption below at `y=770`.

Use featured-left only when the two subjects are not equal in narrative importance.

### Values Grid

- `values-grid / four-up`: `2 × 2` grid at `x=96, y=330, w=1728, h=598`, `32px` gaps.
- `values-grid / two-up-wide`: two horizontal rows at `x=96, y=350, w=1728, h=540`, `28px` gap.

Four-up requires exactly four comparable items. Two-up-wide requires exactly two items with longer explanations. Do not leave empty cards.

### Timeline

- `timeline / rising`: four or five ordered steps on one rising path.
- `timeline / flat`: three or four milestones on a horizontal path when sequence matters but magnitude does not.

Both use `x=96, y=340, w=1728, h=560`. Labels are `32px`; step/date metadata is `22px`; the SVG occupies `1728 × 410px` below the label band. No label may be individually nudged.

### Revenue Arc

- `revenue-arc / rising`: three or four ordered sources along one rising curve.
- `revenue-arc / descending`: three or four ordered sources along one descending curve.

The direction must come from supplied meaning. Never imply improvement or decline from an unordered list.

### Metric

- `metric / two-up`: exactly two large metrics; each receives `848px` width.
- `metric / three-up`: exactly three metrics; each receives `554px` width.
- `metric / five-up`: exactly five concise metrics; each receives `320px` usable width.
- `metric / sequence-four`: exactly four ordered indicators with visible bars. Use when four stages or consequences progress in sequence.
- `metric / evidence-hero`: one dominant number or keyword plus one explanation block. Use when the number itself is the evidence anchor.

Primary metric labels remain at least `36px` in every variant. If five metrics need long explanation, split the page.

### Compare

- `compare / capability-boundary`: two equal columns with a large `✓` and `?`; use only for “can do / cannot decide”, “known / unknown”, or another explicit capability boundary.

Each side carries one title, one explanation, and one short boundary caption. It is not a generic two-column page.

### Audience

- `audience / wide`: three large overlapping circles across the full evidence zone.
- `audience / compact`: five smaller circles on one centerline.

Overlap communicates relation; circles are never decorative bubbles.

### Map

- `map / map-left`: map/evidence `x=96, y=360, w=1160, h=500`; metric `x=1340, y=520, w=430`.
- `map / map-right`: metric `x=96, y=500, w=430`; map/evidence `x=620, y=360, w=1160, h=500`.

The map slot accepts only a supplied map or real geographic evidence. A neutral grid in the mother template only marks the reserved area.

### Roadmap

- `roadmap / overlap-four`: four `360px` circles with `72px` overlap; use when the directions share responsibility.
- `roadmap / sequence-three`: three `430px` circles connected by one baseline; use when stages are ordered and mostly distinct.

No fifth circle. Text must remain inside its assigned circle.

## Content Selection and Copy Voice

Before selecting a variant, record: title length, item count, ordered/unordered relation, evidence type, desired visual anchor, and whether the page contains an explicit contrast or capability boundary. Select the smallest approved variant that expresses those facts.

The mother template contains **30 approved examples**. Pages `25–30` preserve the distinctive components reverse-engineered from the original 12-page PPT-derived deck: dual signal, giant subject glyph, four-step KPI bars, check/question boundary, evidence stack, and large evidence metric. New articles reuse their structure only; they must never copy the demonstration prose.

Space allocation is semantic, not decorative:

- If the selected family reserves a right evidence zone, fill it with a real component from the source meaning. Do not leave an empty half-screen or a tiny card floating in it.
- For 2–4 parallel items, use the full approved row/grid and distribute items evenly across the available width.
- A single concept uses a hero, statement-mark, or evidence-hero family rather than a multi-card shell.
- If the source mentions named tools, products, stages, or examples, show those named items in the component; do not postpone the examples to a later page without reason.
- Repeated subtitle and card text is a QA failure. Each semantic statement appears once unless repetition is deliberately used as a rhetorical device.

Generated article copy must preserve the author's concrete nouns, memorable phrases, rhythm, and point of view. Do not replace specific language with generic phrases such as “赋能增长”“深度洞察”“从多个维度分析” or mother-template demo copy. The template supplies geometry, not prose. If the original phrase is too long, split the page before flattening the voice.

## Overflow and QA

- Every `[data-qa-box]` must satisfy `scrollWidth <= clientWidth` and `scrollHeight <= clientHeight`.
- Every content box must remain inside `0,0–1920,1080`.
- Main spoken explanation must compute to at least `48px`; card/list/step descriptions must compute to at least `36px`.
- Sibling evidence regions must not intersect unless the family explicitly declares circle overlap.
- Browser QA must wait for `document.fonts.ready`, then check all four production families with `document.fonts.check()`.
- Browser QA must inspect all 30 slides; representative visual review must include hero, editorial, values, timeline, metric, compare, and roadmap variants.
- A failed font, overflow, collision, or clipped glyph is reported before repair; no silent correction.

## Motion

This template defines no production motion. Hyperframes or a later video stage may animate approved regions without changing their final geometry.

## Do

- Use one strong typographic or evidence focus per slide.
- Choose from approved variants using content conditions.
- Use the whole evidence zone for tables and timelines.
- Use visible, subject-specific large geometry when the content provides a clear anchor (`AI`, a number, a check/question pair, or an ordered sequence).
- Split content rather than shrinking.
- Keep aqua accents scarce and meaningful.

## Do Not

- Do not add a left rail or vertical divider.
- Do not invent page-specific coordinates.
- Do not use system fonts as production typography.
- Do not leave an empty card or undersized table inside a large evidence zone.
- Do not fill an evidence zone with decorative empty space when the source contains named items that can be shown.
- Do not copy mother-template demonstration sentences into generated articles.
- Do not use demo copy as generated article copy.
- Do not add extra colors, shadows, gradients, pills, or dashboard chrome.

## Display and Print

Interactive viewing scales the fixed stage uniformly. Print displays every slide at its fixed geometry. No responsive breakpoint may recompose slide content.

## Known Costs

- Google Fonts requires network access on first load. Offline output falls back to generic families and is not production-valid.
- CJK web fonts are large and can lengthen first render. Playwright must wait for `document.fonts.ready`.
- A later offline production requirement should self-host licensed WOFF2 files while preserving these exact family names and metrics.
- Full browser QA takes longer than a syntax check because all variants must render and fonts must finish loading.
