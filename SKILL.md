---
name: narrated-html-slides
description: Turn a complete Chinese script or matching SRT plus audio into speaker-led slides.html using the Field Notes A or Dark Teal Intelligence visual systems. The skill creates HTML and QA files only; it never processes audio or renders video.
---

# Narrated HTML Slides

## Product

This creates the visual track that accompanies narration. SRT is the complete spoken text plus timing; the HTML is what the viewer sees while that text is spoken. Do not make an article-summary deck or a fixed sequence of template cards.

When the user provides a complete script or SRT and asks for generation, treat it as a new task: understand that input from the beginning and run the current Skill workflow from the beginning. For a new task, read only the user-provided input for this task, this current `SKILL.md` and `references/job-contract.md`, the selected template files, and the current assembly and validation scripts they import. Do not list, search, inspect, diff, open, or copy `jobs/`, `outputs/`, or any other historical task directory. Do not use a historical task as a content source, pagination hint, page-count hint, template, run reference, or shortcut, even when its input appears identical. Only when the user explicitly asks to inspect or continue a named historical task may you read that named task; that permission does not extend to other historical tasks or to an unrelated new generation.

## One-way workflow

1. Start at cue 1 or the first sentence and read the script or SRT in source order. Rejoin only the current subtitle fragments into the spoken sentence and follow the speaker's actual progression; do not read ahead to summarize the complete source first.
2. Process one short, continuous spoken section at a time and immediately write its page before reading the next section. Never read the whole source and then create a topic list, chapter outline, shot list, or page-count estimate.
3. End the current page at the first cue whose spoken content the current page cannot visibly explain. A new object, software, example, action, relationship, result, question, or turn ends the current page; sharing one broad topic does not keep it open.
4. The page must visibly explain the section just processed, rather than name a broad topic. Put its subject in the largest and clearest treatment and use the remaining space for context, reason, example, step, relationship, or evidence from that same section. A software name must be the visible subject when introduced, not a small tag. A quoted line, question, personal experience, analogy, setback, or short transition may be its own page.
5. The page count is unknown until this cue-by-cue pass finishes. Do not compress different spoken sections into a chapter card or shrink text to make a summary fit. Do not announce or outline the final page count before pages have been written in source order.
6. Choose A or B as the visual system. A user-specified template is locked. After the source-order page sequence has been written, read the selected template's actual sections and choose the existing mother layout for each page. The template supplies the DOM, CSS, typography, colors, spacing, and components.
7. Write the single `deck.json` in source order as each page is completed. Each page must copy the chosen mother layout's HTML structure and replace its audience-facing text with the spoken section just processed. Do not write a new layout, inline positioning system, new class, or new CSS variable. If no existing mother can carry the section, choose the closest honest mother and split it; report the missing capacity instead of redesigning the template. `must_show` records names and parallel items already identified from the source; it is a reminder for the author, not a substitute for showing them and not a reason to repeat them.
8. Before assembly, check every page against its own cues. `cue_range`, hidden narration, `aria-label`, and a keyword placed in a corner do not count as visible explanation. If a page does not visibly explain its cues, split that page before continuing.
9. Assemble and run Build only after all source-order pages are written. Build checks the deck, selected template, source mapping, safe markup, assets, fonts, and final HTML consistency. It does not judge whether the narration was understood or whether the page is attractive; those remain a visual review with the user.

There is no fixed page count, fixed duration, minimum duration, maximum duration, Director file, layout plan, coverage plan, or second content contract. A meaningful beat may last briefly; a page may remain longer only while it remains an accurate explanation of the spoken content.

## Content and composition

- The page is a visual explanation, not a subtitle wall. Use the selected system's typography, spacing, diagrams, relationships, lists, screenshots, quotes, and transitions when they help the viewer understand.
- Questions, setup, personal experience, analogy, attempt, setback, pivot, explanation, steps, evidence, and conclusion are all valid visual sections. Do not flatten them into one knowledge-summary page.
- A page range is not complete merely because its headline names the overall topic. The supporting visual must also carry the meaningful setup, qualification, example, action, or change spoken inside that range.
- A/B selects the visual identity and its available mother layouts. Let the narration decide the page order and which existing layout is appropriate; do not invent a third layout in page HTML.
- If the current visual system cannot express a needed section, preserve the section with the nearest honest composition and report the missing visual expression. Do not silently delete it or force it into an unrelated card.
- Keep page HTML audience-facing. Do not expose planning labels or describe the source as an outside report.
- Use `must_show.terms` for important names, tools, projects, people, platforms, and numbers. Use `must_show.groups` for complete parallel items. These are coverage reminders, not permission to repeat text.
- Use plain, local assets only when the deck permissions allow them. Do not process or inspect audio.

## Contract and checks

Use [references/job-contract.md](references/job-contract.md). The single assembler produces `slides.html`. Build checks the deck, selected template, source mapping, safe page HTML, visible requirements, assets, fonts, and navigation. Build does not prove semantic understanding, visual timing, or visual quality. The user must watch the visual track against the narration before accepting it.
