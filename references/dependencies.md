# Runtime Dependencies

- Node.js 22 or newer.
- `parse5` for deterministic mother-template assembly.
- The local font files referenced by the selected `template.html`.

No audio engine, subtitle generator, video renderer, media CLI, runtime web font, Hyperframes dependency, or external project is used.

Per-task validation checks only resources actually used by that output. The complete A20+B31 mother and font-library integrity test belongs to Skill publication and runs through `npm run validate-skill`.
