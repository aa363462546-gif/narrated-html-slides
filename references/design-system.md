# Shared Design System

## Content

- One slide serves one primary claim.
- Use one primary visual focus: headline, number, real evidence, or subject graphic.
- Keep no more than three information levels.
- Prefer real screenshots, source charts, products, and quoted evidence to invented decoration.
- Condense visible copy without changing facts. Preserve full narration in `aria-label`.
- Use a dedicated title slide only for an opening, section boundary, strong quote, or closing. Do not turn every subtitle block into a title slide.

## Readability

- Author every slide at 1920 x 1080 and scale the complete stage uniformly.
- Main spoken explanation: at least 48px.
- Card, list, step, or hierarchy explanation: at least 36px.
- Only metadata, page numbers, labels, and badges may be smaller.
- Validate at a 390px-wide mobile viewing size.
- Split content or choose another approved layout when text overflows. Never shrink below the minimum.

## Composition

- Use whitespace to establish hierarchy, not to avoid choosing a suitable layout.
- Information slides may not leave an entire half of the stage semantically empty when narration contains two or more supporting items.
- Do not place cards inside cards or use dashboard-style matrices as a default.
- Use one deck-level palette. Semantic accents may distinguish titles or contrasts, but never color every element randomly.

## Template States

- First establish a correct static slide.
- Preserve the template's structural state classes and DOM order when copying a layout.
- Keep important content readable in the fully visible static state.
- Do not add a renderer-specific timeline, audio behavior, or focus choreography to a job's `slides.html`.
