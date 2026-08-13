# Local Dependencies And Publication Status

- Node.js 22 or newer.
- A Chromium-family browser.
- `parse5` for deterministic DOM parsing and serialization.
- `puppeteer-core` for rendered desktop and phone QA.
- Exact approved local font files and their licenses for publication.

Run `node scripts/doctor.mjs --json`. Development may continue when a template is `blocked_by_font`, but outputs from that template cannot be called publishable. Runtime network fonts and silent substitutions are not valid publication dependencies.

No audio engine, subtitle generator, video renderer, media CLI, or external project is used by this Skill.
