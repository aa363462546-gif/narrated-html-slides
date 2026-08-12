# HTML Dependencies

Run `node scripts/doctor.mjs --json` before generating or checking HTML.

## Required For HTML

- Node.js 22 or newer.
- A Chromium-family browser for rendered QA.
- Network access when a template loads remote fonts. For offline use, the bundled font assets and template-local `@font-face` declarations should be preferred.

No audio engine, subtitle parser, video renderer, or external media CLI is required by this Skill. Those tools may be installed and used by a separate downstream workflow.
