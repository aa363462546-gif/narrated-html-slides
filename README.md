# Narrated HTML Slides

A Codex Skill for turning complete articles or narration into fixed-stage HTML slides. It ships with two production templates:

- Field Notes A: deep-green botanical editorial style.
- Dark Teal Intelligence: charcoal and teal evidence-led report style.

The Skill is self-contained for HTML generation and does not require `frontend-slides`. Audio generation, subtitles, and video rendering are intentionally outside this repository and can be used independently afterward.

## Install

Clone this repository, then install it as a Codex Skill by copying or linking the repository directory into your Codex Skills directory. Restart Codex after installation.

For HTML QA:

```bash
npm install
node scripts/doctor.mjs
```

Invoke it with `$narrated-html-slides` and provide a complete article or narration script.

## What It Produces

Each job keeps its source and generated `slides.html` together. See `references/job-contract.md`.

## License

Code and documentation are licensed under MIT. Bundled fonts retain their own licenses under `assets/fonts/`.
