---
version: alpha
name: "Field Notes A"
description: "A fixed deep-green botanical line-art presentation system for Chinese voiceover articles. It is anchored to template.html: left-aligned editorial copy, Noto Serif SC display, Noto Sans SC body, DM Mono chrome, a 46px hairline frame, lime botanical geometry, and restrained upward reveals. It is not Dark Botanical and must never inherit that preset's black, pink, gold, or Cormorant language."

source:
  visualSourceOfTruth: "template.html"
  templateSha256: "64740aa9d816e9332f34d4e941a8a554ffce3efadcc977dbad349446904c6e22"
  structureReference: "Self-contained fixed-stage template contract"
  identity: "Custom fixed template; not Dark Botanical, Mat, or an approximation of either."

colors:
  stage-bg: "#0E1711"
  slide-bg: "#0E1711"
  ink: "#F2EDDC"
  muted: "#B7BDA5"
  moss: "#9DAD70"
  lime: "#D5E576"
  earth: "#B87552"
  frame-line: "rgba(225,236,179,.22)"
  center-line: "rgba(225,236,179,.09)"
  progress-track: "rgba(225,236,179,.25)"
  grain-dot: "rgba(234,242,201,.9)"
  botanical-stroke: "rgba(205,225,116,.78)"
  botanical-vein: "rgba(205,225,116,.6)"
  botanical-root: "rgba(181,207,113,.5)"
  orbit-line: "rgba(213,229,118,.5)"
  human-halo: "rgba(213,229,118,.08)"
  top-right-atmosphere: "#243322"
  bottom-left-atmosphere: "#1B3020"
  field-bg: "#17251B"
  seed-bg: "#152017"
  nav-button-bg: "#1A281C"
  question-ink: "#DCDCC9"
  command-ink: "#D9E5B2"
  command-bg: "rgba(8,17,10,.45)"
  capability-bg: "rgba(31,48,31,.28)"
  caution-border: "rgba(184,117,82,.5)"
  caution-ink: "#EBDDCB"
  secondary-ink: "#D4D6C2"

color-aliases:
  c-bg: stage-bg
  c-fg: ink
  c-muted: muted
  c-accent-primary: lime
  c-accent-secondary: earth
  c-rule: frame-line

semanticPalette:
  overrideScope: ":root for the complete document, or .deck-stage for the authored 1920 x 1080 stage and all of its descendants"
  rule: "Choose one coordinated palette for the whole article and override the canonical variables together in one declaration block. Never override palette variables on .slide, a page type, or an individual element. The catalogue keeps its navigation controls outside .deck-stage, so use :root when those controls must follow the custom palette too."
  canonicalVariables:
    --fn-bg-base-rgb: "14,23,17"
    --fn-bg-atmosphere-top: "#243322"
    --fn-bg-atmosphere-bottom: "#1B3020"
    --fn-text-primary: "#F2EDDC"
    --fn-text-secondary: "#D4D6C2"
    --fn-text-muted: "#B7BDA5"
    --fn-text-question: "#DCDCC9"
    --fn-text-command: "#D9E5B2"
    --fn-text-caution: "#EBDDCB"
    --fn-accent-primary-rgb: "213,229,118"
    --fn-accent-secondary-rgb: "184,117,82"
    --fn-accent-moss: "#9DAD70"
    --fn-line-rgb: "225,236,179"
    --fn-grain-rgb: "234,242,201"
    --fn-botanical-rgb: "205,225,116"
    --fn-botanical-root-rgb: "181,207,113"
    --fn-surface-card-rgb: "31,48,31"
    --fn-surface-card-alt-rgb: "42,61,35"
    --fn-surface-answer-rgb: "50,72,39"
    --fn-surface-command-rgb: "8,17,10"
    --fn-surface-field: "#17251B"
    --fn-surface-seed: "#152017"
    --fn-surface-nav: "#1A281C"
  derivedVariables:
    --fn-bg-base: "rgb(var(--fn-bg-base-rgb))"
    --fn-accent-primary: "rgb(var(--fn-accent-primary-rgb))"
    --fn-accent-secondary: "rgb(var(--fn-accent-secondary-rgb))"
    --fn-line: "rgba(var(--fn-line-rgb),.22)"
  derivedVariableScope: "The four derived variables and eight compatibility aliases are declared at :root and rebound on .deck-stage so stage-scoped canonical overrides propagate to the base fill, both accents, frame line, and every legacy alias."
  compatibilityAliases:
    --stage-bg: "var(--fn-bg-base)"
    --slide-bg: "var(--fn-bg-base)"
    --ink: "var(--fn-text-primary)"
    --muted: "var(--fn-text-muted)"
    --moss: "var(--fn-accent-moss)"
    --lime: "var(--fn-accent-primary)"
    --earth: "var(--fn-accent-secondary)"
    --line: "var(--fn-line)"
  inlineSemanticClasses:
    .semantic-text-primary: "color:var(--fn-text-primary)"
    .semantic-accent-primary: "color:var(--fn-accent-primary)"
    .semantic-accent-secondary: "color:var(--fn-accent-secondary)"
    .semantic-text-muted: "color:var(--fn-text-muted)"

typography:
  display:
    fontFamily: "Noto Serif SC, serif"
    fontSize: "102px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.07em"
  cover-display:
    fontFamily: "Noto Serif SC, serif"
    fontSize: "144px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.07em"
  question:
    fontFamily: "Noto Serif SC, serif"
    fontSize: "90px"
    fontWeight: 900
    lineHeight: 1.23
    letterSpacing: "-0.06em"
  card-heading:
    fontFamily: "Noto Serif SC, serif"
    fontSize: "45px"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Noto Sans SC, sans-serif"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1.52
  body-small:
    fontFamily: "Noto Sans SC, sans-serif"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "DM Mono, monospace"
    fontSize: "22px"
    fontWeight: 500
    letterSpacing: "0.15em"
    textTransform: uppercase
  page-number:
    fontFamily: "DM Mono, monospace"
    fontSize: "18px"
    fontWeight: 400
    letterSpacing: "0.1em"
  command:
    fontFamily: "DM Mono, monospace"
    fontSize: "23px"
    fontWeight: 400
    lineHeight: 1.0

spacing:
  frame-inset: "46px"
  content-left: "150px"
  content-right: "150px"
  content-top: "140px"
  gap-lg: "100px"
  gap-md: "80px"
  gap-sm: "32px"
  page-right: "88px"
  page-bottom: "68px"

canvas:
  width: "1920px"
  height: "1080px"
  aspectRatio: "16:9"
  scaling: "uniform stage transform only"

