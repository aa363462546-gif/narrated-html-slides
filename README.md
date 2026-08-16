# Narrated HTML Slides

A self-contained Codex Skill that turns a complete Chinese script, or matching SRT plus an audio reference, into fixed-stage HTML slides. It ships with Field Notes A and Dark Teal Intelligence.

The runtime chain is intentionally small:

```text
user instruction → deck.json → template.html → slides.html
                 → Build → user visual review
```

The Skill never opens or processes audio and never renders video. `template.html` is the sole machine source for each template's DOM, CSS, fonts, components, and controlled themes.

## Commands

```bash
npm install
node scripts/assemble-slides.mjs /absolute/path/to/job
node scripts/validate-job.mjs /absolute/path/to/job
```

Run the full A20+B31 integrity test only when publishing or changing the Skill:

```bash
npm run validate-skill
```

See `references/job-contract.md` for the current single-deck input format.
