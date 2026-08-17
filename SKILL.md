---
name: narrated-html-slides
description: Turn a complete Chinese script or SRT into narration-aligned slides.html by understanding the spoken progression first, then filling existing Field Notes A or Dark Teal Intelligence HTML page designs. Use whenever the user asks for A/B narrated HTML slides, visual storyboards for voiceover, or slides synchronized to a script or SRT. Creates HTML only; never processes audio or renders video.
---

# Narrated HTML Slides

## 目的

生成跟随口播推进的视觉画面，不是文章摘要、章节PPT或字幕墙。

本Skill只有三层职责：

- 本文件：规定执行顺序、边界和交付物。
- [references/content-planning.md](references/content-planning.md)：规定如何理解口播和形成连续画面。
- `assets/templates/<template>/`：说明视觉定位并提供可以直接复制的HTML页面。

## 输入与输出

- 输入是完整中文文案或SRT。音频路径只作为用户提供的参考，不读取、不处理。
- 完整文案和SRT使用同一套内容理解方法。
- SRT时间戳只在页面确定后写入最终HTML，不能按秒数决定拆页。
- 新任务最终只在本次新建的任务目录中生成一个 `slides.html`；不把项目根目录的 `slides.html` 作为新任务输出。
- 不生成 `deck.json`、导演文件、规划文件、合同文件或QA报告。
- 不调用组装器、Build、Geometry、校验器、Hyperframes或视频工具。

## 单向执行顺序

### 1. 确认任务模式并隔离目录

先判断本次属于哪一种任务：

- **新任务**：用户提供新的文案或SRT并要求生成。必须从零生成。
- **继续旧任务**：只有用户明确指定检查、修改或继续某个历史成品时才成立。

新任务开始时，先在当前项目的 `outputs/` 下创建一个全新的任务目录。目录名根据本次输入文件名或内容主题加当前时间生成，必须唯一且原本不存在；若候选目录已经存在，换一个新名字。所有本次产物只写入这个目录，最终文件路径为该目录中的 `slides.html`。

新任务只读取本次用户提供的文案或SRT、当前 `SKILL.md` 和 [content-planning.md](references/content-planning.md)。此时不要读取任何模板的 `design.md` 或 `template.html`。即使项目规则要求核对Git状态或已有文件，也只确认其存在，不打开或使用项目根目录旧HTML、其他 `outputs/` 子目录、旧规划或旧页数作为本次内容或结构来源。

继续旧任务时，只读取用户明确指定的那个旧任务目录，不扫描、比较或复用其他历史输出。

### 2. 锁定模板选择

开始时明确告诉用户本次使用哪个模板。

- 用户指定A：锁定 `field-notes-a`，不得改选。
- 用户指定B：锁定 `dark-teal-intelligence`，不得改选。
- 用户未指定时，只根据以下定位选择，不提前读取两个完整模板：
  - Field Notes A：叙述、经验、提问、类比、转折、教程和有人情味的解释。
  - Dark Teal Intelligence：证据、数据、比较、关系、策略和结构化分析。

这里只锁定A或B的视觉身份，不读取完整母版。

### 3. 通读全文，只理解上下文

先完整阅读文案或SRT一次，只为理解前后因果、引用对象、后文回扣和整体语气。不要在这一步总结章节、列出页面计划、估算页数或宣布分镜已经完成。

不得先把全文概括成若干大主题，再把口播压进这些主题。大主题只能帮助理解全文，不能决定页面边界或页数。

通读完成后，读取已锁定模板的 `design.md` 和 `template.html`，只理解它的视觉系统和可复用结构。模板示例数量、示例顺序和示例内容都不能成为成品页数或分镜依据。

### 4. 回到第一句，沿口播形成页面序列并一次性写入HTML

1. 回到第一句，沿原文顺序逐段处理。处理当前口播时，先判断作者此刻在做什么、视觉主体是什么、观众此刻需要看到什么。当前说话作用、视觉主体、动作或关系、观众需要看到的内容都没有变化时，才可以保持同一页；其中任何一项变化，就结束当前页并进入下一页。
2. 先在内存中按源顺序形成细粒度的页面定义和连续画面序列；全部口播处理完后，再一次性把完整页面序列写入最终 `slides.html`。不得预先决定最终页数，不得按大主题合并，也不得把页面定义写成中间文件；处理到原文结尾后，页面序列中的页面数量就是最终页数。
3. 软件、案例、步骤、关系、转折、问题、答案、尝试、受挫、结果、个人经历、类比、金句、承诺和短过渡都可以形成独立画面。共享同一个大主题不能成为合并理由，不能只保留知识结论和章节标题。
4. 把选定的 `template.html` 作为 `slides.html` 的完整视觉基础，保留它的 `<head>`、CSS、字体、舞台、导航和交互代码，并从最终 HTML 源码中物理删除全部演示内容页。不能保留旧示例后再用 CSS、JavaScript、`display:none`、运行时过滤或隐藏类把它们藏起来；最终文件中只能出现本次口播生成的页面。当前画面与现成结构天然匹配时，复制完整 `<section class="slide">` 并替换内容；同一结构可以重复使用。
5. 没有合适的现成结构时，只按已选模板的完整视觉系统补充当前页面需要的局部布局：继续使用原有字体、颜色变量、字号层级、间距、外框、表面、装饰、组件语法、舞台、导航和动画。不得为省事重写全局视觉，也不得另建一套只靠 `grid`、`card`、`flow`、`panel` 反复组合的通用页面系统。模板缺少版式不能成为合并、缩减、遗漏或打乱口播内容的理由。
6. 每个区域承担不同信息：主标题表达当前重点，其他区域补充原因、例子、关系、步骤或证据。选择与内容量匹配的结构，充分使用主要内容区；内容少就用简单结构并放大主体，内容超过自然容量就进入下一页，不缩字、不挤压结构，也不用无意义小字填空。
7. 在带有 `data-slot-kind="semantic-text"` 的标题或重点文字中，可以用模板现有的 `semantic-text-primary`、`semantic-accent-primary` 和 `semantic-accent-secondary` 包裹有意义的词组。每页最多使用这三种受控文字颜色；颜色用于区分关键词、转折、对比和结论，不强制双色，也不整篇单色或使用彩虹色。

HTML标签属于模板结构，不属于可见文案。不要把 `<br>`、`<span>`或其他HTML字符串作为文字显示；需要换行或强调时，编辑模板中的真实HTML结构。

### 5. 写入时间并交付

页面完成后再映射SRT：

- 每页写入它实际解释的连续字幕范围。
- `data-start`使用该页第一条字幕的开始时间，`data-end`使用最后一条字幕的结束时间。
- 可同时写入`data-cue-start`和`data-cue-end`。
- 连续字幕覆盖不代表画面已经解释正确，仍需结合口播观看。
- 只有完整文案时保持页面顺序，不编造时间。

交付时只报告模板、页数和本次任务目录中的 `slides.html` 路径，并说明语义同步和视觉效果仍需用户结合口播确认。