components:
  slide-surface:
    background: "radial-gradient(ellipse at 86% 0%, #243322 0%, transparent 38%), radial-gradient(ellipse at 7% 100%, #1B3020 0%, transparent 39%), #0E1711"
    isolation: isolate
    description: "Required on every slide, with coordinates and stops unchanged."
  grain:
    selector: ".slide::before"
    position: "absolute; inset: 0"
    opacity: 0.16
    image: "radial-gradient(rgba(234, 242, 201, 0.9) 0.65px, transparent 0.8px)"
    backgroundSize: "9px 9px"
    blendMode: soft-light
    description: "Required non-interactive dot grain on every slide."
  lower-right-outline:
    selector: ".slide::after"
    size: "820px x 820px"
    position: "right: -330px; bottom: -400px"
    border: "1px solid {colors.frame-line}"
    borderRadius: "46% 54% 67% 33% / 49% 37% 63% 51%"
    transform: "rotate(-15deg)"
    description: "Required irregular lower-right outline on every slide."
  frame:
    inset: "46px"
    border: "1px solid {colors.frame-line}"
    centerDivider: "top: 0; bottom: 0; left: 50%; border-left: 1px solid {colors.center-line}"
    description: "Every slide has the same quiet interior frame and center guide."
  eyebrow:
    fontFamily: "{typography.label.fontFamily}"
    fontSize: "{typography.label.fontSize}"
    fontWeight: 500
    letterSpacing: "0.15em"
    textTransform: uppercase
    color: "{colors.lime}"
    description: "Uppercase English structural label above the headline."
  page-number:
    position: "right: 88px; bottom: 68px"
    font: "400 18px DM Mono"
    letterSpacing: "0.1em"
    color: "{colors.muted}"
    description: "Fixed right-bottom page chrome."
  botanical-leaf:
    position: absolute
    border: "1.5px solid {colors.botanical-stroke}"
    borderRadius: "100% 0 100% 0"
    opacity: 0.75
    transform: "rotate(var(--r))"
    vein: "width: 1px; height: 120%; left: 50%; top: -10%; background: {colors.botanical-vein}; rotate(-45deg)"
    description: "Outline-only leaf with one fixed internal vein."
  botanical-stem:
    position: absolute
    borderLeft: "1px solid {colors.botanical-vein}"
    default: "height: 330px; rotate(33deg); transform-origin: bottom"
    description: "Thin stem; A1 and A10 override only the values explicitly listed for those pages."
  seed:
    position: absolute
    size: "14px x 14px"
    border: "1px solid {colors.earth}"
    borderRadius: "50%"
    background: "{colors.seed-bg}"
    description: "A1 only."
  root-pattern:
    pageScope: "A1 only"
    positioning: absolute
    position: "left: 0; bottom: 0"
    size: "650px x 220px"
    opacity: 0.42
    background: "repeating-radial-gradient(ellipse at 15% 110%, transparent 0 26px, rgba(181, 207, 113, 0.5) 27px 28px, transparent 29px 52px)"
    description: "The baseline defines this element only on A1. It is forbidden on A2-A20."
  human-halo:
    pageScope: "A3 only"
    boxShadow: "0 0 0 22px {colors.human-halo}"
    description: "Exact non-blurred spread halo around the A3 human marker; the sole allowed box-shadow."
  reveal:
    from: "opacity: 0; transform: translateY(26px)"
    to: "opacity: 1; transform: translateY(0)"
    duration: "0.75s"
    easing: "cubic-bezier(.16, 1, .3, 1)"
    delays: "0.12s / 0.25s / 0.38s / 0.51s"
    description: "The only entry motion."
  capability-card:
    background: "{colors.capability-bg}"
    border: "1px solid {colors.frame-line}"
    padding: "38px 34px"
    description: "A4 only; exactly three stepped cards."
  data-field:
    background: "{colors.field-bg}"
    borderLeft: "2px solid {colors.lime}"
    size: "150px high; two equal columns"
    description: "A6 only; exactly six fields."
  caution-box:
    border: "1px solid {colors.caution-border}"
    color: "{colors.caution-ink}"
    description: "A8 only; exactly one caution statement."
  asset-slots:
    count: 0
    rule: "No image, video, screenshot, logo, QR, icon, or swappable media slot is defined anywhere in template.html."
  source-of-truth: "template.html"
  lock: "AI may replace text inside the approved A1-A20 DOM roles only when the replacement fits the chosen type's unchanged geometry and capacity. The canonical deck-level semantic palette variables may be changed only as one coordinated article-wide group at :root or .deck-stage. The four inline semantic classes may color genuine keywords inside existing title or card text nodes, but may not change any other visual property. AI may not add a twenty-first type, new assets, per-page palettes, arbitrary element colors, unapproved coordinates, or unapproved motion."
---

## 职责与上位规则

本文件只负责 Field Notes A 的模板专属契约：A1-A20 的页面职责、容量、选择条件、固定结构、精确例外和模板明确开放的受控变体。跨模板审美、内容编排、手机可读性、颜色语义和通用 QA 服从项目根目录的 `DESIGN_SYSTEM.md`；本文件不重复定义另一套总规则。

`template.html` 是 Field Notes A 的精确实现事实源，保存真实 DOM、CSS、字号、坐标和默认样例。本文件负责解释如何选择和使用这些母版，不授权脱离母版自由重画。

## Frontend Slides Fixed-Stage Policy

Field Notes A is authored only as a fixed 1920 x 1080 stage. The stage is positioned at `left:0; top:0`, uses `transform-origin:0 0`, and is scaled by one uniform transform. The browser scale is exactly `min(innerWidth / 1920, innerHeight / 1080)`, with x and y translation equal to half of the remaining viewport space. The composition may letterbox or pillarbox. It must never reflow, crop, scroll, or rearrange.

The viewport and stage both hide overflow. Slides are absolutely positioned at `inset:0` and use `display:block` only as their static base value; `display` does not participate in active/inactive state switching. State switching uses only `visibility`, `opacity`, and `pointer-events`. Only `.active` or `.visible` slides are visible and interactive, at `z-index:1`. No breakpoint may change any internal slide value.

## Overview

Field Notes A is the exact deep-green botanical line-art result fixed in `template.html`. It is a custom template, not a prompt for a similar green style. It must not inherit Dark Botanical, Mat, or any other preset's fonts, palette, components, coordinates, or motion.

Every slide uses the same three-layer surface: a top-right radial lift centered at `86% 0%` and ending at 38%, a bottom-left radial lift centered at `7% 100%` and ending at 39%, and the solid Stage Green base. The grain and 820px lower-right irregular outline are required on all twenty sample pages. The 46px frame and its 50% center guide are also required on all twenty sample pages.

The type system has three fixed assignments. Noto Serif SC carries display and structured serif copy. Noto Sans SC carries explanatory copy. DM Mono carries eyebrows, page chrome, sequence labels, short codes, the command line, and navigation chrome. The page-specific declarations below override the shared defaults only where `template.html` does so.

The deck is low density / speaker-led and fixed-structure. It is a Chinese-priority catalogue with twenty approved page types, limited content capacity, one primary idea per page, a small number of supporting text roles, and deliberate negative space. Negative space must separate hierarchy; it must not leave an informational page with an unused semantic half. It is not a reading-first or high-density layout system. A1-A20 are the only approved page structures. Text may change only inside the roles already present, and each selected type keeps its element count, CSS geometry, and decorative forms.

## Voiceover-to-Display-Copy Rules

展示文案的跨模板通用原则以 `DESIGN_SYSTEM.md` 为准；以下内容只补充 Field Notes A 固定角色、容量、标题长度和页面选择所需的模板专属约束与例外。

The narration, SRT, transcript, timing attributes, and accessible source label remain verbatim source records. Visible slide copy is a separate speaker-led layer and must be distilled before it is placed into A1-A20. Never concatenate adjacent subtitle cues and paste the result into a display role.

- Each slide has one primary claim. Prefer 6-18 Chinese characters for a display headline; 22 is the normal soft limit. If a quote or required product name needs more, rewrite it into at most two deliberate lines instead of shrinking the type.
- Title, subtitle, card heading, card body, note, and footer must not repeat the same normalized phrase. A shorter role may name the topic; the next role must add a function, consequence, example, contrast, or evidence.
- A card heading and its body cannot be identical. The body explains why the item matters or what it does; it must not echo the heading or copy the parent title.
- Parallel cards must represent distinct items. Never fill several cards with the same source sentence merely to occupy required slots. If the source has fewer distinct items than the selected type requires, choose a lower-capacity type.
- Process pages use short action labels for steps and one new result or instruction per step. The process title states the goal, not step 1 again.
- Opening pages state the promise and scope, not the entire opening narration. Closing pages use one concise takeaway or CTA; the final headline should normally stay within 14 Chinese characters, with any follow-up promise moved to the subtitle or credit.
- Before delivery, normalize whitespace and punctuation and scan every slide for exact duplicates, containment duplicates, and headlines longer than the selected type can carry. Fix failures by rewriting visible copy or choosing a better approved type; do not reduce font size or change geometry.
- Display-copy editing must never alter the spoken script, cue boundaries, `data-start`, `data-duration`, or source traceability fields.

### Key Characteristics

- Fixed 1920 x 1080 deep-green stage, uniformly centered and scaled.
- Exact dual radial atmosphere, dot grain, 46px frame, center guide, and 820px irregular outline on every page.
- Noto Serif SC display, Noto Sans SC explanation, and DM Mono structural chrome.
- Lime botanical line work, earth punctuation, cream principal ink, and muted sage support ink.
- Direct page switching and one upward reveal treatment.
- Exactly twenty approved page types, A1 through A20.
- No asset slots of any kind.

## Colors

下列深绿色母版色板是 Field Notes A 当前 `template.html` 的默认基线、回退值和样例。模板现已通过 `semanticPalette` 登记的 `--fn-*` 变量暴露 deck 级语义颜色接口；默认值精确复现这套基线，但复制出的文章 deck 可以在统一作用域一次性覆盖整套 canonical variables。

覆盖必须发生在一个 `:root` 或 `.deck-stage` 声明块中，并对整篇文章保持一致。背景基色、两层氛围色、三层文字、两种强调、边线、颗粒、植物线条和各类表面必须作为一套协调 palette 一起选择；禁止在 `.slide`、页面类型或单个元素上覆盖 palette 变量，也禁止在页面选择器中零散写原始色值。

标题或卡片只有在存在真实的语义对比、转折或关键词时，才可以在现有文字节点内部使用 `.semantic-accent-primary`；必要时可同时使用 `.semantic-accent-secondary` 表达第二语义角色，但不是每页必用，更不能把整句切成多色装饰。`.semantic-text-primary` 和 `.semantic-text-muted` 用于恢复主文字或弱化关键词。这四个类只声明 `color`，不得借机修改 display、字号、位置、字重、字距或其他视觉属性。母版样例不实际套用这些类。

### Palette and Exact Usage

- **Stage Green** (`{colors.stage-bg}`, #0E1711): `html`, `body`, viewport, stage, and solid slide base.
- **Cream Ink** (`{colors.ink}`, #F2EDDC): body default, display text, and navigation button ink.
- **Muted Sage** (`{colors.muted}`, #B7BDA5): low-emphasis chrome and metadata only: page numbers, cover tag, orbit label, A6 field codes, single-card note, comparison label, large-explainer metadata, closing credit, and navigation chrome.
- **Secondary Ink** (`{colors.secondary-ink}`, #D4D6C2): shared `.sub`, question support lines, card/list/step descriptions, quote caption, support intro and action copy, caution support, A6 data note, hierarchy explanations, tool descriptions, and large-explainer body copy.
- **Moss** (`{colors.moss}`, #9DAD70): defined by the baseline root token but not used by any selector. It is not an authorization for a new surface.
- **Lime** (`{colors.lime}`, #D5E576): eyebrows, cover rule, orbit and human borders, human glyph and torso, capability numbers, platform codes, data-field edge, step numbers, route arrow, closing rule, and progress fill.
- **Earth** (`{colors.earth}`, #B87552): seed border, capability corner ornament, data-note border, and caution star.
- **Frame Line** (`{colors.frame-line}`): frame, lower-right outline, orbit outer ring, capability borders, platform rules, process routes, command border, caution list rules, support rules, and navigation button borders.
- **Center Line** (`{colors.center-line}`): frame center guide only.
- **Progress Track** (`{colors.progress-track}`): navigation progress track only.
- **Grain Dot** (`{colors.grain-dot}`): 0.65px grain dot color before the pseudo-element's separate 0.16 opacity and soft-light blend are applied.
- **Botanical Stroke** (`{colors.botanical-stroke}`): 1.5px leaf outlines only.
- **Botanical Vein** (`{colors.botanical-vein}`): leaf veins and stems only.
- **Botanical Root** (`{colors.botanical-root}`): 1px root arcs inside the A1-only repeating radial pattern.
- **Orbit Line** (`{colors.orbit-line}`): A3 middle and inner rings only.
- **Human Halo** (`{colors.human-halo}`): A3 `box-shadow:0 0 0 22px` only.
- **Top-Right Atmosphere** (`{colors.top-right-atmosphere}`, #243322): first global radial gradient only.
- **Bottom-Left Atmosphere** (`{colors.bottom-left-atmosphere}`, #1B3020): second global radial gradient only.
- **Field Background** (`{colors.field-bg}`, #17251B): A6 field fills only.
- **Seed Background** (`{colors.seed-bg}`, #152017): A1 seed interiors only.
- **Navigation Button Background** (`{colors.nav-button-bg}`, #1A281C): previous and next buttons only.
- **Question Ink** (`{colors.question-ink}`, #DCDCC9): A2 two-column serif claims only.
- **Command Ink** (`{colors.command-ink}`, #D9E5B2): A7 command line only.
- **Command Background** (`{colors.command-bg}`): A7 command bar only.
- **Capability Background** (`{colors.capability-bg}`): A4 card fill only.
- **Caution Border** (`{colors.caution-border}`): A8 ethics box border only.
- **Caution Ink** (`{colors.caution-ink}`, #EBDDCB): A8 ethics statement only.

The `#000` and `#FFF` values in `template.html` are implementation fallbacks and print surfaces, not palette choices for slide content.

### Deck-Level Override Contract

- Canonical color inputs are the entries under `semanticPalette.canonicalVariables`; the four derived variables and eight legacy aliases follow those inputs and should not be independently recolored.
- Override every canonical role used by the chosen palette in one block. Do not keep a default green supporting role merely because it is less visible; grain, botanical strokes, translucent accents, line work, surfaces, and semantic text all belong to the same deck palette.
- Use `:root` when the stage, letterbox, and external navigation chrome must all change. Use `.deck-stage` only when a copied deck intentionally scopes the palette to the authored stage and its descendants.
- The override is article-wide. No page, page type, card, title, pseudo-element, or individual decoration may define its own palette variable values.
- The four inline semantic classes are the only approved element-level color selectors. They may wrap genuine keywords inside existing title or card text nodes and may change only `color`; do not add them to the twenty-page catalogue sample.

### Global Surface Recipe

The slide background is exactly:

```css
radial-gradient(ellipse at 86% 0%, #243322 0%, transparent 38%),
radial-gradient(ellipse at 7% 100%, #1b3020 0%, transparent 39%),
#0e1711
```

The grain is exactly `position:absolute; inset:0; opacity:.16; background-image:radial-gradient(rgba(234,242,201,.9) .65px, transparent .8px); background-size:9px 9px; mix-blend-mode:soft-light; pointer-events:none`.

The lower-right outline is exactly `width:820px; height:820px; right:-330px; bottom:-400px; border:1px solid var(--line); border-radius:46% 54% 67% 33% / 49% 37% 63% 51%; transform:rotate(-15deg); pointer-events:none`.

## Typography

### Font Family

Load these exact Google Fonts and weights:

```text
Noto Serif SC: 500, 600, 700, 800, 900
Noto Sans SC: 400, 500, 700, 900
DM Mono: 400, 500
```

The CSS families are exactly `'Noto Serif SC', serif`, `'Noto Sans SC', sans-serif`, and `'DM Mono', monospace`. Font substitution, weight synthesis, and a new family are not approved.

### Type Scale

The shared `.title` is Noto Serif SC 900 at `102px/1.1` with `-0.07em` tracking; the template source spells this same value `-.07em`. The shared `.sub` is Noto Sans SC 500 at `48px/1.52`. The shared `.eyebrow` is DM Mono 500 at 22px with `0.15em` tracking and uppercase transformation. The shared page number is DM Mono 400 at 18px with `0.1em` tracking.

All other type sizes are page-specific and are locked in A1-A20. A range such as "40-45px" is not a token: A4 uses 45px and A7 uses 40px because those are separate selectors.

### Signature Treatments

- Display headlines use Noto Serif SC at their declared page weight and preserve the exact negative tracking inherited from `.title` or declared by A2.
- Eyebrows are uppercase DM Mono 500, 22px, `0.15em`, and Lime. No other eyebrow treatment exists.
- Page numbers are DM Mono 400, 18px, `0.1em`, Muted Sage, at `right:88px; bottom:68px`.
- Explanatory `.sub` text is Noto Sans SC 500, 48px/1.52, and Secondary Ink.
- Short Latin codes and sequence labels use the exact DM Mono declarations of their page selector.
- The A2 opening quote is a 138px Lime glyph aligned with `vertical-align:-0.28em` (source literal `-.28em`) and `margin-right:8px`.
- The A7 command is the only 23px DM Mono command treatment and uses Command Ink on Command Background.
- No italic, underline, text stroke, gradient text, or alternate display treatment is defined.

### Typography Principles

Do not shrink type, alter tracking, tighten leading, change weight, or change family to make replacement copy fit. Rewrite or shorten the replacement text while preserving the exact existing DOM and geometry. Uppercase transformation belongs only to `.eyebrow`; other uppercase strings are authored content, not a general transform.

### Phone Readability Gate

- Every 16:9 page must be judged at a 390px-wide phone presentation scale, not only on the 1920px authoring canvas.
- Chinese primary explanatory copy that carries narration meaning must be authored at least at 48px. It is primary content, never a footnote.
- Descriptions inside cards, lists, comparisons, steps, and hierarchy rows must be authored at least at 36px. A compact six-card page may use 34px only when every description stays within two short lines.
- Semantic HTML such as `small` does not grant a smaller visual role: when it carries narration meaning, it must still meet the 36px floor.
- Only English metadata, sequence numbers, badges, page chrome, and short structural labels may use 17-22px DM Mono.
- Display headings use Noto Serif SC; explanatory copy uses Noto Sans SC. Do not set long Chinese explanations in DM Mono or shrink them to create decorative whitespace.

## Layout

### Canvas System

Every slide is exactly 1920 x 1080. The frame is `inset:46px`. The center guide is inside the frame at `left:50%`, spanning `top:0; bottom:0`. The shared page number is `right:88px; bottom:68px`. Page-specific regions use only the coordinates listed in A1-A20; the common 145px, 150px, and 155px values are not interchangeable.

There is no general right-side visual zone and no generic asset slot. Every right-side object is a fixed CSS structure owned by its page: A1 botanical geometry, A3 orbit geometry, A5 platform grid, A6 field grid, A8 ethics box, or A10 botanical geometry. A2, A4, A7, and A9 use their own fixed full-width structures.

### Frame Occupancy Gate

- Except for a cover, one-sentence quote, or deliberate closing page, an informational page must not leave one whole half of the frame without semantic content.
- When narration contains two or more supporting items, place them in bordered cards, rows, panels, or another approved secondary structure; do not compress them into short unframed lines below a large title while the opposite half stays empty.
- The semantic content envelope should span at least 65% of the 1920px stage width (1248px). The frame, page number, guide line, grain, and botanical ornament do not count as semantic occupancy.
- Whitespace separates hierarchy and supports reading. It cannot substitute for choosing the correct A1-A20 layout.

### Padding and Gap Scale

The YAML spacing values are references to recurring source values, not permission to normalize selectors. Exact page margins, padding, gaps, and dimensions are listed under A1-A20 and take precedence.

### Chrome Frame

Every page contains exactly one `.frame`, one `.eyebrow`, and one `.page`. The frame and its center divider are decorative and non-interactive. The page number always uses the two-digit `NN / NN` form; the template catalogue demo uses a total of 20.

### Navigation Chrome

The controls are fixed at horizontal center and `bottom:22px`, translated `-50%` on x, at `z-index:1000`. The strip uses `display:flex; gap:10px; align-items:center`, DM Mono 500 at 13px, `0.13em` tracking, Muted Sage, and `opacity:.82`.

Buttons use Cream Ink, Navigation Button Background, a 1px Frame Line border, `padding:8px 11px`, and a pointer cursor. The progress track is `130px x 1px` in Progress Track color. Its child is 100% high, Lime, starts at 5% in the twenty-page demo, and transitions width over `.35s` with the shared easing.

## Depth and Elevation

### Atmospheric Depth

Depth comes from the exact dual radial background, dot grain, irregular lower-right outline, and page-owned line geometry. None of these values are optional or repositionable.

### Shadow Rule and Exact Exception

Drop shadows, blurred elevation shadows, text shadows, glass effects, and new glow effects are forbidden. The sole allowed `box-shadow` is the A3 human marker's exact non-blurred spread halo: `0 0 0 22px rgba(213,229,118,.08)`. It may not be removed, softened, recolored, resized, or reused anywhere else.

## Shapes and Treatment

### Border Radius

- `46% 54% 67% 33% / 49% 37% 63% 51%`: global 820px lower-right outline only.
- `100% 0 100% 0`: all botanical leaves.
- `50%`: A1 seeds, all A3 orbit rings, and the A3 human marker.
- `70px 70px 0 0`: A3 human torso cap only.
- `50% 50% 0 50%`: A4 42px corner ornament only.
- `0`: all other structural boxes and navigation buttons; the template declares no rounded card or pill.

### Border Weights

- `1px`: frame, center guide, global outline, stems, veins, orbit rings, human outline, cover rule, card and table rules, routes, command border, caution rules, support rules, closing rule, and navigation controls.
- `1.5px`: botanical leaf outlines only.
- `2px`: A6 field left edge only.
- No other border weight is allowed.

### Decorative Element Types

**Botanical leaf** is the fixed outline-and-vein geometry declared in YAML. It is not an image placeholder and cannot be swapped for another plant style.

**Botanical stem** is a 1px left border with `transform-origin:bottom`; only A1 and A10 may use it, with their exact overrides.

**Seed** is a 14px Earth-outlined circle with Seed Background. Exactly two seeds exist, both on A1.

**Root pattern** is the exact 650 x 220 repeating radial pattern. It exists only on A1. It is forbidden on A2-A20.

**Orbit** is the exact A3 concentric mechanism. It is not a generic diagram component.

**Capability card, data field, command bar, caution box, platform cell, support action, route, and closing rule** each belong only to the page selector that defines them below. They are not reusable asset or component slots.

## Approved Slide Types

The template defines twenty approved slide types. A1-A10 are the original catalogue, A11-A16 add concept/comparison/grid variants, and A17-A20 add the missing narration-led layouts found during the 45-page video audit. A downstream deck may select and reuse the type that matches its content, but it must preserve the chosen type's DOM roles, item count, geometry, and content capacity. The one required A6 DOM correction remains in force: `.data-note` must be a direct child of the A6 `.slide` and a sibling of `.data-copy`.

### A1 Cover — `cover`

The copy region is `left:150px; top:190px; width:1120px`. Its title is the shared 900-weight serif at 144px, `line-height:1.1`, `letter-spacing:-0.07em`, with `max-width:1100px`. The subtitle has `margin-top:38px; width:600px` and retains the shared 48px/1.52 Noto Sans SC treatment.

The cover tag has `margin-top:88px; display:flex; gap:16px; align-items:center`, DM Mono 500 at 20px, and Muted Sage. Its rule is `width:92px; border-top:1px solid Lime`.

The fixed botanical region is `right:120px; top:125px; width:520px; height:790px`. Its stem is `left:280px; bottom:95px; height:590px; rotate(18deg)`. The default cover leaf is `190px x 330px`. Leaf A is `left:35px; top:126px; rotate(-26deg)`. Leaf B is `right:24px; top:280px; width:174px; height:290px; rotate(68deg)`. Leaf C is `left:158px; bottom:72px; width:155px; height:260px; rotate(-6deg)`. Seed one is `left:85px; top:80px`; seed two is `right:15px; top:120px`.

A1 contains the only `.root`: `left:0; bottom:0; width:650px; height:220px; opacity:.42`, with the exact repeating radial background in YAML. A1 has exactly one eyebrow, one title, one subtitle, one cover tag and rule, one botanical stem, three leaves, two seeds, one root, one frame, and one page number. No media asset may replace or accompany the botanical geometry.

### A2 Question — `question`

The question region is `left:155px; top:176px; width:1320px`. The heading has `margin-top:34px`, Noto Serif SC 900 at `90px/1.23`, and `letter-spacing:-0.06em` (source literal `-.06em`). Its opening quote is Lime at 138px with `vertical-align:-0.28em; margin-right:8px`.

The lower region is `display:grid; grid-template-columns:1fr 1fr; gap:80px; margin-top:84px`. Exactly two paragraph blocks are allowed. Each has `border-top:1px solid Frame Line; padding-top:20px`, Noto Serif SC 600 at `38px/1.45`, and Question Ink. Each contains exactly one `small` block with `display:block; margin-top:20px`, Noto Sans SC 500 at `36px/1.5`, and Secondary Ink. The `small` tag is semantic structure only and never authorizes footnote sizing. A2 permits no root, botanical art, orbit, card, or asset.

### A3 Core Idea — `core-idea`

The main region is `inset:140px 145px`. The title keeps the shared 102px/1.1 display treatment and is `width:820px`. The subtitle is `margin-top:35px; width:670px` with the shared 48px/1.52 treatment.

The orbit is `position:absolute; right:80px; top:80px; width:620px; height:620px; border:1px solid Frame Line; border-radius:50%`. The middle ring is `inset:94px`; the inner ring is `inset:185px`; both use `border:1px solid Orbit Line; border-radius:50%`.

The human marker is `position:absolute; right:295px; top:256px; width:148px; height:148px; border-radius:50%; border:1px solid Lime`, plus the required `box-shadow:0 0 0 22px Human Halo`. Its head is the fixed solid-circle glyph U+25CF, positioned `left:47px; top:26px`, sized 42px, and Lime. Its torso is `left:35px; bottom:25px; width:74px; height:36px; border-radius:70px 70px 0 0; background:Lime`.

The orbit label is `right:-12px; top:298px; width:170px`, DM Mono 500 at `19px/1.5`, and Muted Sage. A3 contains exactly one outer orbit, two pseudo-element rings, one human marker, and one label. No cards, roots, media, or substitute diagram are allowed.

### A4 Three Capabilities — `capability-grid`

The heading region is `left:150px; top:120px`. Its title is 92px with `margin-top:24px`, inheriting 900 weight, 1.1 leading, and `-0.07em` tracking.

The grid is `left:150px; right:150px; bottom:145px; display:grid; grid-template-columns:repeat(3,1fr); gap:32px`. It contains exactly three cards. Every card has `min-height:370px; padding:38px 34px; border:1px solid Frame Line; position:relative; background:Capability Background`. Card two has `margin-top:70px`; card three has `margin-top:15px`; card one has no top margin.

Each number is DM Mono 500 at 21px and Lime. Each heading is Noto Serif SC 800 at `45px/1.25` with `margin-top:58px`. Each body is Noto Sans SC 500 at `36px/1.48`, Secondary Ink, with `margin-top:18px`.

Each card owns one corner ornament at `right:24px; top:25px; width:42px; height:42px; border:1px solid Earth; border-radius:50% 50% 0 50%; rotate(25deg)`. No fourth card, aligned-card variant, root, asset, icon, or alternative ornament is allowed.

### A5 Parallel Objects — `platform-list`

The copy region is `left:150px; top:155px; width:670px`. Its title is 108px with `margin-top:26px`, inheriting 900 weight, 1.1 leading, and `-0.07em` tracking. Its subtitle uses the shared 48px/1.52 treatment without a page-specific margin.

The object grid is `right:160px; top:190px; width:720px; display:grid; grid-template-columns:repeat(2,1fr); gap:0`. It contains exactly five cells. Each cell is `height:185px; border-left:1px solid Frame Line; border-top:1px solid Frame Line; padding:27px 34px; display:flex; justify-content:space-between; align-items:flex-end`, with Noto Serif SC 700 at 41px. Only the fifth cell receives `border-bottom:1px solid Frame Line`. The code is DM Mono 400 at 20px and Lime.

A5 permits exactly five text-and-code cells in the existing two-column placement. It permits no sixth filler cell, logos, icons, descriptions, root, or media asset.

### A6 Data Fields — `data-fields`

The copy region is `left:145px; top:135px; width:720px`. Its title is 98px with `margin-top:25px`, inheriting 900 weight, 1.1 leading, and `-0.07em` tracking.

The field grid is `right:145px; top:150px; width:740px; display:grid; grid-template-columns:repeat(2,1fr); gap:18px`. It contains exactly six fields. Each field is `height:150px; padding:26px 28px; background:Field Background; border-left:2px solid Lime`, with Noto Serif SC 700 at 32px. Each field contains one `small` label with `display:block; margin-top:15px`, DM Mono 400 at 18px, `letter-spacing:0.08em`, and Muted Sage.

The note is `left:148px; bottom:142px; width:650px; padding-left:28px; border-left:1px solid Earth`, Noto Sans SC 500 at `40px/1.5`, and Secondary Ink. A6 is a six-field inventory only. It permits no chart, metric bars, root, or asset.

#### A6 DOM Contract and Geometry Check

`.data-copy` is a direct child of the A6 `.slide`, with `position:absolute; left:145px; top:135px; width:720px`, and contains the `.eyebrow` and `.title` only. `.data-note` is not a child of `.data-copy`; it is a direct child of the same A6 `.slide` and a sibling of `.data-copy`.

`.data-note` is positioned against the A6 `.slide` containing block, not against `.data-copy`, with its exact declaration: `position:absolute; left:148px; bottom:142px; padding-left:28px; border-left:1px solid var(--earth); font:500 40px/1.5 var(--sans); color:#d4d6c2; width:650px`. Its bounding box must not intersect either `.data-copy` or `.data-copy .title`.

Generation must automatically check the rendered A6 bounding boxes after fonts load and fail the output if `.data-note` intersects `.data-copy` or its title, or if any A6 content overflows the `.slide` bounds.

### A7 Three-Step Process — `process`

The process region is `inset:130px 150px`. Its title is 94px with `margin-top:24px`, inheriting 900 weight, 1.1 leading, and `-0.07em` tracking.

The steps row is `left:0; right:0; bottom:110px; display:flex; align-items:center`. It contains exactly three step blocks and exactly two routes in alternating order. Each step is `width:390px`. Its number is `display:block`, DM Mono 500 at 22px, Lime, with `margin-bottom:22px`. Its heading is Noto Serif SC 800 at 40px with `margin-bottom:16px`. Its paragraph is `width:350px`, Noto Sans SC 500 at `36px/1.46`, and Secondary Ink.

Each route is `height:1px; width:145px; background:Frame Line; position:relative; margin:0 20px 80px 0`. Its arrow is positioned `right:-9px; top:-17px`, sized 25px, and Lime.

The command bar is `left:0; bottom:0; width:100%; padding:26px 30px; border:1px solid Frame Line`, DM Mono 400 at 23px, Command Ink, with Command Background. Exactly one command bar is allowed. No fourth step, branching route, root, or asset is allowed.

### A8 Caution — `caution`

The caution region is `left:150px; right:150px; top:145px`. Its title is 96px with `margin-top:25px`, inheriting 900 weight, 1.1 leading, and `-0.07em` tracking.

The lower grid is `margin-top:62px; display:grid; grid-template-columns:1.1fr .9fr; gap:88px`. The list is exactly `list-style:none; padding:0; margin:0` and contains exactly three items. Each item is `position:relative; padding:18px 0 18px 47px; border-top:1px solid Frame Line`, Noto Serif SC 600 at `34px/1.42`. Its fixed four-point star glyph U+2726 is Earth and positioned at `left:0`.

The ethics box is `align-self:start; padding:42px; border:1px solid Caution Border`, Noto Serif SC 700 at `42px/1.35`, and Caution Ink (#EBDDCB). It contains one `small` block with `display:block; margin-top:30px`, Noto Sans SC 500 at `36px/1.5`, and Secondary Ink. A8 permits no additional warning card, root, icon, or asset.

### A9 Support — `support`

The support region is `inset:130px 150px 140px` and spans the frame as a two-column grid: `minmax(0,.94fr) minmax(620px,1.06fr)` with an `88px` gap. The left `.support-copy` vertically centers one eyebrow and a 96px title.

The right `.support-grid` forms one continuous three-row semantic stack with `grid-template-rows:1.15fr 1fr 1fr` and an 18px gap. Row one is `.support-intro`: a Lime-topped panel carrying the primary 42px/1.5 explanation. Rows two and three are the two action cards. Every row has a 1px Frame Line border, a 3px Lime or Earth left accent, approved green background, and `padding:32px 42px`. Action headings are Noto Serif SC 800 at `42px/1.25`; descriptions are Noto Sans SC 500 at `36px/1.45`. This full-height semantic stack is mandatory; A9 must not place a few short lines inside oversized empty cards or collapse the actions below the title.

A9 permits no third action, button, card, contact element, QR code, root, or asset.

### A10 Closing — `closing`

The copy region is `left:150px; top:175px; width:1200px`. Its title is 128px with `max-width:1080px; margin-top:30px`, inheriting 900 weight, 1.1 leading, and `-0.07em` tracking. Its subtitle is `margin-top:54px; width:700px` with the shared 48px/1.52 treatment.

The closing rule is `width:570px; margin-top:70px; border-top:1px solid Lime`. The credit is `margin-top:22px`, DM Mono 500 at 20px, Muted Sage, with `letter-spacing:0.09em`.

The fixed botanical region is `right:150px; bottom:30px; width:510px; height:470px`. Its stem is `left:280px; bottom:0; height:470px; rotate(-27deg)`. Its two leaves are each `150px x 255px`. Leaf A is `left:44px; top:65px; rotate(-18deg)`. Leaf B is `right:34px; top:150px; rotate(74deg)`.

A10 contains exactly one eyebrow, one title, one subtitle, one rule, one credit, one stem, two leaves, one frame, and one page number. It contains no root, seed, asset, CTA button, or alternate closing mark.

### A11 Single Core Card — `.single-card`

Use A11 when one core concept needs more visual weight than a plain headline but does not contain parallel items. The `.single-card` region is `inset:135px 150px 145px` and uses a vertical flex stack. Its `.single-card-shell` begins after a `58px` gap, is at least `580px` high, and uses a two-column grid of `minmax(0,1.55fr) minmax(360px,.45fr)` with a 1px Frame Line border and Capability Background.

The copy column uses `min-height:0; padding:70px 72px` and vertically centers one title, one subtitle, and one mono note. Its title and subtitle explicitly reset browser default margins: the title uses `margin:0`, and the subtitle uses `margin:34px 0 0`. The title is Noto Serif SC 900 at `92px/1.1`, with a maximum of two lines. The subtitle is the shared 48px/1.52 style and may use at most three short lines. The mono note starts `36px` later with a 1px Lime rule. The right botanical column is decorative only, has a left Frame Line border, and contains exactly one stem and two leaves. Do not add a list, comparison, image, or second concept.

### A12 Dual Compare Cards — `.dual-compare`

Use A12 for two peer concepts such as picture versus sound or stable versus unstable. The `.dual-compare` region is `inset:125px 150px 145px`. Its title is 78px and limited to one line. `.dual-compare-grid` starts `52px` below the title and contains exactly two equal `.compare-card` elements with a `28px` gap.

Each card has a 1px Frame Line border, `padding:48px 52px`, and a minimum height of `530px`. The left card uses a 3px Earth top border; the right card uses a 3px Lime top border. Each card contains one 20px DM Mono label, one 58px/1.2 serif heading of at most two lines, one 36px/1.5 sans paragraph of at most four short lines, and one decorative A/B index. Do not convert this type into unframed text columns or add a third option.

### A13 Stacked Compare — `.stacked-compare`

Use A13 for an asymmetrical correction or progression written as “not X, but Y.” The `.stacked-compare` region is `inset:120px 150px 140px`; its title is 76px and limited to one line. `.stacked-compare-panels` begins after `42px`, fills the remaining height, and contains exactly two equal rows separated by `18px`.

Each `.stacked-panel` is a two-column grid of `190px minmax(0,1fr)`, vertically centered with `padding:34px 52px`. The first row uses Earth for the 21px mono relation label. The `.is-answer` row uses a Lime-tinted border and green fill, and its relation label is Lime. Headings are 54px/1.2 with a maximum of one line; support paragraphs are 36px/1.48 with at most three short lines. The upper row states the rejected approach and the lower row states the preferred approach; do not reverse that hierarchy.

### A14 Quote Card — `.quote-card`

Use A14 for one summary sentence or central question that should dominate the frame. The `.quote-card` region is `inset:125px 150px 145px`. Its `.quote-card-shell` begins after `54px`, is at least `620px` high, and has a Lime-tinted border, a dark green diagonal surface, and `padding:92px 110px 72px 190px`.

The decorative opening quote is Noto Serif SC 700 at 210px and remains behind the copy at `left:62px; top:24px`. The `blockquote` is Noto Serif SC 800 at `82px/1.28`, has `-0.055em` tracking, and accepts no more than two lines. One optional 40px/1.5 caption follows after `42px` and a Frame Line rule. The lower-right leaf is decorative only. Do not add attribution portraits, logos, or more than one quotation.

### A15 Four Card Grid — `.quad-card-grid`

Use A15 for exactly four peer items. The `.quad-card-grid` region is `inset:115px 150px 140px`; its title is 72px and limited to one line. `.quad-grid` begins after `42px`, fills the remaining region, and uses two equal columns by two equal rows with `22px` gaps.

Each `.quad-card` has a 1px Frame Line border, Capability Background, `padding:28px 40px`, and a minimum height of `250px`. It contains one 18px Lime mono number, one 40px/1.25 serif heading of at most one line, one 36px/1.45 sans description of at most two lines, and one fixed Earth corner ornament. Four items are mandatory; three items use A17, A18, or A19 according to meaning, while five or more require another approved type or a split page.

### A16 Six Card Grid — `.six-card-grid`

Use A16 for exactly six compact peer items such as reusable asset types or visual formats. The `.six-card-grid` region is `inset:105px 150px 135px`; its title is 66px and limited to one line. `.six-grid` starts after `36px`, fills the remaining region, and uses three equal columns by two equal rows with `18px` gaps.

Each `.six-card` has a 1px Frame Line border, `padding:24px 28px`, and a minimum height of `240px`. Alternating cards receive a slightly lighter approved green fill. Every card contains one 17px Lime mono number, one 34px/1.25 serif heading of at most one line, one 34px/1.42 sans description of at most two short lines, and one fixed Earth lower rule. Do not enlarge one card, add a seventh item, or use this compact type for paragraph-heavy content.

### A17 Left Title + Vertical List — `.split-vertical-list`

Use A17 for exactly three parallel points that need full descriptions, such as rhythm decisions or sound layers. The left column contains the eyebrow, an 88px serif title, and a 48px sans explanation. The right column is three equal bordered rows. Each `.vertical-list-card` uses a 20px mono number, a 42px serif heading, and a 36px sans description. Prefer this type over a wide bottom row whenever horizontal placement would leave the center of the frame empty.

### A18 Top Title + Hierarchy Stack — `.hierarchy-stack`

Use A18 for exactly three ordered levels, layers, or degrees of meaning. The title and 48px explanation remain at the top; three equal `.hierarchy-row` elements fill the lower region. Each row uses a 20px mono level, a 44px serif name, and a 36px sans explanation. Do not compress the three layers into small labels at the bottom of the frame.

### A19 Tool List — `.tool-list`

Use A19 when narration explicitly names exactly three tools, software products, platforms, or services. The left column establishes the category; the right column shows one bordered card per named tool. Each card uses a 46px serif tool name, a 36px sans explanation, and an optional 18px mono badge. Product names must remain verbatim and in narration order.

### A20 Large Explainer — `.large-explainer`

Use A20 for one large chapter statement plus an important explanation that is too meaningful to become a footnote. The left column uses a 98px serif title. The right panel uses a 46px serif lead and a 42px sans paragraph, with only the final English metadata line allowed at 19px. The explanation is a primary visual block and must never be reduced to decorative small copy.

## Content-to-Layout Selection

Select only from A1-A20; do not synthesize a twenty-first layout. Use A11 for one framed concept, A12 for equal A/B comparison, A13 for “not X, but Y,” A14 for one memorable sentence, A15 for exactly four peer items, A16 for exactly six compact peer items, A17 for three parallel descriptive items, A18 for three ordered layers, A19 for three explicitly named tools, and A20 for a large statement plus substantial explanation. A1-A10 retain their original roles. Replacement copy must preserve the chosen type's headings, paragraphs, labels, item count, and decorative elements. If content exceeds the documented capacity, split it across pages instead of shrinking type or mutating geometry.

### Semantic Completeness Gate

- Before choosing a page type, extract every narration-bearing proper noun, software name, number, named step, and enumerated item from the matching subtitle segment.
- The selected page must visibly include those details in the same scene and in narration order. Layout selection may reorganize them, but it may not generalize, delete, rename, or move them to a later page.
- Three named items must not collapse into a generic headline. Use A17 for parallel points, A18 for ordered layers, or A19 for tools and products.
- A11 should not repeat across a sequence when the narration actually contains comparison, hierarchy, tools, or multiple items; semantic fit takes priority over easy reuse.

No chart, photograph, screenshot, logo, video, icon library element, QR code, or placeholder may be introduced. `template.html` defines zero asset slots.

### Authorized Downstream Extension Safety

This section does not authorize mutation beyond A1-A20. It applies only when a user explicitly authorizes a downstream job to create a candidate page that borrows the Field Notes A visual language.

- A heading, supporting paragraph, caption, or label that can wrap is a flow-dependent element. A component below it must not use a stage-level fixed `top` calculated before the final copy is rendered.
- Prefer normal document flow, grid, or flex layout so the lower component starts after the rendered height of the copy above it, plus the variant's approved minimum gap.
- If absolute positioning is required, render the filled page in a real browser, read the upstream element's actual `getBoundingClientRect().bottom`, and calculate the lower component's `top` as that bottom edge plus the approved gap. Write the resulting 1920 x 1080 pixel coordinate into the final HTML, then render again.
- Validate every authorized candidate page with its final copy in a real browser. Check the measured rectangles for text overflow, overlap, and canvas escape; inspecting the HTML structure alone is not acceptance.
- If the measured stack does not fit the canvas at the approved type sizes and gaps, split the content or reject the candidate page. Never shrink type or compress spacing to preserve a preselected coordinate.

## Motion and Navigation

The slide switch is direct. Active state changes visibility and opacity without a slide-level camera or spatial transition. Every `.reveal` starts at `opacity:0; transform:translateY(26px)` and reaches `opacity:1; transform:translateY(0)` with two `.75s` transitions using `cubic-bezier(.16,1,.3,1)`.

The structural delay classes remain assigned across A1-A20. Do not add animation types, auto-advance, or media playback inside this visual template; downstream timing may resolve their actual cue values.

Under `prefers-reduced-motion:reduce`, every element and pseudo-element uses `animation-duration:.01ms!important` and `transition-duration:.2s!important`. This override is mandatory.

## Do's and Don'ts

### Do

- Follow `DESIGN_SYSTEM.md` for cross-template quality rules, this file for Field Notes A's template contract, and `template.html` plus its recorded SHA as the sole precise implementation source.
- Preserve the exact global surface, frame, page chrome, A1-A20 structures, and reveal assignments.
- Replace only text inside existing text roles, and only when it fits unchanged geometry.
- Keep the A1 root, A3 halo, and all page-owned decorative geometry in their exact scopes.
- Choose one coordinated semantic palette for the whole article at `:root` or `.deck-stage`; use inline semantic classes only for genuine keyword meaning.
- Verify fonts, overflow, overlap, and all selector values before export.

### Don't

- Do not reinterpret this as Dark Botanical, Mat, or a newly designed botanical approximation.
- Do not add, remove, clone, or move elements; do not change page order or element counts.
- Do not invent a general asset slot or treat any right-side region as replaceable media.
- Do not reuse the A1 root or A3 halo on another page.
- Do not add shadows; the exact A3 non-blurred halo is the sole exception.
- Do not change fonts, coordinates, sizes, weights, leading, tracking, padding, margins, gaps, borders, radii, decorative geometry, or motion.
- Do not override palette variables per page or per element, write ad hoc color values into page selectors, change colors for decoration alone, or force every headline into two colors. Only the registered deck-level palette and four color-only semantic classes are approved.

## Responsive Behavior

There are no responsive layout breakpoints. `html` and `body` fill the viewport, have zero margin, and hide overflow. `.deck-viewport` is fixed at `inset:0`. `.deck-stage` remains 1920 x 1080 and is centered by the single scale-and-translate transform on load and on every resize. The same authored composition is used on desktop, tablet, and phone; only the whole-stage scale changes.

Media-like elements have `max-width:100%; max-height:100%` in the baseline reset, but this does not define or authorize a media slot.

### Presenter Behavior

- Arrow Right, Arrow Down, Space, and Page Down advance one page.
- Arrow Left, Arrow Up, and Page Up move back one page.
- Navigation clamps at the first and last page; it never wraps.
- A vertical touch swipe greater than 45px advances when upward and reverses when downward.
- The mouse wheel uses `deltaY` direction and a 650ms lock.
- The previous and next buttons move one page in their respective directions.
- On every navigation, all slides lose `.visible`; the selected slide regains it on the next animation frame so its fixed reveal sequence restarts.
- The counter uses zero-padded current and total values. Progress width is `(current / total) * 100%`.
- Home, End, horizontal swipe, autoplay, and loop behavior are not defined and must not be added.

### Print Behavior

At print time, `html` and `body` become `width:1920px; height:auto; overflow:visible; background:#fff`. The viewport becomes static with visible overflow and a white background. The stage becomes static, uses automatic width and height, removes its transform with `!important`, and has no background.

Every slide becomes `position:relative; display:block!important; visibility:visible!important; opacity:1!important; pointer-events:auto!important; width:1920px; height:1080px`, with both `break-after:page` and `page-break-after:always`. The last slide removes both page breaks. Navigation controls are hidden with `display:none!important`.

## CJK and International Content

Field Notes A is Chinese-first, but it is not a separate CJK layout mode. Chinese copy must use one of the fixed A1-A20 structures, authored coordinates, and original tracking. International copy may use the existing Latin characters inside those same roles, but it must fit the selected geometry and must not turn a speaker-led page into a reading-first page.

### Recommended Chinese Pairing

| Existing role | Chinese face | Usage rule |
|---|---|---|
| Display and structured serif copy | Noto Serif SC | Keep the page's existing weight, leading, tracking, and coordinate declaration. |
| Explanatory and supporting copy | Noto Sans SC | Keep the page's existing weight, leading, color, and text box; shorten or rewrite copy when it does not fit. |
| Structural labels, codes, command text, page numbers, and navigation chrome | DM Mono for Latin and numerals; verify Chinese glyph rendering against the existing source stack | Do not add a new CJK mono family or silently substitute a different pairing. Chinese characters in this role are a known compatibility edge and require rendered verification. |

Do not replace these roles with Mat's font stack, a system CJK stack, or another CJK pairing. The pairing is part of Field Notes A's identity and must remain aligned with the exact declarations in `template.html`.

### Mixed-Content Strategy

- Keep one existing font role per text node. Chinese and Latin may share Noto Serif SC in display roles, Noto Sans SC in explanatory roles, and DM Mono in structural Latin/numeric roles; do not introduce language-specific classes or per-language font switching.
- Preserve the authored negative headline tracking and all existing line-height, weight, alignment, and coordinates when Chinese and Latin appear on the same line.
- Use normal Chinese punctuation and authored CJK/Latin spacing only when the unchanged text box still passes fit checks. Do not use punctuation or spacing as a reason to alter CSS geometry.
- If mixed content changes wrapping, first edit or shorten the copy. Do not shrink type, loosen tracking, add a line, or move an existing role.
- Uppercase transformation remains limited to the existing eyebrow treatment; Chinese text must not be forced through an uppercase or Latin-only transform.

### Loading

- Keep the exact Google Fonts families and weights listed in Typography. Do not add a font URL, weight, fallback family, or weight-synthesis rule while adapting content.
- Begin layout and screenshot QA only after `document.fonts.ready` has resolved and `document.fonts.check()` succeeds for representative rendered strings from the Noto Serif SC display role, Noto Sans SC explanatory role, and DM Mono structural role, including Chinese, Latin, and numerals where that role uses them.
- A page-load event, a successful font request, or a visually plausible fallback is not sufficient. The rendered element must use the declared family and weight; if that cannot be confirmed, the generation is not font-ready and must not be marked passed.
- Font readiness must be confirmed before comparing line breaks, bounding boxes, overflow, or screenshot output, because fallback metrics can hide a real fit failure.

### Universal CJK Adjustments

Field Notes A intentionally does not apply a generic CJK correction to the source values. This is an intentional exception after Chinese visual validation, not an omission; do not change it without real rendered testing. Preserve the original negative headline tracking, line heights, font weights, families, and coordinates even when another CJK system would normally adjust them.

The only permitted CJK adaptation is content-level editing inside the existing roles: choose concise Chinese wording, remove redundant punctuation, or rewrite a mixed-language phrase so it fits. No automatic line-height, tracking, weight, family, coordinate, or geometry adjustment is allowed. Any proposed exception must be tested in the rendered twenty-page template demo and recorded as a new template decision rather than applied ad hoc.

### Aesthetic Notes

The Chinese-first treatment keeps the deep-green botanical atmosphere, cream serif emphasis, muted-sage explanation, lime line work, earth punctuation, mono chrome, generous negative space, and original negative tracking intact. Noto Serif SC is an intentional display choice for this template, not a generic replacement for an official template's Latin display face. Chinese should feel editorial and calm within the existing speaker-led rhythm; it should not be packed into the page merely because the language can carry more characters.

When Chinese and Latin share a line, visual hierarchy comes from the existing role, weight, color, and whitespace—not from adding a second font system. If the combination looks uneven or loses the intended rhythm, rewrite the copy or reject it for this template; do not correct it by changing the source CSS.

### Known CJK Gap

- The fixed twenty-type catalogue and unchanged text boxes cannot accept every Chinese or international article. Longer copy must be split or edited to the selected type's capacity.
- Original negative headline tracking may look tighter on some Chinese strings than on Latin strings. This is a source constraint, not a license to add a generic CJK tracking rule.
- DM Mono is retained for structural Latin and numeric chrome; Chinese glyph coverage or browser fallback in a mono role may vary and must be checked in the rendered output.
- Google Fonts availability and the browser's actual loaded faces affect line breaks and glyph metrics. A fallback render is not a valid acceptance result.
- There is no extra CJK family, automatic language switch, flexible reflow, or general elevation/spacing system available to absorb a fit problem.

## Iteration Guide

1. Confirm that the mother `template.html` still matches the recorded SHA-256.
2. Duplicate the mother file outside this template directory for content work; never modify the mother.
3. Select A1-A20 by semantic role, then replace text only inside that type's existing text nodes.
4. Keep every existing class, element count, page order, decorative element, geometry, typography, and motion declaration unchanged. A copied article may override the registered canonical palette once at `:root` or `.deck-stage`, and may add one of the four color-only semantic classes to a genuine keyword span; no other visual mutation is authorized.
5. Reject content that requires a new slot, selector, geometry, component, or animation. That request belongs to another template version.
6. Run the required viewport set: the authored stage at `1920x1080`, a scaled desktop viewport at `1280x720`, and a phone viewport at `390x844`. Do not substitute a responsive reflow test for these fixed-stage checks.
7. Wait for font readiness before capture: `document.fonts.ready` must resolve, `document.fonts.check()` must pass for the representative Noto Serif SC, Noto Sans SC, and DM Mono roles, and computed styles must still report the declared families and weights.
8. Capture screenshots of all twenty sample pages, A1-A20, at every required viewport. Inspect the screenshots for text wrapping, clipping, baseline drift, unexpected fallback glyphs, visibility-state errors, and any change to the fixed composition.
9. Check the whole deck at every required viewport for unexpected overflow or overlap: no page may create scrollbars, escape the visible stage, clip authored content, or place text/panels/controls on top of another role. Known decorative clipping at the stage edge is allowed only where the source already defines it.
10. Treat any failed font, screenshot, overflow, or overlap check as a failed generation. Edit or reject the copy; do not fix the failure by changing the template's type, layout, DOM, or state-switching rules.

## Known Gaps

- Field Notes A is a fixed twenty-type catalogue, not a free-form page generator.
- It defines no asset slots and cannot accept photographs, screenshots, charts, logos, videos, QR codes, or icons without becoming a different template.
- The fixed element counts may not fit every article; copy must be edited to the baseline rather than changing the baseline.
- Font loading depends on Google Fonts and must be confirmed before rendering.
- The baseline has only one special depth exception: the A3 non-blurred human halo. No general elevation system exists.
